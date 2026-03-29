"use client";

import { useState, useEffect } from 'react';
import { History as HistoryIcon } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function PayrollHistory({ 
  employeeId,
  selectedMonth,
  selectedYear
}: { 
  employeeId: string;
  selectedMonth?: number;
  selectedYear?: number;
}) {
  const { t } = useLanguage();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      try {
        let url = `/api/employees/${employeeId}/payroll`;
        if (selectedMonth && selectedYear) {
           url += `?month=${selectedMonth}&year=${selectedYear}`;
        }
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [employeeId, selectedMonth, selectedYear]);

  return (
    <div className="payroll-history-container">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <HistoryIcon size={16} />
          {t('payment_history')}
        </h3>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><div className="spinner-primary" /></div>
      ) : history.length === 0 ? (
        <div className="empty-state">
           <HistoryIcon size={32} className="text-gray-200 mb-2" />
           <p className="text-xs text-gray-400 font-bold">{t('no_history')}</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((record: any) => (
            <div key={record.id} className="history-item-modern">
               <div className="item-left">
                  <div className="status-indicator"></div>
                  <div>
                    <span className="item-date">{new Date(record.createdAt).toLocaleDateString()}</span>
                    <span className="item-meta">{record.month}/{record.year} • {record.totalHours.toFixed(2)} {t('hours_unit')}</span>
                  </div>
               </div>
               <div className="item-right">
                  <span className="item-amount">${record.netAmount.toFixed(2)}</span>
                  <div className="paid-badge">{t('active') || 'PAID'}</div>
               </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .payroll-history-container { margin-top: 1rem; }
        .history-list { display: flex; flex-direction: column; gap: 8px; }
        .history-item-modern {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px; background: #f8fafc; border-radius: 16px; border: 1px solid #f1f5f9;
        }
        .item-left { display: flex; align-items: center; gap: 12px; }
        .status-indicator { width: 4px; height: 24px; border-radius: 2px; background: var(--primary); }
        .item-date { display: block; font-size: 0.85rem; font-weight: 800; color: #1e293b; }
        .item-meta { display: block; font-size: 0.7rem; font-weight: 600; color: #94a3b8; }
        .item-right { text-align: right; }
        .item-amount { display: block; font-size: 1rem; font-weight: 900; color: #1e293b; }
        .paid-badge { font-size: 10px; font-weight: 900; color: var(--success); opacity: 0.8; }
        .empty-state {
          text-align: center; padding: 40px; background: #f8fafc; border-radius: 20px; border: 2px dashed #e2e8f0;
        }
        .spinner-primary {
          width: 24px; height: 24px; border: 3px solid rgba(var(--primary-rgb), 0.1);
          border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
