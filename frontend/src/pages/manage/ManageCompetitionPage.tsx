import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Gavel,
  ListOrdered,
  Plus,
  Save,
  Trash2,
  Trophy,
  UserPlus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { competitionService, registrationService, teamService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { COMPETITION_STATUS_LABELS } from '@/lib/constants';
import { cn, errorMessage, formatDateTime } from '@/lib/utils';
import { PageContainer } from '@/components/layout/RootLayout';
import {
  Avatar,
  Badge,
  Button,
  CompetitionStatusBadge,
  ConfirmDialog,
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
import { Leaderboard } from '@/components/domain/Leaderboard';
import type {
  CompetitionResponse,
  CompetitionRoundRequest,
  CompetitionRoundResponse,
  CompetitionStatus,
  JudgeResponse,
  ScoreResponse,
} from '@/types';

type Tab = 'rounds' | 'judges' | 'scoring' | 'leaderboard';

const TABS: Array<{ key: Tab; label: string; icon: React.ReactNode }> = [
  { key: 'rounds', label: 'Rounds', icon: <ListOrdered className="h-4 w-4" /> },
  { key: 'judges', label: 'Judges', icon: <Gavel className="h-4 w-4" /> },
  { key: 'scoring', label: 'Scoring', icon: <Save className="h-4 w-4" /> },
  { key: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="h-4 w-4" /> },
];

const STATUS_CHOICES: CompetitionStatus[] = ['DRAFT', 'ONGOING', 'COMPLETED', 'CANCELLED'];

export default function ManageCompetitionPage() {
  const { id } = useParams();
  const competitionId = Number(id);
  const [tab, setTab] = useState<Tab>('rounds');

  const { data: competition, loading, error, reload } = useQuery(
    () => competitionService.getById(competitionId),
    [competitionId],
  );
  const { data: judges, reload: reloadJudges } = useQuery(
    () => competitionService.judges(competitionId),
    [competitionId],
  );

  const [busy, setBusy] = useState(false);

  if (loading) return <FullPageLoader />;
  if (error || !competition) {
    return (
      <PageContainer>
        <ErrorState message={error ?? 'Competition not found.'} onRetry={reload} />
      </PageContainer>
    );
  }

  async function changeStatus(status: CompetitionStatus) {
    setBusy(true);
    try {
      await competitionService.updateStatus(competitionId, { status });
      toast.success(`Status set to ${COMPETITION_STATUS_LABELS[status]}.`);
      reload();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update status.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageContainer>
      <Link
        to={`/app/manage/events/${competition.eventId}`}
        className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" /> {competition.eventTitle}
      </Link>
      <PageHeader
        title={competition.title}
        description={
          <span className="flex items-center gap-2">
            <CompetitionStatusBadge status={competition.status} /> ·{' '}
            {competition.teamBased ? 'Team-based' : 'Individual'}
          </span>
        }
        actions={
          <div className="w-52">
            <Select
              aria-label="Change status"
              value=""
              disabled={busy}
              onChange={(e) => {
                const v = e.target.value as CompetitionStatus;
                if (v) void changeStatus(v);
              }}
            >
              <option value="">Change status…</option>
              {STATUS_CHOICES.filter((s) => s !== competition.status).map((s) => (
                <option key={s} value={s}>
                  {COMPETITION_STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </div>
        }
      />

      {/* Tabs */}
      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-700">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'relative -mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition',
              tab === t.key
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200',
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'rounds' && <RoundsTab competitionId={competitionId} />}
        {tab === 'judges' && (
          <JudgesTab competitionId={competitionId} judges={judges ?? []} onChanged={reloadJudges} />
        )}
        {tab === 'scoring' && (
          <ScoringTab competition={competition} judges={judges ?? []} onJudgesChanged={reloadJudges} />
        )}
        {tab === 'leaderboard' && (
          <div className="card p-6">
            <Leaderboard competitionId={competitionId} />
          </div>
        )}
      </div>
    </PageContainer>
  );
}

/* -------------------------------- rounds ------------------------------- */

function RoundsTab({ competitionId }: { competitionId: number }) {
  const { data, loading, error, reload } = useQuery(
    () => competitionService.rounds(competitionId),
    [competitionId],
  );
  const [addOpen, setAddOpen] = useState(false);
  const [toDelete, setToDelete] = useState<CompetitionRoundResponse | null>(null);

  const rounds = useMemo(
    () => [...(data ?? [])].sort((a, b) => a.roundNumber - b.roundNumber),
    [data],
  );

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await competitionService.removeRound(toDelete.id);
      toast.success('Round removed.');
      reload();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not remove round.'));
      throw err;
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" /> Add round
        </Button>
      </div>

      {loading ? (
        <FullPageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : rounds.length === 0 ? (
        <EmptyState
          icon={<ListOrdered className="h-6 w-6" />}
          title="No rounds yet"
          description="Add rounds so judges have something to score."
          action={
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" /> Add the first round
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {rounds.map((r) => (
            <li key={r.id} className="card flex items-start justify-between gap-3 p-5">
              <div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                    Round {r.roundNumber}
                  </Badge>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">{r.name}</h4>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Max score: {r.maxScore}
                  {r.scheduledAt ? ` · ${formatDateTime(r.scheduledAt)}` : ''}
                </p>
                {r.description && (
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{r.description}</p>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setToDelete(r)} aria-label="Remove round">
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <AddRoundModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        competitionId={competitionId}
        nextRoundNumber={rounds.length + 1}
        onAdded={() => {
          setAddOpen(false);
          reload();
        }}
      />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Remove round?"
        message="Removing a round also removes its scores. This can't be undone."
        confirmLabel="Remove round"
        danger
      />
    </div>
  );
}

function AddRoundModal({
  open,
  onClose,
  competitionId,
  nextRoundNumber,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  competitionId: number;
  nextRoundNumber: number;
  onAdded: () => void;
}) {
  const [name, setName] = useState('');
  const [roundNumber, setRoundNumber] = useState(String(nextRoundNumber));
  const [maxScore, setMaxScore] = useState('100');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (!name.trim()) {
      setErr('Round name is required.');
      return;
    }
    const max = Number(maxScore);
    if (!Number.isFinite(max) || max <= 0) {
      setErr('Max score must be greater than 0.');
      return;
    }
    setBusy(true);
    setErr(null);
    const payload: CompetitionRoundRequest = {
      name: name.trim(),
      roundNumber: Number(roundNumber) || nextRoundNumber,
      maxScore: max,
      description: description || undefined,
      scheduledAt: scheduledAt || undefined,
    };
    try {
      await competitionService.addRound(competitionId, payload);
      toast.success('Round added.');
      setName('');
      setDescription('');
      setScheduledAt('');
      onAdded();
    } catch (e) {
      setErr(errorMessage(e, 'Could not add round.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={busy ? () => undefined : onClose}
      title="Add round"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} loading={busy}>
            Add round
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Round name" htmlFor="round-name" required>
          <TextInput
            id="round-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Preliminary"
            autoFocus
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Round number" htmlFor="round-number">
            <TextInput
              id="round-number"
              type="number"
              min={1}
              value={roundNumber}
              onChange={(e) => setRoundNumber(e.target.value)}
            />
          </Field>
          <Field label="Max score" htmlFor="round-max" required>
            <TextInput
              id="round-max"
              type="number"
              min={1}
              value={maxScore}
              onChange={(e) => setMaxScore(e.target.value)}
            />
          </Field>
        </div>
        <Field label="Scheduled at" htmlFor="round-time">
          <TextInput
            id="round-time"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
        </Field>
        <Field label="Description" htmlFor="round-desc">
          <TextArea
            id="round-desc"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        {err && <p className="field-error">{err}</p>}
      </div>
    </Modal>
  );
}

/* -------------------------------- judges ------------------------------- */

function JudgesTab({
  competitionId,
  judges,
  onChanged,
}: {
  competitionId: number;
  judges: JudgeResponse[];
  onChanged: () => void;
}) {
  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [toRemove, setToRemove] = useState<JudgeResponse | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setAdding(true);
    try {
      await competitionService.addJudge(competitionId, { email: email.trim() });
      toast.success('Judge added.');
      setEmail('');
      onChanged();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not add judge.'));
    } finally {
      setAdding(false);
    }
  }

  async function confirmRemove() {
    if (!toRemove) return;
    try {
      await competitionService.removeJudge(competitionId, toRemove.id);
      toast.success('Judge removed.');
      onChanged();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not remove judge.'));
      throw err;
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <form onSubmit={add} className="card p-6">
          <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
            <UserPlus className="h-4 w-4 text-brand-600" /> Add judge
          </h3>
          <div className="mt-4 space-y-3">
            <Field label="Judge email" htmlFor="judge-email">
              <TextInput
                id="judge-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="judge@college.edu"
              />
            </Field>
            <Button type="submit" fullWidth loading={adding}>
              Add judge
            </Button>
            <p className="text-xs text-slate-400">
              They must have a CampusConnect account. Only judges can enter scores.
            </p>
          </div>
        </form>
      </div>

      <div className="lg:col-span-2">
        {judges.length === 0 ? (
          <EmptyState
            icon={<Gavel className="h-6 w-6" />}
            title="No judges yet"
            description="Add judges so scores can be entered once the competition is ongoing."
          />
        ) : (
          <ul className="space-y-2">
            {judges.map((j) => (
              <li key={j.id} className="card flex items-center gap-3 p-4">
                <Avatar name={j.fullName} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                    {j.fullName}
                  </p>
                  <p className="truncate text-xs text-slate-400">{j.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setToRemove(j)}
                  aria-label={`Remove ${j.fullName}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={!!toRemove}
        onClose={() => setToRemove(null)}
        onConfirm={confirmRemove}
        title="Remove judge?"
        message={`Remove ${toRemove?.fullName ?? 'this judge'}? Their submitted scores remain.`}
        confirmLabel="Remove"
        danger
      />
    </div>
  );
}

/* ------------------------------- scoring ------------------------------- */

interface Participant {
  key: string;
  targetId: number;
  name: string;
  isTeam: boolean;
}

function ScoringTab({
  competition,
  judges,
  onJudgesChanged,
}: {
  competition: CompetitionResponse;
  judges: JudgeResponse[];
  onJudgesChanged: () => void;
}) {
  const { user } = useAuth();
  const [addingSelf, setAddingSelf] = useState(false);

  const { data: rounds, loading: roundsLoading } = useQuery(
    () => competitionService.rounds(competition.id),
    [competition.id],
  );
  const sortedRounds = useMemo(
    () => [...(rounds ?? [])].sort((a, b) => a.roundNumber - b.roundNumber),
    [rounds],
  );
  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);
  const activeRoundId = selectedRoundId ?? sortedRounds[0]?.id ?? null;
  const activeRound = sortedRounds.find((r) => r.id === activeRoundId) ?? null;

  const { data: participants, loading: participantsLoading } = useQuery<Participant[]>(async () => {
    if (competition.teamBased) {
      const teams = await teamService.forEvent(competition.eventId);
      return teams.map((t) => ({ key: `team-${t.id}`, targetId: t.id, name: t.name, isTeam: true }));
    }
    const page = await registrationService.forEvent(competition.eventId, 0, 200);
    const seen = new Set<number>();
    const out: Participant[] = [];
    for (const r of page.content) {
      if (r.status === 'CANCELLED' || seen.has(r.userId)) continue;
      seen.add(r.userId);
      out.push({ key: `user-${r.userId}`, targetId: r.userId, name: r.userName, isTeam: false });
    }
    return out;
  }, [competition.eventId, competition.teamBased]);

  const { data: scores, reload: reloadScores } = useQuery(
    () => (activeRoundId ? competitionService.roundScores(activeRoundId) : Promise.resolve([])),
    [activeRoundId],
  );

  const myJudge = judges.find((j) => j.userId === user?.id) ?? null;
  const isOngoing = competition.status === 'ONGOING';

  async function addSelfAsJudge() {
    if (!user?.email) return;
    setAddingSelf(true);
    try {
      await competitionService.addJudge(competition.id, { email: user.email });
      toast.success('You are now a judge on this competition.');
      onJudgesChanged();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not add you as a judge.'));
    } finally {
      setAddingSelf(false);
    }
  }

  async function saveScore(participant: Participant, points: number, remarks: string) {
    if (!activeRoundId) return;
    await competitionService.submitScore({
      roundId: activeRoundId,
      teamId: participant.isTeam ? participant.targetId : undefined,
      participantId: participant.isTeam ? undefined : participant.targetId,
      points,
      remarks: remarks || undefined,
    });
    toast.success(`Saved score for ${participant.name}.`);
    reloadScores();
  }

  if (roundsLoading) return <FullPageLoader />;

  if (sortedRounds.length === 0) {
    return (
      <EmptyState
        icon={<ListOrdered className="h-6 w-6" />}
        title="Add a round first"
        description="Scores are entered per round. Create at least one round to begin scoring."
      />
    );
  }

  const myScoresByTarget = new Map<number, ScoreResponse>();
  for (const s of scores ?? []) {
    if (myJudge && s.judgeId === myJudge.id) {
      const target = s.teamId ?? s.participantId;
      if (target != null) myScoresByTarget.set(target, s);
    }
  }

  return (
    <div className="space-y-5">
      {/* Round selector */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-64">
          <Select
            aria-label="Select round"
            value={activeRoundId ?? ''}
            onChange={(e) => setSelectedRoundId(Number(e.target.value))}
          >
            {sortedRounds.map((r) => (
              <option key={r.id} value={r.id}>
                Round {r.roundNumber}: {r.name} (max {r.maxScore})
              </option>
            ))}
          </Select>
        </div>
        {activeRound && (
          <span className="text-sm text-slate-400">Max score {activeRound.maxScore}</span>
        )}
      </div>

      {/* Gating banners */}
      {!isOngoing && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Scoring is only open while the competition is <strong>Ongoing</strong>. Change the status
            above to start scoring.
          </span>
        </div>
      )}

      {isOngoing && !myJudge && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <Gavel className="h-4 w-4 shrink-0 text-brand-600" />
          <span className="mr-auto">
            Only assigned judges can enter scores. Add yourself as a judge to score this competition.
          </span>
          <Button size="sm" loading={addingSelf} onClick={addSelfAsJudge}>
            <UserPlus className="h-4 w-4" /> Add me as a judge
          </Button>
        </div>
      )}

      {/* Scoring grid */}
      {isOngoing && myJudge && activeRound && (
        <div>
          {participantsLoading ? (
            <FullPageLoader />
          ) : !participants || participants.length === 0 ? (
            <EmptyState
              icon={<Trophy className="h-6 w-6" />}
              title={competition.teamBased ? 'No teams yet' : 'No participants yet'}
              description={
                competition.teamBased
                  ? 'Teams that register for the event will appear here.'
                  : 'People who register for the event will appear here.'
              }
            />
          ) : (
            <ul className="space-y-2">
              {participants.map((p) => {
                const existing = myScoresByTarget.get(p.targetId);
                return (
                  <ScoreRow
                    key={`${p.key}-${existing?.id ?? 'new'}-${existing?.points ?? ''}`}
                    participant={p}
                    maxScore={activeRound.maxScore}
                    initialPoints={existing ? String(existing.points) : ''}
                    initialRemarks={existing?.remarks ?? ''}
                    onSave={saveScore}
                  />
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* All submitted scores for this round (transparency) */}
      {activeRound && (scores?.length ?? 0) > 0 && (
        <div className="card p-5">
          <h4 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">
            Submitted scores · Round {activeRound.roundNumber}
          </h4>
          <ul className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
            {(scores ?? []).map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-2">
                <span className="text-slate-700 dark:text-slate-200">
                  {s.teamName ?? s.participantName ?? '—'}
                </span>
                <span className="text-xs text-slate-400">by {s.judgeName}</span>
                <span className="font-semibold text-brand-600 dark:text-brand-400">{s.points}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ScoreRow({
  participant,
  maxScore,
  initialPoints,
  initialRemarks,
  onSave,
}: {
  participant: Participant;
  maxScore: number;
  initialPoints: string;
  initialRemarks: string;
  onSave: (participant: Participant, points: number, remarks: string) => Promise<void>;
}) {
  const [points, setPoints] = useState(initialPoints);
  const [remarks, setRemarks] = useState(initialRemarks);
  const [busy, setBusy] = useState(false);

  async function save() {
    const value = Number(points);
    if (!Number.isFinite(value) || value < 0) {
      toast.error('Enter a valid score.');
      return;
    }
    if (value > maxScore) {
      toast.error(`Score cannot exceed the round maximum of ${maxScore}.`);
      return;
    }
    setBusy(true);
    try {
      await onSave(participant, value, remarks);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save score.'));
    } finally {
      setBusy(false);
    }
  }

  const saved = initialPoints !== '';

  return (
    <li className="card flex flex-wrap items-center gap-3 p-4">
      <Avatar name={participant.name} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-slate-900 dark:text-slate-100">{participant.name}</p>
        {saved && <p className="text-xs text-green-600 dark:text-green-400">Scored</p>}
      </div>
      <div className="w-24">
        <TextInput
          type="number"
          min={0}
          max={maxScore}
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          placeholder="Points"
          aria-label={`Points for ${participant.name}`}
        />
      </div>
      <div className="w-48">
        <TextInput
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Remarks (optional)"
          aria-label={`Remarks for ${participant.name}`}
        />
      </div>
      <Button size="sm" loading={busy} onClick={save}>
        <Save className="h-4 w-4" /> Save
      </Button>
    </li>
  );
}
