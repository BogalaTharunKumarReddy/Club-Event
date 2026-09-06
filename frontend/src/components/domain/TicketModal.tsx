import { useEffect, useState } from 'react';
import { QrCode } from 'lucide-react';
import { registrationService } from '@/lib/services';
import { errorMessage } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import type { RegistrationResponse } from '@/types';

/**
 * Shows the QR ticket for a registration.
 *
 * The QR image is generated server-side and fetched as a PNG blob; the payload
 * encodes only the opaque ticket code (never personal data), so the image is
 * safe to display and screenshot.
 */
export function TicketModal({
  open,
  onClose,
  registration,
}: {
  open: boolean;
  onClose: () => void;
  registration: RegistrationResponse;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let url: string | null = null;
    let active = true;
    setSrc(null);
    setError(null);
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
  }, [open, registration.id]);

  return (
    <Modal open={open} onClose={onClose} title="Your ticket" size="sm">
      <div className="flex flex-col items-center text-center">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
          {registration.eventTitle}
        </p>
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
      </div>
    </Modal>
  );
}
