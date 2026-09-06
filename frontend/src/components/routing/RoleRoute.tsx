import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { FullPageLoader } from '@/components/ui/FullPageLoader';
import type { Role } from '@/types';

/**
 * Gate for routes restricted to specific roles (e.g. coordinator dashboards).
 * Assumes it renders *inside* a ProtectedRoute, so the user is already known;
 * an unauthorised role is sent to /403 rather than /login.
 */
export function RoleRoute({ allow }: { allow: Role[] }) {
  const { user, initializing } = useAuth();

  if (initializing) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) return <Navigate to="/403" replace />;

  return <Outlet />;
}
