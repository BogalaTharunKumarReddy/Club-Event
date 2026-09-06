import { useState } from 'react';
import { Award, ImageIcon, Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { certificateService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { CERTIFICATE_SCOPE_LABELS } from '@/lib/constants';
import { errorMessage, formatDate } from '@/lib/utils';
import { PageContainer } from '@/components/layout/RootLayout';
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Modal,
  PageHeader,
  Skeleton,
} from '@/components/ui';
import { CertificateTemplateForm } from '@/components/domain/CertificateTemplateForm';
import type {
  CertificateTemplateRequest,
  CertificateTemplateResponse,
} from '@/types';

/**
 * Reusable certificate template library (platform admin only).
 *
 * Templates created here are not bound to any event; a coordinator or admin can apply one
 * to an event from its certificate tab, copying the design onto that event. Managing the
 * library keeps a consistent, on-brand look across every club's certificates.
 */
export default function AdminCertificatesPage() {
  const { data, loading, error, reload } = useQuery(
    () => certificateService.listTemplates(),
    [],
  );

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<CertificateTemplateResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<CertificateTemplateResponse | null>(null);

  async function create(req: CertificateTemplateRequest) {
    setSaving(true);
    try {
      await certificateService.createTemplate(req);
      toast.success('Template created.');
      setCreating(false);
      reload();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not create the template.'));
    } finally {
      setSaving(false);
    }
  }

  async function update(req: CertificateTemplateRequest) {
    if (!editing) return;
    setSaving(true);
    try {
      await certificateService.updateTemplate(editing.id, req);
      toast.success('Template updated.');
      setEditing(null);
      reload();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update the template.'));
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await certificateService.deleteTemplate(toDelete.id);
      toast.success('Template deleted.');
      reload();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete the template.'));
      throw err;
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Certificate templates"
        description="Reusable certificate designs coordinators can apply to any event."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> New template
          </Button>
        }
      />

      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : !data || data.length === 0 ? (
          <EmptyState
            icon={<Award className="h-6 w-6" />}
            title="No templates yet"
            description="Create a reusable certificate design that coordinators can apply to their events."
            action={
              <Button onClick={() => setCreating(true)}>
                <Plus className="h-4 w-4" /> New template
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((t) => (
              <div key={t.id} className="card flex flex-col overflow-hidden">
                <div
                  className="relative flex items-center justify-center border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50"
                  style={{ aspectRatio: '297 / 210' }}
                >
                  {t.backgroundImageUrl ? (
                    <img
                      src={t.backgroundImageUrl}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-300 dark:text-slate-600">
                      <ImageIcon className="h-8 w-8" />
                      <span className="text-xs">No background</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                    {t.name}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {t.requirePayment && (
                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                        Requires payment
                      </Badge>
                    )}
                    {t.autoIssueOnComplete && (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        Auto-issue · {CERTIFICATE_SCOPE_LABELS[t.autoIssueScope]}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    {t.updatedAt ? `Updated ${formatDate(t.updatedAt)}` : 'Newly created'}
                  </p>
                  <div className="mt-4 flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditing(t)}
                      className="flex-1"
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setToDelete(t)}
                      aria-label={`Delete ${t.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="New certificate template"
        size="xl"
      >
        <CertificateTemplateForm
          saving={saving}
          submitLabel="Create template"
          showIssueSettings
          onSubmit={create}
          extraActions={
            <Button type="button" variant="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
          }
        />
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit certificate template"
        size="xl"
      >
        <CertificateTemplateForm
          initial={editing}
          saving={saving}
          submitLabel="Save changes"
          showIssueSettings
          onSubmit={update}
          extraActions={
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          }
        />
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete this template?"
        message={
          toDelete
            ? `"${toDelete.name}" will be removed from the library. Events that already use its design keep their own copy.`
            : ''
        }
        confirmLabel="Delete"
        danger
      />
    </PageContainer>
  );
}
