import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  CalendarPlus,
  Clock,
  CreditCard,
  Download,
  ExternalLink,
  HandHeart,
  MapPin,
  QrCode,
  Star,
  Ticket,
  Trophy,
  Users,
  Wifi,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  announcementService,
  competitionService,
  eventService,
  feedbackService,
  paymentService,
  registrationService,
  teamService,
  volunteerService,
} from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { EVENT_MODE_LABELS } from '@/lib/constants';
import {
  cn,
  downloadBlob,
  errorMessage,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTime,
  isPast,
} from '@/lib/utils';
import { PageContainer } from '@/components/layout/RootLayout';
import { AnnouncementList } from '@/components/domain/AnnouncementList';
import { MediaGallery } from '@/components/domain/MediaGallery';
import { EventComments } from '@/components/domain/EventComments';
import { SaveEventButton } from '@/components/domain/SaveEventButton';
import { TicketModal } from '@/components/domain/TicketModal';
import {
  Badge,
  Button,
  CompetitionStatusBadge,
  EmptyState,
  ErrorState,
  EventStatusBadge,
  Field,
  FullPageLoader,
  Modal,
  PaymentStatusBadge,
  TextArea,
  TextInput,
} from '@/components/ui';
import type {
  EventResponse,
  FeedbackResponse,
  PaymentResponse,
  RegistrationResponse,
  TeamResponse,
  VolunteerResponse,
} from '@/types';

type Tab = 'about' | 'schedule' | 'competitions' | 'gallery' | 'discussion' | 'announcements';

const REGISTRABLE_STATUSES = ['PUBLISHED', 'UPCOMING', 'ONGOING'];

/** Statuses for which volunteering still makes sense (not finished/cancelled). */
const VOLUNTEERABLE_STATUSES = ['PUBLISHED', 'UPCOMING', 'ONGOING'];

