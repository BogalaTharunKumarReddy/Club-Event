import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MailCheck } from 'lucide-react';
import { authService } from '@/lib/services';
import { errorMessage } from '@/lib/utils';
import { Button, Field, TextInput } from '@/components/ui';
import { AuthShell } from './AuthShell';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await authService.forgotPassword(values);
      // Always show success — never reveal whether the email is registered.
      setSent(true);
    } catch (err) {
      setServerError(errorMessage(err));
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a secure reset link."
      footer={
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center py-4 text-center">
          <MailCheck className="mb-3 h-10 w-10 text-green-500" />
          <p className="text-sm text-slate-600 dark:text-slate-300">
            If an account exists for that email, a password reset link is on its way. Check
            your inbox (and spam folder).
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {serverError}
            </div>
          )}
          <Field label="Email" htmlFor="email" error={errors.email?.message} required>
            <TextInput
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@college.edu"
              invalid={!!errors.email}
              {...register('email')}
            />
          </Field>
          <Button type="submit" fullWidth loading={isSubmitting}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
