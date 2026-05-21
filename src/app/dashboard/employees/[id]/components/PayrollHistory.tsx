"use client";

import { useState, useEffect } from 'react';
import { History as HistoryIcon, Clock, Award, TrendingDown, CreditCard, FileText } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

const MONTH_NAMES_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

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
    <div className="payroll-history-wrap">
      <div className="ph-header">
        <HistoryIcon size={16} />
        <span>سجل الرواتب</span>
      </div>

      {loading ? (
        <div className="ph-loading"><div className="ph-spinner" /></div>
      ) : history.length === 0 ? (
        <div className="ph-empty">
          <HistoryIcon size={32} strokeWidth={1} />
          <p>لا يوجد سجل رواتب لهذه الفترة</p>
        </div>
      ) : (
        <div className="ph-list">
          {history.map((record: any) => {
            const monthName = MONTH_NAMES_AR[(record.month ?? 1) - 1];
            return (
              <div key={record.id} className="ph-record">
                {/* Top: period + status */}
                <div className="ph-record-header">
                  <div className="ph-period-badge">
                    {monthName} {record.year}
                  </div>
                  <div className="ph-paid-badge">✓ مدفوع</div>
                </div>

                {/* Net amount — big */}
                <div className="ph-net-amount">
                  {(record.netAmount || 0).toFixed(0)}
                  <span className="ph-currency">ر.س</span>
                </div>

                {/* Breakdown */}
                <div className="ph-breakdown">
                  <div className="ph-break-item">
                    <Clock size={12} />
                    <span>{(record.totalHours || 0).toFixed(1)} ساعة</span>
                  </div>
                  <div className="ph-break-item base">
                    <span>أساسي: {((record.totalHours || 0) * (record.hourlyRate || 0)).toFixed(0)} ر.س</span>
                  </div>
                  {record.bonus > 0 && (
                    <div className="ph-break-item green">
                      <Award size={12} />
                      <span>+{record.bonus.toFixed(0)} مكافأة</span>
                    </div>
                  )}
                  {record.deductions > 0 && (
                    <div className="ph-break-item red">
                      <TrendingDown size={12} />
                      <span>−{record.deductions.toFixed(0)} خصم</span>
                    </div>
                  )}
                  {record.advance > 0 && (
                    <div className="ph-break-item orange">
                      <CreditCard size={12} />
                      <span>−{record.advance.toFixed(0)} سلفة</span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {record.notes && (
                  <div className="ph-notes">
                    <FileText size={11} />
                    <span>{record.notes}</span>
                  </div>
                )}

                {/* Payment date */}
                <div className="ph-date">
                  تاريخ الدفع: {new Date(record.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .payroll-history-wrap { padding: 4px; }

        .ph-header {
          display: flex; align-items: center; gap: 8px;
          font-size: 0.75rem; font-weight: 800; color: #94a3b8;
          text-transform: uppercase; letter-spacing: 0.8px;
          margin-bottom: 14px;
        }

        .ph-loading { display: flex; justify-content: center; padding: 32px; }
        .ph-spinner {
          width: 28px; height: 28px; border-radius: 50%;
          border: 3px solid #f1f5f9; border-top-color: #3b82f6;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .ph-empty {
          text-align: center; padding: 36px 16px;
          background: #f8fafc; border-radius: 16px;
          border: 2px dashed #e2e8f0;
          color: #cbd5e1; font-size: 0.82rem; font-weight: 700;
          display: flex; flex-direction: column; align-items: center; gap: 10px;
        }

        .ph-list { display: flex; flex-direction: column; gap: 10px; }

        .ph-record {
          background: white; border: 1.5px solid #f1f5f9;
          border-radius: 18px; padding: 16px;
          transition: box-shadow 0.2s, border-color 0.2s;
        }
        .ph-record:hover { border-color: #e2e8f0; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }

        .ph-record-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 10px;
        }
        .ph-period-badge {
          font-size: 0.75rem; font-weight: 800; color: #475569;
          background: #f1f5f9; border-radius: 8px; padding: 3px 10px;
        }
        .ph-paid-badge {
          font-size: 0.68rem; font-weight: 800; color: #16a34a;
          background: #dcfce7; border-radius: 8px; padding: 3px 8px;
        }

        .ph-net-amount {
          font-size: 1.8rem; font-weight: 900; color: #1e293b;
          line-height: 1; margin-bottom: 10px;
          display: flex; align-items: baseline; gap: 6px;
        }
        .ph-currency { font-size: 0.9rem; font-weight: 700; color: #64748b; }

        .ph-breakdown {
          display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px;
        }
        .ph-break-item {
          display: flex; align-items: center; gap: 4px;
          font-size: 0.72rem; font-weight: 700; color: #64748b;
          background: #f8fafc; border-radius: 7px; padding: 3px 8px;
        }
        .ph-break-item.base { background: #eff6ff; color: #3b82f6; }
        .ph-break-item.green { background: #f0fdf4; color: #16a34a; }
        .ph-break-item.red { background: #fef2f2; color: #dc2626; }
        .ph-break-item.orange { background: #fffbeb; color: #d97706; }

        .ph-notes {
          display: flex; align-items: flex-start; gap: 5px;
          font-size: 0.72rem; color: #94a3b8; font-weight: 600;
          background: #f8fafc; border-radius: 8px; padding: 6px 10px;
          margin-bottom: 6px; line-height: 1.4;
        }

        .ph-date {
          font-size: 0.68rem; color: #cbd5e1; font-weight: 600;
          text-align: left; direction: rtl;
        }
      `}</style>
    </div>
  );
}
