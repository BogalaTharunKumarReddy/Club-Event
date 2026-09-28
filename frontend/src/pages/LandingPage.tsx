import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Award,
  CalendarDays,
<<<<<<< HEAD
  QrCode,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserPlus,
  Users2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { roleHome } from '@/lib/roleHome';
=======
  ChevronDown,
  HelpCircle,
  QrCode,
  Sparkles,
  Trophy,
  Users2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
import { PageContainer } from '@/components/layout/RootLayout';

const FEATURES = [
  {
    icon: CalendarDays,
    title: 'Discover events',
<<<<<<< HEAD
    text: 'Workshops, hackathons, cultural nights and more across every campus club, in one calendar.',
=======
    text: 'Browse workshops, hackathons, cultural nights and more across every campus club.',
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
  },
  {
    icon: Users2,
    title: 'Team up',
<<<<<<< HEAD
    text: 'Form teams for team events, invite members and manage everyone from a single place.',
=======
    text: 'Form teams for team events, invite members and manage everyone in one place.',
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
  },
  {
    icon: QrCode,
    title: 'QR attendance',
<<<<<<< HEAD
    text: 'Every registration gets a unique ticket. Check in at the door in seconds — no queues, no paper.',
=======
    text: 'Get a unique ticket for each event and check in at the door in seconds.',
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
  },
  {
    icon: Trophy,
    title: 'Live leaderboards',
    text: 'Follow competition standings updating in real time as judges score each round.',
  },
  {
    icon: Award,
    title: 'Verified certificates',
<<<<<<< HEAD
    text: 'Earn participation and winner certificates you can share, and anyone can verify by code.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & role-based',
    text: 'Students, volunteers, club members, coordinators and admins each get exactly the tools they need.',
  },
];

const STEPS = [
  {
    icon: UserPlus,
    title: 'Create your account',
    text: 'Sign up in seconds, then follow the clubs you care about to see what they have planned.',
  },
  {
    icon: CalendarDays,
    title: 'Register & take part',
    text: 'Join events solo or as a team. Free events register instantly; paid events use a secure checkout.',
  },
  {
    icon: Award,
    title: 'Check in & earn certificates',
    text: 'Show your QR ticket at the door and collect verifiable certificates for everything you attend.',
=======
    text: 'Earn participation and winner certificates you can share and anyone can verify.',
  },
];

const FAQS = [
  {
    q: 'How do I register for an event?',
    a: 'Open any published event and register in a single tap. If the event is at capacity you can still join the waitlist and get promoted automatically when a spot opens up.',
  },
  {
    q: 'Can I take part as a team?',
    a: 'Yes. Team events let you create a team and invite classmates, or join an existing team with an invite. Everyone on the team is checked in and scored together.',
  },
  {
    q: 'What is QR attendance?',
    a: 'Each registration gets a unique ticket. Show its QR code at the door and a coordinator scans you in within seconds — the code carries only an opaque ticket reference, never your personal details.',
  },
  {
    q: 'Do I earn a certificate?',
    a: 'Participation, winner and merit certificates are issued as PDFs you can download and share. Anyone can confirm a certificate is genuine from the Verify Certificate page using its code.',
  },
  {
    q: 'How do paid events work?',
    a: 'Paid events show the fee up front and take you through a secure checkout before your seat is confirmed. Free events register instantly.',
  },
  {
    q: 'How do I start a club or run events?',
    a: 'Create an account and join a club, or request to coordinate one. Club coordinators get tools to publish events, run attendance, score competitions and issue certificates.',
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
  },
];

