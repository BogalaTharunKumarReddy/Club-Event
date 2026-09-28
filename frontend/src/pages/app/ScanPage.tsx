import { useCallback, useRef, useState } from 'react';
import { CheckCircle2, KeyRound, QrCode, ScanLine, XCircle } from 'lucide-react';
import { attendanceService } from '@/lib/services';
import { cn, errorMessage, formatTime } from '@/lib/utils';
import { PageContainer } from '@/components/layout/RootLayout';
import { Button, Field, PageHeader, TextInput } from '@/components/ui';
import { QrScanner } from '@/components/scan/QrScanner';

interface ScanEntry {
  key: number;
  code: string;
  ok: boolean;
  name?: string;
  eventTitle?: string;
  checkInAt?: string;
  message: string;
}

/**
 * Attendee check-in scanner for club members and coordinators. Point the camera
 * at a participant's ticket QR (or type the code) and the backend resolves the
 * event from the ticket, verifies the registration, checks that the scanner is
 * an active member of the owning club, and records attendance — rejecting
 * cancelled, waitlisted, unknown or already-checked-in tickets with a clear
 * message. Only the opaque ticket code is transmitted; never participant PII.
 */
export default function ScanPage() {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<ScanEntry[]>([]);
  const keyRef = useRef(0);
  // Per-code debounce so a QR lingering in front of the camera isn't submitted
  // repeatedly (which would otherwise log a stream of "already checked in").
  const seenRef = useRef<Map<string, number>>(new Map());

  const checkIn = useCallback(async (raw: string) => {
    const ticket = raw.trim();
    if (!ticket) return;
    const now = Date.now();
    const last = seenRef.current.get(ticket);
    if (last && now - last < 4000) return;
    seenRef.current.set(ticket, now);

    setBusy(true);
    try {
      const res = await attendanceService.checkIn({ ticketCode: ticket });
      setLog((prev) => [
        {
          key: keyRef.current++,
          code: ticket,
          ok: true,
          name: res.userName,
          eventTitle: res.eventTitle,
          checkInAt: res.checkInAt,
          message: 'Checked in',
        },
        ...prev,
      ]);
      setCode('');
    } catch (err) {
      setLog((prev) => [
        {
          key: keyRef.current++,
          code: ticket,
          ok: false,
          message: errorMessage(err, 'Could not check in this ticket.'),
        },
        ...prev,
      ]);
    } finally {
      setBusy(false);
    }
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim()) void checkIn(code);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Check-in scanner"
        description="Scan a participant's ticket QR with your camera, or type the code, to record their attendance."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* ---------------------------- scanner ---------------------------- */}
        <div className="lg:col-span-2">
          <div className="card space-y-4 p-5">
            <QrScanner onDetected={checkIn} paused={busy} />

            <form onSubmit={submit} className="space-y-3">
              <Field
                label="Ticket code"
                htmlFor="scan-code"
                hint="Or enter the attendee's ticket code manually, then press Enter."
              >
                <TextInput
                  id="scan-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. TCK-3F9A2B"
                  autoComplete="off"
                  spellCheck={false}
                  className="font-mono"
                />
              </Field>
              <Button type="submit" fullWidth loading={busy} disabled={!code.trim()}>
                <ScanLine className="h-4 w-4" /> Check in attendee
              </Button>
            </form>
          </div>
        </div>

        {/* --------------------------- scan log ---------------------------- */}
        <div className="lg:col-span-3">
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
            This session
          </h2>
          {log.length === 0 ? (
            <div className="flex h-full min-h-[12rem] items-center justify-center rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400 dark:border-slate-700">
              <span className="inline-flex items-center gap-2">
                <QrCode className="h-4 w-4" /> Scanned tickets will appear here.
              </span>
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
    </PageContainer>
  );
}

function ScanResultRow({ entry }: { entry: ScanEntry }) {
  const ok = entry.ok;
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
        {ok ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
      </span>
      <div className="min-w-0">
        <p
          className={cn(
            'text-sm font-semibold',
            ok ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300',
          )}
        >
          {ok ? entry.name ?? 'Checked in' : 'Not checked in'}
        </p>
        <p
          className={cn(
            'text-xs',
            ok
              ? 'text-emerald-700/90 dark:text-emerald-200/80'
              : 'text-rose-700/90 dark:text-rose-200/80',
          )}
        >
          {ok
            ? `${entry.eventTitle ?? 'Event'}${
                entry.checkInAt ? ` · ${formatTime(entry.checkInAt)}` : ''
              }`
            : entry.message}
        </p>
        <p className="mt-1 inline-flex items-center gap-1 font-mono text-[11px] text-slate-400">
          <KeyRound className="h-3 w-3" />
          {entry.code}
        </p>
      </div>
    </li>
  );
}
