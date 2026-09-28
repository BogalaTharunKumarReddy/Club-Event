import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NotificationBell } from './NotificationBell';
import { UserMenu } from './UserMenu';

export function Navbar() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            {t('appName')}
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              <NotificationBell />
              <UserMenu />
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/login" className="btn-ghost">
                {t('nav.login')}
              </Link>
              <Link to="/register" className="btn-primary">
                {t('nav.register')}
              </Link>
            </div>
          )}

          {/* Mobile menu toggle — only surfaces guest auth actions + language on small screens. */}
          {!isAuthenticated && (
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 sm:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>

      {mobileOpen && !isAuthenticated && (
        <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-800 sm:hidden">
          <nav className="flex flex-col gap-2">
            <Link to="/login" className="btn-secondary" onClick={() => setMobileOpen(false)}>
              {t('nav.login')}
            </Link>
            <Link to="/register" className="btn-primary" onClick={() => setMobileOpen(false)}>
              {t('nav.register')}
            </Link>
            <div className="mt-2 border-t border-slate-200 pt-2 dark:border-slate-800">
              <LanguageSwitcher />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
