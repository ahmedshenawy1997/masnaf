"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Phone, IdCard, MapPin, Briefcase, DollarSign, Calendar, Camera, Upload, Check, X, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function EmployeeForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [healthPreview, setHealthPreview] = useState<string | null>(null);

  const validateField = (name: string, value: string) => {
    if (name === 'username' || name === 'password') {
      if (value.length < 8) return t(`error_${name}_length`);
      const letters = (value.match(/[a-zA-Z]/g) || []).length;
      if (letters < 2) return t('error_min_letters');
    }
    if (name === 'fullName' && !value.trim()) return t('full_name_required');
    if (name === 'nationalId' && !value.trim()) return t('required');
    if (name === 'address' && !value.trim()) return t('required');
    return '';
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    setGeneralError('');

    const formData = new FormData(e.currentTarget);
    const errors: Record<string, string> = {};

    // Validate fields
    ['username', 'password', 'fullName', 'nationalId', 'address'].forEach(field => {
      const val = (formData.get(field) as string) || '';
      const err = validateField(field, val);
      if (err) errors[field] = err;
    });

    const idPhotoFile = formData.get('idPhoto') as File | null;
    if (!idPhotoFile || idPhotoFile.size === 0) {
      errors['idPhoto'] = t('error_id_photo_required');
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error?.toLowerCase().includes('username')) {
           setFieldErrors({ username: data.error });
        } else if (data.error?.toLowerCase().includes('national id')) {
           setFieldErrors({ nationalId: data.error });
        } else {
           setGeneralError(data.error || 'Something went wrong');
        }
        throw new Error(data.error);
      }

      router.push('/dashboard/employees');
      router.refresh();
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHealthFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHealthPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const ErrorLabel = ({ message }: { message?: string }) => {
    if (!message) return null;
    return (
      <div className="field-error-msg">
        <AlertCircle size={12} />
        <span>{message}</span>
      </div>
    );
  };

  return (
    <div className="card shadow-lg p-0 overflow-hidden rounded-3xl border-none">
      <form onSubmit={handleSubmit} className="employee-form bg-white">
        
        {/* Header decoration */}
        <div className="bg-primary/5 p-8 border-b border-primary/10">
          <h2 className="text-2xl font-black text-primary mb-2">{t('add_employee')}</h2>
          <p className="text-sm font-bold text-primary/40 uppercase tracking-widest">{t('register_title')}</p>
        </div>

        <div className="p-8 space-y-10">
          
          {/* Section 1: Credentials */}
          <div className="form-section">
            <h3 className="section-title-mod flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><User size={18}/></div>
              {t('account_credentials')}
            </h3>
            <div className="grid md-grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label-mod">{t('username')}</label>
                <input 
                  type="text" 
                  name="username" 
                  className={`form-input-mod ${fieldErrors.username ? 'error' : ''}`} 
                  required 
                  placeholder="min. 8 chars, 2 letters"
                />
                <ErrorLabel message={fieldErrors.username} />
              </div>
              <div className="form-group">
                <label className="form-label-mod">{t('password')}</label>
                <input 
                  type="password" 
                  name="password" 
                  className={`form-input-mod ${fieldErrors.password ? 'error' : ''}`} 
                  required 
                  placeholder="min. 8 chars, 2 letters"
                />
                <ErrorLabel message={fieldErrors.password} />
              </div>
            </div>
          </div>

          {/* Section 2: Personal */}
          <div className="form-section">
            <h3 className="section-title-mod flex items-center gap-2 mb-6">
               <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><IdCard size={18}/></div>
               {t('personal_info')}
            </h3>
            <div className="grid md-grid-cols-2 gap-6">
              <div className="form-group col-span-2">
                <label className="form-label-mod">{t('full_name')}</label>
                <input type="text" name="fullName" className={`form-input-mod ${fieldErrors.fullName ? 'error' : ''}`} required placeholder={t('full_name')} />
                <ErrorLabel message={fieldErrors.fullName} />
              </div>
              <div className="form-group">
                <label className="form-label-mod">{t('job_title')}</label>
                <input type="text" name="jobTitle" className="form-input-mod" required placeholder="e.g. Head Chef" />
              </div>
              <div className="form-group">
                <label className="form-label-mod">{t('phone_number')}</label>
                <input type="text" name="phoneNumber" className="form-input-mod" required placeholder="+123..." />
              </div>
              <div className="form-group">
                <label className="form-label-mod">{t('national_id')}</label>
                <input type="text" name="nationalId" className={`form-input-mod ${fieldErrors.nationalId ? 'error' : ''}`} required placeholder="ID Number" />
                <ErrorLabel message={fieldErrors.nationalId} />
              </div>
              <div className="form-group">
                 <label className="form-label-mod">{t('hiring_date')}</label>
                 <input type="date" name="dateOfHiring" className="form-input-mod" required />
              </div>
              <div className="form-group col-span-2">
                <label className="form-label-mod">{t('address')}</label>
                <div className="relative">
                   <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                   <input type="text" name="address" className={`form-input-mod pl-12 ${fieldErrors.address ? 'error' : ''}`} required placeholder={t('address')} />
                </div>
                <ErrorLabel message={fieldErrors.address} />
              </div>
            </div>
          </div>

          {/* Section 3: Salary */}
          <div className="form-section">
            <h3 className="section-title-mod flex items-center gap-2 mb-6">
               <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><DollarSign size={18}/></div>
               {t('work_salary')}
            </h3>
            <div className="form-group max-w-xs">
              <label className="form-label-mod">{t('hourly_rate')}</label>
              <input type="number" step="0.01" name="hourlyRate" className="form-input-mod" required placeholder="0.00" />
            </div>
          </div>

          {/* Section 4: DOCUMENTS UPLOAD */}
          <div className="grid md-grid-cols-2 gap-10">
            {/* ID PHOTO */}
            <div className="form-section">
              <h3 className="section-title-mod flex items-center gap-2 mb-6">
                 <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Camera size={18}/></div>
                 {t('id_photo')}
              </h3>
              <div className="upload-container">
                 <label className={`upload-zone ${preview ? 'has-preview' : ''} ${fieldErrors.idPhoto ? 'error' : ''}`}>
                    <input type="file" name="idPhoto" style={{ display: 'none' }} accept="image/*" required onChange={handleFileChange} />
                    {preview ? (
                      <img src={preview} alt="ID Preview" className="upload-preview" />
                    ) : (
                      <div className="upload-placeholder">
                         <Upload size={32} className="text-primary mb-2" />
                         <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">{t('id_upload_help')}</span>
                      </div>
                    )}
                 </label>
                 <ErrorLabel message={fieldErrors.idPhoto} />
              </div>
            </div>

            {/* HEALTH CERTIFICATE */}
            <div className="form-section">
              <h3 className="section-title-mod flex items-center gap-2 mb-6">
                 <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600"><Check size={18}/></div>
                 {t('health_certificate')}
              </h3>
              <div className="upload-container">
                 <label className={`upload-zone ${healthPreview ? 'has-preview' : ''}`}>
                    <input type="file" name="healthCertificate" style={{ display: 'none' }} accept="image/*" onChange={handleHealthFileChange} />
                    {healthPreview ? (
                      <img src={healthPreview} alt="Health Preview" className="upload-preview" />
                    ) : (
                      <div className="upload-placeholder">
                         <Upload size={32} className="text-green-600 mb-2" />
                         <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">{t('health_upload_help')}</span>
                      </div>
                    )}
                 </label>
              </div>
            </div>
          </div>

          {generalError && (
            <div className="error-alert p-4 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                  <X size={20} />
               </div>
               <p className="text-sm font-bold text-red-700">{generalError}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-4 pt-6">
            <button type="button" onClick={() => router.back()} className="text-sm font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">
              {t('cancel')}
            </button>
            <button type="submit" className="btn-submit-premium" disabled={loading}>
              {loading ? t('loading') : t('create_employee')}
            </button>
          </div>
        </div>
      </form>

      <style jsx>{`
        .section-title-mod { font-size: 1.1rem; font-weight: 900; color: #1e293b; }
        .form-label-mod { display: block; font-size: 0.85rem; font-weight: 900; color: #64748b; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 1.2px; }
        .form-input-mod {
          width: 100%; padding: 16px 20px; background: #f8fafc; border: 2px solid #f1f5f9; border-radius: 18px;
          font-weight: 700; color: #1e293b; transition: 0.2s; outline: none;
        }
        .form-input-mod:focus { border-color: var(--primary); background: white; box-shadow: 0 4px 20px rgba(var(--primary-rgb), 0.1); }
        .form-input-mod.error { border-color: #ef4444; background: #fff1f2; }
        
        .field-error-msg {
          display: flex; align-items: center; gap: 4px; color: #ef4444; font-size: 0.7rem; font-weight: 800;
          margin-top: 6px; animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

        .upload-zone {
          display: block; width: 100%; height: 200px; border: 2px dashed #e2e8f0; border-radius: 24px;
          background: #f8fafc; cursor: pointer; transition: 0.2s; position: relative; overflow: hidden;
        }
        .upload-zone:hover { border-color: var(--primary); background: #f0f9ff; }
        .upload-zone.has-preview { border-style: solid; }
        .upload-zone.error { border-color: #ef4444; background: #fff1f2; }
        
        .upload-placeholder { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; }
        .upload-preview { width: 100%; height: 100%; object-fit: cover; }
        
        .btn-submit-premium {
          padding: 16px 40px; border-radius: 20px; background: var(--primary); color: white;
          font-weight: 950; text-transform: uppercase; letter-spacing: 1px; border: none;
          cursor: pointer; box-shadow: 0 10px 25px rgba(var(--primary-rgb), 0.3); transition: 0.3s;
        }
        .btn-submit-premium:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(var(--primary-rgb), 0.4); }
        .btn-submit-premium:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }
        
        .md-grid-cols-2 { display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 768px) { .md-grid-cols-2 { grid-template-columns: 1fr 1fr; } .col-span-2 { grid-column: span 2; } }
      `}</style>
    </div>
  );
}
