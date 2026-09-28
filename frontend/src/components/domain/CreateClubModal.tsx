import { useState } from 'react';
import toast from 'react-hot-toast';
import { clubService } from '@/lib/services';
import { EVENT_CATEGORIES } from '@/lib/constants';
import { errorMessage } from '@/lib/utils';
import { Button, Field, Modal, Select, TextArea, TextInput } from '@/components/ui';
import type { ClubRequest } from '@/types';

/**
 * Shared "create a club" modal used by both the coordinator overview
 * (ManageDashboardPage) and the coordinator Clubs hub (CoordinatorClubsPage).
 * Previously this component was copy-pasted into both pages; it now lives here
 * as the single source of truth. The signed-in coordinator becomes the club's
 * coordinator on the backend, so no owner picker is needed.
 */
export interface CreateClubModalProps {
  open: boolean;
  onClose: () => void;
  /** Shown as a hint on the contact-email field, e.g. "You (Jane) will be the coordinator." */
  coordinatorName?: string;
  onCreated: () => void;
}

export function CreateClubModal({ open, onClose, coordinatorName, onCreated }: CreateClubModalProps) {
  const [form, setForm] = useState<ClubRequest>({ name: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function set<K extends keyof ClubRequest>(key: K, value: ClubRequest[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit() {
    if (!form.name.trim()) {
      setErr('Club name is required.');
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await clubService.create({
        ...form,
        name: form.name.trim(),
        description: form.description || undefined,
        category: form.category || undefined,
        contactEmail: form.contactEmail || undefined,
      });
      toast.success('Club created!');
      setForm({ name: '' });
      onCreated();
    } catch (e) {
      setErr(errorMessage(e, 'Could not create club.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={busy ? () => undefined : onClose}
      title="Create a club"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} loading={busy}>
            Create club
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Club name" htmlFor="club-name" required>
          <TextInput
            id="club-name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Coding Club"
            autoFocus
          />
        </Field>
        <Field label="Category" htmlFor="club-category">
          <Select
            id="club-category"
            value={form.category ?? ''}
            onChange={(e) => set('category', e.target.value)}
          >
            <option value="">Select a category</option>
            {EVENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Description" htmlFor="club-desc">
          <TextArea
            id="club-desc"
            rows={3}
            value={form.description ?? ''}
            onChange={(e) => set('description', e.target.value)}
            placeholder="What is this club about?"
          />
        </Field>
        <Field
          label="Contact email"
          htmlFor="club-email"
          hint={coordinatorName ? `You (${coordinatorName}) will be the coordinator.` : undefined}
        >
          <TextInput
            id="club-email"
            type="email"
            value={form.contactEmail ?? ''}
            onChange={(e) => set('contactEmail', e.target.value)}
            placeholder="club@college.edu"
          />
        </Field>
        {err && <p className="field-error">{err}</p>}
      </div>
    </Modal>
  );
}

export default CreateClubModal;
