// ================================================================
// CodeNudge — Notifications & Inbox Logic with Audio Motivation
// ================================================================

document.addEventListener('DOMContentLoaded', async () => {
  const currentUser = requireAuth();
  if (!currentUser) return;

  await loadNotifications(currentUser.id);

  // Mark all read button
  const markAllBtn = document.getElementById('mark-all-read-btn');
  if (markAllBtn) {
    markAllBtn.addEventListener('click', async () => {
      const res = await api('/api/reminders/read-all', {
        method: 'PATCH',
        body: JSON.stringify({ userId: currentUser.id }),
      });

      if (res.ok && res.data.success) {
        showToast('All nudges marked as read!', 'success');
        await loadNotifications(currentUser.id);
        refreshNavBadge();
      }
    });
  }

  // Refresh button
  const refreshBtn = document.getElementById('refresh-notif-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      await loadNotifications(currentUser.id);
      refreshNavBadge();
    });
  }
});

async function loadNotifications(userId) {
  const container = document.getElementById('notif-list-container');
  if (!container) return;

  const res = await api(`/api/reminders?to=${userId}`);

  if (!res.ok || !res.data.success) {
    container.innerHTML = `<div class="empty-state">Failed to load nudges.</div>`;
    return;
  }

  const reminders = res.data.data;

  if (reminders.length === 0) {
    container.innerHTML = `
      <div class="empty-state glass-card">
        <span style="font-size: 3rem; display:block; margin-bottom:0.75rem;">🎉</span>
        <h3>All caught up!</h3>
        <p style="color:var(--text-muted); margin-top:0.25rem;">
          No pending nudges. Tell your friends to send you reminders to keep you on track!
        </p>
        <a href="/dashboard.html" class="btn btn-primary btn-sm" style="margin-top:1.25rem;">Explore Community</a>
      </div>
    `;
    return;
  }

  // Cache reminders globally for modal viewing
  window._activeReminders = reminders;

  container.innerHTML = reminders.map((r, index) => {
    const isUnread = !r.isRead;
    const isAudio = r.motivationType === 'tamil_audio';

    let motivationLabel = '🔥 Savage Roast';
    if (r.motivationType === 'tamil_audio') motivationLabel = '🎵 Hey Parama Padi Da!';
    else if (r.motivationType === 'career') motivationLabel = '💼 Career Reality Check';
    else if (r.motivationType === 'friendly') motivationLabel = '🤝 Friendly Nudge';

    return `
      <div class="notif-card glass-card ${isUnread ? 'unread' : ''}" id="card-${r.id}" style="cursor: pointer;" onclick="openNudgeModal(${index})">
        <div class="notif-top">
          <div class="notif-sender">
            <span class="notif-sender-avatar">${r.fromAvatar || '🧑‍💻'}</span>
            <div class="notif-sender-info">
              <strong>${escapeHTML(r.fromName)}</strong>
              <span class="username">@${escapeHTML(r.fromUsername)}</span>
            </div>
          </div>
          <span class="notif-time">${formatTimeAgo(r.sentAt)}</span>
        </div>

        <div class="notif-motivation-tag ${isAudio ? 'tag-audio' : ''}">
          ${motivationLabel}
        </div>

        <div class="notif-body">
          ${
            r.customMessage 
              ? `"${escapeHTML(r.customMessage)}"` 
              : getDefaultMessageForType(r.motivationType)
          }
        </div>

        <div class="notif-action-row" onclick="event.stopPropagation()">
          <div class="notif-btns">
            <button class="btn btn-sm btn-accent" onclick="openNudgeModal(${index})">
              👁️ View Reminder & Motivation
            </button>
            <a href="https://www.hackerrank.com" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary" onclick="markRead('${r.id}')">
              🚀 Start Coding
            </a>
          </div>

          ${
            isUnread 
              ? `<button class="btn btn-xs btn-ghost" onclick="markRead('${r.id}')">Mark as read</button>`
              : `<span style="font-size:0.75rem; color:var(--text-dim);">✓ Read</span>`
          }
        </div>
      </div>
    `;
  }).join('');
}

