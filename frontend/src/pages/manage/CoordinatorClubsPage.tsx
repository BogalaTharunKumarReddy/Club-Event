import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CalendarPlus,
  ExternalLink,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  Users2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { clubService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { errorMessage } from '@/lib/utils';
import { PageContainer } from '@/components/layout/RootLayout';
import { StatCard } from '@/components/domain/StatCard';
import { CreateClubModal } from '@/components/domain/CreateClubModal';
import {
  Avatar,
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  PageHeader,
  Select,
  Spinner,
  TextInput,
} from '@/components/ui';
import type { ClubResponse } from '@/types';

/**
 * Coordinator → Clubs. A management hub (distinct from the public `/clubs`
 * catalog) listing every club the signed-in user coordinates, with stats,
 * search/filter, create, and per-club manage / view / deactivate actions.
 *
 * Per-club management lives at `/app/manage/clubs/:clubId` (ManageClubPage);
 * the public profile is `/clubs/:id`.
 */

type StatusFilter = 'all' | 'active' | 'inactive';

/** Full club records for every club the current user actively coordinates. */
async function loadCoordinatorClubs(): Promise<ClubResponse[]> {
  const memberships = await clubService.myMemberships();
  const coordinatorClubIds = memberships
    .filter((m) => m.clubRole === 'COORDINATOR' && m.status === 'ACTIVE')
    .map((m) => m.clubId);

  const unique = Array.from(new Set(coordinatorClubIds));
  if (unique.length === 0) return [];

  const clubs = await Promise.all(unique.map((id) => clubService.getById(id)));
  clubs.sort((a, b) => a.name.localeCompare(b.name));
  return clubs;
}

export default function CoordinatorClubsPage() {
  const { user } = useAuth();
  const { data: clubs, loading, error, reload } = useQuery(loadCoordinatorClubs, []);

  const [createOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [toDelete, setToDelete] = useState<ClubResponse | null>(null);

  const stats = useMemo(() => {
    const list = clubs ?? [];
    return {
      total: list.length,
      active: list.filter((c) => c.active).length,
      members: list.reduce((sum, c) => sum + c.memberCount, 0),
      events: list.reduce((sum, c) => sum + c.eventCount, 0),
    };
  }, [clubs]);

  const filtered = useMemo(() => {
    let list = clubs ?? [];
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.category ?? '').toLowerCase().includes(q),
      );
    }
    if (status === 'active') list = list.filter((c) => c.active);
    else if (status === 'inactive') list = list.filter((c) => !c.active);
    return list;
  }, [clubs, query, status]);

  // Coordinator DELETE = deactivate (soft). Hard delete stays admin-only.
  async function confirmDelete() {
    if (!toDelete) return;
    await clubService.remove(toDelete.id);
    toast.success('Club deactivated and hidden from the public catalog.');
    setToDelete(null);
    reload();
  }

  // Reactivate brings a deactivated club back into the public catalog.
  async function handleReactivate(club: ClubResponse) {
    try {
      await clubService.reactivate(club.id);
      toast.success(`"${club.name}" is active again.`);
      reload();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not reactivate the club.'));
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Clubs"
        description="Create and manage the college clubs you coordinate and their activities."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Create Club
          </Button>
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
      ) : (
        <div className="mt-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total Clubs" value={stats.total} icon={<Building2 className="h-5 w-5" />} />
            <StatCard label="Active Clubs" value={stats.active} icon={<Building2 className="h-5 w-5" />} />
            <StatCard label="Total Members" value={stats.members} icon={<Users2 className="h-5 w-5" />} />
            <StatCard label="Total Events" value={stats.events} icon={<CalendarPlus className="h-5 w-5" />} />
          </div>

          {(clubs ?? []).length === 0 ? (
            <EmptyState
              icon={<Building2 className="h-6 w-6" />}
              title="You don't coordinate any clubs yet"
              description="Create a club to start organising events, teams and competitions."
              action={
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4" /> Create your first club
                </Button>
              }
            />
          ) : (
            <>
              {/* Search + filters */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <TextInput
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search clubs..."
                    className="pl-9"
                    aria-label="Search clubs"
                  />
                </div>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StatusFilter)}
                  aria-label="Filter by status"
                  className="sm:w-44"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>

              {/* Management table */}
              {filtered.length === 0 ? (
                <EmptyState
                  icon={<Search className="h-6 w-6" />}
                  title="No clubs match your filters"
                  description="Try a different search term or status."
                />
              ) : (
                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                      <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                        <tr>
                          <th className="px-4 py-3 font-medium">Club</th>
                          <th className="hidden px-4 py-3 font-medium sm:table-cell">Category</th>
                          <th className="px-4 py-3 text-center font-medium">Members</th>
                          <th className="hidden px-4 py-3 text-center font-medium md:table-cell">Events</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 text-right font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                        {filtered.map((club) => (
                          <tr key={club.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <Avatar name={club.name} src={club.logoUrl} size="sm" />
                                <div className="min-w-0">
                                  <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                                    {club.name}
                                  </p>
                                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                    {club.followerCount} follower{club.followerCount === 1 ? '' : 's'}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="hidden px-4 py-3 text-slate-600 dark:text-slate-300 sm:table-cell">
                              {club.category ?? '—'}
                            </td>
                            <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300">
                              {club.memberCount}
                            </td>
                            <td className="hidden px-4 py-3 text-center text-slate-600 dark:text-slate-300 md:table-cell">
                              {club.eventCount}
                            </td>
                            <td className="px-4 py-3">
                              {club.active ? (
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                                  Active
                                </Badge>
                              ) : (
                                <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                  Inactive
                                </Badge>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1.5">
                                <Link
                                  to={`/clubs/${club.id}`}
                                  className="btn-ghost px-2 py-1.5 text-xs"
                                  title="View public page"
                                  aria-label={`View ${club.name}`}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Link>
                                <Link
                                  to={`/app/manage/clubs/${club.id}`}
                                  className="btn-secondary px-2.5 py-1.5 text-xs"
                                  title="Manage club"
                                  aria-label={`Manage ${club.name}`}
                                >
                                  <Settings2 className="h-4 w-4" /> Manage
                                </Link>
                                {club.active ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setToDelete(club)}
                                    className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                    aria-label={`Deactivate ${club.name}`}
                                    title="Deactivate club"
                                  >
                                    Deactivate
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => void handleReactivate(club)}
                                    className="text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                                    aria-label={`Reactivate ${club.name}`}
                                    title="Reactivate club"
                                  >
                                    <RotateCcw className="h-4 w-4" /> Reactivate
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <CreateClubModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        coordinatorName={user?.fullName}
        onCreated={() => {
          setCreateOpen(false);
          reload();
        }}
      />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Deactivate club?"
        message={`Deactivate "${toDelete?.name}"? It will be hidden from the public catalog and its events won't accept new registrations. You can ask an administrator to permanently delete it.`}
        confirmLabel="Deactivate club"
        danger
      />
    </PageContainer>
  );
}

