import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BadgeCheck, Bell, Lock, UserCog } from 'lucide-react';
import toast from 'react-hot-toast';
import { notificationService, userService } from '@/lib/services';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@/hooks/useApi';
import { ROLE_LABELS } from '@/lib/constants';
import { errorMessage } from '@/lib/utils';
import { optionalImageUrl } from '@/lib/validation';
import { PageContainer } from '@/components/layout/RootLayout';
import {
  Avatar,
  Badge,
  Button,
  ErrorState,
  Field,
  PageHeader,
  Spinner,
  TextArea,
  TextInput,
} from '@/components/ui';
import { ImageUpload } from '@/components/domain/ImageUpload';
import type { NotificationPreferenceResponse } from '@/types';

/* ------------------------------ profile ------------------------------ */

const profileSchema = z.object({
  fullName: z.string().min(1, 'Name is required').max(120),
  department: z.string().max(120).optional(),
  phone: z.string().max(20).optional(),
  bio: z.string().max(500).optional(),
  profilePhotoUrl: optionalImageUrl,
});
type ProfileValues = z.infer<typeof profileSchema>;

/* --------------------------- change password --------------------------- */

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'At least 8 characters').max(72),
    confirm: z.string().min(1, 'Please confirm your password'),
  })
  .refine((v) => v.newPassword === v.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });
type PasswordValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, setUser } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName ?? '',
      department: user?.department ?? '',
      phone: user?.phone ?? '',
      bio: user?.bio ?? '',
      profilePhotoUrl: user?.profilePhotoUrl ?? '',
    },
  });

  const onSaveProfile = async (values: ProfileValues) => {
    try {
      const updated = await userService.updateProfile({
        fullName: values.fullName,
        department: values.department || undefined,
        phone: values.phone || undefined,
        bio: values.bio || undefined,
        profilePhotoUrl: values.profilePhotoUrl || undefined,
      });
      setUser(updated);
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update profile.'));
    }
  };

  if (!user) return null;

  return (
    <PageContainer>
      <PageHeader title="Profile" description="Manage your account details and password." />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Summary */}
        <div className="card flex flex-col items-center p-6 text-center lg:col-span-1">
          <Avatar name={user.fullName} src={user.profilePhotoUrl} size="lg" className="h-24 w-24 text-2xl" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {user.fullName}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <Badge className="bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
              {ROLE_LABELS[user.role]}
            </Badge>
            {user.emailVerified ? (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                <BadgeCheck className="mr-1 inline h-3.5 w-3.5" /> Verified
              </Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                Unverified
              </Badge>
            )}
          </div>
          {user.studentId && (
            <p className="mt-3 text-xs text-slate-400">Student ID: {user.studentId}</p>
          )}
        </div>

        {/* Forms */}
        <div className="space-y-6 lg:col-span-2">
          <form onSubmit={handleSubmit(onSaveProfile)} className="card p-6">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
              <UserCog className="h-4 w-4 text-brand-600" /> Account details
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name" htmlFor="fullName" error={errors.fullName?.message} required>
                <TextInput id="fullName" invalid={!!errors.fullName} {...register('fullName')} />
              </Field>
              <Field label="Department" htmlFor="department" error={errors.department?.message}>
                <TextInput
                  id="department"
                  placeholder="e.g. Computer Science"
                  {...register('department')}
                />
              </Field>
              <Field label="Phone" htmlFor="phone" error={errors.phone?.message}>
                <TextInput id="phone" {...register('phone')} />
              </Field>
              <ImageUpload
                label="Profile photo"
                shape="circle"
                folder="avatars"
                value={watch('profilePhotoUrl')}
                onChange={(url) =>
                  setValue('profilePhotoUrl', url, { shouldDirty: true })
                }
                error={errors.profilePhotoUrl?.message}
              />
              <Field label="Bio" htmlFor="bio" error={errors.bio?.message} className="sm:col-span-2">
                <TextArea id="bio" rows={3} placeholder="Tell us about yourself" {...register('bio')} />
              </Field>
            </div>
            <div className="mt-4 flex justify-end">
              <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
                Save changes
              </Button>
            </div>
          </form>

          <PasswordForm />

          <NotificationPreferencesForm />
        </div>
      </div>
    </PageContainer>
  );
}

