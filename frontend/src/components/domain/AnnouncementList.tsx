import { Megaphone, Pin } from 'lucide-react';
import { fromNow } from '@/lib/utils';
import { EmptyState } from '@/components/ui/EmptyState';
import type { AnnouncementResponse } from '@/types';

/** Read-only announcement feed shared by event and club pages. */
export function AnnouncementList({
  announcements,
  emptyText = 'No announcements yet.',
}: {
  announcements: AnnouncementResponse[];
  emptyText?: string;
}) {
  if (!announcements.length) {
    return (
      <EmptyState
        icon={<Megaphone className="h-6 w-6" />}
        title="Nothing announced"
        description={emptyText}
      />
    );
  }

  // Pinned first, then newest.
  const ordered = [...announcements].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <ul className="space-y-3">
      {ordered.map((a) => (
        <li key={a.id} className="card p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              {a.pinned && <Pin className="h-4 w-4 shrink-0 text-brand-500" />}
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">{a.title}</h4>
            </div>
            <span className="shrink-0 text-xs text-slate-400">{fromNow(a.createdAt)}</span>
          </div>
          <p className="mt-1.5 whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">
            {a.content}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            {a.authorName}
            {a.clubName ? ` · ${a.clubName}` : ''}
          </p>
        </li>
      ))}
    </ul>
  );
}