export default function LandingPage() {
  const { t } = useTranslation();
<<<<<<< HEAD
  const { isAuthenticated, user } = useAuth();
=======
  const { isAuthenticated } = useAuth();
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="max-w-2xl">
            <span className="badge bg-white/15 text-white ring-1 ring-white/20">
              {t('appName')}
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Every campus event, in one place.
            </h1>
            <p className="mt-5 text-lg text-brand-50/90">{t('tagline')}</p>
            <div className="mt-8 flex flex-wrap gap-3">
<<<<<<< HEAD
              {isAuthenticated ? (
                <Link
                  to={roleHome(user?.role)}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50"
                >
                  Go to dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                // Sign in / sign up live in the top navbar (shown on every page), so
                // the hero keeps a single primary call-to-action rather than repeating
                // that pair of buttons here.
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50"
                >
                  Get started <ArrowRight className="h-4 w-4" />
=======
              <Link
                to="/events"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50"
              >
                {t('nav.events')} <ArrowRight className="h-4 w-4" />
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-500/30 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/30 transition hover:bg-brand-500/50"
                >
                  {t('nav.register')}
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <PageContainer>
<<<<<<< HEAD
        <div className="mb-8 max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Everything you need to run campus life
          </h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            From the first registration to the final certificate, CampusConnect keeps events,
            attendance and recognition in a single, dependable workflow.
          </p>
        </div>
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6">
              <span className="inline-flex rounded-lg bg-brand-50 p-2.5 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">
                {f.title}
              </h3>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{f.text}</p>
            </div>
          ))}
        </div>
      </PageContainer>

<<<<<<< HEAD
      {/* How it works */}
      <div className="bg-slate-50 dark:bg-slate-900/40">
        <PageContainer>
          <div className="mb-8 max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              How it works
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Three steps from signing up to walking away with a verified certificate.
            </p>
          </div>
          <ol className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="card relative p-6">
                <span className="absolute right-5 top-5 text-4xl font-black text-slate-100 dark:text-slate-800">
                  {i + 1}
                </span>
                <span className="inline-flex rounded-lg bg-brand-600/10 p-2.5 text-brand-600 dark:text-brand-400">
                  <s.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{s.text}</p>
              </li>
            ))}
          </ol>
        </PageContainer>
      </div>

      {/* For clubs & coordinators */}
      <PageContainer>
        <div className="grid items-center gap-8 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex rounded-lg bg-brand-50 p-2.5 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400">
              <Sparkles className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Running a club or an event?
            </h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400">
              Coordinators get a full workspace to publish events, take attendance by QR, score
              competitions, collect payments, and issue certificates in bulk — while volunteers and
              members pitch in with exactly the access they need.
            </p>
            {!isAuthenticated && (
              <Link
                to="/register"
                className="btn-primary mt-6 inline-flex w-fit"
              >
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              'Publish and manage events',
              'QR-based attendance',
              'Team registrations',
              'Competition scoring',
              'Secure payments & receipts',
              'Bulk certificate issuing',
            ].map((label) => (
              <li
                key={label}
                className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
              >
                <ShieldCheck className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
                {label}
              </li>
            ))}
          </ul>
=======
      {/* FAQ */}
      <PageContainer>
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex items-center gap-2.5">
            <span className="inline-flex rounded-lg bg-brand-50 p-2.5 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400">
              <HelpCircle className="h-5 w-5" />
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((item) => (
              <details
                key={item.q}
                className="group card overflow-hidden p-0 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-medium text-slate-900 dark:text-slate-100">
                  {item.q}
                  <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </PageContainer>

      {/* Call to action */}
      <PageContainer>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 px-6 py-12 text-center text-white sm:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.15),transparent_50%)]" />
          <div className="relative mx-auto max-w-2xl">
            <span className="inline-flex rounded-full bg-white/15 p-3 ring-1 ring-white/20">
              <Sparkles className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight">
              {isAuthenticated ? 'Pick up where you left off' : 'Ready to join in?'}
            </h2>
            <p className="mt-3 text-brand-50/90">
              {isAuthenticated
                ? 'Jump back to your dashboard to see your upcoming events, teams and certificates.'
                : 'Create a free account and start registering for events, forming teams and earning certificates today.'}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {isAuthenticated ? (
                <Link
                  to="/app/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50"
                >
                  Go to dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50"
                  >
                    {t('nav.register')} <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/events"
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-500/30 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/30 transition hover:bg-brand-500/50"
                  >
                    {t('nav.events')}
                  </Link>
                </>
              )}
            </div>
          </div>
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
        </div>
      </PageContainer>
    </div>
  );
}
