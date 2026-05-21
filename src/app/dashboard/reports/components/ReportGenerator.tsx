"use client";

import { useState } from 'react';
import {
  FileText, Download, Filter, Calendar, Users,
  TrendingUp, FileSpreadsheet, Clock, Wallet,
  AlertTriangle, CheckCircle, Search, BarChart2,
  CreditCard, ChevronDown, Banknote
} from 'lucide-react';
import * as XLSX from 'xlsx';

const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

const REPORT_TYPES = [
  { value: 'attendance', label: 'تقرير الحضور والانصراف', icon: Clock,        color: '#3b82f6' },
  { value: 'salary',     label: 'تقرير الرواتب التقديرية', icon: TrendingUp,   color: '#10b981' },
  { value: 'payroll',    label: 'تقرير الرواتب المؤكدة',   icon: Wallet,       color: '#8b5cf6' },
  { value: 'leave',      label: 'تقرير الإجازات',          icon: Calendar,     color: '#f59e0b' },
  { value: 'penalties',  label: 'تقرير الجزاءات',          icon: AlertTriangle,color: '#ef4444' },
];

const PENALTY_TYPES: Record<string, string> = {
  WARNING:   'إنذار',
  DEDUCTION: 'خصم',
  SUSPENSION:'إيقاف',
  OTHER:     'أخرى',
};

const LEAVE_TYPES: Record<string, string> = {
  ANNUAL:    'سنوية',
  SICK:      'مرضية',
  EMERGENCY: 'طارئة',
  UNPAID:    'بدون مرتب',
  OTHER:     'أخرى',
};

const STATUS_AR: Record<string, { label: string; color: string }> = {
  APPROVED: { label: 'موافق', color: '#16a34a' },
  PENDING:  { label: 'معلّق', color: '#d97706' },
  REJECTED: { label: 'مرفوض', color: '#dc2626' },
};

function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString('ar-EG');
}
function fmtTime(d: string | Date) {
  return new Date(d).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}
function fmtNum(n: number) {
  return n.toLocaleString('ar-EG');
}

