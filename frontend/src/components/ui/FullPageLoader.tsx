import { Spinner } from './Spinner';

/** Full-viewport centered loader for route-level suspense / auth restore. */
export function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
