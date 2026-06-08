/**
 * Employee Management Dashboard - Authentication Component
 * Handles the login interface rendering, credential checks, and Quick Login triggers.
 */

window.AuthComponent = {
  render() {
    return `
      <div id="login-container">
        <div class="login-card fade-in">
          <div class="login-logo-box">
            <div class="logo-box">EM</div>
            <span class="logo-text" style="font-size: 1.4rem;">Emp<span class="text-gradient">Pulse</span></span>
          </div>
          
          <div class="login-title-box">
            <h2>Welcome Back</h2>
            <p>Access your HRMS & task tracking portal</p>
          </div>
          
          <div class="login-error" id="login-error"></div>
          
          <form id="login-form">
            <div class="form-group">
              <label class="form-label" for="login-email">Email Address</label>
              <input type="email" id="login-email" class="form-control" placeholder="name@company.com" required autocomplete="username">
            </div>
            
            <div class="form-group" style="position: relative;">
              <label class="form-label" for="login-password">Password</label>
              <input type="password" id="login-password" class="form-control" placeholder="••••••••" required autocomplete="current-password">
              <button type="button" onclick="togglePasswordVisibility()" style="position: absolute; right: 10px; top: 38px; color: var(--text-muted); cursor: pointer;">
                <i data-lucide="eye" id="password-toggle-icon" style="width: 18px; height: 18px;"></i>
              </button>
            </div>
            
            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 0.5rem; height: 44px;">
              <i data-lucide="log-in"></i> Sign In
            </button>
          </form>
          
          <div class="login-divider">Quick Login for Review</div>
          
          <div class="quick-login-grid">
            <button class="btn-quick-login" onclick="triggerQuickLogin('manager')">
              <i data-lucide="shield-check" style="color: var(--accent-primary);"></i>
              <span>Manager Portal</span>
              <span class="subtext">Sarah Jenkins</span>
            </button>
            
            <button class="btn-quick-login" onclick="triggerQuickLogin('employee')">
              <i data-lucide="user" style="color: var(--accent-secondary);"></i>
              <span>Employee Portal</span>
              <span class="subtext">Alex Rivera</span>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  bindEvents() {
    const form = document.getElementById('login-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;
        window.loginUser(email, pass);
      });
    }
  }
};

// Global utilities for Auth Component
window.togglePasswordVisibility = function() {
  const passInput = document.getElementById('login-password');
  const toggleIcon = document.getElementById('password-toggle-icon');
  
  if (passInput) {
    if (passInput.type === 'password') {
      passInput.type = 'text';
      toggleIcon.className = 'lucide-eye-off';
    } else {
      passInput.type = 'password';
      toggleIcon.className = 'lucide-eye';
    }
    if (window.lucide) window.lucide.createIcons();
  }
};

window.triggerQuickLogin = function(role) {
  const emailInput = document.getElementById('login-email');
  const passInput = document.getElementById('login-password');
  
  if (role === 'manager') {
    emailInput.value = 'sarah.j@company.com';
  } else {
    emailInput.value = 'alex.r@company.com';
  }
  passInput.value = 'password123';

  // Automatically submit after a brief highlight delay
  setTimeout(() => {
    window.loginUser(emailInput.value, passInput.value);
  }, 300);
};
