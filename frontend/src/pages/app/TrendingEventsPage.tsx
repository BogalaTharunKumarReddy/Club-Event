import { useMemo } from 'react';
import { Flame } from 'lucide-react';
import { eventService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { cn } from '@/lib/utils';
import { PageContainer } from '@/components/layout/RootLayout';
import { EventCard } from '@/components/domain/EventCard';
import { EmptyState, ErrorState, PageHeader, SkeletonCards } from '@/components/ui';

/** How many events to surface in the ranking. */
const TOP_N = 12;

/**
 * Trending events — the catalog re-ordered by popularity.
 *
 * There is no dedicated "trending" endpoint, so we pull a generous page of
 * visible (non-draft) events and rank them client-side by registration count.
 * The top three get medal-styled rank chips.
 */
export default function TrendingEventsPage() {
  const { data, loading, error, reload } = useQuery(
    () => eventService.search({ size: 100 }),
    [],
  );

  const trending = useMemo(() => {
    if (!data) return [];
    return [...data.content]
      .sort((a, b) => b.registeredCount - a.registeredCount)
      .slice(0, TOP_N);
  }, [data]);

  return (
    <PageContainer>
      <PageHeader
        title="Trending events"
        description="The most popular events right now, ranked by how many students have registered."
      />

      <div className="mt-6">
        {loading ? (
          <SkeletonCards count={6} />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : trending.length === 0 ? (
          <EmptyState
            icon={<Flame className="h-6 w-6" />}
            title="Nothing trending yet"
            description="Once students start registering for events, the most popular ones will show up here."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {trending.map((event, i) => (
              <div key={event.id} className="relative">
                <span
                  className={cn(
                    'absolute right-3 top-3 z-10 flex h-7 min-w-[1.75rem] items-center justify-center rounded-full px-2 text-xs font-bold shadow-md ring-2 ring-white dark:ring-slate-900',
                    i === 0
                      ? 'bg-amber-400 text-amber-950'
                      : i === 1
                        ? 'bg-slate-300 text-slate-800'
                        : i === 2
                          ? 'bg-amber-700 text-amber-50'
                          : 'bg-brand-600 text-white',
                  )}
                >
                  #{i + 1}
                </span>
                <EventCard event={event} />
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
