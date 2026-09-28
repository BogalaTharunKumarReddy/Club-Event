<<<<<<< HEAD
import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  Bell,
  CalendarClock,
  CalendarX,
  CheckCheck,
  CreditCard,
  Dot,
  Mail,
  MailOpen,
  Megaphone,
  Ticket,
  Trash2,
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { cn, fromNow } from '@/lib/utils';
import { PageContainer } from '@/components/layout/RootLayout';
import { Button, ConfirmDialog, EmptyState, PageHeader, Skeleton } from '@/components/ui';
import type { NotificationType } from '@/types';

/** Per-type icon so the inbox reads at a glance. */
function typeIcon(type: NotificationType): ReactNode {
  const cls = 'h-4 w-4';
  switch (type) {
    case 'REGISTRATION_CONFIRMATION':
      return <Ticket className={cls} />;
    case 'EVENT_REMINDER':
    case 'SCHEDULE_UPDATE':
      return <CalendarClock className={cls} />;
    case 'EVENT_CANCELLED':
      return <CalendarX className={cls} />;
    case 'ANNOUNCEMENT':
      return <Megaphone className={cls} />;
    case 'CERTIFICATE_ISSUED':
      return <Award className={cls} />;
    case 'PAYMENT_UPDATE':
      return <CreditCard className={cls} />;
    default:
      return <Bell className={cls} />;
  }
}

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
    markUnread,
    remove,
    clearAll,
  } = useNotifications();
  const navigate = useNavigate();
  const [confirmClear, setConfirmClear] = useState(false);
=======
import { Link } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { cn, fromNow } from '@/lib/utils';
import { PageContainer } from '@/components/layout/RootLayout';
import { Button, EmptyState, PageHeader, Skeleton } from '@/components/ui';

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6

  return (
    <PageContainer>
      <div className="mx-auto max-w-2xl">
        <PageHeader
          title="Notifications"
          description={unreadCount > 0 ? `${unreadCount} unread` : 'You’re all caught up.'}
          actions={
<<<<<<< HEAD
            notifications.length > 0 ? (
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button variant="secondary" size="sm" onClick={() => void markAllRead()}>
                    <CheckCheck className="h-4 w-4" /> Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setConfirmClear(true)}>
                  <Trash2 className="h-4 w-4" /> Clear all
                </Button>
              </div>
=======
            unreadCount > 0 ? (
              <Button variant="secondary" size="sm" onClick={() => void markAllRead()}>
                <CheckCheck className="h-4 w-4" /> Mark all read
              </Button>
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
            ) : undefined
          }
        />

        <div className="mt-6">
          {loading && notifications.length === 0 ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState
              icon={<Bell className="h-6 w-6" />}
              title="No notifications"
              description="Updates about your events and clubs will show up here."
            />
          ) : (
            <ul className="space-y-2">
              {notifications.map((n) => {
<<<<<<< HEAD
                const open = () => {
                  if (!n.read) void markRead(n.id);
                  if (n.link) navigate(n.link);
                };

                return (
                  <li
                    key={n.id}
                    className={cn(
                      'card group flex gap-3 p-4 transition',
                      !n.read &&
                        'border-brand-200 bg-brand-50/40 dark:border-brand-900/50 dark:bg-brand-900/10',
                    )}
                  >
                    {/* Type icon + unread dot */}
                    <div className="relative mt-0.5 shrink-0">
                      <span
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full',
                          n.read
                            ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                            : 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
                        )}
                      >
                        {typeIcon(n.type)}
                      </span>
                      {!n.read && (
                        <Dot
                          className="absolute -right-1 -top-1 h-5 w-5 text-brand-500"
                          strokeWidth={6}
                        />
                      )}
                    </div>

                    {/* Body — clicking opens the link (and marks read) */}
                    <button
                      type="button"
                      onClick={open}
                      className={cn(
                        'min-w-0 flex-1 text-left',
                        n.link && 'cursor-pointer',
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-medium text-slate-900 dark:text-slate-100">{n.title}</p>
=======
                const body = (
                  <div
                    className={cn(
                      'card flex gap-3 p-4 transition',
                      !n.read && 'border-brand-200 bg-brand-50/40 dark:border-brand-900/50 dark:bg-brand-900/10',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                        n.read ? 'bg-transparent' : 'bg-brand-500',
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {n.title}
                        </p>
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
                        <span className="shrink-0 text-xs text-slate-400">
                          {fromNow(n.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
                        {n.message}
                      </p>
<<<<<<< HEAD
                    </button>

                    {/* Row actions: read/unread toggle + delete. Always visible on
                        touch; revealed on hover on pointer devices to reduce clutter. */}
                    <div className="flex shrink-0 items-start gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
                      {n.read ? (
                        <button
                          type="button"
                          onClick={() => void markUnread(n.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                          aria-label="Mark as unread"
                          title="Mark as unread"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void markRead(n.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                          aria-label="Mark as read"
                          title="Mark as read"
                        >
                          <MailOpen className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => void remove(n.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                        aria-label="Delete notification"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
=======
                    </div>
                  </div>
                );

                return (
                  <li key={n.id}>
                    {n.link ? (
                      <Link to={n.link} onClick={() => !n.read && void markRead(n.id)}>
                        {body}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="block w-full text-left"
                        onClick={() => !n.read && void markRead(n.id)}
                      >
                        {body}
                      </button>
                    )}
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
<<<<<<< HEAD

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={clearAll}
        title="Clear all notifications?"
        message="This permanently removes every notification from your inbox. This can't be undone."
        confirmLabel="Clear all"
        danger
      />
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
    </PageContainer>
  );
}
