"use client";

import { Users, Clock, LogIn, LogOut, FileText, X, User, CalendarCheck, TrendingUp, BarChart2, DollarSign } from 'lucide-react';
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
  const colors = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];
  const color = colors[name.charCodeAt(0) % colors.length];
  if (photo) return <img src={photo} alt={name} style={{ width: size, height: size, borderRadius: 12, objectFit: 'cover' }} />;
  return (
    <div style={{
      width: size, height: size, borderRadius: 12,
      background: color + '22', color, border: `1.5px solid ${color}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 900, fontSize: size * 0.35,
    }}>{initials}</div>
  );
}

function EmployeeModal({
  title, employees, color, onClose
}: {
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ borderBottom: `3px solid ${palette.border}` }}>
          <h2 className="modal-title">{title}</h2>
          <button onClick={onClose} className="modal-close-btn"><X size={18} /></button>
        </div>

        {employees.length === 0 ? (
          <div className="empty-state" style={{ padding: '3rem 1rem' }}>
            <User size={40} strokeWidth={1} />
            <p>{t('no_employees')}</p>
          </div>
        ) : (
          <div className="modal-list">
            {employees.map(emp => (
              <Link key={emp.id} href={`/dashboard/employees/${emp.id}`} className="modal-emp-row" onClick={onClose}>
                <Avatar name={emp.fullName} photo={emp.profilePhoto} size={44} />
                <div className="modal-emp-info">
                  <p className="modal-emp-name">{emp.fullName}</p>
                  {emp.jobTitle && <p className="modal-emp-role">{emp.jobTitle}</p>}
                </div>
                <span className="modal-badge" style={{ background: palette.bg, color: palette.text }}>
                  {palette.label}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.45);
          backdrop-filter: blur(6px); z-index: 1000;
          display: flex; align-items: center; justify-content: center; padding: 1rem;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal-box {
          background: var(--surface); border-radius: 20px;
          width: 100%; max-width: 480px; max-height: 80vh;
          display: flex; flex-direction: column;
          box-shadow: 0 25px 60px rgba(0,0,0,0.18);
          animation: slideUp 0.25s ease; border: 1px solid var(--border);
        }
        @keyframes slideUp { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 20px; flex-shrink: 0;
        }
        .modal-title { font-size: 1rem; font-weight: 800; color: var(--foreground); margin: 0; }
        .modal-close-btn {
          width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border);
          background: var(--background); color: var(--text-muted); cursor: pointer;
          display: flex; align-items: center; justify-content: center; transition: 0.15s;
        }
        .modal-close-btn:hover { background: var(--border); color: var(--foreground); }
        .modal-list { overflow-y: auto; padding: 10px; flex: 1; }
        .modal-emp-row {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; border-radius: 12px; transition: 0.15s;
          text-decoration: none; color: inherit; border: 1px solid transparent;
        }
        .modal-emp-row:hover { background: var(--background); border-color: var(--border); }
        .modal-emp-info { flex: 1; }
        .modal-emp-name { font-size: 0.875rem; font-weight: 700; color: var(--foreground); margin: 0 0 2px; }
        .modal-emp-role { font-size: 0.75rem; font-weight: 500; color: var(--text-muted); margin: 0; }
        .modal-badge {
          font-size: 0.7rem; font-weight: 700; padding: 3px 8px;
          border-radius: 6px; white-space: nowrap;
        }
      `}</style>
    </div>
  );
}

