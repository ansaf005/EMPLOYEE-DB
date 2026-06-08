/**
 * EmpPulse - Mock Database & Performance Calculations Engine
 * Written in TypeScript.
 */

// --- TypeScript Data Interfaces ---

export interface Employee {
  id: string;
  photo: string;
  name: string;
  email: string;
  phone: string;
  emergencyContact: string;
  address: string;
  dob: string;
  joiningDate: string;
  designation: string;
  department: string;
  level: 'Junior' | 'Mid' | 'Senior' | 'Lead';
  assignedProjects: string[]; // Project names or IDs
  tasksCompleted: number;
  currentProgress: number; // Overall progress percent (0-100)
  status: 'Active' | 'On Leave' | 'Inactive';
  reportingManager: string;
  skills: string[];
  experience: string;
  salary: string;
  performanceRating: number; // 0.0 - 5.0
  productiveHours: number;
  workingHours: number;
  timeline: TimelineEvent[];
  role?: 'manager' | 'employee';
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'task' | 'milestone' | 'achievement' | 'promotion';
}

export interface Project {
  id: string;
  name: string;
  members: string[]; // Employee names or IDs
  startDate: string;
  endDate: string;
  progress: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Not Started' | 'In Progress' | 'Under Review' | 'Completed' | 'Delayed';
}

export interface Task {
  id: string;
  name: string;
  assignedEmployee: string; // Employee ID
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  progress: number;
  notes: string;
  attachments: string[];
}

export interface Department {
  name: string;
  employeeCount: number;
  productivityScore: number;
  totalTasks: number;
  completedTasks: number;
  growth: number;
}

export interface Notification {
  id: string;
  text: string;
  type: 'deadline' | 'project' | 'achievement' | 'performance' | 'attendance';
  timestamp: string;
  read: boolean;
}