function PasswordForm() {
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  const onSubmit = async (values: PasswordValues) => {
    try {
      await userService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success('Password changed.');
      reset();
      setDone(true);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not change password.'));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-6">
      <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
        <Lock className="h-4 w-4 text-brand-600" /> Change password
      </h3>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Current password"
          htmlFor="currentPassword"
          error={errors.currentPassword?.message}
          className="sm:col-span-2"
          required
        >
          <TextInput
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            invalid={!!errors.currentPassword}
            {...register('currentPassword')}
          />
        </Field>
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
            invalid={!!errors.newPassword}
            {...register('newPassword')}
          />
        </Field>
        <Field label="Confirm password" htmlFor="confirm" error={errors.confirm?.message} required>
          <TextInput
            id="confirm"
            type="password"
            autoComplete="new-password"
            invalid={!!errors.confirm}
            {...register('confirm')}
          />
        </Field>
      </div>
      <div className="mt-4 flex items-center justify-end gap-3">
        {done && <span className="text-sm text-green-600">Password updated ✓</span>}
        <Button type="submit" loading={isSubmitting}>
          Update password
        </Button>
      </div>
    </form>
  );
}

/* ----------------------- notification preferences ---------------------- */

const EMAIL_CATEGORIES: {
  key: keyof Omit<NotificationPreferenceResponse, 'emailEnabled'>;
  label: string;
  hint: string;
}[] = [
  {
    key: 'emailOnEvents',
    label: 'Event updates',
    hint: 'Registrations, reminders, schedule changes and cancellations.',
  },
  {
    key: 'emailOnAnnouncements',
    label: 'Announcements',
    hint: 'Club and event announcements.',
  },
  {
    key: 'emailOnCertificates',
    label: 'Certificates',
    hint: 'When a certificate is issued to you.',
  },
  {
    key: 'emailOnPayments',
    label: 'Payments',
    hint: 'Payment confirmations, refunds and receipts.',
  },
  {
    key: 'emailOnGeneral',
    label: 'General',
    hint: 'Other account and system messages.',
  },
];

function NotificationPreferencesForm() {
  const { data, loading, error, reload, setData } = useQuery(
    () => notificationService.preferences(),
    [],
  );
  const [saving, setSaving] = useState(false);

  const toggle = (key: keyof NotificationPreferenceResponse) => {
    if (data) setData({ ...data, [key]: !data[key] });
  };

  const onSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const updated = await notificationService.updatePreferences(data);
      setData(updated);
      toast.success('Notification preferences saved.');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save preferences.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-6">
      <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
        <Bell className="h-4 w-4 text-brand-600" /> Email notifications
      </h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        In-app notifications always appear in your notification bell. These settings only control
        which updates we also send you by email.
      </p>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : error ? (
        <div className="mt-4">
          <ErrorState message={error} onRetry={reload} />
        </div>
      ) : data ? (
        <>
          <div className="mt-4 border-b border-slate-100 dark:border-slate-800">
            <ToggleRow
              label="Email notifications"
              hint="Master switch — turn this off to stop all CampusConnect emails."
              checked={data.emailEnabled}
              onChange={() => toggle('emailEnabled')}
            />
          </div>

          <div
            className={
              'divide-y divide-slate-100 dark:divide-slate-800 ' +
              (data.emailEnabled ? '' : 'pointer-events-none opacity-50')
            }
            aria-disabled={!data.emailEnabled}
          >
            {EMAIL_CATEGORIES.map((c) => (
              <ToggleRow
                key={c.key}
                label={c.label}
                hint={c.hint}
                checked={data[c.key]}
                disabled={!data.emailEnabled}
                onChange={() => toggle(c.key)}
              />
            ))}
          </div>

          <div className="mt-5 flex justify-end">
            <Button onClick={onSave} loading={saving}>
              Save preferences
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  disabled = false,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={onChange}
        className={
          'relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ' +
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ' +
          'disabled:cursor-not-allowed ' +
          (checked ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-600')
        }
      >
        <span
          className={
            'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ' +
            (checked ? 'translate-x-5' : 'translate-x-1')
          }
        />
      </button>
    </div>
  );
}
