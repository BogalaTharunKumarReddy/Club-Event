import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Crown, Mail, Trash2, UserPlus, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { teamService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { errorMessage, formatDate } from '@/lib/utils';
import { PageContainer } from '@/components/layout/RootLayout';
import {
  Avatar,
  Badge,
  Button,
  ConfirmDialog,
  ErrorState,
  Field,
  FullPageLoader,
  PageHeader,
  TextInput,
} from '@/components/ui';
import type { TeamMemberResponse } from '@/types';

export default function TeamDetailPage() {
  const { id } = useParams();
  const teamId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: team, loading, error, reload } = useQuery(
    () => teamService.getById(teamId),
    [teamId],
  );

  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [removeMember, setRemoveMember] = useState<TeamMemberResponse | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (loading) return <FullPageLoader />;
  if (error || !team) {
    return (
      <PageContainer>
        <ErrorState message={error ?? 'Team not found.'} onRetry={reload} />
      </PageContainer>
    );
  }

  const isLeader = user?.id === team.leaderId;
  const isFull = typeof team.maxSize === 'number' && team.memberCount >= team.maxSize;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setAdding(true);
    try {
      await teamService.addMember(teamId, { email: email.trim() });
      toast.success('Member added.');
      setEmail('');
      reload();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not add member.'));
    } finally {
      setAdding(false);
    }
  }

  async function confirmRemove() {
    if (!removeMember) return;
    try {
      await teamService.removeMember(teamId, removeMember.id);
      toast.success('Member removed.');
      reload();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not remove member.'));
      throw err;
    }
  }

  async function confirmDelete() {
    try {
      await teamService.remove(teamId);
      toast.success('Team disbanded.');
      navigate('/app/my-events');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete team.'));
      throw err;
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title={team.name}
        description={
          <>
            Team for{' '}
            <Link to={`/events/${team.eventId}`} className="font-medium text-brand-600 hover:underline">
              {team.eventTitle}
            </Link>
          </>
        }
        actions={
          isLeader ? (
            <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" /> Disband
            </Button>
          ) : undefined
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Members */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
              <Users className="h-4 w-4 text-brand-600" /> Members
            </h3>
            <span className="text-sm text-slate-400">
              {team.memberCount}
              {team.maxSize ? ` / ${team.maxSize}` : ''}
            </span>
          </div>
          <ul className="space-y-2">
            {team.members.map((m) => (
              <li key={m.id} className="card flex items-center gap-3 p-4">
                <Avatar name={m.fullName} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                      {m.fullName}
                    </p>
                    {m.leader && (
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        <Crown className="mr-1 inline h-3 w-3" /> Leader
                      </Badge>
                    )}
                  </div>
                  <p className="flex items-center gap-1 text-xs text-slate-400">
                    <Mail className="h-3 w-3" /> {m.email} · joined {formatDate(m.joinedAt)}
                  </p>
                </div>
                {isLeader && !m.leader && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRemoveMember(m)}
                    aria-label={`Remove ${m.fullName}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Add member (leader only) */}
        {isLeader && (
          <div className="lg:col-span-1">
            <div className="card p-5">
              <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                <UserPlus className="h-4 w-4 text-brand-600" /> Add member
              </h3>
              {isFull ? (
                <p className="mt-3 text-sm text-slate-400">
                  Your team is full ({team.maxSize} members).
                </p>
              ) : (
                <form onSubmit={handleAdd} className="mt-3 space-y-3">
                  <Field label="Member email" htmlFor="member-email">
                    <TextInput
                      id="member-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="teammate@college.edu"
                    />
                  </Field>
                  <Button type="submit" fullWidth loading={adding}>
                    Add to team
                  </Button>
                  <p className="text-xs text-slate-400">
                    They must have a CampusConnect account with this email.
                  </p>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!removeMember}
        onClose={() => setRemoveMember(null)}
        onConfirm={confirmRemove}
        title="Remove member?"
        message={`Remove ${removeMember?.fullName ?? 'this member'} from the team?`}
        confirmLabel="Remove"
        danger
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Disband team?"
        message="This removes the team and its registration for the event. This can't be undone."
        confirmLabel="Disband team"
        danger
      />
    </PageContainer>
  );
}
