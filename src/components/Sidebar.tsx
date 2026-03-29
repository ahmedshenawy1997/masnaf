import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, FileText, Settings, LogOut, FileImage, DollarSign, Clock } from 'lucide-react';
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
    { label: t('dashboard'), icon: Home, href: '/dashboard' },
  ];

  if (role === 'SUPERADMIN' || role === 'ADMIN') {
    menuItems.push(
      { label: t('employees'), icon: Users, href: '/dashboard/employees' },
      { label: t('leaves'), icon: FileImage, href: '/dashboard/leaves', badge: pendingLeaves },
      { label: t('payroll_management'), icon: DollarSign, href: '/dashboard/payroll' },
      { label: t('reports'), icon: FileText, href: '/dashboard/reports' }
    );
  } else {
    if (session?.user?.id) {
      menuItems.push(
        { label: t('personal_info'), icon: Users, href: `/dashboard/employees/${session.user.id}` }
      );
    }
  }

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h1 className="sidebar-title">RestoHR</h1>
        <button className="sidebar-close" onClick={onClose}>×</button>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link href={item.href} className={`sidebar-link ${isActive ? 'active' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon size={20} className="sidebar-icon" />
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

      <div className="sidebar-footer">
        <button className="sidebar-link sidebar-logout" onClick={() => signOut({ callbackUrl: '/login' })}>
          <LogOut size={20} className="sidebar-icon" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
}
