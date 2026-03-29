"use client";

import { useState } from 'react';
import { X, DollarSign, Calculator, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function SettleModal({ 
  profile, 
  totalHours, 
  currentSalary, 
  onClose, 
  onSuccess 
}: { 
  profile: any; 
  totalHours: number; 
  currentSalary: number; 
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { t } = useLanguage();
  const [bonus, setBonus] = useState('0');
  const [deductions, setDeductions] = useState('0');
  const [advance, setAdvance] = useState('0');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const bonusVal = parseFloat(bonus) || 0;
  const dedVal = parseFloat(deductions) || 0;
  const advVal = parseFloat(advance) || 0;
  const netAmount = currentSalary + bonusVal - dedVal - advVal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/employees/${profile.id}/payroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month,
          year,
          totalHours: parseFloat(totalHours.toFixed(2)),
          hourlyRate: profile.hourlyRate,
          bonus: bonusVal,
          deductions: dedVal,
          advance: advVal,
          netAmount,
          notes: notes.trim()
        }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to process settlement');
      }
    } catch (err) {
      setError('An error occurred. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="settle-overlay">
      <div className="settle-modal-glass">
        <div className="settle-header">
          <div className="header-icon">
            <Calculator size={24} />
          </div>
          <div className="header-text">
            <h2>{t('settlement_details')}</h2>
            <p>{profile.fullName} • {month}/{year}</p>
          </div>
          <button onClick={onClose} className="close-btn"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="settle-body">
          <div className="dues-summary-banner">
             <div className="summary-item">
               <span className="label">{t('hours_unit')}</span>
               <span className="value">{totalHours.toFixed(2)}</span>
             </div>
             <div className="summary-item">
               <span className="label">$/{t('hours_unit')}</span>
               <span className="value">${profile.hourlyRate.toFixed(2)}</span>
             </div>
             <div className="summary-item main">
               <span className="label">{t('calculated_salary')}</span>
               <span className="value">${(totalHours * profile.hourlyRate).toFixed(2)}</span>
             </div>
          </div>

          <div className="input-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group-custom">
              <label>{t('bonuses')}</label>
              <div className="input-wrapper">
                <span className="currency">$</span>
                <input 
                  type="number" 
                  step="0.01"
                  className="modern-input" 
                  value={bonus}
                  onChange={(e) => setBonus(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="form-group-custom">
              <label>{t('deductions')}</label>
              <div className="input-wrapper">
                <span className="currency">$</span>
                <input 
                  type="number" 
                  step="0.01"
                  className="modern-input danger" 
                  value={deductions}
                  onChange={(e) => setDeductions(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="form-group-custom">
            <label>{t('advances')}</label>
            <div className="input-wrapper">
              <span className="currency">$</span>
              <input 
                type="number" 
                step="0.01"
                className="modern-input warning" 
                value={advance}
                onChange={(e) => setAdvance(e.target.value)}
                placeholder="0.00"
                style={{ borderColor: advVal > 0 ? '#f59e0b' : '#f1f5f9' }}
              />
            </div>
          </div>

          <div className="form-group-custom full">
            <label>{t('note')}</label>
            <textarea 
              className="modern-textarea" 
              placeholder={t('details_placeholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="final-total-box">
             <div className="total-label">
                <span className="title">{t('net_salary')}</span>
                <span className="subtitle">{t('ready_to_settle') || 'Final amount to record'}</span>
             </div>
             <div className="total-value">${netAmount.toFixed(2)}</div>
          </div>

          {error && <div className="error-badge"><AlertCircle size={14} /> {error}</div>}

          <div className="modal-actions-custom">
            <button type="button" onClick={onClose} className="btn-secondary-custom">{t('cancel')}</button>
            <button 
              type="submit" 
              disabled={isSubmitting || netAmount < 0}
              className="btn-primary-custom"
            >
              {isSubmitting ? <div className="spinner-sm" /> : t('pay_now')}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .settle-overlay {
          position: fixed; inset: 0; z-index: 999;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; padding: 1rem;
        }
        .settle-modal-glass {
          background: white; border-radius: 28px; width: 100%; max-width: 500px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden; border: 1px solid rgba(255,255,255,0.2);
        }
        .settle-header {
          padding: 24px; border-bottom: 1px solid #f1f5f9;
          display: flex; align-items: center; gap: 16px;
        }
        .header-icon {
          width: 48px; height: 48px; background: rgba(var(--primary-rgb), 0.1);
          color: var(--primary); border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
        }
        .header-text h2 { margin: 0; font-size: 1.25rem; font-weight: 900; color: #1e293b; }
        .header-text p { margin: 0; font-size: 0.8rem; color: #64748b; font-weight: 600; }
        .close-btn { margin-left: auto; background: none; border: none; color: #94a3b8; cursor: pointer; }
        
        .settle-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
        
        .dues-summary-banner {
          background: #f8fafc; border-radius: 20px; padding: 16px;
          display: flex; justify-content: space-between; border: 1px solid #f1f5f9;
        }
        .summary-item { display: flex; flex-direction: column; gap: 4px; }
        .summary-item.main .value { color: var(--primary); }
        .summary-item .label { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; }
        .summary-item .value { font-size: 1.1rem; font-weight: 900; color: #334155; }

        .input-grid { display: grid; grid-cols-2; gap: 16px; }
        .form-group-custom { display: flex; flex-direction: column; gap: 8px; }
        .form-group-custom label { font-size: 0.85rem; font-weight: 800; color: #475569; }
        
        .input-wrapper { position: relative; }
        .currency { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-weight: 800; color: #94a3b8; }
        
        .modern-input {
          width: 100%; padding: 12px 16px 12px 32px; border-radius: 14px;
          border: 2px solid #f1f5f9; background: #fff; font-weight: 700;
          transition: 0.2s; outline: none;
        }
        .modern-input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.05); }
        .modern-input.danger:focus { border-color: var(--danger); }
        
        .modern-textarea {
          width: 100%; padding: 16px; border-radius: 14px; border: 2px solid #f1f5f9;
          min-height: 80px; font-weight: 600; outline: none; transition: 0.2s;
        }
        .modern-textarea:focus { border-color: var(--primary); }
        
        .final-total-box {
          background: #1e293b; border-radius: 20px; padding: 20px;
          display: flex; justify-content: space-between; align-items: center;
          color: white;
        }
        .total-label .title { display: block; font-weight: 900; font-size: 0.9rem; text-transform: uppercase; }
        .total-label .subtitle { font-size: 0.7rem; color: #94a3b8; }
        .total-value { font-size: 2rem; font-weight: 900; }
        
        .error-badge {
          background: #fef2f2; color: #b91c1c; padding: 12px; border-radius: 12px;
          font-size: 0.8rem; font-weight: 700; display: flex; align-items: center; gap: 8px;
        }
        
        .modal-actions-custom { display: flex; gap: 12px; }
        .btn-secondary-custom {
          flex: 1; padding: 14px; border-radius: 14px; border: 2px solid #f1f5f9;
          font-weight: 800; color: #64748b; background: white; cursor: pointer;
        }
        .btn-primary-custom {
          flex: 2; padding: 14px; border-radius: 14px; border: none;
          background: var(--primary); color: white; font-weight: 900; cursor: pointer;
          box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.2);
        }
        
        .spinner-sm {
          width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
