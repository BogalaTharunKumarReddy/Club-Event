import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Trash2, UserCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService, type AdminUserSearchParams } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/context/AuthContext';
import { ROLE_LABELS } from '@/lib/constants';
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
  Select,
  Skeleton,
  TextInput,
} from '@/components/ui';
import type { AdminUserResponse, PageResponse, Role } from '@/types';

const PAGE_SIZE = 15;
const ROLES = Object.keys(ROLE_LABELS) as Role[];

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  // Seed the query from ?q= so the global search "People" results can deep-link here.
  const [searchParams] = useSearchParams();
  const [q, setQ] = useState(() => searchParams.get('q') ?? '');
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');
  const [page, setPage] = useState(0);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toDelete, setToDelete] = useState<AdminUserResponse | null>(null);

  const debouncedQ = useDebounce(q);

  const params = useMemo<AdminUserSearchParams>(
    () => ({
      q: debouncedQ || undefined,
      role: roleFilter || undefined,
      page,
      size: PAGE_SIZE,
    }),
    [debouncedQ, roleFilter, page],
  );

  const { data, loading, error, reload, setData } = useQuery(
    () => adminService.listUsers(params),
    [params],
  );

  const replaceUser = (updated: AdminUserResponse) =>
    setData((prev: PageResponse<AdminUserResponse> | null) =>
      prev
        ? { ...prev, content: prev.content.map((u) => (u.id === updated.id ? updated : u)) }
        : prev!,
    );

  async function changeRole(u: AdminUserResponse, role: Role) {
    if (role === u.role) return;
    setBusyId(u.id);
    try {
      replaceUser(await adminService.updateRole(u.id, { role }));
      toast.success('Role updated.');
    } catch (e) {
      toast.error(errorMessage(e, 'Could not update role.'));
    } finally {
      setBusyId(null);
    }
  }

  async function toggleStatus(u: AdminUserResponse) {
    setBusyId(u.id);
    try {
      const updated = await adminService.updateStatus(u.id, { enabled: !u.enabled });
      replaceUser(updated);
      toast.success(updated.enabled ? 'Account enabled.' : 'Account disabled.');
    } catch (e) {
      toast.error(errorMessage(e, 'Could not update account status.'));
    } finally {
      setBusyId(null);
    }
  }

  // Thrown errors surface inside the ConfirmDialog; reload only runs on success.
  async function confirmDelete() {
    if (!toDelete) return;
    await adminService.deleteUser(toDelete.id);
    toast.success('User deleted.');
    reload();
  }

  return (
    <PageContainer>
      <PageHeader
        title="Users"
        description={
          data ? `${data.totalElements} account${data.totalElements === 1 ? '' : 's'} on the platform.` : 'Manage every account on the platform.'
        }
      />

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <TextInput
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
            placeholder="Search by name or email…"
            className="pl-9"
            aria-label="Search users"
          />
        </div>
        <Select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value as Role | '');
            setPage(0);
          }}
          aria-label="Filter by role"
          className="sm:w-52"
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </Select>
      </div>

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
          <EmptyState title="No users found" description="Try adjusting your search or role filter." />
        ) : (
          <>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">User</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="hidden px-4 py-3 font-medium sm:table-cell">Status</th>
                      <th className="hidden px-4 py-3 font-medium lg:table-cell">Joined</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                    {data.content.map((u) => {
                      const isSelf = u.id === currentUser?.id;
                      const rowBusy = busyId === u.id;
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar name={u.fullName} src={u.profilePhotoUrl} size="sm" />
                              <div className="min-w-0">
                                <p className="flex items-center gap-2 font-medium text-slate-900 dark:text-slate-100">
                                  <span className="truncate">{u.fullName}</span>
                                  {isSelf && (
                                    <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
                                      You
                                    </span>
                                  )}
                                </p>
                                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                  {u.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Select
                              value={u.role}
                              disabled={isSelf || rowBusy}
                              onChange={(e) => void changeRole(u, e.target.value as Role)}
                              aria-label={`Role for ${u.fullName}`}
                              className="w-40 py-1.5 text-xs"
                            >
                              {ROLES.map((r) => (
                                <option key={r} value={r}>
                                  {ROLE_LABELS[r]}
                                </option>
                              ))}
                            </Select>
                          </td>
                          <td className="hidden px-4 py-3 sm:table-cell">
                            {u.enabled ? (
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                                Active
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                                Disabled
                              </Badge>
                            )}
                          </td>
                          <td className="hidden px-4 py-3 text-slate-500 dark:text-slate-400 lg:table-cell">
                            {formatDate(u.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                disabled={isSelf || rowBusy}
                                onClick={() => void toggleStatus(u)}
                                title={isSelf ? 'You cannot change your own status' : undefined}
                              >
                                {u.enabled ? (
                                  <>
                                    <UserX className="h-4 w-4" /> Disable
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="h-4 w-4" /> Enable
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={isSelf || rowBusy}
                                onClick={() => setToDelete(u)}
                                className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                aria-label={`Delete ${u.fullName}`}
                                title={isSelf ? 'You cannot delete your own account' : 'Delete user'}
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
        title="Delete user"
<<<<<<< HEAD
        message={`Permanently delete ${toDelete?.fullName}? This removes their registrations, memberships, certificates, payments and any teams they lead. Clubs and events they created are kept (ownership is cleared). This cannot be undone.`}
=======
        message={`Permanently delete ${toDelete?.fullName}? This cannot be undone. If the account owns clubs or events, disable it instead.`}
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
        confirmLabel="Delete user"
        danger
      />
    </PageContainer>
  );
}
