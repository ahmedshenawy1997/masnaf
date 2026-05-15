import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, CalendarDays, DollarSign, BarChart2, LogOut, User, X } from 'lucide-react';
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
        .then(data => { if (data.count) setPendingLeaves(data.count); })
        .catch(() => {});
    }
  }, [role, pathname]);

  type MenuItem = {
    label: string;
    icon: React.ElementType;
    href: string;
    exact?: boolean;
    badge?: number;
  };

  const adminItems: MenuItem[] = [
    { label: t('dashboard'),          icon: Home,         href: '/dashboard',            exact: true },
    { label: t('employees'),          icon: Users,        href: '/dashboard/employees' },
    { label: t('leaves'),             icon: CalendarDays, href: '/dashboard/leaves',     badge: pendingLeaves },
    { label: t('payroll_management'), icon: DollarSign,   href: '/dashboard/payroll' },
    { label: t('reports'),            icon: BarChart2,    href: '/dashboard/reports' },
  ];

  const employeeItems: MenuItem[] = [
    { label: t('dashboard'),     icon: Home, href: '/dashboard', exact: true },
    { label: t('personal_info'), icon: User, href: `/dashboard/employees/${session?.user?.id}` },
  ];

  const menuItems = (role === 'SUPERADMIN' || role === 'ADMIN') ? adminItems : employeeItems;

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : (pathname === href || pathname.startsWith(href + '/'));

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">R</div>
          <span className="sidebar-title">RestoHR</span>
        </div>
        <button className="sidebar-close" onClick={onClose} aria-label="Close sidebar">
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`sidebar-link ${active ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <Icon size={19} className="sidebar-icon" />
                  <span className="sidebar-link-label">{item.label}</span>
                  {(item.badge ?? 0) > 0 && (
                    <span className="sidebar-badge">{(item.badge ?? 0) > 99 ? '99+' : item.badge}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {(session?.user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{session?.user?.name || '...'}</span>
            <span className="sidebar-user-role">{role}</span>
          </div>
        </div>
        <button
          className="sidebar-link sidebar-logout"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          <LogOut size={18} className="sidebar-icon" />
          <span className="sidebar-link-label">{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
}
