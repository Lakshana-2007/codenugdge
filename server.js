  // ================================================================
// CodeNudge — Node.js HTTP Server (no Express)
// Pure built-in modules: http, fs, path, url
// ================================================================

const http = require('http');
const fs   = require('fs');
const path = require('path');
const url  = require('url');

const PORT       = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR   = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const REM_FILE   = path.join(DATA_DIR, 'reminders.json');

// ── MIME type map for static file serving ──────────────────────
const MIME = {
  '.html': 'text/html',
  '.css' : 'text/css',
  '.js'  : 'application/javascript',
  '.json': 'application/json',
  '.mp3' : 'audio/mpeg',
  '.png' : 'image/png',
  '.jpg' : 'image/jpeg',
  '.svg' : 'image/svg+xml',
  '.ico' : 'image/x-icon',
  '.txt' : 'text/plain',
};

// ── Helpers ────────────────────────────────────────────────────

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return [];
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function generateId(prefix) {
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
}

// Send JSON response
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

// Read request body as JSON
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

// Serve a static file
function serveStatic(res, filePath) {
  const ext  = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';

  if (!fs.existsSync(filePath)) {
    // Fall back to index.html for unknown routes (SPA-style)
    const indexPath = path.join(PUBLIC_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(indexPath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
    return;
  }

  res.writeHead(200, { 'Content-Type': mime });
  fs.createReadStream(filePath).pipe(res);
}

// ── Route Handlers ─────────────────────────────────────────────

// POST /api/register
async function handleRegister(req, res) {
  const body = await readBody(req);
  const { name, username, email, password, avatar, bio } = body;

  if (!name || !username || !email || !password) {
    return sendJSON(res, 400, { success: false, message: 'All fields are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return sendJSON(res, 400, { success: false, message: 'Invalid email address.' });
  }
  if (password.length < 6) {
    return sendJSON(res, 400, { success: false, message: 'Password must be at least 6 characters.' });
  }

  const users = readJSON(USERS_FILE);

  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return sendJSON(res, 409, { success: false, message: 'An account with this email already exists.' });
  }
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    return sendJSON(res, 409, { success: false, message: 'This username is already taken.' });
  }

  const newUser = {
    id: generateId('u'),
    name: name.trim(),
    username: username.trim().toLowerCase(),
    email: email.trim().toLowerCase(),
    password,                          // plain text — acceptable for Assignment 1
    avatar: avatar || '🧑‍💻',
    bio: bio || '',
    hackerrank: `https://www.hackerrank.com/${username.trim().toLowerCase()}`,
    joinedAt: new Date().toISOString(),
    nudgesReceived: 0,
    nudgesSent: 0,
  };

  users.push(newUser);
  writeJSON(USERS_FILE, users);

  console.log(`[REGISTER] ${newUser.name} (@${newUser.username})`);
  const { password: _, ...safeUser } = newUser;
  sendJSON(res, 201, { success: true, message: 'Account created! Please log in.', user: safeUser });
}

// POST /api/login
async function handleLogin(req, res) {
  const body = await readBody(req);
  const { email, password } = body;

  if (!email || !password) {
    return sendJSON(res, 400, { success: false, message: 'Email and password are required.' });
  }

  const users = readJSON(USERS_FILE);
  const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

  if (!user) {
    return sendJSON(res, 401, { success: false, message: 'Invalid email or password.' });
  }

  console.log(`[LOGIN] ${user.name} (@${user.username})`);
  const { password: _, ...safeUser } = user;
  sendJSON(res, 200, { success: true, message: `Welcome back, ${user.name}!`, user: safeUser });
}

// GET /api/users  (optional ?q=search)
function handleGetUsers(req, res, parsedUrl) {
  const q = (parsedUrl.query.q || '').toLowerCase().trim();
  let users = readJSON(USERS_FILE);

  if (q) {
    users = users.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.bio || '').toLowerCase().includes(q)
    );
  }

  const safeUsers = users.map(({ password: _, ...u }) => u);
  sendJSON(res, 200, { success: true, data: safeUsers, total: safeUsers.length });
}

// GET /api/users/:id
function handleGetUser(req, res, userId) {
  const users = readJSON(USERS_FILE);
  const user  = users.find(u => u.id === userId);
  if (!user) {
    return sendJSON(res, 404, { success: false, message: 'User not found.' });
  }
  const { password: _, ...safeUser } = user;
  sendJSON(res, 200, { success: true, data: safeUser });
}

// POST /api/reminders
async function handleSendReminder(req, res) {
  const body = await readBody(req);
  const { fromId, toId, motivationType, customMessage } = body;

  if (!fromId || !toId || !motivationType) {
    return sendJSON(res, 400, { success: false, message: 'fromId, toId, and motivationType are required.' });
  }
  if (fromId === toId) {
    return sendJSON(res, 400, { success: false, message: "You can't nudge yourself! Find a friend to motivate." });
  }

  const users = readJSON(USERS_FILE);
  const sender   = users.find(u => u.id === fromId);
  const receiver = users.find(u => u.id === toId);

  if (!sender || !receiver) {
    return sendJSON(res, 404, { success: false, message: 'User not found.' });
  }

  const reminders = readJSON(REM_FILE);
  const reminder  = {
    id: generateId('rem'),
    fromId,
    toId,
    fromName: sender.name,
    fromUsername: sender.username,
    fromAvatar: sender.avatar,
    toName: receiver.name,
    toUsername: receiver.username,
    motivationType,
    customMessage: (customMessage || '').trim(),
    isRead: false,
    sentAt: new Date().toISOString(),
  };

  reminders.push(reminder);
  writeJSON(REM_FILE, reminders);

  // Increment counters on both users
  const idx = users.findIndex(u => u.id === toId);
  if (idx !== -1) users[idx].nudgesReceived = (users[idx].nudgesReceived || 0) + 1;
  const sidx = users.findIndex(u => u.id === fromId);
  if (sidx !== -1) users[sidx].nudgesSent = (users[sidx].nudgesSent || 0) + 1;
  writeJSON(USERS_FILE, users);

  console.log(`[NUDGE] ${sender.name} → ${receiver.name} (${motivationType})`);
  sendJSON(res, 201, {
    success: true,
    message: `Nudge sent to ${receiver.name}! 🔔`,
    data: reminder,
  });
}

