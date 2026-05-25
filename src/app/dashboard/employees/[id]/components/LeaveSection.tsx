"use client";

import { useState } from 'react';
import { Calendar, Check, X, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';

export default function LeaveSection({ 
  profileId, 
  isAdmin, 
  leaves,
  selectedMonth,
  selectedYear,
  hideHeader = false
}: { 
  profileId: string; 
  isAdmin: boolean;
  leaves: any[];
  selectedMonth?: number;
  selectedYear?: number;
  hideHeader?: boolean;
}) {
  const filteredLeaves = (selectedMonth && selectedYear) 
    ? leaves.filter(l => {
        const d = new Date(l.startDate || l.createdAt);
        return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
      })
    : leaves;
  const router = useRouter();
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const body = Object.fromEntries(formData);

    try {
      const res = await fetch(`/api/employees/${profileId}/leaves`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error('Failed to submit request');
      
      setShowForm(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(leaveId: string, status: string) {
    try {
      const res = await fetch(`/api/employees/${profileId}/leaves`, {
        method: 'PUT',
        body: JSON.stringify({ leaveId, status }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      {!hideHeader && (
        <div className="leave-header">
          <h2 className="title" style={{ margin: 0, fontSize: '1.15rem' }}>{t('leave_management')}</h2>
          {!isAdmin && (
            <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
              {showForm ? t('cancel') : t('request_leave')}
            </button>
          )}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-4 bg-background mb-6 border-primary">
          <div className="grid md-grid-cols-3 gap-4 mb-4">
            <div className="form-group">
              <label className="form-label">{t('leave_type')}</label>
              <select name="type" className="form-select" required>
                <option value="VACATION">{t('vacation_leave')}</option>
                <option value="SICK">{t('sick_leave')}</option>
                <option value="EMERGENCY">{t('emergency_leave')}</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('start_date')}</label>
              <input type="date" name="startDate" className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">{t('end_date')}</label>
              <input type="date" name="endDate" className="form-input" required />
            </div>
          </div>
          {error && <p className="text-danger text-sm mb-4">{error}</p>}
          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? t('loading') : t('submit')}
            </button>
          </div>
        </form>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {profileId === 'all' && <th>{t('employee')}</th>}
              <th>{t('leave_type')}</th>
              <th>{t('period')}</th>
              <th>{t('status')}</th>
              {isAdmin && <th>{t('actions')}</th>}
            </tr>
          </thead>
          <tbody>
            {filteredLeaves.length === 0 ? (
              <tr><td colSpan={isAdmin ? 4 : 3} className="text-center py-4 text-muted">{t('no_history')}</td></tr>
            ) : (
              filteredLeaves.map((leave) => (
                <tr key={leave.id}>
                  {profileId === 'all' && (
                    <td>
                      <div>
                        <div className="font-bold text-sm">{leave.employee?.fullName}</div>
                        <div className="text-xs text-muted" style={{ color: '#64748b' }}>{leave.employee?.jobTitle}</div>
                      </div>
                    </td>
                  )}
                  <td>
                    <span className="font-medium">
                      {leave.type === 'VACATION' ? t('vacation_leave') : 
                       leave.type === 'SICK' ? t('sick_leave') : t('emergency_leave')}
                    </span>
                  </td>
                  <td>
                    <div className="text-sm">
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${leave.status === 'APPROVED' ? 'success' : leave.status === 'REJECTED' ? 'danger' : 'warning'}`}>
                      {leave.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td>
                      {leave.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button onClick={() => updateStatus(leave.id, 'APPROVED')} className="btn-icon text-success" title="Approve">
                            <Check size={18} />
                          </button>
                          <button onClick={() => updateStatus(leave.id, 'REJECTED')} className="btn-icon text-danger" title="Reject">
                            <X size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .table { width: 100%; border-collapse: separate; border-spacing: 0 8px; }
        .table th { padding: 12px 16px; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; border: none; text-align: start; white-space: nowrap; }
        .table td { padding: 16px; font-size: 0.9rem; font-weight: 600; color: #1e293b; background: #f8fafc; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; white-space: nowrap; }
        .table td:first-child { border-left: 1px solid #f1f5f9; border-top-left-radius: 12px; border-bottom-left-radius: 12px; }
        .table td:last-child { border-right: 1px solid #f1f5f9; border-top-right-radius: 12px; border-bottom-right-radius: 12px; }
        .leave-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.5rem; gap:12px; flex-wrap:wrap; }
        .btn-icon {
          padding: 8px;
          border-radius: 10px;
          cursor: pointer;
          border: 1px solid var(--border);
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 0.2s;
        }
        .btn-icon:hover { background: #f8fafc; border-color: var(--primary); color: var(--primary); }

        @media (max-width: 480px) {
          .leave-header { flex-direction:column; align-items:flex-start; }
          .leave-header .btn { width:100%; justify-content:center; }
          .table td, .table th { padding:10px 12px; }
        }
      `}</style>
    </div>
  );
}
