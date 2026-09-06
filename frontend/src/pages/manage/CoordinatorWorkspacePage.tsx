import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  BarChart3,
  CalendarClock,
  CreditCard,
  HandHeart,
  ImageIcon,
  Megaphone,
  MessageSquare,
  QrCode,
  Settings2,
  Star,
  Trophy,
  Users,
} from 'lucide-react';
import { clubService, eventService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { EVENT_STATUS_LABELS } from '@/lib/constants';
import { PageContainer } from '@/components/layout/RootLayout';
import {
  EmptyState,
  ErrorState,
  PageHeader,
  Select,
  Spinner,
} from '@/components/ui';
import {
  AnnouncementsTab,
  AttendanceTab,
  CertificatesTab,
  CompetitionsTab,
  DiscussionTab,
  FeedbackTab,
  GalleryTab,
  OverviewTab,
  PaymentsTab,
  RegistrationsTab,
  ScheduleTab,
  VolunteersTab,
} from './eventTabs';
import type { EventSummaryResponse } from '@/types';

/**
 * The event-management panels (Overview → Feedback) are also reachable as
 * standalone sidebar entries. Each one is scoped to a single event, so this
 * workspace wraps the shared tab component in an event picker: the coordinator
 * chooses one of the events they manage (across every club they coordinate) and
 * the chosen panel renders below. The selection is remembered in localStorage so
 * switching between sidebar sections keeps the same event in focus.
 */

export type WorkspaceSection =
  | 'overview'
  | 'registrations'
  | 'attendance'
  | 'schedule'
  | 'volunteers'
  | 'competitions'
  | 'certificates'
  | 'payments'
  | 'announcements'
  | 'gallery'
  | 'discussion'
  | 'feedback';

const SECTION_META: Record<
  WorkspaceSection,
  { title: string; description: string; icon: ReactNode }
> = {
  overview: {
    title: 'Overview',
    description: 'Live stats, status controls and the Excel report for the selected event.',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  registrations: {
    title: 'Registrations',
    description: 'Everyone registered for the selected event, with ticket codes and status.',
    icon: <Users className="h-5 w-5" />,
  },
  attendance: {
    title: 'Attendance',
    description: 'Check attendees in by ticket code or manually, and track check-outs.',
    icon: <QrCode className="h-5 w-5" />,
  },
  schedule: {
    title: 'Schedule',
    description: 'Build the agenda — sessions, talks and breaks — for the selected event.',
    icon: <CalendarClock className="h-5 w-5" />,
  },
  volunteers: {
    title: 'Volunteers',
    description: 'Recruit and approve volunteers, then assign and track their tasks.',
    icon: <HandHeart className="h-5 w-5" />,
  },
  competitions: {
    title: 'Competitions',
    description: 'Manage competitions, rounds, judges and live scoring under this event.',
    icon: <Trophy className="h-5 w-5" />,
  },
  certificates: {
    title: 'Certificates',
    description: 'Issue participation, winner and merit certificates for the selected event.',
    icon: <Award className="h-5 w-5" />,
  },
  payments: {
    title: 'Payments',
    description: 'Track entry-fee payments for the selected event and issue refunds.',
    icon: <CreditCard className="h-5 w-5" />,
  },
  announcements: {
    title: 'Announcements',
    description: 'Post updates to everyone registered for the selected event.',
    icon: <Megaphone className="h-5 w-5" />,
  },
  gallery: {
    title: 'Gallery',
    description: 'Add photo highlights and video recaps attendees see on the event page.',
    icon: <ImageIcon className="h-5 w-5" />,
  },
  discussion: {
    title: 'Discussion & Q&A',
    description: 'Answer attendee questions, pin important notes and resolve threads for the selected event.',
    icon: <MessageSquare className="h-5 w-5" />,
  },
  feedback: {
    title: 'Feedback',
    description: 'Ratings, distribution and attendee comments for the selected event.',
    icon: <Star className="h-5 w-5" />,
  },
};

const SELECTED_EVENT_KEY = 'cc:coordinator:selectedEventId';

/** Every event the current user can manage, across all clubs they coordinate. */
async function loadCoordinatorEvents(): Promise<EventSummaryResponse[]> {
  const memberships = await clubService.myMemberships();
  const coordinatorClubs = memberships.filter(
    (m) => m.clubRole === 'COORDINATOR' && m.status === 'ACTIVE',
  );
  if (coordinatorClubs.length === 0) return [];

  const pages = await Promise.all(
    coordinatorClubs.map((c) =>
      eventService.search({ clubId: c.clubId, includeDrafts: true, size: 100 }),
    ),
  );

  const seen = new Set<number>();
  const events: EventSummaryResponse[] = [];
  for (const page of pages) {
    for (const ev of page.content) {
      if (!seen.has(ev.id)) {
        seen.add(ev.id);
        events.push(ev);
      }
    }
  }
  events.sort(
    (a, b) => new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime(),
  );
  return events;
}

export default function CoordinatorWorkspacePage({ section }: { section: WorkspaceSection }) {
  const meta = SECTION_META[section];
  const { data: events, loading, error, reload } = useQuery(loadCoordinatorEvents, []);

  const [selectedId, setSelectedId] = useState<number | null>(() => {
    const raw = localStorage.getItem(SELECTED_EVENT_KEY);
    return raw ? Number(raw) : null;
  });

  useEffect(() => {
    if (selectedId != null) localStorage.setItem(SELECTED_EVENT_KEY, String(selectedId));
  }, [selectedId]);

  const selectedEvent = useMemo(() => {
    if (!events || events.length === 0) return null;
    return events.find((e) => e.id === selectedId) ?? events[0];
  }, [events, selectedId]);

  return (
    <PageContainer>
      <PageHeader title={meta.title} description={meta.description} />

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner className="h-7 w-7 text-brand-600" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !events || events.length === 0 ? (
        <EmptyState
          icon={meta.icon}
          title="No events to manage yet"
          description="Create an event from your coordinator tools, then manage it here."
          action={
            <Link to="/app/manage" className="btn-primary">
              <Settings2 className="h-4 w-4" /> Go to coordinator tools
            </Link>
          }
        />
      ) : (
        <div className="mt-6 space-y-6">
          {/* Event picker — shared across every coordinator workspace section. */}
          <div className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full sm:max-w-md">
              <label htmlFor="ws-event" className="label flex items-center gap-2">
                <span className="text-brand-600">{meta.icon}</span>
                Event
              </label>
              <Select
                id="ws-event"
                value={selectedEvent ? String(selectedEvent.id) : ''}
                onChange={(e) => setSelectedId(Number(e.target.value))}
              >
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title} — {e.clubName} · {EVENT_STATUS_LABELS[e.status]}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Section panel for the selected event. */}
          {selectedEvent && (
            <WorkspacePanel section={section} event={selectedEvent} onChanged={reload} />
          )}
        </div>
      )}
    </PageContainer>
  );
}

function WorkspacePanel({
  section,
  event,
  onChanged,
}: {
  section: WorkspaceSection;
  event: EventSummaryResponse;
  onChanged: () => void;
}) {
  switch (section) {
    case 'overview':
      return <OverviewTab eventId={event.id} eventStatus={event.status} onChanged={onChanged} />;
    case 'registrations':
      return <RegistrationsTab eventId={event.id} />;
    case 'attendance':
      return <AttendanceTab eventId={event.id} />;
    case 'schedule':
      return <ScheduleTab eventId={event.id} />;
    case 'volunteers':
      return <VolunteersTab eventId={event.id} />;
    case 'competitions':
      return <CompetitionsTab eventId={event.id} teamEvent={event.teamEvent} />;
    case 'certificates':
      return <CertificatesTab eventId={event.id} />;
    case 'payments':
      return <PaymentsTab eventId={event.id} />;
    case 'announcements':
      return <AnnouncementsTab eventId={event.id} eventTitle={event.title} />;
    case 'gallery':
      return <GalleryTab eventId={event.id} />;
    case 'discussion':
      return <DiscussionTab eventId={event.id} />;
    case 'feedback':
      return <FeedbackTab eventId={event.id} />;
  }
}
