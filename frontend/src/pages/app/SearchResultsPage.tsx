import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Building2, CalendarDays, Search, Users as UsersIcon } from 'lucide-react';
import { searchService } from '@/lib/services';
import { ROLE_LABELS } from '@/lib/constants';
import { errorMessage } from '@/lib/utils';
import { PageContainer } from '@/components/layout/RootLayout';
import { EventCard } from '@/components/domain/EventCard';
import { ClubCard } from '@/components/domain/ClubCard';
import { Avatar } from '@/components/ui/Avatar';
import {
  EmptyState,
  ErrorState,
  PageHeader,
  SkeletonCards,
} from '@/components/ui';
import type { GlobalSearchResponse } from '@/types';

/** How many matches to request per type on the full results page. */
const PER_TYPE = 24;

/**
 * Full-page global search results. Reads the query from the `?q=` param (set by
 * the top-bar {@link GlobalSearch}), fetches a wider slice per type, and renders
 * events, clubs and — for admins — users in grouped sections. Re-runs whenever
 * the query param changes so it plays nicely with browser navigation.
 */
export default function SearchResultsPage() {
  const [params] = useSearchParams();
  const q = params.get('q')?.trim() ?? '';

  const [result, setResult] = useState<GlobalSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (q.length < 2) {
      setResult(null);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    searchService
      .global(q, PER_TYPE)
      .then((r) => {
        if (!cancelled) setResult(r);
      })
      .catch((e) => {
        if (!cancelled) setError(errorMessage(e, 'Search failed. Please try again.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [q]);

  const total = result
    ? result.totalEvents + result.totalClubs + result.totalUsers
    : 0;

  return (
    <PageContainer>
      <PageHeader
        title={q ? `Results for "${q}"` : 'Search'}
        description={
          result && !loading
            ? `${total} match${total === 1 ? '' : 'es'} across events, clubs${
                result.users.length > 0 ? ' and people' : ''
              }.`
            : 'Find events, clubs and people across the platform.'
        }
      />

      <div className="mt-6 space-y-10">
        {q.length < 2 ? (
          <EmptyState
            icon={<Search className="h-6 w-6" />}
            title="Type at least two characters"
            description="Use the search box in the top bar to look up events, clubs and people."
          />
        ) : loading ? (
          <SkeletonCards count={6} />
        ) : error ? (
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        ) : total === 0 ? (
          <EmptyState
            icon={<Search className="h-6 w-6" />}
            title={`No results for "${q}"`}
            description="Try a different keyword, or check your spelling."
          />
        ) : (
          <>
            {result!.events.length > 0 && (
              <section>
                <SectionHeading
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="Events"
                  count={result!.totalEvents}
                />
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {result!.events.map((e) => (
                    <EventCard key={e.id} event={e} />
                  ))}
                </div>
              </section>
            )}

            {result!.clubs.length > 0 && (
              <section>
                <SectionHeading
                  icon={<Building2 className="h-4 w-4" />}
                  label="Clubs"
                  count={result!.totalClubs}
                />
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {result!.clubs.map((c) => (
                    <ClubCard key={c.id} club={c} />
                  ))}
                </div>
              </section>
            )}

            {result!.users.length > 0 && (
              <section>
                <SectionHeading
                  icon={<UsersIcon className="h-4 w-4" />}
                  label="People"
                  count={result!.totalUsers}
                />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {result!.users.map((u) => (
                    <Link
                      key={u.id}
                      to={`/app/admin/users?q=${encodeURIComponent(u.email)}`}
                      className="card flex items-center gap-3 p-3 transition-shadow hover:shadow-md"
                    >
                      <Avatar name={u.fullName} src={u.profilePhotoUrl} size="md" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                          {u.fullName}
                        </p>
                        <p className="truncate text-xs text-slate-400">{u.email}</p>
                        <p className="mt-0.5 text-[11px] font-medium text-brand-600 dark:text-brand-400">
                          {ROLE_LABELS[u.role]}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
}

function SectionHeading({
  icon,
  label,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-300">
        {icon}
      </span>
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        {label}
      </h2>
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        {count}
      </span>
    </div>
  );
}
