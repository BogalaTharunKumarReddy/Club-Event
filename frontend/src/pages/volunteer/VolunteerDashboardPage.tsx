import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarCheck,
  ClipboardCheck,
  Clock,
  HandHeart,
  MapPin,
} from 'lucide-react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { volunteerService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { cn, formatDateTime } from '@/lib/utils';
import {
  VOLUNTEER_ASSIGNMENT_STATUS_LABELS,
  VOLUNTEER_ASSIGNMENT_STATUS_STYLES,
  VOLUNTEER_TASK_STATUS_LABELS,
  VOLUNTEER_TASK_STATUS_STYLES,
} from '@/lib/constants';
import { PageContainer } from '@/components/layout/RootLayout';
import { EmptyState, ErrorState, PageHeader, Skeleton } from '@/components/ui';
import { StatCard } from '@/components/domain/StatCard';
import type { VolunteerAssignmentResponse } from '@/types';

/**
 * Volunteer home. One call to the dashboard endpoint drives the whole page:
 * headline stats, today's shift, upcoming shifts and the most recent tasks.
 */
export default function VolunteerDashboardPage() {
  const { data, loading, error, reload } = useQuery(
    () => volunteerService.dashboard(),
    [],
  );

  // Task status split for the breakdown donut (omit any zero-count slices).
  const taskData = data
    ? [
        { name: 'Pending', value: data.pendingTasks, color: '#f59e0b' },
        { name: 'In progress', value: data.inProgressTasks, color: '#3b82f6' },
        { name: 'Completed', value: data.completedTasks, color: '#22c55e' },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <PageContainer>
      <PageHeader
        title={data ? `Welcome, ${data.fullName.split(' ')[0]}` : 'Volunteer dashboard'}
        description="Your events, shifts and tasks at a glance."
      />

      <div className="mt-6 space-y-6">
        {loading ? (
          <DashboardSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : !data || !data.hasProfile ? (
          <EmptyState
            icon={<HandHeart className="h-6 w-6" />}
            title="No volunteering yet"
            description="Once a club approves your volunteer application, your assignments and tasks will appear here."
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard
                label="Assigned events"
                value={data.assignedEvents}
                icon={<CalendarCheck className="h-5 w-5" />}
              />
              <StatCard
                label="Open tasks"
                value={data.pendingTasks + data.inProgressTasks}
                icon={<ClipboardCheck className="h-5 w-5" />}
                hint={`${data.completedTasks} completed`}
              />
              <StatCard
                label="Hours"
                value={data.totalHours.toFixed(1)}
                icon={<Clock className="h-5 w-5" />}
              />
              <StatCard
                label="Attendance"
                value={`${Math.round(data.attendancePct)}%`}
                icon={<HandHeart className="h-5 w-5" />}
              />
            </div>

            {taskData.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Task breakdown
                </h2>
                <div className="card p-5">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={taskData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={2}
                        >
                          {taskData.map((d) => (
                            <Cell key={d.name} fill={d.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>
            )}

            {data.todaysAssignment && (
              <section>
                <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Today's shift
                </h2>
                <AssignmentCard assignment={data.todaysAssignment} highlight />
              </section>
            )}

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Upcoming shifts
                </h2>
                <Link
                  to="/app/volunteer/events"
                  className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                >
                  All events <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              {data.upcomingShifts.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400 dark:border-slate-700">
                  No upcoming shifts scheduled.
                </p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {data.upcomingShifts.map((a) => (
                    <AssignmentCard key={a.id} assignment={a} />
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Recent tasks
                </h2>
                <Link
                  to="/app/volunteer/tasks"
                  className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                >
                  All tasks <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              {data.recentTasks.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400 dark:border-slate-700">
                  No tasks assigned yet.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                  {data.recentTasks.map((t) => (
                    <li key={t.id}>
                      <Link
                        to={`/app/volunteer/tasks/${t.id}`}
                        className="flex items-center justify-between gap-3 p-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                            {t.title}
                          </p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {t.eventTitle}
                          </p>
                        </div>
                        <span
                          className={cn(
                            'shrink-0 rounded-full px-2.5 py-1 text-xs font-medium',
                            VOLUNTEER_TASK_STATUS_STYLES[t.status],
                          )}
                        >
                          {VOLUNTEER_TASK_STATUS_LABELS[t.status]}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </PageContainer>
  );
}

/** Compact card describing one event assignment / shift. */
function AssignmentCard({
  assignment: a,
  highlight = false,
}: {
  assignment: VolunteerAssignmentResponse;
  highlight?: boolean;
}) {
  return (
    <Link
      to={`/events/${a.eventId}`}
      className={cn(
        'block rounded-xl border p-4 transition hover:border-brand-300 hover:shadow-sm',
        highlight
          ? 'border-brand-200 bg-brand-50 dark:border-brand-900/50 dark:bg-brand-900/20'
          : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
            {a.eventTitle}
          </p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {a.role} · {a.clubName}
          </p>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full px-2.5 py-1 text-xs font-medium',
            VOLUNTEER_ASSIGNMENT_STATUS_STYLES[a.status],
          )}
        >
          {VOLUNTEER_ASSIGNMENT_STATUS_LABELS[a.status]}
        </span>
      </div>
      <div className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
        {(a.shiftStart || a.shiftEnd) && (
          <p className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {a.shiftStart ? formatDateTime(a.shiftStart) : '—'}
            {' → '}
            {a.shiftEnd ? formatDateTime(a.shiftEnd) : '—'}
          </p>
        )}
        {a.location && (
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {a.location}
          </p>
        )}
        {a.checkInDuty && (
          <p className="flex items-center gap-1.5 font-medium text-brand-600 dark:text-brand-400">
            <ClipboardCheck className="h-3.5 w-3.5" />
            Check-in duty
          </p>
        )}
      </div>
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-28 w-full" />
      <div className="grid gap-3 md:grid-cols-2">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}
