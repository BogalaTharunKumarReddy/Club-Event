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
<<<<<<< HEAD
  markUnread: (id: number) => Promise<void>;
  remove: (id: number) => Promise<void>;
  clearAll: () => Promise<void>;
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
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

<<<<<<< HEAD
=======
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

>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
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

<<<<<<< HEAD
  const markRead = useCallback(
    async (id: number) => {
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
    },
    [reloadSilently],
  );

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await notificationService.markAllRead();
    } catch {
      void reloadSilently();
    }
  }, [reloadSilently]);

  const markUnread = useCallback(
    async (id: number) => {
      let wasRead = false;
      setNotifications((prev) =>
        prev.map((n) => {
          if (n.id === id) {
            wasRead = n.read;
            return { ...n, read: false };
          }
          return n;
        }),
      );
      // Only a previously-read item changes the unread tally.
      if (wasRead) setUnreadCount((c) => c + 1);
      try {
        await notificationService.markUnread(id);
      } catch {
        void reloadSilently();
      }
    },
    [reloadSilently],
  );

  const remove = useCallback(
    async (id: number) => {
      // Drop it locally and decrement the counter if it was unread.
      let wasUnread = false;
      setNotifications((prev) =>
        prev.filter((n) => {
          if (n.id === id) {
            wasUnread = !n.read;
            return false;
          }
          return true;
        }),
      );
      if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
      try {
        await notificationService.remove(id);
      } catch {
        void reloadSilently();
      }
    },
    [reloadSilently],
  );

  const clearAll = useCallback(async () => {
    setNotifications([]);
    setUnreadCount(0);
    try {
      await notificationService.clearAll();
    } catch {
      void reloadSilently();
    }
  }, [reloadSilently]);

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      unreadCount,
      loading,
      reload,
      markRead,
      markAllRead,
      markUnread,
      remove,
      clearAll,
    }),
    [
      notifications,
      unreadCount,
      loading,
      reload,
      markRead,
      markAllRead,
      markUnread,
      remove,
      clearAll,
    ],
=======
  const value = useMemo<NotificationContextValue>(
    () => ({ notifications, unreadCount, loading, reload, markRead, markAllRead }),
    [notifications, unreadCount, loading, reload, markRead, markAllRead],
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
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
