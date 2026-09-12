// ================================================================
// CodeNudge — Shared Client-side Utilities & API Wrapper
// ================================================================

const STORAGE_KEY = 'cn_user';

// Get active session user
function getCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Set active session user
function setCurrentUser(user) {
  if (!user) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }
}

// Route auth protection
function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = '/login.html';
    return null;
  }
  return user;
}

// Generic Fetch Wrapper for Node.js REST endpoints
async function api(endpoint, options = {}) {
  const defaults = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = {
    ...defaults,
    ...options,
    headers: {
      ...defaults.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(endpoint, config);
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    return { ok: false, status: 500, data: { success: false, message: 'Network connection failed.' } };
  }
}

// Lightweight Toast Notification system
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : '🔔';
  toast.innerHTML = `<span>${icon}</span> <span>${escapeHTML(message)}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// XSS Sanitizer
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Relative time formatter
function formatTimeAgo(isoDateString) {
  if (!isoDateString) return 'recently';
  const now = new Date();
  const past = new Date(isoDateString);
  const diffInSec = Math.floor((now - past) / 1000);

  if (diffInSec < 60) return 'just now';
  const diffInMin = Math.floor(diffInSec / 60);
  if (diffInMin < 60) return `${diffInMin}m ago`;
  const diffInHours = Math.floor(diffInMin / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

// Update top navbar unread pill
async function refreshNavBadge() {
  const user = getCurrentUser();
  if (!user) return;

  const pill = document.getElementById('unread-pill');
  if (!pill) return;

  const res = await api(`/api/reminders?to=${user.id}`);
  if (res.ok && res.data.success) {
    const unread = res.data.unreadCount || 0;
    if (unread > 0) {
      pill.textContent = unread > 99 ? '99+' : unread;
      pill.style.display = 'inline-block';
    } else {
      pill.style.display = 'none';
    }
  }
}

// Setup common navbar events (logout, user avatar)
document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  if (user) {
    const navAvatar = document.getElementById('nav-user-avatar');
    const navName = document.getElementById('nav-user-name');
    if (navAvatar) navAvatar.textContent = user.avatar || '🧑‍💻';
    if (navName) navName.textContent = user.name.split(' ')[0];

    refreshNavBadge();
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      setCurrentUser(null);
      showToast('Logged out successfully!', 'info');
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 500);
    });
  }
});
