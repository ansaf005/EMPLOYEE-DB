/**
 * Employee Management Dashboard - Employee Component
 * Implements rendering, event handlers, and data logic for the Employee workspace.
 */

window.EmployeeComponent = {
  // --- Dashboard Overview Rendering ---
  renderDashboard() {
    const tasks = window.db.getTasksForEmployee(window.currentUser.id);
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const pending = tasks.filter(t => t.status !== 'Completed').length;
    const notifs = window.db.getNotifications(window.currentUser.id);
    const clockRecord = window.db.getClockStatus(window.currentUser.id);
    
    // Attendance text/status
    let attStatus = 'Not Clocked In';
    let attClass = 'badge-low';
    if (clockRecord) {
      attStatus = clockRecord.status === 'Late' ? 'Late (Active)' : 'Clocked In';
      attClass = clockRecord.status === 'Late' ? 'badge-high' : 'badge-completed';
    }

    return `
      <!-- KPI Cards Grid -->
      <div class="kpi-grid">
        <div class="glass-panel kpi-card">
          <div class="kpi-left">
            <span class="kpi-label">Assigned Tasks</span>
            <span class="kpi-value">${tasks.length}</span>
            <span class="kpi-desc"><i data-lucide="folder" style="width:12px;height:12px;"></i> Total project scopes</span>
          </div>
          <div class="kpi-icon-box kpi-indigo">
            <i data-lucide="briefcase"></i>
          </div>
        </div>

        <div class="glass-panel kpi-card">
          <div class="kpi-left">
            <span class="kpi-label">Pending Review</span>
            <span class="kpi-value">${tasks.filter(t => t.status === 'Under Review').length}</span>
            <span class="kpi-desc"><i data-lucide="eye" style="width:12px;height:12px;"></i> Awaiting manager review</span>
          </div>
          <div class="kpi-icon-box kpi-amber">
            <i data-lucide="shield-alert"></i>
          </div>
        </div>

        <div class="glass-panel kpi-card">
          <div class="kpi-left">
            <span class="kpi-label">Completed Tasks</span>
            <span class="kpi-value">${completed}</span>
            <span class="kpi-desc text-gradient"><i data-lucide="check-circle" style="width:12px;height:12px;"></i> Successfully delivered</span>
          </div>
          <div class="kpi-icon-box kpi-emerald">
            <i data-lucide="check-square"></i>
          </div>
        </div>

        <div class="glass-panel kpi-card">
          <div class="kpi-left">
            <span class="kpi-label">Clock Status</span>
            <span class="kpi-value" style="font-size:1.35rem; margin: 0.2rem 0;" id="kpi-clock-val">${clockRecord ? 'Active' : 'Offline'}</span>
            <span class="badge ${attClass}" style="width: fit-content;"><span class="badge-dot"></span>${attStatus}</span>
          </div>
          <div class="kpi-icon-box kpi-cyan">
            <i data-lucide="clock"></i>
          </div>
        </div>
      </div>

      <!-- Main Columns Grid -->
      <div class="charts-grid">
        <!-- Analytics Graph -->
        <div class="glass-panel">
          <div class="table-header-row">
            <h3>My Weekly Work Analytics</h3>
            <span style="font-size:0.75rem; color:var(--text-muted);">Hours Logged Trends</span>
          </div>
          <div class="chart-wrapper">
            <canvas id="employee-weekly-chart"></canvas>
          </div>
        </div>

        <!-- Clock-in Quick Card -->
        <div class="glass-panel clock-widget">
          <div class="clock-glow-effect"></div>
          <h3 style="margin-bottom:1rem; position:relative; z-index:1;">Punctuality Control</h3>
          <div class="digital-clock" id="digital-clock-display">00:00:00</div>
          
          <div class="clock-status-tag">
            <span class="badge ${clockRecord ? 'badge-completed' : 'badge-low'}" id="clock-status-text">
              <span class="badge-dot"></span>${clockRecord ? 'Active Shift' : 'Punch Clock Out'}
            </span>
          </div>
          
          <div class="clock-button-ring ${clockRecord ? 'active' : ''}">
            <button class="btn-clock ${clockRecord ? 'btn-clock-out' : 'btn-clock-in'}" id="dashboard-clock-btn" onclick="window.EmployeeComponent.handleClockAction()">
              <i data-lucide="${clockRecord ? 'log-out' : 'log-in'}" style="width:24px; height:24px;"></i>
              <span>${clockRecord ? 'Clock Out' : 'Clock In'}</span>
            </button>
          </div>
          
          <div class="live-timer-row" id="live-hours-display">
            Today's Session: ${clockRecord ? 'Calculating...' : '0.00 hrs'}
          </div>
        </div>
      </div>

      <!-- Notifications & Comments List -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; margin-top:1.5rem;" class="charts-grid">
        <div class="glass-panel" style="max-height: 350px; display:flex; flex-direction:column;">
          <div class="table-header-row">
            <h3>My Recent Notifications</h3>
            <button onclick="window.markAllNotificationsAsRead()" style="font-size:0.75rem; color:var(--accent-primary); font-weight:600;">Clear All</button>
          </div>
          <div style="flex:1; overflow-y:auto; padding-right:0.5rem;" class="notif-list">
            ${notifs.slice(0, 5).map(n => `
              <div class="notif-item ${n.read ? '' : 'unread'}" style="border-bottom:1px solid var(--border-color); padding:0.75rem 0.5rem;">
                <div>${n.text}</div>
                <div class="notif-time" style="font-size:0.675rem; margin-top:0.2rem;">${new Date(n.timestamp).toLocaleDateString()} ${new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
              </div>
            `).join('') || '<div class="notif-empty">No alerts received.</div>'}
          </div>
        </div>

        <div class="glass-panel" style="max-height: 350px; display:flex; flex-direction:column;">
          <div class="table-header-row">
            <h3>Weekly Summary & Insights</h3>
          </div>
          <div style="flex:1; display:flex; flex-direction:column; gap:0.85rem; font-size:0.85rem; color:var(--text-secondary);">
            <div style="background-color:var(--bg-tertiary); padding:1rem; border-radius:var(--radius-md); border-left:4px solid var(--accent-primary);">
              <span style="font-weight:600; color:var(--text-primary); display:block; margin-bottom:0.25rem;">Performance Insight</span>
              Based on your tasks completed this week, your productivity index is at <strong>92%</strong>. Keep up the high delivery output!
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
              <div class="glass-panel" style="padding:0.75rem; text-align:center;">
                <span style="font-size:0.75rem; color:var(--text-muted); display:block;">Punctuality Index</span>
                <span style="font-size:1.25rem; font-weight:700; color:var(--status-success);">100% On Time</span>
              </div>
              <div class="glass-panel" style="padding:0.75rem; text-align:center;">
                <span style="font-size:0.75rem; color:var(--text-muted); display:block;">Completed Review Ratio</span>
                <span style="font-size:1.25rem; font-weight:700; color:var(--accent-secondary);">5:1 Deliveries</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  initDashboard() {
    this.renderCharts();
    this.startHoursTicker();
  },

  renderCharts() {
    const canvas = document.getElementById('employee-weekly-chart');
    if (!canvas) return;

    const rootStyles = getComputedStyle(document.documentElement);
    const textColor = rootStyles.getPropertyValue('--text-secondary').trim();
    const borderColor = rootStyles.getPropertyValue('--border-color').trim();
    const accentPrimary = rootStyles.getPropertyValue('--accent-primary').trim();

    // Fetch personal hours over past few days
    const attendance = window.db.getAttendanceForEmployee(window.currentUser.id);
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const hoursData = [8.0, 8.5, 9.0, 8.0, 0]; // default hours

    // Sync last 5 entries if available
    const lastLogs = attendance.slice(-5);
    lastLogs.forEach((log, index) => {
      if (index < 5) hoursData[index] = log.hoursWorked || 0;
    });

    if (window.employeeWeeklyChart) window.employeeWeeklyChart.destroy();

    window.employeeWeeklyChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Hours Worked',
          data: hoursData,
          backgroundColor: accentPrimary,
          borderRadius: 6,
          barThickness: 24
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor } },
          y: { grid: { color: borderColor }, ticks: { color: textColor }, min: 0, max: 12 }
        }
      }
    });
  },

  // --- Work Module Rendering ---
  renderWorkModule() {
    return `
      <div class="tasks-toolbar">
        <div class="tasks-filters">
          <select id="emp-filter-priority" class="form-control" style="width: 140px; padding: 0.5rem;" onchange="window.EmployeeComponent.applyFilters()">
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <select id="emp-filter-status" class="form-control" style="width: 140px; padding: 0.5rem;" onchange="window.EmployeeComponent.applyFilters()">
            <option value="">All Statuses</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Under Review">Under Review</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div class="tasks-grid" id="employee-tasks-grid">
        <!-- Dynamic Cards -->
      </div>
    `;
  },

  initWorkModule() {
    this.applyFilters();
  },

  applyFilters() {
    const priority = document.getElementById('emp-filter-priority')?.value || '';
    const status = document.getElementById('emp-filter-status')?.value || '';
    this.filterTasks('', priority, status);
  },

  filterTasks(query = '', priority = '', status = '') {
    const tasks = window.db.getTasksForEmployee(window.currentUser.id);
    const grid = document.getElementById('employee-tasks-grid');
    if (!grid) return;

    const filtered = tasks.filter(t => {
      const matchQuery = t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query);
      const matchPriority = priority === '' || t.priority === priority;
      const matchStatus = status === '' || t.status === status;
      return matchQuery && matchPriority && matchStatus;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding:3rem; color:var(--text-muted);">
          <i data-lucide="briefcase" style="width:40px; height:40px; margin-bottom:1rem;"></i>
          <p>No assigned tasks match your filters.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    grid.innerHTML = filtered.map(t => {
      const isOverdue = new Date(t.deadline) < new Date() && t.status !== 'Completed';
      let priorityClass = `badge-${t.priority}`;
      let statusClass = `badge-${t.status.replace(/\s+/g, '').toLowerCase()}`;

      return `
        <div class="glass-panel task-card">
          <div>
            <div class="task-card-header">
              <span class="badge ${priorityClass}"><span class="badge-dot"></span>${t.priority}</span>
              <span class="badge ${statusClass}">${t.status}</span>
            </div>
            
            <h4 class="task-card-title" onclick="window.EmployeeComponent.openUpdateProgressModal('${t.id}')">${t.title}</h4>
            <p class="task-card-desc">${t.description}</p>
          </div>

          <div>
            <div class="task-progress-box">
              <div style="display:flex; justify-content:space-between; font-size:0.75rem; font-weight:600;">
                <span>My Progress</span>
                <span>${t.progress}%</span>
              </div>
              <div class="progress-bar-wrapper">
                <div class="progress-bar-fill" style="width:${t.progress}%"></div>
              </div>
            </div>

            <div class="task-card-footer">
              <div class="task-due ${isOverdue ? 'overdue' : ''}">
                <i data-lucide="calendar" style="width:12px; height:12px;"></i>
                <span>Deadline: ${t.deadline}</span>
              </div>
              
              <div style="display:flex; gap:0.5rem; font-size:0.75rem; color:var(--text-muted);">
                <span><i data-lucide="message-square" style="width:12px; height:12px; display:inline; vertical-align:middle;"></i> ${t.comments.length}</span>
                <span><i data-lucide="paperclip" style="width:12px; height:12px; display:inline; vertical-align:middle;"></i> ${t.attachments.length}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  openUpdateProgressModal(id) {
    const task = window.db.getTaskById(id);
    if (!task) return;

    let priorityClass = `badge-${task.priority}`;
    let statusClass = `badge-${task.status.replace(/\s+/g, '').toLowerCase()}`;

    const bodyHtml = `
      <div class="task-detail-block">
        <!-- Metadata Header -->
        <div class="task-meta-row">
          <div class="task-meta-item">
            <span class="task-meta-label">Priority</span>
            <span class="badge ${priorityClass}"><span class="badge-dot"></span>${task.priority}</span>
          </div>
          <div class="task-meta-item">
            <span class="task-meta-label">Current Status</span>
            <span class="badge ${statusClass}">${task.status}</span>
          </div>
          <div class="task-meta-item">
            <span class="task-meta-label">Deadline</span>
            <span class="task-meta-val">${task.deadline}</span>
          </div>
        </div>

        <!-- Update Forms -->
        <form id="progress-update-form" style="background-color: var(--bg-tertiary); padding: 1.25rem; border-radius: var(--radius-md); border:1px solid var(--border-color);">
          <h4 style="font-size:0.9rem; margin-bottom:0.75rem; color:var(--text-primary);">Update Work Metrics</h4>
          
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
            <div class="form-group">
              <label class="form-label">Task Status</label>
              <select id="up-task-status" class="form-control" onchange="window.EmployeeComponent.syncProgressSlider(this.value)">
                <option value="Not Started" ${task.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                <option value="Under Review" ${task.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
                <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Progress Rate (${task.progress}%)</label>
              <div style="display:flex; align-items:center; gap:0.5rem; margin-top:0.35rem;">
                <input type="range" id="up-task-progress" min="0" max="100" value="${task.progress}" class="form-control" style="padding:0; height:6px;" oninput="document.getElementById('prog-val-lbl').innerText = this.value + '%'">
                <span id="prog-val-lbl" style="font-size:0.85rem; font-weight:600; width:40px;">${task.progress}%</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Update Activity Details</label>
            <input type="text" id="up-task-comment" class="form-control" placeholder="Describe what you completed in this session..." required>
          </div>

          <!-- File upload simulation -->
          <div class="form-group">
            <label class="form-label">Upload Deliverable / File</label>
            <div class="upload-dropzone" onclick="document.getElementById('task-file-input').click()">
              <i data-lucide="upload-cloud" style="width:24px; height:24px; margin-bottom:0.35rem; display:block; margin-left:auto; margin-right:auto;"></i>
              <span id="dropzone-text">Click to select work documents (PDF, ZIP, PNG)</span>
              <input type="file" id="task-file-input" style="display:none;" onchange="window.EmployeeComponent.handleMockFileUpload(event)">
            </div>
          </div>

          <button type="button" class="btn btn-primary" style="width:100%;" onclick="window.EmployeeComponent.submitProgress('${task.id}')">Submit Report Update</button>
        </form>

        <!-- Comments & Audit Feed -->
        <div class="comments-section" style="border-top:1px solid var(--border-color); padding-top:1rem;">
          <h4 style="font-size:0.9rem; color:var(--text-secondary);"><i data-lucide="message-square" style="width:14px; height:14px; display:inline; vertical-align:middle; margin-right:3px;"></i> Comments Log</h4>
          <div class="comments-list">
            ${task.comments.map(c => `
              <div class="comment-item">
                <div class="comment-header">
                  <span class="comment-author">${c.authorName} <span style="font-weight:400; font-size:0.7rem; color:var(--text-muted);">(${c.authorRole})</span></span>
                  <span class="comment-date">${new Date(c.timestamp).toLocaleString()}</span>
                </div>
                <div class="comment-body">${c.text}</div>
              </div>
            `).join('') || '<p style="font-size:0.8rem; color:var(--text-muted); text-align:center; padding:1rem;">No discussions logged yet.</p>'}
          </div>
          <div class="comment-input-box">
            <input type="text" id="task-comment-input" class="form-control" placeholder="Post feedback or query...">
            <button class="btn btn-primary" onclick="window.EmployeeComponent.submitComment('${task.id}')">Send</button>
          </div>
        </div>
      </div>
    `;

    window.openModal(`Update Progress: ${task.id}`, bodyHtml);
  },

  syncProgressSlider(statusVal) {
    const progressInput = document.getElementById('up-task-progress');
    const label = document.getElementById('prog-val-lbl');
    
    if (progressInput && label) {
      if (statusVal === 'Completed') {
        progressInput.value = 100;
        label.innerText = '100%';
      } else if (statusVal === 'Not Started') {
        progressInput.value = 0;
        label.innerText = '0%';
      } else if (statusVal === 'Under Review') {
        progressInput.value = 90;
        label.innerText = '90%';
      }
    }
  },

  handleMockFileUpload(e) {
    const file = e.target.files[0];
    const textSpan = document.getElementById('dropzone-text');
    if (file && textSpan) {
      textSpan.innerText = `Selected: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`;
      window.lastUploadedFile = {
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      };
      showToast('File selected', 'info');
    }
  },

  submitProgress(taskId) {
    const status = document.getElementById('up-task-status').value;
    const progress = document.getElementById('up-task-progress').value;
    const comment = document.getElementById('up-task-comment').value;

    if (!comment || comment.trim() === '') {
      showToast('Please describe your progress update', 'warning');
      return;
    }

    const updateDetails = {
      comment: comment
    };

    if (window.lastUploadedFile) {
      updateDetails.fileName = window.lastUploadedFile.name;
      updateDetails.fileSize = window.lastUploadedFile.size;
    }

    window.db.updateTaskStatus(taskId, status, progress, updateDetails);
    
    // reset mock file variable
    window.lastUploadedFile = null;

    window.closeModal();
    showToast('Progress update submitted', 'success');
    this.applyFilters(); // refresh tasks grid
  },

  submitComment(taskId) {
    const input = document.getElementById('task-comment-input');
    if (!input || input.value.trim() === '') return;

    window.db.addComment(taskId, window.currentUser.id, input.value.trim());
    input.value = '';
    
    this.openUpdateProgressModal(taskId);
    showToast('Comment posted', 'success');
  },

  // --- Timecard Module Rendering ---
  renderTimecard() {
    const clockRecord = window.db.getClockStatus(window.currentUser.id);
    const logs = window.db.getAttendanceForEmployee(window.currentUser.id);

    return `
      <div class="timecard-grid">
        <!-- Punch Card Control Panel -->
        <div class="glass-panel clock-widget">
          <div class="clock-glow-effect"></div>
          <div class="digital-clock" id="digital-clock-display">00:00:00</div>
          
          <div class="clock-status-tag">
            <span class="badge ${clockRecord ? 'badge-completed' : 'badge-low'}" id="tc-status-badge">
              <span class="badge-dot"></span>${clockRecord ? 'Active Shift' : 'Punch Clock Out'}
            </span>
          </div>

          <div class="clock-button-ring ${clockRecord ? 'active' : ''}">
            <button class="btn-clock ${clockRecord ? 'btn-clock-out' : 'btn-clock-in'}" id="tc-clock-btn" onclick="window.EmployeeComponent.handleClockAction()">
              <i data-lucide="${clockRecord ? 'log-out' : 'log-in'}" style="width:24px; height:24px;"></i>
              <span>${clockRecord ? 'Clock Out' : 'Clock In'}</span>
            </button>
          </div>

          <div class="live-timer-row" id="tc-live-hours">
            Today's Session: ${clockRecord ? 'Calculating...' : '0.00 hrs'}
          </div>

          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:1.25rem;">
            * Default shifts start at 09:00 AM. Access logs below for history.
          </div>
        </div>

        <!-- Attendance Logs table -->
        <div class="glass-panel" style="display:flex; flex-direction:column; justify-content:space-between;">
          <div class="table-header-row">
            <h3>Time Attendance Audit History</h3>
          </div>
          <div class="table-container" style="flex:1;">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Worked Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${logs.slice().reverse().map(l => `
                  <tr>
                    <td>${l.date}</td>
                    <td>${l.clockIn}</td>
                    <td>${l.clockOut || '<span style="color:var(--status-success); font-style:italic;">Active Session</span>'}</td>
                    <td>${l.hoursWorked !== null ? l.hoursWorked + ' hrs' : '-'}</td>
                    <td><span class="badge ${l.status === 'Late' ? 'badge-high' : 'badge-completed'}">${l.status}</span></td>
                  </tr>
                `).join('') || '<tr><td colspan="5" style="text-align:center;">No historical records found.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  initTimecard() {
    this.startHoursTicker();
  },

  handleClockAction() {
    const clockRecord = window.db.getClockStatus(window.currentUser.id);
    
    if (clockRecord) {
      // Clock out
      const res = window.db.clockOut(window.currentUser.id);
      if (res.success) {
        showToast(`Clock out successful. Worked: ${res.record.hoursWorked} hrs.`, 'success');
        this.stopHoursTicker();
      } else {
        showToast(res.message, 'error');
      }
    } else {
      // Clock in
      const res = window.db.clockIn(window.currentUser.id);
      if (res.success) {
        showToast(`Clock in successful at ${res.record.clockIn}. Status: ${res.record.status}`, 'success');
        this.startHoursTicker();
      } else {
        showToast(res.message, 'error');
      }
    }

    // Refresh view
    if (window.currentView === 'dashboard') {
      window.switchView('dashboard');
    } else if (window.currentView === 'timecard') {
      window.switchView('timecard');
    }
  },

  startHoursTicker() {
    this.stopHoursTicker(); // Clear any existing clock loop
    
    const record = window.db.getClockStatus(window.currentUser.id);
    if (!record) return;

    const [inH, inM, inS] = record.clockIn.split(':').map(Number);
    const inDate = new Date();
    inDate.setHours(inH, inM, inS);

    window.liveHoursInterval = setInterval(() => {
      const now = new Date();
      const diffMs = now - inDate;
      const hours = (diffMs / (1000 * 60 * 60));
      const hoursStr = `${hours.toFixed(2)} hrs`;

      const dashDisplay = document.getElementById('live-hours-display');
      const timecardDisplay = document.getElementById('tc-live-hours');
      
      if (dashDisplay) dashDisplay.innerText = `Today's Session: ${hoursStr}`;
      if (timecardDisplay) timecardDisplay.innerText = `Today's Session: ${hoursStr}`;
    }, 1000);
  },

  stopHoursTicker() {
    if (window.liveHoursInterval) {
      clearInterval(window.liveHoursInterval);
      window.liveHoursInterval = null;
    }
  }
};
