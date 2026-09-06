import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Mail, Phone, Settings, UserPlus, Users2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
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
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  ErrorState,
  FullPageLoader,
} from '@/components/ui';
import type { ClubMemberResponse } from '@/types';

type Tab = 'events' | 'announcements' | 'gallery' | 'members';

export default function ClubDetailPage() {
  const { id } = useParams();
  const clubId = Number(id);
  const { isAuthenticated, hasRole } = useAuth();
  const [tab, setTab] = useState<Tab>('events');
  const [working, setWorking] = useState(false);

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

  const canManage =
    hasRole('CLUB_COORDINATOR') &&
    (myMembership?.clubRole === 'COORDINATOR' || club?.createdById === myMembership?.userId);

  // Media contribution: a platform admin or any active member of the club.
  // Deleting any item is limited to admins and this club's coordinators.
  const canContributeMedia = hasRole('ADMIN') || myMembership?.status === 'ACTIVE';
  const canManageMedia = hasRole('ADMIN') || canManage;

  if (loading) return <FullPageLoader />;
  if (error || !club) {
    return (
      <PageContainer>
        <ErrorState message={error ?? 'Club not found.'} onRetry={reloadClub} />
      </PageContainer>
    );
  }

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

  const activeMembers = (members ?? []).filter((m) => m.status === 'ACTIVE');

  const TABS: { key: Tab; label: string }[] = [
    { key: 'events', label: `Events (${events?.totalElements ?? 0})` },
    { key: 'announcements', label: 'Announcements' },
    { key: 'gallery', label: 'Gallery' },
    { key: 'members', label: `Members (${club.memberCount})` },
  ];

  return (
    <div>
      {/* Cover */}
      <div className="relative h-40 w-full overflow-hidden bg-gradient-to-r from-brand-500 to-indigo-700 sm:h-52">
        {club.coverImageUrl && (
          <img src={club.coverImageUrl} alt="" className="h-full w-full object-cover" />
        )}
      </div>

      <PageContainer>
        <div className="-mt-16 flex flex-col gap-4 sm:flex-row sm:items-end">
          <Avatar
            name={club.name}
            src={club.logoUrl}
            size="lg"
            className="h-24 w-24 text-2xl ring-4 ring-white dark:ring-slate-950"
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                {club.name}
              </h1>
              {club.category && <Badge>{club.category}</Badge>}
              {!club.active && (
                <Badge className="bg-slate-200 text-slate-600">Inactive</Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {club.memberCount} members · {club.eventCount} events
              {club.followerCount > 0 && ` · ${club.followerCount} follower${club.followerCount === 1 ? '' : 's'}`}
            </p>
          </div>

          <div className="flex gap-2">
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
          </div>
        </div>

        {club.description && (
          <p className="mt-5 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {club.description}
          </p>
        )}

        {(club.contactEmail || club.contactPhone) && (
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
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

        {/* Tabs */}
        <div className="mb-6 mt-8 flex gap-1 border-b border-slate-200 dark:border-slate-800">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                '-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition',
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

        {tab === 'members' &&
          (activeMembers.length > 0 ? (
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
            <EmptyState
              icon={<Users2 className="h-6 w-6" />}
              title="No members listed"
            />
          ))}
      </PageContainer>
    </div>
  );
}
