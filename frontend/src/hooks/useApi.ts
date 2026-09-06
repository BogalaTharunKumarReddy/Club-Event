import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from '@/lib/utils';

interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  /** Re-run the fetcher (e.g. after a mutation or a Retry click). */
  reload: () => void;
  /** Locally replace the cached data without a network round-trip. */
  setData: (updater: T | ((prev: T | null) => T)) => void;
}

/**
 * Minimal data-fetching hook: runs `fetcher` on mount and whenever a value in
 * `deps` changes, tracks loading/error, and ignores results from stale runs so
 * a fast re-query can't be overwritten by a slow earlier one.
 */
export function useQuery<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
): QueryState<T> {
  const [data, setDataState] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const runIdRef = useRef(0);

  // Keep the latest fetcher without forcing it into the dependency array.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(() => {
    const runId = ++runIdRef.current;
    setLoading(true);
    setError(null);
    fetcherRef
      .current()
      .then((result) => {
        if (runId === runIdRef.current) setDataState(result);
      })
      .catch((err) => {
        if (runId === runIdRef.current) setError(errorMessage(err));
      })
      .finally(() => {
        if (runId === runIdRef.current) setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    run();
    return () => {
      // Invalidate any in-flight run when deps change / component unmounts.
      runIdRef.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const setData = useCallback((updater: T | ((prev: T | null) => T)) => {
    setDataState((prev) =>
      typeof updater === 'function'
        ? (updater as (p: T | null) => T)(prev)
        : updater,
    );
  }, []);

  return { data, loading, error, reload: run, setData };
}