// --- Initial Mock Datasets ---

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'EMP-01',
    photo: 'AR',
    name: 'Alex Rivera',
    email: 'alex.r@company.com',
    phone: '+1 (555) 234-5678',
    emergencyContact: 'Maria Rivera (Spouse) - +1 (555) 234-5679',
    address: '128 Pine St, San Francisco, CA 94103',
    dob: '1992-04-15',
    joiningDate: '2023-03-01',
    designation: 'Senior Frontend Engineer',
    department: 'Development',
    level: 'Senior',
    assignedProjects: ['EmpPulse Portal', 'Client CRM System'],
    tasksCompleted: 42,
    currentProgress: 88,
    status: 'Active',
    reportingManager: 'Sarah Jenkins',
    skills: ['React', 'TypeScript', 'TailwindCSS', 'Next.js'],
    experience: '6 Years',
    salary: '$135,000',
    performanceRating: 4.8,
    productiveHours: 154,
    workingHours: 168,
    timeline: [
      { id: 't1', date: '2023-03-01', title: 'Joined Company', description: 'Joined as Senior Frontend Engineer.', type: 'promotion' },
      { id: 't2', date: '2023-09-15', title: 'Delivered CRM Beta', description: 'Assigned as frontend lead and delivered beta milestone ahead of schedule.', type: 'achievement' },
      { id: 't3', date: '2026-05-10', title: 'Task Completed: dark theme', description: 'Merged light/dark theme module in production repo.', type: 'task' }
    ]
  },
  {
    id: 'EMP-02',
    photo: 'JC',
    name: 'Jessica Chen',
    email: 'jessica.c@company.com',
    phone: '+1 (555) 345-6789',
    emergencyContact: 'Arthur Chen (Father) - +1 (555) 345-6780',
    address: '452 Broadway, Oakland, CA 94607',
    dob: '1995-09-24',
    joiningDate: '2024-01-15',
    designation: 'Lead Product Designer',
    department: 'Design',
    level: 'Lead',
    assignedProjects: ['EmpPulse Portal', 'Brand Redesign'],
    tasksCompleted: 35,
    currentProgress: 75,
    status: 'Active',
    reportingManager: 'Sarah Jenkins',
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Prototyping'],
    experience: '8 Years',
    salary: '$145,000',
    performanceRating: 4.9,
    productiveHours: 160,
    workingHours: 168,
    timeline: [
      { id: 't4', date: '2024-01-15', title: 'Joined Design Team', description: 'Began role as Lead Product Designer.', type: 'promotion' },
      { id: 't5', date: '2024-05-01', title: 'Launched Brand Guidelines v2.0', description: 'Released unified design guidelines to development teammates.', type: 'milestone' }
    ]
  },
  {
    id: 'EMP-03',
    photo: 'MV',
    name: 'Marcus Vance',
    email: 'marcus.v@company.com',
    phone: '+1 (555) 456-7890',
    emergencyContact: 'Linda Vance (Mother) - +1 (555) 456-7891',
    address: '988 Mission St, San Francisco, CA 94103',
    dob: '1994-11-02',
    joiningDate: '2023-08-10',
    designation: 'Growth Marketing Manager',
    department: 'Marketing',
    level: 'Mid',
    assignedProjects: ['Q3 Campaign Launch'],
    tasksCompleted: 18,
    currentProgress: 60,
    status: 'Active',
    reportingManager: 'Sarah Jenkins',
    skills: ['SEO', 'Google Ads', 'Copywriting', 'Growth Hacking'],
    experience: '4 Years',
    salary: '$95,000',
    performanceRating: 4.2,
    productiveHours: 140,
    workingHours: 168,
    timeline: [
      { id: 't6', date: '2023-08-10', title: 'Joined Marketing', description: 'Began managing growth campaigns.', type: 'promotion' }
    ]
  },
  {
    id: 'EMP-04',
    photo: 'SP',
    name: 'Sophia Patel',
    email: 'sophia.p@company.com',
    phone: '+1 (555) 567-8901',
    emergencyContact: 'Rohan Patel (Brother) - +1 (555) 567-8902',
    address: '741 Clay St, San Francisco, CA 94108',
    dob: '1991-07-30',
    joiningDate: '2022-05-15',
    designation: 'Senior Product Manager',
    department: 'Product',
    level: 'Senior',
    assignedProjects: ['Client CRM System'],
    tasksCompleted: 52,
    currentProgress: 95,
    status: 'Active',
    reportingManager: 'Sarah Jenkins',
    skills: ['Product Strategy', 'Agile Roadmap', 'Jira', 'Data Analytics'],
    experience: '9 Years',
    salary: '$150,000',
    performanceRating: 4.7,
    productiveHours: 158,
    workingHours: 168,
    timeline: [
      { id: 't7', date: '2022-05-15', title: 'Joined Product', description: 'Appointed Senior Product Manager.', type: 'promotion' },
      { id: 't8', date: '2024-12-01', title: 'Delivered PRD for core CRM', description: 'Compiled customer inputs into actionable specifications document.', type: 'achievement' }
    ]
  },
  {
    id: 'EMP-05',
    photo: 'DK',
    name: 'David Kim',
    email: 'david.k@company.com',
    phone: '+1 (555) 678-9012',
    emergencyContact: 'Ji-Yeon Kim (Sister) - +1 (555) 678-9013',
    address: '254 Geary St, San Francisco, CA 94102',
    dob: '1996-01-20',
    joiningDate: '2025-02-01',
    designation: 'Sales Executive',
    department: 'Sales',
    level: 'Junior',
    assignedProjects: ['Outbound Reach Campaign'],
    tasksCompleted: 12,
    currentProgress: 45,
    status: 'On Leave',
    reportingManager: 'Sarah Jenkins',
    skills: ['Cold Calling', 'Negotiation', 'CRM Logging', 'Keynote'],
    experience: '1 Year',
    salary: '$70,000',
    performanceRating: 3.8,
    productiveHours: 100,
    workingHours: 168,
    timeline: [
      { id: 't9', date: '2025-02-01', title: 'Joined Sales Team', description: 'Appointed Sales Executive.', type: 'promotion' }
    ]
  },
  {
    id: 'EMP-06',
    photo: 'HL',
    name: 'Helena Lopez',
    email: 'helena.l@company.com',
    phone: '+1 (555) 789-0123',
    emergencyContact: 'Luis Lopez (Spouse) - +1 (555) 789-0124',
    address: '104 Guerrero St, San Francisco, CA 94103',
    dob: '1993-08-12',
    joiningDate: '2024-06-01',
    designation: 'Operations Coordinator',
    department: 'Operations',
    level: 'Mid',
    assignedProjects: ['Office Relocation Plan'],
    tasksCompleted: 24,
    currentProgress: 80,
    status: 'Active',
    reportingManager: 'Sarah Jenkins',
    skills: ['Logistics', 'Vendor Management', 'Budgeting', 'Excel'],
    experience: '5 Years',
    salary: '$88,000',
    performanceRating: 4.5,
    productiveHours: 152,
    workingHours: 168,
    timeline: [
      { id: 't10', date: '2024-06-01', title: 'Joined Operations', description: 'Assigned to coordinate internal team structures.', type: 'promotion' }
    ]
  },
  {
    id: 'EMP-07',
    photo: 'TF',
    name: 'Thomas Ford',
    email: 'thomas.f@company.com',
    phone: '+1 (555) 890-1234',
    emergencyContact: 'Claire Ford (Spouse) - +1 (555) 890-1235',
    address: '614 Bush St, San Francisco, CA 94108',
    dob: '1990-12-05',
    joiningDate: '2023-11-01',
    designation: 'HR Lead',
    department: 'HR',
    level: 'Lead',
    assignedProjects: ['Annual Recruiting Drive'],
    tasksCompleted: 29,
    currentProgress: 85,
    status: 'Active',
    reportingManager: 'Sarah Jenkins',
    skills: ['Talent Acquisition', 'Compliance', 'Onboarding', 'Conflict Resolution'],
    experience: '8 Years',
    salary: '$110,000',
    performanceRating: 4.6,
    productiveHours: 148,
    workingHours: 168,
    timeline: [
      { id: 't11', date: '2023-11-01', title: 'Joined HR Department', description: 'Appointed as HR Lead.', type: 'promotion' }
    ]
  },
  {
    id: 'EMP-08',
    photo: 'AM',
    name: 'Ashley Miller',
    email: 'ashley.m@company.com',
    phone: '+1 (555) 901-2345',
    emergencyContact: 'John Miller (Father) - +1 (555) 901-2346',
    address: '320 Fillmore St, San Francisco, CA 94117',
    dob: '1997-03-14',
    joiningDate: '2025-05-01',
    designation: 'Finance Associate',
    department: 'Finance',
    level: 'Junior',
    assignedProjects: ['Q2 Tax Audit preparation'],
    tasksCompleted: 4,
    currentProgress: 30,
    status: 'Inactive',
    reportingManager: 'Sarah Jenkins',
    skills: ['Accounting', 'Audit preparation', 'QuickBooks'],
    experience: '1 Year',
    salary: '$75,000',
    performanceRating: 3.2,
    productiveHours: 90,
    workingHours: 168,
    timeline: [
      { id: 't12', date: '2025-05-01', title: 'Joined Finance', description: 'Joined team for payroll tracking.', type: 'promotion' }
    ]
  }
];

