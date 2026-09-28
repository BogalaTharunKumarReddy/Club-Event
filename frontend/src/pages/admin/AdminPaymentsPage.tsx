import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, ExternalLink, Package, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService, paymentService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { PAYMENT_STATUS_LABELS } from '@/lib/constants';
import { downloadBlob, errorMessage, formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { PageContainer } from '@/components/layout/RootLayout';
import {
  Avatar,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  PageHeader,
  Pagination,
  PaymentStatusBadge,
  Select,
  Skeleton,
} from '@/components/ui';
import type { PaymentResponse, PaymentStatus } from '@/types';

const PAGE_SIZE = 20;
const STATUSES = Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[];

/**
 * Platform-wide payments ledger for administrators. Unlike the coordinator's
 * per-event Payments panel, this lists every transaction across all events and
 * clubs, filterable by status, with the same secure refund action. Refunds are
 * routed server-side back to the gateway that processed the original charge.
 */
export default function AdminPaymentsPage() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<PaymentStatus | ''>('');
  const [toRefund, setToRefund] = useState<PaymentResponse | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  // Bulk receipt download: selection accumulates across pages so an admin can
  // gather receipts spanning several pages, then export them all as one ZIP.
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [zipping, setZipping] = useState(false);

  const { data, loading, error, reload } = useQuery(
    () => adminService.listPayments({ status: status || undefined, page, size: PAGE_SIZE }),
    [status, page],
  );

  // Only completed payments (paid or refunded) have a downloadable receipt.
  const rows = data?.content ?? [];
  const receiptable = rows.filter((p) => p.status === 'SUCCESS' || p.status === 'REFUNDED');
  const allPageSelected = receiptable.length > 0 && receiptable.every((p) => selected.has(p.id));

  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllOnPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (receiptable.every((p) => next.has(p.id))) {
        receiptable.forEach((p) => next.delete(p.id));
      } else {
        receiptable.forEach((p) => next.add(p.id));
      }
      return next;
    });
  }

  async function downloadSelectedZip() {
    if (selected.size === 0) return;
    setZipping(true);
    try {
      const blob = await paymentService.receiptsZip(Array.from(selected));
      downloadBlob(blob, 'payment-receipts.zip');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not download the selected receipts.'));
    } finally {
      setZipping(false);
    }
  }

  async function confirmRefund() {
    if (!toRefund) return;
    try {
      await paymentService.refund(toRefund.id);
      toast.success('Payment refunded.');
      reload();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not refund payment.'));
      throw err;
    }
  }

  async function downloadReceipt(payment: PaymentResponse) {
    setDownloadingId(payment.id);
    try {
      const blob = await paymentService.receipt(payment.id);
      downloadBlob(blob, `receipt-${payment.receiptNumber ?? payment.id}.pdf`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not download the receipt.'));
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Payments"
        description={
          data
            ? `${data.totalElements} transaction${data.totalElements === 1 ? '' : 's'} across every event.`
            : 'Review every entry-fee payment and issue refunds.'
        }
        actions={
          <Select
            value={status}
            onChange={(e) => {
              setPage(0);
              setSelected(new Set());
              setStatus(e.target.value as PaymentStatus | '');
            }}
            aria-label="Filter by status"
            className="w-40 py-1.5 text-sm"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {PAYMENT_STATUS_LABELS[s]}
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
            title="No payments found"
            description={
              status
                ? 'No payments match this status filter. Try a different status.'
                : 'Entry-fee payments made by attendees will appear here.'
            }
          />
        ) : (
          <>
            {selected.size > 0 && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 dark:border-brand-900/50 dark:bg-brand-900/20">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {selected.size} payment{selected.size === 1 ? '' : 's'} selected
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setSelected(new Set())} disabled={zipping}>
                    Clear
                  </Button>
                  <Button size="sm" loading={zipping} onClick={downloadSelectedZip}>
                    <Package className="h-4 w-4" /> Download receipts (ZIP)
                  </Button>
                </div>
              </div>
            )}
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800"
                          checked={allPageSelected}
                          onChange={toggleAllOnPage}
                          disabled={receiptable.length === 0}
                          aria-label="Select every receipt on this page"
                        />
                      </th>
                      <th className="px-4 py-3 font-medium">Payer</th>
                      <th className="px-4 py-3 font-medium">Event</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="hidden px-4 py-3 font-medium md:table-cell">Receipt</th>
                      <th className="hidden px-4 py-3 font-medium lg:table-cell">Paid</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                    {data.content.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-3">
                          {(p.status === 'SUCCESS' || p.status === 'REFUNDED') && (
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800"
                              checked={selected.has(p.id)}
                              onChange={() => toggleOne(p.id)}
                              aria-label={`Select receipt for ${p.userName}`}
                            />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar name={p.userName} size="sm" />
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {p.userName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            to={`/events/${p.eventId}`}
                            className="inline-flex items-center gap-1 text-brand-600 hover:underline dark:text-brand-400"
                          >
                            <span className="max-w-[16rem] truncate">{p.eventTitle}</span>
                            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                          </Link>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <PaymentStatusBadge status={p.status} />
                        </td>
                        <td className="hidden px-4 py-3 font-mono text-xs text-slate-500 dark:table-cell dark:text-slate-400">
                          {p.receiptNumber ?? '—'}
                        </td>
                        <td className="hidden px-4 py-3 text-slate-500 dark:table-cell lg:table-cell dark:text-slate-400">
                          {p.paidAt ? formatDateTime(p.paidAt) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {(p.status === 'SUCCESS' || p.status === 'REFUNDED') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                loading={downloadingId === p.id}
                                onClick={() => downloadReceipt(p)}
                                aria-label={`Download receipt for ${p.userName}`}
                              >
                                <Download className="h-4 w-4" /> Receipt
                              </Button>
                            )}
                            {p.status === 'SUCCESS' ? (
                              <Button variant="ghost" size="sm" onClick={() => setToRefund(p)}>
                                <RotateCcw className="h-4 w-4" /> Refund
                              </Button>
                            ) : p.status === 'REFUNDED' ? (
                              <span className="text-xs text-slate-400">
                                {p.refundedAt ? `refunded ${formatDate(p.refundedAt)}` : 'refunded'}
                              </span>
                            ) : null}
                          </div>
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

      <ConfirmDialog
        open={!!toRefund}
        onClose={() => setToRefund(null)}
        onConfirm={confirmRefund}
        title="Refund this payment?"
        message={
          toRefund
            ? `${formatCurrency(toRefund.amount)} will be refunded to ${toRefund.userName} for "${toRefund.eventTitle}". Their registration will revert to pending payment.`
            : ''
        }
        confirmLabel="Refund"
        danger
      />
    </PageContainer>
  );
}
