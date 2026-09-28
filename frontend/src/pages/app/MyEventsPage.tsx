import { useState } from 'react';
import { Link } from 'react-router-dom';
<<<<<<< HEAD
import { CalendarDays, CreditCard, QrCode, Star, Users } from 'lucide-react';
=======
import { CalendarDays, QrCode, Users } from 'lucide-react';
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
import toast from 'react-hot-toast';
import { registrationService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { errorMessage, formatDate } from '@/lib/utils';
import { PageContainer } from '@/components/layout/RootLayout';
import { TicketModal } from '@/components/domain/TicketModal';
<<<<<<< HEAD
import { FeedbackModal } from '@/components/domain/FeedbackModal';
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  PageHeader,
  Pagination,
  RegistrationStatusBadge,
  Skeleton,
} from '@/components/ui';
import type { RegistrationResponse } from '@/types';

export default function MyEventsPage() {
  const [page, setPage] = useState(0);
  const [ticketReg, setTicketReg] = useState<RegistrationResponse | null>(null);
  const [cancelReg, setCancelReg] = useState<RegistrationResponse | null>(null);
<<<<<<< HEAD
  const [feedbackReg, setFeedbackReg] = useState<RegistrationResponse | null>(null);
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6

  const { data, loading, error, reload } = useQuery(
    () => registrationService.mine(page, 10),
    [page],
  );

  async function confirmCancel() {
    if (!cancelReg) return;
    try {
      await registrationService.cancel(cancelReg.id);
      toast.success('Registration cancelled.');
      reload();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not cancel.'));
      throw err;
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="My events"
        description="Your registrations, tickets and team entries."
      />

      <div className="mt-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : !data || data.content.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="h-6 w-6" />}
            title="No registrations yet"
<<<<<<< HEAD
            description="Your registrations, tickets and team entries will appear here once you sign up for an event."
=======
            description="Browse events and sign up to see them here."
            action={
              <Link to="/events" className="btn-primary">
                Browse events
              </Link>
            }
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
          />
        ) : (
          <>
            <ul className="space-y-3">
              {data.content.map((reg) => (
                <li key={reg.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/events/${reg.eventId}`}
                        className="font-semibold text-slate-900 hover:text-brand-700 dark:text-slate-100"
                      >
                        {reg.eventTitle}
                      </Link>
                      <RegistrationStatusBadge status={reg.status} />
                      {reg.type === 'TEAM' && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Users className="h-3.5 w-3.5" />
                          {reg.teamName}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
<<<<<<< HEAD
                      Registered {formatDate(reg.createdAt)}
                      {reg.ticketReady ? (
                        <>
                          {' · '}Ticket <span className="font-mono">{reg.ticketCode}</span>
                        </>
                      ) : reg.paidEvent ? (
                        <>
                          {' · '}
                          <span className="text-amber-600 dark:text-amber-400">
                            Payment required
                          </span>
                        </>
                      ) : null}
=======
                      Registered {formatDate(reg.createdAt)} · Ticket{' '}
                      <span className="font-mono">{reg.ticketCode}</span>
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {reg.type === 'TEAM' && reg.teamId && (
                      <Link to={`/app/teams/${reg.teamId}`} className="btn-ghost text-sm">
                        Team
                      </Link>
                    )}
                    {reg.status !== 'CANCELLED' && (
                      <>
<<<<<<< HEAD
                        {reg.eventStatus === 'COMPLETED' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setFeedbackReg(reg)}
                          >
                            <Star className="h-4 w-4" /> Rate event
                          </Button>
                        )}
                        {reg.ticketReady ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setTicketReg(reg)}
                          >
                            <QrCode className="h-4 w-4" /> Ticket
                          </Button>
                        ) : reg.paidEvent ? (
                          <Link to={`/events/${reg.eventId}`} className="btn-primary text-sm">
                            <CreditCard className="h-4 w-4" /> Pay
                          </Link>
                        ) : null}
                        {reg.eventStatus !== 'COMPLETED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCancelReg(reg)}
                          >
                            Cancel
                          </Button>
                        )}
=======
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setTicketReg(reg)}
                        >
                          <QrCode className="h-4 w-4" /> Ticket
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCancelReg(reg)}
                        >
                          Cancel
                        </Button>
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
            </div>
          </>
        )}
      </div>

      {ticketReg && (
        <TicketModal
          open={!!ticketReg}
          onClose={() => setTicketReg(null)}
          registration={ticketReg}
<<<<<<< HEAD
          onVerified={reload}
        />
      )}

      {feedbackReg && (
        <FeedbackModal
          open={!!feedbackReg}
          onClose={() => setFeedbackReg(null)}
          eventId={feedbackReg.eventId}
          eventTitle={feedbackReg.eventTitle}
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
        />
      )}

      <ConfirmDialog
        open={!!cancelReg}
        onClose={() => setCancelReg(null)}
        onConfirm={confirmCancel}
        title="Cancel registration?"
        message={`You'll lose your spot for "${cancelReg?.eventTitle ?? ''}". This can't be undone.`}
        confirmLabel="Yes, cancel"
        danger
      />
    </PageContainer>
  );
}