export const INITIAL_PROJECTS: Project[] = [
  { id: 'PRJ-101', name: 'EmpPulse Portal', members: ['Alex Rivera', 'Jessica Chen'], startDate: '2026-05-01', endDate: '2026-06-30', progress: 82, priority: 'High', status: 'In Progress' },
  { id: 'PRJ-102', name: 'Client CRM System', members: ['Alex Rivera', 'Sophia Patel'], startDate: '2026-04-10', endDate: '2026-07-15', progress: 65, priority: 'Critical', status: 'In Progress' },
  { id: 'PRJ-103', name: 'Brand Redesign', members: ['Jessica Chen'], startDate: '2026-06-01', endDate: '2026-08-31', progress: 15, priority: 'Medium', status: 'In Progress' },
  { id: 'PRJ-104', name: 'Q3 Campaign Launch', members: ['Marcus Vance'], startDate: '2026-06-15', endDate: '2026-09-30', progress: 0, priority: 'Medium', status: 'Not Started' },
  { id: 'PRJ-105', name: 'Office Relocation Plan', members: ['Helena Lopez'], startDate: '2026-03-01', endDate: '2026-05-31', progress: 100, priority: 'Low', status: 'Completed' },
  { id: 'PRJ-106', name: 'Outbound Reach Campaign', members: ['David Kim'], startDate: '2026-05-15', endDate: '2026-06-30', progress: 38, priority: 'High', status: 'Delayed' }
];

