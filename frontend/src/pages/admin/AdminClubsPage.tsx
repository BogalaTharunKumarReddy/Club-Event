import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Ban, CheckCircle2, ExternalLink, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { errorMessage, formatDate } from '@/lib/utils';
import { PageContainer } from '@/components/layout/RootLayout';
import {
  Avatar,
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  PageHeader,
  Pagination,
  Skeleton,
} from '@/components/ui';
import type { ClubResponse, PageResponse } from '@/types';

const PAGE_SIZE = 20;

export default function AdminClubsPage() {
  const [page, setPage] = useState(0);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toDelete, setToDelete] = useState<ClubResponse | null>(null);

  const { data, loading, error, reload, setData } = useQuery(
    () => adminService.listClubs(page, PAGE_SIZE),
    [page],
  );

  const replaceClub = (updated: ClubResponse) =>
    setData((prev: PageResponse<ClubResponse> | null) =>
      prev
        ? { ...prev, content: prev.content.map((c) => (c.id === updated.id ? updated : c)) }
        : prev!,
    );

  async function toggleActive(club: ClubResponse) {
    setBusyId(club.id);
    try {
      const updated = await adminService.setClubActive(club.id, !club.active);
      replaceClub(updated);
      toast.success(updated.active ? 'Club activated.' : 'Club deactivated.');
    } catch (e) {
      toast.error(errorMessage(e, 'Could not update club.'));
    } finally {
      setBusyId(null);
    }
  }

  // Delete cascades on the backend (events, members, follows and media are purged),
  // so no client-side guard is needed — the ConfirmDialog surfaces any server error.
  async function confirmDelete() {
    if (!toDelete) return;
    await adminService.deleteClub(toDelete.id);
    toast.success('Club and all its events were deleted.');
    reload();
  }

  return (
    <PageContainer>
      <PageHeader
        title="Clubs"
        description={
          data
            ? `${data.totalElements} club${data.totalElements === 1 ? '' : 's'} across the platform.`
            : 'Activate, deactivate or remove any club.'
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
          <EmptyState title="No clubs yet" description="Clubs created by coordinators will appear here." />
        ) : (
          <>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Club</th>
                      <th className="hidden px-4 py-3 text-center font-medium sm:table-cell">Members</th>
                      <th className="hidden px-4 py-3 text-center font-medium sm:table-cell">Events</th>
                      <th className="hidden px-4 py-3 font-medium md:table-cell">Status</th>
                      <th className="hidden px-4 py-3 font-medium lg:table-cell">Created by</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                    {data.content.map((c) => {
                      const rowBusy = busyId === c.id;
                      return (
                        <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar name={c.name} src={c.logoUrl} size="sm" />
                              <div className="min-w-0">
                                <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                                  {c.name}
                                </p>
                                {c.category && (
                                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                    {c.category}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="hidden px-4 py-3 text-center text-slate-600 dark:text-slate-300 sm:table-cell">
                            {c.memberCount}
                          </td>
                          <td className="hidden px-4 py-3 text-center text-slate-600 dark:text-slate-300 sm:table-cell">
                            {c.eventCount}
                          </td>
                          <td className="hidden px-4 py-3 md:table-cell">
                            {c.active ? (
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                                Active
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                Inactive
                              </Badge>
                            )}
                          </td>
                          <td className="hidden px-4 py-3 text-slate-500 dark:text-slate-400 lg:table-cell">
                            <span className="block truncate">{c.createdByName}</span>
                            <span className="block text-xs">{formatDate(c.createdAt)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                to={`/clubs/${c.id}`}
                                className="btn-ghost px-2 py-1.5 text-xs"
                                title="View club"
                                aria-label={`View ${c.name}`}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                              <Button
                                variant="secondary"
                                size="sm"
                                loading={rowBusy}
                                onClick={() => void toggleActive(c)}
                              >
                                {c.active ? (
                                  <>
                                    <Ban className="h-4 w-4" /> Deactivate
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-4 w-4" /> Activate
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={rowBusy}
                                onClick={() => setToDelete(c)}
                                className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                aria-label={`Delete ${c.name}`}
                                title="Delete club and all its events"
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
        title="Delete club"
        message={`Permanently delete "${toDelete?.name}"? This also removes all of its events, registrations, members and follows. This cannot be undone — consider deactivating instead.`}
        confirmLabel="Delete club"
        danger
      />
    </PageContainer>
  );
}
