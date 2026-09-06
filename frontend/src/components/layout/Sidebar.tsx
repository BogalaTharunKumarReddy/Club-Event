import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Award,
  BadgeCheck,
  BarChart3,
  Bell,
  Bookmark,
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CreditCard,
  Flame,
  GraduationCap,
  Gauge,
  HandHeart,
  Heart,
  ImageIcon,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  QrCode,
  ShieldCheck,
  Star,
  Ticket,
  Trophy,
  User as UserIcon,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ROLE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import type { Role } from '@/types';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  /** Match the path exactly (used for parent routes with children). */
  end?: boolean;
}

interface NavSection {
  key: string;
  heading?: string;
  /** When set, the section only renders for users holding one of these roles. */
  roles?: Role[];
  items: NavItem[];
}

/**
 * Role-aware application sidebar. Rendered inside {@link AppLayout} for every
 * authenticated `/app/*` route. On large screens it is a fixed rail; on small
 * screens it slides in as a drawer controlled by {@code open}/{@code onClose}.
 */
export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, hasRole } = useAuth();
  const { t } = useTranslation();

  const sections: NavSection[] = [
    {
      key: 'main',
      items: [
        {
          to: '/app/dashboard',
          label: t('nav.dashboard'),
          icon: <LayoutDashboard className="h-[18px] w-[18px] shrink-0" />,
          end: true,
        },
      ],
    },
    {
      key: 'discover',
      heading: 'Discover',
      items: [
        {
          to: '/app/trending',
          label: 'Trending events',
          icon: <Flame className="h-[18px] w-[18px] shrink-0" />,
        },
        {
          to: '/app/calendar',
          label: 'Events calendar',
          icon: <CalendarDays className="h-[18px] w-[18px] shrink-0" />,
        },
        {
          to: '/app/leaderboards',
          label: 'Leaderboards',
          icon: <Trophy className="h-[18px] w-[18px] shrink-0" />,
        },
        {
          // In-app variant keeps the sidebar; the public page lives at /verify-certificate.
          to: '/app/verify-certificate',
          label: t('nav.verifyCertificate'),
          icon: <BadgeCheck className="h-[18px] w-[18px] shrink-0" />,
        },
      ],
    },
    {
      key: 'personal',
      heading: 'Personal',
      items: [
        {
          to: '/app/my-events',
          label: t('nav.myEvents'),
          icon: <Ticket className="h-[18px] w-[18px] shrink-0" />,
        },
        {
          to: '/app/saved',
          label: 'Saved events',
          icon: <Bookmark className="h-[18px] w-[18px] shrink-0" />,
        },
        {
          to: '/app/following',
          label: 'Following',
          icon: <Heart className="h-[18px] w-[18px] shrink-0" />,
        },
        {
          to: '/app/volunteering',
          label: 'Volunteering',
          icon: <HandHeart className="h-[18px] w-[18px] shrink-0" />,
        },
        {
          to: '/app/certificates',
          label: t('nav.certificates'),
          icon: <Award className="h-[18px] w-[18px] shrink-0" />,
        },
        {
          to: '/app/notifications',
          label: t('nav.notifications'),
          icon: <Bell className="h-[18px] w-[18px] shrink-0" />,
        },
        {
          to: '/app/profile',
          label: t('nav.profile'),
          icon: <UserIcon className="h-[18px] w-[18px] shrink-0" />,
        },
      ],
    },
    {
      key: 'coordinator',
      heading: 'Coordinator',
      roles: ['CLUB_COORDINATOR'],
      items: [
        {
          to: '/app/manage/overview',
          label: 'Overview',
          icon: <BarChart3 className="h-[18px] w-[18px] shrink-0" />,
        },
        {
          to: '/app/manage/events',
          label: 'Events',
          icon: <CalendarDays className="h-[18px] w-[18px] shrink-0" />,
          end: true,
        },
        {
          to: '/app/manage/clubs',
          label: 'Clubs',
          icon: <Building2 className="h-[18px] w-[18px] shrink-0" />,
          end: true,
        },
        {
          to: '/app/manage/registrations',
          label: 'Registrations',
          icon: <Users className="h-[18px] w-[18px] shrink-0" />,
        },
        {
          to: '/app/manage/attendance',
          label: 'Attendance',
          icon: <QrCode className="h-[18px] w-[18px] shrink-0" />,
        },
        {
          to: '/app/manage/schedule',
          label: 'Schedule',
          icon: <CalendarClock className="h-[18px] w-[18px] shrink-0" />,
        },
        {
          to: '/app/manage/volunteers',
          label: 'Volunteers',
          icon: <HandHeart className="h-[18px] w-[18px] shrink-0" />,
        },
        {
          to: '/app/manage/competitions',
          label: 'Competitions',
          icon: <Trophy className="h-[18px] w-[18px] shrink-0" />,
        },
        {
          to: '/app/manage/certificates',
          label: 'Certificates',
          icon: <Award className="h-[18px] w-[18px] shrink-0" />,
        },
        {
          to: '/app/manage/payments',
          label: 'Payments',
          icon: <CreditCard className="h-[18px] w-[18px] shrink-0" />,
        },
        {
          to: '/app/manage/announcements',
          label: 'Announcements',
          icon: <Megaphone className="h-[18px] w-[18px] shrink-0" />,
        },
        {
          to: '/app/manage/gallery',
          label: 'Gallery',
          icon: <ImageIcon className="h-[18px] w-[18px] shrink-0" />,
        },
        {
          to: '/app/manage/discussion',
          label: 'Discussion',
          icon: <MessageSquare className="h-[18px] w-[18px] shrink-0" />,
        },
        {
          to: '/app/manage/feedback',
          label: 'Feedback',
          icon: <Star className="h-[18px] w-[18px] shrink-0" />,
        },
      ],
    },
    {
      key: 'admin',
      heading: 'Administration',
      roles: ['ADMIN'],
      items: [
        {
          to: '/app/admin',
          label: 'Overview',
          icon: <Gauge className="h-[18px] w-[18px] shrink-0" />,
          end: true,
        },
        {
          to: '/app/admin/users',
          label: 'Users',
          icon: <Users className="h-[18px] w-[18px] shrink-0" />,
        },
        {
          to: '/app/admin/clubs',
          label: 'Clubs',
          icon: <Building2 className="h-[18px] w-[18px] shrink-0" />,
        },
        {
          to: '/app/admin/events',
          label: 'Events',
          icon: <CalendarCheck className="h-[18px] w-[18px] shrink-0" />,
        },
        {
          to: '/app/admin/payments',
          label: 'Payments',
          icon: <CreditCard className="h-[18px] w-[18px] shrink-0" />,
        },
        {
          to: '/app/admin/certificates',
          label: 'Certificates',
          icon: <Award className="h-[18px] w-[18px] shrink-0" />,
        },
        {
          to: '/app/admin/audit-log',
          label: 'Audit log',
          icon: <ShieldCheck className="h-[18px] w-[18px] shrink-0" />,
        },
      ],
    },
  ];

  const visibleSections = sections.filter((s) => !s.roles || hasRole(...s.roles));

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      isActive
        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
    );

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden',
          open ? 'block' : 'hidden',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Sidebar"
      >
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-slate-200 px-4 dark:border-slate-800">
          <Link to="/app/dashboard" onClick={onClose} className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              {t('appName')}
            </span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {visibleSections.map((section) => (
            <div key={section.key} className="mb-1">
              {section.heading && (
                <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {section.heading}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={onClose}
                    className={linkClass}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User summary */}
        {user && (
          <div className="shrink-0 border-t border-slate-200 p-3 dark:border-slate-800">
            <Link
              to="/app/profile"
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Avatar name={user.fullName} src={user.profilePhotoUrl} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                  {user.fullName}
                </p>
                <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                  {ROLE_LABELS[user.role]}
                </p>
              </div>
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