export const INITIAL_TASKS: Task[] = [
  { id: 'TSK-201', name: 'Setup Vite + TypeScript Template', assignedEmployee: 'EMP-01', dueDate: '2026-06-07', priority: 'High', progress: 100, notes: 'Configure config files and project scaffold.', attachments: ['scaffold_tree.json'] },
  { id: 'TSK-202', name: 'Create Monochromatic Design Tokens', assignedEmployee: 'EMP-02', dueDate: '2026-06-08', priority: 'High', progress: 90, notes: 'Design layout tokens focusing on grayscale and thin dividers.', attachments: ['design_tokens.fig'] },
  { id: 'TSK-203', name: 'Establish Recharts Modules', assignedEmployee: 'EMP-01', dueDate: '2026-06-12', priority: 'Medium', progress: 40, notes: 'Configure charts that change style depending on active class.', attachments: [] },
  { id: 'TSK-204', name: 'Compile Q3 Brand Strategy Board', assignedEmployee: 'EMP-03', dueDate: '2026-06-20', priority: 'Medium', progress: 0, notes: 'Prepare copywriting styles for social ads.', attachments: [] },
  { id: 'TSK-205', name: 'Draft CRM PRD specifications document', assignedEmployee: 'EMP-04', dueDate: '2026-06-05', priority: 'High', progress: 100, notes: 'Requirements compiled and signed by project team.', attachments: ['PRD_CRM_v1.pdf'] },
  { id: 'TSK-206', name: 'Launch sales outreach calls in CA', assignedEmployee: 'EMP-05', dueDate: '2026-06-10', priority: 'High', progress: 30, notes: 'Make initial calling lists.', attachments: [] }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'not-1', text: 'Task TSK-205 deadline is today. Review final PRD file.', type: 'deadline', timestamp: '2026-06-05T09:00:00Z', read: false },
  { id: 'not-2', text: 'Alex Rivera updated progress on task TSK-201 to 100%.', type: 'project', timestamp: '2026-06-05T11:30:00Z', read: false },
  { id: 'not-3', text: 'Performance Alert: Ashley Miller productivity rating requires support.', type: 'performance', timestamp: '2026-06-04T16:00:00Z', read: false },
  { id: 'not-4', text: 'Helena Lopez checked in: On Time.', type: 'attendance', timestamp: '2026-06-05T08:52:00Z', read: true }
];

// --- Performance Metrics Logic Calculations ---

/**
 * Employee Productivity Score:
 * (Productive Hours / Working Hours) * 100
 */
export function calculateProductivityScore(emp: Employee): number {
  if (!emp.workingHours || emp.workingHours === 0) return 0;
  return Math.round((emp.productiveHours / emp.workingHours) * 100);
}

/**
 * Task Completion Rate:
 * (Completed Tasks / (Assigned Tasks + Completed Tasks)) * 100
 * Or standard: Tasks completed. Let's make it simulated relative to data:
 * (Tasks Completed / (Tasks Completed + 5)) * 100 -> or simple metric based on db tasks
 */
export function calculateTaskCompletionRate(empId: string, allTasks: Task[]): number {
  const empTasks = allTasks.filter(t => t.assignedEmployee === empId);
  const completed = empTasks.filter(t => t.progress === 100).length;
  if (empTasks.length === 0) {
    // Return base mock metric from profile if no tasks are assigned in current board
    const emp = INITIAL_EMPLOYEES.find(e => e.id === empId);
    return emp ? Math.round((emp.tasksCompleted / (emp.tasksCompleted + 4)) * 100) : 75;
  }
  return Math.round((completed / empTasks.length) * 100);
}

/**
 * Department Productivity, Tasks and growth details compiler
 */
