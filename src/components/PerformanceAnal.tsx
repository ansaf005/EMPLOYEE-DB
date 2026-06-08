import React from 'react';
import { 
  Award, 
  AlertTriangle, 
  Sparkles, 
  TrendingUp, 
  HelpCircle, 
  ChevronRight, 
  ThumbsUp 
} from 'lucide-react';
import { Employee, Task, calculateProductivityScore, getAIInsights } from '../data/mockData';

interface PerformanceAnalProps {
  employees: Employee[];
  tasks: Task[];
}

export const PerformanceAnal: React.FC<PerformanceAnalProps> = ({ employees, tasks }) => {
  const insights = getAIInsights();

  // 1. Leaderboard Ranking
  const leaderboard = [...employees]
    .map(emp => ({
      ...emp,
      productivity: calculateProductivityScore(emp)
    }))
    .sort((a, b) => b.productivity - a.productivity);

  // 2. Alert Section: Teammates needing support (productivity < 75%)
  const supportAlerts = employees
    .map(emp => ({
      ...emp,
      productivity: calculateProductivityScore(emp),
      empTasks: tasks.filter(t => t.assignedEmployee === emp.id)
    }))
    .filter(e => e.productivity < 75);

  const getRankBadgeStyle = (rank: number) => {
    switch (rank) {
      case 0: return 'bg-black text-white dark:bg-white dark:text-black font-extrabold';
      case 1: return 'bg-neutral-800 text-neutral-100 dark:bg-neutral-200 dark:text-neutral-900 font-bold';
      case 2: return 'bg-neutral-400 text-neutral-900 dark:bg-neutral-600 dark:text-neutral-100';
      default: return 'bg-neutral-100 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-500';
    }
  };

  const getImprovementSuggestion = (designation: string, score: number): string => {
    if (designation.includes('Sales') || designation.includes('Marketing')) {
      return 'Reschedule California cold calling quotas; align client lists with senior managers.';
    }
    if (designation.includes('Finance') || designation.includes('Operations')) {
      return 'Review QuickBooks workflow capacity. Reallocate payroll bookkeeping timelines.';
    }
    return 'Conduct pair programming sprints. Introduce strict Figma design-system checklists.';
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
        <h2 className="font-heading font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">Performance Intelligence</h2>
        <p className="text-[10px] text-neutral-400">Strategic insight and ranked teammate outputs</p>
      </div>

      {/* AI Insights Panel (Premium Grayscale Cards) */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-neutral-900 dark:text-white">
          <Sparkles size={14} className="text-black dark:text-white" />
          <h3 className="font-heading font-bold text-xs uppercase tracking-wider">AI Copilot Core Insights</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((ins) => (
            <div 
              key={ins.id}
              className="bg-white border border-neutral-100 rounded-2xl shadow-soft p-5 dark:bg-neutral-950 dark:border-neutral-900 space-y-2 relative overflow-hidden"
            >
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border border-neutral-100 dark:border-neutral-800 rounded-lg text-neutral-500 block w-fit">
                {ins.metric}
              </span>
              <h4 className="font-heading font-bold text-xs text-neutral-950 dark:text-white pt-1">{ins.title}</h4>
              <p className="text-[10px] leading-relaxed text-neutral-400 dark:text-neutral-500">{ins.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Leaderboard (Left) & Alert Section (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Leaderboard Rankings */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-neutral-400 font-heading">Top Performers Leaderboard</h3>
            <span className="text-[9px] text-neutral-400">Sorted by output scores</span>
          </div>

          <div className="bg-white border border-neutral-100 rounded-2xl shadow-soft dark:bg-neutral-950 dark:border-neutral-900 overflow-hidden">
            <div className="divide-y divide-neutral-50 dark:divide-neutral-900/50">
              {leaderboard.map((emp, index) => (
                <div key={emp.id} className="p-4 flex items-center justify-between gap-3 hover:bg-neutral-50/20 dark:hover:bg-neutral-900/10">
                  <div className="flex items-center gap-4">
                    {/* Rank Badge */}
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] shrink-0 ${getRankBadgeStyle(index)}`}>
                      {index + 1}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center font-bold text-[10px]">
                        {emp.photo}
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-neutral-900 dark:text-white">{emp.name}</h4>
                        <p className="text-[10px] text-neutral-400">{emp.designation}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <span className="text-[9px] text-neutral-400 block uppercase font-semibold">Productivity</span>
                      <span className="text-xs font-bold text-neutral-950 dark:text-white font-heading">{emp.productivity}%</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-neutral-400 block uppercase font-semibold">Rating</span>
                      <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{emp.performanceRating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Support Warning & Improvement Alert Board */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-neutral-400">Support Warning Alerts</h3>
            <span className="text-[9px] text-neutral-400">Under 75% output limits</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {supportAlerts.length === 0 ? (
              <div className="bg-white border border-neutral-100 rounded-2xl p-6 text-center text-neutral-400 dark:bg-neutral-950 dark:border-neutral-900">
                <ThumbsUp size={24} className="mx-auto text-neutral-300 dark:text-neutral-700 mb-2" />
                <p className="text-xs">Outstanding! All active employees exceed minimal productivity expectations.</p>
              </div>
            ) : (
              supportAlerts.map((e) => (
                <div 
                  key={e.id}
                  className="bg-white border border-neutral-100 rounded-2xl shadow-soft dark:bg-neutral-950 dark:border-neutral-900 p-4 border-l-2 border-l-neutral-400 dark:border-l-neutral-600 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center font-bold text-[10px]">
                        {e.photo}
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-neutral-950 dark:text-white">{e.name}</h4>
                        <p className="text-[9px] text-neutral-400">{e.designation}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-neutral-900 dark:text-white block">{e.productivity}% Rate</span>
                      <span className="text-[8px] uppercase tracking-wide px-1.5 py-0.25 rounded-md bg-neutral-50 dark:bg-neutral-900 text-neutral-400 border border-neutral-100 dark:border-neutral-800">
                        Pending: {e.empTasks.filter(t => t.progress < 100).length || 2}
                      </span>
                    </div>
                  </div>

                  <div className="bg-neutral-50 dark:bg-neutral-900/40 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-900 text-[10px] space-y-1">
                    <span className="font-bold text-[9px] uppercase tracking-wide text-neutral-400 block flex items-center gap-1">
                      <AlertTriangle size={10} /> Improvement Recommendation
                    </span>
                    <p className="text-neutral-500 leading-relaxed">{getImprovementSuggestion(e.designation, e.productivity)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
