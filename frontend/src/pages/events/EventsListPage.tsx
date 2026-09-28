import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { eventService, type EventSearchParams } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { useDebounce } from '@/hooks/useDebounce';
import { EVENT_CATEGORIES, EVENT_MODE_LABELS, DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { PageContainer } from '@/components/layout/RootLayout';
import { EventCard } from '@/components/domain/EventCard';
import {
  EmptyState,
  ErrorState,
  PageHeader,
  Pagination,
  Select,
  SkeletonCards,
  TextInput,
} from '@/components/ui';
import type { EventMode } from '@/types';

export default function EventsListPage() {
  const { t } = useTranslation();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [mode, setMode] = useState<'' | EventMode>('');
  const [page, setPage] = useState(0);

  const debouncedQ = useDebounce(q);

  const params = useMemo<EventSearchParams>(
    () => ({
      q: debouncedQ || undefined,
      category: category || undefined,
      mode: mode || undefined,
      page,
      size: DEFAULT_PAGE_SIZE,
    }),
    [debouncedQ, category, mode, page],
  );

  const { data, loading, error, reload } = useQuery(
    () => eventService.search(params),
    [params],
  );

  // Any filter change resets to the first page.
  const onFilterChange = (fn: () => void) => {
    fn();
    setPage(0);
  };

  return (
    <PageContainer>
      <PageHeader
        title={t('events.title')}
        description="Browse and register for events happening across campus."
      />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <TextInput
            value={q}
            onChange={(e) => onFilterChange(() => setQ(e.target.value))}
            placeholder="Search events…"
            className="pl-9"
            aria-label="Search events"
          />
        </div>
        <div className="flex gap-3">
          <Select
            value={category}
            onChange={(e) => onFilterChange(() => setCategory(e.target.value))}
            aria-label="Filter by category"
            className="w-40"
          >
            <option value="">All categories</option>
            {EVENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select
            value={mode}
            onChange={(e) => onFilterChange(() => setMode(e.target.value as EventMode | ''))}
            aria-label="Filter by mode"
            className="w-36"
          >
            <option value="">All modes</option>
            {(Object.keys(EVENT_MODE_LABELS) as EventMode[]).map((m) => (
              <option key={m} value={m}>
                {EVENT_MODE_LABELS[m]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <SkeletonCards count={6} />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : !data || data.content.length === 0 ? (
          <EmptyState
            icon={<SlidersHorizontal className="h-6 w-6" />}
            title={t('events.noEvents')}
            description="Try clearing a filter or searching for something else."
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.content.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
            <div className="mt-8">
              <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}
