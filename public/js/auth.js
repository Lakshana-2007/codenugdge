// ================================================================
// CodeNudge — Auth Module (Login & Register validation & handling)
// ================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is already logged in
  const currentUser = getCurrentUser();
  if (currentUser && (window.location.pathname.includes('login') || window.location.pathname.includes('register'))) {
    window.location.href = '/dashboard.html';
    return;
  }

  // ── LOGIN HANDLING ─────────────────────────────────────────────
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const authAlert = document.getElementById('auth-alert');

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Clear previous errors
      emailError.textContent = '';
      passwordError.textContent = '';
      if (authAlert) authAlert.style.display = 'none';

      let isValid = true;
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      // Validation
      if (!email) {
        emailError.textContent = 'Please enter your email address.';
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailError.textContent = 'Please provide a valid email format.';
        isValid = false;
      }

      if (!password) {
        passwordError.textContent = 'Please enter your password.';
        isValid = false;
      }

      if (!isValid) return;

      const submitBtn = document.getElementById('btn-login-submit');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Logging in...';

      const res = await api('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      submitBtn.disabled = false;
      submitBtn.textContent = 'Log In 🚀';

      if (res.ok && res.data.success) {
        setCurrentUser(res.data.user);
        showToast(`Welcome, ${res.data.user.name}!`, 'success');
        setTimeout(() => {
          window.location.href = '/dashboard.html';
        }, 600);
      } else {
        if (authAlert) {
          authAlert.className = 'alert-box alert-error';
          authAlert.textContent = res.data.message || 'Login failed. Please verify credentials.';
          authAlert.style.display = 'block';
        } else {
          showToast(res.data.message || 'Invalid credentials', 'error');
        }
      }
    });
  }

  // ── REGISTER HANDLING ──────────────────────────────────────────
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    const nameInput = document.getElementById('reg-name');
    const usernameInput = document.getElementById('reg-username');
    const emailInput = document.getElementById('reg-email');
    const bioInput = document.getElementById('reg-bio');
    const avatarInput = document.getElementById('reg-avatar');
    const passwordInput = document.getElementById('reg-password');
    const confirmPassInput = document.getElementById('reg-confirm-password');

    const nameError = document.getElementById('name-error');
    const usernameError = document.getElementById('username-error');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const confirmPassError = document.getElementById('confirm-password-error');
    const authAlert = document.getElementById('auth-alert');

    // Avatar Selection Logic
    const avatarBtns = document.querySelectorAll('.avatar-opt');
    avatarBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        avatarBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        avatarInput.value = btn.getAttribute('data-avatar');
      });
    });

    // Multi-step form transition logic
    const step1 = document.getElementById('reg-step-1');
    const step2 = document.getElementById('reg-step-2');
    const nextBtn = document.getElementById('btn-next-step');
    const prevBtn = document.getElementById('btn-prev-step');

    if (nextBtn && prevBtn && step1 && step2) {
      nextBtn.addEventListener('click', () => {
        // Validate step 1 fields first
        [nameError, usernameError, emailError].forEach(el => { if (el) el.textContent = ''; });
        let step1Valid = true;

        const name = nameInput.value.trim();
        const username = usernameInput.value.trim().toLowerCase();
        const email = emailInput.value.trim();

        if (!name) {
          nameError.textContent = 'Name is required.';
          step1Valid = false;
        } else if (name.length < 2) {
          nameError.textContent = 'Name must be at least 2 characters.';
          step1Valid = false;
        }

        if (!username) {
          usernameError.textContent = 'Username is required.';
          step1Valid = false;
        } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
          usernameError.textContent = '3-20 chars; letters, numbers, and underscores.';
          step1Valid = false;
        }

        if (!email) {
          emailError.textContent = 'Email is required.';
          step1Valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          emailError.textContent = 'Enter a valid email address.';
          step1Valid = false;
        }

        if (!step1Valid) return;

        // Transition to Step 2
        step1.style.display = 'none';
        step2.style.display = 'block';
        passwordInput.focus();
      });

      prevBtn.addEventListener('click', () => {
        step2.style.display = 'none';
        step1.style.display = 'block';
      });
    }

    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Clear errors
      [nameError, usernameError, emailError, passwordError, confirmPassError].forEach(el => {
        if (el) el.textContent = '';
      });
      if (authAlert) authAlert.style.display = 'none';

      let isValid = true;
      const name = nameInput.value.trim();
      const username = usernameInput.value.trim().toLowerCase();
      const email = emailInput.value.trim();
      const bio = bioInput ? bioInput.value.trim() : '';
      const avatar = avatarInput.value;
      const password = passwordInput.value;
      const confirmPass = confirmPassInput.value;

      // Full validation
      if (!name) {
        nameError.textContent = 'Name is required.';
        isValid = false;
      }
      if (!username) {
        usernameError.textContent = 'Username is required.';
        isValid = false;
      }
      if (!email) {
        emailError.textContent = 'Email is required.';
        isValid = false;
      }

      if (!password) {
        passwordError.textContent = 'Password is required.';
        isValid = false;
      } else if (password.length < 6) {
        passwordError.textContent = 'Password must be at least 6 characters.';
        isValid = false;
      }

      if (password !== confirmPass) {
        confirmPassError.textContent = 'Passwords do not match.';
        isValid = false;
      }

      if (!isValid) return;

      const submitBtn = document.getElementById('btn-register-submit');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating account...';

      const res = await api('/api/register', {
        method: 'POST',
        body: JSON.stringify({ name, username, email, password, avatar, bio }),
      });

      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account 🎉';

      if (res.ok && res.data.success) {
        showToast('Registration successful! Redirecting to login...', 'success');
        setTimeout(() => {
          window.location.href = '/login.html';
        }, 1200);
      } else {
        if (authAlert) {
          authAlert.className = 'alert-box alert-error';
          authAlert.textContent = res.data.message || 'Registration failed.';
          authAlert.style.display = 'block';
        } else {
          showToast(res.data.message || 'Registration error', 'error');
        }
      }
    });
  }
});