function getDefaultMessageForType(type) {
  switch (type) {
    case 'tamil_audio':
      return '"Hey parama! Close the reel, stop scrolling, and go solve at least one question da! 😤"';
    case 'career':
      return '"Campus placements & tech rounds are right around the corner. Every line of code counts! 💼"';
    case 'friendly':
      return '"Hey friend, just checking in to see if you coded today. You got this! 🚀"';
    case 'roast':
    default:
      return '"Bro, Netflix won\'t give you a package! Close the tab and open HackerRank right now! 😈"';
  }
}

// ── NUDGE DETAIL VIEW MODAL (Triggered when viewing the reminder) ──
window.openNudgeModal = function(index) {
  const reminders = window._activeReminders;
  if (!reminders || !reminders[index]) return;

  const r = reminders[index];
  const modal = document.getElementById('nudge-view-modal');
  const closeBtn = document.getElementById('close-nudge-modal-btn');
  const replayBtn = document.getElementById('modal-replay-audio-btn');
  const audioIndicator = document.getElementById('modal-audio-indicator');

  // Fill in details
  document.getElementById('modal-view-avatar').textContent = r.fromAvatar || '🧑‍💻';
  document.getElementById('modal-view-sender').textContent = r.fromName;
  document.getElementById('modal-view-username').textContent = `@${r.fromUsername}`;
  document.getElementById('modal-view-time').textContent = formatTimeAgo(r.sentAt);

  let tagText = '🔥 Savage Roast';
  if (r.motivationType === 'tamil_audio') tagText = '🎵 Hey Parama Padi Da!';
  else if (r.motivationType === 'career') tagText = '💼 Career Push';
  else if (r.motivationType === 'friendly') tagText = '🤝 Friendly Nudge';
  document.getElementById('modal-view-tag').textContent = tagText;

  const messageText = r.customMessage ? r.customMessage : getDefaultMessageForType(r.motivationType);
  document.getElementById('modal-view-message').textContent = messageText.replace(/^"|"$/g, '');

  // Automatically mark as read when viewed
  markRead(r.id);

  // AUTOMATICALLY PLAY AUDIO ON VIEWING THE REMINDER
  if (r.motivationType === 'tamil_audio') {
    if (audioIndicator) audioIndicator.style.display = 'inline-flex';
    if (replayBtn) {
      replayBtn.style.display = 'inline-flex';
      replayBtn.onclick = () => playMotivationAudio();
    }
    playMotivationAudio();
  } else {
    if (audioIndicator) audioIndicator.style.display = 'none';
    if (replayBtn) replayBtn.style.display = 'none';
  }

  modal.style.display = 'flex';

  const hide = () => {
    modal.style.display = 'none';
    // Pause audio when modal is closed
    const audio = document.getElementById('motivation-audio');
    if (audio) { audio.pause(); audio.currentTime = 0; }
  };

  closeBtn.onclick = hide;
  modal.onclick = (e) => {
    if (e.target === modal) hide();
  };
};

function playMotivationAudio() {
  let audio = document.getElementById('motivation-audio');
  if (!audio) {
    audio = new Audio('/audio/hey_parama_padi_da.mp3');
  }

  audio.volume = 1.0;
  audio.currentTime = 0;

  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
      showToast('🎵 Playing: Hey Parama Padi Da! 🔥', 'info');
    }).catch(err => {
      console.warn('Playback notice:', err);
      const fallbackAudio = new Audio('/audio/hey_parama_padi_da.mp3');
      fallbackAudio.play().catch(e => console.warn('Audio fallback error:', e));
    });
  }
}

// Mark single reminder as read
window.markRead = async function(reminderId) {
  const res = await api(`/api/reminders/${reminderId}`, {
    method: 'PATCH',
  });

  if (res.ok && res.data.success) {
    const card = document.getElementById(`card-${reminderId}`);
    if (card) {
      card.classList.remove('unread');
      const actionRow = card.querySelector('.notif-action-row');
      if (actionRow) {
        const markBtn = actionRow.querySelector('button.btn-xs');
        if (markBtn) {
          const span = document.createElement('span');
          span.style.fontSize = '0.75rem';
          span.style.color = 'var(--text-dim)';
          span.textContent = '✓ Read';
          markBtn.replaceWith(span);
        }
      }
    }
    refreshNavBadge();
  }
};
