import { useState } from 'react';
import { Crown, Medal, RefreshCw } from 'lucide-react';
import { competitionService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { useStompTopic } from '@/hooks/useStompTopic';
import { wsTopics } from '@/lib/ws';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import type { LeaderboardEntry } from '@/types';

/**
 * Live competition leaderboard.
 *
 * Loads the current standings once, then subscribes to
 * `/topic/competitions/{id}/leaderboard` — the backend pushes the full ordered
 * list whenever a score changes, so we simply replace state on each frame.
 */
export function Leaderboard({ competitionId }: { competitionId: number }) {
  const { data, loading, error, reload, setData } = useQuery<LeaderboardEntry[]>(
    () => competitionService.leaderboard(competitionId),
    [competitionId],
  );
  const [live, setLive] = useState(false);

  useStompTopic<LeaderboardEntry[]>(wsTopics.leaderboard(competitionId), (payload) => {
    if (Array.isArray(payload)) {
      setData(payload);
      setLive(true);
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner className="h-6 w-6 text-brand-600" />
      </div>
    );
  }
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No scores yet"
        description="Standings will appear here once judges submit scores."
      />
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          {live ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              Live
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3" /> Updates in real time
            </>
          )}
        </span>
      </div>
      <ol className="space-y-2">
        {data.map((entry) => (
          <li
            key={`${entry.participantType}-${entry.participantId}`}
            className={cn(
              'flex items-center gap-3 rounded-lg border px-4 py-3',
              entry.rank === 1
                ? 'border-amber-300 bg-amber-50 dark:border-amber-700/50 dark:bg-amber-900/20'
                : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
            )}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {entry.rank === 1 ? (
                <Crown className="h-4 w-4 text-amber-500" />
              ) : entry.rank <= 3 ? (
                <Medal
                  className={cn(
                    'h-4 w-4',
                    entry.rank === 2 ? 'text-slate-400' : 'text-amber-700',
                  )}
                />
              ) : (
                entry.rank
              )}
            </span>
            <span className="flex-1 font-medium text-slate-900 dark:text-slate-100">
              {entry.name}
            </span>
            <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
              {entry.totalPoints}
              <span className="ml-1 text-xs font-normal text-slate-400">pts</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