export function getDepartmentsSummary(employees: Employee[], tasks: Task[]): Department[] {
  const depts: Record<string, { employeeCount: number; sumProd: number; totalTasks: number; completedTasks: number; growth: number }> = {
    HR: { employeeCount: 0, sumProd: 0, totalTasks: 0, completedTasks: 0, growth: 12 },
    Sales: { employeeCount: 0, sumProd: 0, totalTasks: 0, completedTasks: 0, growth: 18 },
    Marketing: { employeeCount: 0, sumProd: 0, totalTasks: 0, completedTasks: 0, growth: -5 },
    Development: { employeeCount: 0, sumProd: 0, totalTasks: 0, completedTasks: 0, growth: 22 },
    Design: { employeeCount: 0, sumProd: 0, totalTasks: 0, completedTasks: 0, growth: 14 },
    Operations: { employeeCount: 0, sumProd: 0, totalTasks: 0, completedTasks: 0, growth: 8 },
    Finance: { employeeCount: 0, sumProd: 0, totalTasks: 0, completedTasks: 0, growth: 3 }
  };

  employees.forEach(emp => {
    if (depts[emp.department]) {
      depts[emp.department].employeeCount++;
      depts[emp.department].sumProd += calculateProductivityScore(emp);
      depts[emp.department].totalTasks += tasks.filter(t => t.assignedEmployee === emp.id).length;
      depts[emp.department].completedTasks += tasks.filter(t => t.assignedEmployee === emp.id && t.progress === 100).length;
    }
  });

  return Object.keys(depts).map(name => {
    const d = depts[name];
    // Add default mock totals if they have no tasks assigned to keep analytics looking realistic
    const mockTasksWeight = name === 'Development' ? 15 : name === 'Design' ? 12 : 8;
    const finalTotalTasks = d.totalTasks === 0 ? mockTasksWeight : d.totalTasks;
    const finalCompletedTasks = d.completedTasks === 0 ? Math.round(mockTasksWeight * 0.75) : d.completedTasks;

    return {
      name,
      employeeCount: d.employeeCount === 0 ? 1 : d.employeeCount,
      productivityScore: d.employeeCount > 0 ? Math.round(d.sumProd / d.employeeCount) : 78,
      totalTasks: finalTotalTasks,
      completedTasks: finalCompletedTasks,
      growth: d.growth
    };
  });
}

/**
 * Company Growth Index:
 * Average of:
 * - Employee Productivity
 * - Project Completion Rate
 * - Department Performance
 */
export function calculateCompanyGrowthIndex(employees: Employee[], projects: Project[], departments: Department[]): number {
  if (employees.length === 0) return 0;
  
  const avgProductivity = employees.reduce((sum, e) => sum + calculateProductivityScore(e), 0) / employees.length;
  
  const completedProj = projects.filter(p => p.status === 'Completed').length;
  const projectCompletionRate = projects.length > 0 ? (completedProj / projects.length) * 100 : 75;
  // Make a realistic project completion rate (e.g. average progress % of projects)
  const averageProjectProgress = projects.reduce((sum, p) => sum + p.progress, 0) / projects.length;

  const avgDeptPerformance = departments.reduce((sum, d) => sum + d.productivityScore, 0) / departments.length;

  return Math.round((avgProductivity + averageProjectProgress + avgDeptPerformance) / 3);
}

// --- AI Insights Generator ---

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  metric: string;
}

export function getAIInsights(): AIInsight[] {
  return [
    {
      id: 'ins-1',
      title: 'Development Productivity Surge',
      description: 'Development team overall productivity index increased by 18% this month, driven by React refactoring sprints.',
      metric: '+18% change'
    },
    {
      id: 'ins-2',
      title: 'Accelerated Task Resolution',
      description: 'Alex Rivera completed 32% more tasks than last month, maintaining a performance rating of 4.8.',
      metric: '+32% deliveries'
    },
    {
      id: 'ins-3',
      title: 'Operations Target Completion',
      description: 'The operations and vendor coordination department achieved 95% target milestones for office relocation projects.',
      metric: '95% Met'
    }
  ];
}
