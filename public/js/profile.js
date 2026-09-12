// ================================================================
// CodeNudge — Profile View & Direct Reminder Action
// ================================================================

document.addEventListener('DOMContentLoaded', async () => {
  const currentUser = requireAuth();
  if (!currentUser) return;

  const urlParams = new URLSearchParams(window.location.search);
  const targetUserId = urlParams.get('id');

  if (!targetUserId) {
    window.location.href = '/dashboard.html';
    return;
  }

  await loadProfile(targetUserId, currentUser);
  await loadUserNudgeHistory(targetUserId);
  setupProfileModal(currentUser);
});

async function loadProfile(userId, currentUser) {
  const container = document.getElementById('profile-container');
  const res = await api(`/api/users/${userId}`);

  if (!res.ok || !res.data.success) {
    container.innerHTML = `
      <div class="empty-state">
        <p>Developer not found.</p>
        <a href="/dashboard.html" class="btn btn-primary btn-sm" style="margin-top:1rem;">Back to Dashboard</a>
      </div>
    `;
    return;
  }

  const user = res.data.data;
  const isSelf = user.id === currentUser.id;

  container.innerHTML = `
    <div class="profile-avatar-large">${user.avatar || '🧑‍💻'}</div>
    <h2>${escapeHTML(user.name)}</h2>
    <span class="profile-username">@${escapeHTML(user.username)}</span>
    <p class="profile-bio">${escapeHTML(user.bio || 'Passionate developer dedicated to constant learning and writing clean code.')}</p>
    
    <div class="profile-stats-row">
      <div class="pstat-item">
        <strong>${user.nudgesReceived || 0}</strong>
        <span>Nudges Received</span>
      </div>
      <div class="pstat-item">
        <strong>${user.nudgesSent || 0}</strong>
        <span>Nudges Sent</span>
      </div>
    </div>

    <div class="profile-actions">
      <a href="${escapeHTML(user.hackerrank || 'https://www.hackerrank.com')}" target="_blank" class="btn btn-ghost" rel="noopener noreferrer">
        View HackerRank ↗
      </a>
      ${
        isSelf
          ? `<span class="btn btn-ghost" style="opacity:0.6; cursor:default;">This is you ✨</span>`
          : `<button class="btn btn-primary" id="btn-open-remind">Remind ${escapeHTML(user.name.split(' ')[0])} 🔔</button>`
      }
    </div>
  `;

  if (!isSelf) {
    const remindBtn = document.getElementById('btn-open-remind');
    if (remindBtn) {
      remindBtn.addEventListener('click', () => {
        openProfileModal(user);
      });
    }
  }
}

async function loadUserNudgeHistory(userId) {
  const historyContainer = document.getElementById('user-nudge-history');
  const res = await api(`/api/reminders?to=${userId}`);

  if (res.ok && res.data.success && res.data.data.length > 0) {
    const nudges = res.data.data;
    historyContainer.innerHTML = nudges.map(n => `
      <div class="history-item">
        <div>
          <span>${n.fromAvatar || '🧑‍💻'} <strong>${escapeHTML(n.fromName)}</strong> sent a <em>${escapeHTML(n.motivationType)}</em> nudge</span>
          ${n.customMessage ? `<p style="color:var(--text-muted); font-size:0.8rem; margin-top:0.2rem;">"${escapeHTML(n.customMessage)}"</p>` : ''}
        </div>
        <span style="color:var(--text-dim); font-size:0.75rem;">${formatTimeAgo(n.sentAt)}</span>
      </div>
    `).join('');
  } else {
    historyContainer.innerHTML = `<p class="empty-state">No reminders sent to this developer yet. Be the first to nudge them!</p>`;
  }
}

function setupProfileModal(currentUser) {
  const modal = document.getElementById('reminder-modal');
  const closeBtn = document.getElementById('close-modal-btn');
  const cancelBtn = document.getElementById('cancel-modal-btn');
  const form = document.getElementById('profile-nudge-form');

  const hide = () => {
    modal.style.display = 'none';
    form.reset();
  };

  if (closeBtn) closeBtn.addEventListener('click', hide);
  if (cancelBtn) cancelBtn.addEventListener('click', hide);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) hide();
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const toId = document.getElementById('modal-target-id').value;
      const motivationRadio = form.querySelector('input[name="motivation"]:checked');
      const motivationType = motivationRadio ? motivationRadio.value : 'roast';
      const customMessage = document.getElementById('modal-custom-message').value.trim();

      const sendBtn = document.getElementById('modal-send-btn');
      sendBtn.disabled = true;
      sendBtn.textContent = 'Sending...';

      const res = await api('/api/reminders', {
        method: 'POST',
        body: JSON.stringify({
          fromId: currentUser.id,
          toId,
          motivationType,
          customMessage,
        }),
      });

      sendBtn.disabled = false;
      sendBtn.textContent = 'Send Nudge 🔔';

      if (res.ok && res.data.success) {
        showToast(res.data.message, 'success');
        hide();
        await loadProfile(toId, currentUser);
        await loadUserNudgeHistory(toId);
      } else {
        showToast(res.data.message || 'Failed to send nudge.', 'error');
      }
    });
  }
}

function openProfileModal(user) {
  const modal = document.getElementById('reminder-modal');
  if (!modal) return;

  document.getElementById('modal-target-id').value = user.id;
  document.getElementById('modal-target-name').textContent = user.name;
  document.getElementById('modal-target-username').textContent = `@${user.username}`;
  document.getElementById('modal-target-avatar').textContent = user.avatar || '🧑‍💻';

  modal.style.display = 'flex';
}
