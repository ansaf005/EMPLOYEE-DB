/**
 * Employee Management Dashboard - Manager Component
 * Implements rendering, event handlers, and data logic for the Manager dashboard.
 */

window.ManagerComponent = {
  // --- Dashboard Rendering ---
  renderDashboard() {
    const tasks = window.db.getTasks();
    const employees = window.db.getEmployees();
    const todayLogs = window.db.getAttendanceToday();
    const activeTasks = tasks.filter(t => t.status !== 'Completed').length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const pendingReview = tasks.filter(t => t.status === 'Under Review').length;
    
    // Attendance rate today
    const attendancePct = employees.length > 0 
      ? Math.round((todayLogs.length / (employees.length - 1)) * 100) // subtract 1 for manager
      : 100;

    return `
      <!-- KPI Cards Grid -->
      <div class="kpi-grid">
        <div class="glass-panel kpi-card">
          <div class="kpi-left">
            <span class="kpi-label">Total Employees</span>
            <span class="kpi-value">${employees.length - 1}</span>
            <span class="kpi-desc"><i data-lucide="users" style="width:12px;height:12px;"></i> Across 4 Departments</span>
          </div>
          <div class="kpi-icon-box kpi-indigo">
            <i data-lucide="users"></i>
          </div>
        </div>

        <div class="glass-panel kpi-card">
          <div class="kpi-left">
            <span class="kpi-label">Active Tasks</span>
            <span class="kpi-value">${activeTasks}</span>
            <span class="kpi-desc"><i data-lucide="alert-circle" style="width:12px;height:12px;"></i> Assigned & In Progress</span>
          </div>
          <div class="kpi-icon-box kpi-cyan">
            <i data-lucide="briefcase"></i>
          </div>
        </div>

        <div class="glass-panel kpi-card">
          <div class="kpi-left">
            <span class="kpi-label">Pending Review</span>
            <span class="kpi-value">${pendingReview}</span>
            <span class="kpi-desc text-gradient"><i data-lucide="shield-alert" style="width:12px;height:12px;"></i> Verification needed</span>
          </div>
          <div class="kpi-icon-box kpi-amber">
            <i data-lucide="eye"></i>
          </div>
        </div>

        <div class="glass-panel kpi-card">
          <div class="kpi-left">
            <span class="kpi-label">Attendance Today</span>
            <span class="kpi-value">${attendancePct}%</span>
            <span class="kpi-desc ${attendancePct > 80 ? 'trend-up' : 'trend-down'}">
              <i data-lucide="${attendancePct > 80 ? 'trending-up' : 'trending-down'}" style="width:12px;height:12px;"></i> 
              ${todayLogs.length} Checked In
            </span>
          </div>
          <div class="kpi-icon-box kpi-emerald">
            <i data-lucide="check-square"></i>
          </div>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="charts-grid">
        <div class="glass-panel">
          <div class="table-header-row">
            <h3>Weekly Team Productivity</h3>
            <span style="font-size:0.75rem; color:var(--text-muted);">Completed Tasks Trend</span>
          </div>
          <div class="chart-wrapper">
            <canvas id="productivity-chart"></canvas>
          </div>
        </div>

        <div class="glass-panel">
          <div class="table-header-row">
            <h3>Task Allocations</h3>
          </div>
          <div class="chart-wrapper">
            <canvas id="status-chart"></canvas>
          </div>
        </div>
      </div>

      <!-- Quick Action Row / Bottom Grid -->
      <div style="display:grid; grid-template-columns:2fr 1.2fr; gap:1.25rem; margin-top:1.5rem;" class="charts-grid">
        <!-- Today Attendance Log -->
        <div class="glass-panel">
          <div class="table-header-row">
            <h3>Today's Attendance Status</h3>
            <button class="btn btn-secondary" style="padding:0.4rem 0.8rem; font-size:0.75rem;" onclick="window.switchView('attendance')">View All</button>
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Total Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${this.getTodayAttendanceHTML(todayLogs, employees)}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Recent Audit Activity Logs -->
        <div class="glass-panel" style="max-height: 400px; display:flex; flex-direction:column;">
          <div class="table-header-row">
            <h3>Team Activities</h3>
            <button onclick="window.switchView('logs')" style="font-size:0.75rem; color:var(--accent-primary); font-weight:600;">Full Audit</button>
          </div>
          <div style="flex:1; overflow-y:auto; padding-right:0.5rem; display:flex; flex-direction:column; gap:0.85rem;" id="recent-logs-list">
            ${this.getRecentActivitiesHTML()}
          </div>
        </div>
      </div>
    `;
  },

  initDashboard() {
    this.renderCharts();
  },

  renderCharts() {
    const pCanvas = document.getElementById('productivity-chart');
    const sCanvas = document.getElementById('status-chart');
    if (!pCanvas || !sCanvas) return;

    // Fetch theme-sensitive colors
    const rootStyles = getComputedStyle(document.documentElement);
    const textColor = rootStyles.getPropertyValue('--text-secondary').trim();
    const borderColor = rootStyles.getPropertyValue('--border-color').trim();
    const accentPrimary = rootStyles.getPropertyValue('--accent-primary').trim();
    const accentSecondary = rootStyles.getPropertyValue('--accent-secondary').trim();

    // Data sets
    const productivity = window.db.getTeamProductivityData();
    const summary = window.db.getTaskStatusSummary();

    // Destroy existing charts to reload styling
    if (window.weeklyProdChart) window.weeklyProdChart.destroy();
    if (window.taskStatChart) window.taskStatChart.destroy();

    // Line Chart
    window.weeklyProdChart = new Chart(pCanvas, {
      type: 'line',
      data: {
        labels: productivity.labels,
        datasets: [
          {
            label: 'Completed Tasks',
            data: productivity.completedData,
            borderColor: accentPrimary,
            backgroundColor: 'rgba(79, 70, 229, 0.05)',
            tension: 0.4,
            fill: true,
            borderWidth: 2.5
          },
          {
            label: 'Team Efficiency %',
            data: productivity.efficiencyRate,
            borderColor: accentSecondary,
            backgroundColor: 'transparent',
            tension: 0.4,
            borderWidth: 2,
            borderDash: [5, 5]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: textColor, font: { family: 'Inter', size: 11 } }
          }
        },
        scales: {
          x: { grid: { color: borderColor }, ticks: { color: textColor } },
          y: { grid: { color: borderColor }, ticks: { color: textColor } }
        }
      }
    });

    // Doughnut Chart
    window.taskStatChart = new Chart(sCanvas, {
      type: 'doughnut',
      data: {
        labels: ['Not Started', 'In Progress', 'Under Review', 'Completed'],
        datasets: [{
          data: [summary.notStarted, summary.inProgress, summary.underReview, summary.completed],
          backgroundColor: [
            'rgba(148, 163, 184, 0.75)', // Slate
            'rgba(14, 165, 233, 0.75)',  // Cyan
            'rgba(139, 92, 246, 0.75)',  // Purple
            'rgba(16, 185, 129, 0.75)'   // Emerald
          ],
          borderWidth: 1.5,
          borderColor: borderColor
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: textColor, font: { family: 'Inter', size: 10 } }
          }
        }
      }
    });
  },

  getTodayAttendanceHTML(logs, employees) {
    // Only employees
    const staff = employees.filter(e => e.role === 'employee');
    
    if (staff.length === 0) return `<tr><td colspan="5" style="text-align:center;">No employees found.</td></tr>`;
    
    return staff.map(emp => {
      const log = logs.find(l => l.employeeId === emp.id);
      if (!log) {
        return `
          <tr>
            <td>
              <div class="emp-table-profile">
                <div class="avatar" style="background:#64748b; width:30px; height:30px; font-size:0.75rem;">${emp.avatar}</div>
                <span class="emp-table-name">${emp.name}</span>
              </div>
            </td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td><span class="badge badge-low"><span class="badge-dot"></span>Absent</span></td>
          </tr>
        `;
      }

      let statusClass = 'badge-completed';
      if (log.status === 'Late') statusClass = 'badge-high';

      return `
        <tr>
          <td>
            <div class="emp-table-profile">
              <div class="avatar" style="width:30px; height:30px; font-size:0.75rem;">${emp.avatar}</div>
              <span class="emp-table-name">${emp.name}</span>
            </div>
          </td>
          <td>${log.clockIn}</td>
          <td>${log.clockOut || '<span style="color:var(--text-muted); font-style:italic;">Active</span>'}</td>
          <td>${log.hoursWorked !== null ? log.hoursWorked + ' hrs' : '-'}</td>
          <td><span class="badge ${statusClass}"><span class="badge-dot"></span>${log.status}</span></td>
        </tr>
      `;
    }).join('');
  },

  getRecentActivitiesHTML() {
    const logs = window.db.getActivityLogs().slice(0, 5);
    if (logs.length === 0) return `<div class="notif-empty">No activity logs recorded.</div>`;

    return logs.map(l => `
      <div style="display:flex; gap:0.65rem; align-items:flex-start; font-size:0.8rem; border-bottom:1px solid var(--border-color); padding-bottom:0.5rem;">
        <div class="avatar" style="width:28px; height:28px; font-size:0.7rem; background: ${l.role === 'manager' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)'}">${l.user.split(' ').map(n=>n[0]).join('')}</div>
        <div style="flex:1;">
          <span style="font-weight:600; color:var(--text-primary);">${l.user}</span> 
          <span style="color:var(--text-secondary);">${l.action}</span>
          <div style="font-size:0.675rem; color:var(--text-muted); margin-top:0.15rem;">${new Date(l.timestamp).toLocaleTimeString()}</div>
        </div>
      </div>
    `).join('');
  },

  // --- Work Module Rendering ---
  renderWorkModule() {
    const employees = window.db.getEmployees().filter(e => e.role === 'employee');
    return `
      <div class="tasks-toolbar">
        <div class="tasks-filters">
          <select id="filter-priority" class="form-control" style="width: 140px; padding: 0.5rem;" onchange="window.ManagerComponent.applyFilters()">
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <select id="filter-status" class="form-control" style="width: 140px; padding: 0.5rem;" onchange="window.ManagerComponent.applyFilters()">
            <option value="">All Statuses</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Under Review">Under Review</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        
        <button class="btn btn-primary" onclick="window.ManagerComponent.openAddTaskModal()">
          <i data-lucide="plus"></i> Assign New Task
        </button>
      </div>

      <div class="tasks-grid" id="manager-tasks-grid">
        <!-- Dynamic Task Cards -->
      </div>
    `;
  },

  initWorkModule() {
    this.applyFilters();
  },

  applyFilters() {
    const priority = document.getElementById('filter-priority')?.value || '';
    const status = document.getElementById('filter-status')?.value || '';
    this.filterTasks('', priority, status);
  },

  filterTasks(query = '', priority = '', status = '') {
    const tasks = window.db.getTasks();
    const employees = window.db.getEmployees();
    const grid = document.getElementById('manager-tasks-grid');
    if (!grid) return;

    // Filter logic
    const filtered = tasks.filter(t => {
      const matchQuery = t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query);
      const matchPriority = priority === '' || t.priority === priority;
      const matchStatus = status === '' || t.status === status;
      return matchQuery && matchPriority && matchStatus;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding:3rem; color:var(--text-muted);">
          <i data-lucide="search" style="width:40px; height:40px; margin-bottom:1rem;"></i>
          <p>No matching tasks found.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    grid.innerHTML = filtered.map(t => {
      const emp = employees.find(e => e.id === t.assignedTo);
      const isOverdue = new Date(t.deadline) < new Date() && t.status !== 'Completed';

      let priorityClass = `badge-${t.priority}`;
      let statusClass = `badge-${t.status.replace(/\s+/g, '').toLowerCase()}`;

      return `
        <div class="glass-panel task-card" style="position:relative;">
          <div>
            <div class="task-card-header">
              <span class="badge ${priorityClass}"><span class="badge-dot"></span>${t.priority}</span>
              <span class="badge ${statusClass}">${t.status}</span>
            </div>
            
            <h4 class="task-card-title" onclick="window.ManagerComponent.openTaskDetailModal('${t.id}')">${t.title}</h4>
            <p class="task-card-desc">${t.description}</p>
          </div>

          <div>
            <div class="task-progress-box">
              <div style="display:flex; justify-content:space-between; font-size:0.75rem; font-weight:600;">
                <span>Completion</span>
                <span>${t.progress}%</span>
              </div>
              <div class="progress-bar-wrapper">
                <div class="progress-bar-fill" style="width:${t.progress}%"></div>
              </div>
            </div>

            <div class="task-card-footer">
              <div class="task-assignee">
                <div class="avatar" style="width:24px; height:24px; font-size:0.65rem;">${emp ? emp.avatar : '??'}</div>
                <span>${emp ? emp.name : 'Unassigned'}</span>
              </div>
              <div class="task-due ${isOverdue ? 'overdue' : ''}">
                <i data-lucide="calendar" style="width:12px; height:12px;"></i>
                <span>${t.deadline}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  openAddTaskModal() {
    const employees = window.db.getEmployees().filter(e => e.role === 'employee');
    const bodyHtml = `
      <form id="add-task-form">
        <div class="form-group">
          <label class="form-label">Task Title</label>
          <input type="text" id="new-task-title" class="form-control" placeholder="E.g., Integrate Payment API" required>
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea id="new-task-desc" class="form-control" placeholder="Detailed assignment instructions..." required></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Assign To</label>
          <select id="new-task-assignee" class="form-control" required>
            ${employees.map(e => `<option value="${e.id}">${e.name} (${e.department})</option>`).join('')}
          </select>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
          <div class="form-group">
            <label class="form-label">Priority</label>
            <select id="new-task-priority" class="form-control" required>
              <option value="low">Low</option>
              <option value="medium" selected>Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Deadline</label>
            <input type="date" id="new-task-deadline" class="form-control" value="${new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]}" required>
          </div>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="window.ManagerComponent.submitNewTask()">Assign Task</button>
    `;

    window.openModal('Create & Assign Task', bodyHtml, footerHtml);
  },

  submitNewTask() {
    const form = document.getElementById('add-task-form');
    if (!form.reportValidity()) return;

    const title = document.getElementById('new-task-title').value;
    const description = document.getElementById('new-task-desc').value;
    const assignedTo = document.getElementById('new-task-assignee').value;
    const priority = document.getElementById('new-task-priority').value;
    const deadline = document.getElementById('new-task-deadline').value;

    window.db.createTask({
      title,
      description,
      assignedTo,
      priority,
      deadline,
      assignedBy: window.currentUser.id
    });

    window.closeModal();
    window.showToast('Task assigned successfully', 'success');
    this.applyFilters(); // refresh tasks board
  },

  openTaskDetailModal(id) {
    const task = window.db.getTaskById(id);
    if (!task) return;

    const employees = window.db.getEmployees().filter(e => e.role === 'employee');
    const assignee = employees.find(e => e.id === task.assignedTo);
    
    let priorityClass = `badge-${task.priority}`;
    let statusClass = `badge-${task.status.replace(/\s+/g, '').toLowerCase()}`;

    const bodyHtml = `
      <div class="task-detail-block">
        <div class="task-meta-row">
          <div class="task-meta-item">
            <span class="task-meta-label">Priority</span>
            <span class="badge ${priorityClass}"><span class="badge-dot"></span>${task.priority}</span>
          </div>
          <div class="task-meta-item">
            <span class="task-meta-label">Status</span>
            <span class="badge ${statusClass}">${task.status}</span>
          </div>
          <div class="task-meta-item">
            <span class="task-meta-label">Deadline</span>
            <span class="task-meta-val">${task.deadline}</span>
          </div>
          <div class="task-meta-item">
            <span class="task-meta-label">Progress</span>
            <span class="task-meta-val">${task.progress}%</span>
          </div>
        </div>

        <div>
          <h4 style="font-size:0.9rem; margin-bottom:0.35rem; color:var(--text-secondary);">Task Description</h4>
          <p style="font-size:0.85rem; line-height:1.5; color:var(--text-primary); white-space:pre-line;">${task.description}</p>
        </div>

        <div style="border-top:1px solid var(--border-color); padding-top:1rem;">
          <h4 style="font-size:0.9rem; margin-bottom:0.5rem; color:var(--text-secondary);">Reassign Teammate</h4>
          <div style="display:flex; gap:0.5rem;">
            <select id="reassign-select" class="form-control" style="padding:0.45rem 0.75rem; font-size:0.85rem; max-width:260px;">
              ${employees.map(e => `<option value="${e.id}" ${e.id === task.assignedTo ? 'selected' : ''}>${e.name} (${e.department})</option>`).join('')}
            </select>
            <button class="btn btn-secondary" style="padding:0.5rem 1rem;" onclick="window.ManagerComponent.reassignTask('${task.id}')">Reassign</button>
          </div>
        </div>

        <div class="comments-section">
          <h4 style="font-size:0.9rem; color:var(--text-secondary);"><i data-lucide="message-square" style="width:14px; height:14px; display:inline; vertical-align:middle; margin-right:3px;"></i> Disussion Feed (${task.comments.length})</h4>
          <div class="comments-list">
            ${task.comments.map(c => `
              <div class="comment-item">
                <div class="comment-header">
                  <span class="comment-author">${c.authorName} <span style="font-weight:400; font-size:0.7rem; color:var(--text-muted);">(${c.authorRole})</span></span>
                  <span class="comment-date">${new Date(c.timestamp).toLocaleString()}</span>
                </div>
                <div class="comment-body">${c.text}</div>
              </div>
            `).join('')}
          </div>
          <div class="comment-input-box">
            <input type="text" id="task-comment-input" class="form-control" style="padding:0.5rem 0.85rem;" placeholder="Add comments here...">
            <button class="btn btn-primary" onclick="window.ManagerComponent.submitComment('${task.id}')">Send</button>
          </div>
        </div>
      </div>
    `;

    window.openModal(`Task Detail: ${task.id}`, bodyHtml);
  },

  submitComment(taskId) {
    const input = document.getElementById('task-comment-input');
    if (!input || input.value.trim() === '') return;

    window.db.addComment(taskId, window.currentUser.id, input.value.trim());
    input.value = '';
    
    // Rerender Modal Content
    this.openTaskDetailModal(taskId);
    showToast('Comment posted', 'success');
  },

  reassignTask(taskId) {
    const select = document.getElementById('reassign-select');
    if (!select) return;

    window.db.reassignTask(taskId, select.value, window.currentUser.id);
    window.closeModal();
    showToast('Task reassigned successfully', 'success');
    this.applyFilters();
  },

  // --- Time & Attendance Tracking Rendering ---
  renderAttendance() {
    const employees = window.db.getEmployees().filter(e => e.role === 'employee');
    const attendance = window.db.getAttendanceReport();

    return `
      <div class="glass-panel" style="margin-bottom:1.5rem;">
        <div class="table-header-row">
          <h3>Employee Attendance Summaries</h3>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Teammate</th>
                <th>Department</th>
                <th>Days Clocked</th>
                <th>Late Arrivals</th>
                <th>Total Hours</th>
                <th>Avg Daily Hours</th>
              </tr>
            </thead>
            <tbody>
              ${attendance.map(a => `
                <tr>
                  <td>
                    <div class="emp-table-profile">
                      <div class="avatar" style="width:28px; height:28px; font-size:0.75rem;">${a.name.split(' ').map(n=>n[0]).join('')}</div>
                      <span class="emp-table-name">${a.name}</span>
                    </div>
                  </td>
                  <td>${a.department}</td>
                  <td>${a.daysWorked} days</td>
                  <td><span class="badge ${a.lateArrivals > 0 ? 'badge-high' : 'badge-completed'}">${a.lateArrivals} late</span></td>
                  <td>${a.totalHours} hrs</td>
                  <td>${a.avgHours} hrs/day</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Master Daily History log -->
      <div class="glass-panel">
        <div class="table-header-row">
          <h3>Historical Attendance Records</h3>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Teammate</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Worked Hours</th>
                <th>Punctuality</th>
              </tr>
            </thead>
            <tbody id="attendance-table-body">
              ${window.db.data.attendance.slice().reverse().map(l => {
                const emp = employees.find(e => e.id === l.employeeId);
                if (!emp) return '';
                return `
                  <tr>
                    <td>${l.date}</td>
                    <td>
                      <div class="emp-table-profile">
                        <div class="avatar" style="width:24px; height:24px; font-size:0.65rem;">${emp.avatar}</div>
                        <span class="emp-table-name">${emp.name}</span>
                      </div>
                    </td>
                    <td>${l.clockIn}</td>
                    <td>${l.clockOut || '<span style="color:var(--status-success); font-style:italic;">Punch Active</span>'}</td>
                    <td>${l.hoursWorked !== null ? l.hoursWorked + ' hrs' : '-'}</td>
                    <td><span class="badge ${l.status === 'Late' ? 'badge-high' : 'badge-completed'}">${l.status}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // --- Reports Rendering & Exporting ---
  renderReports() {
    return `
      <div class="glass-panel" style="text-align:center; padding: 3rem 1.5rem; max-width:800px; margin: 0 auto;">
        <i data-lucide="bar-chart-3" style="width:56px; height:56px; color:var(--accent-primary); margin-bottom:1.5rem;"></i>
        
        <h2 style="font-size:1.5rem; margin-bottom:0.75rem;">Company Productivity & Performance Reports</h2>
        <p style="color:var(--text-secondary); max-width:550px; margin: 0 auto 2.5rem; font-size:0.9rem;">
          Generate structured document files for tasks velocity, monthly hours tracking, late arrivals metrics, and department breakdowns. Export in Excel sheets or formatted PDFs.
        </p>

        <!-- Hidden canvas for chart capture -->
        <div style="display:none;">
          <canvas id="hidden-prod-canvas" width="600" height="300"></canvas>
        </div>

        <div style="display:flex; justify-content:center; gap:1.25rem; flex-wrap:wrap;">
          <button class="btn btn-primary" onclick="window.ManagerComponent.exportPDF()" style="padding:0.75rem 1.75rem; font-size:0.95rem;">
            <i data-lucide="file-text"></i> Export Productivity Summary (PDF)
          </button>
          
          <button class="btn btn-secondary" onclick="window.ManagerComponent.exportExcel()" style="padding:0.75rem 1.75rem; font-size:0.95rem;">
            <i data-lucide="download"></i> Export Master Database (Excel)
          </button>
        </div>
      </div>
    `;
  },

  initReports() {
    // Generate simple reports logic
  },

  exportExcel() {
    try {
      const dbData = window.db.data;

      // Sheet 1: Tasks
      const tasksWS = XLSX.utils.json_to_sheet(dbData.tasks.map(t => ({
        ID: t.id,
        Title: t.title,
        AssigneeID: t.assignedTo,
        Deadline: t.deadline,
        Priority: t.priority,
        Status: t.status,
        Progress: t.progress,
        CommentsCount: t.comments.length,
        AttachmentsCount: t.attachments.length
      })));

      // Sheet 2: Attendance
      const attendanceWS = XLSX.utils.json_to_sheet(dbData.attendance.map(a => ({
        ID: a.id,
        EmployeeID: a.employeeId,
        Date: a.date,
        ClockIn: a.clockIn,
        ClockOut: a.clockOut || 'Active',
        HoursWorked: a.hoursWorked || 0,
        Status: a.status
      })));

      // Sheet 3: Logs
      const logsWS = XLSX.utils.json_to_sheet(dbData.activityLog.map(l => ({
        Timestamp: l.timestamp,
        User: l.user,
        Role: l.role,
        Action: l.action
      })));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, tasksWS, "Tasks Board");
      XLSX.utils.book_append_sheet(wb, attendanceWS, "Attendance Logs");
      XLSX.utils.book_append_sheet(wb, logsWS, "Activity Audit");

      XLSX.writeFile(wb, "EmpPulse_Performance_Report.xlsx");
      showToast('Master Excel report exported successfully', 'success');
      window.db.logActivity('Exported performance report as Excel', window.currentUser.name, 'manager');
    } catch (e) {
      console.error(e);
      showToast('Excel generation failed', 'error');
    }
  },

  exportPDF() {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      const dbData = window.db.data;

      // Title Card
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(22);
      doc.text("EmpPulse Performance & Productivity Report", 14, 25);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString()} | Manager: ${window.currentUser.name}`, 14, 32);
      
      // Divider
      doc.setDrawColor(220);
      doc.line(14, 37, 196, 37);

      // Section 1: Dashboard Stats Summary
      doc.setFontSize(14);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(0);
      doc.text("1. Overall Project KPI Metrics", 14, 47);

      const tasks = dbData.tasks;
      const completed = tasks.filter(t => t.status === 'Completed').length;
      const total = tasks.length;
      const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

      doc.setFontSize(11);
      doc.setFont("Helvetica", "normal");
      doc.text(`* Total Projects Tracked: ${total}`, 18, 56);
      doc.text(`* Completed Tasks: ${completed}`, 18, 62);
      doc.text(`* Overall Completion Rate: ${completionPct}%`, 18, 68);
      doc.text(`* Checked-In Active Staff Today: ${window.db.getAttendanceToday().length} employees`, 18, 74);

      // Section 2: Tasks List
      doc.setFontSize(14);
      doc.setFont("Helvetica", "bold");
      doc.text("2. Active Task Board Listing", 14, 88);

      let yPos = 97;
      tasks.forEach((t, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 25;
        }
        
        doc.setFontSize(10);
        doc.setFont("Helvetica", "bold");
        doc.text(`${index + 1}. [${t.id}] ${t.title}`, 18, yPos);
        
        doc.setFont("Helvetica", "normal");
        doc.text(`Deadline: ${t.deadline} | Status: ${t.status} (${t.progress}%) | Priority: ${t.priority.toUpperCase()}`, 22, yPos + 5);
        yPos += 14;
      });

      doc.save("EmpPulse_Productivity_Report.pdf");
      showToast('PDF report exported successfully', 'success');
      window.db.logActivity('Exported performance report as PDF', window.currentUser.name, 'manager');
    } catch (e) {
      console.error(e);
      showToast('PDF generation failed', 'error');
    }
  },

  // --- Audit Logs View Rendering ---
  renderLogs() {
    const logs = window.db.getActivityLogs();
    return `
      <div class="glass-panel">
        <div class="table-header-row">
          <h3>System Audit Trail</h3>
          <span style="font-size:0.75rem; color:var(--text-muted);">${logs.length} operations logged</span>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Operator</th>
                <th>Role</th>
                <th>Action details</th>
              </tr>
            </thead>
            <tbody id="logs-table-body">
              ${logs.map(l => `
                <tr>
                  <td>${new Date(l.timestamp).toLocaleString()}</td>
                  <td><span class="emp-table-name">${l.user}</span></td>
                  <td><span class="badge ${l.role === 'manager' ? 'badge-critical' : 'badge-low'}">${l.role}</span></td>
                  <td>${l.action}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
};
