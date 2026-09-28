import { Link } from 'react-router-dom';
import {
  ArrowRight,
<<<<<<< HEAD
  Award,
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
  Building2,
  CalendarCheck,
  CreditCard,
  Gauge,
<<<<<<< HEAD
  ShieldCheck,
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
  Ticket,
  Users,
  Wallet,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { adminService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { formatCurrency } from '@/lib/utils';
import { PageContainer } from '@/components/layout/RootLayout';
import { StatCard } from '@/components/domain/StatCard';
import { ErrorState, PageHeader, Skeleton } from '@/components/ui';

const ROLE_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7'];

export default function AdminDashboardPage() {
  const { data: stats, loading, error, reload } = useQuery(() => adminService.stats(), []);

  const roleData = stats
    ? [
        { label: 'Students', value: stats.students },
        { label: 'Members', value: stats.clubMembers },
        { label: 'Coordinators', value: stats.coordinators },
        { label: 'Admins', value: stats.admins },
      ]
    : [];

  return (
    <PageContainer>
      <PageHeader
        title="Admin console"
        description="Platform-wide overview of users, clubs, events and revenue."
      />

      {error ? (
        <div className="mt-6">
          <ErrorState message={error} onRetry={reload} />
        </div>
      ) : loading || !stats ? (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
          <Skeleton className="h-72 w-full" />
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total users"
              value={stats.totalUsers}
              icon={<Users className="h-5 w-5" />}
              hint={`${stats.admins} admin${stats.admins === 1 ? '' : 's'}`}
            />
            <StatCard
              label="Clubs"
              value={stats.totalClubs}
              icon={<Building2 className="h-5 w-5" />}
              hint={`${stats.activeClubs} active`}
            />
            <StatCard
              label="Events"
              value={stats.totalEvents}
              icon={<CalendarCheck className="h-5 w-5" />}
              hint={`${stats.publishedEvents} published`}
            />
            <StatCard
              label="Total revenue"
              value={formatCurrency(stats.totalRevenue)}
              icon={<Wallet className="h-5 w-5" />}
              hint={`${stats.successfulPayments} paid`}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Role distribution */}
            <div className="card p-5 lg:col-span-2">
              <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                <Gauge className="h-4 w-4 text-brand-600" /> Users by role
              </h3>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roleData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" interval={0} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip
                      cursor={{ fill: 'rgba(148,163,184,0.1)' }}
                      contentStyle={{ borderRadius: 8, fontSize: 12 }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {roleData.map((_, i) => (
                        <Cell key={i} fill={ROLE_COLORS[i % ROLE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Secondary metrics */}
            <div className="space-y-4">
              <StatCard
                label="Registrations"
                value={stats.totalRegistrations}
                icon={<Ticket className="h-5 w-5" />}
              />
              <StatCard
                label="Successful payments"
                value={stats.successfulPayments}
                icon={<CreditCard className="h-5 w-5" />}
              />
            </div>
          </div>

          {/* Quick links */}
<<<<<<< HEAD
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <QuickLink to="/app/admin/users" icon={<Users className="h-5 w-5" />} title="Manage users" description="Roles, access & accounts" />
            <QuickLink to="/app/admin/clubs" icon={<Building2 className="h-5 w-5" />} title="Manage clubs" description="Activate or remove clubs" />
            <QuickLink to="/app/admin/events" icon={<CalendarCheck className="h-5 w-5" />} title="Manage events" description="Moderate every event" />
            <QuickLink to="/app/admin/payments" icon={<CreditCard className="h-5 w-5" />} title="Payments" description="Transactions & refunds" />
            <QuickLink to="/app/admin/certificates" icon={<Award className="h-5 w-5" />} title="Certificate templates" description="Reusable certificate designs" />
            <QuickLink to="/app/admin/audit-log" icon={<ShieldCheck className="h-5 w-5" />} title="Audit log" description="Every administrative action" />
=======
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <QuickLink to="/app/admin/users" icon={<Users className="h-5 w-5" />} title="Manage users" description="Roles, access & accounts" />
            <QuickLink to="/app/admin/clubs" icon={<Building2 className="h-5 w-5" />} title="Manage clubs" description="Activate or remove clubs" />
            <QuickLink to="/app/admin/events" icon={<CalendarCheck className="h-5 w-5" />} title="Manage events" description="Moderate every event" />
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
          </div>
        </>
      )}
    </PageContainer>
  );
}

function QuickLink({
  to,
  icon,
  title,
  description,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      className="card group flex items-center gap-4 p-5 transition-colors hover:border-brand-300 dark:hover:border-brand-700"
    >
      <span className="rounded-lg bg-brand-50 p-2.5 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-900 dark:text-slate-100">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
