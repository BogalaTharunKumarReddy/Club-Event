import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
<<<<<<< HEAD
import { AssistantWidget } from '@/components/assistant/AssistantWidget';
import { STORAGE_KEYS } from '@/lib/constants';
import { cn } from '@/lib/utils';
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6

/**
 * Shell for authenticated `/app/*` routes: a fixed sidebar (drawer on mobile)
 * plus a slim top bar. Public and auth pages use {@code RootLayout} instead.
<<<<<<< HEAD
 *
 * The sidebar can be collapsed to an icon-only rail on desktop; that preference
 * is remembered across sessions in localStorage so the layout stays put on
 * reload. On mobile the sidebar is always a full-width drawer (collapse doesn't
 * apply), toggled by the top-bar menu button.
 */
export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(readInitialCollapsed);
=======
 */
export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
  const location = useLocation();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

<<<<<<< HEAD
  // Persist the desktop collapse preference.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.sidebarCollapsed, collapsed ? '1' : '0');
    } catch {
      /* ignore storage failures (private mode, quota) */
    }
  }, [collapsed]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />
      {/* Left padding matches the sidebar width so content never sits under it;
          it shrinks in step with the rail when collapsed (desktop only). */}
      <div
        className={cn(
          'flex min-h-screen flex-col transition-[padding] duration-200 ease-in-out',
          collapsed ? 'lg:pl-16' : 'lg:pl-64',
        )}
      >
=======
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen flex-col lg:pl-64">
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
<<<<<<< HEAD
      {/* In-app AI help assistant (renders only when configured server-side). */}
      <AssistantWidget />
    </div>
  );
}

function readInitialCollapsed(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEYS.sidebarCollapsed) === '1';
  } catch {
    return false;
  }
}
=======
    </div>
  );
}
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