export default function EventDetailPage() {
  const { id } = useParams();
  const eventId = Number(id);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [tab, setTab] = useState<Tab>('about');
  const [ticketOpen, setTicketOpen] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [working, setWorking] = useState(false);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);

  const {
    data: event,
    loading,
    error,
    reload: reloadEvent,
  } = useQuery(() => eventService.getById(eventId), [eventId]);

  const { data: schedule } = useQuery(() => eventService.schedule(eventId), [eventId]);
  const { data: competitions } = useQuery(
    () => competitionService.forEvent(eventId),
    [eventId],
  );
  const { data: announcements } = useQuery(
    () => announcementService.forEvent(eventId).catch(() => []),
    [eventId],
  );

  const { data: myReg, reload: reloadReg } = useQuery<RegistrationResponse | null>(
    () =>
      isAuthenticated
        ? registrationService.myForEvent(eventId).catch(() => null)
        : Promise.resolve(null),
    [eventId, isAuthenticated],
  );

  const { data: myTeams, reload: reloadTeams } = useQuery<TeamResponse[]>(
    () =>
      isAuthenticated && event?.teamEvent
        ? teamService.mine().catch(() => [])
        : Promise.resolve([]),
    [eventId, isAuthenticated, event?.teamEvent],
  );

  const { data: myPayments, reload: reloadPayments } = useQuery<PaymentResponse[]>(
    () =>
      isAuthenticated && event?.paidEvent
        ? paymentService.mine().catch(() => [])
        : Promise.resolve([]),
    [eventId, isAuthenticated, event?.paidEvent],
  );

  const { data: myFeedback, reload: reloadFeedback } = useQuery<FeedbackResponse | null>(
    () =>
      isAuthenticated
        ? feedbackService.myForEvent(eventId).catch(() => null)
        : Promise.resolve(null),
    [eventId, isAuthenticated],
  );

  const myTeamForEvent = useMemo(
    () => myTeams?.find((t) => t.eventId === eventId) ?? null,
    [myTeams, eventId],
  );

  const eventPayment = useMemo(() => {
    const forEvent = (myPayments ?? []).filter((p) => p.eventId === eventId);
    return (
      forEvent.find((p) => p.status === 'SUCCESS') ??
      forEvent.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0] ??
      null
    );
  }, [myPayments, eventId]);

  if (loading) return <FullPageLoader />;
  if (error || !event) {
    return (
      <PageContainer>
        <ErrorState message={error ?? 'Event not found.'} onRetry={reloadEvent} />
      </PageContainer>
    );
  }

  const isRegistered = !!myReg && myReg.status !== 'CANCELLED';
  const isWaitlisted = myReg?.status === 'WAITLISTED';
  const deadlinePassed = event.registrationDeadline
    ? isPast(event.registrationDeadline)
    : false;
  const registrationOpen =
    REGISTRABLE_STATUSES.includes(event.status) && !deadlinePassed;
  const isFull =
    typeof event.capacity === 'number' && event.registeredCount >= event.capacity;
  const paidUnsettled =
    event.paidEvent && isRegistered && !isWaitlisted && eventPayment?.status !== 'SUCCESS';

  /* ------------------------------ actions ------------------------------ */

  async function handleIndividualRegister() {
    setWorking(true);
    try {
      const reg = await registrationService.register({ eventId });
      toast.success(
        reg.status === 'WAITLISTED'
          ? "You're on the waitlist — we'll let you know if a spot opens up."
          : 'You are registered!',
      );
      reloadReg();
      reloadEvent();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not register.'));
    } finally {
      setWorking(false);
    }
  }

  async function handleCancel() {
    if (!myReg) return;
    setWorking(true);
    try {
      await registrationService.cancel(myReg.id);
      toast.success(isWaitlisted ? 'You left the waitlist.' : 'Registration cancelled.');
      reloadReg();
      reloadEvent();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not cancel.'));
    } finally {
      setWorking(false);
    }
  }

  async function handlePay() {
    setWorking(true);
    try {
      const payment = await paymentService.initiate({ eventId });
      if (payment.status === 'SUCCESS') toast.success('Payment successful!');
      else if (payment.status === 'PENDING') toast('Payment initiated.', { icon: '⏳' });
      else toast.error('Payment did not complete.');
      reloadPayments();
    } catch (err) {
      toast.error(errorMessage(err, 'Payment could not be started.'));
    } finally {
      setWorking(false);
    }
  }

  async function handleDownloadReceipt() {
    if (!eventPayment) return;
    setDownloadingReceipt(true);
    try {
      const blob = await paymentService.receipt(eventPayment.id);
      const ref = eventPayment.receiptNumber ?? eventPayment.id;
      downloadBlob(blob, `receipt-${ref}.pdf`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not download the receipt.'));
    } finally {
      setDownloadingReceipt(false);
    }
  }

  /* ------------------------------- render ------------------------------- */

  const TABS: { key: Tab; label: string; show: boolean }[] = [
    { key: 'about', label: 'About', show: true },
    { key: 'schedule', label: 'Schedule', show: (schedule?.length ?? 0) > 0 },
    {
      key: 'competitions',
      label: 'Competitions',
      show: (competitions?.length ?? 0) > 0,
    },
    { key: 'gallery', label: 'Gallery', show: true },
    { key: 'discussion', label: 'Discussion', show: true },
    { key: 'announcements', label: 'Announcements', show: true },
  ];

  return (
    <div>
      {/* Banner */}
      <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-brand-600 to-indigo-800 sm:h-72">
        {event.bannerUrl && (
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-7xl px-4 pb-5 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-3 inline-flex items-center gap-1 text-sm text-white/80 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <EventStatusBadge status={event.status} />
            {event.category && (
              <Badge className="bg-white/15 text-white">{event.category}</Badge>
            )}
            {event.teamEvent && (
              <Badge className="bg-indigo-500/80 text-white">Team event</Badge>
            )}
          </div>
          <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">{event.title}</h1>
          <Link
            to={`/clubs/${event.clubId}`}
            className="text-sm text-white/80 hover:text-white"
          >
            by {event.clubName}
          </Link>
        </div>
      </div>

      <PageContainer>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main column */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="mb-5 flex gap-1 border-b border-slate-200 dark:border-slate-800">
              {TABS.filter((t) => t.show).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    '-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition',
                    tab === t.key
                      ? 'border-brand-600 text-brand-700 dark:text-brand-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'about' && (
              <div className="space-y-6">
                {event.description && (
                  <section>
                    <h3 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">
                      About this event
                    </h3>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {event.description}
                    </p>
                  </section>
                )}
                {event.rules && (
                  <section>
                    <h3 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">
                      Rules
                    </h3>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {event.rules}
                    </p>
                  </section>
                )}
                {event.instructions && (
                  <section>
                    <h3 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">
                      Instructions
                    </h3>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {event.instructions}
                    </p>
                  </section>
                )}
                {event.teamEvent && (
                  <section className="card p-4">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      Team size
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      {event.minTeamSize ?? 1}–{event.maxTeamSize ?? '∞'} members per team.
                    </p>
                  </section>
                )}
                {!event.description && !event.rules && !event.instructions && (
                  <EmptyState title="No details provided" />
                )}

                {/* Feedback (after completion) */}
                {isAuthenticated && isRegistered && event.status === 'COMPLETED' && (
                  <FeedbackSection
                    eventId={eventId}
                    existing={myFeedback}
                    onSubmitted={reloadFeedback}
                  />
                )}
              </div>
            )}

            {tab === 'schedule' && (
              <ol className="space-y-3">
                {schedule?.map((s) => (
                  <li key={s.id} className="card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                          {s.title}
                        </h4>
                        {s.speaker && (
                          <p className="text-xs text-brand-600 dark:text-brand-400">
                            {s.speaker}
                          </p>
                        )}
                      </div>
                      {s.dayNumber && <Badge>Day {s.dayNumber}</Badge>}
                    </div>
                    {s.description && (
                      <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
                        {s.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDateTime(s.startDateTime)}
                        {s.endDateTime ? ` – ${formatTime(s.endDateTime)}` : ''}
                      </span>
                      {s.venue && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {s.venue}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}

            {tab === 'competitions' && (
              <div className="space-y-3">
                {competitions?.map((c) => (
                  <Link
                    key={c.id}
                    to={`/events/${eventId}#competition-${c.id}`}
                    className="card flex items-center justify-between p-4 transition-shadow hover:shadow-md"
                    onClick={(e) => e.preventDefault()}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                          {c.title}
                        </h4>
                        <CompetitionStatusBadge status={c.status} />
                      </div>
                      {c.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                          {c.description}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-slate-400">
                        {c.roundCount} rounds · {c.teamBased ? 'Team-based' : 'Individual'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {tab === 'announcements' && (
              <AnnouncementList announcements={announcements ?? []} />
            )}

            {tab === 'gallery' && <MediaGallery eventId={eventId} />}

            {tab === 'discussion' && (
              <EventComments eventId={eventId} canModerate={user?.role === 'ADMIN'} />
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <div className="card p-5">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
                  <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div>
                    <div>{formatDateTime(event.startDateTime)}</div>
                    <div className="text-xs text-slate-400">
                      to {formatDateTime(event.endDateTime)}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
                  {event.mode === 'ONLINE' ? (
                    <Wifi className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  ) : (
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  )}
                  <div>
                    <div>{EVENT_MODE_LABELS[event.mode]}</div>
                    {event.venue && <div className="text-xs text-slate-400">{event.venue}</div>}
                    {event.mode !== 'OFFLINE' && event.onlineUrl && isRegistered && (
                      <a
                        href={event.onlineUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                      >
                        Join link <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                  <Users className="h-4 w-4 shrink-0 text-slate-400" />
                  <span>
                    {event.registeredCount}
                    {event.capacity ? ` / ${event.capacity}` : ''} registered
                  </span>
                </div>
                {event.registrationDeadline && (
                  <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                    <Clock className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className={cn(deadlinePassed && 'text-red-500')}>
                      Register by {formatDate(event.registrationDeadline)}
                    </span>
                  </div>
                )}
              </div>

              <div className="my-4 border-t border-slate-100 dark:border-slate-800" />

              <div className="mb-4 flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-wide text-slate-400">Fee</span>
                <span
                  className={cn(
                    'text-lg font-bold',
                    event.paidEvent ? 'text-slate-900 dark:text-slate-100' : 'text-green-600',
                  )}
                >
                  {event.paidEvent ? formatCurrency(event.fee) : 'Free'}
                </span>
              </div>

              {/* Action area */}
              {!isAuthenticated ? (
                <Button
                  fullWidth
                  onClick={() =>
                    navigate('/login', { state: { from: { pathname: `/events/${eventId}` } } })
                  }
                >
                  Log in to register
                </Button>
              ) : isRegistered ? (
                <div className="space-y-2">
                  {isWaitlisted ? (
                    <div className="rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                      <div className="flex items-center gap-2 font-medium">
                        <Clock className="h-4 w-4" /> You're on the waitlist
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-amber-700 dark:text-amber-300/90">
                        This event is full. We'll move you in automatically and notify you
                        the moment a spot opens up.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 py-2 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        <Ticket className="h-4 w-4" /> You're registered
                      </div>
                      <Button variant="secondary" fullWidth onClick={() => setTicketOpen(true)}>
                        <QrCode className="h-4 w-4" /> View ticket
                      </Button>
                      {paidUnsettled && (
                        <Button fullWidth loading={working} onClick={handlePay}>
                          <CreditCard className="h-4 w-4" /> Pay {formatCurrency(event.fee)}
                        </Button>
                      )}
                      {eventPayment && (
                        <div className="space-y-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">Payment</span>
                            <PaymentStatusBadge status={eventPayment.status} />
                          </div>
                          {(eventPayment.status === 'SUCCESS' ||
                            eventPayment.status === 'REFUNDED') && (
                            <Button
                              variant="secondary"
                              size="sm"
                              fullWidth
                              loading={downloadingReceipt}
                              onClick={handleDownloadReceipt}
                            >
                              <Download className="h-4 w-4" /> Download receipt
                            </Button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                  {event.teamEvent && myTeamForEvent && (
                    <Link
                      to={`/app/teams/${myTeamForEvent.id}`}
                      className="btn-secondary w-full justify-center"
                    >
                      <Users className="h-4 w-4" /> Manage team
                    </Link>
                  )}
                  {event.status !== 'COMPLETED' && (
                    <Button variant="ghost" fullWidth onClick={handleCancel} loading={working}>
                      {isWaitlisted ? 'Leave waitlist' : 'Cancel registration'}
                    </Button>
                  )}
                </div>
              ) : !registrationOpen ? (
                <Button fullWidth disabled>
                  {deadlinePassed ? 'Registration closed' : 'Not open for registration'}
                </Button>
              ) : event.teamEvent ? (
                <div className="space-y-2">
                  <Button fullWidth onClick={() => setTeamModalOpen(true)}>
                    <Users className="h-4 w-4" />
                    {isFull ? 'Join waitlist with a team' : 'Create team & register'}
                  </Button>
                  {isFull && <WaitlistHint />}
                </div>
              ) : (
                <div className="space-y-2">
                  <Button fullWidth loading={working} onClick={handleIndividualRegister}>
                    {isFull ? (
                      <>
                        <Clock className="h-4 w-4" /> Join waitlist
                      </>
                    ) : (
                      <>
                        <Ticket className="h-4 w-4" /> Register now
                      </>
                    )}
                  </Button>
                  {isFull && <WaitlistHint />}
                </div>
              )}

              <SaveEventButton
                eventId={eventId}
                initialSaved={event.saved}
                variant="button"
                className="mt-3"
              />

              <AddToCalendar event={event} />
            </div>

            {/* Volunteering — help run this event. */}
            {isAuthenticated && VOLUNTEERABLE_STATUSES.includes(event.status) && (
              <VolunteerCard eventId={eventId} />
            )}
          </aside>
        </div>
      </PageContainer>

      {myReg && (
        <TicketModal
          open={ticketOpen}
          onClose={() => setTicketOpen(false)}
          registration={myReg}
        />
      )}

      <CreateTeamModal
        open={teamModalOpen}
        onClose={() => setTeamModalOpen(false)}
        eventId={eventId}
        minSize={event.minTeamSize}
        maxSize={event.maxTeamSize}
        onCreated={(team) => {
          setTeamModalOpen(false);
          reloadReg();
          reloadTeams();
          reloadEvent();
          toast.success(
            isFull
              ? "Team created — you're on the waitlist."
              : 'Team created — you are registered!',
          );
          navigate(`/app/teams/${team.id}`);
        }}
      />
    </div>
  );
}

/** Small explainer shown under the register CTA when an event is at capacity. */
function WaitlistHint() {
  return (
    <p className="text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
      This event is full. Join the waitlist and we'll move you in automatically if a spot
      opens up.
    </p>
  );
}

/* --------------------------- add to calendar --------------------------- */

/**
 * Compact "Add to calendar" row: downloads a universal .ics file (Apple Calendar,
 * Outlook, etc.) or opens a pre-filled Google Calendar event in a new tab. Times are
 * treated as floating wall-clock — matching how the app displays them everywhere else.
 */
function AddToCalendar({ event }: { event: EventResponse }) {
  const [busy, setBusy] = useState(false);

  async function downloadIcs() {
    setBusy(true);
    try {
      const blob = await eventService.calendar(event.id);
      downloadBlob(blob, `${calendarSlug(event)}.ics`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not download the calendar file.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
        Add to calendar
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" size="sm" loading={busy} onClick={downloadIcs}>
          <CalendarPlus className="h-4 w-4" /> Apple / Outlook
        </Button>
        <a
          href={googleCalendarUrl(event)}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary justify-center text-sm"
        >
          <CalendarDays className="h-4 w-4" /> Google
        </a>
      </div>
    </div>
  );
}

/** A filename-safe slug from the event title, falling back to the id. */
function calendarSlug(event: EventResponse): string {
  const slug = (event.title ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+)|(-+$)/g, '');
  return slug || `event-${event.id}`;
}

/** Build a Google Calendar "add event" template URL from the event's fields. */
function googleCalendarUrl(event: EventResponse): string {
  const location =
    event.mode === 'ONLINE' ? event.onlineUrl || 'Online' : event.venue || '';
  const details = [
    event.description?.trim(),
    event.clubName ? `Hosted by ${event.clubName}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${toCompactDate(event.startDateTime)}/${toCompactDate(event.endDateTime)}`,
  });
  if (details) params.set('details', details);
  if (location) params.set('location', location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** '2026-09-05T10:00:00' → '20260905T100000' (floating local, no zone conversion). */
function toCompactDate(iso: string): string {
  const m = iso.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return iso;
  const [, y, mo, d, h, mi, s] = m;
  return `${y}${mo}${d}T${h}${mi}${s ?? '00'}`;
}

/* ------------------------- create-team modal ------------------------- */

function CreateTeamModal({
  open,
  onClose,
  eventId,
  minSize,
  maxSize,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  eventId: number;
  minSize?: number;
  maxSize?: number;
  onCreated: (team: TeamResponse) => void;
}) {
  const [name, setName] = useState('');
  const [size, setSize] = useState<string>(maxSize ? String(maxSize) : '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!name.trim()) {
      setError('Team name is required.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      // Create the team (current user becomes leader) then register it.
      const team = await teamService.create({
        name: name.trim(),
        eventId,
        maxSize: size ? Number(size) : undefined,
      });
      await registrationService.register({ eventId, teamId: team.id });
      onCreated(team);
    } catch (err) {
      setError(errorMessage(err, 'Could not create team.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={busy ? () => undefined : onClose}
      title="Create your team"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} loading={busy}>
            Create & register
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Team name" htmlFor="team-name" required>
          <TextInput
            id="team-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Byte Squad"
            autoFocus
          />
        </Field>
        <Field
          label="Max team size"
          htmlFor="team-size"
          hint={
            minSize || maxSize
              ? `Allowed: ${minSize ?? 1}–${maxSize ?? '∞'} members`
              : undefined
          }
        >
          <TextInput
            id="team-size"
            type="number"
            min={minSize ?? 1}
            max={maxSize}
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="Optional"
          />
        </Field>
        <p className="text-xs text-slate-400">
          You'll be the team leader. Add members by email from the team page.
        </p>
        {error && <p className="field-error">{error}</p>}
      </div>
    </Modal>
  );
}

/* --------------------------- feedback section --------------------------- */

function FeedbackSection({
  eventId,
  existing,
  onSubmitted,
}: {
  eventId: number;
  existing: FeedbackResponse | null;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(existing?.comment ?? '');
  const [suggestion, setSuggestion] = useState(existing?.suggestion ?? '');
  const [busy, setBusy] = useState(false);

  if (existing) {
    return (
      <section className="card p-5">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">Your feedback</h3>
        <div className="mt-2 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-5 w-5',
                i < existing.rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-300 dark:text-slate-600',
              )}
            />
          ))}
        </div>
        {existing.comment && (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{existing.comment}</p>
        )}
        <p className="mt-2 text-xs text-slate-400">Thanks for sharing your thoughts!</p>
      </section>
    );
  }

  async function submit() {
    if (rating < 1) {
      toast.error('Please pick a rating.');
      return;
    }
    setBusy(true);
    try {
      await feedbackService.submit({
        eventId,
        rating,
        comment: comment.trim() || undefined,
        suggestion: suggestion.trim() || undefined,
      });
      toast.success('Feedback submitted!');
      onSubmitted();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not submit feedback.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card p-5">
      <h3 className="font-semibold text-slate-900 dark:text-slate-100">Rate this event</h3>
      <div className="mt-3 flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const value = i + 1;
          return (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHover(value)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(value)}
              aria-label={`${value} star${value > 1 ? 's' : ''}`}
            >
              <Star
                className={cn(
                  'h-7 w-7 transition',
                  value <= (hover || rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300 dark:text-slate-600',
                )}
              />
            </button>
          );
        })}
      </div>
      <div className="mt-4 space-y-3">
        <Field label="Comment">
          <TextArea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you think?"
            rows={3}
          />
        </Field>
        <Field label="Suggestion">
          <TextArea
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="Anything we could improve?"
            rows={2}
          />
        </Field>
        <Button onClick={submit} loading={busy}>
          Submit feedback
        </Button>
      </div>
    </section>
  );
}

/* --------------------------- volunteer card --------------------------- */

/**
 * Sidebar card that lets a signed-in user volunteer to help run the event.
 * Self-contained: it loads the user's volunteer enrollments, finds this event,
 * and shows the right state (apply / pending / approved). Rendered only for
 * authenticated users on events that haven't finished.
 */
function VolunteerCard({ eventId }: { eventId: number }) {
  const { data: mine, reload } = useQuery<VolunteerResponse[]>(
    () => volunteerService.mine().catch(() => []),
    [eventId],
  );

  const [role, setRole] = useState('');
  const [busy, setBusy] = useState(false);

  const enrollment = useMemo(
    () => mine?.find((v) => v.eventId === eventId) ?? null,
    [mine, eventId],
  );

  async function apply() {
    setBusy(true);
    try {
      await volunteerService.apply({ eventId, preferredRole: role.trim() || undefined });
      toast.success('Volunteer application submitted!');
      setRole('');
      reload();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not submit your application.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2">
        <HandHeart className="h-5 w-5 text-brand-600" />
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">Volunteering</h3>
      </div>

      {enrollment ? (
        <div className="mt-3 space-y-3">
          {enrollment.approved ? (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              <HandHeart className="h-4 w-4" /> You're a volunteer
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              <Clock className="h-4 w-4" /> Application pending approval
            </div>
          )}
          {enrollment.role && (
            <p className="text-xs text-slate-400">Role: {enrollment.role}</p>
          )}
          <Link to="/app/volunteering" className="btn-secondary w-full justify-center text-sm">
            View my volunteering
          </Link>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Want to help organise this event? Apply to volunteer and the organisers will be in
            touch.
          </p>
          <Field label="Preferred role" htmlFor="vol-pref-role" hint="Optional">
            <TextInput
              id="vol-pref-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Registration desk, logistics"
            />
          </Field>
          <Button fullWidth loading={busy} onClick={apply}>
            <HandHeart className="h-4 w-4" /> Volunteer for this event
          </Button>
        </div>
      )}
    </div>
  );
}
