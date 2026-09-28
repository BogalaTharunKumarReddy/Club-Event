import { useState } from 'react';
import {
  CalendarClock,
  Clock,
  LogIn,
  LogOut,
  MapPin,
} from 'lucide-react';
import { volunteerService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { cn, errorMessage, formatDateTime, formatTime } from '@/lib/utils';
import {
  VOLUNTEER_ATTENDANCE_STATUS_LABELS,
  VOLUNTEER_ATTENDANCE_STATUS_STYLES,
} from '@/lib/constants';
import { PageContainer } from '@/components/layout/RootLayout';
import {
  Button,
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
} from '@/components/ui';
import type {
  VolunteerAssignmentResponse,
  VolunteerAttendanceResponse,
} from '@/types';

/**
 * "My attendance" — self check-in / check-out for assigned events plus a log of
 * recorded hours. Attendance is matched to assignments by event so each active
 * shift shows the right next action.
 */
export default function VolunteerAttendancePage() {
  const { data, loading, error, reload } = useQuery(
    () =>
      Promise.all([
        volunteerService.myEvents(),
        volunteerService.myAttendance(),
      ]).then(([assignments, attendance]) => ({ assignments, attendance })),
    [],
  );

  const [busyEventId, setBusyEventId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function run(
    eventId: number,
    fn: (eventId: number) => Promise<VolunteerAttendanceResponse>,
  ) {
    setBusyEventId(eventId);
    setActionError(null);
    try {
      await fn(eventId);
      reload();
    } catch (err) {
      setActionError(errorMessage(err));
      setBusyEventId(null);
    }
  }

  const attendanceByEvent = new Map<number, VolunteerAttendanceResponse>();
  data?.attendance.forEach((a) => attendanceByEvent.set(a.eventId, a));

  // Only active shifts are checkable; cancelled assignments are excluded.
  const shifts =
    data?.assignments.filter((a) => a.status !== 'CANCELLED') ?? [];

  return (
    <PageContainer>
      <PageHeader
        title="My attendance"
        description="Check in when your shift starts, check out when you're done."
      />

      <div className="mt-6 space-y-8">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : (
          <>
            {actionError && <ErrorState message={actionError} onRetry={reload} />}

            <section>
              <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                Your shifts
              </h2>
              {shifts.length === 0 ? (
                <EmptyState
                  icon={<CalendarClock className="h-6 w-6" />}
                  title="No shifts to check into"
                  description="Once you're assigned to an event, you'll be able to check in and out here."
                />
              ) : (
                <div className="space-y-3">
                  {shifts.map((a) => (
                    <ShiftRow
                      key={a.id}
                      assignment={a}
                      attendance={attendanceByEvent.get(a.eventId)}
                      busy={busyEventId === a.eventId}
                      onCheckIn={() =>
                        run(a.eventId, volunteerService.checkIn)
                      }
                      onCheckOut={() =>
                        run(a.eventId, volunteerService.checkOut)
                      }
                    />
                  ))}
                </div>
              )}
            </section>

            {data && data.attendance.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  History
                </h2>
                <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                  {data.attendance.map((r) => (
                    <li
                      key={r.id}
                      className="flex flex-wrap items-center justify-between gap-3 p-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                          {r.eventTitle}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {r.checkInTime ? formatTime(r.checkInTime) : '—'}
                          {' → '}
                          {r.checkOutTime ? formatTime(r.checkOutTime) : '—'}
                          {r.hoursWorked > 0 &&
                            ` · ${r.hoursWorked.toFixed(1)} hrs`}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-1 text-xs font-medium',
                          VOLUNTEER_ATTENDANCE_STATUS_STYLES[r.status],
                        )}
                      >
                        {VOLUNTEER_ATTENDANCE_STATUS_LABELS[r.status]}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
}

function ShiftRow({
  assignment: a,
  attendance,
  busy,
  onCheckIn,
  onCheckOut,
}: {
  assignment: VolunteerAssignmentResponse;
  attendance?: VolunteerAttendanceResponse;
  busy: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
}) {
  const checkedIn = Boolean(attendance?.checkInTime);
  const checkedOut = Boolean(attendance?.checkOutTime);

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 dark:text-slate-100">
            {a.eventTitle}
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {a.role} · {a.clubName}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            {a.shiftStart && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {formatDateTime(a.shiftStart)}
              </span>
            )}
            {a.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {a.location}
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          {!checkedIn ? (
            <Button size="sm" onClick={onCheckIn} loading={busy}>
              <LogIn className="h-4 w-4" />
              Check in
            </Button>
          ) : !checkedOut ? (
            <div className="space-y-2">
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Checked in {formatTime(attendance!.checkInTime)}
              </p>
              <Button
                size="sm"
                variant="secondary"
                onClick={onCheckOut}
                loading={busy}
              >
                <LogOut className="h-4 w-4" />
                Check out
              </Button>
            </div>
          ) : (
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {attendance!.hoursWorked.toFixed(1)} hrs
              </p>
              <p className="text-xs text-slate-400">Completed</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
