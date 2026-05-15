"use client";

import Link from 'next/link';
import { Plus, Search, User, Trash2 } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  async function handleDelete() {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete.id);
    setConfirmDelete(null);

    try {
      const res = await fetch(`/api/employees/${confirmDelete.id}`, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok) {
        router.refresh();
      } else {
        alert(data.error || 'Delete failed');
      }
    } catch {
      alert('Delete failed: Network error');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="employees-page">
      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">
              <Trash2 size={24} />
            </div>
            <h3 className="modal-title">{t('delete_employee')}</h3>
            <p className="modal-desc">
              {t('delete_confirm_msg')} <strong>{confirmDelete.name}</strong>?
            </p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setConfirmDelete(null)}>
                {t('cancel')}
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header justify-between mb-6">
        <div>
          <h1 className="title">{t('employees')}</h1>
          <p className="subtitle">{t('employee_list')}</p>
        </div>
        {isAdmin && (
          <Link href="/dashboard/employees/new" className="btn btn-primary">
            <Plus size={18} />
            <span>{t('add_employee')}</span>
          </Link>
        )}
      </div>

      <div className="card mb-6">
        <form className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            name="q"
            placeholder={t('search_placeholder')}
            defaultValue={query}
            className="search-input"
          />
          <button type="submit" className="btn btn-outline btn-sm">
            {t('search')}
          </button>
        </form>
      </div>

      <div className="card table-container">
        <table className="table">
          <thead>
            <tr>
              <th>{t('full_name')}</th>
              <th>{t('username')}</th>
              <th>{t('job_title')}</th>
              <th>{t('phone_number')}</th>
              <th>{t('national_id')}</th>
              <th>{t('hiring_date')}</th>
              <th>{t('status')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-muted">
                  {t('no_employees')}
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar-small">
                        {emp.profilePhoto ? (
                          <img src={emp.profilePhoto} alt="" />
                        ) : (
                          <User size={16} />
                        )}
                      </div>
                      <span className="font-semibold">{emp.fullName}</span>
                    </div>
                  </td>
                  <td>
                    <span className="username-badge">@{emp.user.username}</span>
                  </td>
                  <td>{emp.jobTitle}</td>
                  <td>{emp.phoneNumber}</td>
                  <td>{emp.nationalId}</td>
                  <td>{new Date(emp.dateOfHiring).toLocaleDateString()}</td>
                  <td>
                    <span className="badge badge-success">{t('active')}</span>
                  </td>
                  <td>
                    <div className="flex gap-2 items-center">
                      <Link href={`/dashboard/employees/${emp.id}`} className="btn btn-outline btn-sm">
                        {t('view_profile')}
                      </Link>
                      {isAdmin && (
                        <button
                          className="btn-delete"
                          onClick={() => setConfirmDelete({ id: emp.id, name: emp.fullName })}
                          disabled={deletingId === emp.id}
                          title={t('delete')}
                        >
                          {deletingId === emp.id ? (
                            <span className="spinner spinner-sm" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .username-badge {
          display: inline-block;
          font-size: 0.78rem;
          color: var(--text-muted);
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 0.15rem 0.45rem;
          font-family: monospace;
        }
        .btn-delete {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: var(--radius-md);
          border: 1px solid rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.06);
          color: var(--danger);
          cursor: pointer;
          transition: var(--transition);
          flex-shrink: 0;
        }
        .btn-delete:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.15);
          border-color: var(--danger);
        }
        .btn-delete:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          padding: 1rem;
        }
        .modal-box {
          background: var(--surface);
          border-radius: var(--radius-2xl);
          padding: 2rem;
          max-width: 400px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
          animation: slideUp 0.2s ease;
        }
        @keyframes slideUp {
          from { opacity:0; transform: translateY(12px); }
          to   { opacity:1; transform: translateY(0); }
        }
        .modal-icon {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.1);
          color: var(--danger);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--foreground);
          margin: 0;
          text-align: center;
        }
        .modal-desc {
          font-size: 0.9rem;
          color: var(--text-muted);
          text-align: center;
          margin: 0;
          line-height: 1.5;
        }
        .modal-actions {
          display: flex;
          gap: 0.75rem;
          width: 100%;
          margin-top: 0.5rem;
        }
        .modal-actions .btn {
          flex: 1;
        }
        .btn-danger {
          background: var(--danger);
          color: #fff;
          border: none;
          border-radius: var(--radius-lg);
          padding: 0.6rem 1.25rem;
          font-weight: 700;
          font-size: 0.875rem;
          cursor: pointer;
          transition: var(--transition);
        }
        .btn-danger:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}
