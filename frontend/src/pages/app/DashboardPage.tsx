import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Building2,
  CalendarCheck,
  CalendarDays,
  LayoutDashboard,
  Ticket,
  Users2,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  certificateService,
  clubService,
  eventService,
  registrationService,
} from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { REGISTRATION_STATUS_LABELS } from '@/lib/constants';
import { PageContainer } from '@/components/layout/RootLayout';
import { EventCard } from '@/components/domain/EventCard';
import { StatCard } from '@/components/domain/StatCard';
import { Skeleton } from '@/components/ui';
import type { RegistrationStatus } from '@/types';

const STATUS_COLORS: Record<RegistrationStatus, string> = {
  REGISTERED: '#3b82f6',
  CONFIRMED: '#22c55e',
  WAITLISTED: '#f59e0b',
  CANCELLED: '#ef4444',
};

export default function DashboardPage() {
  const { user, hasRole } = useAuth();

  const { data: regs, loading: regsLoading } = useQuery(
    () => registrationService.mine(0, 50),
    [],
  );
  const { data: certs } = useQuery(() => certificateService.mine().catch(() => []), []);
  const { data: memberships } = useQuery(
    () => clubService.myMemberships().catch(() => []),
    [],
  );
  const { data: upcoming } = useQuery(
    () => eventService.search({ from: new Date().toISOString(), size: 6 }),
    [],
  );

  const activeMemberships = (memberships ?? []).filter((m) => m.status === 'ACTIVE');
  const activeRegs = (regs?.content ?? []).filter((r) => r.status !== 'CANCELLED');

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    (regs?.content ?? []).forEach((r) => {
      counts[r.status] = (counts[r.status] ?? 0) + 1;
    });
    return (Object.keys(REGISTRATION_STATUS_LABELS) as RegistrationStatus[])
      .map((status) => ({
        status,
        label: REGISTRATION_STATUS_LABELS[status],
        count: counts[status] ?? 0,
      }))
      .filter((d) => d.count > 0);
  }, [regs]);

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Welcome back, {user?.fullName.split(' ')[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Here's what's happening with your campus activity.
          </p>
        </div>
        {hasRole('CLUB_COORDINATOR') && (
          <div className="hidden gap-2 sm:flex">
            <Link to="/app/manage/events" className="btn-secondary">
              <CalendarDays className="h-4 w-4" /> Events
            </Link>
            <Link to="/app/manage/clubs" className="btn-primary">
              <Building2 className="h-4 w-4" /> Clubs
            </Link>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active registrations"
          value={activeRegs.length}
          icon={<Ticket className="h-5 w-5" />}
        />
        <StatCard
          label="Certificates"
          value={certs?.length ?? 0}
          icon={<Award className="h-5 w-5" />}
        />
        <StatCard
          label="Clubs joined"
          value={activeMemberships.length}
          icon={<Users2 className="h-5 w-5" />}
        />
        <StatCard
          label="Total sign-ups"
          value={regs?.totalElements ?? 0}
          icon={<CalendarCheck className="h-5 w-5" />}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Activity chart */}
        <div className="card p-5 lg:col-span-1">
          <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
            <LayoutDashboard className="h-4 w-4 text-brand-600" /> Registrations by status
          </h3>
          <div className="mt-4 h-56">
            {regsLoading ? (
              <Skeleton className="h-full w-full" />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    stroke="#94a3b8"
                    interval={0}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip
                    cursor={{ fill: 'rgba(148,163,184,0.1)' }}
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((d) => (
                      <Cell key={d.status} fill={STATUS_COLORS[d.status]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No activity yet — register for an event to get started.
              </div>
            )}
          </div>
        </div>

        {/* Upcoming events */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Upcoming events</h3>
            <Link
              to="/events"
              className="text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Browse all
            </Link>
          </div>
          {upcoming && upcoming.content.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {upcoming.content.slice(0, 4).map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center text-sm text-slate-400">
              No upcoming events right now.
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