export default function ReportGenerator({ employees }: { employees: any[] }) {
  const [reportType, setReportType] = useState('attendance');
  const [startDate,  setStartDate]  = useState('');
  const [endDate,    setEndDate]    = useState('');
  const [empId,      setEmpId]      = useState('all');
  const [month,      setMonth]      = useState(new Date().getMonth() + 1);
  const [year,       setYear]       = useState(new Date().getFullYear());
  const [loading,    setLoading]    = useState(false);
  const [data,       setData]       = useState<any[] | null>(null);
  const [error,      setError]      = useState('');

  const currentType = REPORT_TYPES.find(r => r.value === reportType)!;
  const isPayroll   = reportType === 'payroll';
  const years       = [new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1];

  async function generate() {
    setLoading(true);
    setError('');
    setData(null);
    try {
      let url = `/api/reports?type=${reportType}&empId=${empId}`;
      if (isPayroll) {
        url += `&month=${month}&year=${year}`;
      } else {
        if (startDate) url += `&start=${startDate}`;
        if (endDate)   url += `&end=${endDate}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        setData(await res.json());
      } else {
        setError('فشل في توليد التقرير');
      }
    } catch {
      setError('خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  }

  function exportExcel() {
    if (!data || data.length === 0) return;
    let rows: any[] = [];

    if (reportType === 'attendance') {
      rows = data.map(r => ({
        'الموظف':   r.employee.fullName,
        'الوظيفة':  r.employee.jobTitle,
        'التاريخ':  fmtDate(r.date),
        'الحضور':   fmtTime(r.checkInTime),
        'الانصراف': r.checkOutTime ? fmtTime(r.checkOutTime) : '---',
        'الساعات':  (r.totalHours || 0).toFixed(2),
      }));
    } else if (reportType === 'salary') {
      rows = data.map(r => ({
        'الموظف':        r.fullName,
        'الوظيفة':       r.jobTitle,
        'سعر الساعة':    `${r.hourlyRate} ر.س`,
        'الساعات':       r.totalHours.toFixed(2),
        'الراتب التقديري': `${(r.totalHours * r.hourlyRate).toFixed(0)} ر.س`,
      }));
    } else if (reportType === 'payroll') {
      rows = data.map(r => ({
        'الموظف':   r.employee.fullName,
        'الشهر':    `${MONTHS[r.month - 1]} ${r.year}`,
        'الساعات':  r.totalHours.toFixed(2),
        'الأساسي':  `${(r.totalHours * r.hourlyRate).toFixed(0)} ر.س`,
        'مكافأة':   `${r.bonus} ر.س`,
        'خصم':      `${r.deductions} ر.س`,
        'سلفة':     `${r.advance} ر.س`,
        'الصافي':   `${r.netAmount.toFixed(0)} ر.س`,
        'الحالة':   r.status === 'PAID' ? 'مدفوع' : r.status,
        'ملاحظات':  r.notes || '',
      }));
    } else if (reportType === 'leave') {
      rows = data.map(r => ({
        'الموظف':  r.employee.fullName,
        'النوع':   LEAVE_TYPES[r.type] || r.type,
        'من':      fmtDate(r.startDate),
        'إلى':     fmtDate(r.endDate),
        'الحالة':  STATUS_AR[r.status]?.label || r.status,
      }));
    } else if (reportType === 'penalties') {
      rows = data.map(r => ({
        'الموظف':    r.employee.fullName,
        'النوع':     PENALTY_TYPES[r.type] || r.type,
        'الوصف':     r.description,
        'التاريخ':   fmtDate(r.date),
      }));
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, currentType.label);
    XLSX.writeFile(wb, `${currentType.label}-${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  /* ── TOTALS ── */
  const totals = (() => {
    if (!data || data.length === 0) return null;
    if (reportType === 'attendance') {
      const hrs = data.reduce((s, r) => s + (r.totalHours || 0), 0);
      return `إجمالي الساعات: ${hrs.toFixed(2)} ساعة`;
    }
    if (reportType === 'salary') {
      const total = data.reduce((s, r) => s + r.totalHours * r.hourlyRate, 0);
      return `إجمالي الرواتب التقديرية: ${fmtNum(Math.round(total))} ر.س`;
    }
    if (reportType === 'payroll') {
      const net = data.reduce((s, r) => s + r.netAmount, 0);
      const bon = data.reduce((s, r) => s + r.bonus, 0);
      const ded = data.reduce((s, r) => s + r.deductions + r.advance, 0);
      return `صافي المدفوع: ${fmtNum(Math.round(net))} ر.س  |  مكافآت: ${fmtNum(Math.round(bon))} ر.س  |  خصومات وسلف: ${fmtNum(Math.round(ded))} ر.س`;
    }
    return null;
  })();

  return (
    <div className="rg" dir="rtl">

      {/* ── HEADER ── */}
      <div className="rg-header">
        <div className="rg-title-block">
          <div className="rg-icon"><BarChart2 size={26} /></div>
          <div>
            <h1>تقارير النظام</h1>
            <p>توليد وتصدير تقارير شاملة لجميع بيانات الموظفين</p>
          </div>
        </div>
      </div>

      {/* ── REPORT TYPE CARDS ── */}
      <div className="type-cards">
        {REPORT_TYPES.map(rt => {
          const Icon = rt.icon;
          return (
            <button key={rt.value}
              className={`type-card ${reportType === rt.value ? 'active' : ''}`}
              style={{'--tc': rt.color} as any}
              onClick={() => { setReportType(rt.value); setData(null); }}>
              <div className="tc-icon"><Icon size={20} /></div>
              <span>{rt.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── FILTERS ── */}
      <div className="filter-card">
        <div className="filter-title">
          <Filter size={15} />
          <span>فلاتر البحث — {currentType.label}</span>
        </div>

        <div className="filter-grid">
          {/* Employee */}
          <div className="fg-item">
            <label><Users size={13} /> الموظف</label>
            <select value={empId} onChange={e => setEmpId(e.target.value)}>
              <option value="all">جميع الموظفين</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.fullName}</option>)}
            </select>
          </div>

          {isPayroll ? (
            <>
              {/* Month */}
              <div className="fg-item">
                <label><Calendar size={13} /> الشهر</label>
                <select value={month} onChange={e => setMonth(+e.target.value)}>
                  {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
              </div>
              {/* Year */}
              <div className="fg-item">
                <label><Calendar size={13} /> السنة</label>
                <select value={year} onChange={e => setYear(+e.target.value)}>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </>
          ) : (
            <>
              {/* Date from */}
              <div className="fg-item">
                <label><Calendar size={13} /> من تاريخ</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              {/* Date to */}
              <div className="fg-item">
                <label><Calendar size={13} /> إلى تاريخ</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </>
          )}

          {/* Generate */}
          <div className="fg-item generate-col">
            <button className="btn-generate" onClick={generate} disabled={loading}>
              {loading ? <><div className="spin" /> جاري التوليد...</> : <><Search size={16} /> توليد التقرير</>}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="err-bar"><AlertTriangle size={16} />{error}</div>}

      {/* ── RESULT ── */}
      {data !== null && (
        <div className="result-card">
          {/* Result header */}
          <div className="result-header">
            <div className="result-meta">
              <div className="result-type-badge" style={{ background: currentType.color + '18', color: currentType.color }}>
                {REPORT_TYPES.find(r => r.value === reportType)?.label}
              </div>
              <span className="result-count">{data.length} سجل</span>
            </div>
            <div className="result-actions">
              <button className="btn-excel" onClick={exportExcel} disabled={data.length === 0}>
                <FileSpreadsheet size={15} /> تصدير Excel
              </button>
              <button className="btn-print" onClick={() => window.print()}>
                <Download size={15} /> طباعة
              </button>
            </div>
          </div>

          {data.length === 0 ? (
            <div className="empty-result">
              <FileText size={48} strokeWidth={1} />
              <p>لا توجد بيانات لهذه الفترة</p>
            </div>
          ) : (
            <>
              <div className="tbl-wrap">

                {/* ATTENDANCE */}
                {reportType === 'attendance' && (
                  <table>
                    <thead>
                      <tr>
                        <th>الموظف</th>
                        <th>الوظيفة</th>
                        <th>التاريخ</th>
                        <th>الحضور</th>
                        <th>الانصراف</th>
                        <th>الساعات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map(r => (
                        <tr key={r.id}>
                          <td className="bold">{r.employee.fullName}</td>
                          <td className="muted">{r.employee.jobTitle}</td>
                          <td>{fmtDate(r.date)}</td>
                          <td className="green">{fmtTime(r.checkInTime)}</td>
                          <td className="muted">{r.checkOutTime ? fmtTime(r.checkOutTime) : <span className="badge-warn">لم يسجل</span>}</td>
                          <td className="blue bold">{(r.totalHours || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={5} className="total-lbl">الإجمالي</td>
                        <td className="total-val blue">{data.reduce((s, r) => s + (r.totalHours || 0), 0).toFixed(2)} س</td>
                      </tr>
                    </tfoot>
                  </table>
                )}

                {/* SALARY (ESTIMATED) */}
                {reportType === 'salary' && (
                  <table>
                    <thead>
                      <tr>
                        <th>الموظف</th>
                        <th>الوظيفة</th>
                        <th>سعر الساعة</th>
                        <th>الساعات</th>
                        <th>الراتب التقديري</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map(r => (
                        <tr key={r.id}>
                          <td className="bold">{r.fullName}</td>
                          <td className="muted">{r.jobTitle}</td>
                          <td>{fmtNum(r.hourlyRate)} ر.س</td>
                          <td className="blue">{r.totalHours.toFixed(2)}</td>
                          <td className="green bold">{fmtNum(Math.round(r.totalHours * r.hourlyRate))} ر.س</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="total-lbl">الإجمالي</td>
                        <td className="total-val blue">{data.reduce((s, r) => s + r.totalHours, 0).toFixed(2)} س</td>
                        <td className="total-val green">{fmtNum(Math.round(data.reduce((s, r) => s + r.totalHours * r.hourlyRate, 0)))} ر.س</td>
                      </tr>
                    </tfoot>
                  </table>
                )}

                {/* CONFIRMED PAYROLL */}
                {reportType === 'payroll' && (
                  <table>
                    <thead>
                      <tr>
                        <th>الموظف</th>
                        <th>الشهر</th>
                        <th>الساعات</th>
                        <th>الأساسي</th>
                        <th>مكافأة</th>
                        <th>خصم</th>
                        <th>سلفة</th>
                        <th>الصافي</th>
                        <th>الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map(r => (
                        <tr key={r.id}>
                          <td className="bold">{r.employee.fullName}</td>
                          <td className="muted">{MONTHS[r.month - 1]} {r.year}</td>
                          <td className="blue">{r.totalHours.toFixed(2)}</td>
                          <td>{fmtNum(Math.round(r.totalHours * r.hourlyRate))} ر.س</td>
                          <td className={r.bonus > 0 ? 'green' : 'muted'}>{r.bonus > 0 ? `+${fmtNum(r.bonus)} ر.س` : '—'}</td>
                          <td className={r.deductions > 0 ? 'red' : 'muted'}>{r.deductions > 0 ? `-${fmtNum(r.deductions)} ر.س` : '—'}</td>
                          <td className={r.advance > 0 ? 'amber' : 'muted'}>{r.advance > 0 ? `-${fmtNum(r.advance)} ر.س` : '—'}</td>
                          <td className="green bold big">{fmtNum(Math.round(r.netAmount))} ر.س</td>
                          <td><span className="badge-paid">مدفوع</span></td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={4} className="total-lbl">الإجمالي</td>
                        <td className="total-val green">+{fmtNum(Math.round(data.reduce((s,r)=>s+r.bonus,0)))} ر.س</td>
                        <td className="total-val red">-{fmtNum(Math.round(data.reduce((s,r)=>s+r.deductions,0)))} ر.س</td>
                        <td className="total-val amber">-{fmtNum(Math.round(data.reduce((s,r)=>s+r.advance,0)))} ر.س</td>
                        <td className="total-val green">{fmtNum(Math.round(data.reduce((s,r)=>s+r.netAmount,0)))} ر.س</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                )}

                {/* LEAVE */}
                {reportType === 'leave' && (
                  <table>
                    <thead>
                      <tr>
                        <th>الموظف</th>
                        <th>الوظيفة</th>
                        <th>نوع الإجازة</th>
                        <th>من</th>
                        <th>إلى</th>
                        <th>الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map(r => {
                        const st = STATUS_AR[r.status] || { label: r.status, color: '#94a3b8' };
                        return (
                          <tr key={r.id}>
                            <td className="bold">{r.employee.fullName}</td>
                            <td className="muted">{r.employee.jobTitle}</td>
                            <td>{LEAVE_TYPES[r.type] || r.type}</td>
                            <td>{fmtDate(r.startDate)}</td>
                            <td>{fmtDate(r.endDate)}</td>
                            <td>
                              <span className="status-badge" style={{ background: st.color + '18', color: st.color }}>
                                {st.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={5} className="total-lbl">إجمالي الإجازات</td>
                        <td className="total-val">{data.length}</td>
                      </tr>
                    </tfoot>
                  </table>
                )}

                {/* PENALTIES */}
                {reportType === 'penalties' && (
                  <table>
                    <thead>
                      <tr>
                        <th>الموظف</th>
                        <th>الوظيفة</th>
                        <th>نوع الجزاء</th>
                        <th>الوصف</th>
                        <th>التاريخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map(r => (
                        <tr key={r.id}>
                          <td className="bold">{r.employee.fullName}</td>
                          <td className="muted">{r.employee.jobTitle}</td>
                          <td>
                            <span className="penalty-badge" data-type={r.type}>
                              {PENALTY_TYPES[r.type] || r.type}
                            </span>
                          </td>
                          <td className="desc">{r.description}</td>
                          <td className="muted">{fmtDate(r.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={4} className="total-lbl">إجمالي الجزاءات</td>
                        <td className="total-val red">{data.length}</td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>

              {/* TOTALS STRIP */}
              {totals && (
                <div className="totals-strip">
                  <CheckCircle size={16} />
                  <span>{totals}</span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <style jsx>{`
        .rg { padding:24px; direction:rtl; animation:fadeUp .4s ease; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

        /* HEADER */
        .rg-header { margin-bottom:24px; }
        .rg-title-block { display:flex; align-items:center; gap:16px; }
        .rg-icon { width:52px; height:52px; background:linear-gradient(135deg,#6366f1,#8b5cf6); border-radius:16px; color:white; display:flex; align-items:center; justify-content:center; box-shadow:0 8px 20px rgba(99,102,241,.3); flex-shrink:0; }
        .rg-title-block h1 { margin:0; font-size:1.5rem; font-weight:900; color:#1e293b; }
        .rg-title-block p  { margin:0; font-size:.8rem; color:#94a3b8; font-weight:600; }

        /* TYPE CARDS */
        .type-cards { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px; }
        .type-card { display:flex; align-items:center; gap:8px; padding:10px 16px; border-radius:12px; border:1.5px solid #e2e8f0; background:white; cursor:pointer; font-size:.82rem; font-weight:800; color:#64748b; transition:.2s; }
        .type-card:hover { border-color:var(--tc); color:var(--tc); background:color-mix(in srgb,var(--tc) 6%,white); }
        .type-card.active { border-color:var(--tc); background:color-mix(in srgb,var(--tc) 10%,white); color:var(--tc); box-shadow:0 4px 12px color-mix(in srgb,var(--tc) 20%,transparent); }
        .tc-icon { display:flex; }

        /* FILTER */
        .filter-card { background:white; border-radius:20px; border:1.5px solid #e2e8f0; padding:20px 24px; margin-bottom:20px; box-shadow:0 2px 10px rgba(0,0,0,.04); }
        .filter-title { display:flex; align-items:center; gap:8px; font-size:.78rem; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:16px; }
        .filter-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:12px; align-items:end; }
        .fg-item { display:flex; flex-direction:column; gap:6px; }
        .fg-item label { display:flex; align-items:center; gap:5px; font-size:.72rem; font-weight:800; color:#64748b; text-transform:uppercase; }
        .fg-item select, .fg-item input { padding:10px 14px; border-radius:12px; border:1.5px solid #e2e8f0; background:#f8fafc; font-size:.88rem; font-weight:700; color:#1e293b; outline:none; transition:border-color .2s; }
        .fg-item select:focus, .fg-item input:focus { border-color:#6366f1; background:white; }
        .generate-col { justify-content:flex-end; }
        .btn-generate { width:100%; display:flex; align-items:center; justify-content:center; gap:8px; padding:12px 20px; border-radius:14px; border:none; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:white; font-weight:900; font-size:.9rem; cursor:pointer; transition:.2s; box-shadow:0 4px 14px rgba(99,102,241,.3); }
        .btn-generate:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 20px rgba(99,102,241,.4); }
        .btn-generate:disabled { opacity:.6; cursor:not-allowed; transform:none; }
        .spin { width:16px; height:16px; border:2px solid rgba(255,255,255,.4); border-top-color:white; border-radius:50%; animation:spin .7s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }

        /* ERROR */
        .err-bar { display:flex; align-items:center; gap:10px; background:#fef2f2; border:1px solid #fecaca; color:#b91c1c; padding:14px 18px; border-radius:14px; font-weight:700; margin-bottom:16px; }

        /* RESULT */
        .result-card { background:white; border-radius:20px; border:1.5px solid #e2e8f0; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,.04); }
        .result-header { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid #f1f5f9; flex-wrap:wrap; gap:10px; }
        .result-meta { display:flex; align-items:center; gap:10px; }
        .result-type-badge { font-size:.75rem; font-weight:800; padding:5px 12px; border-radius:8px; }
        .result-count { font-size:.78rem; font-weight:700; color:#94a3b8; }
        .result-actions { display:flex; gap:8px; }
        .btn-excel { display:flex; align-items:center; gap:6px; background:#16a34a; color:white; border:none; border-radius:10px; padding:8px 14px; font-size:.8rem; font-weight:800; cursor:pointer; transition:.2s; }
        .btn-excel:hover:not(:disabled) { background:#15803d; transform:translateY(-1px); }
        .btn-excel:disabled { opacity:.5; cursor:not-allowed; }
        .btn-print { display:flex; align-items:center; gap:6px; background:#f8fafc; color:#475569; border:1.5px solid #e2e8f0; border-radius:10px; padding:8px 14px; font-size:.8rem; font-weight:800; cursor:pointer; transition:.2s; }
        .btn-print:hover { background:#f1f5f9; }

        .empty-result { display:flex; flex-direction:column; align-items:center; gap:14px; padding:60px 20px; color:#cbd5e1; font-size:.9rem; font-weight:700; }

        /* TABLE */
        .tbl-wrap { overflow-x:auto; }
        table { width:100%; border-collapse:collapse; font-size:.84rem; }
        th { background:linear-gradient(135deg,#eff6ff,#dbeafe); color:#1d4ed8; font-weight:800; padding:12px 16px; text-align:right; white-space:nowrap; border-bottom:1.5px solid #bfdbfe; }
        td { padding:11px 16px; border-bottom:1px solid #f1f5f9; color:#475569; font-weight:600; }
        tr:last-child td { border-bottom:none; }
        tr:hover td { background:#f8faff; }

        /* CELL MODIFIERS */
        .bold { font-weight:900; color:#1e293b; }
        .muted { color:#94a3b8; }
        .green { color:#16a34a; }
        .blue  { color:#2563eb; }
        .red   { color:#dc2626; }
        .amber { color:#d97706; }
        .big   { font-size:1rem; }
        .desc  { max-width:240px; white-space:pre-line; }

        /* TFOOT */
        tfoot tr td { background:#f8fafc; font-weight:800; border-top:2px solid #e2e8f0; }
        .total-lbl { color:#64748b; font-size:.75rem; text-transform:uppercase; }
        .total-val { font-size:.95rem; font-weight:900; }

        /* BADGES */
        .badge-paid { background:#dcfce7; color:#16a34a; font-size:.7rem; font-weight:800; padding:4px 10px; border-radius:8px; white-space:nowrap; }
        .badge-warn { background:#fef3c7; color:#d97706; font-size:.7rem; font-weight:800; padding:3px 8px; border-radius:6px; }
        .status-badge { font-size:.72rem; font-weight:800; padding:4px 10px; border-radius:8px; white-space:nowrap; }
        .penalty-badge { font-size:.72rem; font-weight:800; padding:4px 10px; border-radius:8px; white-space:nowrap; }
        .penalty-badge[data-type="WARNING"]   { background:#fef3c7; color:#b45309; }
        .penalty-badge[data-type="DEDUCTION"] { background:#fee2e2; color:#dc2626; }
        .penalty-badge[data-type="SUSPENSION"]{ background:#fce7f3; color:#be185d; }
        .penalty-badge[data-type="OTHER"]     { background:#f1f5f9; color:#64748b; }

        /* TOTALS STRIP */
        .totals-strip { display:flex; align-items:center; gap:10px; padding:14px 20px; background:linear-gradient(135deg,#f0fdf4,#dcfce7); border-top:1px solid #bbf7d0; font-size:.82rem; font-weight:800; color:#15803d; }

        /* PRINT */
        @media print {
          .rg-header, .type-cards, .filter-card, .result-actions { display:none !important; }
          .result-card { box-shadow:none; border:1px solid #e2e8f0; }
        }
      `}</style>
    </div>
  );
}
