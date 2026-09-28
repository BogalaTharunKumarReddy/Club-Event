import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { roleHome } from '@/lib/roleHome';

/**
 * Index redirect for `/app`. Sends each user to the home their role actually has
 * navigation for (volunteer workspace, admin console, or the shared dashboard)
 * instead of a one-size-fits-all `/app/dashboard`.
 */
export function RoleHomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={roleHome(user?.role)} replace />;
}
