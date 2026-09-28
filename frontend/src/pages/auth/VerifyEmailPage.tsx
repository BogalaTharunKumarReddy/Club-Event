import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import { authService } from '@/lib/services';
import { errorMessage } from '@/lib/utils';
import { Spinner } from '@/components/ui';
import { AuthShell } from './AuthShell';

type Status = 'verifying' | 'success' | 'error';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [status, setStatus] = useState<Status>('verifying');
  const [message, setMessage] = useState('');
  // Guard against double-invocation in React StrictMode dev.
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (!token) {
      setStatus('error');
      setMessage('This verification link is missing its token.');
      return;
    }
    authService
      .verifyEmail(token)
      .then(() => {
        setStatus('success');
        setMessage('Your email has been verified. You now have full access.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(errorMessage(err, 'This verification link is invalid or has expired.'));
      });
  }, [token]);

  return (
    <AuthShell
      title="Email verification"
      footer={
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Continue to sign in
        </Link>
      }
    >
      <div className="flex flex-col items-center py-4 text-center">
        {status === 'verifying' && (
          <>
            <Spinner className="mb-3 h-9 w-9" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Verifying your email…</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="mb-3 h-10 w-10 text-green-500" />
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
