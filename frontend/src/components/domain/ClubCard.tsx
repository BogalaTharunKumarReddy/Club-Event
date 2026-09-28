import { Link } from 'react-router-dom';
import { CalendarDays, Heart, Users2 } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { FollowClubButton } from '@/components/domain/FollowClubButton';
import type { ClubResponse } from '@/types';

interface ClubCardProps {
  club: ClubResponse;
  /** Fired when the viewer follows/unfollows this club via the overlay button. */
  onFollowChange?: (following: boolean) => void;
}

/** Club summary card for the clubs catalog and dashboards. */
export function ClubCard({ club, onFollowChange }: ClubCardProps) {
  return (
    <Link
      to={`/clubs/${club.id}`}
      className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-md"
    >
      <div className="relative h-24 bg-gradient-to-r from-brand-500 to-indigo-600">
        {club.coverImageUrl && (
          <img
            src={club.coverImageUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        )}
        <FollowClubButton
          clubId={club.id}
          initialFollowing={club.following}
          onChange={onFollowChange}
          className="absolute right-3 top-3"
        />
        <div className="absolute -bottom-6 left-4">
          <Avatar
            name={club.name}
            src={club.logoUrl}
            size="lg"
            className="ring-4 ring-white dark:ring-slate-900"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 pt-8">
        <div className="flex items-center gap-2">
          <h3 className="min-w-0 truncate font-semibold text-slate-900 group-hover:text-brand-700 dark:text-slate-100 dark:group-hover:text-brand-400">
            {club.name}
          </h3>
          {!club.active && (
            <span className="badge shrink-0 bg-slate-100 text-slate-500 dark:bg-slate-800">Inactive</span>
          )}
        </div>
        {club.category && (
          <p className="text-xs font-medium text-brand-600 dark:text-brand-400">{club.category}</p>
        )}
        {club.description && (
          <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
            {club.description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-400 dark:border-slate-800">
          <span className="flex items-center gap-1">
            <Users2 className="h-3.5 w-3.5" />
            {club.memberCount} members
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {club.eventCount} events
          </span>
          {club.followerCount > 0 && (
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              {club.followerCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
