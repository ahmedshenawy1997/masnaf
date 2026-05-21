"use client";

import { useState } from 'react';
import { X, Calculator, AlertCircle, Clock, DollarSign, Award, TrendingDown, CreditCard, FileText } from 'lucide-react';

export default function SettleModal({
  profile,
  totalHours,
  currentSalary,
  onClose,
  onSuccess,
}: {
  profile: any;
  totalHours: number;
  currentSalary: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [bonus,      setBonus]      = useState('0');
  const [deductions, setDeductions] = useState('0');
  const [advance,    setAdvance]    = useState('0');
  const [notes,      setNotes]      = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');

  const now   = new Date();
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();

  const bonusVal = parseFloat(bonus)      || 0;
  const dedVal   = parseFloat(deductions) || 0;
  const advVal   = parseFloat(advance)    || 0;
  const net      = currentSalary + bonusVal - dedVal - advVal;

  const hoursLabel = (h: number) => {
    const rounded = Math.round(h * 60);
    const full = Math.floor(rounded / 60);
    const mins = rounded % 60;
    return mins > 0 ? `${full}س ${mins}د` : `${full} ساعة`;
  };

  const fmt = (n: number) =>
    Math.round(n * 100) / 100 === Math.round(n)
      ? Math.round(n).toLocaleString('ar-EG')
      : (Math.round(n * 100) / 100).toLocaleString('ar-EG', { maximumFractionDigits: 2 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/employees/${profile.id}/payroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month, year,
          totalHours:  parseFloat(totalHours.toFixed(2)),
          hourlyRate:  profile.hourlyRate,
          bonus:       bonusVal,
          deductions:  dedVal,
          advance:     advVal,
          netAmount:   net,
          notes:       notes.trim(),
        }),
      });
      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error || 'فشل في التسوية');
      }
    } catch {
      setError('خطأ في الاتصال، حاول مرة أخرى');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">

        {/* HEADER */}
        <div className="modal-header">
          <div className="mh-icon"><Calculator size={22} /></div>
          <div className="mh-text">
            <h2>تسوية المرتب</h2>
            <p>{profile.fullName} — {month}/{year}</p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* SUMMARY BANNER */}
          <div className="banner">
            <div className="ban-item">
              <div className="ban-icon blue"><Clock size={16} /></div>
              <div>
                <span className="ban-lbl">ساعات العمل</span>
                <span className="ban-val">{hoursLabel(totalHours)}</span>
              </div>
            </div>
            <div className="ban-sep" />
            <div className="ban-item">
              <div className="ban-icon purple"><DollarSign size={16} /></div>
              <div>
                <span className="ban-lbl">سعر الساعة</span>
                <span className="ban-val">{profile.hourlyRate.toFixed(0)} ر.س</span>
              </div>
            </div>
            <div className="ban-sep" />
            <div className="ban-item">
              <div className="ban-icon green"><DollarSign size={16} /></div>
              <div>
                <span className="ban-lbl">الراتب المحسوب</span>
                <span className="ban-val main">{fmt(currentSalary)} ر.س</span>
              </div>
            </div>
          </div>

          {/* ADJUSTMENTS */}
          <div className="adj-section">
            <span className="adj-title">التعديلات</span>
            <div className="adj-grid">
              <div className="adj-group">
                <label className="green-lbl"><Award size={13} /> مكافأة</label>
                <div className="inp-wrap">
                  <input type="number" step="1" min="0" value={bonus}
                    onChange={e => setBonus(e.target.value)} placeholder="0" />
                  <span className="curr">ر.س</span>
                </div>
              </div>
              <div className="adj-group">
                <label className="red-lbl"><TrendingDown size={13} /> خصم</label>
                <div className="inp-wrap">
                  <input type="number" step="1" min="0" value={deductions}
                    onChange={e => setDeductions(e.target.value)} placeholder="0" />
                  <span className="curr">ر.س</span>
                </div>
              </div>
              <div className="adj-group full">
                <label className="amber-lbl"><CreditCard size={13} /> سلفة</label>
                <div className="inp-wrap">
                  <input type="number" step="1" min="0" value={advance}
                    onChange={e => setAdvance(e.target.value)} placeholder="0" />
                  <span className="curr">ر.س</span>
                </div>
              </div>
            </div>
          </div>

          {/* NOTES */}
          <div className="notes-group">
            <label><FileText size={13} /> ملاحظات</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="أي ملاحظات إضافية..." rows={2} />
          </div>

          {/* NET TOTAL */}
          <div className={`net-box ${net < 0 ? 'danger' : ''}`}>
            <div className="net-breakdown">
              <span className="nb-base">{fmt(currentSalary)}</span>
              {bonusVal > 0 && <span className="nb-plus">+ {fmt(bonusVal)}</span>}
              {dedVal   > 0 && <span className="nb-minus">− {fmt(dedVal)}</span>}
              {advVal   > 0 && <span className="nb-minus">− {fmt(advVal)}</span>}
            </div>
            <div className="net-result">
              <span className="net-lbl">الراتب الصافي</span>
              <span className="net-val">{fmt(net)} <em>ر.س</em></span>
            </div>
          </div>

          {error && (
            <div className="err-msg"><AlertCircle size={14} /> {error}</div>
          )}

          {/* ACTIONS */}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>إلغاء</button>
            <button type="submit" className="btn-pay" disabled={submitting || net < 0}>
              {submitting ? <div className="spin" /> : 'تأكيد الدفع'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .overlay { position:fixed; inset:0; z-index:999; background:rgba(15,23,42,.65); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; padding:1rem; }
        .modal { background:white; border-radius:28px; width:100%; max-width:480px; box-shadow:0 25px 60px rgba(0,0,0,.2); overflow:hidden; direction:rtl; }

        /* HEADER */
        .modal-header { display:flex; align-items:center; gap:14px; padding:22px 24px; border-bottom:1px solid #f1f5f9; }
        .mh-icon { width:46px; height:46px; background:linear-gradient(135deg,#eff6ff,#e0e7ff); color:#3b82f6; border-radius:14px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .mh-text h2 { margin:0; font-size:1.1rem; font-weight:900; color:#1e293b; }
        .mh-text p  { margin:0; font-size:.78rem; color:#64748b; font-weight:600; }
        .close-btn { margin-right:auto; background:none; border:none; color:#94a3b8; cursor:pointer; padding:6px; border-radius:8px; display:flex; }
        .close-btn:hover { background:#f1f5f9; color:#64748b; }

        form { padding:20px 24px; display:flex; flex-direction:column; gap:16px; }

        /* BANNER */
        .banner { display:flex; align-items:center; background:#f8fafc; border-radius:16px; padding:14px 16px; border:1px solid #f1f5f9; gap:12px; flex-wrap:wrap; }
        .ban-item { display:flex; align-items:center; gap:10px; flex:1; min-width:100px; }
        .ban-icon { width:32px; height:32px; border-radius:9px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .ban-icon.blue   { background:#eff6ff; color:#2563eb; }
        .ban-icon.purple { background:#f5f3ff; color:#7c3aed; }
        .ban-icon.green  { background:#f0fdf4; color:#16a34a; }
        .ban-item > div  { display:flex; flex-direction:column; gap:2px; }
        .ban-lbl { font-size:.6rem; font-weight:800; color:#94a3b8; text-transform:uppercase; }
        .ban-val { font-size:.9rem; font-weight:900; color:#334155; }
        .ban-val.main { color:#3b82f6; font-size:1rem; }
        .ban-sep { width:1px; height:36px; background:#e2e8f0; flex-shrink:0; }

        /* ADJUSTMENTS */
        .adj-section { display:flex; flex-direction:column; gap:10px; }
        .adj-title { font-size:.72rem; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:.5px; }
        .adj-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        .adj-group { display:flex; flex-direction:column; gap:6px; }
        .adj-group.full { grid-column:1/-1; }
        .adj-group label { display:flex; align-items:center; gap:5px; font-size:.75rem; font-weight:800; }
        .green-lbl { color:#16a34a; }
        .red-lbl   { color:#dc2626; }
        .amber-lbl { color:#d97706; }
        .inp-wrap { position:relative; }
        .inp-wrap input { width:100%; padding:10px 40px 10px 12px; border-radius:12px; border:1.5px solid #e2e8f0; background:#f8fafc; font-size:.92rem; font-weight:800; color:#1e293b; outline:none; transition:border-color .2s; box-sizing:border-box; }
        .inp-wrap input:focus { border-color:#3b82f6; background:white; }
        .curr { position:absolute; left:10px; top:50%; transform:translateY(-50%); font-size:.65rem; font-weight:800; color:#94a3b8; background:#e2e8f0; padding:2px 5px; border-radius:4px; pointer-events:none; }

        /* NOTES */
        .notes-group { display:flex; flex-direction:column; gap:6px; }
        .notes-group label { display:flex; align-items:center; gap:5px; font-size:.75rem; font-weight:800; color:#64748b; }
        .notes-group textarea { padding:10px 14px; border-radius:12px; border:1.5px solid #e2e8f0; background:#f8fafc; font-size:.85rem; font-weight:600; color:#334155; outline:none; resize:vertical; transition:border-color .2s; font-family:inherit; }
        .notes-group textarea:focus { border-color:#3b82f6; background:white; }

        /* NET BOX */
        .net-box { background:#1e293b; border-radius:18px; padding:18px 20px; display:flex; align-items:center; justify-content:space-between; }
        .net-box.danger { background:#7f1d1d; }
        .net-breakdown { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .nb-base  { font-size:.9rem; font-weight:800; color:#94a3b8; }
        .nb-plus  { font-size:.9rem; font-weight:800; color:#4ade80; }
        .nb-minus { font-size:.9rem; font-weight:800; color:#f87171; }
        .net-result { display:flex; flex-direction:column; align-items:flex-end; gap:2px; }
        .net-lbl { font-size:.62rem; font-weight:800; color:#64748b; text-transform:uppercase; }
        .net-val { font-size:2rem; font-weight:900; color:white; line-height:1; }
        .net-val em { font-size:1rem; font-weight:700; opacity:.7; font-style:normal; }

        /* ERROR */
        .err-msg { display:flex; align-items:center; gap:8px; background:#fef2f2; color:#b91c1c; padding:12px 14px; border-radius:12px; font-size:.82rem; font-weight:700; border:1px solid #fecaca; }

        /* ACTIONS */
        .modal-actions { display:flex; gap:10px; }
        .btn-cancel { flex:1; padding:14px; border-radius:14px; border:1.5px solid #e2e8f0; background:white; color:#64748b; font-weight:800; cursor:pointer; transition:.2s; font-size:.9rem; }
        .btn-cancel:hover { background:#f8fafc; border-color:#cbd5e1; }
        .btn-pay { flex:2; padding:14px; border-radius:14px; border:none; background:linear-gradient(135deg,#2563eb,#4f46e5); color:white; font-weight:900; font-size:.95rem; cursor:pointer; transition:.2s; box-shadow:0 4px 14px rgba(37,99,235,.3); }
        .btn-pay:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 20px rgba(37,99,235,.4); }
        .btn-pay:disabled { opacity:.5; cursor:not-allowed; transform:none; box-shadow:none; }
        .spin { width:20px; height:20px; border:2px solid rgba(255,255,255,.3); border-top-color:white; border-radius:50%; animation:spin .8s linear infinite; margin:0 auto; }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}
