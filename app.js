/**
 * Employee Management Dashboard - Main Application Controller
 * Manages Routing, Theme switching, Toast notifications, and overall state synchronization.
 */

// Import views (will load via globals window.* or dynamic imports)
// To keep file:// support highly reliable, we will use a global architecture
// where components register themselves onto the window object.

window.currentUser = null;
window.currentView = 'dashboard';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  checkSession();
  setupGlobalListeners();
  startLiveClock();
  startActivitySimulator();
});

// --- Theme Management ---
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggleIcon(savedTheme);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = prefersDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeToggleIcon(theme);
  }
}

window.toggleTheme = function() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeToggleIcon(newTheme);
  showToast(`Switched to ${newTheme} theme`, 'info');
  
  // Re-render charts if they exist to match new grid colors
  if (window.renderManagerCharts) window.renderManagerCharts();
  if (window.renderEmployeeCharts) window.renderEmployeeCharts();
};

function updateThemeToggleIcon(theme) {
  const icon = document.querySelector('#theme-toggle-btn i');
  if (icon) {
    icon.className = theme === 'dark' ? 'lucide-sun' : 'lucide-moon';
    if (window.lucide) window.lucide.createIcons();
  }
}

// --- Session & Navigation Router ---
function checkSession() {
  const token = sessionStorage.getItem('token');
  const sessionUser = sessionStorage.getItem('currentUser');

  if (token && sessionUser) {
    try {
      window.currentUser = JSON.parse(sessionUser);
      renderAppShell();
    } catch (e) {
      logout();
    }
  } else {
    renderLogin();
  }
}

window.loginUser = function(email, password) {
  const res = window.db.login(email, password);
  if (res.success) {
    sessionStorage.setItem('token', res.token);
    sessionStorage.setItem('currentUser', JSON.stringify(res.user));
    window.currentUser = res.user;
    
    // Add activity log
    window.db.logActivity('Logged into system', res.user.name, res.user.role);
    
    showToast(`Welcome back, ${res.user.name}!`, 'success');
    renderAppShell();
  } else {
    const errBox = document.getElementById('login-error');
    if (errBox) {
      errBox.innerText = res.message;
      errBox.style.display = 'block';
    }
  }
};

window.logout = function() {
  if (window.currentUser) {
    window.db.logActivity('Logged out of system', window.currentUser.name, window.currentUser.role);
  }
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('currentUser');
  window.currentUser = null;
  window.currentView = 'dashboard';
  renderLogin();
};

// --- View Rendering Engine ---
function renderLogin() {
  // Render Login Card
  const root = document.getElementById('app-root');
  if (window.AuthComponent) {
    root.innerHTML = window.AuthComponent.render();
    window.AuthComponent.bindEvents();
  } else {
    root.innerHTML = `<div style="padding: 2rem; text-align: center;">Loading Authentication Module...</div>`;
  }
  if (window.lucide) window.lucide.createIcons();
}

