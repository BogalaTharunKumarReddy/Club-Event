import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, Clock, MapPin } from 'lucide-react';
import { volunteerService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { cn, formatDateTime } from '@/lib/utils';
import {
  VOLUNTEER_TASK_PRIORITY_LABELS,
  VOLUNTEER_TASK_PRIORITY_STYLES,
  VOLUNTEER_TASK_STATUS_LABELS,
  VOLUNTEER_TASK_STATUS_STYLES,
} from '@/lib/constants';
import { PageContainer } from '@/components/layout/RootLayout';
import { EmptyState, ErrorState, PageHeader, Skeleton } from '@/components/ui';
import type { VolunteerTaskResponse, VolunteerTaskStatus } from '@/types';

type Filter = 'ALL' | 'OPEN' | VolunteerTaskStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'OPEN', label: 'Open' },
  { key: 'ALL', label: 'All' },
  { key: 'IN_PROGRESS', label: 'In progress' },
  { key: 'COMPLETED', label: 'Completed' },
];

/**
 * "My tasks" — the volunteer's task queue across every event, with a light
 * status filter. Each row opens the task detail where it can be started or
 * completed.
 */
export default function VolunteerTasksPage() {
  const { data, loading, error, reload } = useQuery(
    () => volunteerService.myTasks(),
    [],
  );
  const [filter, setFilter] = useState<Filter>('OPEN');

  const visible = useMemo(() => {
    const tasks = data ?? [];
    if (filter === 'ALL') return tasks;
    if (filter === 'OPEN') {
      return tasks.filter(
        (t) => t.status === 'PENDING' || t.status === 'IN_PROGRESS',
      );
    }
    return tasks.filter((t) => t.status === filter);
  }, [data, filter]);

  return (
    <PageContainer>
      <PageHeader
        title="My tasks"
        description="Everything you've been asked to help with, across your events."
      />

      <div className="mt-6 space-y-5">
        {!loading && !error && data && data.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                  filter === f.key
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-900/30 dark:text-brand-300'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : !data || data.length === 0 ? (
          <EmptyState
            icon={<ClipboardCheck className="h-6 w-6" />}
            title="No tasks assigned"
            description="Tasks a coordinator assigns you for an event will appear here."
          />
        ) : visible.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400 dark:border-slate-700">
            No tasks match this filter.
          </p>
        ) : (
          <ul className="space-y-3">
            {visible.map((t) => (
              <li key={t.id}>
                <TaskRow task={t} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageContainer>
  );
}

function TaskRow({ task: t }: { task: VolunteerTaskResponse }) {
  return (
    <Link
      to={`/app/volunteer/tasks/${t.id}`}
      className="card block p-5 transition hover:border-brand-300 hover:shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              {t.title}
            </p>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[11px] font-medium',
                VOLUNTEER_TASK_PRIORITY_STYLES[t.priority],
              )}
            >
              {VOLUNTEER_TASK_PRIORITY_LABELS[t.priority]}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
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
      </div>

      {(t.startTime || t.location) && (
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          {t.startTime && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {formatDateTime(t.startTime)}
            </span>
          )}
          {t.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {t.location}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
