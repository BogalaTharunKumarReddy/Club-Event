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
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
} from '@/components/ui';
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

  return (
    <PageContainer>
      <PageHeader
        title="Volunteering"
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
