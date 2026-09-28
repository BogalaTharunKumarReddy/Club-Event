import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  CalendarDays,
  Heart,
  Mail,
  Phone,
  Settings,
  Trash2,
  UserPlus,
  Users2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  adminService,
  announcementService,
  clubService,
  eventService,
} from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { MEMBERSHIP_STATUS_LABELS } from '@/lib/constants';
import { cn, errorMessage } from '@/lib/utils';
import { PageContainer } from '@/components/layout/RootLayout';
import { EventCard } from '@/components/domain/EventCard';
import { FollowClubButton } from '@/components/domain/FollowClubButton';
import { AnnouncementList } from '@/components/domain/AnnouncementList';
import { MediaGallery } from '@/components/domain/MediaGallery';
import { AddVolunteerModal } from '@/components/domain/AddVolunteerModal';
import {
  Avatar,
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  FullPageLoader,
} from '@/components/ui';
import type { ClubMemberResponse } from '@/types';

type Tab = 'events' | 'announcements' | 'gallery' | 'members';

export default function ClubDetailPage() {
  const { id } = useParams();
  const clubId = Number(id);
  const navigate = useNavigate();
  const { isAuthenticated, hasRole } = useAuth();
  const [tab, setTab] = useState<Tab>('events');
  const [working, setWorking] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addVolunteerOpen, setAddVolunteerOpen] = useState(false);

  const {
    data: club,
    loading,
    error,
    reload: reloadClub,
  } = useQuery(() => clubService.getById(clubId), [clubId]);

  const { data: events } = useQuery(
    () => eventService.search({ clubId, size: 24 }),
    [clubId],
  );
  const { data: announcements } = useQuery(
    () => announcementService.forClub(clubId).catch(() => []),
    [clubId],
  );
  const { data: members } = useQuery<ClubMemberResponse[]>(
    () => clubService.members(clubId).catch(() => []),
    [clubId],
  );
  const { data: myMemberships, reload: reloadMemberships } = useQuery<ClubMemberResponse[]>(
    () => (isAuthenticated ? clubService.myMemberships().catch(() => []) : Promise.resolve([])),
    [clubId, isAuthenticated],
  );

  const myMembership = useMemo(
    () =>
      myMemberships?.find((m) => m.clubId === clubId && m.status !== 'LEFT') ?? null,
    [myMemberships, clubId],
  );

  const isAdmin = hasRole('ADMIN');
  const canManage =
    hasRole('CLUB_COORDINATOR') &&
    (myMembership?.clubRole === 'COORDINATOR' || club?.createdById === myMembership?.userId);

  // Media contribution: a platform admin or any active member of the club.
  // Deleting any item is limited to admins and this club's coordinators.
  const canContributeMedia = hasRole('ADMIN') || myMembership?.status === 'ACTIVE';
  const canManageMedia = hasRole('ADMIN') || canManage;

  // Adding a volunteer is open to any active member of the club (coordinators
  // included) and to platform admins — this mirrors the backend's
  // requireAdminOrActiveMember check. Coordinators also manage the full roster
  // from the Manage console; this surfaces the same "add" action to members.
  const canAddVolunteer = hasRole('ADMIN') || myMembership?.status === 'ACTIVE';

  if (loading) return <FullPageLoader />;
  if (error || !club) {
    return (
      <PageContainer>
        <ErrorState message={error ?? 'Club not found.'} onRetry={reloadClub} />
      </PageContainer>
    );
  }

  // Admins can permanently delete any club; a managing coordinator can retire
  // (deactivate) a club that is still active. The backend enforces both.
  const canHardDelete = isAdmin;
  const canDeactivate = !isAdmin && canManage && club.active;
  const canDelete = canHardDelete || canDeactivate;

  async function handleJoin() {
    setWorking(true);
    try {
      const m = await clubService.join(clubId);
      toast.success(
        m.status === 'ACTIVE' ? 'You joined the club!' : 'Request sent — awaiting approval.',
      );
      reloadMemberships();
      reloadClub();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not join.'));
    } finally {
      setWorking(false);
    }
  }

  async function handleLeave() {
    setWorking(true);
    try {
      await clubService.leave(clubId);
      toast.success('You left the club.');
      reloadMemberships();
      reloadClub();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not leave.'));
    } finally {
      setWorking(false);
    }
  }

  // Errors are surfaced by the ConfirmDialog (it awaits this promise), so let
  // them propagate rather than swallowing them here.
  async function handleDelete() {
    if (isAdmin) {
      await adminService.deleteClub(clubId);
      toast.success('Club deleted.');
      navigate('/clubs');
    } else {
      await clubService.remove(clubId);
      toast.success('Club deactivated.');
      reloadClub();
    }
  }

  const activeMembers = (members ?? []).filter((m) => m.status === 'ACTIVE');
  const hasContact = Boolean(club.contactEmail || club.contactPhone);

  const TABS: { key: Tab; label: string }[] = [
    { key: 'events', label: `Events (${events?.totalElements ?? 0})` },
    { key: 'announcements', label: 'Announcements' },
    { key: 'gallery', label: 'Gallery' },
    { key: 'members', label: `Members (${club.memberCount})` },
  ];

  return (
    <div>
      {/* === Club header (redesigned 2026-09-24) ===================================
          The cover image and the logo live on SEPARATE layers. The logo sits in its
          own solid, framed tile, so a transparent PNG logo can never blend into /
          "mix with" the cover image behind it (the old overlapping circle caused that).
         =========================================================================== */}
      <div className="relative h-52 w-full overflow-hidden sm:h-64">
        {club.coverImageUrl ? (
          <img
            src={club.coverImageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500 via-indigo-600 to-indigo-800" />
        )}
        {/* Darkening scrim keeps the card edge + any text legible over any cover image. */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/25 to-transparent" />
      </div>

      <PageContainer>
        {/* Identity card lifts above the cover (z-10 + solid card bg + brand accent). */}
        <div className="card relative z-10 -mt-20 flex flex-col gap-5 rounded-2xl border-t-4 border-brand-500 p-5 shadow-xl sm:-mt-24 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
          {/* LOGO TILE — its own opaque, framed square. `object-contain` shows a
              transparent/rectangular logo cleanly without distortion; the solid
              white (or dark) background guarantees it never mixes with the cover. */}
          <div className="shrink-0 self-start sm:self-auto">
            {club.logoUrl ? (
              <img
                src={club.logoUrl}
                alt={`${club.name} logo`}
                className="h-28 w-28 rounded-2xl border-4 border-white bg-white object-contain shadow-lg ring-1 ring-slate-200 dark:border-slate-900 dark:bg-slate-900 dark:ring-slate-700"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-brand-500 to-indigo-700 text-3xl font-bold text-white shadow-lg dark:border-slate-900">
                {club.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="break-words text-2xl font-bold text-slate-900 dark:text-slate-50">
                {club.name}
              </h1>
              {club.category && <Badge>{club.category}</Badge>}
              {!club.active && (
                <Badge className="bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  Inactive
                </Badge>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Users2 className="h-4 w-4" /> {club.memberCount} members
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" /> {club.eventCount} events
              </span>
              {club.followerCount > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Heart className="h-4 w-4" /> {club.followerCount} follower
                  {club.followerCount === 1 ? '' : 's'}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:shrink-0">
            <FollowClubButton
              clubId={clubId}
              initialFollowing={club.following}
              variant="button"
              onChange={reloadClub}
            />
            {canManage && (
              <Link to={`/app/manage/clubs/${clubId}`} className="btn-secondary">
                <Settings className="h-4 w-4" /> Manage
              </Link>
            )}
            {isAuthenticated && !canManage && (
              myMembership ? (
                myMembership.status === 'PENDING' ? (
                  <Button variant="secondary" disabled>
                    {MEMBERSHIP_STATUS_LABELS.PENDING}
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={handleLeave} loading={working}>
                    Leave club
                  </Button>
                )
              ) : (
                <Button onClick={handleJoin} loading={working}>
                  <UserPlus className="h-4 w-4" /> Join club
                </Button>
              )
            )}
            {canDelete && (
              <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4" /> {isAdmin ? 'Delete' : 'Deactivate'}
              </Button>
            )}
          </div>
        </div>

        {/* About + contact */}
        {(club.description || hasContact) && (
          <div className="card mt-5 p-5 sm:p-6">
            {club.description && (
              <p className="max-w-3xl whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {club.description}
              </p>
            )}
            {hasContact && (
              <div
                className={cn(
                  'flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400',
                  club.description && 'mt-4 border-t border-slate-100 pt-4 dark:border-slate-800',
                )}
              >
                {club.contactEmail && (
                  <a
                    href={`mailto:${club.contactEmail}`}
                    className="flex items-center gap-1.5 hover:text-brand-600"
                  >
                    <Mail className="h-4 w-4" /> {club.contactEmail}
                  </a>
                )}
                {club.contactPhone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4" /> {club.contactPhone}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tabs — scrollable on narrow screens so they never force page-wide horizontal scroll */}
        <div className="no-scrollbar mb-6 mt-8 flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                '-mb-px shrink-0 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition',
                tab === t.key
                  ? 'border-brand-600 text-brand-700 dark:text-brand-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'events' &&
          (events && events.content.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {events.content.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          ) : (
            <EmptyState title="No events yet" description="This club hasn't posted any events." />
          ))}

        {tab === 'announcements' && <AnnouncementList announcements={announcements ?? []} />}

        {tab === 'gallery' && (
          <MediaGallery
            clubId={clubId}
            canContribute={canContributeMedia}
            canManageAll={canManageMedia}
          />
        )}

        {tab === 'members' && (
          <div className="space-y-4">
            {canAddVolunteer && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                  Members and coordinators can add a registered student as a volunteer for this
                  club. An administrator manages the volunteer roster.
                </p>
                <Button onClick={() => setAddVolunteerOpen(true)}>
                  <UserPlus className="h-4 w-4" /> Add volunteer
                </Button>
              </div>
            )}
            {activeMembers.length > 0 ? (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {activeMembers.map((m) => (
                  <li key={m.id} className="card flex items-center gap-3 p-4">
                    <Avatar name={m.fullName} size="md" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                        {m.fullName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {m.clubRole === 'COORDINATOR' ? 'Coordinator' : 'Member'}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={<Users2 className="h-6 w-6" />} title="No members listed" />
            )}
          </div>
        )}
      </PageContainer>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        danger
        title={isAdmin ? 'Delete club' : 'Deactivate club'}
        message={
          isAdmin
            ? `Permanently delete "${club.name}" along with all of its events, announcements, media, members and related records. This cannot be undone.`
            : `Deactivate "${club.name}"? It will be hidden and stop accepting new members and events. An administrator can reactivate it later.`
        }
        confirmLabel={isAdmin ? 'Delete club' : 'Deactivate'}
      />

      <AddVolunteerModal
        open={addVolunteerOpen}
        onClose={() => setAddVolunteerOpen(false)}
        clubId={clubId}
        clubName={club.name}
        onAdded={() => setAddVolunteerOpen(false)}
      />
    </div>
  );
}
