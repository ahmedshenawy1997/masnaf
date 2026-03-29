"use client";

import { useState, useEffect } from 'react';
import { TrendingUp, Edit2, Check, X, DollarSign, History as HistoryIcon, ChevronDown, Calculator, CreditCard, Clock } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useRouter } from 'next/navigation';
import SettleModal from './SettleModal';
import PayrollHistory from './PayrollHistory';

export default function SalarySection({ 
  profile, 
  isAdmin,
  selectedMonth,
  selectedYear
}: { 
  profile: any; 
  isAdmin: boolean;
  selectedMonth?: number;
  selectedYear?: number;
}) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Editing state
  const [editing, setEditing] = useState(false);
  const [newRate, setNewRate] = useState<string>(String(profile.hourlyRate));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const isRTL = language === 'ar';

  const fetchStats = async () => {
    try {
      let url = `/api/employees/${profile.id}/salary-stats`;
      if (selectedMonth && selectedYear) {
        url += `?month=${selectedMonth}&year=${selectedYear}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [profile.id, profile.hourlyRate, selectedMonth, selectedYear]);

  async function handleSaveRate() {
    const rateNum = parseFloat(newRate);
    if (isNaN(rateNum) || rateNum < 0) {
      setSaveError(t('invalid_value') || 'Invalid value');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch(`/api/employees/${profile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hourlyRate: rateNum }),
      });
      if (res.ok) {
        setEditing(false);
        router.refresh();
        fetchStats();
      } else {
        const data = await res.json();
        setSaveError(data.error || 'Failed to save');
      }
    } catch {
      setSaveError('Failed to save');
    } finally {
      setSaving(false);
    }
  }

  const remainingBalance = stats ? stats.remainingHours * profile.hourlyRate : 0;

  return (
    <div className={`salary-dashboard-modern ${isRTL ? 'rtl' : ''}`}>
      <div className="section-title-custom mb-6">
        <CreditCard className="text-primary" size={24} />
        <h2>{t('financial_overview')}</h2>
      </div>

      <div className="salary-content-stack">
        
        {/* TOP CARD: PRIMARY STATUS - AM I OWED MONEY? */}
        <div className={`status-card ${remainingBalance > 0 ? 'dues-highlight' : 'paid-highlight'}`}>
           <div className="status-label">{t('pending_dues')}</div>
           <div className="status-value">${loading ? '...' : remainingBalance.toFixed(2)}</div>
           <div className="status-meta">
              <span>{loading ? '...' : (stats?.remainingHours || 0).toFixed(2)} {t('hours_unit')} {t('not_settled')}</span>
           </div>
           
           {isAdmin && (
             <button 
               className="settle-submit-btn" 
               onClick={() => setShowSettleModal(true)}
               disabled={loading || (stats?.remainingHours <= 0)}
             >
               {t('pay_now')}
             </button>
           )}
        </div>

        {/* DETAILS LIST: HOURLY RATE, TOTAL WORK, ETC */}
        <div className="summary-list">
           <div className="summary-row">
              <div className="row-info">
                 <div className="row-icon"><DollarSign size={16} /></div>
                 <span className="row-label">{t('hourly_rate')}</span>
              </div>
              <div className="row-actions">
                 {editing ? (
                   <div className="edit-box">
                      <input 
                        type="number" 
                        value={newRate} 
                        onChange={(e) => setNewRate(e.target.value)}
                        className="rate-input"
                      />
                      <button onClick={handleSaveRate} className="save-btn"><Check size={14}/></button>
                      <button onClick={() => setEditing(false)} className="cancel-btn"><X size={14}/></button>
                   </div>
                 ) : (
                   <div className="view-box">
                      <span className="row-value">${profile.hourlyRate.toFixed(2)}</span>
                      {isAdmin && <button onClick={() => setEditing(true)} className="edit-btn-inline"><Edit2 size={12}/></button>}
                   </div>
                 )}
              </div>
           </div>

           <div className="summary-row">
              <div className="row-info">
                 <div className="row-icon"><Clock size={16} /></div>
                 <span className="row-label">{t('hours_total')}</span>
              </div>
              <span className="row-value">{loading ? '...' : (stats?.totalHoursMonth || 0).toFixed(2)}</span>
           </div>

           <div className="summary-row paid">
              <div className="row-info">
                 <div className="row-icon"><TrendingUp size={16} /></div>
                 <span className="row-label">{t('total_paid')}</span>
              </div>
              <span className="row-value">${loading ? '...' : (stats?.totalPaidMonth || 0).toFixed(2)}</span>
           </div>
        </div>

        {/* HISTORY TOGGLE */}
        <button 
           className={`history-toggle ${showHistory ? 'active' : ''}`}
           onClick={() => setShowHistory(!showHistory)}
        >
           <HistoryIcon size={16} />
           <span>{t('payment_history')}</span>
           <ChevronDown size={14} className="arrow-icon" />
        </button>

        {showHistory && (
          <div className="history-drawer">
            <PayrollHistory 
              employeeId={profile.id} 
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          </div>
        )}

      </div>

      {showSettleModal && (
        <SettleModal 
          profile={profile}
          totalHours={stats?.remainingHours || 0}
          currentSalary={remainingBalance}
          onClose={() => setShowSettleModal(false)}
          onSuccess={() => {
            setShowSettleModal(false);
            fetchStats();
            setShowHistory(true);
          }}
        />
      )}

      <style jsx>{`
        .salary-dashboard-modern { width: 100%; }
        .salary-content-stack { display: flex; flex-direction: column; gap: 20px; }
        
        /* 1. STATUS CARD (THE BIG ONE) */
        .status-card {
           padding: 24px; border-radius: 24px; text-align: center;
           display: flex; flex-direction: column; align-items: center; gap: 8px;
           transition: 0.3s; box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }
        .dues-highlight { background: #fee2e2; border: 2px solid #fecaca; }
        .paid-highlight { background: #f0fdf4; border: 2px solid #dcfce7; }
        
        .status-label { font-[10px]; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
        .status-value { font-size: 2.5rem; font-weight: 950; color: #1e293b; line-height: 1; }
        .status-meta { font-size: 0.75rem; font-weight: 700; color: #64748b; }
        .dues-highlight .status-value { color: #dc2626; }
        .paid-highlight .status-value { color: #16a34a; }
        
        .settle-submit-btn {
           margin-top: 12px; width: 100%; padding: 14px; border-radius: 16px;
           background: #dc2626; color: white; font-weight: 900; border: none;
           cursor: pointer; box-shadow: 0 8px 16px rgba(220, 38, 38, 0.2);
           transition: 0.2s;
        }
        .settle-submit-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 20px rgba(220, 38, 38, 0.3); }
        .settle-submit-btn:disabled { opacity: 0.2; cursor: not-allowed; transform: none; box-shadow: none; }
        .paid-highlight .settle-submit-btn { background: #16a34a; box-shadow: 0 8px 16px rgba(22, 163, 74, 0.2); }

        /* 2. SUMMARY LIST (THE ROWS) */
        .summary-list { display: flex; flex-direction: column; gap: 10px; }
        .summary-row {
           display: flex; justify-content: space-between; align-items: center;
           padding: 16px 20px; background: white; border: 1px solid #f1f5f9;
           border-radius: 20px; transition: 0.2s;
        }
        .summary-row:hover { border-color: var(--primary); transform: translateX(4px); }
        .rtl .summary-row:hover { transform: translateX(-4px); }
        
        .row-info { display: flex; align-items: center; gap: 12px; }
        .row-icon { 
           width: 32px; height: 32px; background: #f8fafc; border-radius: 10px;
           display: flex; align-items: center; justify-content: center; color: #64748b;
        }
        .row-label { font-size: 0.85rem; font-weight: 800; color: #64748b; }
        .row-value { font-size: 1.1rem; font-weight: 900; color: #1e293b; }
        .summary-row.paid .row-value { color: #16a34a; }
        
        /* 3. EDITING BOX */
        .edit-box { display: flex; align-items: center; gap: 6px; }
        .view-box { display: flex; align-items: center; gap: 8px; }
        .rate-input { width: 60px; padding: 4px 8px; border: 2px solid var(--primary); border-radius: 8px; font-weight: 800; }
        .save-btn, .cancel-btn { padding: 6px; border-radius: 8px; border: none; cursor: pointer; display: flex; }
        .save-btn { background: #16a34a; color: white; }
        .cancel-btn { background: #f1f5f9; color: #94a3b8; }
        .edit-btn-inline { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px; border-radius: 6px; }
        .edit-btn-inline:hover { background: #f1f5f9; color: var(--primary); }

        /* 4. HISTORY TOGGLE */
        .history-toggle {
           width: 100%; padding: 16px; border-radius: 20px; border: 1px solid #f1f5f9;
           background: #f8fafc; color: #64748b; font-weight: 800;
           display: flex; align-items: center; gap: 12px; cursor: pointer; transition: 0.2s;
        }
        .history-toggle:hover { background: #f1f5f9; color: var(--primary); }
        .history-toggle .arrow-icon { margin-left: auto; transition: 0.3s; }
        .history-toggle.active .arrow-icon { transform: rotate(180deg); }
        .rtl .history-toggle .arrow-icon { margin-left: 0; margin-right: auto; }
        
        .history-drawer {
           animation: slideDown 0.3s ease-out;
           border: 1px solid #f1f5f9; border-radius: 24px; padding: 12px; background: #fff;
        }
        
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
