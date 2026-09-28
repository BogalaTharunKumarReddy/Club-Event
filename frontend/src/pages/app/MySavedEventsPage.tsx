import { Bookmark } from 'lucide-react';
<<<<<<< HEAD
=======
import { Link } from 'react-router-dom';
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
import { eventService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { PageContainer } from '@/components/layout/RootLayout';
import { EventCard } from '@/components/domain/EventCard';
import { EmptyState, ErrorState, PageHeader, Skeleton } from '@/components/ui';

/**
 * "Saved events" — every event the signed-in user has bookmarked, newest first.
 * Un-saving an event from a card here removes it from the list immediately.
 */
export default function MySavedEventsPage() {
  const { data: events, loading, error, reload, setData } = useQuery(
    () => eventService.mySaved(),
    [],
  );

  return (
    <PageContainer>
      <PageHeader
        title="Saved events"
        description="Events you've bookmarked to come back to."
      />

      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : !events || events.length === 0 ? (
          <EmptyState
            icon={<Bookmark className="h-6 w-6" />}
            title="No saved events yet"
            description="Tap the bookmark on any event to save it here for later."
<<<<<<< HEAD
=======
            action={
              <Link to="/events" className="btn-primary">
                Browse events
              </Link>
            }
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <EventCard
                key={e.id}
                event={e}
                onSavedChange={(saved) => {
                  // Dropping the bookmark here means it no longer belongs on this list.
                  if (!saved) {
                    setData((prev) => (prev ?? []).filter((x) => x.id !== e.id));
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
