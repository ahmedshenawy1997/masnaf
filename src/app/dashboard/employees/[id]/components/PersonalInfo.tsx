"use client";

import { useState } from 'react';
import { Phone, IdCard, MapPin, Calendar, Edit2, Check, X } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useRouter } from 'next/navigation';

export default function PersonalInfo({ profile, isAdmin }: { profile: any; isAdmin: boolean }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/employees/${profile.id}`, {
        method: 'PATCH',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setIsEditing(false);
        router.refresh();
      } else {
        alert(`Error: ${data.error || 'Failed to update'}`);
      }
    } catch (err: any) {
      console.error(err);
      alert('Connection error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card-standard">
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-title-custom m-0">
          <IdCard className="text-primary" size={20} />
          {t('personal_info')}
        </h2>
        {(!isEditing) && (
          <button onClick={() => setIsEditing(true)} className="btn-icon text-primary p-2 rounded-md hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200">
            <Edit2 size={16} />
          </button>
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
          <div className="form-group mb-0">
            <label className="form-label">{t('id_photo')} (Optional new photo)</label>
            <input type="file" name="idPhoto" accept="image/*" className="form-input" />
          </div>
          <div className="form-group mb-0">
            <label className="form-label">{t('health_certificate')} (Optional)</label>
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
          </div>

          {profile.idPhoto && (
            <div className="id-photo-section mt-4">
              <span className="section-label mb-2 block">{t('id_photo')}</span>
              <div className="id-photo-thumb">
                <img 
                  src={profile.idPhoto} 
                  alt="ID Photo" 
                  onClick={() => window.open(profile.idPhoto, '_blank')}
                  className="cursor-pointer hover:opacity-80 transition-opacity rounded-md border border-border"
                />
              </div>
            </div>
          )}

          {profile.healthCertificate && (
            <div className="health-cert-section mt-6">
              <span className="section-label mb-2 block font-black text-green-600">{t('health_certificate')}</span>
              <div className="id-photo-thumb">
                <img 
                  src={profile.healthCertificate} 
                  alt="Health Cert" 
                  onClick={() => window.open(profile.healthCertificate, '_blank')}
                  className="cursor-pointer hover:opacity-80 transition-opacity rounded-md border border-border-green-100"
                />
              </div>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .card-standard {
          background: white;
          border-radius: 24px;
          padding: 24px;
          border: 1px solid var(--border);
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
        }
        .info-list { display: flex; flex-direction: column; gap: 12px; }
        .info-item {
          display: flex; gap: 16px; padding: 16px 20px; border-radius: 18px; background: #f8fafc; border: 1px solid transparent; transition: 0.2s;
          align-items: center;
        }
        .info-item:hover { border-color: #f1f5f9; background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        .info-icon { color: var(--primary); flex-shrink: 0; }
        .section-title-mod { font-size: 1.1rem; font-weight: 900; color: #1e293b; }
        .form-label-mod { display: block; font-size: 0.85rem; font-weight: 900; color: #64748b; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 1.2px; }
        .section-value { font-size: 1.1rem; font-weight: 700; color: #1e293b; display: block; line-height: 1.4; }
        .id-photo-thumb img { width: 100%; max-height: 200px; object-fit: cover; border-radius: 16px; margin-top: 12px; border: 1px solid #f1f5f9; }
      `}</style>
    </div>
  );
}
