import { useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { clubService, eventService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { EVENT_CATEGORIES, EVENT_MODE_LABELS } from '@/lib/constants';
import { errorMessage } from '@/lib/utils';
import { optionalImageUrl } from '@/lib/validation';
import { PageContainer } from '@/components/layout/RootLayout';
import {
  Button,
  Field,
  PageHeader,
  SectionLoader,
  Select,
  TextArea,
  TextInput,
} from '@/components/ui';
import type { EventMode, EventRequest } from '@/types';
import { ImageUpload } from '@/components/domain/ImageUpload';

const schema = z
  .object({
    title: z.string().min(1, 'Title is required').max(200),
    clubId: z.string().min(1, 'Select a club'),
    category: z.string().optional(),
    mode: z.enum(['ONLINE', 'OFFLINE', 'HYBRID']),
    description: z.string().optional(),
    bannerUrl: optionalImageUrl,
    venue: z.string().optional(),
    onlineUrl: z.string().url('Enter a valid URL').or(z.literal('')).optional(),
    startDateTime: z.string().min(1, 'Start date is required'),
    endDateTime: z.string().min(1, 'End date is required'),
    registrationDeadline: z.string().optional(),
    capacity: z.string().optional(),
    rules: z.string().optional(),
    instructions: z.string().optional(),
    paidEvent: z.boolean(),
    fee: z.string().optional(),
    teamEvent: z.boolean(),
    minTeamSize: z.string().optional(),
    maxTeamSize: z.string().optional(),
    featured: z.boolean(),
  })
  .refine((v) => new Date(v.endDateTime) > new Date(v.startDateTime), {
    message: 'End must be after start',
    path: ['endDateTime'],
  })
  .refine((v) => !v.paidEvent || (v.fee && Number(v.fee) > 0), {
    message: 'Enter a fee greater than 0',
    path: ['fee'],
  })
  .refine(
    (v) =>
      !v.teamEvent ||
      !v.minTeamSize ||
      !v.maxTeamSize ||
      Number(v.maxTeamSize) >= Number(v.minTeamSize),
    { message: 'Max size must be ≥ min size', path: ['maxTeamSize'] },
  );

type FormValues = z.infer<typeof schema>;

/** Backend LocalDateTime → value for <input type="datetime-local"> (yyyy-MM-ddТHH:mm). */
function toLocalInput(iso?: string): string {
  return iso ? iso.slice(0, 16) : '';
}
function num(value?: string): number | undefined {
  if (value === undefined || value.trim() === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export default function EventFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const eventId = Number(id);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { data: memberships, loading: clubsLoading } = useQuery(
    () => clubService.myMemberships(),
    [],
  );
  const coordinatorClubs = useMemo(
    () =>
      (memberships ?? []).filter((m) => m.clubRole === 'COORDINATOR' && m.status === 'ACTIVE'),
    [memberships],
  );

  const { data: existing, loading: eventLoading } = useQuery(
    () => (isEdit ? eventService.getById(eventId) : Promise.resolve(null)),
    [eventId, isEdit],
  );

  const defaultClubId = searchParams.get('clubId') ?? '';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: existing
      ? {
          title: existing.title,
          clubId: String(existing.clubId),
          category: existing.category ?? '',
          mode: existing.mode,
          description: existing.description ?? '',
          bannerUrl: existing.bannerUrl ?? '',
          venue: existing.venue ?? '',
          onlineUrl: existing.onlineUrl ?? '',
          startDateTime: toLocalInput(existing.startDateTime),
          endDateTime: toLocalInput(existing.endDateTime),
          registrationDeadline: toLocalInput(existing.registrationDeadline),
          capacity: existing.capacity != null ? String(existing.capacity) : '',
          rules: existing.rules ?? '',
          instructions: existing.instructions ?? '',
          paidEvent: existing.paidEvent,
          fee: existing.fee != null ? String(existing.fee) : '',
          teamEvent: existing.teamEvent,
          minTeamSize: existing.minTeamSize != null ? String(existing.minTeamSize) : '',
          maxTeamSize: existing.maxTeamSize != null ? String(existing.maxTeamSize) : '',
          featured: existing.featured,
        }
      : {
          title: '',
          clubId: defaultClubId,
          category: '',
          mode: 'OFFLINE',
          description: '',
          bannerUrl: '',
          venue: '',
          onlineUrl: '',
          startDateTime: '',
          endDateTime: '',
          registrationDeadline: '',
          capacity: '',
          rules: '',
          instructions: '',
          paidEvent: false,
          fee: '',
          teamEvent: false,
          minTeamSize: '',
          maxTeamSize: '',
          featured: false,
        },
  });

  const paid = watch('paidEvent');
  const team = watch('teamEvent');
  const mode = watch('mode');

  if (clubsLoading || (isEdit && eventLoading)) return <SectionLoader />;

  const onSubmit = async (values: FormValues) => {
    const payload: EventRequest = {
      title: values.title.trim(),
      clubId: Number(values.clubId),
      mode: values.mode as EventMode,
      description: values.description || undefined,
      category: values.category || undefined,
      bannerUrl: values.bannerUrl || undefined,
      venue: values.venue || undefined,
      onlineUrl: values.onlineUrl || undefined,
      startDateTime: values.startDateTime,
      endDateTime: values.endDateTime,
      registrationDeadline: values.registrationDeadline || undefined,
      capacity: num(values.capacity),
      rules: values.rules || undefined,
      instructions: values.instructions || undefined,
      paidEvent: values.paidEvent,
      fee: values.paidEvent ? num(values.fee) : undefined,
      teamEvent: values.teamEvent,
      minTeamSize: values.teamEvent ? num(values.minTeamSize) : undefined,
      maxTeamSize: values.teamEvent ? num(values.maxTeamSize) : undefined,
      featured: values.featured,
    };

    try {
      const saved = isEdit
        ? await eventService.update(eventId, payload)
        : await eventService.create(payload);
      toast.success(isEdit ? 'Event updated.' : 'Event created as draft.');
      reset();
      navigate(`/app/manage/events/${saved.id}`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save event.'));
    }
  };

  return (
    <PageContainer>
      <button
        onClick={() => navigate(-1)}
        className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <PageHeader
        title={isEdit ? 'Edit event' : 'Create event'}
        description={
          isEdit
            ? 'Update the details of your event.'
            : 'New events are saved as drafts — publish them when ready.'
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6" noValidate>
        {/* Basics */}
        <section className="card p-6">
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Basics</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Title" htmlFor="title" error={errors.title?.message} required className="sm:col-span-2">
              <TextInput id="title" invalid={!!errors.title} {...register('title')} />
            </Field>

            <Field label="Club" htmlFor="clubId" error={errors.clubId?.message} required>
              <Select id="clubId" invalid={!!errors.clubId} disabled={isEdit} {...register('clubId')}>
                <option value="">Select a club</option>
                {coordinatorClubs.map((c) => (
                  <option key={c.clubId} value={c.clubId}>
                    {c.clubName}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Category" htmlFor="category">
              <Select id="category" {...register('category')}>
                <option value="">Select a category</option>
                {EVENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Description" htmlFor="description" className="sm:col-span-2">
              <TextArea id="description" rows={4} {...register('description')} />
            </Field>

            <ImageUpload
              label="Banner image"
              shape="wide"
              folder="banners"
              className="sm:col-span-2"
              value={watch('bannerUrl')}
              onChange={(url) => setValue('bannerUrl', url, { shouldDirty: true })}
              error={errors.bannerUrl?.message}
            />
          </div>
        </section>

        {/* When & where */}
        <section className="card p-6">
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">When & where</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Mode" htmlFor="mode" required>
              <Select id="mode" {...register('mode')}>
                {(Object.keys(EVENT_MODE_LABELS) as EventMode[]).map((m) => (
                  <option key={m} value={m}>
                    {EVENT_MODE_LABELS[m]}
                  </option>
                ))}
              </Select>
            </Field>
            {mode !== 'ONLINE' && (
              <Field label="Venue" htmlFor="venue">
                <TextInput id="venue" placeholder="e.g. Main Auditorium" {...register('venue')} />
              </Field>
            )}
            {mode !== 'OFFLINE' && (
              <Field label="Online URL" htmlFor="onlineUrl" error={errors.onlineUrl?.message} className="sm:col-span-2">
                <TextInput id="onlineUrl" placeholder="https://meet…" {...register('onlineUrl')} />
              </Field>
            )}

            <Field label="Starts" htmlFor="startDateTime" error={errors.startDateTime?.message} required>
              <TextInput id="startDateTime" type="datetime-local" invalid={!!errors.startDateTime} {...register('startDateTime')} />
            </Field>
            <Field label="Ends" htmlFor="endDateTime" error={errors.endDateTime?.message} required>
              <TextInput id="endDateTime" type="datetime-local" invalid={!!errors.endDateTime} {...register('endDateTime')} />
            </Field>
            <Field label="Registration deadline" htmlFor="registrationDeadline">
              <TextInput id="registrationDeadline" type="datetime-local" {...register('registrationDeadline')} />
            </Field>
            <Field label="Capacity" htmlFor="capacity" hint="Leave blank for unlimited">
              <TextInput id="capacity" type="number" min={1} {...register('capacity')} />
            </Field>
          </div>
        </section>

        {/* Options */}
        <section className="card p-6">
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Options</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" {...register('paidEvent')} />
              <span className="text-sm text-slate-700 dark:text-slate-200">Paid event</span>
            </label>
            {paid && (
              <Field label="Fee (INR)" htmlFor="fee" error={errors.fee?.message} className="max-w-xs">
                <TextInput id="fee" type="number" min={0} step="0.01" invalid={!!errors.fee} {...register('fee')} />
              </Field>
            )}

            <label className="flex items-center gap-3">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" {...register('teamEvent')} />
              <span className="text-sm text-slate-700 dark:text-slate-200">Team event</span>
            </label>
            {team && (
              <div className="grid max-w-md grid-cols-2 gap-4">
                <Field label="Min team size" htmlFor="minTeamSize">
                  <TextInput id="minTeamSize" type="number" min={1} {...register('minTeamSize')} />
                </Field>
                <Field label="Max team size" htmlFor="maxTeamSize" error={errors.maxTeamSize?.message}>
                  <TextInput id="maxTeamSize" type="number" min={1} invalid={!!errors.maxTeamSize} {...register('maxTeamSize')} />
                </Field>
              </div>
            )}

            <label className="flex items-center gap-3">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" {...register('featured')} />
              <span className="text-sm text-slate-700 dark:text-slate-200">Feature on homepage</span>
            </label>
          </div>
        </section>

        {/* Extra content */}
        <section className="card p-6">
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Rules & instructions</h3>
          <div className="space-y-4">
            <Field label="Rules" htmlFor="rules">
              <TextArea id="rules" rows={3} {...register('rules')} />
            </Field>
            <Field label="Instructions" htmlFor="instructions">
              <TextArea id="instructions" rows={3} {...register('instructions')} />
            </Field>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            <Save className="h-4 w-4" /> {isEdit ? 'Save changes' : 'Create event'}
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
