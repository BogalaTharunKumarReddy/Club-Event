import type { Role } from '@/types';

/**
 * The landing route for a role after login.
 *
 * VOLUNTEER and ADMIN don't have a `/app/dashboard` entry in the sidebar
 * (volunteers use their own workspace; admins use the console), so sending them
 * to the shared dashboard is a dead-end. Route each role to a home it actually
 * has navigation for; everyone else uses the shared dashboard.
 */
export function roleHome(role?: Role | null): string {
  switch (role) {
    case 'VOLUNTEER':
      return '/app/volunteer/dashboard';
    case 'ADMIN':
      return '/app/admin';
    default:
      return '/app/dashboard';
  }
}
