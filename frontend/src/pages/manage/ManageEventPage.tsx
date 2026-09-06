import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  BarChart3,
  CalendarClock,
  HandHeart,
  ImageIcon,
  Megaphone,
  MessageSquare,
  Pencil,
  QrCode,
  Star,
  Trash2,
  Trophy,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { eventService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { cn, formatDateTime } from '@/lib/utils';
import { PageContainer } from '@/components/layout/RootLayout';
import {
  Button,
  ConfirmDialog,
  ErrorState,
  EventStatusBadge,
  PageHeader,
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
  RegistrationsTab,
  ScheduleTab,
  VolunteersTab,
} from './eventTabs';

type Tab =
  | 'overview'
  | 'registrations'
  | 'attendance'
  | 'schedule'
  | 'volunteers'
  | 'competitions'
  | 'certificates'
  | 'announcements'
  | 'gallery'
  | 'discussion'
  | 'feedback';

const TABS: Array<{ key: Tab; label: string; icon: React.ReactNode }> = [
  { key: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
  { key: 'registrations', label: 'Registrations', icon: <Users className="h-4 w-4" /> },
  { key: 'attendance', label: 'Attendance', icon: <QrCode className="h-4 w-4" /> },
  { key: 'schedule', label: 'Schedule', icon: <CalendarClock className="h-4 w-4" /> },
  { key: 'volunteers', label: 'Volunteers', icon: <HandHeart className="h-4 w-4" /> },
  { key: 'competitions', label: 'Competitions', icon: <Trophy className="h-4 w-4" /> },
  { key: 'certificates', label: 'Certificates', icon: <Award className="h-4 w-4" /> },
  { key: 'announcements', label: 'Announcements', icon: <Megaphone className="h-4 w-4" /> },
  { key: 'gallery', label: 'Gallery', icon: <ImageIcon className="h-4 w-4" /> },
  { key: 'discussion', label: 'Discussion', icon: <MessageSquare className="h-4 w-4" /> },
  { key: 'feedback', label: 'Feedback', icon: <Star className="h-4 w-4" /> },
];

export default function ManageEventPage() {
  const { id } = useParams();
  const eventId = Number(id);
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const { data: event, loading, error, reload } = useQuery(
    () => eventService.getById(eventId),
    [eventId],
  );

  // Thrown errors surface inside the ConfirmDialog; navigation only runs on success.
  async function confirmDelete() {
    if (!event) return;
    await eventService.remove(eventId);
    toast.success('Event deleted.');
    navigate(`/app/manage/clubs/${event.clubId}`);
  }

  // Render the loader INSIDE the layout content area — a bare full-viewport
  // FullPageLoader would sit on top of the AppLayout sidebar and make it look
  // like the sidebar had vanished while the event loads.
  if (loading) {
    return (
      <PageContainer>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Spinner className="h-8 w-8 text-brand-600" />
        </div>
      </PageContainer>
    );
  }
  if (error || !event) {
    return (
      <PageContainer>
        <ErrorState message={error ?? 'Event not found.'} onRetry={reload} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Link
        to={`/app/manage/clubs/${event.clubId}`}
        className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" /> {event.clubName}
      </Link>
      <PageHeader
        title={event.title}
        description={
          <span className="flex items-center gap-2">
            <EventStatusBadge status={event.status} /> · {formatDateTime(event.startDateTime)}
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Link to={`/app/manage/events/${event.id}/edit`} className="btn-secondary text-sm">
              <Pencil className="h-4 w-4" /> Edit
            </Link>
            <Button variant="danger" size="sm" onClick={() => setConfirmDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-700">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'relative -mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition',
              tab === t.key
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200',
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'overview' && <OverviewTab eventId={eventId} eventStatus={event.status} onChanged={reload} />}
        {tab === 'registrations' && <RegistrationsTab eventId={eventId} />}
        {tab === 'attendance' && <AttendanceTab eventId={eventId} />}
        {tab === 'schedule' && <ScheduleTab eventId={eventId} />}
        {tab === 'volunteers' && <VolunteersTab eventId={eventId} />}
        {tab === 'competitions' && <CompetitionsTab eventId={eventId} teamEvent={event.teamEvent} />}
        {tab === 'certificates' && <CertificatesTab eventId={eventId} />}
        {tab === 'announcements' && <AnnouncementsTab eventId={eventId} eventTitle={event.title} />}
        {tab === 'gallery' && <GalleryTab eventId={eventId} />}
        {tab === 'discussion' && <DiscussionTab eventId={eventId} />}
        {tab === 'feedback' && <FeedbackTab eventId={eventId} />}
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete event?"
        message={`Permanently delete "${event.title}" and all of its registrations, attendance, competitions and certificates? This cannot be undone.`}
        confirmLabel="Delete event"
        danger
      />
    </PageContainer>
  );
}
