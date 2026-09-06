/**
 * Event-management tab panels, extracted from ManageEventPage so they can also
 * be mounted as standalone coordinator workspace pages (each backed by an event
 * picker). Every panel is self-contained and driven by the {@code eventId} prop.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Ban,
  CalendarClock,
  Check,
  CheckSquare,
  CreditCard,
  Download,
  HandHeart,
  Megaphone,
  Package,
  Palette,
  Pin,
  Plus,
  QrCode,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Square,
  Star,
  Trash2,
  Trophy,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import toast from 'react-hot-toast';
import {
  analyticsService,
  announcementService,
  attendanceService,
  certificateService,
  competitionService,
  eventService,
  feedbackService,
  paymentService,
  registrationService,
  volunteerService,
} from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import {
  CERTIFICATE_SCOPE_LABELS,
  CERTIFICATE_TYPE_LABELS,
  EVENT_STATUS_LABELS,
} from '@/lib/constants';
import {
  cn,
  downloadBlob,
  errorMessage,
  formatCurrency,
  formatDate,
  formatDateTime,
  fromNow,
} from '@/lib/utils';
import {
  Avatar,
  Badge,
  Button,
  CompetitionStatusBadge,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  EventStatusBadge,
  Field,
  FullPageLoader,
  Modal,
  Pagination,
  PaymentStatusBadge,
  RegistrationStatusBadge,
  Select,
  TextArea,
  TextInput,
} from '@/components/ui';
import { StatCard } from '@/components/domain/StatCard';
import { CertificateTemplateForm } from '@/components/domain/CertificateTemplateForm';
import { MediaGallery } from '@/components/domain/MediaGallery';
import { EventComments } from '@/components/domain/EventComments';
import type {
  AnnouncementResponse,
  CertificateParticipantResponse,
  CertificateRecipientScope,
  CertificateResponse,
  CertificateTemplateRequest,
  CertificateType,
  EventScheduleRequest,
  EventStatus,
  PaymentResponse,
  RegistrationResponse,
  TaskStatus,
  VolunteerResponse,
  VolunteerTaskResponse,
} from '@/types';

/* ------------------------------- overview ------------------------------ */

const STATUS_CHOICES: EventStatus[] = [
  'PUBLISHED',
  'UPCOMING',
  'ONGOING',
  'COMPLETED',
  'CANCELLED',
];

