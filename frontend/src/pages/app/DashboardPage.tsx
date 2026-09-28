import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Building2,
  CalendarCheck,
  CalendarDays,
<<<<<<< HEAD
  CreditCard,
  LayoutDashboard,
  QrCode,
=======
  LayoutDashboard,
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
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
<<<<<<< HEAD
import { formatDate } from '@/lib/utils';
import { PageContainer } from '@/components/layout/RootLayout';
import { EventCard } from '@/components/domain/EventCard';
import { StatCard } from '@/components/domain/StatCard';
import { Avatar, Skeleton } from '@/components/ui';
=======
import { PageContainer } from '@/components/layout/RootLayout';
import { EventCard } from '@/components/domain/EventCard';
import { StatCard } from '@/components/domain/StatCard';
import { Skeleton } from '@/components/ui';
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
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
<<<<<<< HEAD
  // Clubs where the signed-in user participates as a member (not coordinator) —
  // drives the member-only section below.
  const memberClubs = activeMemberships.filter((m) => m.clubRole === 'MEMBER');
  const activeRegs = (regs?.content ?? []).filter((r) => r.status !== 'CANCELLED');
  // Paid events the user has registered for but not yet paid — the one thing on
  // this dashboard that needs their action, so it gets a prominent callout.
  const awaitingPayment = (regs?.content ?? []).filter(
    (r) => r.paidEvent && !r.ticketReady && r.status !== 'CANCELLED',
  );
=======
  const activeRegs = (regs?.content ?? []).filter((r) => r.status !== 'CANCELLED');
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6

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

<<<<<<< HEAD
      {/* Action needed: registrations awaiting payment */}
      {awaitingPayment.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/50 dark:bg-amber-900/20">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 rounded-lg bg-amber-100 p-2 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              <CreditCard className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-amber-900 dark:text-amber-200">
                {awaitingPayment.length === 1
                  ? 'You have 1 registration awaiting payment'
                  : `You have ${awaitingPayment.length} registrations awaiting payment`}
              </h3>
              <p className="mt-0.5 text-sm text-amber-800/80 dark:text-amber-300/80">
                Complete payment to secure your seat and unlock your ticket.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {awaitingPayment.slice(0, 4).map((r) => (
                  <Link key={r.id} to={`/events/${r.eventId}`} className="btn-secondary text-sm">
                    {r.eventTitle}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Club-member workspace: only club members see this. It surfaces the
          clubs they belong to plus the member-only check-in scanner, none of
          which the plain student dashboard exposes. */}
      {hasRole('CLUB_MEMBER') && (
        <section className="mt-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Your club membership
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Clubs you belong to and the tools that come with membership.
              </p>
            </div>
            <Link to="/app/scan" className="btn-secondary text-sm">
              <QrCode className="h-4 w-4" /> Check-in scanner
            </Link>
          </div>
          {memberClubs.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {memberClubs.map((m) => (
                <div key={m.id} className="card flex flex-col p-5">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.clubName} size="md" />
                    <div className="min-w-0">
                      <h4 className="truncate font-semibold text-slate-900 dark:text-slate-100">
                        {m.clubName}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Member since {formatDate(m.joinedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 pt-1">
                    <Link to={`/clubs/${m.clubId}`} className="btn-secondary text-sm">
                      <Building2 className="h-4 w-4" /> View club
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-6 text-center text-sm text-slate-400">
              You're an approved club member. Once you're added to a club, it'll appear here.
            </div>
          )}
        </section>
      )}

=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
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
<<<<<<< HEAD
=======
            <Link
              to="/events"
              className="text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Browse all
            </Link>
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
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
