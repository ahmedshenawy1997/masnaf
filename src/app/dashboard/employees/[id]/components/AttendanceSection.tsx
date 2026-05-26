"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Clock, LogIn, LogOut, MapPin, X, CheckCircle, XCircle, Timer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';

/* ── Day Detail Modal ── */
function DayModal({ day, record, onClose }: { day: string; record: any | null; onClose: () => void }) {
  const fmt = (iso: string) => new Date(iso).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

  const hoursLabel = (h: number) => {
    const rounded = Math.round(h * 60);
    const full = Math.floor(rounded / 60);
    const mins = rounded % 60;
    return mins > 0 ? `${full} س ${mins} د` : `${full} ساعة`;
  };

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '380px', boxShadow: '0 30px 80px rgba(0,0,0,0.2)', direction: 'rtl', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px', background: record ? '#1e293b' : '#fef2f2' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: record ? 'rgba(255,255,255,0.12)' : '#fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {record ? <CheckCircle size={22} color="#4ade80" /> : <XCircle size={22} color="#ef4444" />}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 700, color: record ? '#94a3b8' : '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {record ? 'يوم حضور' : 'غياب'}
            </p>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: record ? '#fff' : '#b91c1c' }}>{day}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: record ? '#64748b' : '#fca5a5', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px' }}>
          {record ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {/* Check-in */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: '#f0fdf4', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
                <div style={{ width: '36px', height: '36px', background: '#22c55e', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <LogIn size={18} color="white" />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>تسجيل حضور</p>
                  <p style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#15803d' }}>{fmt(record.checkInTime)}</p>
                </div>
                {record.checkInLat && (
                  <a href={`https://maps.google.com/?q=${record.checkInLat},${record.checkInLng}`} target="_blank" rel="noopener noreferrer"
                    style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: '#16a34a', color: 'white', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 800, textDecoration: 'none' }}>
                    <MapPin size={13} />
                    الموقع
                  </a>
                )}
              </div>

              {/* Check-out */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: record.checkOutTime ? '#fff1f2' : '#f8fafc', borderRadius: '16px', border: `1px solid ${record.checkOutTime ? '#fecaca' : '#f1f5f9'}` }}>
                <div style={{ width: '36px', height: '36px', background: record.checkOutTime ? '#ef4444' : '#cbd5e1', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <LogOut size={18} color="white" />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 800, color: record.checkOutTime ? '#dc2626' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>تسجيل انصراف</p>
                  <p style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: record.checkOutTime ? '#b91c1c' : '#94a3b8' }}>
                    {record.checkOutTime ? fmt(record.checkOutTime) : 'لم يُسجَّل بعد'}
                  </p>
                </div>
                {record.checkOutLat && (
                  <a href={`https://maps.google.com/?q=${record.checkOutLat},${record.checkOutLng}`} target="_blank" rel="noopener noreferrer"
                    style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: '#dc2626', color: 'white', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 800, textDecoration: 'none' }}>
                    <MapPin size={13} />
                    الموقع
                  </a>
                )}
              </div>

              {/* Total hours */}
              {record.totalHours != null && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: '#f5f3ff', borderRadius: '16px', border: '1px solid #ddd6fe' }}>
                  <div style={{ width: '36px', height: '36px', background: '#7c3aed', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Timer size={18} color="white" />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.5px' }}>إجمالي ساعات العمل</p>
                    <p style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#5b21b6' }}>{hoursLabel(record.totalHours)}</p>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8' }}>
              <XCircle size={48} style={{ margin: '0 auto 12px', color: '#fca5a5' }} />
              <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#64748b' }}>لا يوجد تسجيل لهذا اليوم</p>
              <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>يوم غياب أو إجازة</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function AttendanceSection({
  profileId,
  isReadOnly,
  compact = false,
  hiringDate,
  externalViewDate,
  onChangeMonth
}: {
  profileId: string;
  isReadOnly: boolean;
  compact?: boolean;
  hiringDate?: string;
  externalViewDate?: Date;
  onChangeMonth?: (offset: number) => void;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [activeAttendance, setActiveAttendance] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [internalViewDate, setInternalViewDate] = useState(new Date());
  const [selectedCell, setSelectedCell] = useState<{ day: string; record: any | null } | null>(null);
  const [mounted, setMounted] = useState(false);
  const viewDate = externalViewDate || internalViewDate;

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { fetchAttendance(); }, [profileId, viewDate]);

  async function fetchAttendance() {
    const month = viewDate.getMonth() + 1;
    const year = viewDate.getFullYear();
    const res = await fetch(`/api/employees/${profileId}/attendance?month=${month}&year=${year}`);
    if (res.ok) {
      const data = await res.json();
      setActiveAttendance(data.active);
      setHistory(data.history);
    }
  }

  const changeMonth = (offset: number) => {
    if (onChangeMonth) {
      onChangeMonth(offset);
    } else {
      const newDate = new Date(internalViewDate);
      newDate.setMonth(newDate.getMonth() + offset);
      setInternalViewDate(newDate);
    }
  };

  const getLocation = (): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) { alert(t('location_not_supported')); resolve(null); }
      else {
        navigator.geolocation.getCurrentPosition(
          pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          err => { console.error(err); alert(t('location_required')); resolve(null); },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    });
  };

  async function handleCheckIn() {
    setLoading(true);
    const loc = await getLocation();
    try {
      const res = await fetch(`/api/employees/${profileId}/attendance`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loc ? { lat: loc.lat, lng: loc.lng } : {})
      });
      if (res.ok) { await fetchAttendance(); router.refresh(); }
    } finally { setLoading(false); }
  }

  async function handleCheckOut() {
    setLoading(true);
    const loc = await getLocation();
    try {
      const res = await fetch(`/api/employees/${profileId}/attendance`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loc ? { lat: loc.lat, lng: loc.lng } : {})
      });
      if (res.ok) { await fetchAttendance(); router.refresh(); }
    } finally { setLoading(false); }
  }

  if (compact) {
    return (
      <div className="flex gap-2">
        {!activeAttendance ? (
          <button onClick={handleCheckIn} disabled={loading || isReadOnly} className="btn btn-primary">
            <LogIn size={18} /><span>{t('check_in')}</span>
          </button>
        ) : (
          <button onClick={handleCheckOut} disabled={loading || isReadOnly} className="btn btn-danger">
            <LogOut size={18} /><span>{t('check_out')}</span>
          </button>
        )}
      </div>
    );
  }

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(viewDate);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const hireDate = hiringDate ? new Date(hiringDate) : null;
  if (hireDate) hireDate.setHours(0, 0, 0, 0);

  const handleDayClick = (d: number, isPast: boolean, isAfterHiring: boolean) => {
    if (!isPast && new Date(year, month, d).toDateString() !== new Date().toDateString()) return; // future day
    const cellDate = new Date(year, month, d);
    const record = history.find(h => new Date(h.date).getDate() === d) || null;
    const dayLabel = cellDate.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    setSelectedCell({ day: dayLabel, record });
  };

  return (
    <div className="attendance-container">
      <div className="att-header">
        <h2 className="section-title-custom m-0">
          <Clock size={22} className="text-primary" />
          {t('attendance_system')}
        </h2>
        <div className="flex gap-2">
          {!activeAttendance ? (
            <button onClick={handleCheckIn} disabled={loading || isReadOnly} className="btn btn-primary">
              <LogIn size={18} /><span>{t('check_in')}</span>
            </button>
          ) : (
            <button onClick={handleCheckOut} disabled={loading || isReadOnly} className="btn btn-danger">
              <LogOut size={18} /><span>{t('check_out')}</span>
            </button>
          )}
        </div>
      </div>

      <div className="attendance-info">
        {activeAttendance ? (
          <div className="flex items-center gap-4">
            <div className="status-indicator pulses" />
            <div>
              <p className="font-semibold text-primary">{t('currently_working')}</p>
              <p className="text-sm text-muted">{t('checked_in_at')} {new Date(activeAttendance.checkInTime).toLocaleTimeString()}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="status-indicator" />
            <div>
              <p className="font-semibold">{t('offline')}</p>
              <p className="text-sm text-muted">{t('not_checked_in')}</p>
            </div>
          </div>
        )}
      </div>

      <h3 className="section-label mb-3">{t('recent_history')}</h3>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>{t('date')}</th>
              <th>{t('check_in')}</th>
              <th>{t('check_out')}</th>
              <th className="text-center">{t('location')}</th>
              <th className="text-end">{t('total_hours')}</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-muted">{t('no_records')}</td></tr>
            ) : (
              history.map((record) => (
                <tr key={record.id}>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>{new Date(record.checkInTime).toLocaleTimeString()}</td>
                  <td>{record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '---'}</td>
                  <td>
                    <div className="flex items-center justify-center gap-3">
                      {record.checkInLat && (
                        <a href={`https://maps.google.com/?q=${record.checkInLat},${record.checkInLng}`} target="_blank" className="flex flex-col items-center justify-center px-3 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors shadow-sm">
                          <MapPin size={18} /><span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Sign In</span>
                        </a>
                      )}
                      {record.checkOutLat && (
                        <a href={`https://maps.google.com/?q=${record.checkOutLat},${record.checkOutLng}`} target="_blank" className="flex flex-col items-center justify-center px-3 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm">
                          <MapPin size={18} /><span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Sign Out</span>
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="text-end font-bold">{record.totalHours ? record.totalHours.toFixed(2) : (record.checkOutTime ? '0.00' : t('in_progress'))}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CALENDAR */}
      <div className="cal-mobile mt-8">
        <div className="cal-header">
          <button onClick={() => changeMonth(-1)} className="cal-nav-btn">&lsaquo;</button>
          <span className="cal-month-label">{monthName}</span>
          <button onClick={() => changeMonth(1)} className="cal-nav-btn">&rsaquo;</button>
        </div>
        <div className="cal-hint">اضغط على أي يوم لعرض التفاصيل</div>
        <div className="cal-grid">
          {[t('sun'), t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat')].map(d => (
            <div key={d} className="cal-weekday">{d}</div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} className="cal-cell" />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1;
            const cellDate = new Date(year, month, d);
            const isToday = new Date().toDateString() === cellDate.toDateString();
            const hasRecord = history.some(h => new Date(h.date).getDate() === d);
            const isPast = cellDate <= today;
            const isAfterHiring = hireDate ? cellDate >= hireDate : false;
            const showRedDot = !hasRecord && isPast && isAfterHiring;
            const isClickable = isPast || isToday;

            return (
              <div
                key={d}
                className={`cal-cell${isToday ? ' cal-today' : ''}${hasRecord ? ' cal-has-record' : ''}${isClickable ? ' cal-clickable' : ''}`}
                onClick={() => isClickable && isAfterHiring && handleDayClick(d, isPast, isAfterHiring)}
                title={isClickable && isAfterHiring ? 'اضغط لعرض التفاصيل' : undefined}
              >
                <span className="cal-day-num">{d}</span>
                {hasRecord && <span className="cal-dot cal-dot-green" />}
                {showRedDot && <span className="cal-dot cal-dot-red" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Portal Modal */}
      {mounted && selectedCell && (
        <DayModal
          day={selectedCell.day}
          record={selectedCell.record}
          onClose={() => setSelectedCell(null)}
        />
      )}

      <style jsx>{`
        .table { width: 100%; border-collapse: separate; border-spacing: 0 8px; }
        .table th { padding: 12px 16px; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; border: none; text-align: start; white-space: nowrap; }
        .table td { padding: 16px; font-size: 0.85rem; font-weight: 600; color: #1e293b; background: #f8fafc; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; white-space: nowrap; }
        .table td:first-child { border-left: 1px solid #f1f5f9; border-top-left-radius: 12px; border-bottom-left-radius: 12px; }
        .table td:last-child { border-right: 1px solid #f1f5f9; border-top-right-radius: 12px; border-bottom-right-radius: 12px; }
        .status-indicator { width: 12px; height: 12px; border-radius: 50%; background: #cbd5e1; }
        .status-indicator.pulses { background: #22c55e; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(34,197,94,.4); } 70% { box-shadow: 0 0 0 10px rgba(34,197,94,0); } 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); } }

        /* ── Calendar ── */
        .cal-mobile { background:#fff; border:1px solid #e2e8f0; border-radius:20px; overflow:hidden; }
        .cal-header { display:flex; align-items:center; justify-content:space-between; padding:18px 20px; background:#1e293b; color:#fff; }
        .cal-month-label { font-size:1.05rem; font-weight:800; letter-spacing:.5px; }
        .cal-nav-btn { width:34px; height:34px; display:flex; align-items:center; justify-content:center; border-radius:10px; font-size:1.4rem; font-weight:700; color:#94a3b8; background:rgba(255,255,255,.08); border:none; cursor:pointer; transition:.15s; }
        .cal-nav-btn:hover { background:rgba(255,255,255,.18); color:#fff; }
        .cal-hint { text-align:center; padding:8px; font-size:0.7rem; font-weight:700; color:#94a3b8; background:#f8fafc; border-bottom:1px solid #f1f5f9; letter-spacing:.3px; }
        .cal-grid { display:grid; grid-template-columns:repeat(7,1fr); }
        .cal-weekday { padding:12px 0; text-align:center; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; background:#f8fafc; border-bottom:1px solid #f1f5f9; }
        .cal-cell { position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:52px; border-bottom:1px solid #f8fafc; border-right:1px solid #f8fafc; transition:.15s; }
        .cal-cell:nth-child(7n) { border-right:none; }
        .cal-clickable { cursor:pointer; }
        .cal-clickable:hover { background:#f1f5f9; }
        .cal-has-record.cal-clickable:hover { background:#f0fdf4; }
        .cal-day-num { font-size:14px; font-weight:700; color:#334155; }
        .cal-today { background:#eff6ff; }
        .cal-today .cal-day-num { background:#3b82f6; color:#fff; width:30px; height:30px; display:flex; align-items:center; justify-content:center; border-radius:50%; font-size:13px; }
        .cal-dot { width:6px; height:6px; border-radius:50%; margin-top:4px; }
        .cal-dot-green { background:#22c55e; }
        .cal-dot-red { background:#ef4444; }

        /* Section header */
        .att-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.5rem; gap:12px; flex-wrap:wrap; }

        /* Status info box */
        .attendance-info { margin-bottom:1.5rem; padding:1rem; background:var(--background); border-radius:var(--radius-lg); border:1px solid var(--border); }

        /* Mobile adjustments */
        @media (max-width: 480px) {
          .att-header { flex-direction:column; align-items:flex-start; }
          .att-header .flex { width:100%; }
          .att-header .btn { flex:1; justify-content:center; }
          .attendance-container { max-width:100%; overflow-x:hidden; }
          .cal-mobile { max-width:100%; }
          .cal-grid { overflow:hidden; }
          .cal-cell { min-height:38px; }
          .cal-weekday { padding:8px 0; font-size:9px; letter-spacing:0; }
          .cal-day-num { font-size:11px; }
          .cal-today .cal-day-num { width:24px; height:24px; font-size:11px; }
          .table td, .table th { padding:10px 12px; }
        }
        @media (max-width: 360px) {
          .cal-cell { min-height:34px; }
          .cal-day-num { font-size:10px; }
        }
      `}</style>
    </div>
  );
}
