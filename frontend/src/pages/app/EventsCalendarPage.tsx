import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { eventService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { cn, formatTime } from '@/lib/utils';
import { PageContainer } from '@/components/layout/RootLayout';
import { Button, EmptyState, ErrorState, PageHeader, Skeleton } from '@/components/ui';
import type { EventSummaryResponse } from '@/types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
/** Chips shown per day before collapsing into a "+N more" line. */
const MAX_CHIPS = 3;

/**
 * Month-grid calendar of every visible event.
 *
 * Events are fetched once and bucketed by start date; month navigation is
 * purely client-side, so paging back and forth never hits the network again.
 */
export default function EventsCalendarPage() {
  const [cursor, setCursor] = useState(() => new Date());

  const { data, loading, error, reload } = useQuery(
    () => eventService.search({ size: 200 }),
    [],
  );

  // Bucket events by calendar day (yyyy-MM-dd), each list ordered by start time.
  const eventsByDay = useMemo(() => {
    const map = new Map<string, EventSummaryResponse[]>();
    if (!data) return map;
    for (const ev of data.content) {
      const key = format(parseISO(ev.startDateTime), 'yyyy-MM-dd');
      const bucket = map.get(key);
      if (bucket) bucket.push(ev);
      else map.set(key, [ev]);
    }
    for (const bucket of map.values()) {
      bucket.sort((a, b) => a.startDateTime.localeCompare(b.startDateTime));
    }
    return map;
  }, [data]);

  const days = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 });
    const gridEnd = endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [cursor]);

  const totalThisMonth = useMemo(
    () =>
      days.reduce((sum, day) => {
        if (!isSameMonth(day, cursor)) return sum;
        return sum + (eventsByDay.get(format(day, 'yyyy-MM-dd'))?.length ?? 0);
      }, 0),
    [days, cursor, eventsByDay],
  );

  return (
    <PageContainer>
      <PageHeader
        title="Events calendar"
        description="See everything happening across campus, laid out month by month."
      />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {format(cursor, 'MMMM yyyy')}
          </h2>
          {!loading && !error && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {totalThisMonth} {totalThisMonth === 1 ? 'event' : 'events'} this month
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            aria-label="Previous month"
            onClick={() => setCursor((c) => subMonths(c, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setCursor(new Date())}>
            Today
          </Button>
          <Button
            variant="secondary"
            size="sm"
            aria-label="Next month"
            onClick={() => setCursor((c) => addMonths(c, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4">
        {loading ? (
          <Skeleton className="h-[560px] w-full rounded-xl" />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[720px] overflow-hidden rounded-xl border-l border-t border-slate-200 dark:border-slate-800">
              {/* Weekday header */}
              <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-900">
                {WEEKDAYS.map((d) => (
                  <div
                    key={d}
                    className="border-b border-r border-slate-200 px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7">
                {days.map((day) => {
                  const key = format(day, 'yyyy-MM-dd');
                  const dayEvents = eventsByDay.get(key) ?? [];
                  const inMonth = isSameMonth(day, cursor);
                  return (
                    <div
                      key={key}
                      className={cn(
                        'min-h-[108px] border-b border-r border-slate-200 p-1.5 dark:border-slate-800',
                        !inMonth && 'bg-slate-50/60 dark:bg-slate-900/40',
                      )}
                    >
                      <div className="mb-1 flex justify-end">
                        <span
                          className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-full text-xs',
                            isToday(day)
                              ? 'bg-brand-600 font-semibold text-white'
                              : inMonth
                                ? 'text-slate-600 dark:text-slate-300'
                                : 'text-slate-300 dark:text-slate-600',
                          )}
                        >
                          {format(day, 'd')}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, MAX_CHIPS).map((ev) => (
                          <Link
                            key={ev.id}
                            to={`/events/${ev.id}`}
                            title={ev.title}
                            className="block truncate rounded bg-brand-50 px-1.5 py-1 text-[11px] font-medium text-brand-700 transition-colors hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-300 dark:hover:bg-brand-900/50"
                          >
                            <span className="text-brand-400 dark:text-brand-500">
                              {formatTime(ev.startDateTime)}
                            </span>{' '}
                            {ev.title}
                          </Link>
                        ))}
                        {dayEvents.length > MAX_CHIPS && (
                          <p className="px-1 text-[11px] font-medium text-slate-400">
                            +{dayEvents.length - MAX_CHIPS} more
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {!loading && !error && data && data.content.length === 0 && (
          <div className="mt-6">
            <EmptyState
              icon={<CalendarDays className="h-6 w-6" />}
              title="No events scheduled"
              description="When clubs publish events, they'll appear on this calendar."
            />
          </div>
        )}
      </div>
    </PageContainer>
  );
}
