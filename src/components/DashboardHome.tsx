import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  Briefcase, 
  CheckCircle2, 
  Activity, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  Employee, 
  Project, 
  Task, 
  calculateProductivityScore, 
  calculateCompanyGrowthIndex, 
  getDepartmentsSummary 
} from '../data/mockData';

interface DashboardHomeProps {
  employees: Employee[];
  projects: Project[];
  tasks: Task[];
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ employees, projects, tasks }) => {
  const [productivityTimeframe, setProductivityTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const deptsSummary = getDepartmentsSummary(employees, tasks);
  
  // Calculate aggregate metrics
  const totalEmployeesCount = employees.length;
  const activeEmployeesCount = employees.filter(e => e.status === 'Active').length;
  const inProgressProjectsCount = projects.filter(p => p.status === 'In Progress').length;
  const completedTasksCount = tasks.filter(t => t.progress === 100).length;

  const avgProductivity = employees.length > 0 
    ? Math.round(employees.reduce((sum, e) => sum + calculateProductivityScore(e), 0) / employees.length)
    : 0;

  const companyGrowthIndex = calculateCompanyGrowthIndex(employees, projects, deptsSummary);

  // Recharts Grayscale palettes
  const grayColors = ['#171717', '#404040', '#737373', '#a3a3a3', '#d4d4d4', '#e5e5e5', '#f5f5f5'];

  // Mock charts data
  const lineChartData = {
    daily: [
      { name: 'Mon', Productivity: 78 },
      { name: 'Tue', Productivity: 82 },
      { name: 'Wed', Productivity: 85 },
      { name: 'Thu', Productivity: 80 },
      { name: 'Fri', Productivity: 89 },
    ],
    weekly: [
      { name: 'Wk 1', Productivity: 75 },
      { name: 'Wk 2', Productivity: 80 },
      { name: 'Wk 3', Productivity: 82 },
      { name: 'Wk 4', Productivity: 88 },
    ],
    monthly: [
      { name: 'Jan', Productivity: 72 },
      { name: 'Feb', Productivity: 76 },
      { name: 'Mar', Productivity: 80 },
      { name: 'Apr', Productivity: 84 },
      { name: 'May', Productivity: 88 },
    ],
  };

  const areaGrowthData = [
    { name: 'Jan', Revenue: 4000, Productivity: 2400, Performance: 2400 },
    { name: 'Feb', Revenue: 4500, Productivity: 2800, Performance: 2600 },
    { name: 'Mar', Revenue: 5200, Productivity: 3200, Performance: 2800 },
    { name: 'Apr', Revenue: 6100, Productivity: 4000, Performance: 3600 },
    { name: 'May', Revenue: 7000, Productivity: 4800, Performance: 4200 },
  ];

  const pieContributionData = employees.map(e => ({
    name: e.name,
    value: e.tasksCompleted
  }));

  const cardVariants = {
    hover: { 
      y: -4, 
      transition: { duration: 0.2, ease: "easeOut" } 
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { title: 'Total Employees', value: totalEmployeesCount, icon: Users, change: '+2', trend: 'up', desc: 'Active & inactive' },
          { title: 'Active Employees', value: activeEmployeesCount, icon: UserCheck, change: '+1', trend: 'up', desc: 'On duty now' },
          { title: 'Projects Active', value: inProgressProjectsCount, icon: Briefcase, change: '+2', trend: 'up', desc: 'Tracked campaigns' },
          { title: 'Tasks Completed', value: completedTasksCount, icon: CheckCircle2, change: '+12%', trend: 'up', desc: 'Delivered this month' },
          { title: 'Productivity Score', value: `${avgProductivity}%`, icon: Activity, change: '-2%', trend: 'down', desc: 'Average output rate' },
          { title: 'Growth Index', value: `${companyGrowthIndex}%`, icon: TrendingUp, change: '+4%', trend: 'up', desc: 'Company aggregate' },
        ].map((kpi, idx) => (
          <motion.div
            key={idx}
            variants={cardVariants}
            whileHover="hover"
            className="bg-white border border-neutral-100 p-4 rounded-2xl shadow-soft dark:bg-neutral-950 dark:border-neutral-900 cursor-default select-none transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 dark:text-neutral-500 font-heading">
                {kpi.title}
              </span>
              <kpi.icon size={16} className="text-neutral-400 dark:text-neutral-600" />
            </div>

            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-heading">
                {kpi.value}
              </span>
              
              <div className={`flex items-center text-[10px] font-semibold ${kpi.trend === 'up' ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-400'}`}>
                {kpi.trend === 'up' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                <span>{kpi.change}</span>
              </div>
            </div>
            
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">{kpi.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Analytics Charts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart: Productivity Trend */}
        <div className="bg-white border border-neutral-100 rounded-2xl shadow-soft dark:bg-neutral-950 dark:border-neutral-900 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-sm text-neutral-900 dark:text-white">Productivity Trends</h3>
              <p className="text-[11px] text-neutral-400">Employee overall productive hours ratio</p>
            </div>
            <div className="flex gap-1 border border-neutral-100 dark:border-neutral-800 rounded-lg p-0.5 bg-neutral-50 dark:bg-neutral-900">
              {(['daily', 'weekly', 'monthly'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setProductivityTimeframe(mode)}
                  className={`text-[10px] font-medium px-2 py-1 rounded-md capitalize transition-all ${productivityTimeframe === mode ? 'bg-white text-black shadow-xs dark:bg-neutral-800 dark:text-white' : 'text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData[productivityTimeframe]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-neutral-900" />
                <XAxis dataKey="name" stroke="#a3a3a3" fontSize={10} tickLine={false} />
                <YAxis stroke="#a3a3a3" fontSize={10} tickLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.85)', borderRadius: '12px', border: 'none' }}
                  labelStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#fff', fontSize: '10px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Productivity" 
                  stroke="#171717" 
                  strokeWidth={2} 
                  activeDot={{ r: 4 }} 
                  className="dark:stroke-white"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Department Performance */}
        <div className="bg-white border border-neutral-100 rounded-2xl shadow-soft dark:bg-neutral-950 dark:border-neutral-900 p-5">
          <div className="mb-4">
            <h3 className="font-heading font-bold text-sm text-neutral-900 dark:text-white">Department Performance</h3>
            <p className="text-[11px] text-neutral-400">Aggregated productivity indices by business unit</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptsSummary}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-neutral-900" />
                <XAxis dataKey="name" stroke="#a3a3a3" fontSize={10} tickLine={false} />
                <YAxis stroke="#a3a3a3" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.85)', borderRadius: '12px', border: 'none' }}
                  itemStyle={{ color: '#fff', fontSize: '10px' }}
                  labelStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                />
                <Bar dataKey="productivityScore" name="Productivity %" fill="#404040" radius={[4, 4, 0, 0]} className="dark:fill-neutral-300" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area Chart: Company Growth */}
        <div className="bg-white border border-neutral-100 rounded-2xl shadow-soft dark:bg-neutral-950 dark:border-neutral-900 p-5">
          <div className="mb-4">
            <h3 className="font-heading font-bold text-sm text-neutral-900 dark:text-white">Company Growth Analytics</h3>
            <p className="text-[11px] text-neutral-400">Co-indexing revenue growth alongside output</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-neutral-900" />
                <XAxis dataKey="name" stroke="#a3a3a3" fontSize={10} tickLine={false} />
                <YAxis stroke="#a3a3a3" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.85)', borderRadius: '12px', border: 'none' }}
                  itemStyle={{ color: '#fff', fontSize: '10px' }}
                  labelStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                <Area type="monotone" dataKey="Revenue" stackId="1" stroke="#171717" fill="#171717" fillOpacity={0.05} className="dark:stroke-neutral-100 dark:fill-neutral-100" />
                <Area type="monotone" dataKey="Productivity" stackId="2" stroke="#737373" fill="#737373" fillOpacity={0.05} />
                <Area type="monotone" dataKey="Performance" stackId="3" stroke="#a3a3a3" fill="#a3a3a3" fillOpacity={0.05} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Employee Contribution Distribution */}
        <div className="bg-white border border-neutral-100 rounded-2xl shadow-soft dark:bg-neutral-950 dark:border-neutral-900 p-5">
          <div className="mb-4">
            <h3 className="font-heading font-bold text-sm text-neutral-900 dark:text-white">Contribution Distribution</h3>
            <p className="text-[11px] text-neutral-400">Percentage share of total completed tasks by employee</p>
          </div>

          <div className="h-64 flex flex-col md:flex-row items-center justify-between">
            <div className="w-full md:w-3/5 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieContributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieContributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={grayColors[index % grayColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.85)', borderRadius: '12px', border: 'none' }}
                    itemStyle={{ color: '#fff', fontSize: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom Grayscale Legend */}
            <div className="w-full md:w-2/5 max-h-60 overflow-y-auto space-y-1.5 px-2">
              {pieContributionData.map((entry, idx) => (
                <div key={idx} className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: grayColors[idx % grayColors.length] }} />
                    <span className="text-neutral-600 dark:text-neutral-300 truncate max-w-28 font-medium">{entry.name}</span>
                  </div>
                  <span className="text-neutral-400 font-bold">{entry.value} tasks</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
