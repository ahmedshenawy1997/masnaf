import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, FileText, LogOut, FileImage, DollarSign, ChefHat } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useLanguage } from '@/lib/LanguageContext';
import './Sidebar.css';

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useLanguage();
  const role = session?.user?.role || 'EMPLOYEE';
  const [pendingLeaves, setPendingLeaves] = useState(0);

  useEffect(() => {
    if (role === 'SUPERADMIN' || role === 'ADMIN') {
      fetch('/api/leaves/pending-count')
        .then(res => res.json())
        .then(data => {
          if (data.count) setPendingLeaves(data.count);
        })
        .catch(console.error);
    }
  }, [role, pathname]);

  const menuItems: any[] = [
    { key: 'dashboard',    label: t('dashboard'),    icon: Home,       href: '/dashboard' },
  ];

  if (role === 'SUPERADMIN' || role === 'ADMIN') {
    menuItems.push(
      { key: 'employees',    label: t('employees'),          icon: Users,      href: '/dashboard/employees' },
      { key: 'leaves',       label: t('leaves'),             icon: FileImage,  href: '/dashboard/leaves', badge: pendingLeaves },
      { key: 'payroll',      label: t('payroll_management'), icon: DollarSign, href: '/dashboard/payroll' },
      { key: 'reports',      label: t('reports'),            icon: FileText,   href: '/dashboard/reports' }
    );
  } else {
    if (session?.user?.id) {
      menuItems.push(
        { key: 'personal_info', label: t('personal_info'), icon: Users, href: `/dashboard/employees/${session.user.id}` }
      );
    }
  }

  return (
    <aside className={`sidebar app-sidebar ${isOpen ? 'open' : ''}`}>

      {/* ── Logo Header ── */}
      <div className="sidebar-header">
        <div className="sidebar-logo-wrap">
          <div className="sidebar-logo-icon">
            <ChefHat size={20} color="white" />
          </div>
          <div>
            <h1 className="sidebar-title">RestoHR</h1>
            <p className="sidebar-subtitle">HR Management</p>
          </div>
        </div>
        <button className="sidebar-close" onClick={onClose}>×</button>
      </div>

      {/* ── Nav ── */}
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  data-item={item.key}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="sidebar-icon">
                      <Icon size={17} />
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="sidebar-badge">{item.badge > 99 ? '99+' : item.badge}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Footer / Logout ── */}
      <div className="sidebar-footer">
        <button
          className="sidebar-link sidebar-logout"
          style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          <span className="sidebar-icon">
            <LogOut size={17} />
          </span>
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
}
