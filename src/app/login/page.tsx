"use client";

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import { Globe } from 'lucide-react';
import Link from 'next/link';
import './login.css';

function LoginForm() {
  const { t, language, setLanguage } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    signIn('credentials', {
      username,
      password,
      callbackUrl: '/dashboard',
    });
  };

  return (
    <div className="login-container">
      <div className="login-lang-fix">
        <button 
          className="lang-toggle-dark" 
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
        >
          <Globe size={18} />
          <span>{language === 'en' ? 'عربي' : 'English'}</span>
        </button>
      </div>

      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">R</div>
          <h1 className="login-title">RestoHR</h1>
          <p className="login-subtitle">{t('sign_in')}</p>
        </div>

        {errorParam && (
          <div className="login-error">
            {errorParam === 'CredentialsSignin'
              ? (language === 'ar' ? 'خطأ في اسم المستخدم أو كلمة المرور' : 'Invalid username or password')
              : `Error: ${errorParam}`}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">{t('username')}</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('password')}</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary w-full login-submit" disabled={loading}>
            {loading
              ? <span style={{ display:'flex', alignItems:'center', gap:'0.5rem', justifyContent:'center' }}>
                  <span className="spinner spinner-sm" style={{ borderTopColor:'#fff', borderColor:'rgba(255,255,255,0.3)' }} />
                  {t('loading')}
                </span>
              : t('sign_in')}
          </button>
        </form>

        <div className="login-footer">
          <Link href="/register">{t('register')}</Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
