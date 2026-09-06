import { Link } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { cn, fromNow } from '@/lib/utils';
import { PageContainer } from '@/components/layout/RootLayout';
import { Button, EmptyState, PageHeader, Skeleton } from '@/components/ui';

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();

  return (
    <PageContainer>
      <div className="mx-auto max-w-2xl">
        <PageHeader
          title="Notifications"
          description={unreadCount > 0 ? `${unreadCount} unread` : 'You’re all caught up.'}
          actions={
            unreadCount > 0 ? (
              <Button variant="secondary" size="sm" onClick={() => void markAllRead()}>
                <CheckCheck className="h-4 w-4" /> Mark all read
              </Button>
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
                        <span className="shrink-0 text-xs text-slate-400">
                          {fromNow(n.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
                        {n.message}
                      </p>
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
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
