"use client";

import { useState } from 'react';
import { FileText, Download, Filter, Calendar, Users, TrendingUp, FileSpreadsheet } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import * as XLSX from 'xlsx';

const loc = {
  ar: {
    system_reports: "تقارير النظام",
    reports_desc: "توليد وتصدير تحليلات وتقارير شاملة",
    report_type: "نوع التقرير",
    attendance_report: "تقرير الحضور والانصراف",
    salary_report: "تقرير الرواتب",
    leave_report: "تقرير الإجازات",
    all_employees: "جميع الموظفين",
    date_from: "من تاريخ",
    date_to: "إلى تاريخ",
    generate: "توليد التقرير",
    generating: "جاري التوليد...",
    preview: "استعراض التقرير",
    export: "طباعة",
    export_excel: "تصدير إكسيل",
    check_in: "الحضور",
    check_out: "الانصراف",
    estimated_salary: "الراتب المقدر",
    type: "النوع",
    period: "الفترة",
    no_data: "لا يوجد بيانات"
  },
  en: {
    system_reports: "System Reports",
    reports_desc: "Generate and export detailed restaurant analytics",
    report_type: "Report Type",
    attendance_report: "Attendance Report",
    salary_report: "Salary Report",
    leave_report: "Leave Report",
    all_employees: "All Employees",
    date_from: "Date From",
    date_to: "Date To",
    generate: "Generate Report",
    generating: "Generating...",
    preview: "Report Preview",
    export: "Print",
    export_excel: "Export Excel",
    check_in: "Check In",
    check_out: "Check Out",
    estimated_salary: "Estimated Salary",
    type: "Type",
    period: "Period",
    no_data: "No Data"
  }
};

