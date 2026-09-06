import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  Pencil,
  Plus,
  PlayCircle,
  Search,
  Settings2,
  Trash2,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { clubService, eventService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { EVENT_STATUS_LABELS } from '@/lib/constants';
import { formatDateTime } from '@/lib/utils';
import { PageContainer } from '@/components/layout/RootLayout';
import { StatCard } from '@/components/domain/StatCard';
import {
  Avatar,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  EventStatusBadge,
  PageHeader,
  Select,
  Spinner,
  TextInput,
} from '@/components/ui';
import type { ClubMemberResponse, EventStatus, EventSummaryResponse } from '@/types';

/**
 * Coordinator → Events. A management hub (distinct from the public `/events`
 * discovery catalog) listing every event across the clubs the signed-in user
 * coordinates, with stats, search/filter, create, and per-event manage / edit /
 * view / delete actions. Per-event management is `/app/manage/events/:id`; the
 * create/edit form is `/app/manage/events/new` and `/app/manage/events/:id/edit`.
 */

const STATUSES = Object.keys(EVENT_STATUS_LABELS) as EventStatus[];

interface CoordinatorEventsData {
  events: EventSummaryResponse[];
  clubs: { id: number; name: string }[];
}

/** Every event the current user can manage, across all clubs they coordinate. */
async function loadCoordinatorEvents(): Promise<CoordinatorEventsData> {
  const memberships = await clubService.myMemberships();
  const coordinatorClubs = memberships.filter(
    (m: ClubMemberResponse) => m.clubRole === 'COORDINATOR' && m.status === 'ACTIVE',
  );
  if (coordinatorClubs.length === 0) return { events: [], clubs: [] };

  // De-dupe clubs (a user could hold the membership row more than once in theory).
  const clubMap = new Map<number, string>();
  for (const c of coordinatorClubs) clubMap.set(c.clubId, c.clubName);
  const clubs = Array.from(clubMap, ([id, name]) => ({ id, name })).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const pages = await Promise.all(
    clubs.map((c) => eventService.search({ clubId: c.id, includeDrafts: true, size: 100 })),
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
  return { events, clubs };
}

/** Events not yet started and not cancelled/completed. */
function isUpcoming(ev: EventSummaryResponse): boolean {
  return (
    (ev.status === 'PUBLISHED' || ev.status === 'UPCOMING') &&
    new Date(ev.startDateTime).getTime() > Date.now()
  );
}

export default function CoordinatorEventsPage() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useQuery(loadCoordinatorEvents, []);

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');
  const [clubFilter, setClubFilter] = useState<number | 'all'>('all');
  const [toDelete, setToDelete] = useState<EventSummaryResponse | null>(null);

  const events = data?.events ?? [];
  const clubs = data?.clubs ?? [];

  const stats = useMemo(() => {
    return {
      total: events.length,
      upcoming: events.filter(isUpcoming).length,
      ongoing: events.filter((e) => e.status === 'ONGOING').length,
      completed: events.filter((e) => e.status === 'COMPLETED').length,
      registrations: events.reduce((sum, e) => sum + e.registeredCount, 0),
    };
  }, [events]);

  const filtered = useMemo(() => {
    let list = events;
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.clubName.toLowerCase().includes(q) ||
          (e.category ?? '').toLowerCase().includes(q),
      );
    }
    if (statusFilter !== 'all') list = list.filter((e) => e.status === statusFilter);
    if (clubFilter !== 'all') list = list.filter((e) => e.clubId === clubFilter);
    return list;
  }, [events, query, statusFilter, clubFilter]);

  async function confirmDelete() {
    if (!toDelete) return;
    await eventService.remove(toDelete.id);
    toast.success('Event deleted.');
    setToDelete(null);
    reload();
  }

  // "Create Event" needs a club to attach to. With one club we can jump straight
  // in; with several the form's clubId picker handles it (no preselect).
  const createHref =
    clubs.length === 1
      ? `/app/manage/events/new?clubId=${clubs[0].id}`
      : '/app/manage/events/new';

  return (
    <PageContainer>
      <PageHeader
        title="Events"
        description="Create, manage and monitor events organized by your clubs."
        actions={
          clubs.length > 0 ? (
            <Link to={createHref} className="btn-primary">
              <Plus className="h-4 w-4" /> Create Event
            </Link>
          ) : undefined
        }
      />

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner className="h-7 w-7 text-brand-600" />
        </div>
      ) : error ? (
        <div className="mt-6">
          <ErrorState message={error} onRetry={reload} />
        </div>
      ) : clubs.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<CalendarDays className="h-6 w-6" />}
            title="You don't coordinate any clubs yet"
            description="Create a club first, then you can organise events under it."
            action={
              <Link to="/app/manage/clubs" className="btn-primary">
                <Settings2 className="h-4 w-4" /> Go to Clubs
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <StatCard label="Total Events" value={stats.total} icon={<CalendarDays className="h-5 w-5" />} />
            <StatCard label="Upcoming" value={stats.upcoming} icon={<Clock className="h-5 w-5" />} />
            <StatCard label="Ongoing" value={stats.ongoing} icon={<PlayCircle className="h-5 w-5" />} />
            <StatCard label="Completed" value={stats.completed} icon={<CheckCircle2 className="h-5 w-5" />} />
            <StatCard label="Registrations" value={stats.registrations} icon={<Users className="h-5 w-5" />} />
          </div>

          {/* Search + filters */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <TextInput
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events..."
                className="pl-9"
                aria-label="Search events"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as EventStatus | 'all')}
              aria-label="Filter by status"
              className="lg:w-44"
            >
              <option value="all">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {EVENT_STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
            {clubs.length > 1 && (
              <Select
                value={String(clubFilter)}
                onChange={(e) =>
                  setClubFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
                }
                aria-label="Filter by club"
                className="lg:w-52"
              >
                <option value="all">All clubs</option>
                {clubs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            )}
          </div>

          {/* Management table */}
          {filtered.length === 0 ? (
            <EmptyState
              icon={<CalendarClock className="h-6 w-6" />}
              title={events.length === 0 ? 'No events yet' : 'No events match your filters'}
              description={
                events.length === 0
                  ? 'Create your first event to get started.'
                  : 'Try a different search term, status or club.'
              }
              action={
                events.length === 0 ? (
                  <Link to={createHref} className="btn-primary">
                    <Plus className="h-4 w-4" /> Create Event
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Event</th>
                      <th className="hidden px-4 py-3 font-medium lg:table-cell">Club</th>
                      <th className="hidden px-4 py-3 font-medium md:table-cell">Date</th>
                      <th className="px-4 py-3 text-center font-medium">Regs</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                    {filtered.map((ev) => (
                      <tr key={ev.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => navigate(`/app/manage/events/${ev.id}`)}
                            className="flex items-center gap-3 text-left"
                          >
                            <Avatar name={ev.title} src={ev.bannerUrl} size="sm" />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-slate-900 hover:text-brand-600 dark:text-slate-100">
                                {ev.title}
                              </p>
                              <p className="truncate text-xs text-slate-500 dark:text-slate-400 lg:hidden">
                                {ev.clubName}
                              </p>
                            </div>
                          </button>
                        </td>
                        <td className="hidden px-4 py-3 text-slate-600 dark:text-slate-300 lg:table-cell">
                          {ev.clubName}
                        </td>
                        <td className="hidden px-4 py-3 text-slate-500 dark:text-slate-400 md:table-cell">
                          {formatDateTime(ev.startDateTime)}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300">
                          {ev.registeredCount}
                          {ev.capacity ? ` / ${ev.capacity}` : ''}
                        </td>
                        <td className="px-4 py-3">
                          <EventStatusBadge status={ev.status} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/events/${ev.id}`}
                              className="btn-ghost px-2 py-1.5 text-xs"
                              title="View public page"
                              aria-label={`View ${ev.title}`}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/app/manage/events/${ev.id}`}
                              className="btn-secondary px-2.5 py-1.5 text-xs"
                              title="Manage event"
                              aria-label={`Manage ${ev.title}`}
                            >
                              <Settings2 className="h-4 w-4" /> Manage
                            </Link>
                            <Link
                              to={`/app/manage/events/${ev.id}/edit`}
                              className="btn-ghost px-2 py-1.5 text-xs"
                              title="Edit event"
                              aria-label={`Edit ${ev.title}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setToDelete(ev)}
                              className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                              aria-label={`Delete ${ev.title}`}
                              title="Delete event"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete event?"
        message={`Permanently delete "${toDelete?.title}"? Its registrations, payments, certificates, attendance and competitions are all removed. This cannot be undone — consider setting it to Cancelled instead.`}
        confirmLabel="Delete event"
        danger
      />
    </PageContainer>
  );
}
