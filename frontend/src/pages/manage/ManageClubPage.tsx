import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Check,
  Crown,
<<<<<<< HEAD
  HandHeart,
  Megaphone,
  Pin,
  Plus,
  RotateCcw,
=======
  Megaphone,
  Pin,
  Plus,
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
  Save,
  Settings2,
  Trash2,
  UserCheck,
<<<<<<< HEAD
  UserPlus,
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
  Users2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
<<<<<<< HEAD
import { announcementService, clubService, volunteerService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import {
  EVENT_CATEGORIES,
  MEMBERSHIP_STATUS_LABELS,
  VOLUNTEER_STATUS_LABELS,
  VOLUNTEER_STATUS_STYLES,
} from '@/lib/constants';
import { cn, errorMessage, formatDate, fromNow } from '@/lib/utils';
import { optionalImageUrl } from '@/lib/validation';
=======
import { announcementService, clubService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { EVENT_CATEGORIES, MEMBERSHIP_STATUS_LABELS } from '@/lib/constants';
import { cn, errorMessage, formatDate, fromNow } from '@/lib/utils';
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
import { PageContainer } from '@/components/layout/RootLayout';
import {
  Avatar,
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  Modal,
  PageHeader,
  Select,
  Spinner,
  TextArea,
  TextInput,
} from '@/components/ui';
<<<<<<< HEAD
import type {
  AnnouncementResponse,
  ClubMemberResponse,
  ClubRequest,
  VolunteerResponse,
} from '@/types';
import { ImageUpload } from '@/components/domain/ImageUpload';
import { AddVolunteerModal } from '@/components/domain/AddVolunteerModal';

type Tab = 'details' | 'members' | 'volunteers' | 'announcements';
=======
import type { AnnouncementResponse, ClubMemberResponse, ClubRequest } from '@/types';
import { ImageUpload } from '@/components/domain/ImageUpload';

type Tab = 'details' | 'members' | 'announcements';
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6

export default function ManageClubPage() {
  const { clubId: clubIdParam } = useParams();
  const clubId = Number(clubIdParam);
  const [tab, setTab] = useState<Tab>('details');

  const { data: club, loading, error, reload } = useQuery(
    () => clubService.getById(clubId),
    [clubId],
  );
  const {
    data: members,
    loading: membersLoading,
    reload: reloadMembers,
  } = useQuery(() => clubService.members(clubId), [clubId]);

  const pendingCount = useMemo(
    () => (members ?? []).filter((m) => m.status === 'PENDING').length,
    [members],
  );

  // Loader stays inside the layout content area so the AppLayout sidebar
  // remains visible while the club loads (a bare full-viewport loader covered it).
  if (loading) {
    return (
      <PageContainer>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Spinner className="h-8 w-8 text-brand-600" />
        </div>
      </PageContainer>
    );
  }
  if (error || !club) {
    return (
      <PageContainer>
        <ErrorState message={error ?? 'Club not found.'} onRetry={reload} />
      </PageContainer>
    );
  }

  const tabs: Array<{ key: Tab; label: string; icon: React.ReactNode; badge?: number }> = [
    { key: 'details', label: 'Details', icon: <Settings2 className="h-4 w-4" /> },
    { key: 'members', label: 'Members', icon: <Users2 className="h-4 w-4" />, badge: pendingCount },
<<<<<<< HEAD
    { key: 'volunteers', label: 'Volunteers', icon: <HandHeart className="h-4 w-4" /> },
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
    { key: 'announcements', label: 'Announcements', icon: <Megaphone className="h-4 w-4" /> },
  ];

  return (
    <PageContainer>
      <Link
<<<<<<< HEAD
        to="/app/manage/clubs"
        className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Clubs
=======
        to="/app/manage"
        className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" /> Coordinator tools
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
      </Link>
      <PageHeader
        title={club.name}
        description={`Manage details, members and announcements for ${club.name}.`}
        actions={
          <Link to={`/clubs/${club.id}`} className="btn-ghost text-sm">
            View public page
          </Link>
        }
      />

<<<<<<< HEAD
      {/* Tabs — scrollable on narrow screens so they never force horizontal page scroll */}
      <div className="no-scrollbar mt-6 flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-700">
=======
      {/* Tabs */}
      <div className="mt-6 flex gap-1 border-b border-slate-200 dark:border-slate-700">
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
<<<<<<< HEAD
              'relative -mb-px flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition',
=======
              'relative -mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition',
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
              tab === t.key
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200',
            )}
          >
            {t.icon}
            {t.label}
            {t.badge ? (
              <span className="ml-1 rounded-full bg-brand-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'details' && <DetailsTab clubId={clubId} club={club} onSaved={reload} />}
        {tab === 'members' && (
          <MembersTab
            clubId={clubId}
            members={members ?? []}
            loading={membersLoading}
            onChanged={() => {
              reloadMembers();
              reload();
            }}
          />
        )}
<<<<<<< HEAD
        {tab === 'volunteers' && <ClubVolunteersTab clubId={clubId} clubName={club.name} />}
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
        {tab === 'announcements' && <AnnouncementsTab clubId={clubId} clubName={club.name} />}
      </div>
    </PageContainer>
  );
}

/* ------------------------------- details ------------------------------- */

const clubSchema = z.object({
  name: z.string().min(1, 'Name is required').max(150),
  category: z.string().optional(),
  description: z.string().max(2000).optional(),
<<<<<<< HEAD
  logoUrl: optionalImageUrl,
  coverImageUrl: optionalImageUrl,
=======
  logoUrl: z.string().url('Enter a valid URL').or(z.literal('')).optional(),
  coverImageUrl: z.string().url('Enter a valid URL').or(z.literal('')).optional(),
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
  contactEmail: z.string().email('Enter a valid email').or(z.literal('')).optional(),
  contactPhone: z.string().max(20).optional(),
});
type ClubValues = z.infer<typeof clubSchema>;

function DetailsTab({
  clubId,
  club,
  onSaved,
}: {
  clubId: number;
  club: import('@/types').ClubResponse;
  onSaved: () => void;
}) {
  const navigate = useNavigate();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ClubValues>({
    resolver: zodResolver(clubSchema),
    values: {
      name: club.name,
      category: club.category ?? '',
      description: club.description ?? '',
      logoUrl: club.logoUrl ?? '',
      coverImageUrl: club.coverImageUrl ?? '',
      contactEmail: club.contactEmail ?? '',
      contactPhone: club.contactPhone ?? '',
    },
  });

  const onSubmit = async (values: ClubValues) => {
    const payload: ClubRequest = {
      name: values.name.trim(),
      category: values.category || undefined,
      description: values.description || undefined,
      logoUrl: values.logoUrl || undefined,
      coverImageUrl: values.coverImageUrl || undefined,
      contactEmail: values.contactEmail || undefined,
      contactPhone: values.contactPhone || undefined,
    };
    try {
      await clubService.update(clubId, payload);
      toast.success('Club updated.');
      onSaved();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update club.'));
    }
  };

  // DELETE /clubs/{id} deactivates the club (coordinator scope); hard-delete is admin-only.
  // Thrown errors surface inside the ConfirmDialog; navigation only runs on success.
  async function confirmDelete() {
    await clubService.remove(clubId);
    toast.success('Club deactivated.');
    navigate('/app/manage');
  }

<<<<<<< HEAD
  // Reactivate is the inverse of deactivate; both are coordinator-scoped.
  // onSaved() re-runs the parent's club query so the danger zone flips back.
  async function handleReactivate() {
    try {
      await clubService.reactivate(clubId);
      toast.success('Club reactivated.');
      onSaved();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not reactivate the club.'));
    }
  }

=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
  return (
    <div className="max-w-3xl space-y-6">
    <form onSubmit={handleSubmit(onSubmit)} className="card p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Club name" htmlFor="name" error={errors.name?.message} required className="sm:col-span-2">
          <TextInput id="name" invalid={!!errors.name} {...register('name')} />
        </Field>
        <Field label="Category" htmlFor="category">
          <Select id="category" {...register('category')}>
            <option value="">Select a category</option>
            {EVENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Contact email" htmlFor="contactEmail" error={errors.contactEmail?.message}>
          <TextInput id="contactEmail" type="email" {...register('contactEmail')} />
        </Field>
        <Field label="Contact phone" htmlFor="contactPhone" error={errors.contactPhone?.message}>
          <TextInput id="contactPhone" {...register('contactPhone')} />
        </Field>
        <ImageUpload
          label="Logo"
          shape="square"
          folder="logos"
          value={watch('logoUrl')}
          onChange={(url) => setValue('logoUrl', url, { shouldDirty: true })}
          error={errors.logoUrl?.message}
        />
        <ImageUpload
          label="Cover image"
          shape="wide"
          folder="covers"
          className="sm:col-span-2"
          value={watch('coverImageUrl')}
          onChange={(url) => setValue('coverImageUrl', url, { shouldDirty: true })}
          error={errors.coverImageUrl?.message}
        />
        <Field label="Description" htmlFor="description" error={errors.description?.message} className="sm:col-span-2">
          <TextArea id="description" rows={4} {...register('description')} />
        </Field>
      </div>
      <div className="mt-5 flex justify-end">
        <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
          <Save className="h-4 w-4" /> Save changes
        </Button>
      </div>
    </form>

      {/* Danger zone — coordinators deactivate a club (hides it from the public
<<<<<<< HEAD
          catalog) and can reactivate it again. A platform admin can permanently
          delete it from the admin console. */}
=======
          catalog). A platform admin can permanently delete it from the admin console. */}
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
      <div className="card border-red-200 p-6 dark:border-red-900/50">
        <h3 className="flex items-center gap-2 font-semibold text-red-700 dark:text-red-400">
          <Trash2 className="h-4 w-4" /> Danger zone
        </h3>
<<<<<<< HEAD
        {club.active ? (
          <>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Deactivating <span className="font-medium">{club.name}</span> hides it from the public
              catalog and stops new members from joining. You can reactivate it here at any time.
            </p>
            <div className="mt-4">
              <Button variant="danger" onClick={() => setConfirmDeleteOpen(true)}>
                <Trash2 className="h-4 w-4" /> Deactivate club
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              <span className="font-medium">{club.name}</span> is currently deactivated and hidden
              from the public catalog. Reactivate it to make it visible and let members join again.
            </p>
            <div className="mt-4">
              <Button variant="success" onClick={() => void handleReactivate()}>
                <RotateCcw className="h-4 w-4" /> Reactivate club
              </Button>
            </div>
          </>
        )}
=======
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Deactivating <span className="font-medium">{club.name}</span> hides it from the public
          catalog and stops new members from joining. An administrator can restore or permanently
          delete it later.
        </p>
        <div className="mt-4">
          <Button variant="danger" onClick={() => setConfirmDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" /> Deactivate club
          </Button>
        </div>
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Deactivate club?"
        message={`Deactivate "${club.name}"? It will be hidden from the public catalog and no new members can join until it is reactivated.`}
        confirmLabel="Deactivate"
        danger
      />
    </div>
  );
}

/* ------------------------------- members ------------------------------- */

function MembersTab({
  clubId,
  members,
  loading,
  onChanged,
}: {
  clubId: number;
  members: ClubMemberResponse[];
  loading: boolean;
  onChanged: () => void;
}) {
  const { user } = useAuth();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toRemove, setToRemove] = useState<ClubMemberResponse | null>(null);

  const pending = members.filter((m) => m.status === 'PENDING');
  const active = members.filter((m) => m.status === 'ACTIVE');

  async function approve(m: ClubMemberResponse) {
    setBusyId(m.id);
    try {
      await clubService.approveMember(clubId, m.id);
      toast.success(`${m.fullName} approved.`);
      onChanged();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not approve member.'));
    } finally {
      setBusyId(null);
    }
  }

  async function confirmRemove() {
    if (!toRemove) return;
    try {
      await clubService.removeMember(clubId, toRemove.id);
      toast.success('Member removed.');
      onChanged();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not remove member.'));
      throw err;
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-7 w-7 text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Pending approvals */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
          <UserCheck className="h-4 w-4 text-brand-600" /> Pending approvals
          {pending.length > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              {pending.length}
            </span>
          )}
        </h3>
        {pending.length === 0 ? (
          <p className="text-sm text-slate-400">No pending join requests.</p>
        ) : (
          <ul className="space-y-2">
            {pending.map((m) => (
              <li key={m.id} className="card flex items-center gap-3 p-4">
                <Avatar name={m.fullName} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900 dark:text-slate-100">{m.fullName}</p>
                  <p className="truncate text-xs text-slate-400">
                    {m.email} · requested {fromNow(m.joinedAt)}
                  </p>
                </div>
                <Button size="sm" loading={busyId === m.id} onClick={() => approve(m)}>
                  <Check className="h-4 w-4" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busyId === m.id}
                  onClick={() => setToRemove(m)}
                  aria-label={`Reject ${m.fullName}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Active members */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
          <Users2 className="h-4 w-4 text-brand-600" /> Members ({active.length})
        </h3>
        {active.length === 0 ? (
          <EmptyState
            icon={<Users2 className="h-6 w-6" />}
            title="No active members yet"
            description="Approved members will appear here."
          />
        ) : (
          <ul className="space-y-2">
            {active.map((m) => {
              const isCoordinator = m.clubRole === 'COORDINATOR';
              const isSelf = m.userId === user?.id;
              return (
                <li key={m.id} className="card flex items-center gap-3 p-4">
                  <Avatar name={m.fullName} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                        {m.fullName}
                      </p>
                      {isCoordinator && (
                        <Badge className="bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                          <Crown className="mr-1 inline h-3 w-3" /> Coordinator
                        </Badge>
                      )}
                      {isSelf && <span className="text-xs text-slate-400">(you)</span>}
                    </div>
                    <p className="truncate text-xs text-slate-400">
                      {m.email} · joined {formatDate(m.joinedAt)}
                    </p>
                  </div>
                  {!isSelf && !isCoordinator && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setToRemove(m)}
                      aria-label={`Remove ${m.fullName}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={!!toRemove}
        onClose={() => setToRemove(null)}
        onConfirm={confirmRemove}
        title={toRemove?.status === 'PENDING' ? 'Reject request?' : 'Remove member?'}
        message={
          toRemove?.status === 'PENDING'
            ? `Reject ${toRemove?.fullName ?? 'this person'}'s request to join? (${
                MEMBERSHIP_STATUS_LABELS.PENDING
              })`
            : `Remove ${toRemove?.fullName ?? 'this member'} from the club?`
        }
        confirmLabel={toRemove?.status === 'PENDING' ? 'Reject' : 'Remove'}
        danger
      />
    </div>
  );
}

<<<<<<< HEAD
/* ------------------------------ volunteers ----------------------------- */

function ClubVolunteersTab({ clubId, clubName }: { clubId: number; clubName: string }) {
  const [addOpen, setAddOpen] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toRemove, setToRemove] = useState<VolunteerResponse | null>(null);

  const { data, loading, error, reload } = useQuery(
    () => volunteerService.forClub(clubId),
    [clubId],
  );

  const volunteers = data ?? [];
  const pending = volunteers.filter((v) => v.status === 'PENDING');
  // Active + suspended make up the current roster; rejected (INACTIVE) drop off.
  const roster = volunteers.filter((v) => v.status === 'ACTIVE' || v.status === 'SUSPENDED');

  async function approve(v: VolunteerResponse) {
    setBusyId(v.id);
    try {
      await volunteerService.approve(v.id);
      toast.success(`${v.fullName} approved.`);
      reload();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not approve volunteer.'));
    } finally {
      setBusyId(null);
    }
  }

  async function confirmRemove() {
    if (!toRemove) return;
    try {
      await volunteerService.reject(toRemove.id);
      toast.success(`${toRemove.fullName} removed from volunteers.`);
      reload();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not remove volunteer.'));
      throw err;
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-7 w-7 text-brand-600" />
      </div>
    );
  }
  if (error) {
    return <ErrorState message={error} onRetry={reload} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          Volunteers are added by coordinators and admins. Add a registered student by their account
          email — they can then reach the volunteer workspace and be assigned to this club's events.
        </p>
        <Button onClick={() => setAddOpen(true)}>
          <UserPlus className="h-4 w-4" /> Add volunteer
        </Button>
      </div>

      {/* Pending review (legacy applications; new volunteers are added as active) */}
      {pending.length > 0 && (
        <section>
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
            <UserCheck className="h-4 w-4 text-brand-600" /> Pending approval
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              {pending.length}
            </span>
          </h3>
          <ul className="space-y-2">
            {pending.map((v) => (
              <li key={v.id} className="card flex items-center gap-3 p-4">
                <Avatar name={v.fullName} src={v.profilePhotoUrl} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900 dark:text-slate-100">{v.fullName}</p>
                  <p className="truncate text-xs text-slate-400">{v.email}</p>
                </div>
                <Button size="sm" loading={busyId === v.id} onClick={() => approve(v)}>
                  <Check className="h-4 w-4" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busyId === v.id}
                  onClick={() => setToRemove(v)}
                  aria-label={`Reject ${v.fullName}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Current roster */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
          <HandHeart className="h-4 w-4 text-brand-600" /> Volunteers ({roster.length})
        </h3>
        {roster.length === 0 ? (
          <EmptyState
            icon={<HandHeart className="h-6 w-6" />}
            title="No volunteers yet"
            description="Add a registered student by email to build your volunteer team."
            action={
              <Button onClick={() => setAddOpen(true)}>
                <UserPlus className="h-4 w-4" /> Add the first volunteer
              </Button>
            }
          />
        ) : (
          <ul className="space-y-2">
            {roster.map((v) => (
              <li key={v.id} className="card flex items-center gap-3 p-4">
                <Avatar name={v.fullName} src={v.profilePhotoUrl} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                      {v.fullName}
                    </p>
                    <Badge className={VOLUNTEER_STATUS_STYLES[v.status]}>
                      {VOLUNTEER_STATUS_LABELS[v.status]}
                    </Badge>
                  </div>
                  <p className="truncate text-xs text-slate-400">
                    {v.email}
                    {v.skills ? ` · ${v.skills}` : ''} · added {formatDate(v.createdAt)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setToRemove(v)}
                  aria-label={`Remove ${v.fullName}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AddVolunteerModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        clubId={clubId}
        clubName={clubName}
        onAdded={() => {
          setAddOpen(false);
          reload();
        }}
      />

      <ConfirmDialog
        open={!!toRemove}
        onClose={() => setToRemove(null)}
        onConfirm={confirmRemove}
        title={toRemove?.status === 'PENDING' ? 'Reject volunteer?' : 'Remove volunteer?'}
        message={
          toRemove?.status === 'PENDING'
            ? `Reject ${toRemove?.fullName ?? 'this applicant'}'s volunteer request?`
            : `Remove ${toRemove?.fullName ?? 'this volunteer'} from ${clubName}? They will no longer be assignable to this club's events.`
        }
        confirmLabel={toRemove?.status === 'PENDING' ? 'Reject' : 'Remove'}
        danger
      />
    </div>
  );
}

=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
/* ---------------------------- announcements ---------------------------- */

function AnnouncementsTab({ clubId, clubName }: { clubId: number; clubName: string }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [toDelete, setToDelete] = useState<AnnouncementResponse | null>(null);

  const { data, loading, error, reload } = useQuery(
    () => announcementService.forClub(clubId),
    [clubId],
  );

  const announcements = useMemo(
    () =>
      [...(data ?? [])].sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }),
    [data],
  );

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await announcementService.remove(toDelete.id);
      toast.success('Announcement deleted.');
      reload();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete announcement.'));
      throw err;
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> New announcement
        </Button>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner className="h-6 w-6 text-brand-600" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="h-6 w-6" />}
          title="No announcements yet"
          description="Post an update to keep your club members in the loop."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> Post the first one
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {announcements.map((a) => (
            <li key={a.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {a.pinned && <Pin className="h-4 w-4 text-brand-600" />}
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">{a.title}</h4>
                  </div>
                  <p className="mt-1 whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">
                    {a.content}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    {a.authorName} · {fromNow(a.createdAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setToDelete(a)}
                  aria-label="Delete announcement"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <CreateAnnouncementModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        clubId={clubId}
        clubName={clubName}
        onCreated={() => {
          setCreateOpen(false);
          reload();
        }}
      />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete announcement?"
        message="This removes the announcement for all club members."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

function CreateAnnouncementModal({
  open,
  onClose,
  clubId,
  clubName,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  clubId: number;
  clubName: string;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pinned, setPinned] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (!title.trim() || !content.trim()) {
      setErr('Title and content are required.');
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await announcementService.create({
        scope: 'CLUB',
        clubId,
        title: title.trim(),
        content: content.trim(),
        pinned,
      });
      toast.success('Announcement posted.');
      setTitle('');
      setContent('');
      setPinned(false);
      onCreated();
    } catch (e) {
      setErr(errorMessage(e, 'Could not post announcement.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={busy ? () => undefined : onClose}
      title={`New announcement · ${clubName}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} loading={busy}>
            Post announcement
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Title" htmlFor="ann-title" required>
          <TextInput
            id="ann-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Weekly meetup moved to Friday"
            autoFocus
          />
        </Field>
        <Field label="Content" htmlFor="ann-content" required>
          <TextArea
            id="ann-content"
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share the details…"
          />
        </Field>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
          />
          <span className="text-sm text-slate-700 dark:text-slate-200">Pin to the top</span>
        </label>
        {err && <p className="field-error">{err}</p>}
      </div>
    </Modal>
  );
}
