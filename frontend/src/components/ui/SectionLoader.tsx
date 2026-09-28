import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';

/**
 * In-flow loading state for pages/sections rendered *inside* a layout shell
 * (e.g. AppLayout's sidebar + topbar). Unlike {@link FullPageLoader} it is not
 * a full-viewport element, so it centers within the content area and never
 * forces a second scrollbar or pushes the fixed sidebar out of view.
 *
 * Use this for any `/app/*` page or workspace tab; reserve `FullPageLoader`
 * for route-level Suspense / auth-restore where no shell has mounted yet.
 */
export function SectionLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex min-h-[40vh] items-center justify-center', className)}>
      <Spinner className="h-8 w-8" />
    </div>
  );
}
