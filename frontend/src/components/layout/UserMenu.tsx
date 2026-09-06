import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, LayoutDashboard, LogOut, ShieldCheck, Ticket, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useClickOutside } from '@/hooks/useClickOutside';
import { disconnectWs } from '@/lib/ws';
import { ROLE_LABELS } from '@/lib/constants';
import { Avatar } from '@/components/ui/Avatar';

export function UserMenu() {
  const { user, logout, hasRole } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    setOpen(false);
    disconnectWs();
    logout();
    navigate('/');
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <Avatar name={user.fullName} src={user.profilePhotoUrl} size="sm" />
        <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-200 sm:block">
          {user.fullName.split(' ')[0]}
        </span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-56 origin-top-right animate-fade-in overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
              {user.fullName}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {user.email}
            </p>
            <span className="mt-1.5 inline-block rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-medium text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
              {ROLE_LABELS[user.role]}
            </span>
          </div>

          <nav className="py-1">
            <MenuLink to="/app/profile" icon={<UserIcon className="h-4 w-4" />} onClick={() => setOpen(false)}>
              Profile
            </MenuLink>
            <MenuLink to="/app/my-events" icon={<Ticket className="h-4 w-4" />} onClick={() => setOpen(false)}>
              My events
            </MenuLink>
            {hasRole('CLUB_COORDINATOR') && (
              <MenuLink
                to="/app/manage"
                icon={<LayoutDashboard className="h-4 w-4" />}
                onClick={() => setOpen(false)}
              >
                Coordinator dashboard
              </MenuLink>
            )}
            {hasRole('ADMIN') && (
              <MenuLink
                to="/app/admin"
                icon={<ShieldCheck className="h-4 w-4" />}
                onClick={() => setOpen(false)}
              >
                Admin console
              </MenuLink>
            )}
          </nav>

          <div className="border-t border-slate-200 py-1 dark:border-slate-800">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  to,
  icon,
  children,
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      {icon}
      {children}
    </Link>
  );
}
