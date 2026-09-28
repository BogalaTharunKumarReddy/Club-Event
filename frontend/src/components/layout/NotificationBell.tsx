import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { useClickOutside } from '@/hooks/useClickOutside';
import { cn, fromNow } from '@/lib/utils';

export function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, remove } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 origin-top-right animate-fade-in overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={() => void markAllRead()}
                className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-400">
                You're all caught up.
              </p>
            ) : (
              notifications.map((n) => {
                const body = (
                  <div className="flex items-start gap-2">
                    <span
                      className={cn(
                        'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                        n.read ? 'bg-transparent' : 'bg-brand-500',
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                        {n.title}
                      </p>
                      <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                        {n.message}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {fromNow(n.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-center gap-1">
                      {!n.read && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            void markRead(n.id);
                          }}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800"
                          aria-label="Mark as read"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          void remove(n.id);
                        }}
                        className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                        aria-label="Delete notification"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );

                const rowClass = cn(
                  'block border-b border-slate-100 px-4 py-3 last:border-0 dark:border-slate-800/70',
                  !n.read && 'bg-brand-50/50 dark:bg-brand-950/20',
                );

                return n.link ? (
                  <Link
                    key={n.id}
                    to={n.link}
                    className={rowClass}
                    onClick={() => {
                      if (!n.read) void markRead(n.id);
                      setOpen(false);
                    }}
                  >
                    {body}
                  </Link>
                ) : (
                  <div key={n.id} className={rowClass}>
                    {body}
                  </div>
                );
              })
            )}
          </div>

          <Link
            to="/app/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-slate-200 px-4 py-2.5 text-center text-xs font-medium text-brand-600 hover:bg-slate-50 dark:border-slate-800 dark:text-brand-400 dark:hover:bg-slate-800/50"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