function StatCard({
  icon, label, value, color, onClick, sublabel
}: {
  icon: React.ReactNode; label: string; value: string | number;
  color: string; onClick?: () => void; sublabel?: string;
}) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag className="stat-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="stat-icon" style={{ background: color + '18', color }}>
        {icon}
      </div>
      <div className="stat-body">
        <p className="stat-label">{label}</p>
        <h2 className="stat-value">{value}</h2>
        {sublabel && <p className="stat-sublabel">{sublabel}</p>}
      </div>
      {onClick && <div className="stat-arrow">›</div>}

      <style jsx>{`
        .stat-card {
          display: flex; align-items: center; gap: 1rem;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-xl); padding: 1.25rem 1.5rem;
          box-shadow: var(--shadow-sm); transition: all 0.2s ease;
          text-align: start; width: 100; position: relative;
        }
        .stat-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); border-color: ${color}44; }
        .stat-icon {
          width: 48px; height: 48px; border-radius: 14px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .stat-body { flex: 1; min-width: 0; }
        .stat-label { font-size: 0.8rem; color: var(--text-muted); font-weight: 500; margin: 0 0 4px; }
        .stat-value { font-size: 1.75rem; font-weight: 800; color: var(--foreground); line-height: 1; margin: 0; }
        .stat-sublabel { font-size: 0.72rem; color: var(--text-muted); margin: 4px 0 0; }
        .stat-arrow { font-size: 1.5rem; color: var(--text-muted); opacity: 0.4; font-weight: 300; }
      `}</style>
    </Tag>
  );
}

function QuickLink({ href, icon, label, color }: { href: string; icon: React.ReactNode; label: string; color: string }) {
  return (
    <Link href={href} className="quick-link">
      <div className="ql-icon" style={{ background: color + '18', color }}>{icon}</div>
      <span className="ql-label">{label}</span>
      <style jsx>{`
        .quick-link {
          display: flex; align-items: center; gap: 0.875rem;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-xl); padding: 1rem 1.25rem;
          text-decoration: none; color: var(--foreground); font-weight: 600;
          font-size: 0.875rem; transition: all 0.2s;
          box-shadow: var(--shadow-sm);
        }
        .quick-link:hover { border-color: ${color}66; background: ${color}08; box-shadow: var(--shadow-md); transform: translateY(-1px); }
        .ql-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ql-label { flex: 1; }
      `}</style>
    </Link>
  );
}

