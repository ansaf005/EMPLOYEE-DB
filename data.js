/**
 * Employee Management Dashboard - Mock Database Engine
 * Handles schema definition, data persistence in localStorage, and CRUD helpers.
 */

const STORAGE_KEY = 'emp_dashboard_db';

// Simple password hashing for simulation (plain/simple comparison is fine, but let's make it look clean)
const DEFAULT_PASSWORD = 'password123';

const INITIAL_DATA = {
  employees: [
    {
      id: 'EMP001',
      name: 'Sarah Jenkins',
      email: 'sarah.j@company.com',
      password: DEFAULT_PASSWORD,
      role: 'manager',
      department: 'Operations',
      designation: 'Operations Director',
      status: 'active',
      avatar: 'SJ'
    },
    {
      id: 'EMP002',
      name: 'Alex Rivera',
      email: 'alex.r@company.com',
      password: DEFAULT_PASSWORD,
      role: 'employee',
      department: 'Engineering',
      designation: 'Senior Frontend Engineer',
      status: 'active',
      avatar: 'AR'
    },
    {
      id: 'EMP003',
      name: 'Jessica Chen',
      email: 'jessica.c@company.com',
      password: DEFAULT_PASSWORD,
      role: 'employee',
      department: 'Design',
      designation: 'Lead Product Designer',
      status: 'active',
      avatar: 'JC'
    },
    {
      id: 'EMP004',
      name: 'Marcus Vance',
      email: 'marcus.v@company.com',
      password: DEFAULT_PASSWORD,
      role: 'employee',
      department: 'Marketing',
      designation: 'Growth Marketing Manager',
      status: 'active',
      avatar: 'MV'
    },
    {
      id: 'EMP005',
      name: 'Sophia Patel',
      email: 'sophia.p@company.com',
      password: DEFAULT_PASSWORD,
      role: 'employee',
      department: 'Product',
      designation: 'Senior Product Manager',
      status: 'active',
      avatar: 'SP'
    }
  ],
  tasks: [
    {
      id: 'TSK-101',
      title: 'Revamp Homepage UX/UI Layout',
      description: 'Redesign the landing page to improve user engagement and conversion rate. Focus on implementing glassmorphic cards, cleaner grid layouts, and optimizing mobile responsiveness.',
      assignedTo: 'EMP003', // Jessica
      assignedBy: 'EMP001', // Sarah
      priority: 'high',
      deadline: '2026-06-12',
      status: 'In Progress',
      progress: 65,
      comments: [
        {
          id: 'c1',
          authorId: 'EMP001',
          authorName: 'Sarah Jenkins',
          authorRole: 'manager',
          text: 'Make sure to align with our new branding guidelines.',
          timestamp: '2026-06-03T09:30:00Z'
        },
        {
          id: 'c2',
          authorId: 'EMP003',
          authorName: 'Jessica Chen',
          authorRole: 'employee',
          text: 'I have uploaded the initial high-fidelity Figma links. Will start building code assets next.',
          timestamp: '2026-06-04T14:15:00Z'
        }
      ],
      attachments: [
        { name: 'figma_specs.pdf', size: '2.4 MB', uploadDate: '2026-06-03', url: '#' },
        { name: 'branding_palette.json', size: '12 KB', uploadDate: '2026-06-04', url: '#' }
      ]
    },
    {
      id: 'TSK-102',
      title: 'Implement JWT Authentication & RBAC',
      description: 'Integrate custom JWT tokens for securing employee endpoints. Ensure that role-based access control enforces restricted views for employee dashboards vs manager tools.',
      assignedTo: 'EMP002', // Alex
      assignedBy: 'EMP001', // Sarah
      priority: 'critical',
      deadline: '2026-06-07',
      status: 'Under Review',
      progress: 90,
      comments: [
        {
          id: 'c3',
          authorId: 'EMP002',
          authorName: 'Alex Rivera',
          authorRole: 'employee',
          text: 'Middleware is ready and fully tested. Ready for security audit and merge.',
          timestamp: '2026-06-04T17:45:00Z'
        }
      ],
      attachments: [
        { name: 'auth_architecture.png', size: '480 KB', uploadDate: '2026-06-04', url: '#' }
      ]
    },
    {
      id: 'TSK-103',
      title: 'Launch Q3 Growth Campaign',
      description: 'Plan, coordinate, and execute the Q3 advertising campaign across social networks. Target operations directors with a focus on product efficiency metrics.',
      assignedTo: 'EMP004', // Marcus
      assignedBy: 'EMP001', // Sarah
      priority: 'medium',
      deadline: '2026-06-25',
      status: 'Not Started',
      progress: 0,
      comments: [],
      attachments: []
    },
    {
      id: 'TSK-104',
      title: 'Draft Product Requirements (PRD) for v2.0',
      description: 'Gather feedback from client success teams and draft a comprehensive PRD covering mobile chat components, real-time presence indicators, and offline sync.',
      assignedTo: 'EMP005', // Sophia
      assignedBy: 'EMP001', // Sarah
      priority: 'low',
      deadline: '2026-06-02',
      status: 'Completed',
      progress: 100,
      comments: [
        {
          id: 'c4',
          authorId: 'EMP005',
          authorName: 'Sophia Patel',
          authorRole: 'employee',
          text: 'All sections completed and signed off by the lead architect.',
          timestamp: '2026-06-02T16:00:00Z'
        }
      ],
      attachments: [
        { name: 'PRD_Core_v2.docx', size: '1.2 MB', uploadDate: '2026-05-31', url: '#' }
      ]
    },
    {
      id: 'TSK-105',
      title: 'Optimize Core Database Queries',
      description: 'Analyze slow query logs. Introduce indexes on heavily joined tables and denormalize high-frequency metrics to reduce response latency.',
      assignedTo: 'EMP002', // Alex
      assignedBy: 'EMP001', // Sarah
      priority: 'high',
      deadline: '2026-06-15',
      status: 'In Progress',
      progress: 40,
      comments: [],
      attachments: []
    },
    {
      id: 'TSK-106',
      title: 'Revise Customer Feedback Survey UI',
      description: 'Develop simple survey panels for checkout screens to fetch client experience satisfaction index. Store logs in historical database tables.',
      assignedTo: 'EMP005', // Sophia
      assignedBy: 'EMP001', // Sarah
      priority: 'medium',
      deadline: '2026-06-10',
      status: 'Not Started',
      progress: 0,
      comments: [],
      attachments: []
    }
  ],
  attendance: [
    // Historical logs for the week
    { id: 'att_1', employeeId: 'EMP002', date: '2026-06-01', clockIn: '08:52:00', clockOut: '17:30:00', hoursWorked: 8.6, status: 'On Time' },
    { id: 'att_2', employeeId: 'EMP003', date: '2026-06-01', clockIn: '09:05:00', clockOut: '18:00:00', hoursWorked: 8.9, status: 'On Time' },
    { id: 'att_3', employeeId: 'EMP004', date: '2026-06-01', clockIn: '09:35:00', clockOut: '17:15:00', hoursWorked: 7.6, status: 'Late' },
    { id: 'att_4', employeeId: 'EMP005', date: '2026-06-01', clockIn: '08:45:00', clockOut: '17:00:00', hoursWorked: 8.25, status: 'On Time' },

    { id: 'att_5', employeeId: 'EMP002', date: '2026-06-02', clockIn: '08:58:00', clockOut: '17:45:00', hoursWorked: 8.78, status: 'On Time' },
    { id: 'att_6', employeeId: 'EMP003', date: '2026-06-02', clockIn: '09:02:00', clockOut: '17:50:00', hoursWorked: 8.8, status: 'On Time' },
    { id: 'att_7', employeeId: 'EMP004', date: '2026-06-02', clockIn: '09:42:00', clockOut: '17:40:00', hoursWorked: 7.96, status: 'Late' },
    { id: 'att_8', employeeId: 'EMP005', date: '2026-06-02', clockIn: '08:50:00', clockOut: '17:10:00', hoursWorked: 8.33, status: 'On Time' },

    { id: 'att_9', employeeId: 'EMP002', date: '2026-06-03', clockIn: '08:47:00', clockOut: '18:05:00', hoursWorked: 9.3, status: 'On Time' },
    { id: 'att_10', employeeId: 'EMP003', date: '2026-06-03', clockIn: '09:12:00', clockOut: '17:35:00', hoursWorked: 8.38, status: 'On Time' },
    { id: 'att_11', employeeId: 'EMP004', date: '2026-06-03', clockIn: '09:01:00', clockOut: '17:05:00', hoursWorked: 8.06, status: 'On Time' },
    { id: 'att_12', employeeId: 'EMP005', date: '2026-06-03', clockIn: '08:55:00', clockOut: '17:20:00', hoursWorked: 8.41, status: 'On Time' },

    { id: 'att_13', employeeId: 'EMP002', date: '2026-06-04', clockIn: '08:50:00', clockOut: '17:50:00', hoursWorked: 9.0, status: 'On Time' },
    { id: 'att_14', employeeId: 'EMP003', date: '2026-06-04', clockIn: '09:08:00', clockOut: '18:10:00', hoursWorked: 9.03, status: 'On Time' },
    { id: 'att_15', employeeId: 'EMP004', date: '2026-06-04', clockIn: '09:48:00', clockOut: '17:15:00', hoursWorked: 7.45, status: 'Late' },
    { id: 'att_16', employeeId: 'EMP005', date: '2026-06-04', clockIn: '08:40:00', clockOut: '17:15:00', hoursWorked: 8.58, status: 'On Time' }
  ],
  notifications: [
    { id: 'n1', employeeId: 'EMP002', text: 'Sarah Jenkins assigned a new task: "Optimize Core Database Queries".', timestamp: '2026-06-02T10:00:00Z', read: false },
    { id: 'n2', employeeId: 'EMP003', text: 'Sarah Jenkins assigned a new task: "Revamp Homepage UX/UI Layout".', timestamp: '2026-06-03T09:00:00Z', read: false },
    { id: 'n3', employeeId: 'EMP002', text: 'Manager commented on "Implement JWT Authentication & RBAC": "Middleware is ready..."', timestamp: '2026-06-04T17:45:00Z', read: false },
    { id: 'n4', employeeId: 'EMP001', text: 'Jessica Chen uploaded a new draft: "branding_palette.json"', timestamp: '2026-06-04T14:15:00Z', read: false }
  ],
  activityLog: [
    { id: 'l1', timestamp: '2026-06-04T17:45:00Z', action: 'Uploaded file auth_architecture.png and commented on task TSK-102', user: 'Alex Rivera', role: 'employee' },
    { id: 'l2', timestamp: '2026-06-04T14:15:00Z', action: 'Uploaded file branding_palette.json and commented on task TSK-101', user: 'Jessica Chen', role: 'employee' },
    { id: 'l3', timestamp: '2026-06-03T09:30:00Z', action: 'Commented on task TSK-101', user: 'Sarah Jenkins', role: 'manager' },
    { id: 'l4', timestamp: '2026-06-03T09:00:00Z', action: 'Assigned task TSK-101 to Jessica Chen', user: 'Sarah Jenkins', role: 'manager' }
  ]
};

