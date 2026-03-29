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

  async function handleDelete(profileId: string, name: string) {
    console.log("Delete triggered for:", profileId, name);
    // REMOVED CONFIRM FOR TESTING
    setDeletingId(profileId);
    console.log("Sending DELETE request to /api/employees/" + profileId);
    
    try {
      const res = await fetch(`/api/employees/${profileId}`, {
        method: 'DELETE',
      });
      
      const data = await res.json();
      console.log("DELETE response:", res.status, data);

      if (res.ok) {
        console.log("Delete successful");
        alert(t('delete_success') || 'Deleted successfully');
        router.refresh();
      } else {
        const errorMsg = data.error + (data.details ? `:\n${data.details}` : '') || 'Delete failed';
        console.error("Delete failed server-side:", errorMsg);
        alert(errorMsg);
      }
    } catch (err) {
      console.error("Delete fetch error:", err);
      alert('Delete failed: Network error');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="employees-page">
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
                  {/* Name column */}
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

                  {/* Username column — separate */}
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

                  {/* Actions */}
                  <td>
                    <div className="flex gap-2 items-center">
                      <Link href={`/dashboard/employees/${emp.id}`} className="btn btn-outline btn-sm">
                        {t('view_profile')}
                      </Link>
                      {(isAdmin || session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPERADMIN') && (
                        <button
                          onClick={() => {
                            console.log("Button clicked!");
                            handleDelete(emp.id, emp.fullName);
                          }}
                          disabled={deletingId === emp.id}
                          style={{
                            backgroundColor: '#fee2e2',
                            color: '#b91c1c',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #f87171',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          {deletingId === emp.id ? (
                            <span className="spinner-tiny" />
                          ) : (
                            <span>{t('delete')}</span>
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
          padding: 0.4rem;
          border-radius: var(--radius-md);
          border: 1px solid rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.06);
          color: var(--danger);
          cursor: pointer;
          transition: var(--transition);
        }
        .btn-delete:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.15);
          border-color: var(--danger);
        }
        .btn-delete:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .spinner-tiny {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(239, 68, 68, 0.2);
          border-top-color: var(--danger);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
