import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BellOff, XCircle } from 'lucide-react';
import { notificationService } from '@/lib/services';
import { errorMessage } from '@/lib/utils';
import { Spinner } from '@/components/ui';
import { AuthShell } from '@/pages/auth/AuthShell';

type Status = 'working' | 'success' | 'error';

/**
 * Public landing page for the one-click unsubscribe link embedded in every email.
 * The opaque token is the only credential, so this works even when signed out. It
 * turns off all email; in-app notifications are unaffected and can be re-enabled
 * from the profile's notification settings.
 */
export default function UnsubscribePage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [status, setStatus] = useState<Status>('working');
  const [message, setMessage] = useState('');
  // Guard against double-invocation in React StrictMode dev.
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (!token) {
      setStatus('error');
      setMessage('This unsubscribe link is missing its token.');
      return;
    }
    notificationService
      .unsubscribe(token)
      .then(() => {
        setStatus('success');
        setMessage(
          'You have been unsubscribed from CampusConnect emails. You will still see updates in your notification bell when you sign in.',
        );
      })
      .catch((err) => {
        setStatus('error');
        setMessage(errorMessage(err, 'This unsubscribe link is invalid or has expired.'));
      });
  }, [token]);

  return (
    <AuthShell
      title="Email preferences"
      footer={
        <>
          Changed your mind?{' '}
          <Link to="/app/profile" className="font-semibold text-brand-600 hover:text-brand-700">
            Manage notification settings
          </Link>
        </>
      }
    >
      <div className="flex flex-col items-center py-4 text-center">
        {status === 'working' && (
          <>
            <Spinner className="mb-3 h-9 w-9" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Updating your preferences…</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
              <BellOff className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="mb-3 h-10 w-10 text-red-500" />
            <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
          </>
        )}
      </div>
    </AuthShell>
  );
}
