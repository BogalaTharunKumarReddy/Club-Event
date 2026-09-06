import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import toast from 'react-hot-toast';
import { notificationService } from '@/lib/services';
import { useAuth } from './AuthContext';
import { useStompTopic } from '@/hooks/useStompTopic';
import { wsTopics } from '@/lib/ws';
import type { NotificationResponse } from '@/types';

interface NotificationContextValue {
  notifications: NotificationResponse[];
  unreadCount: number;
  loading: boolean;
  reload: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [page, count] = await Promise.all([
        notificationService.mine(0, 20),
        notificationService.unreadCount(),
      ]);
      setNotifications(page.content);
      setUnreadCount(count.count ?? 0);
    } catch {
      /* non-critical — the bell simply stays empty */
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      void reload();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, reload]);

  // Live push: prepend the incoming notification and bump the counter.
  useStompTopic<NotificationResponse>(
    user ? wsTopics.notifications(user.id) : null,
    (incoming) => {
      setNotifications((prev) => {
        if (prev.some((n) => n.id === incoming.id)) return prev;
        return [incoming, ...prev].slice(0, 30);
      });
      setUnreadCount((c) => c + 1);
      toast(incoming.title, { icon: '🔔' });
    },
    isAuthenticated,
  );

  const markRead = useCallback(async (id: number) => {
    // Optimistic update, then persist.
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await notificationService.markRead(id);
    } catch {
      void reloadSilently();
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await notificationService.markAllRead();
    } catch {
      void reloadSilently();
    }
  }, []);

  // Reconcile with the server if an optimistic write failed.
  const reloadSilently = useCallback(async () => {
    try {
      const [page, count] = await Promise.all([
        notificationService.mine(0, 20),
        notificationService.unreadCount(),
      ]);
      setNotifications(page.content);
      setUnreadCount(count.count ?? 0);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<NotificationContextValue>(
    () => ({ notifications, unreadCount, loading, reload, markRead, markAllRead }),
    [notifications, unreadCount, loading, reload, markRead, markAllRead],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return ctx;
}
