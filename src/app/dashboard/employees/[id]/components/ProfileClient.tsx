"use client";

import { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import AttendanceSection from './AttendanceSection';
import LeaveSection from './LeaveSection';
import DocumentsSection from './DocumentsSection';
import SalarySection from './SalarySection';
import MedicalSection from './MedicalSection';
import PenaltiesSection from './PenaltiesSection';
import PersonalInfo from './PersonalInfo';
import { ChevronDown, ChevronRight } from 'lucide-react';

const MONTH_NAMES_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH_NAMES_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const ARCHIVE_LABEL: Record<string, string> = { en: 'Period Archive', ar: 'أرشيف الفترات' };

export default function ProfileClient({
  profile,
  isAdmin,
  sessionUserId
}: {
  profile: any;
  isAdmin: boolean;
  sessionUserId: string;
}) {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const monthNames = isRTL ? MONTH_NAMES_AR : MONTH_NAMES_EN;

  const now = new Date();
  const hiringDate = profile.dateOfHiring ? new Date(profile.dateOfHiring) : null;
  const startYear = hiringDate ? hiringDate.getFullYear() : now.getFullYear() - 2;
  const endYear = now.getFullYear();

  // Build years list (reverse — newest first)
  const years: number[] = [];
  for (let y = endYear; y >= startYear; y--) years.push(y);

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [openYear, setOpenYear] = useState(now.getFullYear());

  const viewDate = new Date(selectedYear, selectedMonth - 1, 1);

  const handleSelect = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  const monthLabel = monthNames[selectedMonth - 1] + ' ' + selectedYear;

  return (
    <div className="profile-grid">
      {/* SIDEBAR */}
      <div className="profile-sidebar">
        <div className="sticky-sidebar">

          {/* YEAR/MONTH ARCHIVE */}
          {isAdmin && (
            <div className="archive-widget mb-6">
              <div className="archive-title">
                <span>🗂</span>
                <span>{ARCHIVE_LABEL[language] || ARCHIVE_LABEL.en}</span>
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
                        {monthNames.map((m, idx) => {
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
          )}

          {/* PERSONAL INFO */}
          <PersonalInfo profile={profile} isAdmin={isAdmin} />

          {/* SALARY */}
          <div className="mt-6">
            <SalarySection
              profile={profile}
              isAdmin={isAdmin}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="profile-main">
        <div className="tabs-container">

          {/* Period Banner (Removed as requested) */}

          <section id="attendance" className="card mb-6">
            <AttendanceSection
              profileId={profile.id}
              isReadOnly={!isAdmin && profile.userId !== sessionUserId}
              hiringDate={profile.dateOfHiring}
              externalViewDate={viewDate}
              onChangeMonth={(offset) => {
                const d = new Date(viewDate);
                d.setMonth(d.getMonth() + offset);
                setSelectedMonth(d.getMonth() + 1);
                setSelectedYear(d.getFullYear());
                setOpenYear(d.getFullYear());
              }}
            />
          </section>

          <section id="documents" className="card mb-6">
            <DocumentsSection
              profileId={profile.id}
              isAdmin={isAdmin}
              documents={profile.documents || []}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          </section>

          <section id="leaves" className="card mb-6">
            <LeaveSection
              profileId={profile.id}
              isAdmin={isAdmin}
              leaves={profile.leaveRequests || []}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          </section>

          <section id="medical" className="card mb-6">
            <MedicalSection
              profileId={profile.id}
              isAdmin={isAdmin}
              reports={profile.medicalReports || []}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          </section>

          <section id="penalties" className="card mb-6">
            <PenaltiesSection
              profileId={profile.id}
              isAdmin={isAdmin}
              penalties={profile.penalties || []}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          </section>
        </div>
      </div>

      <style jsx>{`
        /* Archive Widget */
        .archive-widget {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          overflow: hidden;
        }
        .archive-title {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 16px;
          background: #1e293b;
          color: #fff;
          font-size: 0.9rem;
          font-weight: 900;
          letter-spacing: 0.5px;
        }
        .archive-body {
          padding: 8px;
        }
        .archive-year-block {
          margin-bottom: 4px;
        }
        .archive-year-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border-radius: 12px;
          border: none;
          background: #f8fafc;
          cursor: pointer;
          transition: 0.15s;
          font-weight: 900;
          color: #475569;
        }
        .archive-year-btn.open {
          background: #eff6ff;
          color: #1d4ed8;
        }
        .archive-year-btn:hover {
          background: #f1f5f9;
        }
        .year-num {
          font-size: 1rem;
          font-weight: 900;
        }
        .months-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4px;
          padding: 8px 4px;
        }
        .month-chip {
          padding: 7px 4px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #fff;
          font-size: 11px;
          font-weight: 800;
          color: #64748b;
          cursor: pointer;
          transition: 0.15s;
          text-align: center;
        }
        .month-chip:hover:not(.future):not(.active) {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }
        .month-chip.active {
          background: #1e293b;
          color: #fff;
          border-color: #1e293b;
        }
        .month-chip.future {
          opacity: 0.3;
          cursor: not-allowed;
        }

        /* Period Banner */
        .period-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 10px 16px;
          font-size: 0.85rem;
          color: #475569;
        }
        .period-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #3b82f6;
          flex-shrink: 0;
        }
        .period-text {
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
