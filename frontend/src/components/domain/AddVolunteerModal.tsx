import { useState } from 'react';
import { Mail, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { volunteerService } from '@/lib/services';
import { errorMessage } from '@/lib/utils';
import { Button, Field, Modal, TextArea, TextInput } from '@/components/ui';

/**
 * Add a registered user as a volunteer for a club, by their account email.
 *
 * Shared by the coordinator Manage console and the public club page so members,
 * coordinators and admins all use one implementation. Authorization (active
 * member / coordinator / admin) is enforced by the backend; the caller decides
 * whether to render the trigger.
 */
export function AddVolunteerModal({
  open,
  onClose,
  clubId,
  clubName,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  clubId: number;
  clubName: string;
  /** Called after a volunteer is added successfully (e.g. to close + reload). */
  onAdded: () => void;
}) {
  const [email, setEmail] = useState('');
  const [skills, setSkills] = useState('');
  const [availability, setAvailability] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function reset() {
    setEmail('');
    setSkills('');
    setAvailability('');
    setErr(null);
  }

  async function submit() {
    if (!email.trim()) {
      setErr('Enter the volunteer’s account email.');
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await volunteerService.addVolunteer(clubId, {
        email: email.trim(),
        skills: skills.trim() || undefined,
        availability: availability.trim() || undefined,
      });
      toast.success('Volunteer added.');
      reset();
      onAdded();
    } catch (e) {
      setErr(
        errorMessage(
          e,
          'Could not add volunteer. Check the email belongs to a registered CampusConnect account.',
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={busy ? () => undefined : onClose}
      title={`Add volunteer · ${clubName}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} loading={busy}>
            <UserPlus className="h-4 w-4" /> Add volunteer
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Account email" htmlFor="vol-email" required>
          <TextInput
            id="vol-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@university.edu"
            autoFocus
          />
        </Field>
        <p className="-mt-2 flex items-center gap-1.5 text-xs text-slate-400">
          <Mail className="h-3.5 w-3.5" /> The person must already have a CampusConnect account.
        </p>
        <Field label="Skills" htmlFor="vol-skills">
          <TextInput
            id="vol-skills"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="e.g. Photography, first aid, registration desk"
          />
        </Field>
        <Field label="Availability" htmlFor="vol-availability">
          <TextArea
            id="vol-availability"
            rows={2}
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            placeholder="e.g. Weekends, evening shifts"
          />
        </Field>
        {err && <p className="field-error">{err}</p>}
      </div>
    </Modal>
  );
}
