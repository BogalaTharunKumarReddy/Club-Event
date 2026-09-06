import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Users, Wifi } from 'lucide-react';
import { EVENT_MODE_LABELS } from '@/lib/constants';
import { formatDateTime, formatCurrency, cn } from '@/lib/utils';
import { EventStatusBadge } from '@/components/ui/StatusBadge';
import { SaveEventButton } from '@/components/domain/SaveEventButton';
import type { EventSummaryResponse } from '@/types';

interface EventCardProps {
  event: EventSummaryResponse;
  /** Fired when the viewer saves/unsaves this event via the bookmark overlay. */
  onSavedChange?: (saved: boolean) => void;
}

/** Compact event card used in catalogs, dashboards and club pages. */
export function EventCard({ event, onSavedChange }: EventCardProps) {
  return (
    <Link
      to={`/events/${event.id}`}
      className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-md"
    >
      <div className="relative h-36 overflow-hidden bg-gradient-to-br from-brand-500 to-brand-700">
        {event.bannerUrl ? (
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <CalendarDays className="h-10 w-10 text-white/70" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          <EventStatusBadge status={event.status} />
          {event.featured && (
            <span className="badge bg-amber-400/90 text-amber-950">Featured</span>
          )}
        </div>
        <SaveEventButton
          eventId={event.id}
          initialSaved={event.saved}
          onChange={onSavedChange}
          className="absolute right-3 top-3"
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-center gap-2 text-xs text-slate-400">
          {event.category && <span className="font-medium">{event.category}</span>}
          {event.teamEvent && (
            <span className="badge bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
              Team
            </span>
          )}
        </div>

        <h3 className="line-clamp-2 font-semibold text-slate-900 group-hover:text-brand-700 dark:text-slate-100 dark:group-hover:text-brand-400">
          {event.title}
        </h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{event.clubName}</p>

        <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDateTime(event.startDateTime)}
          </div>
          <div className="flex items-center gap-1.5">
            {event.mode === 'ONLINE' ? (
              <Wifi className="h-3.5 w-3.5" />
            ) : (
              <MapPin className="h-3.5 w-3.5" />
            )}
            {event.mode === 'ONLINE'
              ? EVENT_MODE_LABELS[event.mode]
              : event.venue || EVENT_MODE_LABELS[event.mode]}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
          <span
            className={cn(
              'text-sm font-semibold',
              event.paidEvent ? 'text-slate-900 dark:text-slate-100' : 'text-green-600',
            )}
          >
            {event.paidEvent ? formatCurrency(event.fee) : 'Free'}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Users className="h-3.5 w-3.5" />
            {event.registeredCount}
            {event.capacity ? ` / ${event.capacity}` : ''}
          </span>
        </div>
      </div>
    </Link>
  );
}