export default function DashboardClient({ data, session }: { data: any; session: any }) {
  const { t } = useLanguage();
  const [modal, setModal] = useState<'present' | 'absent' | 'active' | 'leave' | null>(null);

  /* ───── Employee View ───── */
  if (session.user.role === 'EMPLOYEE') {
    const statusColor = data.todayStatus === 'WORKING' ? '#10b981' : data.todayStatus === 'COMPLETED' ? '#3b82f6' : '#94a3b8';
    const statusLabel = data.todayStatus === 'WORKING' ? t('currently_working') : data.todayStatus === 'COMPLETED' ? t('check_out') : t('not_checked_in');

    return (
      <div className="dashboard">
        <div className="dash-greeting">
          <div>
            <h1 className="dash-title">{t('welcome')}, <span>{session?.user?.name}</span> 👋</h1>
            <p className="dash-subtitle">{t('today_snapshot')}</p>
          </div>
        </div>

        <div className="stats-grid">
          <StatCard icon={<Clock size={22} />} label={t('hours_this_month')} value={`${(data.totalHoursMonth || 0).toFixed(1)}`} sublabel={t('hours_unit')} color="#3b82f6" />
          <StatCard icon={<CalendarCheck size={22} />} label={t('attendance')} value={data.daysWorkedMonth || 0} sublabel={t('days')} color="#10b981" />
          <StatCard icon={<TrendingUp size={22} />} label={t('status')} value={statusLabel} color={statusColor} />
        </div>

        <div className="section-header"><h2>{t('quick_access')}</h2></div>
        <div className="quick-grid">
          <QuickLink href={`/dashboard/employees/${data.profileId}`} icon={<User size={18} />} label={t('personal_info')} color="#3b82f6" />
          <QuickLink href={`/dashboard/employees/${data.profileId}#attendance`} icon={<Clock size={18} />} label={t('attendance')} color="#10b981" />
          <QuickLink href={`/dashboard/employees/${data.profileId}#leaves`} icon={<CalendarCheck size={18} />} label={t('leaves')} color="#f59e0b" />
          <QuickLink href={`/dashboard/employees/${data.profileId}#medical`} icon={<FileText size={18} />} label={t('medical_reports')} color="#ef4444" />
        </div>

        <style jsx>{`
          .dash-greeting { margin-bottom: 2rem; }
          .dash-title { font-size: 1.6rem; font-weight: 800; color: var(--foreground); margin: 0 0 4px; }
          .dash-title span { color: var(--primary); }
          .dash-subtitle { font-size: 0.875rem; color: var(--text-muted); margin: 0; }
          .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
          .section-header { margin: 0 0 1rem; }
          .section-header h2 { font-size: 1rem; font-weight: 700; color: var(--foreground); }
          .quick-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.75rem; }
        `}</style>
      </div>
    );
  }

  /* ───── Admin View ───── */
  const totalHours = (data.totalHoursToday || 0).toFixed(1);

  return (
    <div className="dashboard">
      <div className="dash-greeting">
        <div>
          <h1 className="dash-title">{t('dashboard')}</h1>
          <p className="dash-subtitle">{t('today_snapshot')}</p>
        </div>
        <Link href="/dashboard/employees/new" className="btn btn-primary btn-sm">
          + {t('add_employee')}
        </Link>
      </div>

      <div className="stats-grid">
        <StatCard icon={<LogIn size={22} />}     label={t('present_today')}  value={data.presentToday ?? 0}        color="#10b981" onClick={() => setModal('present')} />
        <StatCard icon={<LogOut size={22} />}    label={t('absent_today')}   value={data.absentToday ?? 0}         color="#ef4444" onClick={() => setModal('absent')} />
        <StatCard icon={<Users size={22} />}     label={t('currently_in')}   value={data.currentlyCheckedIn ?? 0}  color="#3b82f6" onClick={() => setModal('active')} />
        <StatCard icon={<CalendarCheck size={22} />} label={t('on_leave_today')} value={data.onLeaveToday ?? 0}   color="#f59e0b" onClick={() => setModal('leave')} />
        <StatCard icon={<Clock size={22} />}     label={t('total_hours')}    value={totalHours}                    color="#8b5cf6" sublabel={t('hours_unit')} />
      </div>

      <div className="section-header"><h2>{t('quick_access')}</h2></div>
      <div className="quick-grid">
        <QuickLink href="/dashboard/employees"  icon={<Users size={18} />}     label={t('employees')}         color="#3b82f6" />
        <QuickLink href="/dashboard/leaves"     icon={<CalendarCheck size={18} />} label={t('leaves')}        color="#f59e0b" />
        <QuickLink href="/dashboard/payroll"    icon={<DollarSign size={18} />} label={t('payroll_management')} color="#10b981" />
        <QuickLink href="/dashboard/reports"    icon={<BarChart2 size={18} />}  label={t('reports')}          color="#8b5cf6" />
      </div>

      {/* Modals */}
      {modal === 'present' && <EmployeeModal title={`${t('present_today')} (${data.presentEmployees?.length ?? 0})`}           employees={data.presentEmployees ?? []}            color="green"  onClose={() => setModal(null)} />}
      {modal === 'absent'  && <EmployeeModal title={`${t('absent_today')} (${data.absentEmployees?.length ?? 0})`}             employees={data.absentEmployees ?? []}             color="red"    onClose={() => setModal(null)} />}
      {modal === 'active'  && <EmployeeModal title={`${t('currently_in')} (${data.currentlyCheckedInEmployees?.length ?? 0})`} employees={data.currentlyCheckedInEmployees ?? []} color="blue"   onClose={() => setModal(null)} />}
      {modal === 'leave'   && <EmployeeModal title={`${t('on_leave_today')} (${data.onLeaveEmployees?.length ?? 0})`}          employees={data.onLeaveEmployees ?? []}            color="orange" onClose={() => setModal(null)} />}

      <style jsx>{`
        .dashboard { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .dash-greeting {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 1rem; margin-bottom: 1.75rem;
        }
        .dash-title { font-size: 1.6rem; font-weight: 800; color: var(--foreground); margin: 0 0 4px; }
        .dash-subtitle { font-size: 0.875rem; color: var(--text-muted); margin: 0; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .section-header { margin: 0 0 0.875rem; }
        .section-header h2 { font-size: 1rem; font-weight: 700; color: var(--foreground); }
        .quick-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.75rem; }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .quick-grid { grid-template-columns: 1fr 1fr; }
          .dash-title { font-size: 1.3rem; }
        }
      `}</style>
    </div>
  );
}
