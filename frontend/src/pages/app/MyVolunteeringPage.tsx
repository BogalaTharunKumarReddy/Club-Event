<<<<<<< HEAD
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, HandHeart } from 'lucide-react';
import { volunteerService } from '@/lib/services';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@/hooks/useApi';
import { cn } from '@/lib/utils';
import {
  VOLUNTEER_STATUS_LABELS,
  VOLUNTEER_STATUS_STYLES,
} from '@/lib/constants';
import { PageContainer } from '@/components/layout/RootLayout';
import {
=======
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, HandHeart } from 'lucide-react';
import toast from 'react-hot-toast';
import { volunteerService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { cn, errorMessage, formatDateTime } from '@/lib/utils';
import { PageContainer } from '@/components/layout/RootLayout';
import {
  Badge,
  Button,
  ConfirmDialog,
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
} from '@/components/ui';
<<<<<<< HEAD

/**
 * "Volunteering" — a personal overview available to every signed-in user.
 *
 * Volunteering is a club-scoped role: you apply to a club, and once a
 * coordinator approves you, the dedicated volunteer workspace unlocks. This
 * page adapts to who's viewing it:
 *   • Approved/active volunteers see their club profiles (status + hours) and a
 *     link into the full volunteer workspace.
 *   • Everyone else sees a short explainer on how to get involved. We only call
 *     the volunteer API when the user actually holds the VOLUNTEER role, so
 *     students never hit a permission wall.
 */
export default function MyVolunteeringPage() {
  const { hasRole } = useAuth();
  const isVolunteer = hasRole('VOLUNTEER');
=======
import type { TaskStatus, VolunteerResponse, VolunteerTaskResponse } from '@/types';

const TASK_STATUS_META: Record<TaskStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  },
  IN_PROGRESS: {
    label: 'In progress',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
};

/** Advance a task through the PENDING → IN_PROGRESS → COMPLETED → PENDING cycle. */
function nextTaskStatus(status: TaskStatus): TaskStatus {
  if (status === 'PENDING') return 'IN_PROGRESS';
  if (status === 'IN_PROGRESS') return 'COMPLETED';
  return 'PENDING';
}

/**
 * Student-facing "My volunteering" page. Lists every event the signed-in user
 * has volunteered for (approved or pending) and the tasks assigned to them,
 * grouped by event. Volunteers can advance their own task statuses and withdraw
 * from an event they no longer want to help with.
 */
export default function MyVolunteeringPage() {
  const {
    data: volunteers,
    loading,
    error,
    reload,
  } = useQuery(() => volunteerService.mine(), []);
  const { data: tasks, reload: reloadTasks } = useQuery(() => volunteerService.myTasks(), []);

  const [busyTaskId, setBusyTaskId] = useState<number | null>(null);
  const [toWithdraw, setToWithdraw] = useState<VolunteerResponse | null>(null);

  const tasksByVolunteer = useMemo(() => {
    const map = new Map<number, VolunteerTaskResponse[]>();
    for (const t of tasks ?? []) {
      const list = map.get(t.volunteerId) ?? [];
      list.push(t);
      map.set(t.volunteerId, list);
    }
    return map;
  }, [tasks]);

  async function cycleTaskStatus(task: VolunteerTaskResponse) {
    setBusyTaskId(task.id);
    try {
      await volunteerService.updateTaskStatus(task.id, nextTaskStatus(task.status));
      reloadTasks();
      reload();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update the task.'));
    } finally {
      setBusyTaskId(null);
    }
  }

  async function confirmWithdraw() {
    if (!toWithdraw) return;
    try {
      await volunteerService.remove(toWithdraw.id);
      toast.success('Withdrawn from volunteering.');
      reload();
      reloadTasks();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not withdraw.'));
      throw err;
    }
  }
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6

  return (
    <PageContainer>
      <PageHeader
        title="Volunteering"
<<<<<<< HEAD
        description="Clubs you volunteer for, and how to get involved with more."
      />

      <div className="mt-6">
        {isVolunteer ? <VolunteerProfiles /> : <HowToVolunteer />}
      </div>
    </PageContainer>
  );
}

/** Club-by-club volunteer standing for a user who holds the VOLUNTEER role. */
function VolunteerProfiles() {
  const { data: profiles, loading, error, reload } = useQuery(
    () => volunteerService.myProfiles(),
    [],
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!profiles || profiles.length === 0) {
    return <HowToVolunteer />;
  }

  return (
    <div className="space-y-6">
      <Link
        to="/app/volunteer/dashboard"
        className="flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50 p-4 transition hover:border-brand-300 dark:border-brand-900/50 dark:bg-brand-900/20"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-600 text-white">
            <HandHeart className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              Open my volunteer workspace
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your assigned events, tasks, shifts and check-in tools.
            </p>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-brand-600 dark:text-brand-300" />
      </Link>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
          My clubs
        </h3>
        <ul className="space-y-3">
          {profiles.map((v) => (
            <li key={v.id} className="card flex flex-wrap items-center justify-between gap-3 p-5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/clubs/${v.clubId}`}
                    className="font-semibold text-slate-900 hover:text-brand-700 dark:text-slate-100"
                  >
                    {v.clubName}
                  </Link>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-medium',
                      VOLUNTEER_STATUS_STYLES[v.status],
                    )}
                  >
                    {VOLUNTEER_STATUS_LABELS[v.status]}
                  </span>
                </div>
                {v.skills && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Skills: {v.skills}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <Clock className="h-4 w-4" />
                {v.totalHours.toFixed(1)} hrs
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Explainer shown to users who don't (yet) volunteer anywhere. */
function HowToVolunteer() {
  return (
    <EmptyState
      icon={<HandHeart className="h-6 w-6" />}
      title="Lend a hand at campus events"
      description="Volunteering is organised per club. Open a club you'd like to support and apply to volunteer — once a coordinator approves you, your volunteer workspace unlocks with assigned events, tasks and shifts."
    />
  );
}
=======
        description="Events you're helping run, and the tasks assigned to you."
      />

      <div className="mt-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : !volunteers || volunteers.length === 0 ? (
          <EmptyState
            icon={<HandHeart className="h-6 w-6" />}
            title="You're not volunteering yet"
            description="Open an event you'd like to help with and use “Volunteer for this event”."
            action={
              <Link to="/events" className="btn-primary">
                Browse events
              </Link>
            }
          />
        ) : (
          <ul className="space-y-4">
            {volunteers.map((v) => {
              const vTasks = tasksByVolunteer.get(v.id) ?? [];
              return (
                <li key={v.id} className="card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/events/${v.eventId}`}
                          className="font-semibold text-slate-900 hover:text-brand-700 dark:text-slate-100"
                        >
                          {v.eventTitle}
                        </Link>
                        {v.approved ? (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                            Approved
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                            Awaiting approval
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
                        {v.role ? `${v.role} · ` : ''}
                        {v.completedTaskCount}/{v.taskCount} task
                        {v.taskCount === 1 ? '' : 's'} done
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setToWithdraw(v)}>
                      Withdraw
                    </Button>
                  </div>

                  {vTasks.length > 0 ? (
                    <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                      {vTasks.map((t) => {
                        const meta = TASK_STATUS_META[t.status];
                        return (
                          <li key={t.id} className="flex items-start gap-2.5">
                            <button
                              type="button"
                              disabled={!v.approved || busyTaskId === t.id}
                              onClick={() => cycleTaskStatus(t)}
                              className={cn(
                                'mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium transition disabled:opacity-50',
                                meta.className,
                              )}
                              title={v.approved ? 'Click to advance status' : undefined}
                            >
                              {meta.label}
                            </button>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-slate-700 dark:text-slate-200">{t.title}</p>
                              {t.description && (
                                <p className="text-xs text-slate-400">{t.description}</p>
                              )}
                              {t.dueAt && (
                                <p className="flex items-center gap-1 text-xs text-slate-400">
                                  <CalendarClock className="h-3 w-3" /> Due {formatDateTime(t.dueAt)}
                                </p>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-400 dark:border-slate-800">
                      {v.approved
                        ? 'No tasks assigned yet — the organiser will add tasks here.'
                        : 'Once approved, any tasks the organiser assigns will show here.'}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={!!toWithdraw}
        onClose={() => setToWithdraw(null)}
        onConfirm={confirmWithdraw}
        title="Withdraw from volunteering?"
        message={`You'll be removed from the volunteer roster for "${
          toWithdraw?.eventTitle ?? ''
        }" and any tasks assigned to you will be cleared.`}
        confirmLabel="Withdraw"
        danger
      />
    </PageContainer>
  );
}
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
