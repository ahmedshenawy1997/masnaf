"use client";

import { useState } from 'react';
import { Upload, File, Download, Trash2, Plus, Eye, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';

export default function DocumentsSection({ 
  profileId, 
  isAdmin, 
  documents,
  selectedMonth,
  selectedYear
}: { 
  profileId: string; 
  isAdmin: boolean;
  documents: any[];
  selectedMonth?: number;
  selectedYear?: number;
}) {
  const filteredDocuments = (selectedMonth && selectedYear)
    ? documents.filter(doc => {
        const d = new Date(doc.createdAt);
        return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
      })
    : documents;
  const router = useRouter();
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);
    formData.append('type', 'OTHER'); // Default, can be expanded

    try {
      const res = await fetch(`/api/employees/${profileId}/documents`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function deleteDocument(id: string) {
    if (!confirm(t('are_you_sure') || 'Are you sure?')) return;
    
    try {
      const res = await fetch(`/api/employees/${profileId}/documents?docId=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="title text-lg m-0">{t('documents_records')}</h2>
        {isAdmin && (
          <div className="file-upload-wrapper">
            <label className="btn btn-primary cursor-pointer">
              <Plus size={18} />
              <span>{t('upload_document')}</span>
              <input 
                type="file" 
                className="hidden" 
                onChange={handleUpload} 
                disabled={uploading} 
              />
            </label>
          </div>
        )}
      </div>

      {error && <div className="error-message mb-4">{error}</div>}
      {uploading && <div className="text-sm text-primary mb-4">{t('uploading_document')}</div>}

      <div className="grid gap-3">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-8 bg-background rounded-lg border border-dashed border-border text-muted">
            <File className="mx-auto mb-2 opacity-50" size={32} />
            <p>{t('no_documents')}</p>
          </div>
        ) : (
          filteredDocuments.map((doc) => (
            <div key={doc.id} className="document-item">
              <div className="flex items-center gap-3">
                <div className="doc-icon">
                  <File size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{doc.title}</span>
                  <span className="text-xs text-muted">{t('uploaded')} {new Date(doc.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPreviewUrl(doc.fileUrl)} 
                  className="btn-icon text-primary" 
                  title="Preview"
                >
                  <Eye size={18} />
                </button>
                <a 
                  href={doc.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-icon" 
                  title="Download"
                >
                  <Download size={18} />
                </a>
                {isAdmin && (
                  <button 
                    onClick={() => deleteDocument(doc.id)} 
                    className="btn-icon text-danger" 
                    title={t('delete')}
                  >
                    <Trash2 size={18} />
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
        .cursor-pointer { cursor: pointer; }
        .text-lg { font-size: 1.125rem; }
        .m-0 { margin: 0; }
        .document-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          transition: var(--transition);
        }
        .document-item:hover {
          border-color: var(--primary);
          background: var(--surface);
        }
        .doc-icon {
          width: 40px;
          height: 40px;
          background: rgba(var(--primary-rgb), 0.1);
          color: var(--primary);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .btn-icon {
          padding: 0.5rem;
          border-radius: var(--radius-md);
          color: var(--text-muted);
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          cursor: pointer;
        }
        .btn-icon:hover {
          background: var(--border);
          color: var(--foreground);
        }
        .btn-icon.text-danger:hover {
          background: rgba(239, 68, 68, 0.1);
          color: var(--danger);
        }
        .error-message {
          color: var(--danger);
          background: rgba(239, 68, 68, 0.1);
          padding: 0.75rem;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          border: 1px solid rgba(239, 68, 68, 0.2);
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
