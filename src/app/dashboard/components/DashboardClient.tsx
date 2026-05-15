"use client";

import { Users, Clock, LogIn, LogOut, FileText, X, User, CalendarCheck, TrendingUp, BarChart2, DollarSign, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

type EmployeeSummary = {
  id: string;
  fullName: string;
  jobTitle?: string;
  profilePhoto?: string | null;
};

function Avatar({ name, photo, size = 44 }: { name: string; photo?: string | null; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  const color = colors[name.charCodeAt(0) % colors.length];
  if (photo) return <img src={photo} alt={name} style={{ width: size, height: size, borderRadius: 10, objectFit: 'cover' }} />;
  return (
    <div style={{
      width: size, height: size, borderRadius: 10,
      background: color + '20', color, border: `1.5px solid ${color}40`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 900, fontSize: size * 0.35, flexShrink: 0,
    }}>{initials}</div>
  );
}

function EmployeeModal({ title, employees, color, onClose }: {
  title: string; employees: EmployeeSummary[]; color: 'green' | 'red' | 'blue' | 'orange'; onClose: () => void;
}) {
  const { t } = useLanguage();
  const palette = {
    green:  { border: '#22c55e', bg: '#dcfce7', text: '#16a34a', label: t('present') },
    red:    { border: '#ef4444', bg: '#fee2e2', text: '#b91c1c', label: t('absent_today') },
    blue:   { border: '#3b82f6', bg: '#dbeafe', text: '#1d4ed8', label: t('currently_in') },
    orange: { border: '#f59e0b', bg: '#fef3c7', text: '#b45309', label: t('on_leave_today') },
  }[color];

  return (
    <div className="emp-modal-overlay" onClick={onClose}>
      <div className="emp-modal-box" onClick={e => e.stopPropagation()}>
        <div className="emp-modal-header" style={{ borderBottom: `3px solid ${palette.border}` }}>
          <h2 className="emp-modal-title">{title}</h2>
          <button onClick={onClose} className="emp-modal-close"><X size={16} /></button>
        </div>
        {employees.length === 0 ? (
          <div className="empty-state" style={{ padding: '3rem 1rem' }}>
            <User size={40} strokeWidth={1} />
            <p>{t('no_employees')}</p>
          </div>
        ) : (
          <div className="emp-modal-list">
            {employees.map(emp => (
              <Link key={emp.id} href={`/dashboard/employees/${emp.id}`} className="emp-modal-row" onClick={onClose}>
                <Avatar name={emp.fullName} photo={emp.profilePhoto} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{emp.fullName}</p>
                  {emp.jobTitle && <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>{emp.jobTitle}</p>}
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: palette.bg, color: palette.text, whiteSpace: 'nowrap' }}>
                  {palette.label}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .emp-modal-overlay {
          position: fixed; inset: 0; background: rgba(15,23,42,0.6);
          backdrop-filter: blur(8px); z-index: 1000;
          display: flex; align-items: center; justify-content: center; padding: 1rem;
          animation: mfadeIn 0.2s ease;
        }
        @keyframes mfadeIn { from { opacity: 0; } to { opacity: 1; } }
        .emp-modal-box {
          background: #fff; border-radius: 20px;
          width: 100%; max-width: 460px; max-height: 78vh;
          display: flex; flex-direction: column;
          box-shadow: 0 32px 80px rgba(0,0,0,0.2);
          animation: mslideUp 0.25s ease;
        }
        @keyframes mslideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .emp-modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px; flex-shrink: 0;
        }
        .emp-modal-title { font-size: 0.95rem; font-weight: 800; color: #0f172a; margin: 0; }
        .emp-modal-close {
          width: 28px; height: 28px; border-radius: 7px; border: 1px solid #e2e8f0;
          background: #f8fafc; color: #94a3b8; cursor: pointer;
          display: flex; align-items: center; justify-content: center; transition: 0.15s;
        }
        .emp-modal-close:hover { background: #f1f5f9; color: #475569; }
        .emp-modal-list { overflow-y: auto; padding: 8px; flex: 1; }
        .emp-modal-row {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 12px; transition: 0.15s;
          text-decoration: none; color: inherit; border: 1px solid transparent;
        }
        .emp-modal-row:hover { background: #f8fafc; border-color: #e2e8f0; }
      `}</style>
    </div>
  );
}

/* ─────── KPI Card ─────── */
function KpiCard({ icon, label, value, sublabel, color, accent, onClick }: {
  icon: React.ReactNode; label: string; value: string | number;
  sublabel?: string; color: string; accent: string; onClick?: () => void;
}) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag className="kpi-card" onClick={onClick} style={{ '--accent': accent, '--color': color } as React.CSSProperties}>
      <div className="kpi-top">
        <div className="kpi-icon" style={{ background: color + '18', color }}>{icon}</div>
        {onClick && <ArrowUpRight size={15} className="kpi-arrow" />}
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
      {sublabel && <div className="kpi-sublabel">{sublabel}</div>}

      <style jsx>{`
        .kpi-card {
          background: #fff;
          border: 1px solid #f1f5f9;
          border-radius: 18px;
          padding: 1.25rem 1.375rem;
          display: flex; flex-direction: column; gap: 0.5rem;
          cursor: ${onClick ? 'pointer' : 'default'};
          transition: all 0.2s ease;
          text-align: start;
          width: 100%;
          position: relative;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .kpi-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: ${color};
          border-radius: 18px 18px 0 0;
        }
        .kpi-card:hover {
          border-color: ${color}33;
          box-shadow: 0 8px 24px ${color}18;
          transform: translateY(-2px);
        }
        .kpi-top {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 0.25rem;
        }
        .kpi-icon {
          width: 42px; height: 42px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .kpi-arrow {
          color: #cbd5e1;
          transition: 0.15s;
        }
        .kpi-card:hover .kpi-arrow { color: ${color}; }
        .kpi-value {
          font-size: 2rem; font-weight: 900; color: #0f172a;
          line-height: 1; letter-spacing: -0.03em;
        }
        .kpi-label { font-size: 0.8rem; color: #94a3b8; font-weight: 500; }
        .kpi-sublabel { font-size: 0.72rem; color: #cbd5e1; font-weight: 400; }
      `}</style>
    </Tag>
  );
}

/* ─────── Quick Link Card ─────── */
function QuickCard({ href, icon, label, desc, color }: {
  href: string; icon: React.ReactNode; label: string; desc?: string; color: string;
}) {
  return (
    <Link href={href} className="quick-card">
      <div className="qc-icon" style={{ background: color + '15', color }}>{icon}</div>
      <div className="qc-body">
        <span className="qc-label">{label}</span>
        {desc && <span className="qc-desc">{desc}</span>}
      </div>
      <ArrowUpRight size={15} className="qc-arrow" style={{ color: '#cbd5e1' }} />

      <style jsx>{`
        .quick-card {
          display: flex; align-items: center; gap: 0.875rem;
          background: #fff; border: 1px solid #f1f5f9;
          border-radius: 14px; padding: 1rem 1.125rem;
          text-decoration: none; color: #1e293b;
          transition: all 0.2s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .quick-card:hover {
          border-color: ${color}33;
          box-shadow: 0 6px 20px ${color}12;
          transform: translateY(-1px);
        }
        .quick-card:hover .qc-arrow { color: ${color} !important; }
        .qc-icon {
          width: 40px; height: 40px; border-radius: 11px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .qc-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
        .qc-label { font-size: 0.875rem; font-weight: 700; color: #1e293b; }
        .qc-desc { font-size: 0.73rem; color: #94a3b8; font-weight: 400; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .qc-arrow { flex-shrink: 0; transition: 0.15s; }
      `}</style>
    </Link>
  );
}

/* ─────── Greeting Banner ─────── */
function GreetingBanner({ name, isAdmin, addLink, addLabel }: {
  name: string; isAdmin: boolean; addLink?: string; addLabel?: string;
}) {
  const { t } = useLanguage();
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? t('good_morning') : hour < 18 ? t('good_afternoon') : t('good_evening');
  const dateStr = now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="greeting-banner">
      <div className="greeting-text">
        <h1 className="greeting-title">{greeting || 'مرحباً'}، <span>{name}</span> 👋</h1>
        <p className="greeting-date">{dateStr}</p>
      </div>
      {isAdmin && addLink && (
        <Link href={addLink} className="greeting-btn">
          <span>+</span>
          <span>{addLabel}</span>
        </Link>
      )}

      <style jsx>{`
        .greeting-banner {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
          border-radius: 20px;
          padding: 1.5rem 1.75rem;
          display: flex; align-items: center; justify-content: space-between;
          gap: 1rem; margin-bottom: 1.75rem; flex-wrap: wrap;
          box-shadow: 0 8px 32px rgba(15,23,42,0.15);
        }
        .greeting-text { display: flex; flex-direction: column; gap: 4px; }
        .greeting-title { font-size: 1.4rem; font-weight: 800; color: #f8fafc; margin: 0; line-height: 1.3; }
        .greeting-title span { color: #60a5fa; }
        .greeting-date { font-size: 0.8rem; color: #64748b; margin: 0; }
        .greeting-btn {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: #3b82f6; color: #fff;
          padding: 0.6rem 1.25rem; border-radius: 12px;
          font-weight: 700; font-size: 0.875rem;
          text-decoration: none; transition: 0.2s;
          box-shadow: 0 4px 12px rgba(59,130,246,0.4);
          white-space: nowrap;
        }
        .greeting-btn:hover { background: #2563eb; transform: translateY(-1px); }
      `}</style>
    </div>
  );
}

/* ─────── Section Header ─────── */
function SectionTitle({ label }: { label: string }) {
  return (
    <div className="sec-title">
      <span>{label}</span>
      <style jsx>{`
        .sec-title {
          font-size: 0.8rem; font-weight: 700;
          color: #94a3b8; text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 0.875rem;
          display: flex; align-items: center; gap: 0.5rem;
        }
        .sec-title::after {
          content: ''; flex: 1; height: 1px; background: #f1f5f9;
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
export default function DashboardClient({ data, session }: { data: any; session: any }) {
  const { t } = useLanguage();
  const [modal, setModal] = useState<'present' | 'absent' | 'active' | 'leave' | null>(null);

  /* ── Employee View ── */
  if (session.user.role === 'EMPLOYEE') {
    const statusColor = data.todayStatus === 'WORKING' ? '#10b981' : data.todayStatus === 'COMPLETED' ? '#3b82f6' : '#94a3b8';
    const statusLabel = data.todayStatus === 'WORKING' ? t('currently_working') : data.todayStatus === 'COMPLETED' ? t('check_out') : t('not_checked_in');

    return (
      <div className="db-wrap">
        <GreetingBanner name={session.user.name} isAdmin={false} />

        <SectionTitle label={t('today_snapshot')} />
        <div className="emp-stats-grid">
          <KpiCard icon={<Clock size={20} />} label={t('hours_this_month')} value={(data.totalHoursMonth || 0).toFixed(1)} sublabel={t('hours_unit')} color="#3b82f6" accent="#eff6ff" />
          <KpiCard icon={<CalendarCheck size={20} />} label={t('attendance')} value={data.daysWorkedMonth || 0} sublabel={t('days')} color="#10b981" accent="#f0fdf4" />
          <KpiCard icon={<TrendingUp size={20} />} label={t('status')} value={statusLabel} color={statusColor} accent="#f8fafc" />
        </div>

        <SectionTitle label={t('quick_access')} />
        <div className="quick-grid">
          <QuickCard href={`/dashboard/employees/${data.profileId}`} icon={<User size={18} />} label={t('personal_info')} desc={t('view_profile')} color="#3b82f6" />
          <QuickCard href={`/dashboard/employees/${data.profileId}#attendance`} icon={<Clock size={18} />} label={t('attendance')} color="#10b981" />
          <QuickCard href={`/dashboard/employees/${data.profileId}#leaves`} icon={<CalendarCheck size={18} />} label={t('leaves')} color="#f59e0b" />
          <QuickCard href={`/dashboard/employees/${data.profileId}#medical`} icon={<FileText size={18} />} label={t('medical_reports')} color="#ef4444" />
        </div>

        <style jsx>{`
          .db-wrap { animation: dbFade 0.35s ease-out; }
          @keyframes dbFade { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
          .emp-stats-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-bottom:1.75rem; }
          .quick-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:0.75rem; }
          @media (max-width:700px) {
            .emp-stats-grid { grid-template-columns:1fr 1fr; }
            .quick-grid { grid-template-columns:1fr 1fr; }
          }
          @media (max-width:440px) {
            .emp-stats-grid { grid-template-columns:1fr; }
          }
        `}</style>
      </div>
    );
  }

  /* ── Admin View ── */
  const totalHours = (data.totalHoursToday || 0).toFixed(1);

  return (
    <div className="db-wrap">
      <GreetingBanner
        name={session.user.name}
        isAdmin
        addLink="/dashboard/employees/new"
        addLabel={t('add_employee')}
      />

      <SectionTitle label={t('today_snapshot')} />
      <div className="admin-stats-grid">
        <KpiCard icon={<LogIn size={20} />}        label={t('present_today')}  value={data.presentToday ?? 0}       color="#10b981" accent="#f0fdf4" onClick={() => setModal('present')} />
        <KpiCard icon={<LogOut size={20} />}       label={t('absent_today')}   value={data.absentToday ?? 0}        color="#ef4444" accent="#fef2f2" onClick={() => setModal('absent')} />
        <KpiCard icon={<Users size={20} />}        label={t('currently_in')}   value={data.currentlyCheckedIn ?? 0} color="#3b82f6" accent="#eff6ff" onClick={() => setModal('active')} />
        <KpiCard icon={<CalendarCheck size={20} />} label={t('on_leave_today')} value={data.onLeaveToday ?? 0}      color="#f59e0b" accent="#fffbeb" onClick={() => setModal('leave')} />
        <KpiCard icon={<Clock size={20} />}        label={t('total_hours')}    value={totalHours}                   color="#8b5cf6" accent="#f5f3ff" sublabel={t('hours_unit')} />
      </div>

      <SectionTitle label={t('quick_access')} />
      <div className="admin-quick-grid">
        <QuickCard href="/dashboard/employees"  icon={<Users size={18} />}        label={t('employees')}          desc={t('employee_list')}       color="#3b82f6" />
        <QuickCard href="/dashboard/leaves"     icon={<CalendarCheck size={18} />} label={t('leaves')}            desc={t('leave_management')}    color="#f59e0b" />
        <QuickCard href="/dashboard/payroll"    icon={<DollarSign size={18} />}   label={t('payroll_management')} desc={t('payroll_management')}  color="#10b981" />
        <QuickCard href="/dashboard/reports"    icon={<BarChart2 size={18} />}    label={t('reports')}            desc={t('reports')}             color="#8b5cf6" />
      </div>

      {/* Modals */}
      {modal === 'present' && <EmployeeModal title={`${t('present_today')} (${data.presentEmployees?.length ?? 0})`}           employees={data.presentEmployees ?? []}            color="green"  onClose={() => setModal(null)} />}
      {modal === 'absent'  && <EmployeeModal title={`${t('absent_today')} (${data.absentEmployees?.length ?? 0})`}             employees={data.absentEmployees ?? []}             color="red"    onClose={() => setModal(null)} />}
      {modal === 'active'  && <EmployeeModal title={`${t('currently_in')} (${data.currentlyCheckedInEmployees?.length ?? 0})`} employees={data.currentlyCheckedInEmployees ?? []} color="blue"   onClose={() => setModal(null)} />}
      {modal === 'leave'   && <EmployeeModal title={`${t('on_leave_today')} (${data.onLeaveEmployees?.length ?? 0})`}          employees={data.onLeaveEmployees ?? []}            color="orange" onClose={() => setModal(null)} />}

      <style jsx>{`
        .db-wrap { animation: dbFade 0.35s ease-out; }
        @keyframes dbFade { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .admin-stats-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.875rem;
          margin-bottom: 1.75rem;
        }
        .admin-quick-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
        }
        @media (max-width: 1100px) {
          .admin-stats-grid { grid-template-columns: repeat(3, 1fr); }
          .admin-quick-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 700px) {
          .admin-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .admin-quick-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}