function renderAppShell() {
  const root = document.getElementById('app-root');
  const role = window.currentUser.role;
  const isManager = role === 'manager';

  // Layout structure
  root.innerHTML = `
    <div id="app-container">
      <!-- Sidebar Navigation -->
      <aside class="sidebar" id="app-sidebar">
        <div class="sidebar-header">
          <div class="logo-box">EM</div>
          <span class="logo-text">Emp<span class="text-gradient">Pulse</span></span>
        </div>
        <ul class="sidebar-nav">
          ${isManager ? getManagerNav() : getEmployeeNav()}
        </ul>
        <div class="sidebar-footer">
          <div class="user-snippet">
            <div class="avatar">${window.currentUser.avatar}</div>
            <div class="user-info">
              <span class="name">${window.currentUser.name}</span>
              <span class="role">${isManager ? 'Manager' : window.currentUser.designation}</span>
            </div>
          </div>
          <button class="btn-icon" onclick="logout()" title="Logout">
            <i data-lucide="log-out"></i>
          </button>
        </div>
      </aside>

      <!-- Main Body Content -->
      <div class="main-wrapper">
        <!-- Floating Header -->
        <header class="top-header">
          <div class="header-left">
            <button class="btn-icon sidebar-toggle" onclick="toggleSidebar()">
              <i data-lucide="menu"></i>
            </button>
            <div class="page-title-box">
              <h1 id="view-title">Dashboard Overview</h1>
            </div>
          </div>
          <div class="header-right">
            <!-- Global Search -->
            <div class="search-wrapper">
              <input type="text" id="global-search-input" placeholder="Search tasks or files..." onkeyup="handleGlobalSearch(event)">
              <i data-lucide="search"></i>
            </div>
            <!-- Theme Toggle -->
            <button class="btn-icon" id="theme-toggle-btn" onclick="toggleTheme()" title="Toggle Dark/Light Mode">
              <i data-lucide="moon"></i>
            </button>
            <!-- Notifications Dropdown -->
            <div class="notif-btn-wrapper">
              <button class="btn-icon" onclick="toggleNotifDropdown(event)" title="Notifications">
                <i data-lucide="bell"></i>
                <div class="notif-badge" id="header-notif-badge" style="display: none;"></div>
              </button>
              <div class="notif-dropdown" id="notif-dropdown-menu">
                <div class="notif-header">
                  <h4>Notifications</h4>
                  <button onclick="markAllNotificationsAsRead()">Clear All</button>
                </div>
                <div class="notif-list" id="notif-list-container">
                  <!-- Notifications injected here -->
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- Dynamic Main Content Grid -->
        <main class="container fade-in" id="main-content-view">
          <!-- Views injected here dynamically -->
        </main>
      </div>
    </div>
  `;

  // Draw initial view
  switchView(window.currentView);
  updateNotificationBadge();
  if (window.lucide) window.lucide.createIcons();
}

function getManagerNav() {
  return `
    <li class="nav-item ${window.currentView === 'dashboard' ? 'active' : ''}" onclick="switchView('dashboard')">
      <i data-lucide="layout-dashboard"></i> <span>Dashboard</span>
    </li>
    <li class="nav-item ${window.currentView === 'work' ? 'active' : ''}" onclick="switchView('work')">
      <i data-lucide="check-square"></i> <span>Assign Work</span>
    </li>
    <li class="nav-item ${window.currentView === 'attendance' ? 'active' : ''}" onclick="switchView('attendance')">
      <i data-lucide="clock"></i> <span>Attendance</span>
    </li>
    <li class="nav-item ${window.currentView === 'reports' ? 'active' : ''}" onclick="switchView('reports')">
      <i data-lucide="bar-chart-3"></i> <span>Productivity Reports</span>
    </li>
    <li class="nav-item ${window.currentView === 'logs' ? 'active' : ''}" onclick="switchView('logs')">
      <i data-lucide="file-text"></i> <span>Activity Logs</span>
    </li>
    <li class="nav-item ${window.currentView === 'profile' ? 'active' : ''}" onclick="switchView('profile')">
      <i data-lucide="user"></i> <span>My Profile</span>
    </li>
  `;
}

function getEmployeeNav() {
  return `
    <li class="nav-item ${window.currentView === 'dashboard' ? 'active' : ''}" onclick="switchView('dashboard')">
      <i data-lucide="layout-dashboard"></i> <span>Dashboard</span>
    </li>
    <li class="nav-item ${window.currentView === 'work' ? 'active' : ''}" onclick="switchView('work')">
      <i data-lucide="briefcase"></i> <span>Assigned Work</span>
    </li>
    <li class="nav-item ${window.currentView === 'timecard' ? 'active' : ''}" onclick="switchView('timecard')">
      <i data-lucide="clock"></i> <span>Time Clock</span>
    </li>
    <li class="nav-item ${window.currentView === 'profile' ? 'active' : ''}" onclick="switchView('profile')">
      <i data-lucide="user"></i> <span>My Profile</span>
    </li>
  `;
}

window.toggleSidebar = function() {
  const sidebar = document.getElementById('app-sidebar');
  if (sidebar) sidebar.classList.toggle('open');
};

