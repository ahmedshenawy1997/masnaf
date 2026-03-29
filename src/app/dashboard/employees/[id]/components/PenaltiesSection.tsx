"use client";

import { useState } from 'react';
import { AlertTriangle, Plus, Trash2, Check, X, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';

export default function PenaltiesSection({ 
  profileId, 
  isAdmin, 
  penalties,
  selectedMonth,
  selectedYear
}: { 
  profileId: string; 
  isAdmin: boolean;
  penalties: any[];
  selectedMonth?: number;
  selectedYear?: number;
}) {
  const filteredPenalties = (selectedMonth && selectedYear)
    ? penalties.filter(p => {
        const d = new Date(p.date);
        return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
      })
    : penalties;
  const router = useRouter();
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    const formData = new FormData(e.currentTarget);
    const body = Object.fromEntries(formData);
    const fetchUrl = `/api/employees/${profileId}/penalties`;

    console.log("Saving penalty to:", fetchUrl, body);

    try {
      const res = await fetch(fetchUrl, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });
      console.log("Fetch response status:", res.status);
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setShowForm(false);
          setSuccess(false);
          router.refresh();
        }, 1000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save');
      }
    } catch (err: any) {
      setError(err.message || 'System error');
    } finally {
      setLoading(false);
    }
  }

  async function deletePenalty(id: string) {
    if (!confirm(t('are_you_sure') || 'Are you sure?')) return;
    const res = await fetch(`/api/employees/${profileId}/penalties?penaltyId=${id}`, {
      method: 'DELETE',
    });
    if (res.ok) router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="section-title-custom m-0">
          <div className="title-icon-wrapper warning">
             <AlertTriangle size={22} />
          </div>
          <h2 className="text-xl font-black">{t('penalties_notes')}</h2>
        </div>
        {isAdmin && (
          <button 
            onClick={() => {
              setShowForm(!showForm);
              setError('');
              setSuccess(false);
            }} 
            className={`btn-action-rounded ${showForm ? 'cancel' : 'add'}`}
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
            <span>{showForm ? t('cancel') : t('add_record')}</span>
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 shadow-sm">
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div className="form-group">
              <label className="form-label font-bold mb-2 block">{t('leave_type')}</label>
              <select name="type" className="form-select w-full p-3 rounded-xl border-2 border-slate-200 outline-none focus:border-primary transition-all" required>
                <option value="WARNING">{t('warning')}</option>
                <option value="PENALTY">{t('penalty')}</option>
                <option value="NOTE">{t('note')}</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label font-bold mb-2 block">{t('description')}</label>
              <textarea 
                name="description" 
                className="form-textarea w-full p-3 rounded-xl border-2 border-slate-200 outline-none focus:border-primary transition-all" 
                rows={3} 
                required 
                placeholder={t('details_placeholder')}
              ></textarea>
            </div>
          </div>
          
          <button 
            type="submit" 
            className={`btn-submit-modern ${success ? 'success' : ''}`} 
            disabled={loading || success}
          >
            {loading ? (
              <span className="spinner-inline"></span>
            ) : success ? (
                <span className="flex items-center justify-center gap-2"><Check size={18} /> {t('saved')}</span>
            ) : t('save_record')}
          </button>
          
          {error && (
            <div className="error-pill mt-4 flex items-center justify-center gap-2 text-red-600 bg-red-50 p-2 rounded-xl text-sm font-bold">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </form>
      )}

      <div className="penalties-list">
        {filteredPenalties.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
             <AlertTriangle size={32} className="mx-auto mb-2 opacity-20" />
             <p className="font-bold">{t('no_records_logged')}</p>
          </div>
        ) : (
          filteredPenalties.map((item) => (
            <div key={item.id} className={`penalty-item ${item.type.toLowerCase()}`}>
              <div className="penalty-header">
                <div className="header-left">
                  <span className={`badge-custom ${item.type.toLowerCase()}`}>
                    {item.type === 'WARNING' ? t('warning') : item.type === 'PENALTY' ? t('penalty') : t('note')}
                  </span>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                </div>
                {isAdmin && (
                  <button onClick={() => deletePenalty(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-all bg-transparent border-none cursor-pointer">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <p className="penalty-desc">{item.description}</p>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .section-title-custom { display: flex; align-items: center; gap: 12px; }
        .title-icon-wrapper {
          width: 40px; height: 40px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
        }
        .title-icon-wrapper.warning { background: #fffbeb; color: #f59e0b; }
        
        .btn-action-rounded {
          display: flex; align-items: center; gap: 8px; padding: 10px 20px;
          border-radius: 14px; font-weight: 800; border: none; cursor: pointer; transition: 0.2s;
        }
        .btn-action-rounded.add { background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; }
        .btn-action-rounded.cancel { background: #fee2e2; color: #dc2626; }
        .btn-action-rounded:hover { transform: translateY(-2px); }

        .btn-submit-modern {
          width: 100%; padding: 16px; border-radius: 18px;
          background: #1e293b; color: white; border: none;
          font-weight: 950; text-transform: uppercase; letter-spacing: 1px;
          cursor: pointer; transition: 0.3s;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .btn-submit-modern:hover:not(:disabled) { background: #0f172a; transform: translateY(-2px); shadow: 0 15px 25px rgba(0,0,0,0.15); }
        .btn-submit-modern.success { background: #16a34a; }
        
        .penalties-list { display: flex; flex-direction: column; gap: 1rem; }
        .penalty-item {
          padding: 24px;
          background: white;
          border: 2px solid #f1f5f9;
          border-radius: 24px;
          transition: 0.2s;
        }
        .penalty-item:hover { transform: scale(1.01); border-color: #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.02); }
        .penalty-item.warning { border-inline-start: 6px solid #f59e0b; }
        .penalty-item.penalty { border-inline-start: 6px solid #dc2626; }
        .penalty-item.note { border-inline-start: 6px solid #3b82f6; }
        
        .penalty-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .header-left { display: flex; align-items: center; gap: 12px; }
        
        .badge-custom {
          padding: 4px 10px; border-radius: 8px; font-size: 0.7rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;
        }
        .badge-custom.warning { background: #fff7ed; color: #c2410c; }
        .badge-custom.penalty { background: #fef2f2; color: #b91c1c; }
        .badge-custom.note { background: #eff6ff; color: #1d4ed8; }

        .penalty-desc { font-size: 1rem; color: #334155; line-height: 1.6; font-weight: 600; }

        .spinner-inline {
          width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
