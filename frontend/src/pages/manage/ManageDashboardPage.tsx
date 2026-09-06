import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus, Plus, Settings2, Users2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { clubService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { EVENT_CATEGORIES } from '@/lib/constants';
import { errorMessage } from '@/lib/utils';
import { PageContainer } from '@/components/layout/RootLayout';
import {
  Avatar,
  Button,
  EmptyState,
  ErrorState,
  Field,
  FullPageLoader,
  Modal,
  PageHeader,
  Select,
  TextArea,
  TextInput,
} from '@/components/ui';
import type { ClubMemberResponse, ClubRequest } from '@/types';

export default function ManageDashboardPage() {
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);

  const { data: memberships, loading, error, reload } = useQuery(
    () => clubService.myMemberships(),
    [],
  );

  const coordinatorClubs = useMemo(
    () =>
      (memberships ?? []).filter(
        (m) => m.clubRole === 'COORDINATOR' && m.status === 'ACTIVE',
      ),
    [memberships],
  );

  if (loading) return <FullPageLoader />;

  return (
    <PageContainer>
      <PageHeader
        title="Coordinator tools"
        description="Manage the clubs you coordinate and their events."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> New club
          </Button>
        }
      />

      <div className="mt-6">
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : coordinatorClubs.length === 0 ? (
          <EmptyState
            icon={<Settings2 className="h-6 w-6" />}
            title="You don't coordinate any clubs yet"
            description="Create a club to start organising events, teams and competitions."
            action={
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" /> Create your first club
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {coordinatorClubs.map((club) => (
              <CoordinatorClubCard key={club.id} membership={club} />
            ))}
          </div>
        )}
      </div>

      <CreateClubModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        coordinatorName={user?.fullName}
        onCreated={() => {
          setCreateOpen(false);
          reload();
        }}
      />
    </PageContainer>
  );
}

function CoordinatorClubCard({ membership }: { membership: ClubMemberResponse }) {
  // Pull fresh club details for accurate counts.
  const { data: club } = useQuery(() => clubService.getById(membership.clubId), [membership.clubId]);

  return (
    <div className="card flex flex-col p-5">
      <div className="flex items-center gap-3">
        <Avatar name={membership.clubName} src={club?.logoUrl} size="md" />
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-900 dark:text-slate-100">
            {membership.clubName}
          </h3>
          <p className="text-xs text-slate-400">
            {club ? `${club.memberCount} members · ${club.eventCount} events` : '—'}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 pt-2">
        <Link to={`/app/manage/clubs/${membership.clubId}`} className="btn-secondary text-sm">
          <Settings2 className="h-4 w-4" /> Manage
        </Link>
        <Link
          to={`/app/manage/events/new?clubId=${membership.clubId}`}
          className="btn-primary text-sm"
        >
          <CalendarPlus className="h-4 w-4" /> New event
        </Link>
        <Link to={`/clubs/${membership.clubId}`} className="btn-ghost text-sm">
          <Users2 className="h-4 w-4" /> View
        </Link>
      </div>
    </div>
  );
}

function CreateClubModal({
  open,
  onClose,
  coordinatorName,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  coordinatorName?: string;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<ClubRequest>({ name: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function set<K extends keyof ClubRequest>(key: K, value: ClubRequest[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit() {
    if (!form.name.trim()) {
      setErr('Club name is required.');
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await clubService.create({
        ...form,
        name: form.name.trim(),
        description: form.description || undefined,
        category: form.category || undefined,
        contactEmail: form.contactEmail || undefined,
      });
      toast.success('Club created!');
      setForm({ name: '' });
      onCreated();
    } catch (e) {
      setErr(errorMessage(e, 'Could not create club.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={busy ? () => undefined : onClose}
      title="Create a club"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} loading={busy}>
            Create club
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Club name" htmlFor="club-name" required>
          <TextInput
            id="club-name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Coding Club"
            autoFocus
          />
        </Field>
        <Field label="Category" htmlFor="club-category">
          <Select
            id="club-category"
            value={form.category ?? ''}
            onChange={(e) => set('category', e.target.value)}
          >
            <option value="">Select a category</option>
            {EVENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Description" htmlFor="club-desc">
          <TextArea
            id="club-desc"
            rows={3}
            value={form.description ?? ''}
            onChange={(e) => set('description', e.target.value)}
            placeholder="What is this club about?"
          />
        </Field>
        <Field label="Contact email" htmlFor="club-email" hint={coordinatorName ? `You (${coordinatorName}) will be the coordinator.` : undefined}>
          <TextInput
            id="club-email"
            type="email"
            value={form.contactEmail ?? ''}
            onChange={(e) => set('contactEmail', e.target.value)}
            placeholder="club@college.edu"
          />
        </Field>
        {err && <p className="field-error">{err}</p>}
      </div>
    </Modal>
  );
}
