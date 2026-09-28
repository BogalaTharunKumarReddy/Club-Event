import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import type { ReactNode } from 'react';

/** Centered card shell shared by all auth screens. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center text-center">
        <Link
          to="/"
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white"
        >
          <GraduationCap className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        )}
      </div>

      <div className="card p-6 sm:p-8">{children}</div>

      {footer && (
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          {footer}
        </p>
      )}
    </div>
  );
}
