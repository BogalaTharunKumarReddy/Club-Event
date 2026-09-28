import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { EVENT_STATUS_LABELS } from '@/lib/constants';
import { errorMessage, formatDateTime } from '@/lib/utils';
import { PageContainer } from '@/components/layout/RootLayout';
import {
  Avatar,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  PageHeader,
  Pagination,
  Select,
  Skeleton,
} from '@/components/ui';
import type { EventStatus, EventSummaryResponse, PageResponse } from '@/types';

const PAGE_SIZE = 20;
const STATUSES = Object.keys(EVENT_STATUS_LABELS) as EventStatus[];

export default function AdminEventsPage() {
  const [page, setPage] = useState(0);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toDelete, setToDelete] = useState<EventSummaryResponse | null>(null);

  const { data, loading, error, reload, setData } = useQuery(
    () => adminService.listEvents(page, PAGE_SIZE),
    [page],
  );

  const patchStatus = (id: number, status: EventStatus) =>
    setData((prev: PageResponse<EventSummaryResponse> | null) =>
      prev
        ? { ...prev, content: prev.content.map((e) => (e.id === id ? { ...e, status } : e)) }
        : prev!,
    );

  async function changeStatus(ev: EventSummaryResponse, status: EventStatus) {
    if (status === ev.status) return;
    setBusyId(ev.id);
    try {
      const updated = await adminService.updateEventStatus(ev.id, status);
      patchStatus(ev.id, updated.status);
      toast.success('Event status updated.');
    } catch (e) {
      toast.error(errorMessage(e, 'Could not update event status.'));
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    await adminService.deleteEvent(toDelete.id);
    toast.success('Event deleted.');
    reload();
  }

  return (
    <PageContainer>
      <PageHeader
        title="Events"
        description={
          data
            ? `${data.totalElements} event${data.totalElements === 1 ? '' : 's'} across every club.`
            : 'Moderate, re-status or remove any event.'
        }
      />

      <div className="mt-6">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : !data || data.content.length === 0 ? (
          <EmptyState title="No events yet" description="Events published by clubs will appear here." />
        ) : (
          <>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Event</th>
                      <th className="hidden px-4 py-3 font-medium md:table-cell">Starts</th>
                      <th className="hidden px-4 py-3 text-center font-medium sm:table-cell">Registered</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                    {data.content.map((ev) => {
                      const rowBusy = busyId === ev.id;
                      return (
                        <tr key={ev.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar name={ev.title} src={ev.bannerUrl} size="sm" />
                              <div className="min-w-0">
                                <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                                  {ev.title}
                                </p>
                                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                  {ev.clubName}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="hidden px-4 py-3 text-slate-500 dark:text-slate-400 md:table-cell">
                            {formatDateTime(ev.startDateTime)}
                          </td>
                          <td className="hidden px-4 py-3 text-center text-slate-600 dark:text-slate-300 sm:table-cell">
                            {ev.registeredCount}
                            {ev.capacity ? ` / ${ev.capacity}` : ''}
                          </td>
                          <td className="px-4 py-3">
                            <Select
                              value={ev.status}
                              disabled={rowBusy}
                              onChange={(e) => void changeStatus(ev, e.target.value as EventStatus)}
                              aria-label={`Status for ${ev.title}`}
                              className="w-36 py-1.5 text-xs"
                            >
                              {STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {EVENT_STATUS_LABELS[s]}
                                </option>
                              ))}
                            </Select>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                to={`/events/${ev.id}`}
                                className="btn-ghost px-2 py-1.5 text-xs"
                                title="View event"
                                aria-label={`View ${ev.title}`}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={rowBusy}
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-6">
              <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete event"
        message={`Permanently delete "${toDelete?.title}"? Its registrations, payments, certificates, attendance and competitions are all removed. This cannot be undone — consider setting it to Cancelled instead.`}
        confirmLabel="Delete event"
        danger
      />
    </PageContainer>
  );
}
