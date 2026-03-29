"use client";

import { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, CheckCircle, MapPin, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';

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
  const viewDate = externalViewDate || internalViewDate;

  useEffect(() => {
    fetchAttendance();
  }, [profileId, viewDate]);

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

  const getLocation = (): Promise<{lat: number, lng: number} | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        alert(t('location_not_supported') || 'Geolocation is not supported by your browser');
        resolve(null);
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({ lat: position.coords.latitude, lng: position.coords.longitude });
          },
          (error) => {
            console.error(error);
            alert(t('location_required') || 'Please allow location access to verify your check-in/out');
            resolve(null);
          },
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loc ? { lat: loc.lat, lng: loc.lng } : {})
      });
      if (res.ok) {
        await fetchAttendance();
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckOut() {
    setLoading(true);
    const loc = await getLocation();
    try {
      const res = await fetch(`/api/employees/${profileId}/attendance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loc ? { lat: loc.lat, lng: loc.lng } : {})
      });
      if (res.ok) {
        await fetchAttendance();
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  if (compact) {
    return (
      <div className="flex gap-2">
        {!activeAttendance ? (
          <button onClick={handleCheckIn} disabled={loading || isReadOnly} className="btn btn-primary">
            <LogIn size={18} />
            <span>{t('check_in')}</span>
          </button>
        ) : (
          <button onClick={handleCheckOut} disabled={loading || isReadOnly} className="btn btn-danger">
            <LogOut size={18} />
            <span>{t('check_out')}</span>
          </button>
        )}
      </div>
    );
  }

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = new Intl.DateTimeFormat(t('lang') === 'ar' ? 'ar' : 'en', { month: 'long', year: 'numeric' }).format(viewDate);

  return (
    <div className="attendance-container">
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-title-custom m-0">
          <Clock size={22} className="text-primary" />
          {t('attendance_system')}
        </h2>
        <div className="flex gap-2">
           {!activeAttendance ? (
             <button onClick={handleCheckIn} disabled={loading || isReadOnly} className="btn btn-primary">
               <LogIn size={18} />
               <span>{t('check_in')}</span>
             </button>
           ) : (
             <button onClick={handleCheckOut} disabled={loading || isReadOnly} className="btn btn-danger">
               <LogOut size={18} />
               <span>{t('check_out')}</span>
             </button>
           )}
        </div>
      </div>

      <div className="attendance-info mb-6 p-4 bg-background rounded-lg border border-border">
        {activeAttendance ? (
          <div className="flex items-center gap-4">
            <div className="status-indicator pulses"></div>
            <div>
              <p className="font-semibold text-primary">{t('currently_working')}</p>
              <p className="text-sm text-muted">{t('checked_in_at')} {new Date(activeAttendance.checkInTime).toLocaleTimeString()}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="status-indicator"></div>
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
              <tr>
                <td colSpan={5} className="text-center py-10 text-muted">{t('no_records')}</td>
              </tr>
            ) : (
              history.map((record) => (
                <tr key={record.id}>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>{new Date(record.checkInTime).toLocaleTimeString()}</td>
                  <td>{record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '---'}</td>
                  <td>
                    <div className="flex items-center justify-center gap-3">
                      {record.checkInLat && (
                        <a href={`https://maps.google.com/?q=${record.checkInLat},${record.checkInLng}`} target="_blank" className="flex flex-col items-center justify-center px-3 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors shadow-sm" title="Sign In">
                          <MapPin size={18} />
                          <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Sign In</span>
                        </a>
                      )}
                      {record.checkOutLat && (
                        <a href={`https://maps.google.com/?q=${record.checkOutLat},${record.checkOutLng}`} target="_blank" className="flex flex-col items-center justify-center px-3 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm" title="Sign Out">
                          <MapPin size={18} />
                          <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Sign Out</span>
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

      {/* MOBILE-STYLE CALENDAR */}
      <div className="cal-mobile mt-8">
        <div className="cal-header">
          <button onClick={() => changeMonth(-1)} className="cal-nav-btn">&lsaquo;</button>
          <span className="cal-month-label">{monthName}</span>
          <button onClick={() => changeMonth(1)} className="cal-nav-btn">&rsaquo;</button>
        </div>
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
            const today = new Date();
            today.setHours(0,0,0,0);
            const hireDate = hiringDate ? new Date(hiringDate) : null;
            if (hireDate) hireDate.setHours(0,0,0,0);
            const isPast = cellDate < today;
            const isAfterHiring = hireDate ? cellDate >= hireDate : false;
            const showRedDot = !hasRecord && isPast && isAfterHiring;
            return (
              <div key={d} className={`cal-cell${isToday ? ' cal-today' : ''}`}>
                <span className="cal-day-num">{d}</span>
                {hasRecord && <span className="cal-dot cal-dot-green" />}
                {showRedDot && <span className="cal-dot cal-dot-red" />}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .table { width: 100%; border-collapse: separate; border-spacing: 0 8px; }
        .table th { padding: 12px 16px; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; border: none; text-align: start; }
        .table td { padding: 16px; font-size: 0.85rem; font-weight: 600; color: #1e293b; background: #f8fafc; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; }
        .table td:first-child { border-left: 1px solid #f1f5f9; border-top-left-radius: 12px; border-bottom-left-radius: 12px; }
        .table td:last-child { border-right: 1px solid #f1f5f9; border-top-right-radius: 12px; border-bottom-right-radius: 12px; }
        .status-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #cbd5e1;
        }
        .status-indicator.pulses {
          background: #22c55e;
          box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }

        /* ── Mobile Calendar ── */
        .cal-mobile {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          overflow: hidden;
        }
        .cal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px;
          background: #1e293b;
          color: #fff;
        }
        .cal-month-label {
          font-size: 1.05rem;
          font-weight: 800;
          letter-spacing: 0.5px;
        }
        .cal-nav-btn {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          font-size: 1.4rem;
          font-weight: 700;
          color: #94a3b8;
          background: rgba(255,255,255,0.08);
          border: none;
          cursor: pointer;
          transition: background 0.15s;
        }
        .cal-nav-btn:hover { background: rgba(255,255,255,0.18); color: #fff; }
        .cal-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
        }
        .cal-weekday {
          padding: 12px 0;
          text-align: center;
          font-size: 11px;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 1px;
          background: #f8fafc;
          border-bottom: 1px solid #f1f5f9;
        }
        .cal-cell {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 52px;
          border-bottom: 1px solid #f8fafc;
          border-right: 1px solid #f8fafc;
        }
        .cal-cell:nth-child(7n) { border-right: none; }
        .cal-day-num {
          font-size: 14px;
          font-weight: 700;
          color: #334155;
        }
        .cal-today {
          background: #eff6ff;
        }
        .cal-today .cal-day-num {
          background: #3b82f6;
          color: #fff;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 13px;
        }
        .cal-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          margin-top: 4px;
        }
        .cal-dot-green {
          background: #22c55e;
        }
        .cal-dot-red {
          background: #ef4444;
        }
      `}</style>
    </div>
  );
}
