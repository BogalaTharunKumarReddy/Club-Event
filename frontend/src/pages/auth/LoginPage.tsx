import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
<<<<<<< HEAD
import { KeyRound, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { errorMessage } from '@/lib/utils';
import { roleHome } from '@/lib/roleHome';
import { Button, Field, TextInput } from '@/components/ui';
import { AuthShell } from './AuthShell';

/** Where to land after a successful sign-in (honours a "redirect back" target). */
function useRedirectTarget() {
  const location = useLocation();
  return (
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? null
  );
}

const passwordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type PasswordValues = z.infer<typeof passwordSchema>;

const codeSchema = z.object({
  identifier: z.string().min(1, 'Enter your email or phone number'),
});
type CodeValues = z.infer<typeof codeSchema>;

type Mode = 'password' | 'code';

export default function LoginPage() {
  const { login, requestLoginOtp } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const redirectTo = useRedirectTarget();
  const [mode, setMode] = useState<Mode>('password');
  const [serverError, setServerError] = useState<string | null>(null);

  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });
  const codeForm = useForm<CodeValues>({ resolver: zodResolver(codeSchema) });

  /** Hand off to the OTP screen, carrying the challenge and where to go afterwards. */
  const goToVerify = (challengeToken: string, identifier?: string) => {
    navigate('/verify-otp', {
      replace: true,
      state: { challengeToken, identifier, from: redirectTo ? { pathname: redirectTo } : undefined },
    });
  };

  const onPasswordSubmit = async (values: PasswordValues) => {
    setServerError(null);
    try {
      const outcome = await login(values);
      if (outcome.status === 'challenge') {
        toast.success('We sent you a verification code.');
        goToVerify(outcome.challengeToken);
        return;
      }
      toast.success(`Welcome back, ${outcome.user.fullName.split(' ')[0]}!`);
      navigate(redirectTo ?? roleHome(outcome.user.role), { replace: true });
=======
import { useAuth } from '@/context/AuthContext';
import { errorMessage } from '@/lib/utils';
import { Button, Field, TextInput } from '@/components/ui';
import { AuthShell } from './AuthShell';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const user = await login(values);
      toast.success(`Welcome back, ${user.fullName.split(' ')[0]}!`);
      const dest =
        (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ||
        '/app/dashboard';
      navigate(dest, { replace: true });
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
    } catch (err) {
      setServerError(errorMessage(err, 'Invalid email or password.'));
    }
  };

<<<<<<< HEAD
  const onCodeSubmit = async (values: CodeValues) => {
    setServerError(null);
    try {
      const { challengeToken } = await requestLoginOtp({ identifier: values.identifier.trim() });
      toast.success('If an account matches, a code is on its way.');
      goToVerify(challengeToken, values.identifier.trim());
    } catch (err) {
      setServerError(errorMessage(err, 'Could not send a code. Please try again.'));
    }
  };

  const switchMode = (next: Mode) => {
    setServerError(null);
    setMode(next);
  };

=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
  return (
    <AuthShell
      title={t('auth.welcomeBack')}
      subtitle={t('tagline')}
      footer={
        <>
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
            {t('nav.register')}
          </Link>
        </>
      }
    >
<<<<<<< HEAD
      {serverError && (
        <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {serverError}
        </div>
      )}

      {mode === 'password' ? (
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4" noValidate>
          <Field
            label={t('auth.email')}
            htmlFor="email"
            error={passwordForm.formState.errors.email?.message}
            required
          >
            <TextInput
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@college.edu"
              invalid={!!passwordForm.formState.errors.email}
              {...passwordForm.register('email')}
            />
          </Field>

          <Field
            label={t('auth.password')}
            htmlFor="password"
            error={passwordForm.formState.errors.password?.message}
            required
          >
            <TextInput
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              invalid={!!passwordForm.formState.errors.password}
              {...passwordForm.register('password')}
            />
          </Field>

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              {t('auth.forgotPassword')}
            </Link>
          </div>

          <Button type="submit" fullWidth loading={passwordForm.formState.isSubmitting}>
            {passwordForm.formState.isSubmitting ? t('auth.signingIn') : t('nav.login')}
          </Button>
        </form>
      ) : (
        <form onSubmit={codeForm.handleSubmit(onCodeSubmit)} className="space-y-4" noValidate>
          <Field
            label={t('auth.identifier')}
            htmlFor="identifier"
            error={codeForm.formState.errors.identifier?.message}
            hint="We'll text and email you a 6-digit code — no password needed."
            required
          >
            <TextInput
              id="identifier"
              type="text"
              autoComplete="username"
              placeholder="you@college.edu or +91…"
              invalid={!!codeForm.formState.errors.identifier}
              {...codeForm.register('identifier')}
            />
          </Field>

          <Button type="submit" fullWidth loading={codeForm.formState.isSubmitting}>
            {codeForm.formState.isSubmitting ? t('auth.sendingCode') : t('auth.sendCode')}
          </Button>
        </form>
      )}

      {/* Mode switch */}
      <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-700">
        <button
          type="button"
          onClick={() => switchMode(mode === 'password' ? 'code' : 'password')}
          className="flex w-full items-center justify-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          {mode === 'password' ? (
            <>
              <KeyRound className="h-4 w-4" />
              {t('auth.useCode')}
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              {t('auth.usePassword')}
            </>
          )}
        </button>
      </div>
=======
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {serverError}
          </div>
        )}

        <Field label={t('auth.email')} htmlFor="email" error={errors.email?.message} required>
          <TextInput
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@college.edu"
            invalid={!!errors.email}
            {...register('email')}
          />
        </Field>

        <Field
          label={t('auth.password')}
          htmlFor="password"
          error={errors.password?.message}
          required
        >
          <TextInput
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            invalid={!!errors.password}
            {...register('password')}
          />
        </Field>

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            {t('auth.forgotPassword')}
          </Link>
        </div>

        <Button type="submit" fullWidth loading={isSubmitting}>
          {isSubmitting ? t('auth.signingIn') : t('nav.login')}
        </Button>
      </form>
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
    </AuthShell>
  );
}
