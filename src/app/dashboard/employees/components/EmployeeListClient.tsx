"use client";

import Link from 'next/link';
import { Plus, Search, User, Trash2, Phone, Calendar, Briefcase, CreditCard, Eye } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

function ConfirmDeleteModal({ name, onConfirm, onCancel, loading }: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="confirm-overlay">
      <div className="confirm-box">
        <div className="confirm-icon">
          <Trash2 size={28} />
        </div>
        <h3 className="confirm-title">تأكيد الحذف</h3>
        <p className="confirm-msg">
          هل أنت متأكد من حذف <strong>{name}</strong>؟<br />
          <span>لا يمكن التراجع عن هذا الإجراء.</span>
        </p>
        <div className="confirm-actions">
          <button className="confirm-cancel" onClick={onCancel} disabled={loading}>إلغاء</button>
          <button className="confirm-delete" onClick={onConfirm} disabled={loading}>
            {loading ? <span className="spinner-sm" /> : <><Trash2 size={14} /> حذف</>}
          </button>
        </div>
      </div>
      <style jsx>{`
        .confirm-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(15,23,42,0.55); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; padding: 1rem;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .confirm-box {
          background: white; border-radius: 28px; padding: 36px;
          width: 100%; max-width: 390px; text-align: center;
          box-shadow: 0 30px 80px rgba(0,0,0,0.22);
          animation: popUp 0.25s cubic-bezier(.34,1.56,.64,1);
          border: 1px solid #FEE2E2;
        }
        @keyframes popUp { from { opacity:0; transform:scale(0.92); } to { opacity:1; transform:scale(1); } }
        .confirm-icon {
          width: 68px; height: 68px; border-radius: 22px;
          background: linear-gradient(135deg, #FEF2F2, #FEE2E2);
          color: #DC2626; margin: 0 auto 18px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 16px rgba(220,38,38,0.15);
        }
        .confirm-title { font-size: 1.25rem; font-weight: 900; color: #1e293b; margin: 0 0 10px; font-family: 'Cairo', sans-serif; }
        .confirm-msg { font-size: 0.9rem; color: #64748b; font-weight: 600; line-height: 1.7; margin: 0 0 28px; font-family: 'Cairo', sans-serif; }
        .confirm-msg strong { color: #1e293b; }
        .confirm-msg span { color: #94a3b8; font-size: 0.8rem; }
        .confirm-actions { display: flex; gap: 10px; }
        .confirm-cancel {
          flex: 1; padding: 13px; border-radius: 16px;
          border: 1.5px solid #E2E8F0; background: white;
          font-weight: 800; color: #64748b; cursor: pointer; transition: 0.2s;
          font-family: 'Cairo', sans-serif; font-size: 0.9rem;
        }
        .confirm-cancel:hover:not(:disabled) { border-color: #CBD5E1; background: #F8FAFC; }
        .confirm-delete {
          flex: 1; padding: 13px; border-radius: 16px; border: none;
          background: linear-gradient(135deg, #EF4444, #DC2626);
          color: white; font-weight: 800; cursor: pointer; transition: 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          box-shadow: 0 4px 14px rgba(220,38,38,0.3);
          font-family: 'Cairo', sans-serif; font-size: 0.9rem;
        }
        .confirm-delete:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(220,38,38,0.4); }
        .confirm-delete:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .spinner-sm {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3); border-top-color: white;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function EmployeeListClient({ 
  employees, 
  query 
}: { 
  employees: any[], 
  query: string 
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'SUPERADMIN' || session?.user?.role === 'ADMIN';
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(profileId: string) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/employees/${profileId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setConfirmTarget(null);
        router.refresh();
      } else {
        alert(data.error || 'فشل الحذف');
      }
    } catch {
      alert('خطأ في الاتصال');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="emp-list-page">
      {/* ── Header ─────────────────────────────────── */}
      <div className="elp-header">
        <div className="elp-title-block">
          <div className="elp-title-icon">
            <User size={22} />
          </div>
          <div>
            <h1 className="elp-title">الموظفون</h1>
            <p className="elp-sub">{employees.length} موظف مسجّل</p>
          </div>
        </div>
        {isAdmin && (
          <Link href="/dashboard/employees/new" className="elp-add-btn">
            <Plus size={18} />
            إضافة موظف
          </Link>
        )}
      </div>

      {/* ── Search ─────────────────────────────────── */}
      <form className="elp-search-bar">
        <Search size={16} className="elp-search-icon" />
        <input
          type="text"
          name="q"
          placeholder="ابحث بالاسم أو المنصب أو الرقم القومي..."
          defaultValue={query}
          className="elp-search-input"
          autoComplete="off"
        />
        <button type="submit" className="elp-search-btn">بحث</button>
      </form>

      {/* ── Grid ───────────────────────────────────── */}
      {employees.length === 0 ? (
        <div className="elp-empty">
          <User size={52} strokeWidth={1} />
          <p>لا يوجد موظفون{query ? ` مطابقون لـ "${query}"` : ''}</p>
        </div>
      ) : (
        <div className="elp-grid">
          {employees.map(emp => (
            <div key={emp.id} className="emp-card">
              {/* Colored top accent border */}
              <div className="emp-card-band" />

              {/* Avatar + name block */}
              <div className="emp-card-top">
                <div className="emp-card-avatar">
                  {emp.profilePhoto ? (
                    <img src={emp.profilePhoto} alt={emp.fullName} />
                  ) : (
                    <span>{emp.fullName.charAt(0)}</span>
                  )}
                </div>
                <div className="emp-card-name-block">
                  <p className="emp-card-name">{emp.fullName}</p>
                  <p className="emp-card-username">@{emp.user.username}</p>
                  <span className="emp-active-badge">
                    <span className="emp-active-dot" />
                    نشط
                  </span>
                </div>
              </div>

              {/* Info rows */}
              <div className="emp-card-info">
                <div className="emp-info-divider" />
                <div className="emp-info-row">
                  <span className="emp-info-icon-wrap"><Briefcase size={13} /></span>
                  <span>{emp.jobTitle || '—'}</span>
                </div>
                <div className="emp-info-row">
                  <span className="emp-info-icon-wrap"><Phone size={13} /></span>
                  <span dir="ltr">{emp.phoneNumber || '—'}</span>
                </div>
                <div className="emp-info-row">
                  <span className="emp-info-icon-wrap"><CreditCard size={13} /></span>
                  <span>{emp.nationalId || '—'}</span>
                </div>
                <div className="emp-info-row">
                  <span className="emp-info-icon-wrap"><Calendar size={13} /></span>
                  <span>
                    {emp.dateOfHiring
                      ? new Date(emp.dateOfHiring).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
                      : '—'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="emp-card-actions">
                <Link href={`/dashboard/employees/${emp.id}`} className="emp-view-btn">
                  <Eye size={14} />
                  عرض الملف
                </Link>
                {isAdmin && (
                  <button
                    className="emp-delete-btn"
                    onClick={() => setConfirmTarget({ id: emp.id, name: emp.fullName })}
                    title="حذف الموظف"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmTarget && (
        <ConfirmDeleteModal
          name={confirmTarget.name}
          loading={deleting}
          onConfirm={() => handleDelete(confirmTarget.id)}
          onCancel={() => setConfirmTarget(null)}
        />
      )}

      <style jsx>{`
        /* ── Page ── */
        .emp-list-page { animation: fadeUp 0.4s ease-out; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }

        /* ── Header ── */
        .elp-header {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 14px; margin-bottom: 28px;
        }
        .elp-title-block { display: flex; align-items: center; gap: 16px; }
        .elp-title-icon {
          width: 54px; height: 54px; border-radius: 18px; flex-shrink: 0;
          background: linear-gradient(135deg, #2563EB, #1D4ED8);
          color: white; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);
        }
        .elp-title {
          font-size: 1.65rem; font-weight: 900; color: #1E293B;
          margin: 0; font-family: 'Cairo', sans-serif;
        }
        .elp-sub {
          font-size: 0.8rem; color: #94A3B8; font-weight: 600;
          margin: 2px 0 0; font-family: 'Cairo', sans-serif;
        }

        /* Add button */
        .elp-add-btn {
          display: flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #2563EB, #1D4ED8);
          color: white; padding: 12px 22px; border-radius: 16px;
          font-size: 0.9rem; font-weight: 800; text-decoration: none;
          box-shadow: 0 4px 16px rgba(37,99,235,0.3);
          transition: 0.2s; font-family: 'Cairo', sans-serif;
        }
        .elp-add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(37,99,235,0.4);
        }

        /* ── Search ── */
        .elp-search-bar {
          display: flex; align-items: center; gap: 10px;
          background: white; border: 1.5px solid #E8EFFF; border-radius: 50px;
          padding: 10px 18px; margin-bottom: 28px;
          box-shadow: 0 4px 20px rgba(37,99,235,0.06);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .elp-search-bar:focus-within {
          border-color: #2563EB;
          box-shadow: 0 4px 20px rgba(37,99,235,0.14), 0 0 0 3px rgba(37,99,235,0.08);
        }
        .elp-search-icon { color: #94A3B8; flex-shrink: 0; }
        .elp-search-input {
          flex: 1; border: none; background: transparent; outline: none;
          font-size: 0.92rem; font-weight: 600; color: #1E293B;
          font-family: 'Cairo', sans-serif;
        }
        .elp-search-input::placeholder { color: #CBD5E1; }
        .elp-search-btn {
          background: linear-gradient(135deg, #2563EB, #1D4ED8);
          color: white; border: none; border-radius: 50px;
          padding: 8px 20px; font-size: 0.84rem; font-weight: 800;
          cursor: pointer; transition: 0.2s; white-space: nowrap;
          font-family: 'Cairo', sans-serif;
          box-shadow: 0 2px 10px rgba(37,99,235,0.25);
        }
        .elp-search-btn:hover { transform: scale(1.03); box-shadow: 0 4px 16px rgba(37,99,235,0.35); }

        /* ── Empty ── */
        .elp-empty {
          text-align: center; padding: 90px 20px; color: #CBD5E1;
          display: flex; flex-direction: column; align-items: center; gap: 14px;
          font-size: 0.95rem; font-weight: 700; font-family: 'Cairo', sans-serif;
        }

        /* ── Grid ── */
        .elp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(288px, 1fr));
          gap: 20px;
        }

        /* ── Employee Card ── */
        .emp-card {
          background: white; border-radius: 24px;
          border: 1px solid #E8EFFF; overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 24px rgba(37,99,235,0.07);
          display: flex; flex-direction: column;
        }
        .emp-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 48px rgba(37,99,235,0.14);
          border-color: #BFDBFE;
        }

        /* Top accent band — richer 4-color gradient */
        .emp-card-band {
          height: 6px;
          background: linear-gradient(90deg, #1D4ED8 0%, #60A5FA 35%, #A78BFA 65%, #2563EB 100%);
          background-size: 250% 100%;
          animation: shimmer 4s ease-in-out infinite;
        }
        @keyframes shimmer { 0% { background-position: 250% 0; } 100% { background-position: -250% 0; } }

        /* Card top — 24px padding */
        .emp-card-top { display: flex; align-items: center; gap: 16px; padding: 24px 24px 14px; }

        /* Avatar — circular blue gradient with glowing ring */
        .emp-card-avatar {
          width: 62px; height: 62px;
          border-radius: 50%;
          flex-shrink: 0;
          overflow: hidden;
          background: linear-gradient(135deg, #2563EB 0%, #60A5FA 60%, #93C5FD 100%);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem; font-weight: 900; color: white;
          box-shadow:
            0 0 0 3px rgba(255,255,255,0.9),
            0 0 0 5px rgba(37,99,235,0.25),
            0 6px 20px rgba(37,99,235,0.3);
          text-shadow: 0 1px 4px rgba(0,0,0,0.2);
        }
        .emp-card-avatar img { width: 100%; height: 100%; object-fit: cover; }

        /* Name block */
        .emp-card-name-block { flex: 1; min-width: 0; }
        .emp-card-name {
          font-size: 1rem; font-weight: 900; color: #1E293B;
          margin: 0 0 2px; white-space: nowrap; overflow: hidden;
          text-overflow: ellipsis; font-family: 'Cairo', sans-serif;
        }
        .emp-card-username {
          font-size: 0.72rem; color: #94A3B8; font-weight: 700;
          font-family: monospace; margin: 0 0 5px;
        }

        /* Active badge — glowing animated green pill */
        .emp-active-badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 0.7rem; font-weight: 800; color: #065F46;
          background: linear-gradient(135deg, #D1FAE5 0%, #6EE7B7 100%);
          padding: 4px 12px; border-radius: 50px;
          border: 1px solid rgba(16,185,129,0.3);
          box-shadow:
            0 0 0 2px rgba(16,185,129,0.15),
            0 2px 12px rgba(16,185,129,0.3);
          font-family: 'Cairo', sans-serif;
          animation: badgeGlow 2.5s ease-in-out infinite;
        }
        @keyframes badgeGlow {
          0%, 100% { box-shadow: 0 0 0 2px rgba(16,185,129,0.15), 0 2px 12px rgba(16,185,129,0.3); }
          50%       { box-shadow: 0 0 0 3px rgba(16,185,129,0.25), 0 4px 18px rgba(16,185,129,0.5); }
        }
        /* Pulse dot inside badge */
        .emp-active-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 6px rgba(16,185,129,0.8);
          animation: dotPulse 1.8s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes dotPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.3); opacity: 0.7; }
        }

        /* Info rows — cleaner layout, more spacing */
        .emp-card-info {
          padding: 8px 24px 20px;
          display: flex; flex-direction: column; gap: 11px;
          flex: 1;
        }
        .emp-info-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #E8EFFF 30%, #E8EFFF 70%, transparent);
          margin-bottom: 4px;
        }
        .emp-info-row {
          display: flex; align-items: center; gap: 12px;
          font-size: 0.82rem; font-weight: 600; color: #475569;
          font-family: 'Cairo', sans-serif;
          line-height: 1.4;
        }
        .emp-info-row span:last-child {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .emp-info-icon-wrap {
          width: 30px; height: 30px; border-radius: 10px; flex-shrink: 0;
          background: linear-gradient(135deg, #EFF6FF, #DBEAFE);
          color: #2563EB; border: 1px solid #BFDBFE;
          display: flex; align-items: center; justify-content: center;
        }

        /* Actions bar */
        .emp-card-actions {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 20px;
          border-top: 1px solid #EEF4FF;
          background: linear-gradient(135deg, #FAFBFF, #F0F5FF);
        }

        /* View button */
        .emp-view-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px;
          background: linear-gradient(135deg, #2563EB, #1D4ED8);
          color: white; text-decoration: none; border-radius: 14px;
          padding: 11px; font-size: 0.85rem; font-weight: 800;
          transition: 0.2s; box-shadow: 0 3px 12px rgba(37,99,235,0.25);
          font-family: 'Cairo', sans-serif;
        }
        .emp-view-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(37,99,235,0.4);
        }

        /* Delete button */
        .emp-delete-btn {
          width: 40px; height: 40px; border-radius: 13px; border: none; flex-shrink: 0;
          background: #FEF2F2; color: #DC2626; cursor: pointer; transition: 0.2s;
          display: flex; align-items: center; justify-content: center;
        }
        .emp-delete-btn:hover {
          background: #FEE2E2; transform: scale(1.08);
          box-shadow: 0 4px 12px rgba(220,38,38,0.2);
        }
      `}</style>
    </div>
  );
}
