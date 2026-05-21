"use client";

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Close sidebar on navigation on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (status === 'loading') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100vh',
        background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
        gap: '20px',
      }}>
        {/* Logo icon */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '22px',
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          border: '1.5px solid rgba(255,255,255,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}>
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
            <path d="M7 2v20" />
            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
          </svg>
        </div>

        {/* Brand name */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            color: 'white',
            fontSize: '1.6rem',
            fontWeight: '800',
            margin: '0 0 4px',
            letterSpacing: '-0.5px',
            fontFamily: "'Cairo', sans-serif",
          }}>RestoHR</h1>
          <p style={{
            color: 'rgba(255,255,255,0.65)',
            fontSize: '0.85rem',
            fontWeight: '500',
            margin: 0,
            fontFamily: "'Cairo', sans-serif",
          }}>نظام إدارة الموارد البشرية</p>
        </div>

        {/* Spinner */}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '3px solid rgba(255,255,255,0.2)',
          borderTopColor: 'white',
          animation: 'spin 0.8s linear infinite',
          marginTop: '8px',
        }} />

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="app-layout">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40 }}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="app-main">
        <Header toggleSidebar={() => setSidebarOpen(true)} />
        <div className="app-content">
          {children}
        </div>
      </main>
    </div>
  );
}
