import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
<<<<<<< HEAD
import { roleHome } from '@/lib/roleHome';
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
import { FullPageLoader } from '@/components/ui/FullPageLoader';

/**
 * Inverse of ProtectedRoute — keeps already-authenticated users out of
<<<<<<< HEAD
 * login/register, sending them to wherever they were headed (or their
 * role-appropriate home).
 */
export function GuestRoute() {
  const { isAuthenticated, initializing, user } = useAuth();
=======
 * login/register, sending them to wherever they were headed (or the dashboard).
 */
export function GuestRoute() {
  const { isAuthenticated, initializing } = useAuth();
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
  const location = useLocation();

  if (initializing) return <FullPageLoader />;

  if (isAuthenticated) {
    const dest =
      (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ||
<<<<<<< HEAD
      roleHome(user?.role);
=======
      '/app/dashboard';
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
    return <Navigate to={dest} replace />;
  }

  return <Outlet />;
}
