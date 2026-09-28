import { useEffect, useState } from 'react';
import { BadgeCheck, QrCode, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { registrationService } from '@/lib/services';
import { errorMessage } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Button, Field, TextInput } from '@/components/ui';
import type { RegistrationResponse } from '@/types';

/**
 * Shows the QR ticket for a registration, plus an optional one-time-code
 * verification step so an attendee can prove the ticket is genuinely theirs.
 *
 * The QR image is generated server-side and fetched as a PNG blob; the payload
 * encodes only the opaque ticket code (never personal data), so the image is
 * safe to display and screenshot. Verification sends a 6-digit code to the
 * owner's email + WhatsApp and confirms it against the backend.
 */
export function TicketModal({
  open,
  onClose,
  registration,
  onVerified,
}: {
  open: boolean;
  onClose: () => void;
  registration: RegistrationResponse;
  /** Called with the updated registration once a ticket is successfully verified. */
  onVerified?: (updated: RegistrationResponse) => void;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Ticket-verification sub-flow.
  const [verified, setVerified] = useState(registration.ticketVerified);
  const [codeSent, setCodeSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [code, setCode] = useState('');
  const [verifyError, setVerifyError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let url: string | null = null;
    let active = true;
    setSrc(null);
    setError(null);
    // Reset the verify sub-flow each time the modal opens for a registration.
    setVerified(registration.ticketVerified);
    setCodeSent(false);
    setCode('');
    setVerifyError(null);
    registrationService
      .ticketQr(registration.id)
      .then((blob) => {
        if (!active) return;
        url = URL.createObjectURL(blob);
        setSrc(url);
      })
      .catch((err) => active && setError(errorMessage(err, 'Could not load ticket.')));
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [open, registration.id, registration.ticketVerified]);

  const sendCode = async () => {
    setSending(true);
    setVerifyError(null);
    try {
      await registrationService.requestTicketVerify(registration.id);
      setCodeSent(true);
      toast.success('Verification code sent to your email and WhatsApp.');
    } catch (err) {
      setVerifyError(errorMessage(err, 'Could not send a code. Please try again.'));
    } finally {
      setSending(false);
    }
  };

  const confirmCode = async () => {
    if (!/^\d{6}$/.test(code.trim())) {
      setVerifyError('Enter the 6-digit code.');
      return;
    }
    setConfirming(true);
    setVerifyError(null);
    try {
      const updated = await registrationService.confirmTicketVerify(registration.id, {
        code: code.trim(),
      });
      setVerified(true);
      setCodeSent(false);
      setCode('');
      toast.success('Ticket verified.');
      onVerified?.(updated);
    } catch (err) {
      setVerifyError(errorMessage(err, 'That code is incorrect or has expired.'));
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Your ticket" size="sm">
      <div className="flex flex-col items-center text-center">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
          {registration.eventTitle}
        </p>

        {verified && (
          <span className="badge-success mt-2 inline-flex items-center gap-1">
            <BadgeCheck className="h-3.5 w-3.5" />
            Verified
          </span>
        )}

        <div className="my-4 flex h-56 w-56 items-center justify-center rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700">
          {error ? (
            <span className="text-sm text-red-600">{error}</span>
          ) : src ? (
            <img src={src} alt="Registration QR code" className="h-full w-full object-contain" />
          ) : (
            <Spinner className="h-6 w-6 text-brand-600" />
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <QrCode className="h-3.5 w-3.5" />
          <span className="font-mono tracking-wider">{registration.ticketCode}</span>
        </div>
        <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
          Present this at the venue to check in.
        </p>

        {/* ---- one-time-code verification ---- */}
        {!verified && (
          <div className="mt-5 w-full border-t border-slate-200 pt-4 dark:border-slate-700">
            {verifyError && (
              <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-left text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                {verifyError}
              </div>
            )}

            {!codeSent ? (
              <>
                <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
                  Verify this ticket is yours — we'll send a 6-digit code to your email and WhatsApp.
                </p>
                <Button variant="secondary" fullWidth loading={sending} onClick={sendCode}>
                  <ShieldCheck className="h-4 w-4" />
                  Verify ticket
                </Button>
              </>
            ) : (
              <div className="space-y-3 text-left">
                <Field label="Enter the 6-digit code" htmlFor="ticket-code">
                  <TextInput
                    id="ticket-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="••••••"
                    className="text-center text-xl font-semibold tracking-[0.4em]"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    autoFocus
                  />
                </Field>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    loading={sending}
                    onClick={sendCode}
                  >
                    Resend
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    loading={confirming}
                    onClick={confirmCode}
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
