import { Link } from 'react-router-dom';
import { ArrowRight, Clock, HandHeart } from 'lucide-react';
import { volunteerService } from '@/lib/services';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@/hooks/useApi';
import { cn } from '@/lib/utils';
import {
  VOLUNTEER_STATUS_LABELS,
  VOLUNTEER_STATUS_STYLES,
} from '@/lib/constants';
import { PageContainer } from '@/components/layout/RootLayout';
import {
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
} from '@/components/ui';

/**
 * "Volunteering" — a personal overview available to every signed-in user.
 *
 * Volunteering is a club-scoped role: you apply to a club, and once a
 * coordinator approves you, the dedicated volunteer workspace unlocks. This
 * page adapts to who's viewing it:
 *   • Approved/active volunteers see their club profiles (status + hours) and a
 *     link into the full volunteer workspace.
 *   • Everyone else sees a short explainer on how to get involved. We only call
 *     the volunteer API when the user actually holds the VOLUNTEER role, so
 *     students never hit a permission wall.
 */
export default function MyVolunteeringPage() {
  const { hasRole } = useAuth();
  const isVolunteer = hasRole('VOLUNTEER');

  return (
    <PageContainer>
      <PageHeader
        title="Volunteering"
        description="Clubs you volunteer for, and how to get involved with more."
      />

      <div className="mt-6">
        {isVolunteer ? <VolunteerProfiles /> : <HowToVolunteer />}
      </div>
    </PageContainer>
  );
}

/** Club-by-club volunteer standing for a user who holds the VOLUNTEER role. */
function VolunteerProfiles() {
  const { data: profiles, loading, error, reload } = useQuery(
    () => volunteerService.myProfiles(),
    [],
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!profiles || profiles.length === 0) {
    return <HowToVolunteer />;
  }

  return (
    <div className="space-y-6">
      <Link
        to="/app/volunteer/dashboard"
        className="flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50 p-4 transition hover:border-brand-300 dark:border-brand-900/50 dark:bg-brand-900/20"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-600 text-white">
            <HandHeart className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              Open my volunteer workspace
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your assigned events, tasks, shifts and check-in tools.
            </p>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-brand-600 dark:text-brand-300" />
      </Link>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
          My clubs
        </h3>
        <ul className="space-y-3">
          {profiles.map((v) => (
            <li key={v.id} className="card flex flex-wrap items-center justify-between gap-3 p-5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/clubs/${v.clubId}`}
                    className="font-semibold text-slate-900 hover:text-brand-700 dark:text-slate-100"
                  >
                    {v.clubName}
                  </Link>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-medium',
                      VOLUNTEER_STATUS_STYLES[v.status],
                    )}
                  >
                    {VOLUNTEER_STATUS_LABELS[v.status]}
                  </span>
                </div>
                {v.skills && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Skills: {v.skills}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <Clock className="h-4 w-4" />
                {v.totalHours.toFixed(1)} hrs
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Explainer shown to users who don't (yet) volunteer anywhere. */
function HowToVolunteer() {
  return (
    <EmptyState
      icon={<HandHeart className="h-6 w-6" />}
      title="Lend a hand at campus events"
      description="Volunteering is organised per club. Open a club you'd like to support and apply to volunteer — once a coordinator approves you, your volunteer workspace unlocks with assigned events, tasks and shifts."
    />
  );
}
