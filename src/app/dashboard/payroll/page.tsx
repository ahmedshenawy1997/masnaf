"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  Calculator, Calendar, Users, TrendingUp, TrendingDown,
  CreditCard, CheckCircle, Save, AlertCircle, Wallet,
  ChevronDown, ChevronUp, RotateCcw, Clock, Award,
  Search, Banknote, X
} from 'lucide-react';
import { useSession } from 'next-auth/react';

interface PayrollEmployee {
  id: string;
  fullName: string;
  jobTitle: string;
  username: string;
  hourlyRate: number;
  totalHours: number;
  baseSalary: number;
  existingPayroll: any | null;
  bonus: number;
  deductions: number;
  advance: number;
  notes: string;
  status: 'pending' | 'saving' | 'saved';
}

const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

function hoursDisplay(h: number) {
  const full = Math.floor(h);
  const mins = Math.round((h - full) * 60);
  return mins > 0 ? `${full}س ${mins}د` : `${full}س`;
}

function EmployeeCard({ emp, onUpdate, onSave, onReset }: {
  emp: PayrollEmployee;
  onUpdate: (id: string, field: string, val: any) => void;
  onSave: (emp: PayrollEmployee) => void;
  onReset: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const net = emp.baseSalary + emp.bonus - emp.deductions - emp.advance;
  const editable = emp.status !== 'saving' && emp.status !== 'saved';

  return (
    <div className={`ec ${emp.status}`}>
      <div className="ec-head" onClick={() => setOpen(p => !p)}>
        <div className="ec-avatar">{emp.fullName[0]}</div>

        <div className="ec-info">
          <span className="ec-name">{emp.fullName}</span>
          <span className="ec-job">{emp.jobTitle}</span>
        </div>

        <div className="ec-col hide-sm">
          <span className="col-lbl">ساعات العمل</span>
          <div className="hours-val">
            <Clock size={13} />
            <span>{hoursDisplay(emp.totalHours)}</span>
          </div>
        </div>

        <div className="ec-col hide-sm">
          <span className="col-lbl">الراتب الأساسي</span>
          <span className="col-val">{emp.baseSalary.toLocaleString()} ج.م</span>
        </div>

        <div className="ec-col">
          <span className="col-lbl">الصافي</span>
          <span className={`net-val ${net < 0 ? 'neg' : ''}`}>{net.toLocaleString()} ج.م</span>
        </div>

        <div className="ec-right">
          {emp.status === 'saved'   && <span className="badge ok"><CheckCircle size={13} /> مؤكد</span>}
          {emp.status === 'saving'  && <span className="badge loading"><div className="mini-spin" /></span>}
          {emp.status === 'pending' && <span className="badge pend">معلّق</span>}
          <button className="expand-btn" onClick={e => { e.stopPropagation(); setOpen(p => !p); }}>
            {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="ec-body">
          {/* Formula */}
          <div className="formula-row">
            <div className="f-chip blue"><Clock size={13} />{emp.totalHours.toFixed(2)} ساعة</div>
            <span className="f-op">×</span>
            <div className="f-chip gray">{emp.hourlyRate.toFixed(0)} ج.م/ساعة</div>
            <span className="f-op">=</span>
            <div className="f-chip green"><Banknote size={13} />{emp.baseSalary.toLocaleString()} ج.م</div>
          </div>

          {/* Adjustments */}
          <div className="adj-grid">
            <div className="adj green">
              <label><Award size={13} /> مكافأة</label>
              <div className="adj-inp">
                <input type="number" min="0" value={emp.bonus} disabled={!editable}
                  onChange={e => onUpdate(emp.id, 'bonus', parseFloat(e.target.value) || 0)} placeholder="0" />
                <span>ج.م</span>
              </div>
            </div>
            <div className="adj red">
              <label><TrendingDown size={13} /> خصم</label>
              <div className="adj-inp">
                <input type="number" min="0" value={emp.deductions} disabled={!editable}
                  onChange={e => onUpdate(emp.id, 'deductions', parseFloat(e.target.value) || 0)} placeholder="0" />
                <span>ج.م</span>
              </div>
            </div>
            <div className="adj amber">
              <label><CreditCard size={13} /> سلفة</label>
              <div className="adj-inp">
                <input type="number" min="0" value={emp.advance} disabled={!editable}
                  onChange={e => onUpdate(emp.id, 'advance', parseFloat(e.target.value) || 0)} placeholder="0" />
                <span>ج.م</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <textarea className="notes-ta" rows={2} value={emp.notes} disabled={!editable}
            placeholder="ملاحظات إضافية..."
            onChange={e => onUpdate(emp.id, 'notes', e.target.value)} />

          {/* Net bar */}
          <div className={`net-bar ${net < 0 ? 'danger' : 'success'}`}>
            <div className="nb-left">
              <span>{emp.baseSalary.toFixed(0)}</span>
              {emp.bonus > 0     && <span className="plus">+ {emp.bonus.toFixed(0)}</span>}
              {emp.deductions > 0 && <span className="minus">− {emp.deductions.toFixed(0)}</span>}
              {emp.advance > 0   && <span className="minus">− {emp.advance.toFixed(0)}</span>}
            </div>
            <div className="nb-right">
              <span className="nb-lbl">الصافي</span>
              <span className="nb-val">{net.toFixed(0)} ج.م</span>
            </div>
          </div>

          {/* Actions */}
          <div className="ec-actions">
            {emp.status === 'saved' && (
              <button className="btn-edit" onClick={() => onReset(emp.id)}>
                <RotateCcw size={14} /> تعديل
              </button>
            )}
            <button className="btn-confirm" disabled={emp.status !== 'pending'} onClick={() => onSave(emp)}>
              <Save size={15} />
              {emp.status === 'saving' ? 'جاري الحفظ...' : emp.status === 'saved' ? 'تم التأكيد ✓' : 'تأكيد الراتب'}
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .ec { background:white; border-radius:20px; border:1.5px solid #e2e8f0; overflow:hidden; transition:box-shadow .2s,border-color .2s; box-shadow:0 2px 8px rgba(0,0,0,.04); }
        .ec:hover { box-shadow:0 8px 28px rgba(0,0,0,.08); }
        .ec.saved { border-color:#bbf7d0; }
        .ec.saving { opacity:.7; }

        .ec-head { display:flex; align-items:center; gap:14px; padding:16px 20px; cursor:pointer; }
        .ec-avatar { width:44px; height:44px; border-radius:14px; background:linear-gradient(135deg,#e0e7ff,#dbeafe); color:#3730a3; font-size:1.15rem; font-weight:900; display:flex; align-items:center; justify-content:center; flex-shrink:0; }

        .ec-info { flex:1; min-width:0; }
        .ec-name { display:block; font-size:.92rem; font-weight:900; color:#1e293b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .ec-job  { display:block; font-size:.73rem; color:#94a3b8; font-weight:600; }

        .ec-col { display:flex; flex-direction:column; align-items:center; gap:2px; min-width:80px; }
        .col-lbl { font-size:.6rem; color:#94a3b8; font-weight:700; text-transform:uppercase; white-space:nowrap; }
        .hours-val { display:flex; align-items:center; gap:4px; color:#3b82f6; font-weight:900; font-size:.9rem; }
        .col-val { font-size:.88rem; font-weight:800; color:#475569; }
        .net-val { font-size:1rem; font-weight:900; color:#16a34a; }
        .net-val.neg { color:#dc2626; }
        @media(max-width:640px) { .hide-sm { display:none; } }

        .ec-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }
        .badge { display:flex; align-items:center; gap:5px; font-size:.7rem; font-weight:800; padding:5px 10px; border-radius:8px; white-space:nowrap; }
        .badge.ok     { background:#dcfce7; color:#16a34a; }
        .badge.pend   { background:#fef3c7; color:#b45309; }
        .badge.loading { background:#f8fafc; }
        .mini-spin { width:18px; height:18px; border:2px solid #e2e8f0; border-top-color:#3b82f6; border-radius:50%; animation:spin .7s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .expand-btn { background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; width:32px; height:32px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#64748b; transition:.15s; }
        .expand-btn:hover { background:#f1f5f9; }

        /* BODY */
        .ec-body { padding:0 20px 20px; border-top:1px solid #f1f5f9; }

        /* FORMULA */
        .formula-row { display:flex; align-items:center; gap:10px; padding:14px 0 16px; flex-wrap:wrap; }
        .f-chip { display:flex; align-items:center; gap:6px; padding:8px 14px; border-radius:10px; font-size:.82rem; font-weight:800; }
        .f-chip.blue  { background:#eff6ff; color:#2563eb; }
        .f-chip.gray  { background:#f8fafc; color:#475569; border:1px solid #e2e8f0; }
        .f-chip.green { background:#f0fdf4; color:#16a34a; }
        .f-op { font-size:1.1rem; font-weight:900; color:#cbd5e1; }

        /* ADJUSTMENTS */
        .adj-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:12px; }
        @media(max-width:480px) { .adj-grid { grid-template-columns:1fr; } }
        .adj { display:flex; flex-direction:column; gap:6px; }
        .adj label { display:flex; align-items:center; gap:5px; font-size:.72rem; font-weight:800; text-transform:uppercase; }
        .adj.green label { color:#16a34a; }
        .adj.red   label { color:#dc2626; }
        .adj.amber label { color:#d97706; }
        .adj-inp { position:relative; }
        .adj-inp input { width:100%; padding:9px 38px 9px 12px; border-radius:10px; border:1.5px solid #e2e8f0; background:#f8fafc; font-size:.9rem; font-weight:800; color:#1e293b; outline:none; transition:border-color .2s; box-sizing:border-box; }
        .adj.green .adj-inp input:focus { border-color:#16a34a; background:#f0fdf4; }
        .adj.red   .adj-inp input:focus { border-color:#dc2626; background:#fef2f2; }
        .adj.amber .adj-inp input:focus { border-color:#d97706; background:#fffbeb; }
        .adj-inp input:disabled { opacity:.5; cursor:not-allowed; }
        .adj-inp span { position:absolute; left:8px; top:50%; transform:translateY(-50%); font-size:.65rem; font-weight:800; color:#94a3b8; background:#e2e8f0; padding:2px 4px; border-radius:4px; pointer-events:none; }

        /* NOTES */
        .notes-ta { width:100%; padding:10px 14px; border-radius:12px; border:1.5px solid #e2e8f0; background:#f8fafc; font-size:.85rem; font-weight:600; color:#334155; outline:none; resize:vertical; transition:border-color .2s; box-sizing:border-box; font-family:inherit; display:block; margin-bottom:14px; }
        .notes-ta:focus { border-color:#3b82f6; background:white; }

        /* NET BAR */
        .net-bar { border-radius:14px; border:1.5px solid; padding:14px 18px; display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
        .net-bar.success { background:#f0fdf4; border-color:#bbf7d0; }
        .net-bar.danger  { background:#fef2f2; border-color:#fecaca; }
        .nb-left { display:flex; align-items:center; gap:8px; flex-wrap:wrap; font-size:.85rem; font-weight:800; color:#475569; }
        .nb-left .plus  { color:#16a34a; }
        .nb-left .minus { color:#dc2626; }
        .nb-right { display:flex; flex-direction:column; align-items:flex-end; }
        .nb-lbl { font-size:.6rem; font-weight:800; color:#94a3b8; text-transform:uppercase; }
        .nb-val { font-size:1.4rem; font-weight:900; }
        .net-bar.success .nb-val { color:#16a34a; }
        .net-bar.danger  .nb-val { color:#dc2626; }

        /* ACTIONS */
        .ec-actions { display:flex; gap:10px; }
        .btn-edit { display:flex; align-items:center; gap:6px; background:#f1f5f9; color:#475569; border:none; border-radius:12px; padding:10px 16px; font-size:.82rem; font-weight:800; cursor:pointer; transition:.2s; }
        .btn-edit:hover { background:#e2e8f0; }
        .btn-confirm { flex:1; display:flex; align-items:center; justify-content:center; gap:8px; background:linear-gradient(135deg,#1e293b,#334155); color:white; border:none; border-radius:12px; padding:12px 20px; font-size:.88rem; font-weight:800; cursor:pointer; transition:.2s; box-shadow:0 4px 12px rgba(30,41,59,.2); }
        .btn-confirm:hover:not(:disabled) { background:linear-gradient(135deg,#3b82f6,#6366f1); box-shadow:0 6px 20px rgba(99,102,241,.3); transform:translateY(-1px); }
        .btn-confirm:disabled { opacity:.5; cursor:not-allowed; transform:none; }
        .saved .btn-confirm { background:linear-gradient(135deg,#16a34a,#15803d); }
      `}</style>
    </div>
  );
}

export default function PayrollPage() {
  useSession();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear]   = useState(new Date().getFullYear());
  const [employees, setEmployees] = useState<PayrollEmployee[]>([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState<'all' | 'pending' | 'saved'>('all');

  const years = [new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1];

  const fetchPayroll = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/payroll/calculate?month=${month}&year=${year}`);
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.map((e: any) => ({
          ...e,
          bonus:      e.existingPayroll?.bonus      || 0,
          deductions: e.existingPayroll?.deductions || 0,
          advance:    e.existingPayroll?.advance    || 0,
          notes:      e.existingPayroll?.notes      || '',
          status:     e.existingPayroll ? 'saved' : 'pending',
        })));
      } else {
        setError('فشل في جلب البيانات');
      }
    } catch {
      setError('خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayroll(); }, [month, year]);

  const handleUpdate = (id: string, field: string, value: any) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, [field]: value, status: 'pending' } : e));
  };

  const handleSave = async (emp: PayrollEmployee) => {
    setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, status: 'saving' } : e));
    try {
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: emp.id, month, year,
          totalHours: emp.totalHours, hourlyRate: emp.hourlyRate,
          bonus: emp.bonus, deductions: emp.deductions, advance: emp.advance,
          notes: emp.notes || `راتب ${MONTHS[month - 1]} ${year}`,
        }),
      });
      setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, status: res.ok ? 'saved' : 'pending' } : e));
      if (!res.ok) alert('فشل في الحفظ');
    } catch {
      setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, status: 'pending' } : e));
    }
  };

  const handleReset = (id: string) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: 'pending' } : e));
  };

  const stats = useMemo(() => ({
    totalNet:       employees.reduce((s, e) => s + e.baseSalary + e.bonus - e.deductions - e.advance, 0),
    totalHours:     employees.reduce((s, e) => s + e.totalHours, 0),
    totalBonuses:   employees.reduce((s, e) => s + e.bonus, 0),
    totalDeductions:employees.reduce((s, e) => s + e.deductions + e.advance, 0),
    savedCount:     employees.filter(e => e.status === 'saved').length,
    pendingCount:   employees.filter(e => e.status === 'pending').length,
  }), [employees]);

  const filtered = useMemo(() =>
    employees
      .filter(e => filter === 'all' || e.status === filter)
      .filter(e => !search || e.fullName.includes(search) || e.jobTitle.includes(search))
  , [employees, filter, search]);

  const progress = employees.length ? Math.round((stats.savedCount / employees.length) * 100) : 0;

  return (
    <div className="pp">
      {/* HEADER */}
      <div className="pp-header">
        <div className="pp-title">
          <div className="pp-icon"><Calculator size={26} /></div>
          <div>
            <h1>إدارة الرواتب والمرتبات</h1>
            <p>احسب وأكد رواتب الموظفين شهريًا</p>
          </div>
        </div>
        <div className="period-pick">
          <Calendar size={16} />
          <select value={month} onChange={e => setMonth(+e.target.value)}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <div className="sep" />
          <select value={year} onChange={e => setYear(+e.target.value)}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div className="err-bar"><AlertCircle size={16} /> {error}</div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>جاري تحميل بيانات الرواتب...</p>
        </div>
      ) : (
        <>
          {/* STATS */}
          <div className="stats-grid">
            <div className="stat" style={{'--c':'#3b82f6'} as any}>
              <Wallet size={22} />
              <div>
                <span className="s-lbl">إجمالي الرواتب الصافية</span>
                <span className="s-val">{stats.totalNet.toLocaleString('ar-EG')} ج.م</span>
              </div>
            </div>
            <div className="stat" style={{'--c':'#8b5cf6'} as any}>
              <Users size={22} />
              <div>
                <span className="s-lbl">الموظفون</span>
                <span className="s-val">{employees.length}</span>
                <span className="s-sub">{stats.savedCount} مؤكد • {stats.pendingCount} معلّق</span>
              </div>
            </div>
            <div className="stat" style={{'--c':'#f59e0b'} as any}>
              <Clock size={22} />
              <div>
                <span className="s-lbl">إجمالي الساعات</span>
                <span className="s-val">{hoursDisplay(stats.totalHours)}</span>
              </div>
            </div>
            <div className="stat" style={{'--c':'#10b981'} as any}>
              <TrendingUp size={22} />
              <div>
                <span className="s-lbl">إجمالي المكافآت</span>
                <span className="s-val">{stats.totalBonuses.toLocaleString()} ج.م</span>
              </div>
            </div>
            <div className="stat" style={{'--c':'#ef4444'} as any}>
              <TrendingDown size={22} />
              <div>
                <span className="s-lbl">خصومات وسلف</span>
                <span className="s-val">{stats.totalDeductions.toLocaleString()} ج.م</span>
              </div>
            </div>
          </div>

          {/* PROGRESS */}
          {employees.length > 0 && (
            <div className="prog-wrap">
              <div className="prog-labels">
                <span>تم تأكيد <strong>{stats.savedCount}</strong> من <strong>{employees.length}</strong> موظف</span>
                <span>{progress}%</span>
              </div>
              <div className="prog-track">
                <div className="prog-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* TOOLBAR */}
          <div className="toolbar">
            <div className="search-box">
              <Search size={16} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث عن موظف..." />
              {search && <button onClick={() => setSearch('')}><X size={14} /></button>}
            </div>
            <div className="filter-tabs">
              {(['all', 'pending', 'saved'] as const).map(f => (
                <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                  {f === 'all' ? 'الكل' : f === 'pending' ? 'معلّق' : 'مؤكد'}
                </button>
              ))}
            </div>
          </div>

          {/* CARDS */}
          {filtered.length === 0 ? (
            <div className="empty-state">
              <Users size={48} strokeWidth={1} />
              <p>{employees.length === 0 ? 'لا يوجد موظفون في هذا الشهر' : 'لا توجد نتائج للبحث'}</p>
            </div>
          ) : (
            <div className="cards-list">
              {filtered.map(emp => (
                <EmployeeCard key={emp.id} emp={emp}
                  onUpdate={handleUpdate} onSave={handleSave} onReset={handleReset} />
              ))}
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .pp { padding:24px; direction:rtl; animation:fadeUp .4s ease; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }

        /* HEADER */
        .pp-header { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; margin-bottom:28px; }
        .pp-title  { display:flex; align-items:center; gap:16px; }
        .pp-icon   { width:52px; height:52px; background:linear-gradient(135deg,#3b82f6,#6366f1); border-radius:16px; color:white; display:flex; align-items:center; justify-content:center; box-shadow:0 8px 20px rgba(99,102,241,.3); flex-shrink:0; }
        .pp-title h1 { margin:0; font-size:1.5rem; font-weight:900; color:#1e293b; }
        .pp-title p  { margin:0; font-size:.8rem; color:#94a3b8; font-weight:600; }

        .period-pick { display:flex; align-items:center; gap:10px; background:white; border:1.5px solid #e2e8f0; border-radius:14px; padding:10px 16px; box-shadow:0 2px 8px rgba(0,0,0,.04); }
        .period-pick select { border:none; background:transparent; font-weight:800; font-size:.95rem; color:#1e293b; outline:none; cursor:pointer; }
        .sep { width:1px; height:20px; background:#e2e8f0; }

        /* ERROR */
        .err-bar { display:flex; align-items:center; gap:10px; background:#fef2f2; border:1px solid #fecaca; color:#b91c1c; padding:14px 18px; border-radius:14px; font-weight:700; margin-bottom:20px; }

        /* LOADING */
        .loading-state { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; padding:80px 0; color:#94a3b8; font-weight:700; }
        .spinner { width:40px; height:40px; border:3px solid #e2e8f0; border-top-color:#3b82f6; border-radius:50%; animation:spin .8s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }

        /* STATS */
        .stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(155px,1fr)); gap:12px; margin-bottom:20px; }
        .stat { background:white; border-radius:18px; padding:16px 18px; display:flex; align-items:center; gap:12px; border:1.5px solid #f1f5f9; box-shadow:0 2px 8px rgba(0,0,0,.04); transition:transform .2s,box-shadow .2s; }
        .stat:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,0,0,.08); }
        .stat > svg { flex-shrink:0; color:var(--c); }
        .stat > div { display:flex; flex-direction:column; gap:2px; min-width:0; }
        .s-lbl { font-size:.68rem; font-weight:700; color:#94a3b8; text-transform:uppercase; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .s-val { font-size:1.05rem; font-weight:900; color:#1e293b; }
        .s-sub { font-size:.65rem; color:#cbd5e1; font-weight:600; }

        /* PROGRESS */
        .prog-wrap { background:white; border-radius:16px; padding:16px 20px; margin-bottom:20px; border:1.5px solid #f1f5f9; }
        .prog-labels { display:flex; justify-content:space-between; font-size:.82rem; font-weight:700; color:#64748b; margin-bottom:10px; }
        .prog-track { height:8px; background:#f1f5f9; border-radius:99px; overflow:hidden; }
        .prog-fill  { height:100%; background:linear-gradient(90deg,#3b82f6,#10b981); border-radius:99px; transition:width .6s cubic-bezier(.34,1.56,.64,1); }

        /* TOOLBAR */
        .toolbar { display:flex; align-items:center; gap:12px; margin-bottom:16px; flex-wrap:wrap; }
        .search-box { flex:1; min-width:200px; display:flex; align-items:center; gap:10px; background:white; border:1.5px solid #e2e8f0; border-radius:12px; padding:10px 14px; }
        .search-box input { flex:1; border:none; background:transparent; outline:none; font-size:.9rem; font-weight:600; color:#334155; direction:rtl; }
        .search-box svg { color:#94a3b8; flex-shrink:0; }
        .search-box button { background:none; border:none; color:#94a3b8; cursor:pointer; display:flex; padding:0; }
        .filter-tabs { display:flex; background:white; border:1.5px solid #e2e8f0; border-radius:12px; overflow:hidden; }
        .tab { padding:10px 16px; background:none; border:none; cursor:pointer; font-size:.82rem; font-weight:800; color:#64748b; transition:.15s; }
        .tab.active { background:#1e293b; color:white; }
        .tab:not(.active):hover { background:#f8fafc; }

        /* EMPTY */
        .empty-state { text-align:center; padding:80px 20px; color:#cbd5e1; display:flex; flex-direction:column; align-items:center; gap:14px; font-size:.9rem; font-weight:700; }

        /* CARDS */
        .cards-list { display:flex; flex-direction:column; gap:10px; }
      `}</style>
    </div>
  );
}