window.switchView = function(viewName) {
  window.currentView = viewName;
  const mainView = document.getElementById('main-content-view');
  const titleBox = document.getElementById('view-title');
  const isManager = window.currentUser.role === 'manager';

  // Toggle active class in sidebar items
  const sidebarNav = document.querySelector('.sidebar-nav');
  if (sidebarNav) {
    sidebarNav.innerHTML = isManager ? getManagerNav() : getEmployeeNav();
  }

  // Fade out main content and load new view
  mainView.classList.remove('fade-in');
  void mainView.offsetWidth; // Trigger reflow
  mainView.classList.add('fade-in');

  if (isManager) {
    if (!window.ManagerComponent) {
      mainView.innerHTML = `<div style="padding: 2rem; text-align: center;">Loading Module...</div>`;
      return;
    }
    switch (viewName) {
      case 'dashboard':
        titleBox.innerText = 'Dashboard Overview';
        mainView.innerHTML = window.ManagerComponent.renderDashboard();
        window.ManagerComponent.initDashboard();
        break;
      case 'work':
        titleBox.innerText = 'Work Assignment Module';
        mainView.innerHTML = window.ManagerComponent.renderWorkModule();
        window.ManagerComponent.initWorkModule();
        break;
      case 'attendance':
        titleBox.innerText = 'Time & Attendance Monitoring';
        mainView.innerHTML = window.ManagerComponent.renderAttendance();
        break;
      case 'reports':
        titleBox.innerText = 'Analytics & Reports Exporter';
        mainView.innerHTML = window.ManagerComponent.renderReports();
        window.ManagerComponent.initReports();
        break;
      case 'logs':
        titleBox.innerText = 'System Audit Logs';
        mainView.innerHTML = window.ManagerComponent.renderLogs();
        break;
      case 'profile':
        titleBox.innerText = 'Profile Management';
        mainView.innerHTML = renderProfileSettings();
        break;
      default:
        switchView('dashboard');
    }
  } else {
    if (!window.EmployeeComponent) {
      mainView.innerHTML = `<div style="padding: 2rem; text-align: center;">Loading Module...</div>`;
      return;
    }
    switch (viewName) {
      case 'dashboard':
        titleBox.innerText = 'My Employee Dashboard';
        mainView.innerHTML = window.EmployeeComponent.renderDashboard();
        window.EmployeeComponent.initDashboard();
        break;
      case 'work':
        titleBox.innerText = 'My Assigned Tasks';
        mainView.innerHTML = window.EmployeeComponent.renderWorkModule();
        window.EmployeeComponent.initWorkModule();
        break;
      case 'timecard':
        titleBox.innerText = 'Time Punctuality Card';
        mainView.innerHTML = window.EmployeeComponent.renderTimecard();
        window.EmployeeComponent.initTimecard();
        break;
      case 'profile':
        titleBox.innerText = 'Profile Settings';
        mainView.innerHTML = renderProfileSettings();
        break;
      default:
        switchView('dashboard');
    }
  }

  // Re-trigger icon formatting
  if (window.lucide) window.lucide.createIcons();

  // Close sidebar on mobile after clicking
  const sidebar = document.getElementById('app-sidebar');
  if (sidebar) sidebar.classList.remove('open');
};

// --- Global Search implementation ---
window.handleGlobalSearch = function(event) {
  const val = event.target.value.toLowerCase().trim();
  
  // Custom search depending on active panel view
  const currentSearchTarget = window.currentView;
  
  if (window.currentUser.role === 'manager') {
    if (currentSearchTarget === 'work' && window.ManagerComponent.filterTasks) {
      window.ManagerComponent.filterTasks(val);
    } else if (currentSearchTarget === 'attendance') {
      const rows = document.querySelectorAll('#attendance-table-body tr');
      rows.forEach(r => {
        const text = r.innerText.toLowerCase();
        r.style.display = text.includes(val) ? '' : 'none';
      });
    } else if (currentSearchTarget === 'logs') {
      const rows = document.querySelectorAll('#logs-table-body tr');
      rows.forEach(r => {
        const text = r.innerText.toLowerCase();
        r.style.display = text.includes(val) ? '' : 'none';
      });
    }
  } else {
    if (currentSearchTarget === 'work' && window.EmployeeComponent.filterTasks) {
      window.EmployeeComponent.filterTasks(val);
    }
  }
};

