import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Check, Clock, MapPin } from 'lucide-react';
import { volunteerService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { cn, errorMessage, formatDateTime } from '@/lib/utils';
import {
  VOLUNTEER_ASSIGNMENT_STATUS_LABELS,
  VOLUNTEER_ASSIGNMENT_STATUS_STYLES,
} from '@/lib/constants';
import { PageContainer } from '@/components/layout/RootLayout';
import {
  Button,
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
} from '@/components/ui';
import type { VolunteerAssignmentResponse } from '@/types';

/**
 * "My events" — every event a volunteer has been assigned to across their
 * clubs. Newly-assigned shifts need an explicit accept; everything else is
 * shown for reference with its current status.
 */
export default function VolunteerEventsPage() {
  const { data, loading, error, reload, setData } = useQuery(
    () => volunteerService.myEvents(),
    [],
  );
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function accept(assignmentId: number) {
    setAcceptingId(assignmentId);
    setActionError(null);
    try {
      const updated = await volunteerService.acceptAssignment(assignmentId);
      // Patch the accepted assignment in place so the UI reflects it instantly.
      setData((prev) =>
        (prev ?? []).map((a) => (a.id === updated.id ? updated : a)),
      );
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setAcceptingId(null);
    }
  }

  const pending = data?.filter((a) => a.status === 'ASSIGNED') ?? [];
  const confirmed = data?.filter((a) => a.status !== 'ASSIGNED') ?? [];

  return (
    <PageContainer>
      <PageHeader
        title="My events"
        description="Events you're supporting as a volunteer, with your role and shift."
      />

      <div className="mt-6 space-y-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-36 w-full" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : !data || data.length === 0 ? (
          <EmptyState
            icon={<CalendarCheck className="h-6 w-6" />}
            title="No event assignments yet"
            description="When a coordinator assigns you to an event, it'll show up here with your role and shift details."
          />
        ) : (
          <>
            {actionError && <ErrorState message={actionError} onRetry={reload} />}

            {pending.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Needs your response
                </h2>
                <div className="space-y-3">
                  {pending.map((a) => (
                    <AssignmentCard
                      key={a.id}
                      assignment={a}
                      onAccept={() => accept(a.id)}
                      accepting={acceptingId === a.id}
                    />
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {pending.length > 0 ? 'Confirmed & past' : 'All assignments'}
              </h2>
              {confirmed.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400 dark:border-slate-700">
                  Nothing confirmed yet — accept a shift above to get started.
                </p>
              ) : (
                <div className="space-y-3">
                  {confirmed.map((a) => (
                    <AssignmentCard key={a.id} assignment={a} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </PageContainer>
  );
}

function AssignmentCard({
  assignment: a,
  onAccept,
  accepting = false,
}: {
  assignment: VolunteerAssignmentResponse;
  onAccept?: () => void;
  accepting?: boolean;
}) {
  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to={`/events/${a.eventId}`}
            className="font-semibold text-slate-900 hover:text-brand-700 dark:text-slate-100 dark:hover:text-brand-300"
          >
            {a.eventTitle}
          </Link>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {a.role} · {a.clubName}
          </p>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full px-2.5 py-1 text-xs font-medium',
            VOLUNTEER_ASSIGNMENT_STATUS_STYLES[a.status],
          )}
        >
          {VOLUNTEER_ASSIGNMENT_STATUS_LABELS[a.status]}
        </span>
      </div>

      <div className="mt-3 grid gap-2 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
        <p className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-400" />
          {a.shiftStart ? formatDateTime(a.shiftStart) : 'Shift TBC'}
          {a.shiftEnd ? ` → ${formatDateTime(a.shiftEnd)}` : ''}
        </p>
        {a.location && (
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            {a.location}
          </p>
        )}
      </div>

      {(a.checkInDuty || onAccept) && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          {a.checkInDuty ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 dark:text-brand-400">
              <Check className="h-4 w-4" />
              Assigned to attendee check-in
            </span>
          ) : (
            <span />
          )}
          {onAccept && (
            <Button size="sm" onClick={onAccept} loading={accepting}>
              Accept shift
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