// GET /api/reminders  (?to=id  |  ?from=id)
function handleGetReminders(req, res, parsedUrl) {
  const { to, from } = parsedUrl.query;
  let reminders = readJSON(REM_FILE);

  if (to)   reminders = reminders.filter(r => r.toId === to);
  if (from) reminders = reminders.filter(r => r.fromId === from);

  // Sort newest first
  reminders.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
  const unreadCount = reminders.filter(r => !r.isRead).length;

  sendJSON(res, 200, { success: true, data: reminders, total: reminders.length, unreadCount });
}

// PATCH /api/reminders/:id  — mark as read
async function handleMarkRead(req, res, remId) {
  const reminders = readJSON(REM_FILE);
  const idx = reminders.findIndex(r => r.id === remId);
  if (idx === -1) {
    return sendJSON(res, 404, { success: false, message: 'Reminder not found.' });
  }
  reminders[idx].isRead = true;
  reminders[idx].readAt = new Date().toISOString();
  writeJSON(REM_FILE, reminders);
  sendJSON(res, 200, { success: true, message: 'Marked as read.', data: reminders[idx] });
}

// PATCH /api/reminders/read-all  — mark all read for a user
async function handleMarkAllRead(req, res) {
  const body = await readBody(req);
  const { userId } = body;
  const reminders = readJSON(REM_FILE);
  const now = new Date().toISOString();
  reminders.forEach(r => {
    if (r.toId === userId && !r.isRead) { r.isRead = true; r.readAt = now; }
  });
  writeJSON(REM_FILE, reminders);
  sendJSON(res, 200, { success: true, message: 'All reminders marked as read.' });
}

// GET /api/status — health check
function handleStatus(res) {
  const users     = readJSON(USERS_FILE);
  const reminders = readJSON(REM_FILE);
  sendJSON(res, 200, {
    success: true,
    server:  'CodeNudge API',
    status:  'Running 🟢',
    version: '1.0.0',
    uptime:  process.uptime().toFixed(1) + 's',
    stats: { users: users.length, reminders: reminders.length },
    timestamp: new Date().toISOString(),
  });
}

// ── Main Request Handler ───────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname  = parsedUrl.pathname;
  const method    = req.method.toUpperCase();

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  console.log(`[${method}] ${pathname}`);

  try {
    // ── API Routes ──────────────────────────────────────────
    if (pathname === '/api/register' && method === 'POST') {
      return await handleRegister(req, res);
    }
    if (pathname === '/api/login' && method === 'POST') {
      return await handleLogin(req, res);
    }
    if (pathname === '/api/users' && method === 'GET') {
      return handleGetUsers(req, res, parsedUrl);
    }
    if (pathname.startsWith('/api/users/') && method === 'GET') {
      const userId = pathname.split('/')[3];
      return handleGetUser(req, res, userId);
    }
    if (pathname === '/api/reminders' && method === 'POST') {
      return await handleSendReminder(req, res);
    }
    if (pathname === '/api/reminders' && method === 'GET') {
      return handleGetReminders(req, res, parsedUrl);
    }
    if (pathname === '/api/reminders/read-all' && method === 'PATCH') {
      return await handleMarkAllRead(req, res);
    }
    if (pathname.startsWith('/api/reminders/') && method === 'PATCH') {
      const remId = pathname.split('/')[3];
      return await handleMarkRead(req, res, remId);
    }
    if (pathname === '/api/status' && method === 'GET') {
      return handleStatus(res);
    }

    // ── Static File Serving ─────────────────────────────────
    // Map root "/" to index.html
    let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

    // If no extension, try appending .html (e.g., /login → login.html)
    if (!path.extname(filePath) && !fs.existsSync(filePath)) {
      filePath += '.html';
    }

    serveStatic(res, filePath);

  } catch (err) {
    console.error('[ERROR]', err.message);
    sendJSON(res, 500, { success: false, message: 'Internal server error.' });
  }
});

// ── Start ──────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║   🔔  CodeNudge Server  v1.0.0           ║');
  console.log('  ║   Social Coding Reminder App             ║');
  console.log(`  ║   Running → http://localhost:${PORT}        ║`);
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('');
  console.log('  Routes:');
  console.log('  GET  /                    → Landing page');
  console.log('  GET  /login.html          → Login');
  console.log('  GET  /register.html       → Register');
  console.log('  GET  /dashboard.html      → Dashboard');
  console.log('  GET  /profile.html        → User Profile');
  console.log('  GET  /notifications.html  → Inbox');
  console.log('');
  console.log('  API:');
  console.log('  POST /api/register');
  console.log('  POST /api/login');
  console.log('  GET  /api/users?q=search');
  console.log('  GET  /api/users/:id');
  console.log('  POST /api/reminders');
  console.log('  GET  /api/reminders?to=id');
  console.log('  PATCH /api/reminders/:id');
  console.log('  PATCH /api/reminders/read-all');
  console.log('  GET  /api/status');
  console.log('');
});
