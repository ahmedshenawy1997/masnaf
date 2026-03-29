import { Menu, UserCircle, Globe } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/lib/LanguageContext';
import './Header.css';

export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { data: session } = useSession();
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-btn" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <div className="header-greeting">
          <strong>{t('welcome')},</strong> {session?.user?.name || 'User'}
        </div>
      </div>

      <div className="header-right">
        <button 
          className="lang-toggle" 
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
        >
          <Globe size={18} />
          <span>{language === 'en' ? 'عربي' : 'English'}</span>
        </button>

        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">{session?.user?.name || 'Loading...'}</span>
            <span className="user-role">{session?.user?.role}</span>
          </div>
          <UserCircle size={36} className="user-avatar" />
        </div>
      </div>
    </header>
  );
}
