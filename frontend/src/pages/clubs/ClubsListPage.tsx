import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { clubService, type ClubSearchParams } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { useDebounce } from '@/hooks/useDebounce';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { PageContainer } from '@/components/layout/RootLayout';
import { ClubCard } from '@/components/domain/ClubCard';
import {
  EmptyState,
  ErrorState,
  PageHeader,
  Pagination,
  SkeletonCards,
  TextInput,
} from '@/components/ui';

export default function ClubsListPage() {
  const { t } = useTranslation();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const debouncedQ = useDebounce(q);

  const params = useMemo<ClubSearchParams>(
    () => ({ q: debouncedQ || undefined, active: true, page, size: DEFAULT_PAGE_SIZE }),
    [debouncedQ, page],
  );

  const { data, loading, error, reload } = useQuery(
    () => clubService.search(params),
    [params],
  );

  return (
    <PageContainer>
      <PageHeader
        title={t('clubs.title')}
        description="Find a community that matches your interests and get involved."
      />

      <div className="relative mt-6 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <TextInput
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(0);
          }}
          placeholder="Search clubs…"
          className="pl-9"
          aria-label="Search clubs"
        />
      </div>

      <div className="mt-6">
        {loading ? (
          <SkeletonCards count={6} />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : !data || data.content.length === 0 ? (
          <EmptyState title={t('clubs.noClubs')} description="Check back soon for new clubs." />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.content.map((club) => (
                <ClubCard key={club.id} club={club} />
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
