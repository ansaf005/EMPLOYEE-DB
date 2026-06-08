import React from 'react';
import { RefreshCw, Database, Terminal, ShieldAlert } from 'lucide-react';
import { Employee } from '../data/mockData';

interface SettingsProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  onResetDB: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ employees, setEmployees, onResetDB }) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
        <h2 className="font-heading font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">System Settings</h2>
        <p className="text-[10px] text-neutral-400">Manage database caches, configurations, and overrides</p>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        {/* Grayscale System Config */}
        <div className="bg-white border border-neutral-100 rounded-2xl shadow-soft dark:bg-neutral-950 dark:border-neutral-900 p-5 space-y-4">
          <div className="flex items-center gap-2 text-neutral-900 dark:text-white border-b border-neutral-50 dark:border-neutral-900/50 pb-2.5">
            <Database size={15} />
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider">Database Status</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-400">Total Profile Records</span>
              <p className="font-semibold text-neutral-950 dark:text-white">{employees.length} employees loaded</p>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-400">Storage Driver</span>
              <p className="font-semibold text-neutral-950 dark:text-white">localStorage Cache</p>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-400">Platform Core</span>
              <p className="font-semibold text-neutral-950 dark:text-white">React 18.3 (TypeScript)</p>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-400">Aesthetic Preset</span>
              <p className="font-semibold text-neutral-950 dark:text-white">Monochrome SaaS</p>
            </div>
          </div>
        </div>

        {/* Database Control Actions */}
        <div className="bg-white border border-neutral-100 rounded-2xl shadow-soft dark:bg-neutral-950 dark:border-neutral-900 p-5 space-y-5">
          <div className="flex items-center gap-2 text-neutral-900 dark:text-white border-b border-neutral-50 dark:border-neutral-900/50 pb-2.5">
            <ShieldAlert size={15} className="text-red-500" />
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider">Danger Zone</h3>
          </div>

          <div className="text-xs space-y-1">
            <h4 className="font-semibold text-neutral-900 dark:text-white">Reset Operational Database</h4>
            <p className="text-[10px] text-neutral-400 leading-relaxed">
              Clearing local databases will wipe all newly added staff records, tasks, progress sliders, and attendance clocks. Database structures will reload default initial datasets.
            </p>
          </div>

          <button
            onClick={onResetDB}
            className="w-full py-2.5 px-4.5 border border-red-200 text-red-500 hover:bg-red-50 dark:border-red-950 dark:hover:bg-red-950/20 rounded-xl transition-all font-semibold text-xs flex items-center justify-center gap-1.5"
          >
            <RefreshCw size={12} /> Reset Operational Database
          </button>
        </div>
      </div>
    </div>
  );
};
