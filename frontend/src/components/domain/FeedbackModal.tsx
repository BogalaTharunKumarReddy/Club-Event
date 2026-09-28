import { useEffect, useState } from 'react';
import { feedbackService } from '@/lib/services';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { FeedbackForm } from '@/components/domain/FeedbackForm';
import type { FeedbackResponse } from '@/types';

/**
 * Dialog wrapper around {@link FeedbackForm} used from the "My events" list,
 * where there's no room for an inline feedback card. It loads any existing
 * feedback for the event, then hands off to the shared form so the rating UX
 * lives in exactly one place.
 */
export function FeedbackModal({
  open,
  onClose,
  eventId,
  eventTitle,
  onSubmitted,
}: {
  open: boolean;
  onClose: () => void;
  eventId: number;
  eventTitle?: string;
  onSubmitted?: (feedback: FeedbackResponse) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [existing, setExisting] = useState<FeedbackResponse | null>(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    feedbackService
      .myForEvent(eventId)
      .then((fb) => active && setExisting(fb))
      .catch(() => active && setExisting(null)) // 404 = not rated yet
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [open, eventId]);

  return (
    <Modal open={open} onClose={onClose} title="Event feedback" size="md">
      {eventTitle && (
        <p className="mb-4 text-sm font-medium text-slate-900 dark:text-slate-100">{eventTitle}</p>
      )}
      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner className="h-6 w-6 text-brand-600" />
        </div>
      ) : (
        // Remount when the loaded feedback changes so the form re-seeds its state.
        <FeedbackForm
          key={existing?.id ?? 'new'}
          eventId={eventId}
          existing={existing}
          onSubmitted={onSubmitted}
        />
      )}
    </Modal>
  );
}
