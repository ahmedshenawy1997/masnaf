"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import { Globe, ArrowLeft, Upload, UserPlus, Check, X, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import './register.css';

export default function RegisterPage() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    jobTitle: '',
    phoneNumber: '',
    nationalId: '',
    address: '',
  });
  
  const [idFile, setIdFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when typing
    if (fieldErrors[e.target.name]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[e.target.name];
        return next;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdFile(e.target.files[0]);
      if (fieldErrors.idPhoto) {
        setFieldErrors(prev => ({ ...prev, idPhoto: '' }));
      }
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    setGeneralError('');

    const errors: Record<string, string> = {};

    // --- Client Side Validation ---
    ['username', 'password', 'fullName', 'nationalId', 'address'].forEach(field => {
       const err = validateField(field, (formData as any)[field]);
       if (err) errors[field] = err;
    });

    if (!idFile) {
      errors['idPhoto'] = t('error_id_photo_required');
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    if (idFile) data.append('idPhoto', idFile);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();

      if (res.ok) {
        router.push('/login?registered=true');
      } else {
        if (result.error?.toLowerCase().includes('username')) {
           setFieldErrors({ username: result.error });
        } else if (result.error?.toLowerCase().includes('national id')) {
           setFieldErrors({ nationalId: result.error });
        } else {
           setGeneralError(result.error || 'Registration failed');
        }
      }
    } catch (err) {
      setGeneralError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const ErrorLabel = ({ message }: { message?: string }) => {
    if (!message) return null;
    return (
      <div className="field-error-msg-reg">
        <AlertCircle size={12} />
        <span>{message}</span>
      </div>
    );
  };

  return (
    <div className="register-container">
      <div className="register-header-fix">
        <Link href="/login" className="back-link">
          <ArrowLeft size={18} />
          <span>{t('sign_in')}</span>
        </Link>
        <button 
          className="lang-toggle-dark" 
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
        >
          <Globe size={18} />
          <span>{language === 'en' ? 'عربي' : 'English'}</span>
        </button>
      </div>

      <div className="register-card card shadow-xl">
        <div className="register-title-area">
          <div className="register-icon">
            <UserPlus size={24} />
          </div>
          <h1 className="register-title">{t('register')}</h1>
          <p className="register-subtitle">{t('register_title')}</p>
        </div>

        {generalError && (
            <div className="error-alert p-4 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center gap-3 mb-6">
               <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                  <X size={20} />
               </div>
               <p className="text-sm font-bold text-red-700">{generalError}</p>
            </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-sections">
            <div className="form-section">
              <h3 className="section-label-reg">{t('account_details')}</h3>
              <div className="form-group mb-4">
                <label className="form-label">{t('username')}</label>
                <input
                  name="username"
                  type="text"
                  className={`form-input ${fieldErrors.username ? 'error' : ''}`}
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Min 8 chars, 2 letters"
                  required
                />
                <ErrorLabel message={fieldErrors.username} />
              </div>
              <div className="form-group mb-4">
                <label className="form-label">{t('password')}</label>
                <input
                  name="password"
                  type="password"
                  className={`form-input ${fieldErrors.password ? 'error' : ''}`}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 8 chars, 2 letters"
                  required
                />
                <ErrorLabel message={fieldErrors.password} />
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-label-reg">{t('personal_info')}</h3>
              <div className="register-grid">
                <div className="form-group col-span-2">
                  <label className="form-label">{t('full_name')}</label>
                  <input
                    name="fullName"
                    type="text"
                    className={`form-input ${fieldErrors.fullName ? 'error' : ''}`}
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                  <ErrorLabel message={fieldErrors.fullName} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('job_title')}</label>
                  <input
                    name="jobTitle"
                    type="text"
                    className="form-input"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('phone_number')}</label>
                  <input
                    name="phoneNumber"
                    type="text"
                    className="form-input"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('national_id')}</label>
                  <input
                    name="nationalId"
                    type="text"
                    className={`form-input ${fieldErrors.nationalId ? 'error' : ''}`}
                    value={formData.nationalId}
                    onChange={handleChange}
                    required
                  />
                  <ErrorLabel message={fieldErrors.nationalId} />
                </div>
              </div>
              <div className="form-group mt-4">
                <label className="form-label">{t('address')}</label>
                <input
                  name="address"
                  type="text"
                  className={`form-input ${fieldErrors.address ? 'error' : ''}`}
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
                <ErrorLabel message={fieldErrors.address} />
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-label-reg">{t('id_photo')}</h3>
              <div className="file-upload-area-custom">
                <input
                  type="file"
                  id="idPhoto"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  accept="image/*"
                  required
                />
                <label htmlFor="idPhoto" className={`file-upload-label-reg ${idFile ? 'has-file' : ''} ${fieldErrors.idPhoto ? 'error' : ''}`}>
                  {idFile ? <Check size={24} className="text-success" /> : <Upload size={24} />}
                  <div className="flex flex-col text-start">
                     <span className="font-bold">{idFile ? idFile.name : t('id_upload_help')}</span>
                     {idFile && <span className="text-xs text-muted">Click to change</span>}
                  </div>
                </label>
                <ErrorLabel message={fieldErrors.idPhoto} />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full register-btn-p" disabled={loading}>
            {loading ? t('loading') : t('register')}
          </button>
        </form>

        <div className="register-footer-p mt-6">
          <Link href="/login" className="text-sm font-bold text-slate-400 hover:text-primary transition-colors">
            {t('already_have_account')}
          </Link>
        </div>
      </div>

      <style jsx>{`
        .register-btn-p {
           padding: 16px; border-radius: 18px; font-weight: 900;
           text-transform: uppercase; letter-spacing: 1px;
           box-shadow: 0 10px 25px rgba(var(--primary-rgb), 0.2);
           transition: 0.2s;
        }
        .register-btn-p:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(var(--primary-rgb), 0.3); }
        
        .file-upload-label-reg {
           display: flex; align-items: center; gap: 16px; padding: 20px;
           background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 18px;
           cursor: pointer; transition: 0.2s;
        }
        .file-upload-label-reg:hover { border-color: var(--primary); background: #f0f9ff; }
        .file-upload-label-reg.has-file { border-color: #10b981; background: #f0fdf4; border-style: solid; }
        .file-upload-label-reg.error { border-color: #ef4444; background: #fff1f2; }

        .form-input.error { border-color: #ef4444; background: #fff1f2; }
        
        .field-error-msg-reg {
          display: flex; align-items: center; gap: 4px; color: #ef4444; font-size: 0.75rem; font-weight: 800;
          margin-top: 6px; animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

        .register-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 640px) { .register-grid { grid-template-columns: 1fr 1fr; } .col-span-2 { grid-column: span 2; } }
        .register-footer-p { text-align: center; }
      `}</style>
    </div>
  );
}
