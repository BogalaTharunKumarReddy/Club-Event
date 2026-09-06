import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Generic pill badge. Pass Tailwind color classes via `className`. */
export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'badge bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
        className,
      )}
    >
      {children}
    </span>
  );
}
