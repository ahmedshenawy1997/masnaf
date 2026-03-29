"use client";

import { useState } from 'react';
import { Stethoscope, FileText, Plus, Download, Trash2, Upload, Eye, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';

export default function MedicalSection({ 
  profileId, 
  isAdmin, 
  reports,
  selectedMonth,
  selectedYear
}: { 
  profileId: string; 
  isAdmin: boolean;
  reports: any[];
  selectedMonth?: number;
  selectedYear?: number;
}) {
  const filteredReports = (selectedMonth && selectedYear)
    ? reports.filter(r => {
        const d = new Date(r.createdAt);
        return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
      })
    : reports;
  const router = useRouter();
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);

    try {
      const res = await fetch(`/api/employees/${profileId}/medical`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) router.refresh();
    } finally {
      setUploading(false);
    }
  }

  async function deleteReport(id: string) {
    if (!confirm('Are you sure?')) return;
    const res = await fetch(`/api/employees/${profileId}/medical?reportId=${id}`, {
      method: 'DELETE',
    });
    if (res.ok) router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-title-custom m-0">
          <Stethoscope className="text-danger" size={22} />
          {t('medical_reports')}
        </h2>
        <label className="btn btn-outline btn-sm cursor-pointer">
          {uploading ? <div className="spinner-small" /> : <Upload size={16} />}
          <span>{uploading ? t('loading') : t('upload_report')}</span>
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      <div className="grid gap-3">
        {filteredReports.length === 0 ? (
          <p className="text-center py-4 text-muted bg-background rounded border border-dashed">{t('no_history')}</p>
        ) : (
          filteredReports.map((report) => (
            <div key={report.id} className="report-item">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-muted" />
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{report.title}</span>
                  <span className="text-xs text-muted">{new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setPreviewUrl(report.fileUrl)} className="btn-icon text-primary" title="Preview">
                  <Eye size={16} />
                </button>
                <a href={report.fileUrl} target="_blank" className="btn-icon" title="Download">
                  <Download size={16} />
                </a>
                {isAdmin && (
                  <button onClick={() => deleteReport(report.id)} className="btn-icon text-danger">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {previewUrl && (
        <div className="preview-modal-overlay" onClick={() => setPreviewUrl(null)}>
          <div className="preview-modal-content" onClick={e => e.stopPropagation()}>
            <div className="preview-header">
              <h3 className="m-0 text-primary">Preview</h3>
              <button className="btn-icon text-danger" onClick={() => setPreviewUrl(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="preview-body">
              {previewUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Preview" className="preview-img" />
              ) : (
                <iframe src={previewUrl} className="preview-iframe" title="Document Preview" />
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .hidden { display: none; }
        .text-lg { font-size: 1.125rem; }
        .m-0 { margin: 0; }
        .report-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
        }
        .btn-icon {
          padding: 0.4rem;
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          cursor: pointer;
          border: none;
          background: transparent;
        }
        .btn-icon:hover { background: var(--border); }
        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(0,0,0,0.1);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .preview-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 1.5rem;
          backdrop-filter: blur(4px);
        }
        .preview-modal-content {
          background: var(--surface);
          width: 100%;
          max-width: 800px;
          height: 85vh;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: var(--shadow-lg);
        }
        .preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border);
        }
        .preview-body {
          flex: 1;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 1rem;
        }
        .preview-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          border-radius: var(--radius-md);
        }
        .preview-iframe {
          width: 100%;
          height: 100%;
          border: none;
          background: white;
          border-radius: var(--radius-md);
        }
      `}</style>
    </div>
  );
}