export default function ReportGenerator({ employees }: { employees: any[] }) {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const l = loc[language as keyof typeof loc] || loc.en;

  const [reportType, setReportType] = useState('attendance');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [employeeId, setEmployeeId] = useState('all');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  async function generateReport() {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?type=${reportType}&start=${startDate}&end=${endDate}&empId=${employeeId}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } finally {
      setLoading(false);
    }
  }

  function exportToExcel() {
    if (!data || data.length === 0) return;

    let rows: any[] = [];

    if (reportType === 'attendance') {
      rows = data.map((row: any) => ({
        [t('employee')]: row.employee.fullName,
        [t('date')]: new Date(row.date).toLocaleDateString(),
        [l.check_in]: new Date(row.checkInTime).toLocaleTimeString(),
        [l.check_out]: row.checkOutTime ? new Date(row.checkOutTime).toLocaleTimeString() : '---',
        [t('hours_total')]: row.totalHours?.toFixed(2) || '0.00',
      }));
    } else if (reportType === 'salary') {
      rows = data.map((row: any) => ({
        [t('employee')]: row.fullName,
        [t('hourly_rate')]: row.hourlyRate,
        [t('hours_total')]: row.totalHours.toFixed(2),
        [l.estimated_salary]: (row.totalHours * row.hourlyRate).toFixed(2),
      }));
    } else if (reportType === 'leave') {
      rows = data.map((row: any) => ({
        [t('employee')]: row.employee.fullName,
        [l.type]: row.type,
        [l.period]: `${new Date(row.startDate).toLocaleDateString()} - ${new Date(row.endDate).toLocaleDateString()}`,
        [t('status')]: row.status,
      }));
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `report-${reportType}-${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  return (
    <div className={`report-generator ${isRTL ? 'rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="page-header mb-6">
        <div>
          <h1 className="title">{l.system_reports}</h1>
          <p className="subtitle">{l.reports_desc}</p>
        </div>
      </div>

      <div className="card filter-card mb-6">
        <div className="grid md-grid-cols-4 gap-4 items-end">
          <div className="form-group">
            <label className="form-label">{l.report_type}</label>
            <select className="form-select" value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="attendance">{l.attendance_report}</option>
              <option value="salary">{l.salary_report}</option>
              <option value="leave">{l.leave_report}</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{t('employee')}</label>
            <select className="form-select" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
              <option value="all">{l.all_employees}</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.fullName}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{l.date_from}</label>
            <input type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">{l.date_to}</label>
            <input type="date" className="form-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>

          <button onClick={generateReport} className="btn btn-primary col-span-full md-col-span-1" disabled={loading}>
            <Filter size={18} />
            <span>{loading ? l.generating : l.generate}</span>
          </button>
        </div>
      </div>

      {data && (
        <div className="card report-result">
          <div className="flex justify-between items-center mb-6">
            <h3 className="title text-lg m-0">{l.preview}</h3>
            <div className="flex items-center gap-2">
              <button onClick={exportToExcel} className="btn btn-excel btn-sm">
                <FileSpreadsheet size={16} />
                <span>{l.export_excel}</span>
              </button>
              <button onClick={() => window.print()} className="btn btn-outline btn-sm">
                <Download size={16} />
                <span>{l.export}</span>
              </button>
            </div>
          </div>

          <div className="report-table-wrapper">
             {reportType === 'attendance' && (
               <table className="table">
                 <thead>
                   <tr>
                     <th>{t('employee')}</th>
                     <th>{t('date')}</th>
                     <th>{l.check_in}</th>
                     <th>{l.check_out}</th>
                     <th>{t('hours_total')}</th>
                   </tr>
                 </thead>
                 <tbody>
                   {data.length === 0 && <tr><td colSpan={5} style={{textAlign:'center', padding:'20px'}}>{l.no_data}</td></tr>}
                   {data.map((row: any) => (
                     <tr key={row.id}>
                       <td>{row.employee.fullName}</td>
                       <td>{new Date(row.date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}</td>
                       <td>{new Date(row.checkInTime).toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US')}</td>
                       <td>{row.checkOutTime ? new Date(row.checkOutTime).toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US') : '---'}</td>
                       <td>{row.totalHours?.toFixed(2) || '0.00'}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             )}

             {reportType === 'salary' && (
               <table className="table">
                 <thead>
                   <tr>
                     <th>{t('employee')}</th>
                     <th>{t('hourly_rate')}</th>
                     <th>{t('hours_total')}</th>
                     <th>{l.estimated_salary}</th>
                   </tr>
                 </thead>
                 <tbody>
                   {data.length === 0 && <tr><td colSpan={4} style={{textAlign:'center', padding:'20px'}}>{l.no_data}</td></tr>}
                   {data.map((row: any) => (
                     <tr key={row.id}>
                       <td>{row.fullName}</td>
                       <td>${row.hourlyRate}</td>
                       <td>{row.totalHours.toFixed(2)}</td>
                       <td className="font-bold text-success">${(row.totalHours * row.hourlyRate).toFixed(2)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             )}

             {reportType === 'leave' && (
               <table className="table">
                 <thead>
                   <tr>
                     <th>{t('employee')}</th>
                     <th>{l.type}</th>
                     <th>{l.period}</th>
                     <th>{t('status')}</th>
                   </tr>
                 </thead>
                 <tbody>
                   {data.length === 0 && <tr><td colSpan={4} style={{textAlign:'center', padding:'20px'}}>{l.no_data}</td></tr>}
                   {data.map((row: any) => (
                     <tr key={row.id}>
                       <td>{row.employee.fullName}</td>
                       <td>{row.type}</td>
                       <td>{new Date(row.startDate).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')} - {new Date(row.endDate).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}</td>
                       <td><span className={`badge badge-${row.status === 'APPROVED' ? 'success' : 'warning'}`}>{row.status}</span></td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             )}
          </div>
        </div>
      )}

      <style jsx>{`
        .filter-card { padding: 1.5rem; }
        .md-grid-cols-4 { display: grid; grid-template-columns: 1fr; gap: 1rem; }
        @media (min-width: 768px) {
          .md-grid-cols-4 { grid-template-columns: repeat(4, 1fr) auto; }
          .md-col-span-1 { grid-column: auto; }
        }
        .report-result { border-top: 4px solid var(--primary); }
        .font-bold { font-weight: 700; }
        .text-xl { font-size: 1.25rem; }
        .btn-outline { background: transparent; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; padding: 6px 14px; display: inline-flex; align-items: center; gap: 6px; font-weight: 700; }
        .btn-excel {
          background: #16a34a; color: white; border: none; border-radius: 8px;
          cursor: pointer; padding: 6px 14px; display: inline-flex; align-items: center; gap: 6px;
          font-weight: 700; transition: 0.2s;
        }
        .btn-excel:hover { background: #15803d; transform: translateY(-1px); }
      `}</style>
    </div>
  );
}
