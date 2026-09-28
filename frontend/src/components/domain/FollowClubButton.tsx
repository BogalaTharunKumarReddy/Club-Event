import { useState, type MouseEvent } from 'react';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { clubService } from '@/lib/services';
import { useAuth } from '@/context/AuthContext';
import { cn, errorMessage } from '@/lib/utils';
import { Button } from '@/components/ui';

interface FollowClubButtonProps {
  clubId: number;
  /** Whether the viewer already follows this club (seeds the toggle). */
  initialFollowing: boolean;
  /**
   * 'icon'  — a compact circular button for overlaying on a card banner.
   * 'button' — a labelled button for detail pages.
   */
  variant?: 'icon' | 'button';
  /** Fired after a successful toggle with the new following state (e.g. to refresh a list). */
  onChange?: (following: boolean) => void;
  className?: string;
}

/**
 * Follow / unfollow toggle for a club. Renders nothing for signed-out visitors,
 * so it is safe to drop into public card grids. Inside a card (itself a
 * {@code <Link>}) the click is prevented from bubbling into navigation.
 */
export function FollowClubButton({
  clubId,
  initialFollowing,
  variant = 'icon',
  onChange,
  className,
}: FollowClubButtonProps) {
  const { isAuthenticated } = useAuth();
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);

  if (!isAuthenticated) return null;

  async function toggle(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;

    const next = !following;
    setFollowing(next); // optimistic
    setBusy(true);
    try {
      if (next) await clubService.follow(clubId);
      else await clubService.unfollow(clubId);
      onChange?.(next);
      if (variant === 'button') {
        toast.success(next ? "You're following this club." : 'You unfollowed this club.');
      }
    } catch (err) {
      setFollowing(!next); // revert on failure
      toast.error(errorMessage(err, 'Could not update your follow.'));
    } finally {
      setBusy(false);
    }
  }

  if (variant === 'button') {
    return (
      <Button
        variant="secondary"
        loading={busy}
        onClick={toggle}
        aria-pressed={following}
        className={className}
      >
        <Heart className={cn('h-4 w-4', following && 'fill-rose-500 text-rose-500')} />
        {following ? 'Following' : 'Follow'}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={following}
      aria-label={following ? 'Unfollow club' : 'Follow club'}
      title={following ? 'Unfollow club' : 'Follow club'}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm ring-1 ring-black/5 backdrop-blur transition hover:bg-white disabled:opacity-60 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-900',
        following && 'text-rose-500',
        className,
      )}
    >
      <Heart className={cn('h-4 w-4', following && 'fill-rose-500')} />
    </button>
  );
}
