import React, { useState } from 'react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  FileCode, 
  Sparkles,
  CheckCircle,
  FileCheck
} from 'lucide-react';
import { Employee, Project, Task, calculateProductivityScore, getDepartmentsSummary } from '../data/mockData';

interface ReportsModuleProps {
  employees: Employee[];
  projects: Project[];
  tasks: Task[];
}

type ReportType = 'performance' | 'department' | 'productivity' | 'attendance' | 'growth';
type FormatType = 'pdf' | 'excel' | 'csv';

export const ReportsModule: React.FC<ReportsModuleProps> = ({ employees, projects, tasks }) => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('performance');
  const [format, setFormat] = useState<FormatType>('pdf');
  const [generating, setGenerating] = useState<boolean>(false);

  const reportItems = [
    { id: 'performance', title: 'Employee Performance Report', desc: 'Detailed individual scores, timelines, tasks completed, and ratings.' },
    { id: 'department', title: 'Department Analytics Report', desc: 'Headcount metrics, aggregate productivity indexes, and growth charts.' },
    { id: 'productivity', title: 'Productivity Trend Report', desc: 'Daily, weekly, and monthly productivity fluctuations.' },
    { id: 'attendance', title: 'Attendance Audit Report', desc: 'Log schedules, late checklists, and daily hours worked quotas.' },
    { id: 'growth', title: 'Company Growth Index', desc: 'Aggregated revenue indicators, project completions, and team performance.' }
  ];

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      try {
        if (format === 'pdf') {
          exportPDF();
        } else if (format === 'excel') {
          exportExcel();
        } else {
          exportCSV();
        }
        alert(`Report ${selectedReport} exported in ${format.toUpperCase()} format.`);
      } catch (err) {
        console.error(err);
        alert("Report generation failed.");
      } finally {
        setGenerating(false);
      }
    }, 1000);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(20);
    doc.text("EmpPulse Analytics Platform", 14, 25);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()} | Type: ${selectedReport.toUpperCase()} | Format: PDF`, 14, 31);
    
    doc.setDrawColor(220);
    doc.line(14, 35, 196, 35);

    // Body based on report type
    doc.setFontSize(13);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(0);
    
    if (selectedReport === 'performance') {
      doc.text("Employee Performance Directory Overview", 14, 46);
      let y = 56;
      employees.forEach((emp, index) => {
        if (y > 270) { doc.addPage(); y = 25; }
        doc.setFontSize(10);
        doc.setFont("Helvetica", "bold");
        doc.text(`${index + 1}. ${emp.name} (${emp.designation})`, 16, y);
        doc.setFont("Helvetica", "normal");
        doc.text(`Score: ${calculateProductivityScore(emp)}% | Tasks Completed: ${emp.tasksCompleted} | Rating: ${emp.performanceRating}`, 20, y + 5);
        y += 14;
      });
    } else if (selectedReport === 'department') {
      doc.text("Departmental Productivity Summaries", 14, 46);
      let y = 56;
      const summaries = getDepartmentsSummary(employees, tasks);
      summaries.forEach((d, index) => {
        doc.setFontSize(10);
        doc.setFont("Helvetica", "bold");
        doc.text(`${index + 1}. Dept: ${d.name} (${d.employeeCount} active)`, 16, y);
        doc.setFont("Helvetica", "normal");
        doc.text(`Productivity index: ${d.productivityScore}% | Tasks volume: ${d.completedTasks} / ${d.totalTasks} | growth: ${d.growth}%`, 20, y + 5);
        y += 14;
      });
    } else {
      doc.text("Overall Company Operational Overview", 14, 46);
      doc.setFontSize(10);
      doc.setFont("Helvetica", "normal");
      doc.text(`* Overall Tracked Staff Count: ${employees.length}`, 16, 56);
      doc.text(`* Projects Logged: ${projects.length}`, 16, 62);
      doc.text(`* Total Completed Tasks in Board: ${tasks.filter(t => t.progress === 100).length}`, 16, 68);
    }

    doc.save(`EmpPulse_${selectedReport}_Report_${Date.now()}.pdf`);
  };

  const exportExcel = () => {
    let ws;
    const filename = `EmpPulse_${selectedReport}_Report_${Date.now()}.xlsx`;

    if (selectedReport === 'performance') {
      ws = XLSX.utils.json_to_sheet(employees.map(e => ({
        'Employee ID': e.id,
        'Name': e.name,
        'Designation': e.designation,
        'Department': e.department,
        'Productivity Score %': calculateProductivityScore(e),
        'Tasks Completed': e.tasksCompleted,
        'Rating': e.performanceRating,
        'Salary': e.salary
      })));
    } else if (selectedReport === 'department') {
      const summaries = getDepartmentsSummary(employees, tasks);
      ws = XLSX.utils.json_to_sheet(summaries.map(d => ({
        'Department': d.name,
        'Teammate Count': d.employeeCount,
        'Productivity Score': d.productivityScore,
        'Completed Tasks': d.completedTasks,
        'Total Tasks': d.totalTasks,
        'Growth %': d.growth
      })));
    } else {
      ws = XLSX.utils.json_to_sheet(tasks.map(t => ({
        'ID': t.id,
        'Task Name': t.name,
        'AssigneeID': t.assignedEmployee,
        'Due Date': t.dueDate,
        'Priority': t.priority,
        'Progress %': t.progress
      })));
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report Data");
    XLSX.writeFile(wb, filename);
  };

  const exportCSV = () => {
    let headers: string[] = [];
    let rows: any[][] = [];

    if (selectedReport === 'performance') {
      headers = ['ID', 'Name', 'Designation', 'Department', 'Productivity', 'Rating'];
      rows = employees.map(e => [e.id, e.name, e.designation, e.department, `${calculateProductivityScore(e)}%`, e.performanceRating]);
    } else {
      headers = ['ID', 'Task Name', 'Assignee', 'DueDate', 'Progress'];
      rows = tasks.map(t => [t.id, t.name, t.assignedEmployee, t.dueDate, `${t.progress}%`]);
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `EmpPulse_${selectedReport}_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Grid: Select Report Card (Left) & Form Settings (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Report List Selection */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-neutral-400">Available Performance Reports</h3>
          
          <div className="space-y-3">
            {reportItems.map((item) => {
              const isSelected = selectedReport === item.id;
              return (
                <div 
                  key={item.id}
                  onClick={() => setSelectedReport(item.id as any)}
                  className={`bg-white border p-4.5 rounded-2xl cursor-pointer transition-all flex items-start gap-4 shadow-soft dark:bg-neutral-950 ${isSelected ? 'border-neutral-900 dark:border-white ring-1 ring-neutral-950 dark:ring-white' : 'border-neutral-100 dark:border-neutral-900'}`}
                >
                  <div className={`p-2.5 rounded-xl border shrink-0 ${isSelected ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-900' : 'border-neutral-100 dark:border-neutral-900'}`}>
                    <FileText size={16} />
                  </div>
                  
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <h4 className="font-heading font-bold text-xs text-neutral-950 dark:text-white">{item.title}</h4>
                    <p className="text-[10px] text-neutral-400 leading-relaxed pr-6">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Exporter Config */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-neutral-400">Exporter Setup</h3>
          
          <div className="bg-white border border-neutral-100 rounded-2xl shadow-soft dark:bg-neutral-950 dark:border-neutral-900 p-5 space-y-5">
            {/* Format Selection buttons */}
            <div className="space-y-2.5">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Download Document Format</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'pdf', label: 'PDF Document', icon: FileText },
                  { id: 'excel', label: 'Excel Workbook', icon: FileSpreadsheet },
                  { id: 'csv', label: 'CSV Sheet', icon: FileCode }
                ].map((f) => {
                  const active = format === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setFormat(f.id as any)}
                      className={`py-3 px-2 border rounded-xl flex flex-col items-center gap-1.5 transition-all text-[10px] font-semibold ${active ? 'border-black text-black bg-neutral-50 dark:border-white dark:text-white dark:bg-neutral-900' : 'border-neutral-100 text-neutral-400 hover:text-black dark:border-neutral-800 dark:hover:text-white'}`}
                    >
                      <f.icon size={16} />
                      <span>{f.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Insights alert snippet */}
            <div className="bg-neutral-50 dark:bg-neutral-900/40 p-4 rounded-xl border border-neutral-100 dark:border-neutral-900 text-[10px] space-y-1.5">
              <span className="font-bold text-[9px] uppercase tracking-wide text-neutral-400 block flex items-center gap-1">
                <Sparkles size={10} /> Compilation Note
              </span>
              <p className="text-neutral-500 leading-relaxed">
                EmpPulse documents automatically compile task completeness weights, historical checklists, and growth curves indexed over the last 30 calendar days.
              </p>
            </div>

            {/* Export Trigger */}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-all font-semibold rounded-xl text-xs py-3 flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-40"
            >
              {generating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin shrink-0"></div>
                  Compiling...
                </>
              ) : (
                <>
                  <Download size={14} /> Generate & Download Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
