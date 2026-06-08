import React, { useState } from 'react';
import { 
  Plus, 
  User, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Paperclip, 
  MoreVertical,
  X,
  FileText
} from 'lucide-react';
import { Employee, Project, Task } from '../data/mockData';

interface TasksProjectsProps {
  employees: Employee[];
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  addNotification: (text: string, type: 'deadline' | 'project' | 'achievement' | 'performance' | 'attendance') => void;
  searchQuery: string;
}

export const TasksProjects: React.FC<TasksProjectsProps> = ({
  employees,
  projects,
  setProjects,
  tasks,
  setTasks,
  addNotification,
  searchQuery
}) => {
  // Modal States
  const [showTaskModal, setShowTaskModal] = useState<boolean>(false);
  const [showProjectModal, setShowProjectModal] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Form States - New Task
  const [taskName, setTaskName] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [taskNotes, setTaskNotes] = useState('');
  const [taskAttachment, setTaskAttachment] = useState('');

  // Form States - New Project
  const [projName, setProjName] = useState('');
  const [projPriority, setProjPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [projMembers, setProjMembers] = useState<string[]>([]);
  const [projStart, setProjStart] = useState('');
  const [projEnd, setProjEnd] = useState('');

  // Form States - Update Progress slider
  const [updateProgVal, setUpdateProgVal] = useState<number>(0);

  // Filters computed
  const filteredTasks = tasks.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        t.notes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  const filteredProjects = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  // Submit Task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const assignee = employees.find(emp => emp.id === taskAssignee);
    const newId = `TSK-${Math.floor(100 + Math.random() * 900)}`;
    const newTask: Task = {
      id: newId,
      name: taskName,
      assignedEmployee: taskAssignee || 'Unassigned',
      dueDate: taskDueDate,
      priority: taskPriority,
      progress: 0,
      notes: taskNotes,
      attachments: taskAttachment ? [taskAttachment] : []
    };

    setTasks(prev => [newTask, ...prev]);
    addNotification(
      `New task assigned: "${taskName}" was allocated to ${assignee ? assignee.name : 'Teammate'}.`,
      'project'
    );
    alert(`Task ${newId} created.`);
    setShowTaskModal(false);
  };

  // Submit Project
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `PRJ-${Math.floor(100 + Math.random() * 900)}`;
    const newProj: Project = {
      id: newId,
      name: projName,
      members: projMembers,
      startDate: projStart,
      endDate: projEnd,
      progress: 0,
      priority: projPriority,
      status: 'Not Started'
    };

    setProjects(prev => [newProj, ...prev]);
    addNotification(`Project launched: "${projName}" is officially active.`, 'project');
    alert(`Project ${newId} created.`);
    setShowProjectModal(false);
  };

  // Open Update Progress Modal
  const openProgressUpdate = (t: Task) => {
    setSelectedTask(t);
    setUpdateProgVal(t.progress);
  };

  const submitProgressUpdate = () => {
    if (!selectedTask) return;

    setTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, progress: updateProgVal } : t));
    
    // Automatically trigger notification if progress hits 100% (Completed)
    if (updateProgVal === 100) {
      const assignee = employees.find(e => e.id === selectedTask.assignedEmployee);
      addNotification(
        `${assignee ? assignee.name : 'Employee'} completed task "${selectedTask.name}".`,
        'achievement'
      );
    }
    
    setSelectedTask(null);
    alert("Task progress updated successfully.");
  };

  const getPriorityStyle = (p: string) => {
    switch (p) {
      case 'Critical': return 'border-neutral-800 text-neutral-800 dark:border-white dark:text-white bg-neutral-100 dark:bg-neutral-900';
      case 'High': return 'border-neutral-500 text-neutral-600 dark:border-neutral-400 dark:text-neutral-400';
      case 'Medium': return 'border-neutral-300 text-neutral-500 dark:border-neutral-600 dark:text-neutral-500';
      default: return 'border-neutral-100 text-neutral-400 dark:border-neutral-800 dark:text-neutral-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">Productivity Deliverables</h2>
          <p className="text-[10px] text-neutral-400">Allocate and track projects and tasks</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowProjectModal(true)}
            className="text-xs py-2 px-3 border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 rounded-xl flex items-center gap-1.5 font-medium"
          >
            <Plus size={14} /> New Project
          </button>
          
          <button 
            onClick={() => {
              setTaskName('');
              setTaskAssignee(employees[0]?.id || '');
              setTaskDueDate(new Date().toISOString().split('T')[0]);
              setTaskPriority('Medium');
              setTaskNotes('');
              setTaskAttachment('');
              setShowTaskModal(true);
            }}
            className="text-xs py-2 px-4 bg-black text-white dark:bg-white dark:text-black hover:opacity-90 rounded-xl flex items-center gap-1.5 font-semibold transition-all shadow-sm"
          >
            <Plus size={14} /> Assign Task
          </button>
        </div>
      </div>

      {/* Grid: Projects (Left) & Tasks (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Project Tracker List */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-neutral-400">Project Initiatives</h3>
          <div className="grid grid-cols-1 gap-4">
            {filteredProjects.map((proj) => (
              <div 
                key={proj.id}
                className="bg-white border border-neutral-100 rounded-2xl shadow-soft p-5 dark:bg-neutral-950 dark:border-neutral-900 space-y-3 cursor-default"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-heading font-bold text-sm text-neutral-900 dark:text-white">{proj.name}</h4>
                    <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">{proj.id}</span>
                  </div>
                  <span className={`text-[10px] border px-2.5 py-0.5 rounded-full font-medium ${getPriorityStyle(proj.priority)}`}>
                    {proj.priority} Priority
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[10px] text-neutral-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} />
                    <span>{proj.startDate} to {proj.endDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <User size={12} />
                    <span className="truncate max-w-28">{proj.members.join(', ')}</span>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] font-semibold">
                    <span className="text-neutral-400">Initiative Progress</span>
                    <span className="text-neutral-800 dark:text-neutral-200">{proj.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-neutral-100 dark:bg-neutral-900 rounded-full overflow-hidden">
                    <div className="h-full bg-black dark:bg-white rounded-full transition-all duration-300" style={{ width: `${proj.progress}%` }}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-50 dark:border-neutral-900/50">
                  <span className="text-[9px] font-bold uppercase tracking-wide text-neutral-400">Status</span>
                  <span className={`text-[10px] font-semibold ${proj.status === 'Completed' ? 'text-neutral-900 dark:text-neutral-100 font-bold' : 'text-neutral-400'}`}>
                    {proj.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks Management List */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-neutral-400 font-heading">Individual Tasks</h3>
          <div className="bg-white border border-neutral-100 rounded-2xl shadow-soft p-4 dark:bg-neutral-950 dark:border-neutral-900 divide-y divide-neutral-50 dark:divide-neutral-900/50">
            {filteredTasks.map((t) => {
              const emp = employees.find(e => e.id === t.assignedEmployee);
              const isDone = t.progress === 100;

              return (
                <div key={t.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3 group">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] uppercase tracking-wider px-2 py-0.25 rounded-md border font-semibold ${getPriorityStyle(t.priority)}`}>
                        {t.priority}
                      </span>
                      <span className="text-[9px] font-mono text-neutral-400">{t.id}</span>
                    </div>

                    <h4 
                      onClick={() => openProgressUpdate(t)}
                      className={`text-xs font-semibold cursor-pointer hover:underline truncate text-neutral-900 dark:text-white ${isDone ? 'line-through opacity-50' : ''}`}
                    >
                      {t.name}
                    </h4>

                    <p className="text-[10px] text-neutral-400 truncate pr-6">{t.notes}</p>
                    
                    <div className="flex items-center gap-3 text-[9px] text-neutral-400 pt-0.5">
                      <span className="font-medium text-neutral-600 dark:text-neutral-300">Assignee: {emp ? emp.name : 'Unassigned'}</span>
                      <span className="flex items-center gap-1"><Clock size={10} /> {t.dueDate}</span>
                      {t.attachments.length > 0 && <span className="flex items-center gap-0.5"><Paperclip size={10} /> {t.attachments.length}</span>}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-[10px] font-bold font-heading">{t.progress}%</span>
                    <button 
                      onClick={() => openProgressUpdate(t)}
                      className="text-[10px] font-semibold py-1 px-2.5 border border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900 rounded-lg text-neutral-500 hover:text-black dark:hover:text-white"
                    >
                      Update
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Task Creation Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-neutral-100 rounded-2xl w-full max-w-md shadow-2xl dark:bg-neutral-950 dark:border-neutral-900 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="font-heading font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">Assign Task</h3>
              <button onClick={() => setShowTaskModal(false)} className="p-1 text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg"><X size={15} /></button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Task Name</label>
                <input type="text" value={taskName} onChange={e => setTaskName(e.target.value)} required className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-2 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white" placeholder="Integrate Supabase Auth API" />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Assigned Employee</label>
                <select value={taskAssignee} onChange={e => setTaskAssignee(e.target.value)} required className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-2 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white">
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Due Date</label>
                  <input type="date" value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} required className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-2 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Priority</label>
                  <select value={taskPriority} onChange={e => setTaskPriority(e.target.value as any)} className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-2 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Notes / Scope Details</label>
                <textarea value={taskNotes} onChange={e => setTaskNotes(e.target.value)} className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-2 focus:outline-none focus:border-black dark:focus:border-white h-20 text-black dark:text-white" placeholder="Provide task steps..." />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Mock Attachment Filename</label>
                <input type="text" value={taskAttachment} onChange={e => setTaskAttachment(e.target.value)} placeholder="specs.pdf" className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-2 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white" />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button type="button" onClick={() => setShowTaskModal(false)} className="py-2 px-4 border border-neutral-100 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 font-semibold">Cancel</button>
                <button type="submit" className="py-2 px-4.5 bg-black text-white dark:bg-white dark:text-black rounded-xl hover:opacity-90 font-semibold transition-all">Assign Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Creation Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-neutral-100 rounded-2xl w-full max-w-md shadow-2xl dark:bg-neutral-950 dark:border-neutral-900 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="font-heading font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">New Project</h3>
              <button onClick={() => setShowProjectModal(false)} className="p-1 text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg"><X size={15} /></button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Project Name</label>
                <input type="text" value={projName} onChange={e => setProjName(e.target.value)} required className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-2 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white" />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Priority</label>
                <select value={projPriority} onChange={e => setProjPriority(e.target.value as any)} className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-2 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Select Teammates</label>
                <div className="max-h-24 overflow-y-auto border border-neutral-100 dark:border-neutral-800 rounded-xl p-2 space-y-1.5 bg-neutral-50 dark:bg-neutral-900">
                  {employees.map(emp => (
                    <label key={emp.id} className="flex items-center gap-2 cursor-pointer text-[10px] text-neutral-600 dark:text-neutral-400">
                      <input 
                        type="checkbox" 
                        value={emp.name}
                        checked={projMembers.includes(emp.name)}
                        onChange={(e) => {
                          if (e.target.checked) setProjMembers(prev => [...prev, emp.name]);
                          else setProjMembers(prev => prev.filter(n => n !== emp.name));
                        }}
                      />
                      <span>{emp.name} ({emp.designation})</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Start Date</label>
                  <input type="date" value={projStart} onChange={e => setProjStart(e.target.value)} required className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-2 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">End Date</label>
                  <input type="date" value={projEnd} onChange={e => setProjEnd(e.target.value)} required className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-2 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button type="button" onClick={() => setShowProjectModal(false)} className="py-2 px-4 border border-neutral-100 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 font-semibold">Cancel</button>
                <button type="submit" className="py-2 px-4.5 bg-black text-white dark:bg-white dark:text-black rounded-xl hover:opacity-90 font-semibold transition-all">Launch Initiative</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Progress Update Slider Overlay modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-neutral-100 rounded-2xl w-full max-w-sm shadow-2xl dark:bg-neutral-950 dark:border-neutral-900 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="font-heading font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">Update Progress</h3>
              <button onClick={() => setSelectedTask(null)} className="p-1 text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg"><X size={15} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block">Task Selected</span>
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">{selectedTask.name}</p>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Current Progress ({updateProgVal}%)</label>
                <div className="flex items-center gap-3 pt-2">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={updateProgVal} 
                    onChange={(e) => setUpdateProgVal(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="w-10 text-right font-bold text-xs">{updateProgVal}%</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button type="button" onClick={() => setSelectedTask(null)} className="py-2 px-4 border border-neutral-100 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 font-semibold">Cancel</button>
                <button type="button" onClick={submitProgressUpdate} className="py-2 px-4.5 bg-black text-white dark:bg-white dark:text-black rounded-xl hover:opacity-90 font-semibold transition-all">Save Progress</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
