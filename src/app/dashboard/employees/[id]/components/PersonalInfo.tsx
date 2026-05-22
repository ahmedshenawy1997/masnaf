"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Phone, IdCard, MapPin, Calendar, Edit2, FileText, ExternalLink, KeyRound, Eye, EyeOff, X, ShieldCheck, User } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useRouter } from 'next/navigation';

function PasswordModal({ profile, onClose }: { profile: any; onClose: () => void }) {
  const [newPassword, setNewPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPwError('');
    setPwSaving(true);
    try {
      const res = await fetch(`/api/employees/${profile.id}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwSuccess(true);
        setTimeout(onClose, 1800);
      } else {
        setPwError(data.error || 'فشل تغيير كلمة المرور');
      }
    } catch {
      setPwError('خطأ في الاتصال، حاول مرة أخرى');
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'white', borderRadius: '24px', width: '100%', maxWidth: '420px',
        boxShadow: '0 30px 80px rgba(0,0,0,0.25)', direction: 'rtl', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '20px 22px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ width: '44px', height: '44px', background: '#fef3c7', color: '#d97706', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <KeyRound size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#1e293b' }}>تغيير كلمة المرور</h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
              {profile.fullName} — {profile.user?.username}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '22px' }}>
          {pwSuccess ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '20px 0', color: '#16a34a' }}>
              <ShieldCheck size={48} />
              <span style={{ fontWeight: 900, fontSize: '1.05rem' }}>تم تغيير كلمة المرور بنجاح</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Input */}
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="كلمة المرور الجديدة"
                  autoFocus
                  required
                  style={{
                    width: '100%', padding: '14px 48px 14px 16px',
                    border: '2px solid #e2e8f0', borderRadius: '14px',
                    fontSize: '1rem', fontWeight: 700, color: '#1e293b',
                    background: '#f8fafc', outline: 'none', boxSizing: 'border-box',
                    fontFamily: 'inherit', textAlign: 'right',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#f59e0b')}
                  onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', padding: '4px' }}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
                8 أحرف على الأقل، يحتوي على حرفين إنجليزيين
              </p>

              {pwError && (
                <div style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px 14px', fontSize: '0.85rem', fontWeight: 700 }}>
                  {pwError}
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit' }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={pwSaving}
                  style={{ flex: 2, padding: '13px', borderRadius: '12px', border: 'none', background: pwSaving ? '#d1d5db' : 'linear-gradient(135deg,#f59e0b,#d97706)', color: 'white', fontWeight: 900, fontSize: '0.95rem', cursor: pwSaving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {pwSaving ? (
                    <span style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  ) : 'حفظ كلمة المرور'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function PersonalInfo({ profile, isAdmin }: { profile: any; isAdmin: boolean }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/employees/${profile.id}`, { method: 'PATCH', body: formData });
      const data = await res.json();
      if (res.ok) { setIsEditing(false); router.refresh(); }
      else alert(`Error: ${data.error || 'Failed to update'}`);
    } catch { alert('Connection error'); }
    finally { setSaving(false); }
  }

  return (
    <div className="card-standard">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 className="section-title-custom" style={{ margin: 0 }}>
          <IdCard className="text-primary" size={20} />
          {t('personal_info')}
        </h2>
        {!isEditing && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {isAdmin && (
              <button
                onClick={() => setShowPwModal(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#fef3c7', border: '1.5px solid #fcd34d', borderRadius: '10px', color: '#92400e', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}
              >
                <KeyRound size={14} />
                تغيير الباسورد
              </button>
            )}
            <button
              onClick={() => setIsEditing(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '10px', color: '#1d4ed8', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}
            >
              <Edit2 size={14} />
              تعديل
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="grid gap-4">
          <div className="form-group mb-0">
            <label className="form-label">{t('national_id')}</label>
            <input type="text" name="nationalId" defaultValue={profile.nationalId} className="form-input" required />
          </div>
          <div className="form-group mb-0">
            <label className="form-label">{t('phone_number')}</label>
            <input type="text" name="phoneNumber" defaultValue={profile.phoneNumber} className="form-input" required />
          </div>
          <div className="form-group mb-0">
            <label className="form-label">{t('address')}</label>
            <input type="text" name="address" defaultValue={profile.address} className="form-input" required />
          </div>
          {isAdmin && (
            <div className="form-group mb-0">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 900 }}>أدمن فقط</span>
                سعر الساعة (ر.س)
              </label>
              <input
                type="number"
                name="hourlyRate"
                defaultValue={profile.hourlyRate}
                step="0.01"
                min="0"
                className="form-input"
                style={{ fontWeight: 800, fontSize: '1rem' }}
              />
              <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>
                الراتب الشهري = ساعات العمل × سعر الساعة
              </p>
            </div>
          )}
          <div className="form-group mb-0">
            <label className="form-label">{t('id_photo')} (اختياري)</label>
            <input type="file" name="idPhoto" accept="image/*" className="form-input" />
          </div>
          <div className="form-group mb-0">
            <label className="form-label">{t('health_certificate')} (اختياري)</label>
            <input type="file" name="healthCertificate" accept="image/*" className="form-input" />
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline">{t('cancel')}</button>
            <button type="submit" disabled={saving} className="btn btn-primary">{saving ? t('loading') : t('save')}</button>
          </div>
        </form>
      ) : (
        <>
          <div className="info-list">
            <div className="info-item">
              <IdCard className="info-icon" size={18} />
              <div>
                <span className="section-label">{t('national_id')}</span>
                <span className="section-value">{profile.nationalId}</span>
              </div>
            </div>
            <div className="info-item">
              <Phone className="info-icon" size={18} />
              <div>
                <span className="section-label">{t('phone_number')}</span>
                <span className="section-value">{profile.phoneNumber}</span>
              </div>
            </div>
            <div className="info-item">
              <MapPin className="info-icon" size={18} />
              <div>
                <span className="section-label">{t('address')}</span>
                <span className="section-value">{profile.address}</span>
              </div>
            </div>
            <div className="info-item">
              <Calendar className="info-icon" size={18} />
              <div>
                <span className="section-label">{t('hiring_date')}</span>
                <span className="section-value">{new Date(profile.dateOfHiring).toLocaleDateString()}</span>
              </div>
            </div>
            {isAdmin && profile.user?.username && (
              <div className="info-item" style={{ background: '#fafaf7', border: '1px solid #fcd34d' }}>
                <User size={18} style={{ color: '#d97706', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <span className="section-label" style={{ color: '#92400e' }}>اسم المستخدم</span>
                  <span className="section-value" style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                    {profile.user.username}
                  </span>
                </div>
              </div>
            )}
          </div>

          {profile.idPhoto && (
            <div style={{ marginTop: '16px' }}>
              <span className="section-label" style={{ display: 'block', marginBottom: '8px' }}>{t('id_photo')}</span>
              <img
                src={profile.idPhoto}
                alt="ID Photo"
                onClick={() => window.open(profile.idPhoto, '_blank')}
                style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '16px', border: '1px solid #f1f5f9', cursor: 'pointer' }}
              />
            </div>
          )}

          {profile.healthCertificate && (
            <div style={{ marginTop: '20px' }}>
              <span className="section-label" style={{ display: 'block', marginBottom: '8px', color: '#16a34a', fontWeight: 900 }}>{t('health_certificate')}</span>
              {profile.healthCertificate.toLowerCase().endsWith('.pdf') ? (
                <a
                  href={profile.healthCertificate}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 20px', background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '14px', color: '#16a34a', fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none' }}
                >
                  <FileText size={20} />
                  <span>عرض الشهادة الصحية (PDF)</span>
                  <ExternalLink size={14} />
                </a>
              ) : (
                <img
                  src={profile.healthCertificate}
                  alt="Health Cert"
                  onClick={() => window.open(profile.healthCertificate, '_blank')}
                  style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '16px', border: '1px solid #bbf7d0', cursor: 'pointer' }}
                />
              )}
            </div>
          )}
        </>
      )}

      {/* Portal Modal */}
      {mounted && showPwModal && createPortal(
        <PasswordModal profile={profile} onClose={() => setShowPwModal(false)} />,
        document.body
      )}

      <style jsx>{`
        .card-standard { background: white; border-radius: 24px; padding: 24px; border: 1px solid var(--border); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
        .info-list { display: flex; flex-direction: column; gap: 12px; }
        .info-item { display: flex; gap: 16px; padding: 16px 20px; border-radius: 18px; background: #f8fafc; border: 1px solid transparent; transition: 0.2s; align-items: center; }
        .info-item:hover { border-color: #f1f5f9; background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        .info-icon { color: var(--primary); flex-shrink: 0; }
        .section-value { font-size: 1.1rem; font-weight: 700; color: #1e293b; display: block; line-height: 1.4; }
      `}</style>
    </div>
  );
}
