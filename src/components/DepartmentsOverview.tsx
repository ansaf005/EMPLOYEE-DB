import React from 'react';
import { Building2, Users, CheckSquare, TrendingUp } from 'lucide-react';
import { Employee, Task, getDepartmentsSummary } from '../data/mockData';

interface DepartmentsOverviewProps {
  employees: Employee[];
  tasks: Task[];
}

export const DepartmentsOverview: React.FC<DepartmentsOverviewProps> = ({ employees, tasks }) => {
  const summaries = getDepartmentsSummary(employees, tasks);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
        <h2 className="font-heading font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">Business Units</h2>
        <p className="text-[10px] text-neutral-400">Department performance and teammate headcount distributions</p>
      </div>

      {/* Grid of Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {summaries.map((dept) => (
          <div 
            key={dept.name}
            className="bg-white border border-neutral-100 rounded-2xl shadow-soft p-5 dark:bg-neutral-950 dark:border-neutral-900 space-y-4 cursor-default select-none"
          >
            {/* Dept Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
                  <Building2 size={16} />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xs text-neutral-950 dark:text-white uppercase tracking-wider">{dept.name}</h4>
                  <span className="text-[9px] text-neutral-400 block mt-0.5">{dept.employeeCount} active members</span>
                </div>
              </div>
              
              <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${dept.growth > 0 ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-400'}`}>
                <TrendingUp size={10} /> {dept.growth > 0 ? `+${dept.growth}%` : `${dept.growth}%`}
              </span>
            </div>

            {/* Productivity Ring */}
            <div className="pt-2">
              <div className="flex justify-between items-baseline text-xs mb-1 font-semibold">
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Productivity Index</span>
                <span className="text-neutral-900 dark:text-white font-heading font-bold text-sm">{dept.productivityScore}%</span>
              </div>
              <div className="h-1.5 bg-neutral-100 dark:bg-neutral-900 rounded-full overflow-hidden">
                <div className="h-full bg-black dark:bg-white rounded-full transition-all duration-300" style={{ width: `${dept.productivityScore}%` }}></div>
              </div>
            </div>

            {/* Tasks completed */}
            <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-2 border-t border-neutral-50 dark:border-neutral-900/50">
              <div className="flex items-center gap-1">
                <CheckSquare size={12} />
                <span>Task completions:</span>
              </div>
              <span className="font-bold text-neutral-800 dark:text-neutral-200">{dept.completedTasks} / {dept.totalTasks}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
