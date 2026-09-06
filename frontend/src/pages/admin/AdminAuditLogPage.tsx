import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { adminService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { AUDIT_ACTION_LABELS, AUDIT_ACTION_STYLES } from '@/lib/constants';
import { formatDateTime } from '@/lib/utils';
import { PageContainer } from '@/components/layout/RootLayout';
import {
  Avatar,
  Badge,
  EmptyState,
  ErrorState,
  PageHeader,
  Pagination,
  Select,
  Skeleton,
} from '@/components/ui';
import type { AuditAction } from '@/types';

const PAGE_SIZE = 20;
const ACTIONS = Object.keys(AUDIT_ACTION_LABELS) as AuditAction[];

/**
 * Read-only administrative audit trail. Every mutating admin action (role
 * changes, enable/disable, deletions, club/event status changes) is recorded
 * server-side with an actor and target snapshot, so the history survives even
 * after the referenced user, club or event is removed. Filterable by action.
 */
export default function AdminAuditLogPage() {
  const [page, setPage] = useState(0);
  const [action, setAction] = useState<AuditAction | ''>('');

  const { data, loading, error, reload } = useQuery(
    () => adminService.listAuditLogs({ action: action || undefined, page, size: PAGE_SIZE }),
    [action, page],
  );

  return (
    <PageContainer>
      <PageHeader
        title="Audit log"
        description={
          data
            ? `${data.totalElements} recorded action${data.totalElements === 1 ? '' : 's'} across the platform.`
            : 'Every administrative action, newest first.'
        }
        actions={
          <Select
            value={action}
            onChange={(e) => {
              setPage(0);
              setAction(e.target.value as AuditAction | '');
            }}
            aria-label="Filter by action"
            className="w-52 py-1.5 text-sm"
          >
            <option value="">All actions</option>
            {ACTIONS.map((a) => (
              <option key={a} value={a}>
                {AUDIT_ACTION_LABELS[a]}
              </option>
            ))}
          </Select>
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
          <EmptyState
            icon={<ShieldCheck className="h-6 w-6" />}
            title="No audit entries yet"
            description={
              action
                ? 'No actions match this filter. Try a different action.'
                : 'Administrative actions will be recorded here as they happen.'
            }
          />
        ) : (
          <>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Action</th>
                      <th className="px-4 py-3 font-medium">Target</th>
                      <th className="hidden px-4 py-3 font-medium md:table-cell">Detail</th>
                      <th className="px-4 py-3 font-medium">Admin</th>
                      <th className="hidden px-4 py-3 font-medium lg:table-cell">When</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                    {data.content.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-3">
                          <Badge className={AUDIT_ACTION_STYLES[log.action]}>
                            {AUDIT_ACTION_LABELS[log.action]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                              {log.targetLabel ?? '—'}
                            </p>
                            {log.targetType && (
                              <p className="text-xs text-slate-400 dark:text-slate-500">
                                {log.targetType}
                                {log.targetId != null ? ` #${log.targetId}` : ''}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 text-slate-600 md:table-cell dark:text-slate-300">
                          {log.detail ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar name={log.actorName ?? 'System'} size="sm" />
                            <span className="truncate text-slate-700 dark:text-slate-200">
                              {log.actorName ?? 'System'}
                            </span>
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 text-slate-500 lg:table-cell dark:text-slate-400">
                          {formatDateTime(log.createdAt)}
                        </td>
                      </tr>
                    ))}
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
    </PageContainer>
  );
}
