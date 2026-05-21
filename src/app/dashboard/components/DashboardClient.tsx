"use client";

import { Users, Clock, LogIn, LogOut, FileText, X, User, CalendarCheck, Bell, Send, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

type EmployeeSummary = {
  id: string;
  fullName: string;
  jobTitle?: string;
  profilePhoto?: string | null;
};

type NoticeType = { id: string; message: string } | null;

function EmployeeModal({ 
  title, 
  employees, 
  color,
  onClose 
}: { 
  title: string; 
  employees: EmployeeSummary[]; 
  color: 'green' | 'red' | 'blue' | 'orange';
  onClose: () => void; 
}) {
  const borderColor = color === 'green' ? '#22c55e' : color === 'red' ? '#ef4444' : color === 'orange' ? '#f59e0b' : '#3b82f6';
  const badgeBg    = color === 'green' ? '#dcfce7' : color === 'red' ? '#fee2e2' : color === 'orange' ? '#fef3c7' : '#dbeafe';
  const badgeText  = color === 'green' ? '#16a34a' : color === 'red' ? '#b91c1c' : color === 'orange' ? '#b45309' : '#1d4ed8';
  const badgeLabel = color === 'green' ? 'حاضر' : color === 'red' ? 'غائب' : color === 'orange' ? 'إجازة' : 'يعمل الآن';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ borderBottom: `3px solid ${borderColor}` }}>
          <h2 className="modal-title">{title}</h2>
          <button onClick={onClose} className="modal-close-btn"><X size={20} /></button>
        </div>

        {employees.length === 0 ? (
          <div className="modal-empty">
            <User size={40} strokeWidth={1} />
            <p>لا يوجد موظفون</p>
          </div>
        ) : (
          <div className="modal-list">
            {employees.map(emp => (
              <Link
                key={emp.id}
                href={`/dashboard/employees/${emp.id}`}
                className="modal-emp-row"
                onClick={onClose}
              >
                <div className="modal-avatar">
                  {emp.profilePhoto ? (
                    <img src={emp.profilePhoto} alt={emp.fullName} />
                  ) : (
                    <span>{emp.fullName.charAt(0)}</span>
                  )}
                </div>
                <div className="modal-emp-info">
                  <p className="modal-emp-name">{emp.fullName}</p>
                  {emp.jobTitle && <p className="modal-emp-role">{emp.jobTitle}</p>}
                </div>
                <span className="modal-badge" style={{ background: badgeBg, color: badgeText }}>
                  {badgeLabel}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.4);
          backdrop-filter: blur(4px);
          z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal-box {
          background: #fff; border-radius: 24px; width: 100%; max-width: 500px;
          max-height: 80vh; display: flex; flex-direction: column;
          box-shadow: 0 25px 60px rgba(0,0,0,0.2);
          animation: slideUp 0.25s ease;
        }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px; flex-shrink: 0;
        }
        .modal-title { font-size: 1.1rem; font-weight: 900; color: #1e293b; margin: 0; }
        .modal-close-btn {
          width: 36px; height: 36px; border-radius: 10px; border: none;
          background: #f1f5f9; color: #64748b; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: 0.2s;
        }
        .modal-close-btn:hover { background: #e2e8f0; color: #1e293b; }
        .modal-list { overflow-y: auto; padding: 12px; flex: 1; }
        .modal-empty {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 12px; padding: 50px 20px; color: #94a3b8;
          font-weight: 700; font-size: 0.9rem;
        }
        .modal-emp-row {
          display: flex; align-items: center; gap: 14px;
          padding: 12px 14px; border-radius: 16px;
          transition: 0.15s; text-decoration: none; color: inherit;
          border: 1px solid transparent;
        }
        .modal-emp-row:hover { background: #f8fafc; border-color: #e2e8f0; }
        .modal-avatar {
          width: 44px; height: 44px; border-radius: 14px;
          background: #f1f5f9; overflow: hidden; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem; font-weight: 800; color: #475569;
        }
        .modal-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .modal-emp-info { flex: 1; }
        .modal-emp-name { font-size: 0.9rem; font-weight: 800; color: #1e293b; margin: 0 0 2px; }
        .modal-emp-role { font-size: 0.75rem; font-weight: 600; color: #94a3b8; margin: 0; }
        .modal-badge {
          font-size: 0.7rem; font-weight: 900; padding: 4px 10px;
          border-radius: 8px; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap;
        }
      `}</style>
    </div>
  );
}

// ─── Notice Banner (shown to employees) ─────────────────────────────────────
function NoticeBanner({ message }: { message: string }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="notice-banner">
      <div className="notice-banner-icon">
        <Bell size={20} />
      </div>
      <p className="notice-banner-text">{message}</p>
      <button className="notice-banner-close" onClick={() => setVisible(false)} title="إغلاق">
        <X size={16} />
      </button>
      <style jsx>{`
        .notice-banner {
          display: flex; align-items: flex-start; gap: 12px;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 1.5px solid #f59e0b;
          border-radius: 18px; padding: 16px 18px; margin-bottom: 1.5rem;
          box-shadow: 0 4px 20px rgba(245,158,11,0.15);
          animation: noticePop 0.35s cubic-bezier(.34,1.56,.64,1);
          position: relative;
        }
        @keyframes noticePop { from { opacity:0; transform:scale(0.97) translateY(-6px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .notice-banner-icon {
          width: 38px; height: 38px; border-radius: 12px;
          background: rgba(245,158,11,0.2); color: #b45309;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .notice-banner-text {
          flex: 1; font-size: 0.95rem; font-weight: 700;
          color: #78350f; line-height: 1.5; margin: 0; padding-top: 5px;
          white-space: pre-wrap; word-break: break-word;
        }
        .notice-banner-close {
          background: rgba(245,158,11,0.2); border: none; border-radius: 8px;
          width: 28px; height: 28px; cursor: pointer; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          color: #b45309; transition: 0.15s; margin-top: 3px;
        }
        .notice-banner-close:hover { background: rgba(245,158,11,0.4); }
      `}</style>
    </div>
  );
}

// ─── Notice Editor (admin only) ──────────────────────────────────────────────
function NoticeEditor({ initialNotice }: { initialNotice: NoticeType }) {
  const [savedMessage, setSavedMessage] = useState(initialNotice?.message || '');
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  const flashStatus = (s: 'saved' | 'error') => {
    setStatus(s);
    setTimeout(() => setStatus('idle'), 2500);
  };

  const save = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: draft })
      });
      if (res.ok) {
        setSavedMessage(draft);
        setDraft('');
        flashStatus('saved');
      } else { flashStatus('error'); }
    } catch { flashStatus('error'); }
    finally { setSaving(false); }
  };

  const deleteNotice = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: '' })
      });
      if (res.ok) { setSavedMessage(''); flashStatus('saved'); }
      else { flashStatus('error'); }
    } catch { flashStatus('error'); }
    finally { setDeleting(false); }
  };

  return (
    <div className="notice-editor-card">
      {/* Header */}
      <div className="notice-editor-header">
        <div className="notice-editor-icon"><Bell size={20} /></div>
        <div>
          <h3 className="notice-editor-title">إشعار يومي</h3>
          <p className="notice-editor-sub">اكتب رسالة تظهر لجميع الموظفين</p>
        </div>
        {status === 'saved' && <span className="notice-status-badge saved">✓ تم الحفظ</span>}
        {status === 'error'  && <span className="notice-status-badge error">✗ خطأ</span>}
      </div>

      {/* Saved notice display — appears after saving */}
      {savedMessage && (
        <div className="notice-saved-display">
          <div className="notice-saved-icon"><Bell size={16} /></div>
          <p className="notice-saved-text">{savedMessage}</p>
          <button
            className="notice-delete-btn"
            onClick={deleteNotice}
            disabled={deleting}
            title="حذف الإشعار"
          >
            <Trash2 size={15} />
            {deleting ? 'جاري الحذف...' : 'حذف'}
          </button>
        </div>
      )}

      {/* Divider when there's a saved message */}
      {savedMessage && (
        <div className="notice-divider">
          <span>إضافة إشعار جديد</span>
        </div>
      )}

      {/* Write area */}
      <textarea
        className="notice-textarea"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        placeholder={savedMessage ? 'اكتب إشعاراً جديداً لاستبدال الحالي...' : 'اكتب هنا الإشعار أو التنبيه اليومي للموظفين...'}
        rows={3}
        maxLength={500}
        dir="rtl"
      />
      <div className="notice-editor-footer">
        <span className="notice-char-count">{draft.length}/500</span>
        <button className="notice-btn-save" onClick={save} disabled={saving || !draft.trim()}>
          <Send size={15} />
          {saving ? 'جاري الإرسال...' : 'نشر الإشعار'}
        </button>
      </div>

      <style jsx>{`
        .notice-editor-card {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 1.5px solid #e2e8f0; border-radius: 20px; padding: 20px;
          margin-bottom: 1.5rem; box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          transition: box-shadow 0.2s;
        }
        .notice-editor-card:focus-within {
          border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,0.12);
        }
        .notice-editor-header {
          display: flex; align-items: center; gap: 12px; margin-bottom: 14px;
        }
        .notice-editor-icon {
          width: 42px; height: 42px; border-radius: 13px;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: #fff; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; box-shadow: 0 3px 10px rgba(245,158,11,0.3);
        }
        .notice-editor-title { font-size: 1rem; font-weight: 800; color: #1e293b; margin: 0 0 2px; }
        .notice-editor-sub { font-size: 0.78rem; color: #94a3b8; margin: 0; font-weight: 500; }
        .notice-status-badge {
          margin-right: auto; font-size: 0.78rem; font-weight: 800;
          padding: 4px 12px; border-radius: 8px;
        }
        .notice-status-badge.saved { background: #dcfce7; color: #16a34a; }
        .notice-status-badge.error { background: #fee2e2; color: #b91c1c; }

        /* Saved notice display */
        .notice-saved-display {
          display: flex; align-items: flex-start; gap: 10px;
          background: linear-gradient(135deg, #fef9ec 0%, #fef3c7 100%);
          border: 1.5px solid #fcd34d; border-radius: 14px;
          padding: 14px 16px; margin-bottom: 12px;
          animation: noticePop 0.3s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes noticePop {
          from { opacity:0; transform:translateY(-8px) scale(0.97); }
          to   { opacity:1; transform:translateY(0)   scale(1); }
        }
        .notice-saved-icon {
          width: 32px; height: 32px; border-radius: 10px;
          background: rgba(245,158,11,0.2); color: #b45309;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .notice-saved-text {
          flex: 1; font-size: 0.9rem; font-weight: 700;
          color: #78350f; line-height: 1.5; margin: 0; padding-top: 4px;
          white-space: pre-wrap; word-break: break-word;
        }
        .notice-delete-btn {
          display: flex; align-items: center; gap: 5px;
          background: #fee2e2; color: #b91c1c; border: none;
          border-radius: 10px; padding: 7px 12px;
          font-size: 0.8rem; font-weight: 700; cursor: pointer;
          transition: 0.2s; flex-shrink: 0; white-space: nowrap;
        }
        .notice-delete-btn:hover:not(:disabled) { background: #fecaca; }
        .notice-delete-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Divider */
        .notice-divider {
          display: flex; align-items: center; gap: 10px;
          margin: 14px 0 12px; color: #94a3b8; font-size: 0.75rem; font-weight: 700;
        }
        .notice-divider::before, .notice-divider::after {
          content: ''; flex: 1; height: 1px; background: #e2e8f0;
        }

        /* Textarea */
        .notice-textarea {
          width: 100%; resize: vertical; min-height: 90px;
          border: 1.5px solid #e2e8f0; border-radius: 14px;
          padding: 12px 14px; font-size: 0.93rem; font-family: inherit;
          color: #1e293b; background: #fff; line-height: 1.6;
          box-sizing: border-box; outline: none; transition: border-color 0.2s;
        }
        .notice-textarea:focus { border-color: #f59e0b; }
        .notice-textarea::placeholder { color: #cbd5e1; }

        .notice-editor-footer {
          display: flex; align-items: center; justify-content: space-between; margin-top: 10px;
        }
        .notice-char-count { font-size: 0.75rem; color: #94a3b8; font-weight: 600; }
        .notice-btn-save {
          display: flex; align-items: center; gap: 6px;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: #fff; border: none; border-radius: 11px;
          padding: 9px 18px; font-size: 0.85rem; font-weight: 800;
          cursor: pointer; transition: 0.2s; box-shadow: 0 3px 10px rgba(245,158,11,0.3);
        }
        .notice-btn-save:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 5px 15px rgba(245,158,11,0.4); }
        .notice-btn-save:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
      `}</style>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DashboardClient({ 
  data, 
  session,
  activeNotice
}: { 
  data: any, 
  session: any,
  activeNotice: NoticeType
}) {
  const { t } = useLanguage();
  const [modal, setModal] = useState<'present' | 'absent' | 'active' | 'leave' | null>(null);

  const isAdmin = session.user.role === 'SUPERADMIN' || session.user.role === 'ADMIN';

  if (session.user.role === 'EMPLOYEE') {
    return (
      <div className="dashboard">
        <div className="dashboard-header mb-6">
          <h1 className="title">{t('welcome')}, {session?.user?.name}</h1>
          <p className="subtitle">{t('today_snapshot')}</p>
        </div>

        {/* Show active notice to employees */}
        {activeNotice && <NoticeBanner message={activeNotice.message} />}

        <div className="metrics-grid">
          <div className="metric-card card">
            <div className="metric-icon present">
              <Clock size={24} />
            </div>
            <div className="metric-content">
              <p className="metric-label">{t('hours_this_month')}</p>
              <h2 className="metric-value">{data.totalHoursMonth?.toFixed(1) || 0} <span className="text-sm">{t('hours_unit')}</span></h2>
            </div>
          </div>

          <div className="metric-card card">
            <div className="metric-icon active">
              <Users size={24} />
            </div>
            <div className="metric-content">
              <p className="metric-label">{t('status')}</p>
              <h2 className="metric-value" style={{ fontSize: '1.25rem' }}>
                {data.todayStatus === 'WORKING' ? t('currently_working') : 
                 data.todayStatus === 'COMPLETED' ? t('check_out') : t('not_checked_in')}
              </h2>
            </div>
          </div>
        </div>

        <div className="quick-actions grid grid-cols-2 lg-grid-cols-4 mt-8 gap-4">
          <h2 className="title col-span-full">{t('quick_access')}</h2>
          <Link href={`/dashboard/employees/${data.profileId}`} className="action-card card">
            <Users className="action-icon text-primary" />
            <div className="action-text">{t('view_profile')}</div>
          </Link>
          <Link href={`/dashboard/employees/${data.profileId}#attendance`} className="action-card card">
            <Clock className="action-icon text-success" />
            <div className="action-text">{t('attendance')}</div>
          </Link>
          <Link href={`/dashboard/employees/${data.profileId}#leaves`} className="action-card card">
            <FileText className="action-icon text-warning" />
            <div className="action-text">{t('leaves')}</div>
          </Link>
          <Link href={`/dashboard/employees/${data.profileId}#medical`} className="action-card card">
            <FileText className="action-icon text-danger" />
            <div className="action-text">{t('medical_reports')}</div>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header mb-6">
        <h1 className="title">{t('dashboard')}</h1>
        <p className="subtitle">{t('today_snapshot')}</p>
      </div>

      {/* Notice editor — admin only */}
      {isAdmin && <NoticeEditor initialNotice={activeNotice} />}

      <div className="metrics-grid">
        {/* Present Today — clickable */}
        <button
          className="metric-card card metric-btn"
          onClick={() => setModal('present')}
          title="اضغط لرؤية الحاضرين"
        >
          <div className="metric-icon present">
            <LogIn size={24} />
          </div>
          <div className="metric-content">
            <p className="metric-label">{t('present_today')}</p>
            <h2 className="metric-value">{data.presentToday}</h2>
          </div>

        </button>

        {/* Absent Today — clickable */}
        <button
          className="metric-card card metric-btn"
          onClick={() => setModal('absent')}
          title="اضغط لرؤية الغائبين"
        >
          <div className="metric-icon absent">
            <LogOut size={24} />
          </div>
          <div className="metric-content">
            <p className="metric-label">{t('absent_today')}</p>
            <h2 className="metric-value">{data.absentToday}</h2>
          </div>

        </button>

        <button
          className="metric-card card metric-btn"
          onClick={() => setModal('active')}
          title="اضغط لرؤية المسجلين حاليًا"
        >
          <div className="metric-icon active">
            <Users size={24} />
          </div>
          <div className="metric-content">
            <p className="metric-label">{t('currently_in')}</p>
            <h2 className="metric-value">{data.currentlyCheckedIn}</h2>
          </div>

        </button>

        {/* On Leave Today — clickable */}
        <button
          className="metric-card card metric-btn"
          onClick={() => setModal('leave')}
          title="اضغط لرؤية الموظفين في إجازة"
        >
          <div className="metric-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
            <CalendarCheck size={24} />
          </div>
          <div className="metric-content">
            <p className="metric-label">الإجازات اليوم</p>
            <h2 className="metric-value">{data.onLeaveToday ?? 0}</h2>
          </div>
        </button>
      </div>

      <div className="quick-actions grid grid-cols-2 lg-grid-cols-4 mt-8 gap-4">
        <h2 className="title col-span-full">{t('quick_access')}</h2>
        <Link href="/dashboard/employees" className="action-card card">
          <Users className="action-icon text-primary" />
          <div className="action-text">{t('employee_list')}</div>
        </Link>
      </div>

      {/* Modals */}
      {modal === 'present' && (
        <EmployeeModal
          title={`الحاضرون اليوم (${data.presentEmployees?.length ?? 0})`}
          employees={data.presentEmployees ?? []}
          color="green"
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'absent' && (
        <EmployeeModal
          title={`الغائبون اليوم (${data.absentEmployees?.length ?? 0})`}
          employees={data.absentEmployees ?? []}
          color="red"
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'active' && (
        <EmployeeModal
          title={`المسجلون حاليًا (${data.currentlyCheckedInEmployees?.length ?? 0})`}
          employees={data.currentlyCheckedInEmployees ?? []}
          color="blue"
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'leave' && (
        <EmployeeModal
          title={`الإجازات اليوم (${data.onLeaveEmployees?.length ?? 0})`}
          employees={data.onLeaveEmployees ?? []}
          color="orange"
          onClose={() => setModal(null)}
        />
      )}

      <style jsx>{`
        .metric-btn {
          cursor: pointer; text-align: start; border: none;
          display: flex; align-items: center; position: relative;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .metric-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        }

      `}</style>
    </div>
  );
}
