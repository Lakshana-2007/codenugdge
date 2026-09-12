// ================================================================
// CodeNudge — Dashboard Interactivity & Quick Remind Modal
// ================================================================

document.addEventListener('DOMContentLoaded', async () => {
  const currentUser = requireAuth();
  if (!currentUser) return;

  // Personalize dashboard greeting
  const greetingName = document.getElementById('dash-greeting-name');
  const bioText = document.getElementById('dash-bio-text');
  if (greetingName) greetingName.textContent = currentUser.name.split(' ')[0];
  if (bioText && currentUser.bio) bioText.textContent = currentUser.bio;

  // Initialize stats & users list
  await loadUserStats(currentUser.id);
  await loadUsersList();

  // ── SEARCH HANDLING ──────────────────────────────────────────
  const searchInput = document.getElementById('global-search-input');
  const clearBtn = document.getElementById('clear-search-btn');
  let searchTimeout = null;

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      clearBtn.style.display = query ? 'block' : 'none';

      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        loadUsersList(query);
      }, 250);
    });

    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearBtn.style.display = 'none';
      loadUsersList();
    });
  }

  const refreshBtn = document.getElementById('refresh-users-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (clearBtn) clearBtn.style.display = 'none';
      loadUsersList();
      loadUserStats(currentUser.id);
      refreshNavBadge();
    });
  }

  // ── MODAL HANDLING ───────────────────────────────────────────
  setupModalHandlers(currentUser);
});

// Load stats from server
async function loadUserStats(userId) {
  const res = await api(`/api/users/${userId}`);
  if (res.ok && res.data.success) {
    const u = res.data.data;
    document.getElementById('stat-nudges-rcvd').textContent = u.nudgesReceived || 0;
    document.getElementById('stat-nudges-sent').textContent = u.nudgesSent || 0;
    // Update local cache
    setCurrentUser(u);
  }
}

// Fetch and render users
async function loadUsersList(query = '') {
  const grid = document.getElementById('users-grid');
  const subtext = document.getElementById('search-status-subtext');
  if (!grid) return;

  const endpoint = query ? `/api/users?q=${encodeURIComponent(query)}` : '/api/users';
  const res = await api(endpoint);

  if (!res.ok || !res.data.success) {
    grid.innerHTML = `<div class="empty-state">Failed to load developers. Please try refreshing.</div>`;
    return;
  }

  const currentUser = getCurrentUser();
  const users = res.data.data;

  if (query) {
    subtext.textContent = `Search results for "${escapeHTML(query)}" (${users.length} found)`;
  } else {
    subtext.textContent = `Showing active community members (${users.length}). Click 'Remind' to send them a wake-up call!`;
  }

  if (users.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <span style="font-size: 2.5rem; display: block; margin-bottom: 0.5rem;">🔍</span>
        <p>No developers found matching "${escapeHTML(query)}".</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = users.map(user => {
    const isSelf = currentUser && user.id === currentUser.id;
    return `
      <div class="user-card glass-card">
        <div>
          <div class="user-card-header">
            <div class="user-card-avatar">${user.avatar || '🧑‍💻'}</div>
            <div class="user-card-names">
              <h4>${escapeHTML(user.name)} ${isSelf ? '<small style="color:var(--accent-primary);">(You)</small>' : ''}</h4>
              <span class="username">@${escapeHTML(user.username)}</span>
            </div>
          </div>
          <p class="user-card-bio">${escapeHTML(user.bio || 'Coding daily to master algorithms.')}</p>
          <div class="user-card-stats">
            <span>📥 ${user.nudgesReceived || 0} received</span>
            <span>📤 ${user.nudgesSent || 0} sent</span>
          </div>
        </div>
        <div class="user-card-actions">
          <a href="/profile.html?id=${encodeURIComponent(user.id)}" class="btn btn-ghost btn-sm">Profile</a>
          ${
            isSelf
              ? `<button class="btn btn-ghost btn-sm" disabled style="opacity: 0.5; cursor: not-allowed;">Yourself</button>`
              : `<button class="btn btn-primary btn-sm" onclick="openRemindModal('${escapeHTML(user.id)}', '${escapeHTML(user.name)}', '${escapeHTML(user.username)}', '${escapeHTML(user.avatar || '🧑‍💻')}')">Remind 🔔</button>`
          }
        </div>
      </div>
    `;
  }).join('');
}

// Quick Remind Modal logic
function setupModalHandlers(currentUser) {
  const modal = document.getElementById('reminder-modal');
  const closeBtn = document.getElementById('close-modal-btn');
  const cancelBtn = document.getElementById('cancel-modal-btn');
  const form = document.getElementById('quick-nudge-form');

  const hideModal = () => {
    modal.style.display = 'none';
    form.reset();
  };

  if (closeBtn) closeBtn.addEventListener('click', hideModal);
  if (cancelBtn) cancelBtn.addEventListener('click', hideModal);

  // Close on outside backdrop click
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) hideModal();
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
        hideModal();
        await loadUserStats(currentUser.id);
        await loadUsersList();
      } else {
        showToast(res.data.message || 'Failed to send nudge', 'error');
      }
    });
  }
}

// Global hook for 'Remind' button on user cards
window.openRemindModal = function(id, name, username, avatar) {
  const modal = document.getElementById('reminder-modal');
  if (!modal) return;

  document.getElementById('modal-target-id').value = id;
  document.getElementById('modal-target-name').textContent = name;
  document.getElementById('modal-target-username').textContent = `@${username}`;
  document.getElementById('modal-target-avatar').textContent = avatar;

  modal.style.display = 'flex';
};