// Database interface class
class Database {
  constructor() {
    this.init();
    this.initSupabase();
  }

  async initSupabase() {
    if (window.supabase) {
      try {
        const res = await fetch('/.env?t=' + Date.now());
        if (res.ok) {
          const text = await res.text();
          const config = {};
          text.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
              config[parts[0].trim()] = parts.slice(1).join('=').trim();
            }
          });
          const url = (config.VITE_SUPABASE_URL || config.SUPABASE_URL || 'https://nfxwhudqwezjgcisegez.supabase.co').replace(/\/rest\/v1\/?$/, '');
          const key = config.VITE_SUPABASE_ANON_KEY || config.SUPABASE_ANON_KEY || 'sb_publishable_6kCFq7bkASiKQ9gp8r0Uww_14FHfrQY';
          this.supabase = window.supabase.createClient(url, key);
          console.log("Supabase client initialized in legacy data.js");
        }
      } catch (e) {
        console.warn("Failed to initialize Supabase in legacy data.js", e);
      }
    }
  }

  init() {
    let data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
    } else {
      try {
        this.data = JSON.parse(data);
      } catch (e) {
        console.error("Database parsing failed, resetting to defaults", e);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
        this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
      }
    }
  }

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  reset() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
    this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
    return this.data;
  }

  // --- Authentication Helpers ---
  login(email, password) {
    const user = this.data.employees.find(e => e.email.toLowerCase() === email.toLowerCase().trim() && e.password === password);
    if (user) {
      // Return a copy without confidential password
      const userSession = { ...user };
      delete userSession.password;
      return { success: true, user: userSession, token: 'mock-jwt-' + btoa(user.id + ':' + Date.now()) };
    }
    return { success: false, message: 'Invalid email or password.' };
  }

  // --- Employee operations ---
  getEmployees() {
    return this.data.employees.map(e => {
      const copy = { ...e };
      delete copy.password;
      return copy;
    });
  }

  getEmployeeById(id) {
    const e = this.data.employees.find(x => x.id === id);
    if (e) {
      const copy = { ...e };
      delete copy.password;
      return copy;
    }
    return null;
  }

  updateProfile(id, name, email, department, designation, newPassword = null) {
    const idx = this.data.employees.findIndex(x => x.id === id);
    if (idx !== -1) {
      this.data.employees[idx].name = name;
      this.data.employees[idx].email = email;
      this.data.employees[idx].department = department;
      this.data.employees[idx].designation = designation;
      if (newPassword && newPassword.trim() !== '') {
        this.data.employees[idx].password = newPassword;
      }
      this.save();
      this.logActivity(`Updated profile details`, name, this.data.employees[idx].role);
      return { success: true, user: this.getEmployeeById(id) };
    }
    return { success: false, message: 'User not found' };
  }

  // --- Tasks operations ---
  getTasks() {
    return this.data.tasks;
  }

  getTaskById(id) {
    return this.data.tasks.find(t => t.id === id) || null;
  }

  getTasksForEmployee(empId) {
    return this.data.tasks.filter(t => t.assignedTo === empId);
  }

  createTask(taskData) {
    const newId = `TSK-${Math.floor(100 + Math.random() * 900)}`;
    const manager = this.getEmployeeById(taskData.assignedBy);
    const employee = this.getEmployeeById(taskData.assignedTo);

    const task = {
      id: newId,
      title: taskData.title,
      description: taskData.description,
      assignedTo: taskData.assignedTo,
      assignedBy: taskData.assignedBy,
      priority: taskData.priority,
      deadline: taskData.deadline,
      status: 'Not Started',
      progress: 0,
      comments: [],
      attachments: []
    };

    if (taskData.attachments && taskData.attachments.length) {
      task.attachments = taskData.attachments;
    }

    this.data.tasks.push(task);
    this.save();

    // Trigger Notification for the assigned employee
    this.createNotification(
      taskData.assignedTo,
      `${manager.name} assigned you a new task: "${task.title}".`
    );

    this.logActivity(`Assigned task ${newId} ("${task.title}") to ${employee.name}`, manager.name, 'manager');
    return task;
  }

  updateTaskStatus(taskId, status, progress, updateDetails = null) {
    const task = this.data.tasks.find(t => t.id === taskId);
    if (!task) return null;

    const oldStatus = task.status;
    task.status = status;
    task.progress = parseInt(progress, 10);

    const employee = this.getEmployeeById(task.assignedTo);

    if (updateDetails) {
      const timestamp = new Date().toISOString();
      const newComment = {
        id: `c_${Date.now()}`,
        authorId: employee.id,
        authorName: employee.name,
        authorRole: 'employee',
        text: `Progress Update (${progress}%): ${updateDetails.comment}`,
        timestamp: timestamp
      };
      task.comments.push(newComment);

      if (updateDetails.fileName) {
        task.attachments.push({
          name: updateDetails.fileName,
          size: updateDetails.fileSize || 'N/A',
          uploadDate: timestamp.split('T')[0],
          url: '#'
        });
      }
    }

    this.save();

    // Notify Manager when a task goes Under Review or Completed
    if (status === 'Under Review' || status === 'Completed') {
      this.createNotification(
        task.assignedBy,
        `${employee.name} updated task "${task.title}" to ${status}.`
      );
    }

    this.logActivity(`Updated task ${taskId} status to "${status}" (${progress}%)`, employee.name, 'employee');
    return task;
  }

  addComment(taskId, authorId, text) {
    const task = this.data.tasks.find(t => t.id === taskId);
    if (!task) return null;

    const author = this.getEmployeeById(authorId);
    const comment = {
      id: `c_${Date.now()}`,
      authorId: authorId,
      authorName: author.name,
      authorRole: author.role,
      text: text,
      timestamp: new Date().toISOString()
    };

    task.comments.push(comment);
    this.save();

    // Send notifications to the counterparty
    const targetId = author.role === 'manager' ? task.assignedTo : task.assignedBy;
    this.createNotification(
      targetId,
      `${author.name} commented on task "${task.title}": "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}"`
    );

    this.logActivity(`Commented on task ${taskId}`, author.name, author.role);
    return comment;
  }

  reassignTask(taskId, assignedTo, managerId) {
    const task = this.data.tasks.find(t => t.id === taskId);
    if (!task) return null;

    const oldEmployee = this.getEmployeeById(task.assignedTo);
    const newEmployee = this.getEmployeeById(assignedTo);
    const manager = this.getEmployeeById(managerId);

    task.assignedTo = assignedTo;
    this.save();

    // Notify old and new employee
    this.createNotification(
      oldEmployee.id,
      `Task "${task.title}" has been reassigned to another teammate.`
    );
    this.createNotification(
      newEmployee.id,
      `${manager.name} assigned you the task: "${task.title}".`
    );

    this.logActivity(`Reassigned task ${taskId} from ${oldEmployee.name} to ${newEmployee.name}`, manager.name, 'manager');
    return task;
  }

  // --- Attendance Clocking Operations ---
  getAttendanceForEmployee(empId) {
    return this.data.attendance.filter(a => a.employeeId === empId);
  }

  getAttendanceToday() {
    const today = new Date().toISOString().split('T')[0];
    return this.data.attendance.filter(a => a.date === today);
  }

  getClockStatus(empId) {
    const today = new Date().toISOString().split('T')[0];
    const log = this.data.attendance.find(a => a.employeeId === empId && a.date === today);
    return log ? log : null; // Returns attendance record if clocked in, else null
  }

  clockIn(empId) {
    const today = new Date().toISOString().split('T')[0];
    const existing = this.getClockStatus(empId);
    if (existing) return { success: false, message: 'Already clocked in today.' };

    const employee = this.getEmployeeById(empId);
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0]; // 'HH:MM:SS'

    // Determine late status (let's say 9:00 AM is late start)
    const [hours, minutes] = timeStr.split(':').map(Number);
    const isLate = (hours > 9) || (hours === 9 && minutes > 5); // grace of 5 mins
    const status = isLate ? 'Late' : 'On Time';

    const newAttendance = {
      id: `att_${Date.now()}`,
      employeeId: empId,
      date: today,
      clockIn: timeStr,
      clockOut: null,
      hoursWorked: 0,
      status: status
    };

    this.data.attendance.push(newAttendance);
    this.save();

    this.logActivity(`Clocked IN at ${timeStr} (${status})`, employee.name, employee.role);
    return { success: true, record: newAttendance };
  }

  clockOut(empId) {
    const today = new Date().toISOString().split('T')[0];
    const record = this.data.attendance.find(a => a.employeeId === empId && a.date === today && a.clockOut === null);
    if (!record) return { success: false, message: 'No active clock-in session found today.' };

    const employee = this.getEmployeeById(empId);
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0]; // 'HH:MM:SS'

    // Calculate hours worked
    const [inH, inM, inS] = record.clockIn.split(':').map(Number);
    const [outH, outM, outS] = timeStr.split(':').map(Number);

    const inDate = new Date(2000, 0, 1, inH, inM, inS);
    const outDate = new Date(2000, 0, 1, outH, outM, outS);
    const diffMs = outDate - inDate;
    const hours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

    record.clockOut = timeStr;
    record.hoursWorked = hours;
    this.save();

    this.logActivity(`Clocked OUT at ${timeStr} (${hours} hrs worked)`, employee.name, employee.role);
    return { success: true, record: record };
  }

  // --- Notifications Helper ---
  getNotifications(empId) {
    return this.data.notifications.filter(n => n.employeeId === empId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  createNotification(empId, text) {
    const newNotif = {
      id: `n_${Date.now()}`,
      employeeId: empId,
      text: text,
      timestamp: new Date().toISOString(),
      read: false
    };
    this.data.notifications.push(newNotif);
    this.save();

    // Trigger standard browser CustomEvent for reactive real-time update in UI
    const event = new CustomEvent('app-notification', { detail: newNotif });
    window.dispatchEvent(event);

    return newNotif;
  }

  markNotificationsAsRead(empId) {
    this.data.notifications.forEach(n => {
      if (n.employeeId === empId) n.read = true;
    });
    this.save();
  }

  // --- Activity Log Helper ---
  getActivityLogs() {
    return this.data.activityLog.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  logActivity(action, userName, role) {
    const log = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: action,
      user: userName,
      role: role
    };
    this.data.activityLog.push(log);
    // Keep max 50 log records
    if (this.data.activityLog.length > 50) {
      this.data.activityLog.shift();
    }
    this.save();

    const event = new CustomEvent('app-activity-logged', { detail: log });
    window.dispatchEvent(event);
  }

  // --- Productivity Reports & Analytics Helpers ---
  getTeamProductivityData() {
    // Return mock productivity over past 7 days: completed task trends
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    // We compute completion index based on actual completed tasks
    const activeTasks = this.getTasks();
    const completedTasks = activeTasks.filter(t => t.status === 'Completed');

    // Make realistic data
    return {
      labels: days,
      completedData: [4, 6, 8, 5, 10, 2, 1], // Completed mock tasks over the week
      efficiencyRate: [75, 80, 85, 78, 92, 88, 90] // Percentage efficiency
    };
  }

  getTaskStatusSummary() {
    const tasks = this.getTasks();
    const summary = {
      notStarted: 0,
      inProgress: 0,
      underReview: 0,
      completed: 0,
      total: tasks.length
    };

    tasks.forEach(t => {
      if (t.status === 'Not Started') summary.notStarted++;
      else if (t.status === 'In Progress') summary.inProgress++;
      else if (t.status === 'Under Review') summary.underReview++;
      else if (t.status === 'Completed') summary.completed++;
    });

    return summary;
  }

  getAttendanceReport() {
    // Generate monthly summaries of late arrivals, hours worked
    const employees = this.getEmployees();
    const attendance = this.data.attendance;

    return employees.map(emp => {
      const empLogs = attendance.filter(a => a.employeeId === emp.id);
      const totalHours = empLogs.reduce((sum, log) => sum + (log.hoursWorked || 0), 0);
      const daysWorked = empLogs.length;
      const lateArrivals = empLogs.filter(a => a.status === 'Late').length;
      const avgHours = daysWorked > 0 ? parseFloat((totalHours / daysWorked).toFixed(2)) : 0;

      return {
        id: emp.id,
        name: emp.name,
        department: emp.department,
        daysWorked,
        totalHours: parseFloat(totalHours.toFixed(1)),
        avgHours,
        lateArrivals
      };
    });
  }
}

// Global DB instance
window.db = new Database();
