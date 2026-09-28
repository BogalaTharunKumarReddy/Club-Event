import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { errorMessage } from '@/lib/utils';
import { roleHome } from '@/lib/roleHome';
import { Button, Field, TextInput } from '@/components/ui';
import { AuthShell } from './AuthShell';

/**
 * Second step of an OTP sign-in — used for BOTH flows that end in a challenge:
 *   • 2FA step-up after a correct password, and
 *   • passwordless "sign in with a code".
 * Both complete identically: POST the challenge token + 6-digit code to
 * `/auth/verify-otp`, which issues the session tokens.
 *
 * The challenge token arrives via router state (never the URL, so it isn't
 * bookmarked or leaked in history). Landing here directly — with no challenge —
 * bounces back to the login screen.
 */

const schema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the 6-digit code'),
});
type FormValues = z.infer<typeof schema>;

interface VerifyState {
  challengeToken?: string;
  identifier?: string;
  from?: { pathname?: string };
}

export default function VerifyOtpPage() {
  const { verifyOtp, requestLoginOtp } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as VerifyState | null) ?? {};

  const [challengeToken, setChallengeToken] = useState(state.challengeToken ?? '');
  const [serverError, setServerError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // No challenge in hand → nothing to verify; send them back to sign in.
  useEffect(() => {
    if (!challengeToken) navigate('/login', { replace: true });
  }, [challengeToken, navigate]);

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const user = await verifyOtp({ challengeToken, code: values.code.trim() });
      toast.success(`Welcome, ${user.fullName.split(' ')[0]}!`);
      navigate(state.from?.pathname ?? roleHome(user.role), { replace: true });
    } catch (err) {
      setServerError(errorMessage(err, 'That code is incorrect or has expired.'));
    }
  };

  // Resend is only possible for the passwordless flow, where we still hold the
  // identifier. (A 2FA step-up would need the password again, so we hide it.)
  const canResend = !!state.identifier;
  const resend = async () => {
    if (!state.identifier) return;
    setResending(true);
    setServerError(null);
    try {
      const { challengeToken: next } = await requestLoginOtp({ identifier: state.identifier });
      setChallengeToken(next);
      toast.success('A fresh code is on its way.');
    } catch (err) {
      setServerError(errorMessage(err, 'Could not resend a code. Please try again.'));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell
      title={t('auth.verifyTitle')}
      subtitle={t('auth.verifySubtitle')}
      footer={
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          {t('auth.backToSignIn')}
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {serverError}
          </div>
        )}

        {state.identifier && (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Signing in as{' '}
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {state.identifier}
            </span>
          </p>
        )}

        <Field label={t('auth.verifyCode')} htmlFor="code" error={errors.code?.message} required>
          <TextInput
            id="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="••••••"
            className="text-center text-2xl font-semibold tracking-[0.5em]"
            invalid={!!errors.code}
            autoFocus
            {...register('code')}
          />
        </Field>

        <Button type="submit" fullWidth loading={isSubmitting}>
          <ShieldCheck className="h-4 w-4" />
          {isSubmitting ? t('auth.verifying') : t('auth.verify')}
        </Button>

        {canResend && (
          <button
            type="button"
            onClick={resend}
            disabled={resending}
            className="w-full text-center text-sm font-medium text-brand-600 hover:text-brand-700 disabled:opacity-60"
          >
            {resending ? t('auth.sendingCode') : t('auth.resendCode')}
          </button>
        )}
      </form>
    </AuthShell>
  );
}
