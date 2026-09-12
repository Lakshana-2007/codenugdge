const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.join(__dirname, 'screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1280, height: 850, deviceScaleFactor: 1.5 }
  });

  const page = await browser.newPage();

  // Test user session
  const testUser = {
    id: "u_1788876571833_edmaz",
    name: "lakshana",
    username: "laks",
    email: "lakshana@gmail.com",
    avatar: "👩‍💻",
    bio: "dsa lover",
    hackerrank: "https://www.hackerrank.com/laks",
    joinedAt: "2026-09-08T14:09:31.833Z",
    nudgesReceived: 2,
    nudgesSent: 1
  };

  console.log('1. Capturing Home Page...');
  await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(OUTPUT_DIR, '01_home_page.png') });

  console.log('2. Capturing Login Page...');
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:3000/login.html', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(OUTPUT_DIR, '02_login_page.png') });

  console.log('3. Capturing Validation Error Page...');
  await page.goto('http://localhost:3000/register.html', { waitUntil: 'networkidle0' });
  // Click next step button without filling required inputs to trigger validation messages
  await page.click('#btn-next-step');
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '11_validation.png') });

  console.log('4. Capturing Dashboard...');
  await page.evaluate((u) => {
    localStorage.setItem('cn_user', JSON.stringify(u));
  }, testUser);
  await page.goto('http://localhost:3000/dashboard.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '03_dashboard.png') });

  console.log('5. Capturing Search User...');
  await page.type('#global-search-input', 'Rahul');
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '04_search_user.png') });

  console.log('6. Capturing Send Coding Nudge Modal...');
  // Open remind modal for Rahul
  await page.evaluate(() => {
    if (typeof window.openRemindModal === 'function') {
      window.openRemindModal('u1', 'Rahul Sharma', 'rahul_codes', '🧑‍💻');
      const radio = document.querySelector('input[value="tamil_audio"]');
      if (radio) radio.checked = true;
      const msgInput = document.getElementById('modal-custom-message');
      if (msgInput) msgInput.value = 'Enna da Rahul, stop scrolling reels and start solving DP problems!';
    }
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '06_send_coding_nudge.png') });

  console.log('7. Capturing User Profile...');
  await page.goto('http://localhost:3000/profile.html?id=u1', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '05_user_profile.png') });

  console.log('8. Capturing Reminder History...');
  await page.evaluate(() => {
    const el = document.getElementById('user-nudge-history');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '10_reminder_history.png') });

  console.log('9. Capturing Notifications Received & Start Coding...');
  await page.goto('http://localhost:3000/notifications.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '07_notification_received.png') });
  await page.screenshot({ path: path.join(OUTPUT_DIR, '09_start_coding.png') });

  console.log('10. Capturing Motivation Audio Modal...');
  await page.evaluate(() => {
    if (typeof window.openNudgeModal === 'function') {
      window.openNudgeModal(0);
    }
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '08_motivation_audio.png') });

  console.log('11. Capturing Node.js Server Response...');
  await page.goto('http://localhost:3000/api/status', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '12_server_response.png') });

  await browser.close();
  console.log('All 12 screenshots captured successfully!');
}

run().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
