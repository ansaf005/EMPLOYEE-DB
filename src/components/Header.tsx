import React, { useState } from 'react';
import { Menu, Sun, Moon, Bell, Search, Check, Trash2 } from 'lucide-react';
import { Notification } from '../data/mockData';

interface HeaderProps {
  currentView: string;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onSearch: (term: string) => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
  setMobileOpen: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  theme,
  onThemeToggle,
  onSearch,
  notifications,
  onMarkRead,
  onClearAll,
  setMobileOpen
}) => {
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const viewTitles: Record<string, string> = {
    dashboard: 'Dashboard Overview',
    employees: 'Employee Directory',
    tasks: 'Tasks & Projects Management',
    progress: 'Progress & Completion Logs',
    analytics: 'Performance & Growth Analytics',
    departments: 'Departments Overview',
    reports: 'Insights & Reports Exporter',
    notifications: 'Notification Center',
    settings: 'System Settings',
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  return (
    <header className="h-16 border-b border-neutral-100 dark:border-neutral-800 bg-white/70 dark:bg-black/70 backdrop-blur-md sticky top-0 z-40 px-4 flex items-center justify-between transition-colors duration-200">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button 
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-1.5 border border-neutral-100 dark:border-neutral-800 rounded-lg text-neutral-500 hover:text-black dark:hover:text-white"
        >
          <Menu size={18} />
        </button>
        
        {/* View Title */}
        <h1 className="font-heading font-bold text-base md:text-lg tracking-tight text-neutral-900 dark:text-white select-none">
          {viewTitles[currentView] || 'Overview'}
        </h1>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Search Input Bar */}
        <div className="relative hidden md:block w-56 lg:w-64">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text"
            placeholder="Search..."
            onChange={handleSearchChange}
            className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-full py-1.5 pl-9 pr-4 text-xs focus:bg-white dark:focus:bg-black focus:border-black dark:focus:border-white focus:outline-none transition-all duration-200 text-black dark:text-white"
          />
        </div>

        {/* Theme Toggler Button */}
        <button
          onClick={onThemeToggle}
          className="p-2 border border-neutral-100 dark:border-neutral-800 rounded-xl text-neutral-400 hover:text-black dark:text-neutral-500 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-all"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Notifications Icon Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-2 border border-neutral-100 dark:border-neutral-800 rounded-xl text-neutral-400 hover:text-black dark:text-neutral-500 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-all"
            title="Notifications"
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifMenu(false)} />
              <div className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 rounded-2xl shadow-xl z-50 p-1 fade-in">
                <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-xs font-semibold text-neutral-900 dark:text-white">Alert Logs ({unreadCount})</span>
                  {notifications.length > 0 && (
                    <button 
                      onClick={onClearAll}
                      className="text-[10px] font-medium text-neutral-400 hover:text-red-500 flex items-center gap-1"
                    >
                      <Trash2 size={10} /> Clear
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-neutral-400 text-center py-6 select-none">No notifications yet.</p>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-2.5 border-b last:border-0 border-neutral-50 dark:border-neutral-900/50 flex items-start justify-between gap-2 transition-colors ${n.read ? 'opacity-60' : 'bg-neutral-50/50 dark:bg-neutral-900/30'}`}
                      >
                        <div className="flex-1">
                          <p className="text-[11px] leading-relaxed text-neutral-800 dark:text-neutral-200">{n.text}</p>
                          <span className="text-[9px] text-neutral-400 block mt-1">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {!n.read && (
                          <button
                            onClick={() => onMarkRead(n.id)}
                            className="p-0.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-black dark:hover:text-white"
                          >
                            <Check size={12} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
