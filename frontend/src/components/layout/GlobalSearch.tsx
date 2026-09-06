import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  CalendarDays,
  Loader2,
  Search,
  User as UserIcon,
} from 'lucide-react';
import { searchService } from '@/lib/services';
import { useDebounce } from '@/hooks/useDebounce';
import { useClickOutside } from '@/hooks/useClickOutside';
import { cn } from '@/lib/utils';
import type { GlobalSearchResponse } from '@/types';

/** A flattened, keyboard-navigable row in the results dropdown. */
interface Hit {
  key: string;
  to: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}

/** Build the ordered, flat list of hits the arrow keys walk through. */
function flatten(r: GlobalSearchResponse): Hit[] {
  const hits: Hit[] = [];
  for (const e of r.events) {
    hits.push({
      key: `e-${e.id}`,
      to: `/events/${e.id}`,
      icon: <CalendarDays className="h-4 w-4 text-brand-500" />,
      title: e.title,
      subtitle: e.clubName,
    });
  }
  for (const c of r.clubs) {
    hits.push({
      key: `c-${c.id}`,
      to: `/clubs/${c.id}`,
      icon: <Building2 className="h-4 w-4 text-indigo-500" />,
      title: c.name,
      subtitle: c.category,
    });
  }
  for (const u of r.users) {
    hits.push({
      key: `u-${u.id}`,
      to: `/app/admin/users?q=${encodeURIComponent(u.email)}`,
      icon: <UserIcon className="h-4 w-4 text-emerald-500" />,
      title: u.fullName,
      subtitle: u.email,
    });
  }
  return hits;
}

/**
 * Command-palette style global search that lives in the app top bar. Debounces
 * the query, shows grouped live results in a dropdown, supports arrow-key
 * navigation, and on Enter (or "See all results") routes to the full results
 * page. Anonymous-safe — the backend simply omits user matches for non-admins.
 */
export function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GlobalSearchResponse | null>(null);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounced = useDebounce(query, 300);

  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  useEffect(() => {
    const q = debounced.trim();
    if (q.length < 2) {
      setResult(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    searchService
      .global(q, 5)
      .then((r) => {
        if (!cancelled) {
          setResult(r);
          setActive(0);
        }
      })
      .catch(() => {
        if (!cancelled) setResult(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  // Cmd/Ctrl-K focuses the search box from anywhere in the app.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const hits = result ? flatten(result) : [];
  const total = result ? result.totalEvents + result.totalClubs + result.totalUsers : 0;

  function goToResults() {
    const q = query.trim();
    if (q.length < 2) return;
    setOpen(false);
    inputRef.current?.blur();
    navigate(`/app/search?q=${encodeURIComponent(q)}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, hits.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // The row past the last hit is the "see all results" affordance.
      if (active >= hits.length || hits.length === 0) {
        goToResults();
      } else {
        setOpen(false);
        navigate(hits[active].to);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div className="relative w-full max-w-md" ref={ref}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search events, clubs…"
          aria-label="Global search"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-10 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:bg-slate-800"
        />
        {loading ? (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
        ) : (
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:border-slate-600 dark:bg-slate-700 sm:block">
            ⌘K
          </kbd>
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 z-40 mt-2 max-h-[70vh] origin-top overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          {loading && !result ? (
            <p className="px-4 py-6 text-center text-sm text-slate-400">Searching…</p>
          ) : hits.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-400">
              No matches for "{query.trim()}"
            </p>
          ) : (
            <>
              {result && result.events.length > 0 && (
                <SectionLabel>Events</SectionLabel>
              )}
              {hits.map((hit, i) => {
                // Insert group labels as we cross type boundaries.
                const prev = hits[i - 1];
                const label =
                  result &&
                  ((hit.key.startsWith('c-') && (!prev || !prev.key.startsWith('c-'))) ||
                    (hit.key.startsWith('u-') && (!prev || !prev.key.startsWith('u-'))));
                return (
                  <div key={hit.key}>
                    {label && (
                      <SectionLabel>
                        {hit.key.startsWith('c-') ? 'Clubs' : 'Users'}
                      </SectionLabel>
                    )}
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => {
                        setOpen(false);
                        navigate(hit.to);
                      }}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-2 text-left',
                        active === i
                          ? 'bg-brand-50 dark:bg-brand-950/40'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60',
                      )}
                    >
                      <span className="shrink-0">{hit.icon}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                          {hit.title}
                        </span>
                        {hit.subtitle && (
                          <span className="block truncate text-xs text-slate-400">
                            {hit.subtitle}
                          </span>
                        )}
                      </span>
                    </button>
                  </div>
                );
              })}
              <button
                type="button"
                onMouseEnter={() => setActive(hits.length)}
                onClick={goToResults}
                className={cn(
                  'mt-1 flex w-full items-center gap-2 border-t border-slate-100 px-4 py-2.5 text-left text-xs font-medium text-brand-600 dark:border-slate-800 dark:text-brand-400',
                  active === hits.length
                    ? 'bg-brand-50 dark:bg-brand-950/40'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60',
                )}
              >
                <Search className="h-3.5 w-3.5" />
                See all {total} result{total === 1 ? '' : 's'} for "{query.trim()}"
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/** Small uppercase group heading inside the dropdown. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
      {children}
    </p>
  );
}