export function OverviewTab({
  eventId,
  eventStatus,
  onChanged,
}: {
  eventId: number;
  eventStatus: EventStatus;
  onChanged: () => void;
}) {
  const { data: stats, loading, error, reload } = useQuery(
    () => analyticsService.eventStats(eventId),
    [eventId],
  );
  const [busy, setBusy] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function publish() {
    setBusy(true);
    try {
      await eventService.publish(eventId);
      toast.success('Event published.');
      onChanged();
      reload();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not publish event.'));
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(status: EventStatus) {
    setBusy(true);
    try {
      await eventService.updateStatus(eventId, status);
      toast.success(`Status set to ${EVENT_STATUS_LABELS[status]}.`);
      onChanged();
      reload();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update status.'));
    } finally {
      setBusy(false);
    }
  }

  async function downloadReport() {
    setDownloading(true);
    try {
      const blob = await analyticsService.eventReport(eventId);
      downloadBlob(blob, `event-${eventId}-report.xlsx`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not download report.'));
    } finally {
      setDownloading(false);
    }
  }

  if (loading) return <FullPageLoader />;
  if (error || !stats) return <ErrorState message={error ?? 'No stats.'} onRetry={reload} />;

  const chartData = [
    { name: 'Confirmed', value: stats.confirmed, color: '#16a34a' },
    { name: 'Waitlisted', value: stats.waitlisted, color: '#d97706' },
    { name: 'Cancelled', value: stats.cancelled, color: '#dc2626' },
    { name: 'Attended', value: stats.attendanceCount, color: '#4f46e5' },
  ];

  return (
    <div className="space-y-6">
      {/* Status controls */}
      <div className="card flex flex-wrap items-center gap-3 p-5">
        <div className="mr-auto">
          <p className="text-sm text-slate-500 dark:text-slate-400">Current status</p>
          <div className="mt-1">
            <EventStatusBadge status={eventStatus} />
          </div>
        </div>
        {eventStatus === 'DRAFT' && (
          <Button onClick={publish} loading={busy}>
            <Send className="h-4 w-4" /> Publish event
          </Button>
        )}
        <div className="w-48">
          <Select
            aria-label="Change status"
            value=""
            disabled={busy}
            onChange={(e) => {
              const v = e.target.value as EventStatus;
              if (v) void changeStatus(v);
            }}
          >
            <option value="">Change status…</option>
            {STATUS_CHOICES.filter((s) => s !== eventStatus).map((s) => (
              <option key={s} value={s}>
                {EVENT_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
        <Button variant="secondary" onClick={downloadReport} loading={downloading}>
          <Download className="h-4 w-4" /> Excel report
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total registrations" value={stats.totalRegistrations} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Active" value={stats.activeRegistrations} hint={`${stats.confirmed} confirmed`} />
        <StatCard
          label="Attendance"
          value={stats.attendanceCount}
          hint={`${Math.round(stats.attendanceRate * 100)}% of active`}
        />
        <StatCard label="Revenue" value={formatCurrency(stats.revenue)} icon={<Trophy className="h-5 w-5" />} />
      </div>

      {/* Chart + rating */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">
            Registration breakdown
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="currentColor" className="text-slate-400" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="currentColor" className="text-slate-400" />
                <Tooltip
                  cursor={{ fill: 'rgba(148,163,184,0.1)' }}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card flex flex-col items-center justify-center p-6 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">Average rating</p>
          <p className="mt-2 flex items-center gap-2 text-4xl font-bold text-slate-900 dark:text-slate-100">
            <Star className="h-7 w-7 fill-amber-400 text-amber-400" />
            {stats.averageRating ? stats.averageRating.toFixed(1) : '—'}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            from {stats.feedbackCount} response{stats.feedbackCount === 1 ? '' : 's'}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- registrations ---------------------------- */

export function RegistrationsTab({ eventId }: { eventId: number }) {
  const [page, setPage] = useState(0);
  const {
    data,
    loading,
    error,
    reload: reloadRegs,
  } = useQuery(() => registrationService.forEvent(eventId, page, 20), [eventId, page]);
  const { data: attendance, reload: reloadAttendance } = useQuery(
    () => attendanceService.forEvent(eventId),
    [eventId],
  );

  const attendedRegIds = useMemo(
    () => new Set((attendance ?? []).map((a) => a.registrationId)),
    [attendance],
  );

  const [busyId, setBusyId] = useState<number | null>(null);
  const [toCancel, setToCancel] = useState<RegistrationResponse | null>(null);

  function refreshAll() {
    reloadRegs();
    reloadAttendance();
  }

  async function markPresent(r: RegistrationResponse) {
    setBusyId(r.id);
    try {
      await attendanceService.manualCheckIn({ registrationId: r.id });
      toast.success(`Marked ${r.userName} present.`);
      refreshAll();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not mark attendance.'));
    } finally {
      setBusyId(null);
    }
  }

  async function confirmCancel() {
    if (!toCancel) return;
    try {
      await registrationService.cancel(toCancel.id);
      toast.success('Registration cancelled.');
      refreshAll();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not cancel registration.'));
      throw err;
    }
  }

  if (loading) return <FullPageLoader />;
  if (error) return <ErrorState message={error} onRetry={reloadRegs} />;
  if (!data || data.content.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-6 w-6" />}
        title="No registrations yet"
        description="Registrations for this event will appear here."
      />
    );
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Attendee</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Ticket</th>
              <th className="px-4 py-3">Registered</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.content.map((r) => {
              const attended = attendedRegIds.has(r.id);
              const cancelled = r.status === 'CANCELLED';
              return (
                <tr key={r.id} className="bg-white dark:bg-slate-900">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={r.userName} size="sm" />
                      <span className="font-medium text-slate-900 dark:text-slate-100">{r.userName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {r.type === 'TEAM' ? r.teamName ?? 'Team' : 'Individual'}
                  </td>
                  <td className="px-4 py-3">
                    <RegistrationStatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                    {r.ticketCode}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {formatDate(r.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {attended ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                          <Check className="h-4 w-4" /> Present
                        </span>
                      ) : (
                        !cancelled && (
                          <Button
                            size="sm"
                            variant="secondary"
                            loading={busyId === r.id}
                            onClick={() => markPresent(r)}
                          >
                            <Check className="h-4 w-4" /> Present
                          </Button>
                        )
                      )}
                      {!cancelled && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setToCancel(r)}
                          aria-label="Cancel registration"
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
      </div>

      <ConfirmDialog
        open={!!toCancel}
        onClose={() => setToCancel(null)}
        onConfirm={confirmCancel}
        title="Cancel this registration?"
        message={
          toCancel
            ? `${toCancel.userName}'s registration will be cancelled. They can register again while registration remains open.`
            : ''
        }
        confirmLabel="Cancel registration"
        cancelLabel="Keep"
        danger
      />
    </div>
  );
}

/* ------------------------------ attendance ----------------------------- */

/** Escape a single CSV cell (quote when it contains a comma, quote or newline). */
function csvCell(value: string): string {
  const v = value ?? '';
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export function AttendanceTab({ eventId }: { eventId: number }) {
  const {
    data: attendance,
    loading: attLoading,
    reload: reloadAttendance,
  } = useQuery(() => attendanceService.forEvent(eventId), [eventId]);
  const {
    data: regs,
    loading: regsLoading,
    reload: reloadRegs,
  } = useQuery(() => registrationService.forEvent(eventId, 0, 200), [eventId]);

  const [ticketCode, setTicketCode] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);
  const [busyRegId, setBusyRegId] = useState<number | null>(null);

  const attendedRegIds = useMemo(
    () => new Set((attendance ?? []).map((a) => a.registrationId)),
    [attendance],
  );

  function refreshAll() {
    reloadAttendance();
    reloadRegs();
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    if (!ticketCode.trim()) return;
    setCheckingIn(true);
    try {
      const res = await attendanceService.checkIn({ ticketCode: ticketCode.trim() });
      toast.success(`Checked in ${res.userName}.`);
      setTicketCode('');
      refreshAll();
    } catch (err) {
      toast.error(errorMessage(err, 'Invalid or already-used ticket.'));
    } finally {
      setCheckingIn(false);
    }
  }

  async function manualCheckIn(registrationId: number, name: string) {
    setBusyRegId(registrationId);
    try {
      await attendanceService.manualCheckIn({ registrationId });
      toast.success(`Checked in ${name}.`);
      refreshAll();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not check in.'));
    } finally {
      setBusyRegId(null);
    }
  }

  async function checkOut(attendanceId: number) {
    setBusyRegId(attendanceId);
    try {
      await attendanceService.checkOut(attendanceId);
      toast.success('Checked out.');
      refreshAll();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not check out.'));
    } finally {
      setBusyRegId(null);
    }
  }

  function exportCsv() {
    const rows = attendance ?? [];
    if (rows.length === 0) return;
    const header = ['Name', 'Ticket', 'Method', 'Checked in', 'Checked out'];
    const body = rows.map((a) => [
      a.userName,
      a.ticketCode,
      a.method,
      a.checkInAt ? new Date(a.checkInAt).toISOString() : '',
      a.checkOutAt ? new Date(a.checkOutAt).toISOString() : '',
    ]);
    const csv = [header, ...body].map((cols) => cols.map(csvCell).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `event-${eventId}-attendance.csv`);
  }

  const pendingRegs = (regs?.content ?? []).filter(
    (r) => r.status !== 'CANCELLED' && !attendedRegIds.has(r.id),
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Left: check-in tools */}
      <div className="space-y-6">
        <div className="card p-6">
          <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
            <QrCode className="h-4 w-4 text-brand-600" /> Check in by ticket code
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Scan the attendee's QR (it contains only the opaque ticket code) or type it in.
          </p>
          <form onSubmit={submitCode} className="mt-4 flex gap-2">
            <TextInput
              value={ticketCode}
              onChange={(e) => setTicketCode(e.target.value)}
              placeholder="e.g. TCK-3F9A2B"
              className="font-mono"
            />
            <Button type="submit" loading={checkingIn}>
              Check in
            </Button>
          </form>
        </div>

        <div className="card p-6">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
            <Users className="h-4 w-4 text-brand-600" /> Manual check-in
          </h3>
          {regsLoading ? (
            <FullPageLoader />
          ) : pendingRegs.length === 0 ? (
            <p className="text-sm text-slate-400">Everyone active has been checked in.</p>
          ) : (
            <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {pendingRegs.map((r) => (
                <li key={r.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-2.5 dark:border-slate-800">
                  <Avatar name={r.userName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                      {r.userName}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {r.type === 'TEAM' ? r.teamName ?? 'Team' : 'Individual'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={busyRegId === r.id}
                    onClick={() => manualCheckIn(r.id, r.userName)}
                  >
                    <Check className="h-4 w-4" /> Present
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Right: attendance log */}
      <div className="card p-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
            <Check className="h-4 w-4 text-brand-600" /> Checked in ({attendance?.length ?? 0})
          </h3>
          {attendance && attendance.length > 0 && (
            <Button size="sm" variant="ghost" onClick={exportCsv}>
              <Download className="h-4 w-4" /> CSV
            </Button>
          )}
        </div>
        {attLoading ? (
          <FullPageLoader />
        ) : !attendance || attendance.length === 0 ? (
          <p className="text-sm text-slate-400">No check-ins yet.</p>
        ) : (
          <ul className="max-h-[32rem] space-y-2 overflow-y-auto pr-1">
            {attendance.map((a) => (
              <li key={a.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-2.5 dark:border-slate-800">
                <Avatar name={a.userName} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                    {a.userName}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    <Badge className="mr-1 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      {a.method}
                    </Badge>
                    in {formatDateTime(a.checkInAt)}
                    {a.checkOutAt ? ` · out ${formatDateTime(a.checkOutAt)}` : ''}
                  </p>
                </div>
                {!a.checkOutAt && (
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={busyRegId === a.id}
                    onClick={() => checkOut(a.id)}
                  >
                    Check out
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ------------------------------- schedule ------------------------------ */

export function ScheduleTab({ eventId }: { eventId: number }) {
  const { data, loading, error, reload } = useQuery(() => eventService.schedule(eventId), [eventId]);
  const [addOpen, setAddOpen] = useState(false);
  const [toDelete, setToDelete] = useState<number | null>(null);

  const items = useMemo(
    () =>
      [...(data ?? [])].sort(
        (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime(),
      ),
    [data],
  );

  async function confirmDelete() {
    if (toDelete == null) return;
    try {
      await eventService.removeSchedule(eventId, toDelete);
      toast.success('Schedule item removed.');
      reload();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not remove item.'));
      throw err;
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" /> Add item
        </Button>
      </div>

      {loading ? (
        <FullPageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<CalendarClock className="h-6 w-6" />}
          title="No schedule yet"
          description="Add sessions, talks or breaks to build the agenda."
          action={
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" /> Add the first item
            </Button>
          }
        />
      ) : (
        <ol className="relative space-y-4 border-l-2 border-slate-200 pl-6 dark:border-slate-700">
          {items.map((s) => (
            <li key={s.id} className="relative">
              <span className="absolute -left-[1.85rem] top-1.5 h-3 w-3 rounded-full bg-brand-600 ring-4 ring-white dark:ring-slate-900" />
              <div className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      {s.dayNumber ? (
                        <Badge className="bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                          Day {s.dayNumber}
                        </Badge>
                      ) : null}
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">{s.title}</h4>
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {formatDateTime(s.startDateTime)}
                      {s.endDateTime ? ` – ${formatDateTime(s.endDateTime)}` : ''}
                    </p>
                    {s.speaker && <p className="text-sm text-slate-500 dark:text-slate-400">Speaker: {s.speaker}</p>}
                    {s.venue && <p className="text-sm text-slate-500 dark:text-slate-400">Venue: {s.venue}</p>}
                    {s.description && (
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{s.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setToDelete(s.id)}
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}

      <AddScheduleModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        eventId={eventId}
        onAdded={() => {
          setAddOpen(false);
          reload();
        }}
      />

      <ConfirmDialog
        open={toDelete != null}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Remove schedule item?"
        message="This removes the item from the event agenda."
        confirmLabel="Remove"
        danger
      />
    </div>
  );
}

function AddScheduleModal({
  open,
  onClose,
  eventId,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  eventId: number;
  onAdded: () => void;
}) {
  const empty: EventScheduleRequest = { title: '', startDateTime: '' };
  const [form, setForm] = useState<EventScheduleRequest>(empty);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function set<K extends keyof EventScheduleRequest>(key: K, value: EventScheduleRequest[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit() {
    if (!form.title.trim() || !form.startDateTime) {
      setErr('Title and start time are required.');
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await eventService.addSchedule(eventId, {
        title: form.title.trim(),
        startDateTime: form.startDateTime,
        endDateTime: form.endDateTime || undefined,
        description: form.description || undefined,
        speaker: form.speaker || undefined,
        venue: form.venue || undefined,
        dayNumber: form.dayNumber || undefined,
      });
      toast.success('Schedule item added.');
      setForm(empty);
      onAdded();
    } catch (e) {
      setErr(errorMessage(e, 'Could not add item.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={busy ? () => undefined : onClose}
      title="Add schedule item"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} loading={busy}>
            Add item
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Title" htmlFor="sch-title" required>
          <TextInput
            id="sch-title"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="e.g. Keynote"
            autoFocus
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Starts" htmlFor="sch-start" required>
            <TextInput
              id="sch-start"
              type="datetime-local"
              value={form.startDateTime}
              onChange={(e) => set('startDateTime', e.target.value)}
            />
          </Field>
          <Field label="Ends" htmlFor="sch-end">
            <TextInput
              id="sch-end"
              type="datetime-local"
              value={form.endDateTime ?? ''}
              onChange={(e) => set('endDateTime', e.target.value)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Speaker" htmlFor="sch-speaker">
            <TextInput
              id="sch-speaker"
              value={form.speaker ?? ''}
              onChange={(e) => set('speaker', e.target.value)}
            />
          </Field>
          <Field label="Day number" htmlFor="sch-day">
            <TextInput
              id="sch-day"
              type="number"
              min={1}
              value={form.dayNumber ?? ''}
              onChange={(e) => set('dayNumber', e.target.value ? Number(e.target.value) : undefined)}
            />
          </Field>
        </div>
        <Field label="Venue" htmlFor="sch-venue">
          <TextInput
            id="sch-venue"
            value={form.venue ?? ''}
            onChange={(e) => set('venue', e.target.value)}
          />
        </Field>
        <Field label="Description" htmlFor="sch-desc">
          <TextArea
            id="sch-desc"
            rows={2}
            value={form.description ?? ''}
            onChange={(e) => set('description', e.target.value)}
          />
        </Field>
        {err && <p className="field-error">{err}</p>}
      </div>
    </Modal>
  );
}

/* ----------------------------- competitions ---------------------------- */

export function CompetitionsTab({ eventId, teamEvent }: { eventId: number; teamEvent: boolean }) {
  const { data, loading, error, reload } = useQuery(
    () => competitionService.forEvent(eventId),
    [eventId],
  );
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> New competition
        </Button>
      </div>

      {loading ? (
        <FullPageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={<Trophy className="h-6 w-6" />}
          title="No competitions yet"
          description="Add a competition to manage rounds, judges and scoring."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> Create a competition
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {data.map((c) => (
            <Link key={c.id} to={`/app/manage/competitions/${c.id}`} className="card block p-5 transition hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">{c.title}</h4>
                <CompetitionStatusBadge status={c.status} />
              </div>
              {c.description && (
                <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                  {c.description}
                </p>
              )}
              <p className="mt-3 text-xs text-slate-400">
                {c.teamBased ? 'Team-based' : 'Individual'} · {c.roundCount} round
                {c.roundCount === 1 ? '' : 's'} · {c.judgeCount} judge{c.judgeCount === 1 ? '' : 's'}
              </p>
            </Link>
          ))}
        </div>
      )}

      <CreateCompetitionModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        eventId={eventId}
        defaultTeamBased={teamEvent}
        onCreated={() => {
          setCreateOpen(false);
          reload();
        }}
      />
    </div>
  );
}

function CreateCompetitionModal({
  open,
  onClose,
  eventId,
  defaultTeamBased,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  eventId: number;
  defaultTeamBased: boolean;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [teamBased, setTeamBased] = useState(defaultTeamBased);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (!title.trim()) {
      setErr('Title is required.');
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await competitionService.create({
        eventId,
        title: title.trim(),
        description: description || undefined,
        teamBased,
      });
      toast.success('Competition created.');
      setTitle('');
      setDescription('');
      onCreated();
    } catch (e) {
      setErr(errorMessage(e, 'Could not create competition.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={busy ? () => undefined : onClose}
      title="New competition"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} loading={busy}>
            Create
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Title" htmlFor="comp-title" required>
          <TextInput
            id="comp-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Hackathon Finals"
            autoFocus
          />
        </Field>
        <Field label="Description" htmlFor="comp-desc">
          <TextArea
            id="comp-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            checked={teamBased}
            onChange={(e) => setTeamBased(e.target.checked)}
          />
          <span className="text-sm text-slate-700 dark:text-slate-200">Team-based competition</span>
        </label>
        {err && <p className="field-error">{err}</p>}
      </div>
    </Modal>
  );
}

/* ----------------------------- certificates ---------------------------- */

const CERT_TYPES: CertificateType[] = ['PARTICIPATION', 'WINNER', 'MERIT'];

export function CertificatesTab({ eventId }: { eventId: number }) {
  const { data, loading, error, reload } = useQuery(
    () => certificateService.forEvent(eventId),
    [eventId],
  );
  const template = useQuery(
    () => certificateService.getTemplate(eventId),
    [eventId],
  );

  const [email, setEmail] = useState('');
  const [type, setType] = useState<CertificateType>('PARTICIPATION');
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [toRevoke, setToRevoke] = useState<CertificateResponse | null>(null);

  // design editor
  const [designOpen, setDesignOpen] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  // bulk issuing & delivery
  const [zipping, setZipping] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [skipNotes, setSkipNotes] = useState<string[]>([]);

  // participant-selection picker
  const [pickerOpen, setPickerOpen] = useState(false);

  async function issue(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Recipient email is required.');
      return;
    }
    setBusy(true);
    try {
      await certificateService.issue({
        email: email.trim(),
        eventId,
        type,
        title: title.trim() || undefined,
      });
      toast.success('Certificate issued.');
      setEmail('');
      setTitle('');
      reload();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not issue certificate.'));
    } finally {
      setBusy(false);
    }
  }

  async function download(id: number, code: string) {
    setDownloadingId(id);
    try {
      const blob = await certificateService.download(id);
      downloadBlob(blob, `certificate-${code}.pdf`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not download certificate.'));
    } finally {
      setDownloadingId(null);
    }
  }

  async function confirmRevoke() {
    if (!toRevoke) return;
    try {
      await certificateService.revoke(toRevoke.id);
      toast.success('Certificate revoked.');
      reload();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not revoke certificate.'));
      throw err;
    }
  }

  async function saveTemplate(req: CertificateTemplateRequest) {
    setSavingTemplate(true);
    try {
      await certificateService.saveTemplate(eventId, req);
      toast.success('Certificate design saved.');
      setDesignOpen(false);
      template.reload();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save the design.'));
    } finally {
      setSavingTemplate(false);
    }
  }

  // Called by the picker after a targeted generation succeeds.
  function onGenerated(reasons: string[]) {
    setSkipNotes(reasons);
    setPickerOpen(false);
    reload();
  }

  async function downloadZip() {
    setZipping(true);
    try {
      const blob = await certificateService.downloadZip(eventId);
      downloadBlob(blob, `certificates-event-${eventId}.zip`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not download the ZIP.'));
    } finally {
      setZipping(false);
    }
  }

  async function emailAll() {
    setEmailing(true);
    try {
      const dispatched = await certificateService.emailAll(eventId);
      toast.success(
        dispatched > 0
          ? `Emailing ${dispatched} certificate(s) to participants.`
          : 'No certificates to email yet.',
      );
    } catch (err) {
      toast.error(errorMessage(err, 'Could not email certificates.'));
    } finally {
      setEmailing(false);
    }
  }

  const issuedCount = data?.length ?? 0;
  const tpl = template.data ?? null;

  return (
    <>
    {/* Design & bulk delivery */}
    <div className="card mb-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
            <Palette className="h-4 w-4 text-brand-600" /> Certificate design &amp; delivery
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {template.loading
              ? 'Loading the current design…'
              : tpl
                ? `Design: ${tpl.name}`
                : 'No design configured yet — a clean default layout is used until you set one.'}
          </p>
          {tpl && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tpl.requirePayment && (
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                  Requires payment
                </Badge>
              )}
              {tpl.autoIssueOnComplete && (
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  Auto-issues on completion · {CERTIFICATE_SCOPE_LABELS[tpl.autoIssueScope]}
                </Badge>
              )}
            </div>
          )}
        </div>
        <Button variant="secondary" onClick={() => setDesignOpen(true)}>
          <Palette className="h-4 w-4" /> {tpl ? 'Edit design' : 'Design certificate'}
        </Button>
      </div>

      <div className="mt-5 border-t border-slate-200 pt-5 dark:border-slate-800">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Bulk issue &amp; deliver
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <Button onClick={() => setPickerOpen(true)}>
            <Sparkles className="h-4 w-4" /> Select participants &amp; generate
          </Button>
          <Button variant="secondary" onClick={downloadZip} loading={zipping} disabled={issuedCount === 0}>
            <Package className="h-4 w-4" /> Download all (ZIP)
          </Button>
          <Button variant="secondary" onClick={emailAll} loading={emailing} disabled={issuedCount === 0}>
            <Send className="h-4 w-4" /> Email participants
          </Button>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Pick the exact participants to certify — the list is scoped to this event only. Anyone
          who already holds a certificate of that type is skipped; on a paid event with a payment
          gate, unpaid participants are skipped too.
        </p>

        {skipNotes.length > 0 && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900/50 dark:bg-amber-900/20">
            <p className="mb-1 font-medium text-amber-800 dark:text-amber-300">
              Skipped {skipNotes.length} recipient(s):
            </p>
            <ul className="list-inside list-disc space-y-0.5 text-amber-700 dark:text-amber-300/90">
              {skipNotes.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Issue form */}
      <div className="lg:col-span-1">
        <form onSubmit={issue} className="card p-6">
          <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
            <Award className="h-4 w-4 text-brand-600" /> Issue certificate
          </h3>
          <div className="mt-4 space-y-4">
            <Field label="Recipient email" htmlFor="cert-email" required>
              <TextInput
                id="cert-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
              />
            </Field>
            <Field label="Type" htmlFor="cert-type">
              <Select id="cert-type" value={type} onChange={(e) => setType(e.target.value as CertificateType)}>
                {CERT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {CERTIFICATE_TYPE_LABELS[t]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Custom title" htmlFor="cert-title" hint="Optional — defaults from the type">
              <TextInput
                id="cert-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. First Prize — Hackathon"
              />
            </Field>
            <Button type="submit" fullWidth loading={busy}>
              Issue certificate
            </Button>
          </div>
        </form>
      </div>

      {/* Issued list */}
      <div className="lg:col-span-2">
        {loading ? (
          <FullPageLoader />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : !data || data.length === 0 ? (
          <EmptyState
            icon={<Award className="h-6 w-6" />}
            title="No certificates issued"
            description="Issued certificates will be listed here."
          />
        ) : (
          <ul className="space-y-2">
            {data.map((c) => (
              <li key={c.id} className="card flex items-center gap-3 p-4">
                <Avatar name={c.userName} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                      {c.userName}
                    </p>
                    <Badge className="bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                      {CERTIFICATE_TYPE_LABELS[c.type]}
                    </Badge>
                    {c.revoked && (
                      <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                        Revoked
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-xs text-slate-400">
                    {c.title} · issued {formatDate(c.issuedAt)} · {c.certificateCode}
                    {c.revoked && c.revokedAt ? ` · revoked ${formatDate(c.revokedAt)}` : ''}
                  </p>
                </div>
                {!c.revoked && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={downloadingId === c.id}
                      onClick={() => download(c.id, c.certificateCode)}
                    >
                      <Download className="h-4 w-4" /> PDF
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setToRevoke(c)}
                      aria-label="Revoke certificate"
                    >
                      <Ban className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>

      <Modal
        open={designOpen}
        onClose={() => setDesignOpen(false)}
        title="Certificate design"
        size="xl"
      >
        <CertificateTemplateForm
          initial={tpl}
          saving={savingTemplate}
          submitLabel="Save design"
          showIssueSettings
          onSubmit={saveTemplate}
          extraActions={
            <Button type="button" variant="ghost" onClick={() => setDesignOpen(false)}>
              Cancel
            </Button>
          }
        />
      </Modal>

      <Modal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Generate certificates"
        size="xl"
      >
        <CertificateParticipantPicker
          eventId={eventId}
          onCancel={() => setPickerOpen(false)}
          onGenerated={onGenerated}
        />
      </Modal>

      <ConfirmDialog
        open={!!toRevoke}
        onClose={() => setToRevoke(null)}
        onConfirm={confirmRevoke}
        title="Revoke this certificate?"
        message={
          toRevoke
            ? `${toRevoke.userName}'s certificate will be marked revoked. Public verification will show it as no longer valid, but the record is preserved.`
            : ''
        }
        confirmLabel="Revoke"
        danger
      />
    </>
  );
}

/**
 * Participant selection + targeted bulk generation. Loads the event's eligible participants
 * (scoped to the event — never the whole user table), lets the coordinator narrow by scope and
 * search, tick individuals (with Select all / Deselect all), then issues to exactly those chosen.
 * Participants who already hold a certificate of the chosen type are shown but pre-excluded.
 */
function CertificateParticipantPicker({
  eventId,
  onCancel,
  onGenerated,
}: {
  eventId: number;
  onCancel: () => void;
  onGenerated: (reasons: string[]) => void;
}) {
  const [scope, setScope] = useState<CertificateRecipientScope>('REGISTERED');
  const [type, setType] = useState<CertificateType>('PARTICIPATION');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [generating, setGenerating] = useState(false);

  const { data, loading, error, reload } = useQuery(
    () => certificateService.eligibleParticipants(eventId, scope, type),
    [eventId, scope, type],
  );

  const participants = useMemo(() => data ?? [], [data]);

  // Whenever the loaded set changes (scope/type switch), default-select everyone who does not
  // already hold this certificate — the common case — but leave the coordinator free to adjust.
  useEffect(() => {
    setSelected(new Set(participants.filter((p) => !p.alreadyIssued).map((p) => p.userId)));
  }, [participants]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return participants;
    return participants.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) || p.email.toLowerCase().includes(q),
    );
  }, [participants, query]);

  const selectableInView = filtered.filter((p) => !p.alreadyIssued);
  const allInViewSelected =
    selectableInView.length > 0 && selectableInView.every((p) => selected.has(p.userId));

  function toggle(userId: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  function selectAllInView() {
    setSelected((prev) => {
      const next = new Set(prev);
      selectableInView.forEach((p) => next.add(p.userId));
      return next;
    });
  }

  function deselectAllInView() {
    setSelected((prev) => {
      const next = new Set(prev);
      selectableInView.forEach((p) => next.delete(p.userId));
      return next;
    });
  }

  async function generate() {
    const userIds = Array.from(selected);
    if (userIds.length === 0) {
      toast.error('Select at least one participant.');
      return;
    }
    setGenerating(true);
    try {
      const result = await certificateService.generateSelected(eventId, { userIds, type });
      toast.success(
        `Issued ${result.issued} certificate(s)` +
          (result.skipped ? `, skipped ${result.skipped}.` : '.'),
      );
      onGenerated(result.reasons ?? []);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not generate certificates.'));
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Eligible pool" htmlFor="picker-scope" className="min-w-[12rem]">
          <Select
            id="picker-scope"
            value={scope}
            onChange={(e) => setScope(e.target.value as CertificateRecipientScope)}
          >
            {(['REGISTERED', 'ATTENDED'] as CertificateRecipientScope[]).map((s) => (
              <option key={s} value={s}>
                {CERTIFICATE_SCOPE_LABELS[s]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Certificate type" htmlFor="picker-type" className="min-w-[10rem]">
          <Select
            id="picker-type"
            value={type}
            onChange={(e) => setType(e.target.value as CertificateType)}
          >
            {CERT_TYPES.map((t) => (
              <option key={t} value={t}>
                {CERTIFICATE_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </Field>
        <div className="relative flex-1 min-w-[12rem]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <TextInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email..."
            className="pl-9"
            aria-label="Search participants"
          />
        </div>
      </div>

      {/* Select all / deselect all */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={selectAllInView}
            disabled={selectableInView.length === 0 || allInViewSelected}
          >
            <CheckSquare className="h-4 w-4" /> Select all
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={deselectAllInView}
            disabled={selectableInView.length === 0}
          >
            <Square className="h-4 w-4" /> Deselect all
          </Button>
        </div>
        <span className="text-slate-500 dark:text-slate-400">
          {selected.size} selected · {participants.length} eligible
        </span>
      </div>

      {/* List */}
      <div className="max-h-[46vh] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FullPageLoader />
          </div>
        ) : error ? (
          <div className="p-4">
            <ErrorState message={error} onRetry={reload} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<Users className="h-6 w-6" />}
              title={participants.length === 0 ? 'No eligible participants' : 'No matches'}
              description={
                participants.length === 0
                  ? scope === 'ATTENDED'
                    ? 'No one has a recorded attendance for this event yet.'
                    : 'No active registrations for this event yet.'
                  : 'Try a different search term.'
              }
            />
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {filtered.map((p) => {
              const isSelected = selected.has(p.userId);
              return (
                <li key={p.userId}>
                  <label
                    className={cn(
                      'flex cursor-pointer items-center gap-3 px-4 py-2.5',
                      p.alreadyIssued
                        ? 'cursor-not-allowed opacity-60'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40',
                    )}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      checked={isSelected}
                      disabled={p.alreadyIssued}
                      onChange={() => toggle(p.userId)}
                      aria-label={`Select ${p.fullName}`}
                    />
                    <Avatar name={p.fullName} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                        {p.fullName}
                      </p>
                      <p className="truncate text-xs text-slate-400">{p.email}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {p.attended && (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                          <UserCheck className="mr-1 h-3 w-3" /> Attended
                        </Badge>
                      )}
                      {p.paid && (
                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                          Paid
                        </Badge>
                      )}
                      {p.alreadyIssued && (
                        <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          Already issued
                        </Badge>
                      )}
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={generating}>
          Cancel
        </Button>
        <Button onClick={generate} loading={generating} disabled={selected.size === 0}>
          <Sparkles className="h-4 w-4" /> Generate {selected.size > 0 ? `(${selected.size})` : ''}
        </Button>
      </div>
    </div>
  );
}

/* ---------------------------- announcements ---------------------------- */

export function AnnouncementsTab({ eventId, eventTitle }: { eventId: number; eventTitle: string }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [toDelete, setToDelete] = useState<AnnouncementResponse | null>(null);

  const { data, loading, error, reload } = useQuery(
    () => announcementService.forEvent(eventId),
    [eventId],
  );

  const announcements = useMemo(
    () =>
      [...(data ?? [])].sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }),
    [data],
  );

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await announcementService.remove(toDelete.id);
      toast.success('Announcement deleted.');
      reload();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete announcement.'));
      throw err;
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> New announcement
        </Button>
      </div>

      {loading ? (
        <FullPageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="h-6 w-6" />}
          title="No announcements yet"
          description="Post updates to everyone registered for this event."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> Post the first one
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {announcements.map((a) => (
            <li key={a.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {a.pinned && <Pin className="h-4 w-4 text-brand-600" />}
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">{a.title}</h4>
                  </div>
                  <p className="mt-1 whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">
                    {a.content}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    {a.authorName} · {fromNow(a.createdAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setToDelete(a)}
                  aria-label="Delete announcement"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <CreateEventAnnouncementModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        eventId={eventId}
        eventTitle={eventTitle}
        onCreated={() => {
          setCreateOpen(false);
          reload();
        }}
      />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete announcement?"
        message="This removes the announcement for all registered attendees."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

function CreateEventAnnouncementModal({
  open,
  onClose,
  eventId,
  eventTitle,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  eventId: number;
  eventTitle: string;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pinned, setPinned] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (!title.trim() || !content.trim()) {
      setErr('Title and content are required.');
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await announcementService.create({
        scope: 'EVENT',
        eventId,
        title: title.trim(),
        content: content.trim(),
        pinned,
      });
      toast.success('Announcement posted.');
      setTitle('');
      setContent('');
      setPinned(false);
      onCreated();
    } catch (e) {
      setErr(errorMessage(e, 'Could not post announcement.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={busy ? () => undefined : onClose}
      title={`New announcement · ${eventTitle}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} loading={busy}>
            Post announcement
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Title" htmlFor="eann-title" required>
          <TextInput
            id="eann-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Venue changed to Hall B"
            autoFocus
          />
        </Field>
        <Field label="Content" htmlFor="eann-content" required>
          <TextArea
            id="eann-content"
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </Field>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
          />
          <span className="text-sm text-slate-700 dark:text-slate-200">Pin to the top</span>
        </label>
        {err && <p className="field-error">{err}</p>}
      </div>
    </Modal>
  );
}

/* ------------------------------- feedback ------------------------------ */

export function FeedbackTab({ eventId }: { eventId: number }) {
  const { data: summary, loading: summaryLoading } = useQuery(
    () => feedbackService.summary(eventId),
    [eventId],
  );
  const { data: list, loading: listLoading, error, reload } = useQuery(
    () => feedbackService.forEvent(eventId),
    [eventId],
  );

  if (summaryLoading || listLoading) return <FullPageLoader />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const total = summary?.totalResponses ?? 0;
  const maxCount = summary
    ? Math.max(1, ...Object.values(summary.distribution ?? {}))
    : 1;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Summary */}
      <div className="lg:col-span-1">
        <div className="card p-6">
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">Average rating</p>
            <p className="mt-2 flex items-center justify-center gap-2 text-4xl font-bold text-slate-900 dark:text-slate-100">
              <Star className="h-7 w-7 fill-amber-400 text-amber-400" />
              {summary && summary.averageRating ? summary.averageRating.toFixed(1) : '—'}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {total} response{total === 1 ? '' : 's'}
            </p>
          </div>
          <div className="mt-6 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = summary?.distribution?.[star] ?? 0;
              return (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-8 text-slate-500 dark:text-slate-400">{star}★</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-slate-400">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="lg:col-span-2">
        {!list || list.length === 0 ? (
          <EmptyState
            icon={<Star className="h-6 w-6" />}
            title="No feedback yet"
            description="Attendee ratings and comments will appear here after the event."
          />
        ) : (
          <ul className="space-y-3">
            {list.map((f) => (
              <li key={f.id} className="card p-5">
                <div className="flex items-center gap-3">
                  <Avatar name={f.userName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                      {f.userName}
                    </p>
                    <p className="text-xs text-slate-400">{fromNow(f.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-4 w-4',
                          i < f.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600',
                        )}
                      />
                    ))}
                  </div>
                </div>
                {f.comment && (
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{f.comment}</p>
                )}
                {f.suggestion && (
                  <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <span className="font-medium">Suggestion: </span>
                    {f.suggestion}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ------------------------------- payments ------------------------------ */

export function PaymentsTab({ eventId }: { eventId: number }) {
  const { data, loading, error, reload } = useQuery(
    () => paymentService.forEvent(eventId),
    [eventId],
  );
  const [toRefund, setToRefund] = useState<PaymentResponse | null>(null);
  const [receiptId, setReceiptId] = useState<number | null>(null);

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

  async function downloadReceipt(p: PaymentResponse) {
    setReceiptId(p.id);
    try {
      const blob = await paymentService.receipt(p.id);
      downloadBlob(blob, `receipt-${p.receiptNumber ?? p.id}.pdf`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not download the receipt.'));
    } finally {
      setReceiptId(null);
    }
  }

  if (loading) return <FullPageLoader />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const payments = data ?? [];
  const collected = payments
    .filter((p) => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + p.amount, 0);
  const refunded = payments
    .filter((p) => p.status === 'REFUNDED')
    .reduce((sum, p) => sum + p.amount, 0);

  if (payments.length === 0) {
    return (
      <EmptyState
        icon={<CreditCard className="h-6 w-6" />}
        title="No payments yet"
        description="Payments for this event will appear here once attendees pay the entry fee."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard
          label="Collected"
          value={formatCurrency(collected)}
          icon={<CreditCard className="h-5 w-5" />}
        />
        <StatCard label="Refunded" value={formatCurrency(refunded)} />
        <StatCard label="Transactions" value={payments.length} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Payer</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Receipt</th>
              <th className="px-4 py-3">Paid</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {payments.map((p) => (
              <tr key={p.id} className="bg-white dark:bg-slate-900">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={p.userName} size="sm" />
                    <span className="font-medium text-slate-900 dark:text-slate-100">{p.userName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                  {formatCurrency(p.amount)}
                </td>
                <td className="px-4 py-3">
                  <PaymentStatusBadge status={p.status} />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                  {p.receiptNumber ?? '—'}
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                  {p.paidAt ? formatDateTime(p.paidAt) : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {(p.status === 'SUCCESS' || p.status === 'REFUNDED') && (
                      <Button
                        size="sm"
                        variant="ghost"
                        loading={receiptId === p.id}
                        onClick={() => downloadReceipt(p)}
                        aria-label={`Download receipt for ${p.userName}`}
                      >
                        <Download className="h-4 w-4" /> Receipt
                      </Button>
                    )}
                    {p.status === 'SUCCESS' ? (
                      <Button size="sm" variant="ghost" onClick={() => setToRefund(p)}>
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

      <ConfirmDialog
        open={!!toRefund}
        onClose={() => setToRefund(null)}
        onConfirm={confirmRefund}
        title="Refund this payment?"
        message={
          toRefund
            ? `${formatCurrency(toRefund.amount)} will be refunded to ${toRefund.userName}. Their registration will revert to pending payment.`
            : ''
        }
        confirmLabel="Refund"
        danger
      />
    </div>
  );
}

/* ------------------------------ volunteers ----------------------------- */

const TASK_STATUS_META: Record<TaskStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  },
  IN_PROGRESS: {
    label: 'In progress',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
};

/** Advance a task through the PENDING → IN_PROGRESS → COMPLETED → PENDING cycle. */
function nextTaskStatus(status: TaskStatus): TaskStatus {
  if (status === 'PENDING') return 'IN_PROGRESS';
  if (status === 'IN_PROGRESS') return 'COMPLETED';
  return 'PENDING';
}

export function VolunteersTab({ eventId }: { eventId: number }) {
  const { data: volunteers, loading, error, reload } = useQuery(
    () => volunteerService.forEvent(eventId),
    [eventId],
  );
  const { data: tasks, reload: reloadTasks } = useQuery(
    () => volunteerService.tasksForEvent(eventId),
    [eventId],
  );

  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [recruiting, setRecruiting] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [busyTaskId, setBusyTaskId] = useState<number | null>(null);
  const [assignTo, setAssignTo] = useState<VolunteerResponse | null>(null);
  const [toRemove, setToRemove] = useState<VolunteerResponse | null>(null);
  const [toRemoveTask, setToRemoveTask] = useState<VolunteerTaskResponse | null>(null);

  const tasksByVolunteer = useMemo(() => {
    const map = new Map<number, VolunteerTaskResponse[]>();
    for (const t of tasks ?? []) {
      const list = map.get(t.volunteerId) ?? [];
      list.push(t);
      map.set(t.volunteerId, list);
    }
    return map;
  }, [tasks]);

  function refreshAll() {
    reload();
    reloadTasks();
  }

  async function recruit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Enter the volunteer’s email.');
      return;
    }
    setRecruiting(true);
    try {
      await volunteerService.recruit(eventId, {
        email: email.trim(),
        role: role.trim() || undefined,
      });
      toast.success('Volunteer added.');
      setEmail('');
      setRole('');
      refreshAll();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not add volunteer.'));
    } finally {
      setRecruiting(false);
    }
  }

  async function approve(v: VolunteerResponse) {
    setBusyId(v.id);
    try {
      await volunteerService.approve(v.id);
      toast.success(`${v.userName} approved.`);
      refreshAll();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not approve volunteer.'));
    } finally {
      setBusyId(null);
    }
  }

  async function cycleTaskStatus(task: VolunteerTaskResponse) {
    setBusyTaskId(task.id);
    try {
      await volunteerService.updateTaskStatus(task.id, nextTaskStatus(task.status));
      reloadTasks();
      reload();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update the task.'));
    } finally {
      setBusyTaskId(null);
    }
  }

  async function confirmRemove() {
    if (!toRemove) return;
    try {
      await volunteerService.remove(toRemove.id);
      toast.success('Volunteer removed.');
      refreshAll();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not remove volunteer.'));
      throw err;
    }
  }

  async function confirmRemoveTask() {
    if (!toRemoveTask) return;
    try {
      await volunteerService.removeTask(toRemoveTask.id);
      toast.success('Task deleted.');
      refreshAll();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete the task.'));
      throw err;
    }
  }

  const pendingCount = (volunteers ?? []).filter((v) => !v.approved).length;

  return (
    <div className="space-y-6">
      {/* Recruit */}
      <form onSubmit={recruit} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
        <Field
          label="Recruit a volunteer by email"
          htmlFor="vol-email"
          className="flex-1"
          hint="They must already have an account."
        >
          <TextInput
            id="vol-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@college.edu"
          />
        </Field>
        <Field label="Role" htmlFor="vol-role" className="sm:w-52">
          <TextInput
            id="vol-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Registration desk"
          />
        </Field>
        <Button type="submit" loading={recruiting}>
          <UserPlus className="h-4 w-4" /> Add
        </Button>
      </form>

      {loading ? (
        <FullPageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !volunteers || volunteers.length === 0 ? (
        <EmptyState
          icon={<HandHeart className="h-6 w-6" />}
          title="No volunteers yet"
          description="Recruit volunteers by email above, or approve students who apply from the event page."
        />
      ) : (
        <>
          {pendingCount > 0 && (
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
              {pendingCount} application{pendingCount === 1 ? '' : 's'} awaiting approval.
            </p>
          )}
          <ul className="space-y-3">
            {volunteers.map((v) => {
              const vTasks = tasksByVolunteer.get(v.id) ?? [];
              return (
                <li key={v.id} className="card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={v.userName} size="md" />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {v.userName}
                          </p>
                          {v.approved ? (
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                              Approved
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                              Pending
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          {v.userEmail}
                          {v.role ? ` · ${v.role}` : ''}
                        </p>
                        {v.approved && (
                          <p className="mt-0.5 text-xs text-slate-400">
                            {v.completedTaskCount}/{v.taskCount} task
                            {v.taskCount === 1 ? '' : 's'} done
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!v.approved && (
                        <Button
                          size="sm"
                          variant="secondary"
                          loading={busyId === v.id}
                          onClick={() => approve(v)}
                        >
                          <Check className="h-4 w-4" /> Approve
                        </Button>
                      )}
                      {v.approved && (
                        <Button size="sm" variant="secondary" onClick={() => setAssignTo(v)}>
                          <Plus className="h-4 w-4" /> Task
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setToRemove(v)}
                        aria-label={`Remove ${v.userName}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {vTasks.length > 0 && (
                    <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                      {vTasks.map((t) => {
                        const meta = TASK_STATUS_META[t.status];
                        return (
                          <li key={t.id} className="flex items-start gap-2.5">
                            <button
                              type="button"
                              disabled={busyTaskId === t.id}
                              onClick={() => cycleTaskStatus(t)}
                              className={cn(
                                'mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium transition disabled:opacity-50',
                                meta.className,
                              )}
                              title="Click to advance status"
                            >
                              {meta.label}
                            </button>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-slate-700 dark:text-slate-200">{t.title}</p>
                              {t.description && (
                                <p className="text-xs text-slate-400">{t.description}</p>
                              )}
                              {t.dueAt && (
                                <p className="flex items-center gap-1 text-xs text-slate-400">
                                  <CalendarClock className="h-3 w-3" /> Due {formatDateTime(t.dueAt)}
                                </p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setToRemoveTask(t)}
                              aria-label="Delete task"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}

      <AssignVolunteerTaskModal
        volunteer={assignTo}
        onClose={() => setAssignTo(null)}
        onAssigned={() => {
          setAssignTo(null);
          refreshAll();
        }}
      />

      <ConfirmDialog
        open={!!toRemove}
        onClose={() => setToRemove(null)}
        onConfirm={confirmRemove}
        title="Remove this volunteer?"
        message={
          toRemove
            ? `${toRemove.userName} will be removed from the volunteer roster and all their assigned tasks deleted.`
            : ''
        }
        confirmLabel="Remove"
        danger
      />

      <ConfirmDialog
        open={!!toRemoveTask}
        onClose={() => setToRemoveTask(null)}
        onConfirm={confirmRemoveTask}
        title="Delete this task?"
        message="This permanently removes the task from the volunteer."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

function AssignVolunteerTaskModal({
  volunteer,
  onClose,
  onAssigned,
}: {
  volunteer: VolunteerResponse | null;
  onClose: () => void;
  onAssigned: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Reset the form whenever the modal opens for a different volunteer.
  useEffect(() => {
    if (volunteer) {
      setTitle('');
      setDescription('');
      setDueAt('');
      setErr(null);
    }
  }, [volunteer]);

  async function submit() {
    if (!volunteer) return;
    if (!title.trim()) {
      setErr('Task title is required.');
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await volunteerService.assignTask(volunteer.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        dueAt: dueAt || undefined,
      });
      toast.success('Task assigned.');
      onAssigned();
    } catch (e) {
      setErr(errorMessage(e, 'Could not assign the task.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={!!volunteer}
      onClose={busy ? () => undefined : onClose}
      title={volunteer ? `Assign task · ${volunteer.userName}` : 'Assign task'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} loading={busy}>
            Assign task
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Title" htmlFor="vtask-title" required>
          <TextInput
            id="vtask-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Manage the registration desk"
            autoFocus
          />
        </Field>
        <Field label="Description" htmlFor="vtask-desc">
          <TextArea
            id="vtask-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <Field label="Due" htmlFor="vtask-due">
          <TextInput
            id="vtask-due"
            type="datetime-local"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
          />
        </Field>
        {err && <p className="field-error">{err}</p>}
      </div>
    </Modal>
  );
}

/* ------------------------------- gallery ------------------------------- */

/**
 * Coordinator/admin view of an event's photo & video gallery. Contribution and
 * full delete rights are enabled here (the backend still enforces club membership).
 */
export function GalleryTab({ eventId }: { eventId: number }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Event gallery
        </h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Share photo highlights and video recaps. Attendees see these on the event page.
        </p>
      </div>
      <MediaGallery eventId={eventId} canContribute canManageAll />
    </div>
  );
}

/* ------------------------------ discussion ----------------------------- */

/**
 * Coordinator/admin view of an event's discussion & Q&A. Moderation is enabled
 * here (pin, resolve, delete-any) — the backend still enforces club coordination.
 */
export function DiscussionTab({ eventId }: { eventId: number }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Discussion &amp; Q&amp;A
        </h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Answer attendee questions, pin important notes and mark questions resolved.
          Your replies appear with an “Organizer” badge.
        </p>
      </div>
      <EventComments eventId={eventId} canModerate />
    </div>
  );
}
