import React from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  User, 
  Shield, 
  Briefcase, 
  DollarSign, 
  Star,
  CheckCircle,
  FileText
} from 'lucide-react';
import { Employee, calculateProductivityScore } from '../data/mockData';

interface EmployeeProfileProps {
  employee: Employee;
  onClose: () => void;
}

export const EmployeeProfile: React.FC<EmployeeProfileProps> = ({ employee, onClose }) => {
  const productivity = calculateProductivityScore(employee);

  // SVG Progress Ring calculations
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (employee.currentProgress / 100) * circumference;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white dark:bg-neutral-950 border-l border-neutral-100 dark:border-neutral-800 shadow-2xl z-50 flex flex-col justify-between overflow-hidden transition-all duration-300 animate-slide-in">
      {/* Header */}
      <div className="h-16 px-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between shrink-0">
        <h2 className="font-heading font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">Employee Performance Dossier</h2>
        <button 
          onClick={onClose}
          className="p-1.5 rounded-lg border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-400 hover:text-black dark:hover:text-white"
        >
          <X size={15} />
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Profile Header Grid */}
        <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-neutral-100 dark:border-neutral-800 pb-6">
          <div className="w-24 h-24 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center font-bold text-3xl text-neutral-800 dark:text-neutral-200 border-2 border-neutral-200 dark:border-neutral-800 shrink-0">
            {employee.photo}
          </div>
          <div className="flex-1 text-center sm:text-left space-y-1">
            <h3 className="font-heading font-bold text-xl text-neutral-900 dark:text-white">{employee.name}</h3>
            <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">{employee.designation}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mt-2">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 font-medium">{employee.department}</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 font-medium">{employee.level} Level</span>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${employee.status === 'Active' ? 'bg-neutral-100 text-neutral-950 dark:bg-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700' : 'bg-neutral-50 text-neutral-400 dark:bg-neutral-950 dark:text-neutral-600 border border-neutral-100 dark:border-neutral-900'}`}>
                {employee.status}
              </span>
            </div>
          </div>
        </div>

        {/* Progress & Metrics Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-100 dark:border-neutral-900 rounded-2xl p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Deliveries Rate</span>
              <span className="text-2xl font-bold font-heading text-neutral-900 dark:text-white">{employee.currentProgress}%</span>
              <p className="text-[9px] text-neutral-400">Task completion percentage</p>
            </div>
            
            {/* Custom SVG Grayscale Progress Ring */}
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r={radius} stroke="#e5e5e5" strokeWidth="6" fill="transparent" className="dark:stroke-neutral-800" />
                <circle 
                  cx="48" 
                  cy="48" 
                  r={radius} 
                  stroke="#171717" 
                  strokeWidth="6" 
                  fill="transparent" 
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="dark:stroke-white transition-all duration-500"
                />
              </svg>
              <span className="absolute text-[11px] font-bold font-heading">{employee.currentProgress}%</span>
            </div>
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-100 dark:border-neutral-900 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Productivity Score</span>
              <span className="text-2xl font-bold font-heading text-neutral-900 dark:text-white">{productivity}%</span>
            </div>
            <div className="space-y-1 mt-3">
              <div className="flex justify-between text-[9px] text-neutral-400 font-medium">
                <span>Logged: {employee.productiveHours} hrs</span>
                <span>Quota: {employee.workingHours} hrs</span>
              </div>
              <div className="h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-black dark:bg-white rounded-full" style={{ width: `${productivity}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Info sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Personal Metadata */}
          <div className="space-y-4">
            <h4 className="font-heading font-bold text-xs uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">Personal Metadata</h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-3"><Mail size={14} className="text-neutral-400 shrink-0" /> <span className="text-neutral-600 dark:text-neutral-400 truncate">{employee.email}</span></li>
              <li className="flex items-center gap-3"><Phone size={14} className="text-neutral-400 shrink-0" /> <span className="text-neutral-600 dark:text-neutral-400">{employee.phone}</span></li>
              <li className="flex items-center gap-3"><MapPin size={14} className="text-neutral-400 shrink-0" /> <span className="text-neutral-600 dark:text-neutral-400 truncate">{employee.address}</span></li>
              <li className="flex items-center gap-3"><Calendar size={14} className="text-neutral-400 shrink-0" /> <span className="text-neutral-600 dark:text-neutral-400">DOB: {employee.dob}</span></li>
              <li className="flex items-center gap-3"><User size={14} className="text-neutral-400 shrink-0" /> <span className="text-neutral-600 dark:text-neutral-400 text-[10px] leading-tight">Emergency: {employee.emergencyContact}</span></li>
            </ul>
          </div>

          {/* Professional Metadata */}
          <div className="space-y-4">
            <h4 className="font-heading font-bold text-xs uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">Professional Info</h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-3"><Briefcase size={14} className="text-neutral-400 shrink-0" /> <span className="text-neutral-600 dark:text-neutral-400">Exp: {employee.experience}</span></li>
              <li className="flex items-center gap-3"><DollarSign size={14} className="text-neutral-400 shrink-0" /> <span className="text-neutral-600 dark:text-neutral-400">Salary: {employee.salary}</span></li>
              <li className="flex items-center gap-3"><Shield size={14} className="text-neutral-400 shrink-0" /> <span className="text-neutral-600 dark:text-neutral-400">Manager: {employee.reportingManager}</span></li>
              <li className="flex items-center gap-3"><Star size={14} className="text-neutral-400 shrink-0" /> <span className="text-neutral-600 dark:text-neutral-400">Rating: {employee.performanceRating} / 5.0</span></li>
              <li className="flex items-center gap-3"><Calendar size={14} className="text-neutral-400 shrink-0" /> <span className="text-neutral-600 dark:text-neutral-400">Hired: {employee.joiningDate}</span></li>
            </ul>
          </div>
        </div>

        {/* Skills Section */}
        <div className="space-y-3">
          <h4 className="font-heading font-bold text-xs uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">Core Skill Competency</h4>
          <div className="flex flex-wrap gap-1.5">
            {employee.skills.map((skill, idx) => (
              <span key={idx} className="text-[10px] px-2.5 py-1 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Timeline Event Checklist */}
        <div className="space-y-4">
          <h4 className="font-heading font-bold text-xs uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">Historical Timeline</h4>
          <div className="border-l border-neutral-100 dark:border-neutral-800 ml-2.5 space-y-4">
            {employee.timeline.map((event) => (
              <div key={event.id} className="relative pl-6">
                <div className="absolute -left-1.5 top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-black dark:bg-black dark:border-white flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
                </div>
                
                <div className="space-y-0.5">
                  <span className="text-[9px] font-semibold text-neutral-400 block">{event.date}</span>
                  <span className="text-xs font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    {event.title}
                    <span className="text-[8px] uppercase tracking-widest px-1.5 py-0.25 rounded-md bg-neutral-100 dark:bg-neutral-900 text-neutral-400 font-bold font-heading">
                      {event.type}
                    </span>
                  </span>
                  <p className="text-[11px] text-neutral-400">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Details */}
      <div className="h-16 px-6 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/20 flex items-center justify-between shrink-0 text-[10px] text-neutral-400">
        <span>Employee UID: {employee.id}</span>
        <span>Joining Date: {employee.joiningDate}</span>
      </div>
    </div>
  );
};
