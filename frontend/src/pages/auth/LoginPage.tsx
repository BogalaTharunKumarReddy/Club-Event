import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
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
    } catch (err) {
      setServerError(errorMessage(err, 'Invalid email or password.'));
    }
  };

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
    </AuthShell>
  );
}
