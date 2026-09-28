import { useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Info,
  MapPin,
  User as UserIcon,
} from 'lucide-react';
import { volunteerService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { cn, errorMessage, formatDateTime } from '@/lib/utils';
import {
  VOLUNTEER_TASK_PRIORITY_LABELS,
  VOLUNTEER_TASK_PRIORITY_STYLES,
  VOLUNTEER_TASK_STATUS_LABELS,
  VOLUNTEER_TASK_STATUS_STYLES,
} from '@/lib/constants';
import { PageContainer } from '@/components/layout/RootLayout';
import {
  Button,
  ErrorState,
  SectionLoader,
  TextArea,
} from '@/components/ui';

/**
 * Task detail + workflow. A volunteer can start a pending task and, once it's
 * in progress, mark it complete with optional notes. Completed tasks show the
 * outcome read-only.
 */
export default function VolunteerTaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const id = Number(taskId);

  const { data: task, loading, error, reload, setData } = useQuery(
    () => volunteerService.myTask(id),
    [id],
  );

  const [notes, setNotes] = useState('');
  const [working, setWorking] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function start() {
    setWorking(true);
    setActionError(null);
    try {
      const updated = await volunteerService.startTask(id);
      setData(updated);
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setWorking(false);
    }
  }

  async function complete() {
    setWorking(true);
    setActionError(null);
    try {
      const updated = await volunteerService.completeTask(id, {
        completionNotes: notes.trim() || undefined,
      });
      setData(updated);
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setWorking(false);
    }
  }

  if (loading) return <SectionLoader />;

  return (
    <PageContainer>
      <Link
        to="/app/volunteer/tasks"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        All tasks
      </Link>

      {error || !task ? (
        <ErrorState message={error ?? 'Task not found.'} onRetry={reload} />
      ) : (
        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {task.title}
              </h1>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[11px] font-medium',
                  VOLUNTEER_TASK_PRIORITY_STYLES[task.priority],
                )}
              >
                {VOLUNTEER_TASK_PRIORITY_LABELS[task.priority]}
              </span>
              <span
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs font-medium',
                  VOLUNTEER_TASK_STATUS_STYLES[task.status],
                )}
              >
                {VOLUNTEER_TASK_STATUS_LABELS[task.status]}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              For{' '}
              <Link
                to={`/events/${task.eventId}`}
                className="font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                {task.eventTitle}
              </Link>
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {task.assignedByName && (
              <Meta icon={<UserIcon className="h-4 w-4" />} label="Assigned by">
                {task.assignedByName}
              </Meta>
            )}
            {task.location && (
              <Meta icon={<MapPin className="h-4 w-4" />} label="Location">
                {task.location}
              </Meta>
            )}
            {task.startTime && (
              <Meta icon={<Clock className="h-4 w-4" />} label="Window">
                {formatDateTime(task.startTime)}
                {task.endTime ? ` → ${formatDateTime(task.endTime)}` : ''}
              </Meta>
            )}
            {task.startedAt && (
              <Meta
                icon={<CalendarClock className="h-4 w-4" />}
                label="Started"
              >
                {formatDateTime(task.startedAt)}
              </Meta>
            )}
          </div>

          {task.description && (
            <section>
              <h2 className="mb-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                Description
              </h2>
              <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
                {task.description}
              </p>
            </section>
          )}

          {task.instructions && (
            <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-900/15">
              <h2 className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-amber-800 dark:text-amber-300">
                <Info className="h-4 w-4" />
                Instructions
              </h2>
              <p className="whitespace-pre-wrap text-sm text-amber-800/90 dark:text-amber-200/90">
                {task.instructions}
              </p>
            </section>
          )}

          {/* -------------------------- workflow -------------------------- */}
          {task.status === 'COMPLETED' ? (
            <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-900/15">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                Completed
                {task.completedAt ? ` · ${formatDateTime(task.completedAt)}` : ''}
              </h2>
              {task.completionNotes && (
                <p className="mt-1.5 whitespace-pre-wrap text-sm text-emerald-800/90 dark:text-emerald-200/90">
                  {task.completionNotes}
                </p>
              )}
            </section>
          ) : task.status === 'CANCELLED' ? (
            <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
              This task was cancelled by the organiser.
            </p>
          ) : (
            <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              {actionError && (
                <p className="mb-3 text-sm text-rose-600 dark:text-rose-400">
                  {actionError}
                </p>
              )}

              {task.status === 'PENDING' ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Ready to pick this up? Start it so the organiser knows it's
                    underway.
                  </p>
                  <Button onClick={start} loading={working}>
                    <ClipboardCheck className="h-4 w-4" />
                    Start task
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <label
                    htmlFor="completion-notes"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Completion notes{' '}
                    <span className="font-normal text-slate-400">
                      (optional)
                    </span>
                  </label>
                  <TextArea
                    id="completion-notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Anything the organiser should know about how it went…"
                  />
                  <div className="flex justify-end">
                    <Button onClick={complete} loading={working}>
                      <CheckCircle2 className="h-4 w-4" />
                      Mark complete
                    </Button>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </PageContainer>
  );
}

function Meta({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <div>
        <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {children}
        </p>
      </div>
    </div>
  );
}
