import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <Compass className="mb-4 h-14 w-14 text-brand-500" />
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">404 — Not found</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">
        The page you're looking for doesn't exist or has moved.
      </p>
      <div className="mt-6 flex gap-3">
        <Link to="/" className="btn-primary">
          Home
        </Link>
        <Link to="/events" className="btn-secondary">
          Browse events
        </Link>
      </div>
    </div>
  );
}
