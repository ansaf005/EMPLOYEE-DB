import React from 'react';
import { 
  Bell, 
  Trash2, 
  Check, 
  Calendar, 
  Briefcase, 
  Activity, 
  Award, 
  AlertTriangle 
} from 'lucide-react';
import { Notification } from '../data/mockData';

interface NotificationHubProps {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

export const NotificationHub: React.FC<NotificationHubProps> = ({ 
  notifications, 
  setNotifications 
}) => {
  
  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    alert("All notifications marked as read.");
  };

  const handleClear = () => {
    setNotifications([]);
    alert("Audit notification log cleared.");
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'deadline': return <AlertTriangle size={14} className="text-neutral-500" />;
      case 'project': return <Briefcase size={14} className="text-neutral-500" />;
      case 'attendance': return <Calendar size={14} className="text-neutral-500" />;
      case 'achievement': return <Award size={14} className="text-neutral-500" />;
      default: return <Bell size={14} className="text-neutral-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
        <div>
          <h2 className="font-heading font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">Alert Center</h2>
          <p className="text-[10px] text-neutral-400">System alerts, deadlines, and logs</p>
        </div>
        
        {notifications.length > 0 && (
          <div className="flex gap-2">
            <button 
              onClick={handleMarkAllRead}
              className="text-xs py-2 px-3 border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-xl flex items-center gap-1.5 font-medium"
            >
              <Check size={14} /> Read All
            </button>
            <button 
              onClick={handleClear}
              className="text-xs py-2 px-3 border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-xl flex items-center gap-1.5 font-medium text-red-500 hover:text-red-600"
            >
              <Trash2 size={14} /> Clear Log
            </button>
          </div>
        )}
      </div>

      {/* Notifications Log */}
      <div className="max-w-3xl mx-auto bg-white border border-neutral-100 rounded-2xl shadow-soft dark:bg-neutral-950 dark:border-neutral-900 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-16 text-center text-neutral-400">
            <Bell className="mx-auto text-neutral-200 dark:text-neutral-800 mb-3" size={36} />
            <p className="text-xs">All caught up! Notification center is clear.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-50 dark:divide-neutral-900/50">
            {notifications.map((n) => (
              <div 
                key={n.id}
                className={`p-4.5 flex items-start gap-4 transition-colors ${n.read ? 'opacity-50' : 'bg-neutral-50/20 dark:bg-neutral-900/10'}`}
              >
                <div className="p-2 border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 rounded-xl shrink-0">
                  {getNotifIcon(n.type)}
                </div>
                
                <div className="space-y-0.5 min-w-0 flex-1">
                  <span className="text-[9px] font-mono text-neutral-400 block uppercase tracking-wider">{n.type} alert</span>
                  <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed pr-6">{n.text}</p>
                  <span className="text-[10px] text-neutral-400 block pt-1">
                    {new Date(n.timestamp).toLocaleString()}
                  </span>
                </div>

                {!n.read && (
                  <button 
                    onClick={() => {
                      setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                    }}
                    className="p-1 border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white shrink-0"
                    title="Mark as Read"
                  >
                    <Check size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
