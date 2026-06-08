import React from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Percent, 
  Award, 
  Activity, 
  CheckSquare,
  Dot
} from 'lucide-react';
import { Employee, Task, calculateProductivityScore, calculateTaskCompletionRate } from '../data/mockData';

interface ProgressTrackProps {
  employees: Employee[];
  tasks: Task[];
}

export const ProgressTrack: React.FC<ProgressTrackProps> = ({ employees, tasks }) => {
  // Aggregate Averages
  const totalEmployees = employees.length;
  const avgProductivity = totalEmployees > 0 
    ? Math.round(employees.reduce((sum, e) => sum + calculateProductivityScore(e), 0) / totalEmployees)
    : 0;

  const avgCompletion = totalEmployees > 0
    ? Math.round(employees.reduce((sum, e) => sum + calculateTaskCompletionRate(e.id, tasks), 0) / totalEmployees)
    : 0;

  const avgRating = totalEmployees > 0
    ? parseFloat((employees.reduce((sum, e) => sum + e.performanceRating, 0) / totalEmployees).toFixed(2))
    : 0.0;

  // Mock trackers
  const weeklyTrackerData = employees.map(emp => {
    // Generate mock weekly trends
    const base = calculateProductivityScore(emp);
    return {
      empName: emp.name,
      designation: emp.designation,
      wk1: Math.max(base - 10, 50),
      wk2: Math.max(base - 4, 55),
      wk3: base,
      wk4: Math.min(base + 6, 100)
    };
  });

  const monthlyGoals = [
    { goal: 'Deliver CRM Prototype', department: 'Development', completed: true, score: 98, growth: 24 },
    { goal: 'Expand SEO Content Coverage', department: 'Marketing', completed: true, score: 85, growth: 12 },
    { goal: 'Release Unified Grayscale System', department: 'Design', completed: true, score: 92, growth: 18 },
    { goal: 'Launch Q2 California Outbound Sprints', department: 'Sales', completed: false, score: 45, growth: -5 },
    { goal: 'Formulate Office Relocation Vendor list', department: 'Operations', completed: true, score: 100, growth: 15 }
  ];

  return (
    <div className="space-y-6">
      {/* Progress Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        {[
          { label: 'Task Completion Rate', val: `${avgCompletion}%`, sub: 'Assigned vs delivered', icon: Percent },
          { label: 'Attendance Score', val: '96%', sub: 'Timecard punch-in logs', icon: Calendar },
          { label: 'Productivity Score', val: `${avgProductivity}%`, sub: 'Hour quota tracking', icon: Activity },
          { label: 'Performance Rating', val: `${avgRating} / 5.0`, sub: 'Teammate reviews', icon: Award },
          { label: 'Efficiency Score', val: '91%', sub: 'Timeline targets hit', icon: TrendingUp }
        ].map((card, idx) => (
          <div 
            key={idx}
            className="bg-white border border-neutral-100 p-4 rounded-2xl shadow-soft dark:bg-neutral-950 dark:border-neutral-900 cursor-default select-none"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase font-bold tracking-wider text-neutral-400 dark:text-neutral-500 font-heading">
                {card.label}
              </span>
              <card.icon size={13} className="text-neutral-400 dark:text-neutral-600" />
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold font-heading text-neutral-900 dark:text-white">
                {card.val}
              </span>
              <p className="text-[9px] text-neutral-400 dark:text-neutral-500 mt-0.5">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Individual Progress Table */}
      <div className="bg-white border border-neutral-100 rounded-2xl shadow-soft dark:bg-neutral-950 dark:border-neutral-900 overflow-hidden">
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-900 flex items-center justify-between">
          <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-neutral-400">Teammate Target Resolutions</h3>
          <span className="text-[10px] text-neutral-400">Individual progress & reviews</span>
        </div>
        
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs select-none">
            <thead>
              <tr className="bg-neutral-50/50 dark:bg-neutral-900/20 text-neutral-400 font-bold border-b border-neutral-100 dark:border-neutral-900">
                <th className="p-4">Employee</th>
                <th className="p-4 text-center">Tasks Assigned</th>
                <th className="p-4 text-center">Tasks Completed</th>
                <th className="p-4 text-center">Pending Tasks</th>
                <th className="p-4">Delivery Rate</th>
                <th className="p-4 text-right">Performance Rating</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => {
                const empTasks = tasks.filter(t => t.assignedEmployee === emp.id);
                const compCount = empTasks.filter(t => t.progress === 100).length;
                const pendCount = empTasks.length - compCount;
                const rate = calculateTaskCompletionRate(emp.id, tasks);

                return (
                  <tr key={emp.id} className="border-b border-neutral-50 last:border-0 dark:border-neutral-900/50 hover:bg-neutral-50/20 dark:hover:bg-neutral-900/10">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center font-bold text-[9px] text-neutral-600 dark:text-neutral-300">
                          {emp.photo}
                        </div>
                        <div>
                          <p className="font-semibold text-black dark:text-white">{emp.name}</p>
                          <p className="text-[10px] text-neutral-400">{emp.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center text-neutral-600 dark:text-neutral-400">{empTasks.length || 5}</td>
                    <td className="p-4 text-center text-neutral-800 dark:text-neutral-300 font-semibold">{compCount || emp.tasksCompleted}</td>
                    <td className="p-4 text-center text-neutral-500">{pendCount || 2}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{rate}%</span>
                        <div className="flex-1 h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden w-16">
                          <div className="h-full bg-black dark:bg-white" style={{ width: `${rate}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right font-semibold text-neutral-900 dark:text-white">{emp.performanceRating} / 5.0</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekly & Monthly Trackers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Performance Tracker */}
        <div className="bg-white border border-neutral-100 rounded-2xl shadow-soft dark:bg-neutral-950 dark:border-neutral-900 p-5">
          <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-neutral-400 mb-4">Weekly Performance Logs (Productivity Trends)</h3>
          
          <div className="space-y-4">
            {weeklyTrackerData.map((data, index) => (
              <div key={index} className="flex items-center justify-between text-xs border-b border-neutral-50 last:border-0 dark:border-neutral-900/30 pb-3 last:pb-0">
                <div className="w-1/3 min-w-0 pr-2">
                  <p className="font-semibold truncate text-neutral-950 dark:text-white">{data.empName}</p>
                  <p className="text-[9px] text-neutral-400 truncate">{data.designation}</p>
                </div>
                
                <div className="w-2/3 flex items-center justify-between gap-1 text-[10px]">
                  {[
                    { label: 'Wk 1', val: data.wk1 },
                    { label: 'Wk 2', val: data.wk2 },
                    { label: 'Wk 3', val: data.wk3 },
                    { label: 'Wk 4', val: data.wk4 }
                  ].map((wk, idx) => (
                    <div key={idx} className="flex flex-col items-center flex-1 bg-neutral-50 dark:bg-neutral-900/30 py-1.5 px-1 rounded-lg border border-neutral-100 dark:border-neutral-900">
                      <span className="text-[8px] text-neutral-400 font-bold uppercase">{wk.label}</span>
                      <span className="font-semibold text-neutral-950 dark:text-white mt-0.5">{wk.val}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Performance Tracker */}
        <div className="bg-white border border-neutral-100 rounded-2xl shadow-soft dark:bg-neutral-950 dark:border-neutral-900 p-5">
          <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-neutral-400 mb-4">Monthly Goal Comply Tracker</h3>
          
          <div className="space-y-3.5">
            {monthlyGoals.map((g, index) => (
              <div key={index} className="flex items-start justify-between gap-3 text-xs">
                <div className="flex-1">
                  <span className="text-[9px] font-bold uppercase tracking-wide text-neutral-400">{g.department}</span>
                  <h4 className="font-semibold text-neutral-950 dark:text-white mt-0.5">{g.goal}</h4>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] font-bold block">{g.score}% Completed</span>
                    <span className={`text-[9px] font-medium ${g.growth > 0 ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-400'}`}>
                      {g.growth > 0 ? `+${g.growth}% growth` : `${g.growth}% growth`}
                    </span>
                  </div>
                  
                  <div className={`p-1.5 border rounded-lg ${g.completed ? 'border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-900' : 'border-neutral-100 dark:border-neutral-800'}`}>
                    {g.completed ? <CheckSquare size={13} className="text-black dark:text-white" /> : <Dot size={13} className="text-neutral-300 animate-pulse" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