// --- Shared Profile Settings Component ---
function renderProfileSettings() {
  const user = window.currentUser;
  return `
    <div class="glass-panel" style="max-width: 600px; margin: 0 auto;">
      <div style="display:flex; align-items:center; gap:1.25rem; margin-bottom:1.5rem; border-bottom:1px solid var(--border-color); padding-bottom:1.5rem;">
        <div class="avatar" style="width:64px; height:64px; font-size:1.5rem; display:flex; align-items:center; justify-content:center;">${user.avatar}</div>
        <div>
          <h2 style="font-size:1.25rem;">${user.name}</h2>
          <p style="font-size:0.85rem; color:var(--text-secondary);">${user.designation || 'Administrator'} • ${user.department}</p>
        </div>
      </div>
      
      <form onsubmit="handleProfileUpdate(event)">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input type="text" id="prof-name" class="form-control" value="${user.name}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input type="email" id="prof-email" class="form-control" value="${user.email}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Department</label>
          <input type="text" id="prof-dept" class="form-control" value="${user.department}" readonly disabled style="opacity: 0.7;">
        </div>
        <div class="form-group">
          <label class="form-label">New Password (leave blank to keep current)</label>
          <input type="password" id="prof-pass" class="form-control" placeholder="Enter new password">
        </div>
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2rem;">
          <button type="button" class="btn btn-secondary" onclick="resetDatabase()"><i data-lucide="refresh-cw"></i> Reset Database</button>
          <button type="submit" class="btn btn-primary">Save Profile</button>
        </div>
      </form>
    </div>
  `;
}

window.handleProfileUpdate = function(e) {
  e.preventDefault();
  const name = document.getElementById('prof-name').value;
  const email = document.getElementById('prof-email').value;
  const pass = document.getElementById('prof-pass').value;

  const res = window.db.updateProfile(window.currentUser.id, name, email, window.currentUser.department, window.currentUser.designation || 'Administrator', pass);
  if (res.success) {
    window.currentUser = res.user;
    sessionStorage.setItem('currentUser', JSON.stringify(res.user));
    
    // Update top header and sidebar snippets
    renderAppShell();
    showToast('Profile updated successfully', 'success');
  } else {
    showToast(res.message, 'error');
  }
};

window.resetDatabase = function() {
  if (confirm("Are you sure you want to reset all data (tasks, attendance, notifications) to default values?")) {
    window.db.reset();
    showToast('Database reset to defaults', 'success');
    window.logout();
  }
};

// --- Live Clock Utility ---
function startLiveClock() {
  setInterval(() => {
    const clock = document.getElementById('digital-clock-display');
    if (clock) {
      const now = new Date();
      clock.innerText = now.toTimeString().split(' ')[0];
    }
  }, 1000);
}

// --- Dynamic Notifications & Real-Time Event Sync ---
window.toggleNotifDropdown = function(e) {
  e.stopPropagation();
  const dropdown = document.getElementById('notif-dropdown-menu');
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
};

function setupGlobalListeners() {
  // Close dropdown on click outside
  window.addEventListener('click', () => {
    const dropdown = document.getElementById('notif-dropdown-menu');
    if (dropdown) dropdown.classList.remove('show');
  });

  // Listen to custom DB notification events
  window.addEventListener('app-notification', (e) => {
    const notification = e.detail;
    
    // Only show toast if notifications are for current logged-in employee/manager
    if (notification.employeeId === window.currentUser.id) {
      showToast(notification.text, 'info');
      updateNotificationBadge();
      
      // Update notifications list if currently visible
      if (window.currentView === 'dashboard') {
        if (window.currentUser.role === 'manager' && window.ManagerComponent.initDashboard) {
          window.ManagerComponent.initDashboard();
        } else if (window.currentUser.role === 'employee' && window.EmployeeComponent.initDashboard) {
          window.EmployeeComponent.initDashboard();
        }
      }
    }
  });
}

