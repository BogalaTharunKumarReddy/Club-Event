import { useEffect, useMemo, useState } from 'react';
import { Trophy } from 'lucide-react';
import { competitionService, eventService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { cn } from '@/lib/utils';
import { PageContainer } from '@/components/layout/RootLayout';
import { Leaderboard } from '@/components/domain/Leaderboard';
import {
  CompetitionStatusBadge,
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
} from '@/components/ui';
import type { CompetitionResponse } from '@/types';

/** How many events to scan for competitions. */
const EVENT_SCAN_SIZE = 100;

/**
 * Leaderboards hub — one place to watch every competition's standings live.
 *
 * There is no global "list all competitions" endpoint, so we scan the visible
 * events and fan out `competitions/forEvent` in parallel (failures per-event are
 * swallowed), then flatten the results. Picking one embeds the shared, live
 * <Leaderboard>, which subscribes to real-time score updates over STOMP.
 */
export default function LeaderboardsPage() {
  const { data, loading, error, reload } = useQuery<CompetitionResponse[]>(async () => {
    const page = await eventService.search({ size: EVENT_SCAN_SIZE });
    const perEvent = await Promise.all(
      page.content.map((ev) =>
        competitionService.forEvent(ev.id).catch(() => [] as CompetitionResponse[]),
      ),
    );
    return perEvent.flat();
  }, []);

  const competitions = useMemo(() => data ?? [], [data]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Default to the first competition once the list arrives.
  useEffect(() => {
    if (competitions.length > 0 && !competitions.some((c) => c.id === selectedId)) {
      setSelectedId(competitions[0].id);
    }
  }, [competitions, selectedId]);

  const selected = competitions.find((c) => c.id === selectedId) ?? null;

  return (
    <PageContainer>
      <PageHeader
        title="Leaderboards"
        description="Follow live competition standings from across every event as judges score each round."
      />

      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-6 w-6 text-brand-600" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : competitions.length === 0 ? (
          <EmptyState
            icon={<Trophy className="h-6 w-6" />}
            title="No competitions yet"
            description="When coordinators launch competitions, their live leaderboards will appear here."
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
            {/* Competition picker */}
            <aside className="space-y-2 lg:max-h-[640px] lg:overflow-y-auto lg:pr-1">
              {competitions.map((c) => {
                const active = c.id === selectedId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    className={cn(
                      'w-full rounded-lg border p-3 text-left transition-colors',
                      active
                        ? 'border-brand-500 bg-brand-50 dark:border-brand-500/60 dark:bg-brand-900/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {c.title}
                      </span>
                      <CompetitionStatusBadge status={c.status} />
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                      {c.eventTitle}
                    </p>
                  </button>
                );
              })}
            </aside>

            {/* Live standings for the selected competition */}
            <section className="card p-5">
              {selected ? (
                <>
                  <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                        {selected.title}
                      </h2>
                      <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                        {selected.eventTitle}
                      </p>
                    </div>
                    <CompetitionStatusBadge status={selected.status} />
                  </div>
                  <Leaderboard competitionId={selected.id} />
                </>
              ) : (
                <EmptyState
                  icon={<Trophy className="h-6 w-6" />}
                  title="Select a competition"
                  description="Choose a competition on the left to see its live leaderboard."
                />
              )}
            </section>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
