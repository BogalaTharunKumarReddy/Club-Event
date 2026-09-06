import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  fullName: z.string().min(2, 'Please enter your full name').max(120),
  email: z.string().min(1, 'Email is required').email('Enter a valid email').max(160),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be at most 72 characters'),
  studentId: z.string().max(60).optional().or(z.literal('')),
  department: z.string().max(120).optional().or(z.literal('')),
  phone: z
    .string()
    .max(20)
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || /^[+\d][\d\s-]{5,}$/.test(v), 'Enter a valid phone number'),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      // Strip empty optionals so we don't send "".
      const user = await registerUser({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        studentId: values.studentId || undefined,
        department: values.department || undefined,
        phone: values.phone || undefined,
      });
      toast.success(`Welcome to CampusConnect, ${user.fullName.split(' ')[0]}!`);
      navigate('/app/dashboard', { replace: true });
    } catch (err) {
      setServerError(errorMessage(err, 'Could not create your account.'));
    }
  };

  return (
    <AuthShell
      title={t('auth.createAccount')}
      subtitle={t('tagline')}
      footer={
        <>
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            {t('nav.login')}
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

        <Field label={t('auth.fullName')} htmlFor="fullName" error={errors.fullName?.message} required>
          <TextInput
            id="fullName"
            autoComplete="name"
            placeholder="Aditi Sharma"
            invalid={!!errors.fullName}
            {...register('fullName')}
          />
        </Field>

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
          hint="At least 8 characters."
          required
        >
          <TextInput
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            invalid={!!errors.password}
            {...register('password')}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t('auth.studentId')} htmlFor="studentId" error={errors.studentId?.message}>
            <TextInput id="studentId" placeholder="CS21B042" {...register('studentId')} />
          </Field>
          <Field label={t('auth.department')} htmlFor="department" error={errors.department?.message}>
            <TextInput id="department" placeholder="Computer Science" {...register('department')} />
          </Field>
        </div>

        <Field label={t('auth.phone')} htmlFor="phone" error={errors.phone?.message}>
          <TextInput id="phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210" {...register('phone')} />
        </Field>

        <Button type="submit" fullWidth loading={isSubmitting}>
          {isSubmitting ? t('auth.creating') : t('nav.register')}
        </Button>
      </form>
    </AuthShell>
  );
}
