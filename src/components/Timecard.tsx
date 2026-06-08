import React, { useState, useEffect } from 'react';
import { Clock, Play, Square, Calendar } from 'lucide-react';

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  clock_in: string;
  clock_out: string | null;
  hours_worked: number;
  status: 'On Time' | 'Late' | 'Absent';
}

interface TimecardProps {
  currentUser: any;
  isOfflineMode: boolean;
  supabase: any;
}

export const Timecard: React.FC<TimecardProps> = ({ currentUser, isOfflineMode, supabase }) => {
  const [clockRecord, setClockRecord] = useState<AttendanceRecord | null>(null);
  const [logs, setLogs] = useState<AttendanceRecord[]>([]);
  const [time, setTime] = useState<string>('');
  const [sessionHours, setSessionHours] = useState<string>('0.00 hrs');
  const [loading, setLoading] = useState(false);

  // Digital clock tick
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now.toTimeString().split(' ')[0]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Live session hours ticker
  useEffect(() => {
    if (!clockRecord) {
      setSessionHours('0.00 hrs');
      return;
    }
    const [inH, inM, inS] = clockRecord.clock_in.split(':').map(Number);
    const inDate = new Date();
    inDate.setHours(inH, inM, inS);

    const interval = setInterval(() => {
      const now = new Date();
      const diffMs = now.getTime() - inDate.getTime();
      const hours = diffMs / (1000 * 60 * 60);
      setSessionHours(`${hours.toFixed(2)} hrs`);
    }, 1000);

    return () => clearInterval(interval);
  }, [clockRecord]);

  // Fetch attendance logs
  const fetchLogs = async () => {
    setLoading(true);
    if (isOfflineMode) {
      const localData = localStorage.getItem('emp_react_attendance');
      const allLogs = localData ? JSON.parse(localData) : [];
      const userLogs = allLogs.filter((l: any) => l.employee_id === currentUser.id);
      setLogs(userLogs);
      
      const todayStr = new Date().toISOString().split('T')[0];
      const todayRecord = userLogs.find((l: any) => l.date === todayStr && !l.clock_out);
      setClockRecord(todayRecord || null);
    } else if (supabase) {
      try {
        const { data, error } = await supabase
          .from('attendance')
          .select('*')
          .eq('employee_id', currentUser.id)
          .order('date', { ascending: false });

        if (data) {
          setLogs(data);
          const todayStr = new Date().toISOString().split('T')[0];
          const active = data.find((l: any) => l.date === todayStr && !l.clock_out);
          setClockRecord(active || null);
        }
      } catch (err) {
        console.error('Error fetching attendance logs:', err);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [currentUser.id]);

  const handleClockAction = async () => {
    setLoading(true);
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    if (clockRecord) {
      // Clock out
      const [inH, inM, inS] = clockRecord.clock_in.split(':').map(Number);
      const inDate = new Date();
      inDate.setHours(inH, inM, inS);
      const diffMs = now.getTime() - inDate.getTime();
      const hours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

      if (isOfflineMode) {
        const localData = localStorage.getItem('emp_react_attendance');
        let allLogs = localData ? JSON.parse(localData) : [];
        allLogs = allLogs.map((l: any) => 
          l.id === clockRecord.id 
            ? { ...l, clock_out: timeStr, hours_worked: hours } 
            : l
        );
        localStorage.setItem('emp_react_attendance', JSON.stringify(allLogs));
        alert(`Clocked out. Worked: ${hours} hrs.`);
        fetchLogs();
      } else if (supabase) {
        try {
          const { error } = await supabase
            .from('attendance')
            .update({ clock_out: timeStr, hours_worked: hours })
            .eq('id', clockRecord.id);

          if (!error) {
            alert(`Clocked out. Worked: ${hours} hrs.`);
            fetchLogs();
          } else {
            alert(error.message);
          }
        } catch (err: any) {
          alert(err.message);
        }
      }
    } else {
      // Clock in
      const [hours, minutes] = timeStr.split(':').map(Number);
      const isLate = hours > 9 || (hours === 9 && minutes > 5);
      const status = isLate ? 'Late' : 'On Time';

      const newRecord = {
        id: `att-${Date.now()}`,
        employee_id: currentUser.id,
        date: todayStr,
        clock_in: timeStr,
        clock_out: null,
        hours_worked: 0,
        status: status as any
      };

      if (isOfflineMode) {
        const localData = localStorage.getItem('emp_react_attendance');
        const allLogs = localData ? JSON.parse(localData) : [];
        allLogs.push(newRecord);
        localStorage.setItem('emp_react_attendance', JSON.stringify(allLogs));
        alert(`Clocked in successfully (${status}).`);
        fetchLogs();
      } else if (supabase) {
        try {
          // Remove client temporary ID for database insertion
          const { id, ...dbInsertData } = newRecord;
          const { error } = await supabase
            .from('attendance')
            .insert(dbInsertData);

          if (!error) {
            alert(`Clocked in successfully (${status}).`);
            fetchLogs();
          } else {
            alert(error.message);
          }
        } catch (err: any) {
          alert(err.message);
        }
      }
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
        <h2 className="font-heading font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">Time Punch Card</h2>
        <p className="text-[10px] text-neutral-400">Punctuality log and active shift controls</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Punch controls */}
        <div className="lg:col-span-5 bg-white border border-neutral-100 dark:bg-neutral-950 dark:border-neutral-900 p-6 rounded-2xl shadow-soft text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-200 dark:bg-neutral-800">
            {clockRecord && <div className="h-full bg-black dark:bg-white animate-pulse" style={{ width: '100%' }}></div>}
          </div>
          
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Digital Clock</span>
            <div className="text-3xl font-bold font-mono tracking-tight">{time || '00:00:00'}</div>
          </div>

          <div className="flex flex-col items-center justify-center py-4">
            <button
              onClick={handleClockAction}
              disabled={loading}
              className={`w-28 h-28 rounded-full border-2 flex flex-col items-center justify-center gap-1.5 transition-all shadow-md focus:outline-none ${clockRecord ? 'border-neutral-800 text-neutral-800 hover:bg-neutral-50 dark:border-white dark:text-white dark:hover:bg-neutral-900' : 'border-black bg-black text-white hover:bg-neutral-900 dark:border-white dark:bg-white dark:text-black dark:hover:bg-neutral-100'}`}
            >
              {clockRecord ? <Square size={20} /> : <Play size={20} className="ml-1" />}
              <span className="text-xs font-bold uppercase tracking-wider">{clockRecord ? 'Clock Out' : 'Clock In'}</span>
            </button>
          </div>

          <div className="text-xs font-medium space-y-1.5 border-t border-neutral-50 dark:border-neutral-900/50 pt-4">
            <div className="flex justify-between text-neutral-400">
              <span>Shift Status</span>
              <span className={`font-bold ${clockRecord ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`}>
                {clockRecord ? (clockRecord.status === 'Late' ? 'Late Active' : 'Active Shift') : 'Punch Clock Out'}
              </span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Worked Session</span>
              <span className="font-mono font-bold text-neutral-900 dark:text-white">{sessionHours}</span>
            </div>
          </div>
        </div>

        {/* History table */}
        <div className="lg:col-span-7 bg-white border border-neutral-100 dark:bg-neutral-950 dark:border-neutral-900 p-5 rounded-2xl shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-50 dark:border-neutral-900/50 pb-2.5">
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-neutral-400">Attendance Log history</h3>
            <Calendar size={14} className="text-neutral-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs select-none">
              <thead>
                <tr className="text-neutral-400 font-bold border-b border-neutral-100 dark:border-neutral-900">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Clock In</th>
                  <th className="pb-2">Clock Out</th>
                  <th className="pb-2">Worked</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-neutral-900/40">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-neutral-400">No shift logs found.</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="text-neutral-500">
                      <td className="py-2.5 font-medium">{log.date}</td>
                      <td className="py-2.5 font-mono">{log.clock_in}</td>
                      <td className="py-2.5 font-mono">
                        {log.clock_out || <span className="text-neutral-900 dark:text-white italic animate-pulse font-bold">Active</span>}
                      </td>
                      <td className="py-2.5">{log.hours_worked ? `${log.hours_worked} hrs` : '-'}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-semibold ${log.status === 'Late' ? 'border-neutral-400 text-neutral-500 bg-neutral-50 dark:bg-neutral-900' : 'border-neutral-800 text-neutral-800 dark:border-white dark:text-white'}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
