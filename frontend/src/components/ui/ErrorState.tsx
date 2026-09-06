import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

/** Inline error panel with an optional retry action. */
export function ErrorState({
  message = 'Something went wrong.',
  onRetry,
  action,
}: {
  message?: string;
  onRetry?: () => void;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center dark:border-red-900/50 dark:bg-red-950/30">
      <AlertTriangle className="mb-3 h-8 w-8 text-red-500" />
      <p className="text-sm font-medium text-red-700 dark:text-red-300">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          Retry
        </Button>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