window.updateNotificationBadge = function() {
  if (!window.currentUser) return;
  
  const notifs = window.db.getNotifications(window.currentUser.id);
  const unreadCount = notifs.filter(n => !n.read).length;
  
  const badge = document.getElementById('header-notif-badge');
  if (badge) {
    if (unreadCount > 0) {
      badge.style.display = 'block';
      badge.innerText = unreadCount;
    } else {
      badge.style.display = 'none';
    }
  }

  // Populate Dropdown List
  const list = document.getElementById('notif-list-container');
  if (list) {
    if (notifs.length === 0) {
      list.innerHTML = `<div class="notif-empty">No new notifications.</div>`;
    } else {
      list.innerHTML = notifs.map(n => `
        <div class="notif-item ${n.read ? '' : 'unread'}">
          <div>${n.text}</div>
          <div class="notif-time">${formatTimeAgo(n.timestamp)}</div>
        </div>
      `).join('');
    }
  }
};

window.markAllNotificationsAsRead = function() {
  if (window.currentUser) {
    window.db.markNotificationsAsRead(window.currentUser.id);
    updateNotificationBadge();
    showToast('Notifications cleared', 'success');
  }
};

function formatTimeAgo(isoStr) {
  const diffMs = new Date() - new Date(isoStr);
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return new Date(isoStr).toLocaleDateString();
}

// --- Toast System UI ---
window.showToast = function(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconClass = 'info';
  if (type === 'success') iconClass = 'check-circle';
  else if (type === 'warning') iconClass = 'alert-triangle';
  else if (type === 'error') iconClass = 'x-circle';

  toast.innerHTML = `
    <i data-lucide="${iconClass}"></i>
    <span>${message}</span>
    <span class="toast-close" onclick="this.parentElement.remove()">&times;</span>
  `;

  container.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();

  // Slide out and remove after 4 seconds
  setTimeout(() => {
    toast.style.animation = 'slideInRight var(--transition-normal) reverse forwards';
    toast.addEventListener('animationend', () => toast.remove());
  }, 4000);
};

// --- Background Activity Simulator ---
// Periodically creates updates from other team members to give a "real-time" experience
function startActivitySimulator() {
  const events = [
    {
      role: 'employee',
      trigger: () => {
        // Jessica updates task TSK-101
        const task = window.db.getTaskById('TSK-101');
        if (task && task.status !== 'Completed') {
          const randProgress = Math.min(task.progress + 5, 95);
          window.db.updateTaskStatus('TSK-101', 'In Progress', randProgress, {
            comment: 'Adjusted color contrast spacing on widgets to fit dark theme styles.'
          });
        }
      }
    },
    {
      role: 'employee',
      trigger: () => {
        // Alex reports in progress DB optimization
        const task = window.db.getTaskById('TSK-105');
        if (task && task.status !== 'Completed') {
          const randProgress = Math.min(task.progress + 10, 95);
          window.db.updateTaskStatus('TSK-105', 'In Progress', randProgress, {
            comment: 'Added compound indexes on users and logs tables. Query lookup times dropped by 40%.'
          });
        }
      }
    },
    {
      role: 'employee',
      trigger: () => {
        // Sophia completes feedback UI survey
        const task = window.db.getTaskById('TSK-106');
        if (task && task.status === 'Not Started') {
          window.db.updateTaskStatus('TSK-106', 'In Progress', 25, {
            comment: 'Started building UI forms and setting up response telemetry.'
          });
        }
      }
    }
  ];

  // Run a random action every 60 seconds
  setInterval(() => {
    if (!window.currentUser) return;
    
    // Choose simulator event
    const randEvent = events[Math.floor(Math.random() * events.length)];
    
    // Check role to ensure logical simulator updates (e.g. employees see teammate updates, managers see reviews)
    randEvent.trigger();
    
    // Redraw views reactively depending on current screen
    if (window.currentView === 'dashboard' || window.currentView === 'work') {
      switchView(window.currentView);
    }
  }, 60000);
}
