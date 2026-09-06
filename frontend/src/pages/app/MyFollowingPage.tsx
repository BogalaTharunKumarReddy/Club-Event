import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clubService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { PageContainer } from '@/components/layout/RootLayout';
import { ClubCard } from '@/components/domain/ClubCard';
import { EmptyState, ErrorState, PageHeader, Skeleton } from '@/components/ui';

/**
 * "Following" — every club the signed-in user follows, newest first. Following a
 * club means its newly published events land in the user's notifications.
 * Unfollowing from a card here removes it from the list immediately.
 */
export default function MyFollowingPage() {
  const { data: clubs, loading, error, reload, setData } = useQuery(
    () => clubService.myFollowing(),
    [],
  );

  return (
    <PageContainer>
      <PageHeader
        title="Following"
        description="Clubs you follow. You'll be notified when they publish new events."
      />

      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : !clubs || clubs.length === 0 ? (
          <EmptyState
            icon={<Heart className="h-6 w-6" />}
            title="You're not following any clubs yet"
            description="Follow a club to get notified when it posts new events."
            action={
              <Link to="/clubs" className="btn-primary">
                Browse clubs
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {clubs.map((c) => (
              <ClubCard
                key={c.id}
                club={c}
                onFollowChange={(following) => {
                  if (!following) {
                    setData((prev) => (prev ?? []).filter((x) => x.id !== c.id));
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
