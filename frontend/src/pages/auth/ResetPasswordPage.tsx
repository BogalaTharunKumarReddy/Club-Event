import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { CheckCircle2 } from 'lucide-react';
import { authService } from '@/lib/services';
import { errorMessage } from '@/lib/utils';
import { Button, Field, TextInput } from '@/components/ui';
import { AuthShell } from './AuthShell';

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be at most 72 characters'),
    confirm: z.string().min(1, 'Please confirm your password'),
  })
  .refine((v) => v.newPassword === v.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await authService.resetPassword({ token, newPassword: values.newPassword });
      setDone(true);
      toast.success('Password updated. You can sign in now.');
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch (err) {
      setServerError(errorMessage(err, 'This reset link is invalid or has expired.'));
    }
  };

  if (!token) {
    return (
      <AuthShell
        title="Invalid reset link"
        subtitle="This link is missing its token."
        footer={
          <Link to="/forgot-password" className="font-semibold text-brand-600 hover:text-brand-700">
            Request a new link
          </Link>
        }
      >
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Please use the most recent link from your email, or request a new one.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Choose a new password"
      footer={
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Back to sign in
        </Link>
      }
    >
      {done ? (
        <div className="flex flex-col items-center py-4 text-center">
          <CheckCircle2 className="mb-3 h-10 w-10 text-green-500" />
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Your password has been reset. Redirecting you to sign in…
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {serverError}
            </div>
          )}
          <Field
            label="New password"
            htmlFor="newPassword"
            error={errors.newPassword?.message}
            required
          >
            <TextInput
              id="newPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              invalid={!!errors.newPassword}
              {...register('newPassword')}
            />
          </Field>
          <Field label="Confirm password" htmlFor="confirm" error={errors.confirm?.message} required>
            <TextInput
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              invalid={!!errors.confirm}
              {...register('confirm')}
            />
          </Field>
          <Button type="submit" fullWidth loading={isSubmitting}>
            Reset password
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
