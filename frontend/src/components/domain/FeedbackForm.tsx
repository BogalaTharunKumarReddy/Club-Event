import { useState } from 'react';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { feedbackService } from '@/lib/services';
import { cn, errorMessage } from '@/lib/utils';
import { Button, Field, TextArea } from '@/components/ui';
import type { FeedbackResponse } from '@/types';

/**
 * The single source of truth for the post-event feedback UX: star rating,
 * optional comment and suggestion, submission, and the read-only "already
 * rated" view with an Edit toggle.
 *
 * It owns no data fetching — callers pass whatever feedback the user already
 * left (or null) and get a callback on submit. This lets it be embedded both
 * inline (event detail page) and inside a dialog (the "My events" list) without
 * the rating logic being written twice.
 */
export function FeedbackForm({
  eventId,
  existing,
  onSubmitted,
  starSize = 'lg',
}: {
  eventId: number;
  existing: FeedbackResponse | null;
  /** Fired after a successful submit with the saved entry (upsert result). */
  onSubmitted?: (feedback: FeedbackResponse) => void;
  starSize?: 'md' | 'lg';
}) {
  const [saved, setSaved] = useState<FeedbackResponse | null>(existing);
  const [editing, setEditing] = useState(!existing);

  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(existing?.comment ?? '');
  const [suggestion, setSuggestion] = useState(existing?.suggestion ?? '');
  const [busy, setBusy] = useState(false);

  const inputStar = starSize === 'lg' ? 'h-8 w-8' : 'h-7 w-7';

  async function submit() {
    if (rating < 1) {
      toast.error('Please pick a rating.');
      return;
    }
    setBusy(true);
    try {
      const result = await feedbackService.submit({
        eventId,
        rating,
        comment: comment.trim() || undefined,
        suggestion: suggestion.trim() || undefined,
      });
      toast.success('Thanks for your feedback!');
      setSaved(result);
      setEditing(false);
      onSubmitted?.(result);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not submit feedback.'));
    } finally {
      setBusy(false);
    }
  }

  // Read-only summary once feedback exists and we're not editing it.
  if (saved && !editing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-6 w-6',
                i < saved.rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-300 dark:text-slate-600',
              )}
            />
          ))}
        </div>
        {saved.comment && (
          <p className="text-sm text-slate-600 dark:text-slate-300">{saved.comment}</p>
        )}
        {saved.suggestion && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <span className="font-medium">Suggestion:</span> {saved.suggestion}
          </p>
        )}
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-slate-400">Thanks for sharing your thoughts!</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setRating(saved.rating);
              setComment(saved.comment ?? '');
              setSuggestion(saved.suggestion ?? '');
              setEditing(true);
            }}
          >
            Edit
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          How would you rate this event?
        </p>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const value = i + 1;
            return (
              <button
                key={i}
                type="button"
                onMouseEnter={() => setHover(value)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(value)}
                aria-label={`${value} star${value > 1 ? 's' : ''}`}
              >
                <Star
                  className={cn(
                    inputStar,
                    'transition',
                    value <= (hover || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300 dark:text-slate-600',
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      <Field label="Comment">
        <TextArea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you think?"
          rows={3}
        />
      </Field>
      <Field label="Suggestion">
        <TextArea
          value={suggestion}
          onChange={(e) => setSuggestion(e.target.value)}
          placeholder="Anything we could improve?"
          rows={2}
        />
      </Field>

      <div className="flex justify-end gap-2">
        {saved && (
          <Button variant="secondary" onClick={() => setEditing(false)} disabled={busy}>
            Cancel
          </Button>
        )}
        <Button onClick={submit} loading={busy}>
          {saved ? 'Update feedback' : 'Submit feedback'}
        </Button>
      </div>
    </div>
  );
}
