import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

// Page Views
import { DashboardHome } from './components/DashboardHome';
import { EmployeeDir } from './components/EmployeeDir';
import { TasksProjects } from './components/TasksProjects';
import { ProgressTrack } from './components/ProgressTrack';
import { PerformanceAnal } from './components/PerformanceAnal';
import { DepartmentsOverview } from './components/DepartmentsOverview';
import { ReportsModule } from './components/ReportsModule';
import { NotificationHub } from './components/NotificationHub';
import { Settings } from './components/Settings';
import { Timecard } from './components/Timecard';

// Supabase client
import { supabase } from './data/supabaseClient';

// Mock DB Initial Sets
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_PROJECTS, 
  INITIAL_TASKS, 
  INITIAL_NOTIFICATIONS, 
  Employee, 
  Project, 
  Task, 
  Notification 
} from './data/mockData';

const App: React.FC = () => {
  // Navigation & Theme Views
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  // Authentication State
  const [session, setSession] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [authView, setAuthView] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [authError, setAuthError] = useState<string>('');
  const [authSuccess, setAuthSuccess] = useState<string>('');

  // Signup form state
  const [suName, setSuName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [suRole, setSuRole] = useState<'manager' | 'employee'>('employee');
  const [suDepartment, setSuDepartment] = useState('Development');
  const [suDesignation, setSuDesignation] = useState('Frontend Engineer');

  // Signin form state
  const [siEmail, setSiEmail] = useState('');
  const [siPassword, setSiPassword] = useState('');

  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState('');

  // Database State Variables
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Handle dark mode / light mode bootstrap
  useEffect(() => {
    const localTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = localTheme || (sysDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.className = initialTheme;

    // Check if offline mode was saved
    const savedOffline = localStorage.getItem('emp_react_offline');
    if (savedOffline === 'true') {
      setIsOfflineMode(true);
      const savedUser = localStorage.getItem('emp_react_current_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      } else {
        setCurrentUser(INITIAL_EMPLOYEES[0]); // default Sarah Jenkins
      }
    }
  }, []);

  // Listen to Supabase Auth State changes
  useEffect(() => {
    if (isOfflineMode) return;

    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session: activeSession } }) => {
      setSession(activeSession);
      if (activeSession) {
        fetchUserProfile(activeSession.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, activeSession) => {
      setSession(activeSession);
      if (activeSession) {
        fetchUserProfile(activeSession.user.id);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [isOfflineMode]);

  // Fetch User Profile from Profiles Table
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (data) {
        setCurrentUser(data);
      }
    } catch (err) {
      console.warn('Profile not found in database, creating profile metadata...', err);
      // Auto-provision profile from auth metadata
      const mockMeta = INITIAL_EMPLOYEES.find(e => e.email.toLowerCase() === session?.user?.email?.toLowerCase());
      const newProfile = {
        id: userId,
        name: mockMeta?.name || session?.user?.email?.split('@')[0] || 'Employee',
        email: session?.user?.email || '',
        role: (session?.user?.email?.toLowerCase().includes('sarah') || session?.user?.email?.toLowerCase().includes('admin')) ? 'manager' : 'employee',
        department: mockMeta?.department || 'Development',
        designation: mockMeta?.designation || 'Staff Associate',
        status: 'active',
        avatar: mockMeta?.photo || 'EM'
      };

      try {
        await supabase.from('profiles').insert(newProfile);
        setCurrentUser(newProfile);
      } catch (insertErr) {
        console.error('Failed to create fallback user profile:', insertErr);
        // Direct state fallback so review is not blocked
        setCurrentUser(newProfile);
      }
    }
  };

  // Sync state data (online or offline)
  useEffect(() => {
    if (isOfflineMode) {
      // Offline mode
      const savedEmployees = localStorage.getItem('emp_react_employees');
      const savedProjects = localStorage.getItem('emp_react_projects');
      const savedTasks = localStorage.getItem('emp_react_tasks');
      const savedNotifs = localStorage.getItem('emp_react_notifications');

      setEmployees(savedEmployees ? JSON.parse(savedEmployees) : INITIAL_EMPLOYEES);
      setProjects(savedProjects ? JSON.parse(savedProjects) : INITIAL_PROJECTS);
      setTasks(savedTasks ? JSON.parse(savedTasks) : INITIAL_TASKS);
      setNotifications(savedNotifs ? JSON.parse(savedNotifs) : INITIAL_NOTIFICATIONS);
    } else if (currentUser) {
      // Online Supabase Mode
      loadSupabaseData();
    }
  }, [currentUser, isOfflineMode]);

  const loadSupabaseData = async () => {
    try {
      // 1. Fetch profiles
      const { data: dbProfiles } = await supabase.from('profiles').select('*');
      if (dbProfiles) {
        setEmployees(dbProfiles.map(e => ({
          id: e.id,
          photo: e.avatar || e.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
          name: e.name,
          email: e.email,
          phone: '+1 (555) 234-5678',
          emergencyContact: 'Maria Rivera (Spouse)',
          address: '128 Pine St, SF',
          dob: '1992-04-15',
          joiningDate: '2023-03-01',
          designation: e.designation || 'Software Engineer',
          department: e.department || 'Development',
          level: (e.role === 'manager' ? 'Lead' : 'Mid') as any,
          assignedProjects: [],
          tasksCompleted: 10,
          currentProgress: 75,
          status: (e.status === 'active' ? 'Active' : 'Inactive') as any,
          reportingManager: 'Sarah Jenkins',
          skills: [],
          experience: '5 Years',
          salary: '$90,000',
          performanceRating: 4.5,
          productiveHours: 150,
          workingHours: 168,
          timeline: []
        })));
      }

      // 2. Fetch tasks
      let taskQuery = supabase.from('tasks').select('*');
      if (currentUser?.role === 'employee') {
        taskQuery = taskQuery.eq('assigned_to', currentUser.id);
      }
      const { data: dbTasks } = await taskQuery;
      if (dbTasks) {
        setTasks(dbTasks.map(t => ({
          id: t.id,
          name: t.title,
          assignedEmployee: t.assigned_to || '',
          dueDate: t.deadline,
          priority: t.priority as any,
          progress: t.progress || 0,
          notes: t.description || '',
          attachments: []
        })));
      }

      // 3. Projects list (maintained in local storage or falls back to initials)
      const savedProjects = localStorage.getItem('emp_react_projects');
      setProjects(savedProjects ? JSON.parse(savedProjects) : INITIAL_PROJECTS);

      // 4. Notifications
      const { data: dbNotifs } = await supabase
        .from('notifications')
        .select('*')
        .eq('employee_id', currentUser.id)
        .order('created_at', { ascending: false });
      if (dbNotifs) {
        setNotifications(dbNotifs.map(n => ({
          id: n.id,
          text: n.text,
          type: 'project',
          timestamp: n.created_at || new Date().toISOString(),
          read: n.read
        })));
      }
    } catch (err) {
      console.error('Failed to load Supabase records:', err);
    }
  };

  // Sync updates back to local storage in offline mode
  useEffect(() => {
    if (isOfflineMode && employees.length) {
      localStorage.setItem('emp_react_employees', JSON.stringify(employees));
    }
  }, [employees, isOfflineMode]);

  useEffect(() => {
    if (isOfflineMode && projects.length) {
      localStorage.setItem('emp_react_projects', JSON.stringify(projects));
    }
  }, [projects, isOfflineMode]);

  useEffect(() => {
    if (isOfflineMode && tasks.length) {
      localStorage.setItem('emp_react_tasks', JSON.stringify(tasks));
    }
  }, [tasks, isOfflineMode]);

  useEffect(() => {
    if (isOfflineMode && notifications.length) {
      localStorage.setItem('emp_react_notifications', JSON.stringify(notifications));
    }
  }, [notifications, isOfflineMode]);

  // --- Theme Swapper ---
  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.className = newTheme;
  };

  // --- Auth Handlers ---
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: siEmail,
        password: siPassword,
      });

      if (error) throw error;
    } catch (err: any) {
      setAuthError(err.message || 'Login failed. Please verify credentials.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email: suEmail,
        password: suPassword,
        options: {
          data: {
            name: suName,
            role: suRole,
            department: suDepartment,
            designation: suDesignation
          }
        }
      });

      if (error) throw error;
      
      setAuthSuccess('Sign up successful! Please sign in.');
      setAuthView('signin');
      setSiEmail(suEmail);
      setSiPassword('');
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: window.location.origin
      });

      if (error) throw error;
      setAuthSuccess('Password reset link has been dispatched to your email.');
    } catch (err: any) {
      setAuthError(err.message || 'Reset dispatch failed.');
    }
  };

  const handleQuickLogin = async (role: 'manager' | 'employee') => {
    setAuthError('');
    setAuthSuccess('');

    const targetEmail = role === 'manager' ? 'sarah.j@company.com' : 'alex.r@company.com';
    const targetPassword = 'password123';

    if (isOfflineMode) {
      // Offline mode login bypass
      const mockMeta = INITIAL_EMPLOYEES.find(e => e.email === targetEmail);
      if (mockMeta) {
        const localUser = {
          id: mockMeta.id,
          name: mockMeta.name,
          email: mockMeta.email,
          role: mockMeta.role,
          department: mockMeta.department,
          designation: mockMeta.designation,
          status: 'active',
          avatar: mockMeta.photo
        };
        setCurrentUser(localUser);
        localStorage.setItem('emp_react_current_user', JSON.stringify(localUser));
      }
    } else {
      // Supabase Mode
      try {
        // Try sign in
        const { error } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password: targetPassword
        });

        if (error) {
          // If user doesn't exist, register them first!
          if (error.message.includes('Invalid login credentials')) {
            const mockMeta = INITIAL_EMPLOYEES.find(e => e.email === targetEmail);
            
            const { error: signUpError } = await supabase.auth.signUp({
              email: targetEmail,
              password: targetPassword,
              options: {
                data: {
                  name: mockMeta?.name || 'Quick User',
                  role: role,
                  department: mockMeta?.department || 'General',
                  designation: mockMeta?.designation || 'Associate'
                }
              }
            });

            if (signUpError) throw signUpError;

            // Immediately sign in
            const { error: secondSignInError } = await supabase.auth.signInWithPassword({
              email: targetEmail,
              password: targetPassword
            });

            if (secondSignInError) throw secondSignInError;
          } else {
            throw error;
          }
        }
      } catch (err: any) {
        setAuthError(`Quick Login failed: ${err.message}. Ensure your schema is loaded.`);
      }
    }
  };

  const handleLogout = async () => {
    if (isOfflineMode) {
      setCurrentUser(null);
      localStorage.removeItem('emp_react_current_user');
    } else {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setSession(null);
    }
    setCurrentView('dashboard');
  };

  const handleToggleOfflineMode = () => {
    const nextState = !isOfflineMode;
    setIsOfflineMode(nextState);
    localStorage.setItem('emp_react_offline', nextState ? 'true' : 'false');
    setCurrentUser(null);
    setSession(null);
    setAuthError('');
    setAuthSuccess('');
  };

  // --- Database Action Triggers ---
  const handleAssignTask = async (taskData: Omit<Task, 'id' | 'progress' | 'attachments'>) => {
    if (isOfflineMode) {
      const newId = `TSK-${Math.floor(100 + Math.random() * 900)}`;
      const newTask: Task = {
        ...taskData,
        id: newId,
        progress: 0,
        attachments: []
      };
      setTasks(prev => [newTask, ...prev]);
      addNotification(`New task assigned: "${taskData.name}"`, 'project');
      alert(`Task created.`);
    } else if (currentUser) {
      try {
        const dbTask = {
          title: taskData.name,
          description: taskData.notes,
          assigned_to: taskData.assignedEmployee,
          assigned_by: currentUser.id,
          priority: taskData.priority,
          deadline: taskData.dueDate,
          status: 'Not Started',
          progress: 0
        };

        const { data, error } = await supabase
          .from('tasks')
          .insert(dbTask)
          .select()
          .single();

        if (error) throw error;

        // Insert notification
        await supabase.from('notifications').insert({
          employee_id: taskData.assignedEmployee,
          text: `${currentUser.name} assigned you task: "${taskData.name}"`
        });

        // Add audit activity
        await supabase.from('activity_log').insert({
          user_id: currentUser.id,
          user_name: currentUser.name,
          user_role: currentUser.role,
          action: `Assigned task "${taskData.name}"`
        });

        loadSupabaseData();
        alert('Task assigned successfully.');
      } catch (err: any) {
        alert(`Failed to assign task: ${err.message}`);
      }
    }
  };

  const handleUpdateProgressVal = async (taskId: string, val: number) => {
    if (isOfflineMode) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, progress: val } : t));
      if (val === 100) {
        addNotification(`Task completed.`, 'achievement');
      }
      alert("Progress saved.");
    } else if (currentUser) {
      try {
        const dbStatus = val === 100 ? 'Completed' : val === 0 ? 'Not Started' : 'In Progress';
        const { error } = await supabase
          .from('tasks')
          .update({ progress: val, status: dbStatus })
          .eq('id', taskId);

        if (error) throw error;

        // Add audit activity
        await supabase.from('activity_log').insert({
          user_id: currentUser.id,
          user_name: currentUser.name,
          user_role: currentUser.role,
          action: `Updated task progress to ${val}% (${dbStatus})`
        });

        loadSupabaseData();
        alert('Progress updated.');
      } catch (err: any) {
        alert(`Update failed: ${err.message}`);
      }
    }
  };

  const addNotification = (text: string, type: 'deadline' | 'project' | 'achievement' | 'performance' | 'attendance') => {
    const newNotif: Notification = {
      id: `not-${Date.now()}`,
      text,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleResetDB = () => {
    if (window.confirm("Are you sure you want to reset all data tables to initial system defaults?")) {
      localStorage.removeItem('emp_react_employees');
      localStorage.removeItem('emp_react_projects');
      localStorage.removeItem('emp_react_tasks');
      localStorage.removeItem('emp_react_notifications');
      localStorage.removeItem('emp_react_attendance');

      setEmployees(INITIAL_EMPLOYEES);
      setProjects(INITIAL_PROJECTS);
      setTasks(INITIAL_TASKS);
      setNotifications(INITIAL_NOTIFICATIONS);
      setCurrentView('dashboard');
      alert("Database reset completed.");
    }
  };

  // --- Auth Screen Component ---
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-900 dark:bg-black dark:text-slate-100 transition-colors duration-200 px-4 py-12">
        <div className="w-full max-w-md bg-white border border-neutral-100 dark:bg-neutral-950 dark:border-neutral-900 rounded-3xl p-8 shadow-soft space-y-6">
          
          <div className="text-center space-y-1">
            <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold font-heading text-xl mx-auto shadow-sm">
              E
            </div>
            <h1 className="font-heading font-extrabold text-xl tracking-tight pt-2">EmpPulse</h1>
            <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
              {isOfflineMode ? 'Offline Sandbox Mode' : 'Supabase Cloud HRMS'}
            </p>
          </div>

          {authError && (
            <div className="p-3.5 bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-neutral-100 dark:border-neutral-800 text-[10px] rounded-xl font-medium">
              {authError}
            </div>
          )}

          {authSuccess && (
            <div className="p-3.5 bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-neutral-100 dark:border-neutral-800 text-[10px] rounded-xl font-medium">
              {authSuccess}
            </div>
          )}

          {/* SIGN IN VIEW */}
          {authView === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Email Address</label>
                <input 
                  type="email" 
                  value={siEmail} 
                  onChange={e => setSiEmail(e.target.value)} 
                  required 
                  placeholder="name@company.com"
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-2.5 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white" 
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Password</label>
                  <button type="button" onClick={() => setAuthView('forgot')} className="text-[10px] text-neutral-400 hover:text-black dark:hover:text-white font-medium">Forgot Password?</button>
                </div>
                <input 
                  type="password" 
                  value={siPassword} 
                  onChange={e => setSiPassword(e.target.value)} 
                  required 
                  placeholder="••••••••"
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-2.5 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white" 
                />
              </div>

              {!isOfflineMode && (
                <button type="submit" className="w-full py-2.5 bg-black text-white dark:bg-white dark:text-black font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm">
                  Sign In
                </button>
              )}

              <div className="text-center pt-1">
                <span className="text-[10px] text-neutral-400">Don't have an account? </span>
                <button type="button" onClick={() => setAuthView('signup')} className="text-[10px] font-bold text-neutral-950 dark:text-white hover:underline">Sign Up</button>
              </div>
            </form>
          )}

          {/* SIGN UP VIEW */}
          {authView === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Full Name</label>
                <input 
                  type="text" 
                  value={suName} 
                  onChange={e => setSuName(e.target.value)} 
                  required 
                  placeholder="Alex Rivera"
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-2.5 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white" 
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Email Address</label>
                <input 
                  type="email" 
                  value={suEmail} 
                  onChange={e => setSuEmail(e.target.value)} 
                  required 
                  placeholder="alex.r@company.com"
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-2.5 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white" 
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Password</label>
                <input 
                  type="password" 
                  value={suPassword} 
                  onChange={e => setSuPassword(e.target.value)} 
                  required 
                  placeholder="Minimum 6 characters"
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-2.5 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">System Role</label>
                  <select 
                    value={suRole} 
                    onChange={e => setSuRole(e.target.value as any)}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-2 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Department</label>
                  <select 
                    value={suDepartment} 
                    onChange={e => setSuDepartment(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-2 focus:outline-none"
                  >
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Designation</label>
                <input 
                  type="text" 
                  value={suDesignation} 
                  onChange={e => setSuDesignation(e.target.value)} 
                  required 
                  placeholder="Senior Developer"
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-2.5 focus:outline-none" 
                />
              </div>

              <button type="submit" className="w-full py-2.5 bg-black text-white dark:bg-white dark:text-black font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm">
                Register Account
              </button>

              <div className="text-center pt-1">
                <span className="text-[10px] text-neutral-400">Already registered? </span>
                <button type="button" onClick={() => setAuthView('signin')} className="text-[10px] font-bold text-neutral-950 dark:text-white hover:underline">Sign In</button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {authView === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Email Address</label>
                <input 
                  type="email" 
                  value={forgotEmail} 
                  onChange={e => setForgotEmail(e.target.value)} 
                  required 
                  placeholder="name@company.com"
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-2.5 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white" 
                />
              </div>

              <button type="submit" className="w-full py-2.5 bg-black text-white dark:bg-white dark:text-black font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm">
                Send Reset Link
              </button>

              <div className="text-center pt-1">
                <button type="button" onClick={() => setAuthView('signin')} className="text-[10px] font-bold text-neutral-400 hover:text-black dark:hover:text-white">Back to Sign In</button>
              </div>
            </form>
          )}

          {/* QUICK LOGIN CHIPS */}
          <div className="border-t border-neutral-50 dark:border-neutral-900/50 pt-5 space-y-3">
            <div className="text-center text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Quick Login For Review</div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button 
                type="button" 
                onClick={() => handleQuickLogin('manager')}
                className="p-3 border border-neutral-100 dark:border-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-2xl text-center transition-all"
              >
                <p className="font-bold text-neutral-950 dark:text-white">Manager Portal</p>
                <p className="text-[9px] text-neutral-400 mt-0.5">Sarah Jenkins</p>
              </button>
              <button 
                type="button" 
                onClick={() => handleQuickLogin('employee')}
                className="p-3 border border-neutral-100 dark:border-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-2xl text-center transition-all"
              >
                <p className="font-bold text-neutral-950 dark:text-white">Employee Portal</p>
                <p className="text-[9px] text-neutral-400 mt-0.5">Alex Rivera</p>
              </button>
            </div>
          </div>

          {/* OFFLINE TOGGLER */}
          <div className="text-center pt-2">
            <button 
              type="button"
              onClick={handleToggleOfflineMode}
              className="text-[10px] font-semibold text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              {isOfflineMode ? 'Switch to Supabase Cloud Mode' : 'Switch to Local Sandbox Mode'}
            </button>
          </div>

        </div>
      </div>
    );
  }

  // --- Main Application Shell (Logged In) ---
  const isManager = currentUser?.role === 'manager';

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardHome employees={employees} projects={projects} tasks={tasks} />;
      case 'employees':
        if (!isManager) return <div className="text-center text-xs p-10 text-neutral-400">Access Denied: Managers only.</div>;
        return (
          <EmployeeDir 
            employees={employees} 
            setEmployees={setEmployees} 
            tasks={tasks} 
            searchQuery={globalSearch}
          />
        );
      case 'tasks':
        return (
          <TasksProjects 
            employees={employees} 
            projects={projects} 
            setProjects={setProjects}
            tasks={tasks}
            setTasks={setTasks}
            addNotification={addNotification}
            searchQuery={globalSearch}
          />
        );
      case 'progress':
        if (!isManager) return <div className="text-center text-xs p-10 text-neutral-400">Access Denied: Managers only.</div>;
        return <ProgressTrack employees={employees} tasks={tasks} />;
      case 'analytics':
        if (!isManager) return <div className="text-center text-xs p-10 text-neutral-400">Access Denied: Managers only.</div>;
        return <PerformanceAnal employees={employees} tasks={tasks} />;
      case 'departments':
        if (!isManager) return <div className="text-center text-xs p-10 text-neutral-400">Access Denied: Managers only.</div>;
        return <DepartmentsOverview employees={employees} tasks={tasks} />;
      case 'reports':
        if (!isManager) return <div className="text-center text-xs p-10 text-neutral-400">Access Denied: Managers only.</div>;
        return <ReportsModule employees={employees} projects={projects} tasks={tasks} />;
      case 'timecard':
        return <Timecard currentUser={currentUser} isOfflineMode={isOfflineMode} supabase={supabase} />;
      case 'settings':
        return (
          <Settings 
            employees={employees} 
            setEmployees={setEmployees} 
            onResetDB={handleResetDB} 
          />
        );
      default:
        return <DashboardHome employees={employees} projects={projects} tasks={tasks} />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100 flex transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Viewport */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
        <Header 
          currentView={currentView}
          theme={theme}
          onThemeToggle={handleThemeToggle}
          onSearch={setGlobalSearch}
          notifications={notifications}
          onMarkRead={handleMarkRead}
          onClearAll={handleClearNotifications}
          setMobileOpen={setMobileOpen}
        />
        
        <main className="p-4 md:p-6 max-w-7xl mx-auto w-full flex-1">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
