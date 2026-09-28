import { Link } from 'react-router-dom';
import { ShieldX } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <ShieldX className="mb-4 h-14 w-14 text-red-500" />
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">403 — Forbidden</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">
        You don't have permission to view this page. If you believe this is a mistake, contact
        the club coordinator.
      </p>
      <Link to="/" className="btn-primary mt-6">
        Back to home
      </Link>
    </div>
  );
}
