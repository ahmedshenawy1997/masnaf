"use client";

import { useLanguage } from '@/lib/LanguageContext';

export default function LeavesHeader() {
  const { t } = useLanguage();
  return (
    <div className="page-header mb-6">
      <h1 className="title">{t('leave_management')}</h1>
      <p className="subtitle">{t('leave_requests_desc')}</p>
    </div>
  );
}
