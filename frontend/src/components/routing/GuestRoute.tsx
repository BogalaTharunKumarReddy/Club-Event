import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { roleHome } from '@/lib/roleHome';
import { FullPageLoader } from '@/components/ui/FullPageLoader';

/**
 * Inverse of ProtectedRoute — keeps already-authenticated users out of
 * login/register, sending them to wherever they were headed (or their
 * role-appropriate home).
 */
export function GuestRoute() {
  const { isAuthenticated, initializing, user } = useAuth();
  const location = useLocation();

  if (initializing) return <FullPageLoader />;

  if (isAuthenticated) {
    const dest =
      (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ||
      roleHome(user?.role);
    return <Navigate to={dest} replace />;
  }

  return <Outlet />;
}
