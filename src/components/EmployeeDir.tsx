import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  UserPlus, 
  X,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { Employee, Task, calculateProductivityScore } from '../data/mockData';
import { EmployeeProfile } from './EmployeeProfile';

interface EmployeeDirProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  tasks: Task[];
  searchQuery: string;
}

export const EmployeeDir: React.FC<EmployeeDirProps> = ({ 
  employees, 
  setEmployees, 
  tasks,
  searchQuery 
}) => {
  // Navigation & Drawer States
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);

  // Filters State
  const [deptFilter, setDeptFilter] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortField, setSortField] = useState<keyof Employee>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // Add / Edit Form Inputs
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDesignation, setFormDesignation] = useState('');
  const [formDepartment, setFormDepartment] = useState('Development');
  const [formLevel, setFormLevel] = useState<'Junior' | 'Mid' | 'Senior' | 'Lead'>('Mid');
  const [formStatus, setFormStatus] = useState<'Active' | 'On Leave' | 'Inactive'>('Active');
  const [formSalary, setFormSalary] = useState('');
  const [formManager, setFormManager] = useState('Sarah Jenkins');
  const [formSkills, setFormSkills] = useState('');

  // Search & Filters compute
  const filtered = employees.filter(emp => {
    const matchSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        emp.designation.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchDept = deptFilter === '' || emp.department === deptFilter;
    const matchLevel = levelFilter === '' || emp.level === levelFilter;
    const matchStatus = statusFilter === '' || emp.status === statusFilter;

    return matchSearch && matchDept && matchLevel && matchStatus;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    }
    return 0;
  });

  // Pagination slicing
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (field: keyof Employee) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Open Form modal
  const openForm = (emp: Employee | null = null) => {
    if (emp) {
      setEditingEmp(emp);
      setFormName(emp.name);
      setFormEmail(emp.email);
      setFormPhone(emp.phone);
      setFormDesignation(emp.designation);
      setFormDepartment(emp.department);
      setFormLevel(emp.level);
      setFormStatus(emp.status);
      setFormSalary(emp.salary);
      setFormManager(emp.reportingManager);
      setFormSkills(emp.skills.join(', '));
    } else {
      setEditingEmp(null);
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      setFormDesignation('');
      setFormDepartment('Development');
      setFormLevel('Mid');
      setFormStatus('Active');
      setFormSalary('$80,000');
      setFormManager('Sarah Jenkins');
      setFormSkills('');
    }
    setShowFormModal(true);
  };

  // Submit Add / Edit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmp) {
      // Edit
      setEmployees(prev => prev.map(emp => emp.id === editingEmp.id ? {
        ...emp,
        name: formName,
        email: formEmail,
        phone: formPhone,
        designation: formDesignation,
        department: formDepartment,
        level: formLevel,
        status: formStatus,
        salary: formSalary,
        reportingManager: formManager,
        skills: formSkills.split(',').map(s => s.trim()).filter(Boolean)
      } : emp));
      alert("Employee profile updated.");
    } else {
      // Add
      const newId = `EMP-0${employees.length + 1}`;
      const initials = formName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      const newEmp: Employee = {
        id: newId,
        photo: initials || 'EE',
        name: formName,
        email: formEmail,
        phone: formPhone,
        emergencyContact: 'Not Configured',
        address: 'HQ Office',
        dob: '1995-01-01',
        joiningDate: new Date().toISOString().split('T')[0],
        designation: formDesignation,
        department: formDepartment,
        level: formLevel,
        assignedProjects: [],
        tasksCompleted: 0,
        currentProgress: 0,
        status: formStatus,
        reportingManager: formManager,
        skills: formSkills.split(',').map(s => s.trim()).filter(Boolean),
        experience: '1 Year',
        salary: formSalary,
        performanceRating: 5.0,
        productiveHours: 0,
        workingHours: 168,
        timeline: [
          { id: `t-${Date.now()}`, date: new Date().toISOString().split('T')[0], title: 'Onboarded', description: 'Joined the company database.', type: 'promotion' }
        ]
      };
      setEmployees(prev => [...prev, newEmp]);
      alert("New employee added.");
    }
    setShowFormModal(false);
  };

  // Delete
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from the database?`)) {
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      alert("Employee deleted.");
    }
  };

  // Exporters
  const exportToCSV = () => {
    const headers = ['Employee ID', 'Full Name', 'Designation', 'Department', 'Level', 'Tasks Completed', 'Progress %', 'Email', 'Status'];
    const rows = filtered.map(e => [
      e.id, e.name, e.designation, e.department, e.level, e.tasksCompleted, e.currentProgress, e.email, e.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Employees_Directory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    const dataToExport = filtered.map(e => ({
      'Employee ID': e.id,
      'Full Name': e.name,
      'Designation': e.designation,
      'Department': e.department,
      'Level': e.level,
      'Tasks Completed': e.tasksCompleted,
      'Progress %': e.currentProgress,
      'Email': e.email,
      'Status': e.status,
      'Joining Date': e.joiningDate
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees Directory");
    XLSX.writeFile(wb, `Employees_Directory_${Date.now()}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Search and Toolbars */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Filters Panel */}
        <div className="flex flex-wrap gap-2 items-center">
          <select 
            value={deptFilter} 
            onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-lg p-2 text-black dark:text-white"
          >
            <option value="">All Departments</option>
            <option value="HR">HR</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
            <option value="Development">Development</option>
            <option value="Design">Design</option>
            <option value="Operations">Operations</option>
            <option value="Finance">Finance</option>
          </select>

          <select 
            value={levelFilter} 
            onChange={(e) => { setLevelFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-lg p-2 text-black dark:text-white"
          >
            <option value="">All Levels</option>
            <option value="Junior">Junior</option>
            <option value="Mid">Mid</option>
            <option value="Senior">Senior</option>
            <option value="Lead">Lead</option>
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-lg p-2 text-black dark:text-white"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Action triggers */}
        <div className="flex items-center gap-2">
          <button 
            onClick={exportToCSV}
            className="text-xs py-2 px-3 border border-neutral-100 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900/50 flex items-center gap-1.5 font-medium"
            title="Download CSV"
          >
            <FileText size={14} /> CSV
          </button>
          
          <button 
            onClick={exportToExcel}
            className="text-xs py-2 px-3 border border-neutral-100 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900/50 flex items-center gap-1.5 font-medium"
            title="Download Excel"
          >
            <FileSpreadsheet size={14} /> Excel
          </button>

          <button 
            onClick={() => openForm()}
            className="text-xs py-2 px-4.5 bg-black text-white dark:bg-white dark:text-black hover:opacity-90 rounded-xl flex items-center gap-1.5 font-semibold transition-all shadow-sm"
          >
            <Plus size={14} /> Add Employee
          </button>
        </div>
      </div>

      {/* Directory Grid Table */}
      <div className="bg-white border border-neutral-100 rounded-2xl shadow-soft dark:bg-neutral-950 dark:border-neutral-900 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs select-none">
            <thead>
              <tr className="bg-neutral-50/50 dark:bg-neutral-900/20 text-neutral-400 font-bold font-heading border-b border-neutral-100 dark:border-neutral-900">
                <th className="p-4 cursor-pointer" onClick={() => handleSort('id')}>Employee ID</th>
                <th className="p-4">Staff</th>
                <th className="p-4 cursor-pointer" onClick={() => handleSort('department')}>Department</th>
                <th className="p-4 cursor-pointer" onClick={() => handleSort('level')}>Level</th>
                <th className="p-4">Assigned Projects</th>
                <th className="p-4 cursor-pointer" onClick={() => handleSort('tasksCompleted')}>Completed Tasks</th>
                <th className="p-4 cursor-pointer" onClick={() => handleSort('currentProgress')}>Progress %</th>
                <th className="p-4 cursor-pointer" onClick={() => handleSort('status')}>Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-neutral-400">No employees registered match search query filters.</td>
                </tr>
              ) : (
                paginated.map((emp) => (
                  <tr 
                    key={emp.id}
                    className="border-b border-neutral-50 last:border-0 dark:border-neutral-900/50 hover:bg-neutral-50/30 dark:hover:bg-neutral-900/10 cursor-pointer"
                    onClick={() => setSelectedEmp(emp)}
                  >
                    <td className="p-4 font-mono font-medium text-neutral-400">{emp.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center font-bold text-[10px] text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800">
                          {emp.photo}
                        </div>
                        <div>
                          <p className="font-semibold text-black dark:text-white text-xs">{emp.name}</p>
                          <p className="text-[10px] text-neutral-400">{emp.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-neutral-600 dark:text-neutral-400">{emp.department}</td>
                    <td className="p-4 text-neutral-600 dark:text-neutral-400">{emp.level}</td>
                    <td className="p-4 text-neutral-500 max-w-40 truncate" title={emp.assignedProjects.join(', ')}>
                      {emp.assignedProjects.join(', ') || '-'}
                    </td>
                    <td className="p-4 font-semibold text-neutral-800 dark:text-neutral-300 text-center">{emp.tasksCompleted}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="w-8 font-semibold">{emp.currentProgress}%</span>
                        <div className="flex-1 h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden w-20">
                          <div className="h-full bg-black dark:bg-white" style={{ width: `${emp.currentProgress}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${emp.status === 'Active' ? 'bg-neutral-100 text-black border-neutral-300 dark:bg-neutral-900 dark:text-white dark:border-neutral-700' : 'bg-neutral-50 text-neutral-400 border-neutral-100 dark:bg-neutral-950 dark:text-neutral-600 dark:border-neutral-900'}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => openForm(emp)}
                          className="p-1 text-neutral-400 hover:text-black dark:hover:text-white border border-neutral-100 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900"
                        >
                          <Edit size={12} />
                        </button>
                        <button 
                          onClick={() => handleDelete(emp.id, emp.name)}
                          className="p-1 text-neutral-400 hover:text-red-500 border border-neutral-100 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div className="h-12 border-t border-neutral-50 dark:border-neutral-900 px-4 flex items-center justify-between text-neutral-400">
            <span className="text-[10px]">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-1.5">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 border border-neutral-100 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1 border border-neutral-100 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-out Employee Detail Drawer */}
      {selectedEmp && (
        <EmployeeProfile 
          employee={selectedEmp} 
          onClose={() => setSelectedEmp(null)} 
        />
      )}

      {/* Add / Edit Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-neutral-100 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl dark:bg-neutral-950 dark:border-neutral-900 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="font-heading font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">
                {editingEmp ? `Edit: ${editingEmp.id}` : 'Create Employee Record'}
              </h3>
              <button 
                onClick={() => setShowFormModal(false)}
                className="p-1 text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Full Name</label>
                  <input type="text" value={formName} onChange={e => setFormName(e.target.value)} required className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-2 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Email Address</label>
                  <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} required className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-2 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Contact Number</label>
                  <input type="text" value={formPhone} onChange={e => setFormPhone(e.target.value)} className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-2 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Designation</label>
                  <input type="text" value={formDesignation} onChange={e => setFormDesignation(e.target.value)} required className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-2 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white" placeholder="Senior Architect" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Department</label>
                  <select value={formDepartment} onChange={e => setFormDepartment(e.target.value)} className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-2 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white">
                    <option value="HR">HR</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Level</label>
                  <select value={formLevel} onChange={e => setFormLevel(e.target.value as any)} className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-2 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white">
                    <option value="Junior">Junior</option>
                    <option value="Mid">Mid</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Status</label>
                  <select value={formStatus} onChange={e => setFormStatus(e.target.value as any)} className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-2 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white">
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Salary</label>
                  <input type="text" value={formSalary} onChange={e => setFormSalary(e.target.value)} className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-2 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Reporting Manager</label>
                  <input type="text" value={formManager} onChange={e => setFormManager(e.target.value)} className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-2 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Skills (comma separated)</label>
                <input type="text" value={formSkills} onChange={e => setFormSkills(e.target.value)} placeholder="React, Node.js, AWS" className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-2 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white" />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button 
                  type="button" 
                  onClick={() => setShowFormModal(false)}
                  className="py-2 px-4 border border-neutral-100 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="py-2 px-4.5 bg-black text-white dark:bg-white dark:text-black rounded-xl hover:opacity-90 font-semibold transition-all"
                >
                  {editingEmp ? 'Save Profile' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
