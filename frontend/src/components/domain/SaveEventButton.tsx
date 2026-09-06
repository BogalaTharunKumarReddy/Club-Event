import { useState, type MouseEvent } from 'react';
import { Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';
import { eventService } from '@/lib/services';
import { useAuth } from '@/context/AuthContext';
import { cn, errorMessage } from '@/lib/utils';
import { Button } from '@/components/ui';

interface SaveEventButtonProps {
  eventId: number;
  /** Whether the viewer has already saved this event (seeds the toggle). */
  initialSaved: boolean;
  /**
   * 'icon'  — a compact circular button for overlaying on a card banner.
   * 'button' — a labelled, full-width button for detail pages.
   */
  variant?: 'icon' | 'button';
  /** Fired after a successful toggle with the new saved state (e.g. to refresh a list). */
  onChange?: (saved: boolean) => void;
  className?: string;
}

/**
 * Bookmark toggle for an event. Renders nothing for signed-out visitors, so it is
 * safe to drop into public card grids. When used inside a card (which is itself a
 * {@code <Link>}) the click is prevented from bubbling up into navigation.
 */
export function SaveEventButton({
  eventId,
  initialSaved,
  variant = 'icon',
  onChange,
  className,
}: SaveEventButtonProps) {
  const { isAuthenticated } = useAuth();
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);

  if (!isAuthenticated) return null;

  async function toggle(e: MouseEvent) {
    // Cards wrap everything in a <Link>; keep the click from navigating away.
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;

    const next = !saved;
    setSaved(next); // optimistic
    setBusy(true);
    try {
      if (next) await eventService.save(eventId);
      else await eventService.unsave(eventId);
      onChange?.(next);
      if (variant === 'button') {
        toast.success(next ? 'Saved to your list.' : 'Removed from your saved list.');
      }
    } catch (err) {
      setSaved(!next); // revert on failure
      toast.error(errorMessage(err, 'Could not update your saved list.'));
    } finally {
      setBusy(false);
    }
  }

  if (variant === 'button') {
    return (
      <Button
        variant="secondary"
        fullWidth
        loading={busy}
        onClick={toggle}
        aria-pressed={saved}
        className={className}
      >
        <Bookmark className={cn('h-4 w-4', saved && 'fill-current text-brand-600')} />
        {saved ? 'Saved' : 'Save event'}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved events' : 'Save event'}
      title={saved ? 'Remove from saved events' : 'Save event'}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm ring-1 ring-black/5 backdrop-blur transition hover:bg-white disabled:opacity-60 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-900',
        saved && 'text-brand-600 dark:text-brand-400',
        className,
      )}
    >
      <Bookmark className={cn('h-4 w-4', saved && 'fill-current')} />
    </button>
  );
}
