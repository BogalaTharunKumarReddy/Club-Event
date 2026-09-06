import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { FullPageLoader } from '@/components/ui/FullPageLoader';

/**
 * Gate for authenticated-only routes. While the session is being restored we
 * show a loader (so a logged-in user isn't bounced to /login on refresh), then
 * redirect to /login preserving the intended destination.
 */
export function ProtectedRoute() {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <FullPageLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
