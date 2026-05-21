"use client";

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import { Globe, ChefHat } from 'lucide-react';
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
      {/* Language switcher — top corner */}
      <div className="login-lang-fix">
        <button
          className="lang-toggle-dark"
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
        >
          <Globe size={17} />
          <span>{language === 'en' ? 'عربي' : 'English'}</span>
        </button>
      </div>

      <div className="login-card">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-logo-icon">
            <ChefHat size={30} />
          </div>
          <h1 className="login-title">RestoHR</h1>
          <p className="login-subtitle">
            {language === 'ar' ? 'نظام إدارة الموارد البشرية' : 'HR Management System'}
          </p>
        </div>

        {/* Error */}
        {errorParam && (
          <div className="login-error">
            {errorParam === 'CredentialsSignin'
              ? (language === 'ar' ? 'خطأ في اسم المستخدم أو كلمة المرور' : 'Invalid username or password')
              : `Error: ${errorParam}`}
          </div>
        )}

        {/* Form */}
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
              placeholder={language === 'ar' ? 'أدخل اسم المستخدم' : 'Enter username'}
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
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '18px', height: '18px', borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white',
                  animation: 'loginSpin 0.7s linear infinite', display: 'inline-block'
                }} />
                {language === 'ar' ? 'جاري الدخول...' : 'Signing in...'}
              </span>
            ) : t('sign_in')}
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <Link href="/register">{t('register')}</Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes loginSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(145deg, #1E3A8A, #2563EB)'
      }}>
        <div style={{ color: 'white', fontSize: '1.2rem', fontFamily: 'Cairo, sans-serif', fontWeight: 700 }}>
          جاري التحميل...
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
