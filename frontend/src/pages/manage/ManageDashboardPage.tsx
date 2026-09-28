import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Building2,
  CalendarCheck,
  CalendarPlus,
  Plus,
  Settings2,
  Star,
  Ticket,
  UserCheck,
  Users2,
  Wallet,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { analyticsService, clubService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { PageContainer } from '@/components/layout/RootLayout';
import { StatCard } from '@/components/domain/StatCard';
import { CreateClubModal } from '@/components/domain/CreateClubModal';
import {
  Avatar,
  Button,
  EmptyState,
  ErrorState,
  SectionLoader,
  Skeleton,
} from '@/components/ui';
import type { ClubDashboardResponse, ClubMemberResponse } from '@/types';

export default function ManageDashboardPage() {
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);

  const { data: memberships, loading, error, reload } = useQuery(
    () => clubService.myMemberships(),
    [],
  );

  const coordinatorClubs = useMemo(
    () =>
      (memberships ?? []).filter(
        (m) => m.clubRole === 'COORDINATOR' && m.status === 'ACTIVE',
      ),
    [memberships],
  );

  // Aggregate analytics across every club the coordinator runs. Each club's
  // dashboard is fetched independently and a single failure is tolerated so one
  // bad club can't blank the whole overview.
  const clubIdsKey = coordinatorClubs.map((c) => c.clubId).join(',');
  const { data: dashboards, loading: dashLoading } = useQuery<ClubDashboardResponse[]>(
    () =>
      coordinatorClubs.length === 0
        ? Promise.resolve<ClubDashboardResponse[]>([])
        : Promise.all(
            coordinatorClubs.map((c) =>
              analyticsService.clubDashboard(c.clubId).catch(() => null),
            ),
          ).then((rows) =>
            rows.filter((r): r is ClubDashboardResponse => r !== null),
          ),
    [clubIdsKey],
  );

  const summary = useMemo(() => {
    const list = dashboards ?? [];
    const acc = {
      totalEvents: 0,
      upcomingEvents: 0,
      totalMembers: 0,
      totalRegistrations: 0,
      totalAttendance: 0,
      totalRevenue: 0,
    };
    let ratingSum = 0;
    let ratingWeight = 0;
    list.forEach((d) => {
      acc.totalEvents += d.totalEvents;
      acc.upcomingEvents += d.upcomingEvents;
      acc.totalMembers += d.totalMembers;
      acc.totalRegistrations += d.totalRegistrations;
      acc.totalAttendance += d.totalAttendance;
      acc.totalRevenue += d.totalRevenue;
      d.events.forEach((e) => {
        if (e.feedbackCount > 0) {
          ratingSum += e.averageRating * e.feedbackCount;
          ratingWeight += e.feedbackCount;
        }
      });
    });
    return {
      ...acc,
      avgRating: ratingWeight > 0 ? ratingSum / ratingWeight : 0,
      ratingWeight,
    };
  }, [dashboards]);

  // Top events across all clubs, busiest first — registrations vs actual attendance.
  const eventChartData = useMemo(
    () =>
      (dashboards ?? [])
        .flatMap((d) => d.events)
        .map((e) => ({
          label: e.eventTitle.length > 18 ? `${e.eventTitle.slice(0, 17)}…` : e.eventTitle,
          registrations: e.activeRegistrations,
          attendance: e.attendanceCount,
        }))
        .filter((e) => e.registrations > 0 || e.attendance > 0)
        .sort((a, b) => b.registrations - a.registrations)
        .slice(0, 8),
    [dashboards],
  );

  const attendanceHint =
    summary.totalRegistrations > 0
      ? `${Math.round((summary.totalAttendance / summary.totalRegistrations) * 100)}% of sign-ups`
      : undefined;

  if (loading) return <SectionLoader />;

  return (
    <PageContainer>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Coordinator overview
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {coordinatorClubs.length > 0
              ? `Activity across the ${coordinatorClubs.length} club${coordinatorClubs.length === 1 ? '' : 's'} you coordinate.`
              : 'Create a club to start organising events, teams and competitions.'}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> New club
        </Button>
      </div>

      {error ? (
        <div className="mt-6">
          <ErrorState message={error} onRetry={reload} />
        </div>
      ) : coordinatorClubs.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<Settings2 className="h-6 w-6" />}
            title="You don't coordinate any clubs yet"
            description="Create a club to start organising events, teams and competitions."
            action={
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" /> Create your first club
              </Button>
            }
          />
        </div>
      ) : (
        <>
          {/* Portfolio stats */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {dashLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full" />
              ))
            ) : (
              <>
                <StatCard
                  label="Clubs"
                  value={coordinatorClubs.length}
                  icon={<Building2 className="h-5 w-5" />}
                />
                <StatCard
                  label="Events"
                  value={summary.totalEvents}
                  icon={<CalendarCheck className="h-5 w-5" />}
                  hint={`${summary.upcomingEvents} upcoming`}
                />
                <StatCard
                  label="Registrations"
                  value={summary.totalRegistrations}
                  icon={<Ticket className="h-5 w-5" />}
                />
                <StatCard
                  label="Revenue"
                  value={formatCurrency(summary.totalRevenue)}
                  icon={<Wallet className="h-5 w-5" />}
                />
              </>
            )}
          </div>

          {/* Chart + secondary metrics */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="card p-5 lg:col-span-2">
              <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                <BarChart3 className="h-4 w-4 text-brand-600" /> Registrations & attendance by event
              </h3>
              <div className="mt-4 h-72">
                {dashLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : eventChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={eventChartData}
                      margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                    >
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11 }}
                        stroke="#94a3b8"
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                      <Tooltip
                        cursor={{ fill: 'rgba(148,163,184,0.1)' }}
                        contentStyle={{ borderRadius: 8, fontSize: 12 }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="registrations" name="Registrations" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="attendance" name="Attendance" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-center text-sm text-slate-400">
                    No event activity yet — publish an event and open registrations to see stats here.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {dashLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full" />
                ))
              ) : (
                <>
                  <StatCard
                    label="Members"
                    value={summary.totalMembers}
                    icon={<Users2 className="h-5 w-5" />}
                  />
                  <StatCard
                    label="Attendance"
                    value={summary.totalAttendance}
                    icon={<UserCheck className="h-5 w-5" />}
                    hint={attendanceHint}
                  />
                  <StatCard
                    label="Avg rating"
                    value={summary.avgRating > 0 ? summary.avgRating.toFixed(1) : '—'}
                    icon={<Star className="h-5 w-5" />}
                    hint={
                      summary.ratingWeight > 0
                        ? `${summary.ratingWeight} review${summary.ratingWeight === 1 ? '' : 's'}`
                        : undefined
                    }
                  />
                </>
              )}
            </div>
          </div>

          {/* Clubs */}
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Your clubs
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {coordinatorClubs.map((club) => (
                <CoordinatorClubCard key={club.id} membership={club} />
              ))}
            </div>
          </div>
        </>
      )}

      <CreateClubModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        coordinatorName={user?.fullName}
        onCreated={() => {
          setCreateOpen(false);
          reload();
        }}
      />
    </PageContainer>
  );
}

function CoordinatorClubCard({ membership }: { membership: ClubMemberResponse }) {
  // Pull fresh club details for accurate counts.
  const { data: club } = useQuery(() => clubService.getById(membership.clubId), [membership.clubId]);

  return (
    <div className="card flex flex-col p-5">
      <div className="flex items-center gap-3">
        <Avatar name={membership.clubName} src={club?.logoUrl} size="md" />
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-900 dark:text-slate-100">
            {membership.clubName}
          </h3>
          <p className="text-xs text-slate-400">
            {club ? `${club.memberCount} members · ${club.eventCount} events` : '—'}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 pt-2">
        <Link to={`/app/manage/clubs/${membership.clubId}`} className="btn-secondary text-sm">
          <Settings2 className="h-4 w-4" /> Manage
        </Link>
        <Link
          to={`/app/manage/events/new?clubId=${membership.clubId}`}
          className="btn-primary text-sm"
        >
          <CalendarPlus className="h-4 w-4" /> New event
        </Link>
        <Link to={`/clubs/${membership.clubId}`} className="btn-ghost text-sm">
          <Users2 className="h-4 w-4" /> View
        </Link>
      </div>
    </div>
  );
}
