import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  KeyRound,
  QrCode,
  ScanLine,
  XCircle,
} from 'lucide-react';
import { volunteerService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { cn, errorMessage, formatTime } from '@/lib/utils';
import { PageContainer } from '@/components/layout/RootLayout';
import {
  Button,
  EmptyState,
  ErrorState,
  Field,
  PageHeader,
  Select,
  Skeleton,
  TextInput,
} from '@/components/ui';
import { QrScanner } from '@/components/scan/QrScanner';
import type { VolunteerScanResponse } from '@/types';

interface ScanLogEntry {
  key: number;
  code: string;
  result: VolunteerScanResponse;
}

/**
 * Attendee check-in scanner. Volunteers on check-in duty enter (or scan, via a
 * keyboard-wedge QR reader) a participant's opaque ticket code and the backend
 * verifies it against the event's registrations. Only the ticket code leaves
 * the device — never any participant PII.
 */
export default function VolunteerScanPage() {
  const { data, loading, error, reload } = useQuery(
    () => volunteerService.myEvents(),
    [],
  );

  // Only events where this volunteer was given check-in duty can be scanned.
  const dutyEvents = useMemo(
    () =>
      (data ?? []).filter((a) => a.checkInDuty && a.status !== 'CANCELLED'),
    [data],
  );

  const [eventId, setEventId] = useState<number | null>(null);
  const [code, setCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [log, setLog] = useState<ScanLogEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const keyRef = useRef(0);
  // Per-code debounce so a QR held in front of the camera isn't scanned in a loop.
  const seenRef = useRef<Map<string, number>>(new Map());

  // Default the event selector to the first duty event once data arrives.
  useEffect(() => {
    if (eventId === null && dutyEvents.length > 0) {
      setEventId(dutyEvents[0].eventId);
    }
  }, [dutyEvents, eventId]);

  // Verify one ticket against the selected event. Shared by the camera scanner
  // and the manual entry form; guarded so the camera can't re-submit the same
  // code within a short window.
  const runScan = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim();
      if (!eventId || !trimmed) return;
      const now = Date.now();
      const last = seenRef.current.get(trimmed);
      if (last && now - last < 4000) return;
      seenRef.current.set(trimmed, now);

      setScanning(true);
      setScanError(null);
      try {
        const result = await volunteerService.scan({ eventId, ticketCode: trimmed });
        setLog((prev) => [{ key: keyRef.current++, code: trimmed, result }, ...prev]);
        setCode('');
        inputRef.current?.focus();
      } catch (err) {
        setScanError(errorMessage(err));
      } finally {
        setScanning(false);
      }
    },
    [eventId],
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    void runScan(code);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Check-in scanner"
        description="Verify attendee tickets for events where you're on check-in duty."
      />

      <div className="mt-6">
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : dutyEvents.length === 0 ? (
          <EmptyState
            icon={<QrCode className="h-6 w-6" />}
            title="No check-in duty"
            description="You'll be able to scan attendee tickets here once a coordinator assigns you to attendee check-in for an event."
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-5">
            {/* ---------------------------- scanner ---------------------------- */}
            <div className="lg:col-span-2">
              <form
                onSubmit={submit}
                className="card space-y-4 p-5"
                aria-label="Ticket check-in"
              >
                <Field label="Event" htmlFor="scan-event">
                  <Select
                    id="scan-event"
                    value={eventId ?? ''}
                    onChange={(e) => setEventId(Number(e.target.value))}
                  >
                    {dutyEvents.map((a) => (
                      <option key={a.id} value={a.eventId}>
                        {a.eventTitle}
                      </option>
                    ))}
                  </Select>
                </Field>

                <QrScanner onDetected={runScan} paused={scanning} />

                <Field
                  label="Ticket code"
                  htmlFor="scan-code"
                  hint="Scan the attendee's QR or type their ticket code, then press Enter."
                >
                  <TextInput
                    id="scan-code"
                    ref={inputRef}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. TKT-8F3A9C"
                    autoFocus
                    autoComplete="off"
                    spellCheck={false}
                  />
                </Field>

                {scanError && (
                  <p className="text-sm text-rose-600 dark:text-rose-400">
                    {scanError}
                  </p>
                )}

                <Button
                  type="submit"
                  fullWidth
                  loading={scanning}
                  disabled={!code.trim()}
                >
                  <ScanLine className="h-4 w-4" />
                  Check in attendee
                </Button>
              </form>
            </div>

            {/* --------------------------- scan log --------------------------- */}
            <div className="lg:col-span-3">
              <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                This session
              </h2>
              {log.length === 0 ? (
                <div className="flex h-full min-h-[12rem] items-center justify-center rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400 dark:border-slate-700">
                  Scanned tickets will appear here.
                </div>
              ) : (
                <ul className="space-y-2">
                  {log.map((entry) => (
                    <ScanResultRow key={entry.key} entry={entry} />
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

function ScanResultRow({ entry }: { entry: ScanLogEntry }) {
  const { result, code } = entry;
  const ok = result.verified;
  return (
    <li
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4',
        ok
          ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-900/15'
          : 'border-rose-200 bg-rose-50 dark:border-rose-900/40 dark:bg-rose-900/15',
      )}
    >
      <span className={cn('mt-0.5 shrink-0', ok ? 'text-emerald-600' : 'text-rose-600')}>
        {ok ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <XCircle className="h-5 w-5" />
        )}
      </span>
      <div className="min-w-0">
        <p
          className={cn(
            'text-sm font-semibold',
            ok
              ? 'text-emerald-800 dark:text-emerald-300'
              : 'text-rose-800 dark:text-rose-300',
          )}
        >
          {ok ? result.participantName ?? 'Checked in' : 'Not verified'}
        </p>
        <p
          className={cn(
            'text-xs',
            ok
              ? 'text-emerald-700/90 dark:text-emerald-200/80'
              : 'text-rose-700/90 dark:text-rose-200/80',
          )}
        >
          {result.message}
          {ok && result.checkInTime ? ` · ${formatTime(result.checkInTime)}` : ''}
        </p>
        <p className="mt-1 inline-flex items-center gap-1 font-mono text-[11px] text-slate-400">
          <KeyRound className="h-3 w-3" />
          {code}
        </p>
      </div>
    </li>
  );
}
