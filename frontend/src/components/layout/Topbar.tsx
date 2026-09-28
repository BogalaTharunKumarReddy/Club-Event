import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Menu } from 'lucide-react';
<<<<<<< HEAD
import { useAuth } from '@/context/AuthContext';
import { roleHome } from '@/lib/roleHome';
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NotificationBell } from './NotificationBell';
import { UserMenu } from './UserMenu';
import { GlobalSearch } from './GlobalSearch';

/**
 * Slim top bar for the authenticated app shell. Hosts the mobile sidebar
 * trigger plus the user menu, notifications, theme and language controls.
 * The main navigation lives in {@link Sidebar}, not here.
 */
export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { t } = useTranslation();
<<<<<<< HEAD
  const { user } = useAuth();
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80 sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Brand shown on mobile (sidebar is hidden there). */}
<<<<<<< HEAD
      <Link to={roleHome(user?.role)} className="flex items-center gap-2 lg:hidden">
=======
      <Link to="/app/dashboard" className="flex items-center gap-2 lg:hidden">
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
          <GraduationCap className="h-4 w-4" />
        </span>
        <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
          {t('appName')}
        </span>
      </Link>

      {/* Global search occupies the flexible middle; hidden on the smallest screens. */}
      <div className="hidden flex-1 justify-center px-2 sm:flex">
        <GlobalSearch />
      </div>
      <div className="flex-1 sm:hidden" />

      <div className="hidden sm:block">
        <LanguageSwitcher />
      </div>
      <ThemeToggle />
      <NotificationBell />
      <UserMenu />
    </header>
  );
}
