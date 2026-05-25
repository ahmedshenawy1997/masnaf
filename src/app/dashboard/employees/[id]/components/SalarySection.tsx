"use client";

import { useState, useEffect } from 'react';
import {
  Clock, DollarSign, TrendingUp, CreditCard,
  History, ChevronDown, Edit2, Check, X,
  Calculator, Banknote, CheckCircle, AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import SettleModal from './SettleModal';
import PayrollHistory from './PayrollHistory';

export default function SalarySection({
  profile,
  isAdmin,
  selectedMonth,
  selectedYear,
}: {
  profile: any;
  isAdmin: boolean;
  selectedMonth?: number;
  selectedYear?: number;
}) {
  const router = useRouter();
  const [stats, setStats]           = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [editing, setEditing]       = useState(false);
  const [newRate, setNewRate]       = useState(String(profile.hourlyRate));
  const [saving, setSaving]         = useState(false);
  const [showSettle, setShowSettle] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      let url = `/api/employees/${profile.id}/salary-stats`;
      if (selectedMonth && selectedYear) url += `?month=${selectedMonth}&year=${selectedYear}`;
      const res = await fetch(url);
      if (res.ok) setStats(await res.json());
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, [profile.id, profile.hourlyRate, selectedMonth, selectedYear]);

  const saveRate = async () => {
    const rate = parseFloat(newRate);
    if (isNaN(rate) || rate < 0) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/employees/${profile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hourlyRate: rate }),
      });
      if (res.ok) { setEditing(false); router.refresh(); fetchStats(); }
    } finally {
      setSaving(false);
    }
  };

  const monthHours       = stats?.totalHoursMonth  || 0;
  const monthSalary      = monthHours * profile.hourlyRate;
  const remainingHours   = stats?.remainingHours    || 0;
  const remainingBalance = remainingHours * profile.hourlyRate;
  const monthPaid        = stats?.totalPaidMonth    || 0;
  const allTimePaid      = stats?.totalPaidAllTime  || 0;
  const hasDues          = remainingBalance > 0;

  const hoursLabel = (h: number) => {
    const rounded = Math.round(h * 60); // total minutes rounded
    const full = Math.floor(rounded / 60);
    const mins = rounded % 60;
    return mins > 0 ? `${full} س ${mins} د` : `${full} ساعة`;
  };

  const fmt = (n: number) =>
    Math.round(n * 100) / 100 === Math.round(n)
      ? Math.round(n).toLocaleString('ar-EG')
      : (Math.round(n * 100) / 100).toLocaleString('ar-EG', { maximumFractionDigits: 2 });

  return (
    <div className="sw">

      {/* ── CALCULATOR CARD ── */}
      <div className="calc-card">
        <div className="calc-title">
          <Calculator size={16} />
          <span>حاسبة المرتب الشهري</span>
        </div>

        <div className="formula">
          {/* Hours block */}
          <div className="f-block">
            <div className="f-icon blue"><Clock size={18} /></div>
            <div className="f-text">
              <span className="f-lbl">ساعات العمل</span>
              <span className="f-num blue">{loading ? '...' : hoursLabel(monthHours)}</span>
            </div>
          </div>

          <span className="f-op">×</span>

          {/* Rate block */}
          <div className="f-block">
            <div className="f-icon purple"><DollarSign size={18} /></div>
            <div className="f-text">
              <span className="f-lbl">سعر الساعة</span>
              {editing ? (
                <div className="rate-edit">
                  <input type="number" value={newRate} autoFocus
                    onChange={e => setNewRate(e.target.value)} />
                  <span className="curr">ر.س</span>
                  <button className="r-save" onClick={saveRate} disabled={saving}><Check size={13} /></button>
                  <button className="r-cancel" onClick={() => setEditing(false)}><X size={13} /></button>
                </div>
              ) : (
                <div className="rate-view">
                  <span className="f-num purple">{profile.hourlyRate.toFixed(0)} ر.س</span>
                  {isAdmin && (
                    <button className="edit-rate-btn" onClick={() => setEditing(true)}>
                      <Edit2 size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <span className="f-op">=</span>

          {/* Result block */}
          <div className="f-result">
            <span className="f-lbl">الراتب الشهري</span>
            <span className="result-num">{loading ? '...' : fmt(monthSalary)} ر.س</span>
          </div>
        </div>
      </div>

      {/* ── STATUS CARD ── */}
      <div className={`status-card ${hasDues ? 'dues' : 'clear'}`}>
        <div className={`st-icon ${hasDues ? 'red' : 'green'}`}>
          {hasDues ? <AlertCircle size={30} /> : <CheckCircle size={30} />}
        </div>
        <div className="st-body">
          <span className="st-label">{hasDues ? 'مستحقات غير مسددة' : 'لا توجد مستحقات'}</span>
          <span className="st-amount">{loading ? '...' : fmt(remainingBalance)} ر.س</span>
          <span className="st-sub">
            {loading ? '' : `${hoursLabel(remainingHours)} غير محسوبة`}
          </span>
        </div>
        {isAdmin && hasDues && (
          <button className="pay-btn" onClick={() => setShowSettle(true)} disabled={loading}>
            دفع الآن
          </button>
        )}
      </div>

      {/* ── QUICK STATS ── */}
      <div className="qs-wrap">
        <div className="qs-row">
          <div className="qs-icon"><TrendingUp size={15} /></div>
          <span className="qs-label">المدفوع هذا الشهر</span>
          <span className="qs-val green">{loading ? '...' : fmt(monthPaid)} ر.س</span>
        </div>
        <div className="qs-divider" />
        <div className="qs-row">
          <div className="qs-icon"><Banknote size={15} /></div>
          <span className="qs-label">إجمالي المدفوع</span>
          <span className="qs-val">{loading ? '...' : fmt(allTimePaid)} ر.س</span>
        </div>
        <div className="qs-divider" />
        <div className="qs-row">
          <div className="qs-icon"><CreditCard size={15} /></div>
          <span className="qs-label">سعر الساعة الحالي</span>
          <span className="qs-val">{profile.hourlyRate.toFixed(0)} ر.س</span>
        </div>
      </div>

      {/* ── HISTORY TOGGLE ── */}
      <button className={`hist-toggle ${showHistory ? 'open' : ''}`}
        onClick={() => setShowHistory(p => !p)}>
        <History size={15} />
        <span>سجل المدفوعات</span>
        <ChevronDown size={14} className="h-arrow" />
      </button>

      {showHistory && (
        <div className="hist-body">
          <PayrollHistory
            employeeId={profile.id}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        </div>
      )}

      {/* SETTLE MODAL */}
      {showSettle && (
        <SettleModal
          profile={profile}
          totalHours={remainingHours}
          currentSalary={remainingBalance}
          onClose={() => setShowSettle(false)}
          onSuccess={() => { setShowSettle(false); fetchStats(); setShowHistory(true); }}
        />
      )}

      <style jsx>{`
        .sw { display:flex; flex-direction:column; gap:14px; }

        /* CALCULATOR */
        .calc-card { background:white; border:1.5px solid #e2e8f0; border-radius:20px; padding:20px; }
        .calc-title { display:flex; align-items:center; gap:8px; font-size:.75rem; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:.5px; margin-bottom:16px; }

        .formula { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
        .f-block { display:flex; align-items:center; gap:10px; background:#f8fafc; border-radius:14px; padding:12px 14px; flex:1; min-width:110px; }
        .f-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .f-icon.blue   { background:#eff6ff; color:#2563eb; }
        .f-icon.purple { background:#f5f3ff; color:#7c3aed; }
        .f-text { display:flex; flex-direction:column; gap:3px; }
        .f-lbl  { font-size:.62rem; font-weight:700; color:#94a3b8; text-transform:uppercase; }
        .f-num  { font-size:1rem; font-weight:900; }
        .f-num.blue   { color:#2563eb; }
        .f-num.purple { color:#7c3aed; }
        .f-op { font-size:1.2rem; font-weight:900; color:#cbd5e1; flex-shrink:0; }

        /* Rate editing */
        .rate-edit { display:flex; align-items:center; gap:5px; }
        .rate-edit input { width:64px; padding:4px 8px; border:2px solid #7c3aed; border-radius:8px; font-weight:800; font-size:.9rem; outline:none; }
        .curr { font-size:.68rem; font-weight:800; color:#94a3b8; }
        .r-save   { display:flex; align-items:center; justify-content:center; width:26px; height:26px; background:#16a34a; color:white; border:none; border-radius:6px; cursor:pointer; }
        .r-cancel { display:flex; align-items:center; justify-content:center; width:26px; height:26px; background:#f1f5f9; color:#94a3b8; border:none; border-radius:6px; cursor:pointer; }
        .rate-view { display:flex; align-items:center; gap:8px; }
        .edit-rate-btn { background:none; border:none; color:#94a3b8; cursor:pointer; padding:4px; border-radius:6px; display:flex; align-items:center; }
        .edit-rate-btn:hover { background:#f1f5f9; color:#7c3aed; }

        .f-result { display:flex; flex-direction:column; gap:3px; flex:1; min-width:110px; padding:12px 14px; background:linear-gradient(135deg,#f0fdf4,#dcfce7); border-radius:14px; border:1px solid #bbf7d0; }
        .result-num { font-size:1.2rem; font-weight:900; color:#15803d; }

        /* STATUS */
        .status-card { border-radius:20px; padding:20px 22px; display:flex; align-items:center; gap:16px; border:2px solid; }
        .status-card.dues  { background:#fef2f2; border-color:#fecaca; }
        .status-card.clear { background:#f0fdf4; border-color:#bbf7d0; }
        .st-icon { flex-shrink:0; }
        .st-icon.red   { color:#dc2626; }
        .st-icon.green { color:#16a34a; }
        .st-body { flex:1; display:flex; flex-direction:column; gap:2px; }
        .st-label { font-size:.68rem; font-weight:800; text-transform:uppercase; color:#64748b; letter-spacing:.5px; }
        .st-amount { font-size:1.9rem; font-weight:900; line-height:1.1; color:#1e293b; }
        .status-card.dues  .st-amount { color:#dc2626; }
        .status-card.clear .st-amount { color:#16a34a; }
        .st-sub { font-size:.72rem; color:#64748b; font-weight:600; }

        .pay-btn { background:#dc2626; color:white; border:none; border-radius:14px; padding:12px 18px; font-weight:900; font-size:.88rem; cursor:pointer; transition:.2s; white-space:nowrap; flex-shrink:0; box-shadow:0 4px 12px rgba(220,38,38,.25); }
        .pay-btn:hover { transform:translateY(-2px); box-shadow:0 8px 18px rgba(220,38,38,.35); }
        .pay-btn:disabled { opacity:.4; cursor:not-allowed; transform:none; box-shadow:none; }

        /* QUICK STATS */
        .qs-wrap { background:white; border:1.5px solid #f1f5f9; border-radius:18px; overflow:hidden; }
        .qs-row { display:flex; align-items:center; gap:10px; padding:13px 18px; }
        .qs-divider { height:1px; background:#f1f5f9; }
        .qs-icon { width:30px; height:30px; background:#f8fafc; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#64748b; flex-shrink:0; }
        .qs-label { flex:1; font-size:.82rem; font-weight:700; color:#64748b; }
        .qs-val { font-size:.95rem; font-weight:900; color:#1e293b; }
        .qs-val.green { color:#16a34a; }

        /* HISTORY */
        .hist-toggle { width:100%; display:flex; align-items:center; gap:10px; padding:13px 18px; border-radius:16px; border:1.5px solid #f1f5f9; background:#f8fafc; color:#64748b; font-weight:800; font-size:.85rem; cursor:pointer; transition:.2s; }
        .hist-toggle:hover { background:#f1f5f9; color:#3b82f6; border-color:#bfdbfe; }
        .h-arrow { margin-right:auto; transition:.3s; }
        .hist-toggle.open .h-arrow { transform:rotate(180deg); }
        .hist-body { border:1.5px solid #f1f5f9; border-radius:18px; padding:12px; background:white; animation:slideIn .3s ease; }
        @keyframes slideIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }

        /* ── MOBILE ── */
        @media (max-width: 640px) {
          .status-card { flex-wrap:wrap; gap:10px; }
          .st-amount { font-size:1.5rem; }
          .pay-btn { width:100%; justify-content:center; text-align:center; }
          .formula { gap:6px; }
          .f-block { min-width:90px; padding:10px; }
          .f-num { font-size:.9rem; }
          .result-num { font-size:1rem; }
        }
      `}</style>
    </div>
  );
}
