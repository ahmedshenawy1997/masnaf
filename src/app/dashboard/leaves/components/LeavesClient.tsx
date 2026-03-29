"use client";

import { useState } from 'react';
import LeaveSection from '../../employees/[id]/components/LeaveSection';
import { ChevronDown, ChevronRight, History, CalendarDays } from 'lucide-react';

const MONTH_NAMES_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

export default function LeavesClient({ allLeaves }: { allLeaves: any[] }) {
  const now = new Date();
  
  // Find earliest year in leaves, fallback to current year
  const validDates = allLeaves
    .map(l => new Date(l.startDate || l.createdAt).getTime())
    .filter(time => !isNaN(time));
    
  const startDate = validDates.length > 0 ? new Date(Math.min(...validDates)) : now;
  const startYear = startDate.getFullYear();
  const endYear = now.getFullYear();

  const years: number[] = [];
  for (let y = endYear; y >= startYear; y--) years.push(y);

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [openYear, setOpenYear] = useState(now.getFullYear());

  const handleSelect = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  const monthLabel = MONTH_NAMES_AR[selectedMonth - 1] + ' ' + selectedYear;

  const currentLeaves = allLeaves.filter(l => {
    const d = new Date(l.startDate || l.createdAt);
    return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
  });

  return (
    <div className="w-full mt-6" style={{ display: 'block' }}>
      
      {/* ARCHIVE WIDGET (Top) */}
      <div className="w-full mb-8" style={{ display: 'block', maxWidth: '800px', margin: '0 auto 2rem auto' }}>
        <div className="archive-widget">
          <div className="archive-title">
            <History size={18} />
            <span>سجل الإجازات (الأرشيف)</span>
          </div>
          <div className="archive-body">
            {years.map(year => (
              <div key={year} className="archive-year-block">
                <button
                  className={`archive-year-btn ${openYear === year ? 'open' : ''}`}
                  onClick={() => setOpenYear(openYear === year ? -1 : year)}
                >
                  <span className="year-num">{year}</span>
                  {openYear === year ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                {openYear === year && (
                  <div className="months-grid">
                    {MONTH_NAMES_AR.map((m, idx) => {
                      const mNum = idx + 1;
                      const isFuture = year === endYear && mNum > now.getMonth() + 1;
                      const isSelected = year === selectedYear && mNum === selectedMonth;
                      return (
                        <button
                          key={mNum}
                          disabled={isFuture}
                          onClick={() => handleSelect(year, mNum)}
                          className={`month-chip ${isSelected ? 'active' : ''} ${isFuture ? 'future' : ''}`}
                        >
                          {m}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* MAIN CONTENT (Current Month) */}
      <div className="w-full" style={{ display: 'block' }}>
        <div className="card shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-6 p-5 rounded-2xl bg-slate-50 border border-slate-100">
             <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <CalendarDays size={24} />
             </div>
             <div>
               <h3 className="font-bold text-xl m-0 text-slate-800">سجل شهر {monthLabel}</h3>
               <p className="text-sm text-slate-500 font-bold mt-1">يوجد {currentLeaves.length} طلب إجازة</p>
             </div>
          </div>
          
          <LeaveSection 
            profileId="all" 
            isAdmin={true} 
            leaves={currentLeaves} 
            hideHeader={true}
          />
        </div>
      </div>

      <style jsx>{`
        .archive-widget {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
        }
        .archive-title {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 18px 20px;
          background: #1e293b;
          color: #fff;
          font-size: 1.05rem;
          font-weight: 900;
          letter-spacing: 0.5px;
        }
        .archive-body {
          padding: 12px;
        }
        .archive-year-block {
          margin-bottom: 6px;
        }
        .archive-year-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-radius: 14px;
          border: none;
          background: #f8fafc;
          cursor: pointer;
          transition: 0.2s;
          font-weight: 900;
          color: #475569;
        }
        .archive-year-btn.open {
          background: #eff6ff;
          color: #1d4ed8;
        }
        .archive-year-btn:hover:not(.open) {
          background: #f1f5f9;
        }
        .year-num {
          font-size: 1.1rem;
        }
        .months-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          padding: 10px 4px;
        }
        .month-chip {
          padding: 10px 4px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #fff;
          font-size: 13px;
          font-weight: 800;
          color: #64748b;
          cursor: pointer;
          transition: 0.2s;
          text-align: center;
        }
        .month-chip:hover:not(.future):not(.active) {
          background: #f8fafc;
          border-color: #cbd5e1;
        }
        .month-chip.active {
          background: #1e293b;
          color: #fff;
          border-color: #1e293b;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .month-chip.future {
          opacity: 0.3;
          cursor: not-allowed;
          background: #f1f5f9;
        }
      `}</style>
    </div>
  );
}
