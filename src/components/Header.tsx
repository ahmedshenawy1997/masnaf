import { Menu, Globe } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/lib/LanguageContext';
import './Header.css';

const ROLE_LABELS: Record<string, { ar: string; en: string; color: string }> = {
  SUPERADMIN: { ar: 'مدير عام',   en: 'Super Admin', color: '#8b5cf6' },
  ADMIN:      { ar: 'مدير',       en: 'Admin',        color: '#3b82f6' },
  EMPLOYEE:   { ar: 'موظف',       en: 'Employee',     color: '#10b981' },
};

export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { data: session } = useSession();
  const { language, setLanguage, t } = useLanguage();

  const role = (session?.user?.role as string) || 'EMPLOYEE';
  const roleInfo = ROLE_LABELS[role] || { ar: role, en: role, color: '#64748b' };
  const roleLabel = language === 'ar' ? roleInfo.ar : roleInfo.en;

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-btn" onClick={toggleSidebar} aria-label="Toggle menu">
          <Menu size={22} />
        </button>
        <div className="header-greeting">
          {t('welcome')}, <strong>{session?.user?.name || '...'}</strong>
        </div>
      </div>

      <div className="header-right">
        <button
          className="lang-toggle"
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          aria-label="Switch language"
        >
          <Globe size={16} />
          <span>{language === 'en' ? 'عربي' : 'English'}</span>
        </button>

        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">{session?.user?.name || '...'}</span>
            <span className="user-role-badge" style={{ background: roleInfo.color + '18', color: roleInfo.color }}>
              {roleLabel}
            </span>
          </div>
          <div className="user-avatar-circle" style={{ borderColor: roleInfo.color + '44' }}>
            {(session?.user?.name || 'U').charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
