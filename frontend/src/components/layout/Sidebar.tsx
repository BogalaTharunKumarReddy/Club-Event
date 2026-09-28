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
  ClipboardCheck,
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
  PanelLeft,
  PanelLeftClose,
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
import { roleHome } from '@/lib/roleHome';
import { Avatar } from '@/components/ui/Avatar';
import type { Role } from '@/types';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  /** Match the path exactly (used for parent routes with children). */
  end?: boolean;
  /** When set, the item only renders for users holding one of these roles. */
  roles?: Role[];
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
 * authenticated `/app/*` route. On large screens it is a fixed rail that can be
 * collapsed to an icon-only strip; on small screens it slides in as a full-width
 * drawer controlled by {@code open}/{@code onClose} (collapse never applies to
 * the mobile drawer — labels always show there).
 */
export function Sidebar({
  open,
  onClose,
  collapsed = false,
  onToggleCollapse,
}: {
  open: boolean;
  onClose: () => void;
  /** Desktop icon-only mode. Ignored on mobile, where the drawer is full width. */
  collapsed?: boolean;
  /** Toggles {@link collapsed}; when omitted the collapse control is hidden. */
  onToggleCollapse?: () => void;
}) {
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
          // Volunteers have their own dashboard under the Volunteer section.
          roles: ['STUDENT', 'CLUB_MEMBER', 'CLUB_COORDINATOR', 'ADMIN'],
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
          // Attendee views — admins manage from the Administration section instead.
          roles: ['STUDENT', 'CLUB_MEMBER', 'CLUB_COORDINATOR'],
        },
        {
          to: '/app/saved',
          label: 'Saved events',
          icon: <Bookmark className="h-[18px] w-[18px] shrink-0" />,
          roles: ['STUDENT', 'CLUB_MEMBER', 'CLUB_COORDINATOR'],
        },
        {
          to: '/app/following',
          label: 'Following',
          icon: <Heart className="h-[18px] w-[18px] shrink-0" />,
          roles: ['STUDENT', 'CLUB_MEMBER', 'CLUB_COORDINATOR'],
        },
        {
          to: '/app/volunteering',
          label: 'Volunteering',
          icon: <HandHeart className="h-[18px] w-[18px] shrink-0" />,
          // Students don't volunteer; volunteers use their dedicated workspace.
          roles: ['CLUB_MEMBER', 'CLUB_COORDINATOR'],
        },
        {
          to: '/app/certificates',
          label: t('nav.certificates'),
          icon: <Award className="h-[18px] w-[18px] shrink-0" />,
          // Admins have the platform-wide certificate view under Administration.
          roles: ['STUDENT', 'CLUB_MEMBER', 'CLUB_COORDINATOR', 'VOLUNTEER'],
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
      key: 'checkin',
      heading: 'Check-in',
      // The attendee check-in scanner is shared by club members and
      // coordinators — mirror the /app/scan route guard in App.tsx so the
      // nav entry and the route stay in sync (coordinators were missing it).
      roles: ['CLUB_MEMBER', 'CLUB_COORDINATOR'],
      items: [
        {
          to: '/app/scan',
          label: 'Check-in scanner',
          icon: <QrCode className="h-[18px] w-[18px] shrink-0" />,
        },
      ],
    },
    {
      key: 'volunteer',
      heading: 'Volunteer',
      roles: ['VOLUNTEER'],
      items: [
        {
          to: '/app/volunteer/dashboard',
          label: 'Dashboard',
          icon: <LayoutDashboard className="h-[18px] w-[18px] shrink-0" />,
          end: true,
        },
        {
          to: '/app/volunteer/events',
          label: 'My events',
          icon: <CalendarCheck className="h-[18px] w-[18px] shrink-0" />,
        },
        {
          to: '/app/volunteer/tasks',
          label: 'My tasks',
          icon: <ClipboardCheck className="h-[18px] w-[18px] shrink-0" />,
        },
        {
          to: '/app/volunteer/attendance',
          label: 'My attendance',
          icon: <CalendarClock className="h-[18px] w-[18px] shrink-0" />,
        },
        {
          to: '/app/volunteer/scan',
          label: 'Check-in scanner',
          icon: <QrCode className="h-[18px] w-[18px] shrink-0" />,
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

  // Gate at both levels: a section may be role-scoped, and individual items may
  // be too. Items are filtered first, then any section left with no items is
  // dropped so we never render an empty heading.
  const visibleSections = sections
    .filter((s) => !s.roles || hasRole(...s.roles))
    .map((s) => ({ ...s, items: s.items.filter((i) => !i.roles || hasRole(...i.roles)) }))
    .filter((s) => s.items.length > 0);

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
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-[transform,width] duration-200 ease-in-out dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
          // Collapse is a desktop-only affordance: the mobile drawer stays full width.
          collapsed ? 'lg:w-16' : 'lg:w-64',
        )}
        aria-label="Sidebar"
      >
        {/* Brand */}
        <div
          className={cn(
            'flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 px-4 dark:border-slate-800',
            collapsed ? 'justify-between lg:justify-center lg:px-2' : 'justify-between',
          )}
        >
          <Link
            to={roleHome(user?.role)}
            onClick={onClose}
            className={cn('flex items-center gap-2', collapsed && 'lg:hidden')}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              {t('appName')}
            </span>
          </Link>

          {/* Mobile drawer close */}
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Desktop collapse / expand toggle */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className={cn(
                'hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:inline-flex',
                collapsed && 'lg:mx-auto',
              )}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-pressed={collapsed}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <PanelLeft className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className={cn('flex-1 overflow-y-auto py-4', collapsed ? 'px-2 lg:px-2' : 'px-3')}>
          {visibleSections.map((section) => (
            <div key={section.key} className="mb-1">
              {section.heading && (
                <p
                  className={cn(
                    'px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500',
                    collapsed && 'lg:hidden',
                  )}
                >
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
                    className={({ isActive }) =>
                      cn(linkClass({ isActive }), collapsed && 'lg:justify-center lg:px-2')
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    {item.icon}
                    <span className={cn(collapsed && 'lg:hidden')}>{item.label}</span>
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
              className={cn(
                'flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800',
                collapsed && 'lg:justify-center lg:px-0',
              )}
              title={collapsed ? user.fullName : undefined}
            >
              <Avatar name={user.fullName} src={user.profilePhotoUrl} size="sm" />
              <div className={cn('min-w-0', collapsed && 'lg:hidden')}>
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
