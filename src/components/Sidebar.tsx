import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  TrendingUp, 
  Award, 
  Building2, 
  FileText, 
  Bell, 
  Settings as SettingsIcon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (val: boolean) => void;
  currentUser: any;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
  currentUser,
  onLogout
}) => {
  const isManager = currentUser?.role === 'manager';

  const navItems = isManager ? [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'tasks', label: 'Tasks & Projects', icon: CheckSquare },
    { id: 'progress', label: 'Progress Tracking', icon: TrendingUp },
    { id: 'analytics', label: 'Performance Analytics', icon: Award },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ] : [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'My Tasks', icon: CheckSquare },
    { id: 'timecard', label: 'Time Clock', icon: Clock },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const handleNavClick = (viewId: string) => {
    onViewChange(viewId);
    setMobileOpen(false); // Close drawer on mobile click
  };

  const activeClass = "bg-neutral-100 text-black dark:bg-neutral-900 dark:text-white font-medium";
  const inactiveClass = "text-neutral-500 hover:text-black hover:bg-neutral-50 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-900/50";

  return (
    <>
      {/* Mobile Sidebar backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 bg-white border-r border-neutral-100 dark:bg-black dark:border-neutral-800 
        transition-all duration-300 z-50 flex flex-col justify-between
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div>
          {/* Logo Section */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold font-heading text-lg shrink-0">
                E
              </div>
              {!isCollapsed && (
                <span className="font-heading font-bold text-lg tracking-tight select-none text-black dark:text-white">
                  EmpPulse
                </span>
              )}
            </div>
            
            {/* Desktop Collapse Trigger Button */}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex w-7 h-7 border border-neutral-100 rounded-md items-center justify-center hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900 text-neutral-400 dark:text-neutral-500"
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 py-2 px-3 rounded-xl transition-all ${isActive ? activeClass : inactiveClass}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon size={18} className="shrink-0" />
                  {!isCollapsed && (
                    <span className="text-sm tracking-tight">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer User Info Section */}
        <div className="p-3 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3 py-2 px-2 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center font-bold text-sm shrink-0 border border-neutral-200 dark:border-neutral-800">
              {currentUser?.avatar || (currentUser?.name ? currentUser.name.split(' ').map((n: string)=>n[0]).join('').toUpperCase() : 'A')}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-black dark:text-white truncate">{currentUser?.name || 'Administrator'}</p>
                <p className="text-[10px] text-neutral-400 truncate">{currentUser?.email || 'admin@company.com'}</p>
              </div>
            )}
          </div>
          
          <button 
            onClick={onLogout}
            className={`w-full flex items-center gap-3 py-2 px-3 mt-2 rounded-xl transition-all text-neutral-400 hover:text-black dark:text-neutral-500 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900/50`}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut size={16} className="shrink-0" />
            {!isCollapsed && (
              <span className="text-xs font-medium tracking-tight">Logout</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
