/**
 * Reusable certificate-design editor.
 *
 * Drives a {@link CertificateTemplateRequest}: a full-bleed background image (URL or
 * data-URL) with the recipient name, event, date, title and a verification QR overlaid
 * at configurable positions. A live preview mirrors the server-side OpenPDF layout so
 * coordinators and admins can see roughly what a participant will download.
 *
 * Shared by the coordinator event-certificate tab and the admin template library, so it
 * carries the payment-gate and auto-issue controls too; callers decide whether to show them.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Award, QrCode } from 'lucide-react';
import { Button, Field, Select, TextArea, TextInput } from '@/components/ui';
import { CERTIFICATE_SCOPE_LABELS, CERTIFICATE_TYPE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type {
  CertificateRecipientScope,
  CertificateTemplateRequest,
  CertificateTemplateResponse,
  CertificateType,
} from '@/types';

/** Approx. A4-landscape width in PostScript points — used to scale preview fonts. */
const PAGE_WIDTH_PT = 842;

const CERT_TYPES: CertificateType[] = ['PARTICIPATION', 'WINNER', 'MERIT'];
const CERT_SCOPES: CertificateRecipientScope[] = ['REGISTERED', 'ATTENDED'];

interface TemplateDraft {
  name: string;
  backgroundImageUrl: string;
  titleText: string;
  presentedToText: string;
  bodyText: string;
  showTitle: boolean;
  showPresentedTo: boolean;
  showBody: boolean;
  showEvent: boolean;
  showDate: boolean;
  showQr: boolean;
  titleY: number;
  presentedToY: number;
  nameY: number;
  bodyY: number;
  eventY: number;
  dateY: number;
  qrY: number;
  titleFontSize: number;
  nameFontSize: number;
  bodyFontSize: number;
  eventFontSize: number;
  titleColor: string;
  nameColor: string;
  bodyColor: string;
  requirePayment: boolean;
  autoIssueOnComplete: boolean;
  autoIssueScope: CertificateRecipientScope;
  autoIssueType: CertificateType;
}

/** Design defaults — mirror the backend CertificateTemplate entity defaults. */
const DEFAULT_DRAFT: TemplateDraft = {
  name: '',
  backgroundImageUrl: '',
  titleText: 'Certificate of Participation',
  presentedToText: 'This is proudly presented to',
  bodyText: 'for outstanding participation in',
  showTitle: true,
  showPresentedTo: true,
  showBody: true,
  showEvent: true,
  showDate: true,
  showQr: true,
  titleY: 0.24,
  presentedToY: 0.36,
  nameY: 0.46,
  bodyY: 0.57,
  eventY: 0.64,
  dateY: 0.75,
  qrY: 0.86,
  titleFontSize: 30,
  nameFontSize: 34,
  bodyFontSize: 14,
  eventFontSize: 20,
  titleColor: '#1E3A8A',
  nameColor: '#0F172A',
  bodyColor: '#334155',
  requirePayment: false,
  autoIssueOnComplete: false,
  autoIssueScope: 'ATTENDED',
  autoIssueType: 'PARTICIPATION',
};

function fromResponse(t: CertificateTemplateResponse): TemplateDraft {
  return {
    name: t.name ?? '',
    backgroundImageUrl: t.backgroundImageUrl ?? '',
    titleText: t.titleText ?? DEFAULT_DRAFT.titleText,
    presentedToText: t.presentedToText ?? DEFAULT_DRAFT.presentedToText,
    bodyText: t.bodyText ?? DEFAULT_DRAFT.bodyText,
    showTitle: t.showTitle,
    showPresentedTo: t.showPresentedTo,
    showBody: t.showBody,
    showEvent: t.showEvent,
    showDate: t.showDate,
    showQr: t.showQr,
    titleY: t.titleY,
    presentedToY: t.presentedToY,
    nameY: t.nameY,
    bodyY: t.bodyY,
    eventY: t.eventY,
    dateY: t.dateY,
    qrY: t.qrY,
    titleFontSize: t.titleFontSize,
    nameFontSize: t.nameFontSize,
    bodyFontSize: t.bodyFontSize,
    eventFontSize: t.eventFontSize,
    titleColor: t.titleColor ?? DEFAULT_DRAFT.titleColor,
    nameColor: t.nameColor ?? DEFAULT_DRAFT.nameColor,
    bodyColor: t.bodyColor ?? DEFAULT_DRAFT.bodyColor,
    requirePayment: t.requirePayment,
    autoIssueOnComplete: t.autoIssueOnComplete,
    autoIssueScope: t.autoIssueScope ?? DEFAULT_DRAFT.autoIssueScope,
    autoIssueType: t.autoIssueType ?? DEFAULT_DRAFT.autoIssueType,
  };
}

function toRequest(d: TemplateDraft): CertificateTemplateRequest {
  const bg = d.backgroundImageUrl.trim();
  return {
    name: d.name.trim(),
    backgroundImageUrl: bg === '' ? null : bg,
    titleText: d.titleText,
    presentedToText: d.presentedToText,
    bodyText: d.bodyText,
    showTitle: d.showTitle,
    showPresentedTo: d.showPresentedTo,
    showBody: d.showBody,
    showEvent: d.showEvent,
    showDate: d.showDate,
    showQr: d.showQr,
    titleY: d.titleY,
    presentedToY: d.presentedToY,
    nameY: d.nameY,
    bodyY: d.bodyY,
    eventY: d.eventY,
    dateY: d.dateY,
    qrY: d.qrY,
    titleFontSize: d.titleFontSize,
    nameFontSize: d.nameFontSize,
    bodyFontSize: d.bodyFontSize,
    eventFontSize: d.eventFontSize,
    titleColor: d.titleColor,
    nameColor: d.nameColor,
    bodyColor: d.bodyColor,
    requirePayment: d.requirePayment,
    autoIssueOnComplete: d.autoIssueOnComplete,
    autoIssueScope: d.autoIssueScope,
    autoIssueType: d.autoIssueType,
  };
}

/* ------------------------------ small controls ------------------------------ */

function CheckboxRow({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 py-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800"
      />
      <span className="text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
        {hint && <span className="block text-xs text-slate-400">{hint}</span>}
      </span>
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <Field label={label}>
      <TextInput
        type="number"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? value : ''}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
        }}
      />
    </Field>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <TextInput
          type="color"
          value={(value || '#000000').toLowerCase()}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 cursor-pointer p-1"
          aria-label={label}
        />
        <TextInput
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 font-mono text-sm uppercase"
          maxLength={7}
        />
      </div>
    </Field>
  );
}

/* -------------------------------- preview -------------------------------- */

function PreviewLine({
  show,
  y,
  fontPx,
  color,
  bold,
  children,
}: {
  show: boolean;
  y: number;
  fontPx: number;
  color?: string;
  bold?: boolean;
  children: ReactNode;
}) {
  if (!show) return null;
  return (
    <span
      className={cn(
        'absolute w-full -translate-y-1/2 px-[6%] text-center leading-tight',
        bold ? 'font-semibold' : 'font-medium',
      )}
      style={{ top: `${y * 100}%`, fontSize: `${fontPx}px`, color }}
    >
      {children}
    </span>
  );
}

/* --------------------------------- form ---------------------------------- */

export interface CertificateTemplateFormProps {
  /** Existing template to edit; omit for a fresh design. */
  initial?: CertificateTemplateResponse | null;
  /** Pre-fill the name for a brand-new template (e.g. the event title). */
  defaultName?: string;
  saving?: boolean;
  submitLabel?: string;
  /** Show the payment-gate + auto-issue controls (event templates). */
  showIssueSettings?: boolean;
  onSubmit: (req: CertificateTemplateRequest) => void | Promise<void>;
  /** Extra actions rendered beside the submit button (e.g. Cancel). */
  extraActions?: ReactNode;
}

export function CertificateTemplateForm({
  initial,
  defaultName,
  saving = false,
  submitLabel = 'Save design',
  showIssueSettings = true,
  onSubmit,
  extraActions,
}: CertificateTemplateFormProps) {
  const [draft, setDraft] = useState<TemplateDraft>(() =>
    initial
      ? fromResponse(initial)
      : { ...DEFAULT_DRAFT, name: defaultName ?? '' },
  );

  // Re-seed when the incoming template identity changes (e.g. editing a different row).
  const seededId = useRef<number | 'new'>(initial?.id ?? 'new');
  useEffect(() => {
    const id = initial?.id ?? 'new';
    if (id !== seededId.current) {
      seededId.current = id;
      setDraft(initial ? fromResponse(initial) : { ...DEFAULT_DRAFT, name: defaultName ?? '' });
    }
  }, [initial, defaultName]);

  // Track the preview width so overlaid text scales like the real A4 page.
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [previewW, setPreviewW] = useState(640);
  useEffect(() => {
    const el = previewRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setPreviewW(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = previewW / PAGE_WIDTH_PT;
  function set<K extends keyof TemplateDraft>(key: K, value: TemplateDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    void onSubmit(toRequest(draft));
  }

  const today = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* -------- controls -------- */}
      <div className="space-y-5">
        <Field label="Template name" htmlFor="tpl-name" required>
          <TextInput
            id="tpl-name"
            value={draft.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Hackathon 2026 — Participation"
          />
        </Field>

        <Field
          label="Background image URL"
          htmlFor="tpl-bg"
          hint="Paste a link to your certificate background (landscape works best). A data: URL is fine too. Leave blank for a plain bordered layout."
        >
          <TextInput
            id="tpl-bg"
            value={draft.backgroundImageUrl}
            onChange={(e) => set('backgroundImageUrl', e.target.value)}
            placeholder="https://…/certificate-background.png"
          />
        </Field>

        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Text content
          </p>
          <div className="space-y-3">
            <Field label="Title" htmlFor="tpl-title">
              <TextInput
                id="tpl-title"
                value={draft.titleText}
                onChange={(e) => set('titleText', e.target.value)}
              />
            </Field>
            <Field label="Presented-to line" htmlFor="tpl-presented">
              <TextInput
                id="tpl-presented"
                value={draft.presentedToText}
                onChange={(e) => set('presentedToText', e.target.value)}
              />
            </Field>
            <Field label="Body line" htmlFor="tpl-body" hint="Shown above the event title.">
              <TextArea
                id="tpl-body"
                rows={2}
                value={draft.bodyText}
                onChange={(e) => set('bodyText', e.target.value)}
              />
            </Field>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Visible elements
          </p>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <CheckboxRow label="Title" checked={draft.showTitle} onChange={(v) => set('showTitle', v)} />
            <CheckboxRow
              label="Presented-to line"
              checked={draft.showPresentedTo}
              onChange={(v) => set('showPresentedTo', v)}
            />
            <CheckboxRow label="Body line" checked={draft.showBody} onChange={(v) => set('showBody', v)} />
            <CheckboxRow label="Event title" checked={draft.showEvent} onChange={(v) => set('showEvent', v)} />
            <CheckboxRow label="Issue date" checked={draft.showDate} onChange={(v) => set('showDate', v)} />
            <CheckboxRow
              label="Verification QR"
              checked={draft.showQr}
              onChange={(v) => set('showQr', v)}
              hint="Links to the public verify page."
            />
          </div>
        </div>

        <details className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-slate-500">
            Layout &amp; typography
          </summary>
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <NumberField label="Title Y" value={draft.titleY} onChange={(v) => set('titleY', v)} min={0} max={1} step={0.01} />
              <NumberField label="Presented Y" value={draft.presentedToY} onChange={(v) => set('presentedToY', v)} min={0} max={1} step={0.01} />
              <NumberField label="Name Y" value={draft.nameY} onChange={(v) => set('nameY', v)} min={0} max={1} step={0.01} />
              <NumberField label="Body Y" value={draft.bodyY} onChange={(v) => set('bodyY', v)} min={0} max={1} step={0.01} />
              <NumberField label="Event Y" value={draft.eventY} onChange={(v) => set('eventY', v)} min={0} max={1} step={0.01} />
              <NumberField label="Date Y" value={draft.dateY} onChange={(v) => set('dateY', v)} min={0} max={1} step={0.01} />
              <NumberField label="QR Y" value={draft.qrY} onChange={(v) => set('qrY', v)} min={0} max={1} step={0.01} />
            </div>
            <p className="text-xs text-slate-400">
              Y is a fraction of page height: 0 is the top edge, 1 is the bottom.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <NumberField label="Title size" value={draft.titleFontSize} onChange={(v) => set('titleFontSize', v)} min={6} max={120} step={1} />
              <NumberField label="Name size" value={draft.nameFontSize} onChange={(v) => set('nameFontSize', v)} min={6} max={120} step={1} />
              <NumberField label="Body size" value={draft.bodyFontSize} onChange={(v) => set('bodyFontSize', v)} min={6} max={120} step={1} />
              <NumberField label="Event size" value={draft.eventFontSize} onChange={(v) => set('eventFontSize', v)} min={6} max={120} step={1} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <ColorField label="Title colour" value={draft.titleColor} onChange={(v) => set('titleColor', v)} />
              <ColorField label="Name colour" value={draft.nameColor} onChange={(v) => set('nameColor', v)} />
              <ColorField label="Body colour" value={draft.bodyColor} onChange={(v) => set('bodyColor', v)} />
            </div>
          </div>
        </details>

        {showIssueSettings && (
          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Issuing rules
            </p>
            <div className="space-y-3">
              <CheckboxRow
                label="Require successful payment"
                checked={draft.requirePayment}
                onChange={(v) => set('requirePayment', v)}
                hint="For paid events, only participants who have paid can receive a certificate."
              />
              <CheckboxRow
                label="Auto-issue when the event is completed"
                checked={draft.autoIssueOnComplete}
                onChange={(v) => set('autoIssueOnComplete', v)}
                hint="Certificates are generated automatically the moment the event is marked completed."
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Auto-issue recipients" htmlFor="tpl-scope">
                  <Select
                    id="tpl-scope"
                    value={draft.autoIssueScope}
                    onChange={(e) => set('autoIssueScope', e.target.value as CertificateRecipientScope)}
                    disabled={!draft.autoIssueOnComplete}
                  >
                    {CERT_SCOPES.map((s) => (
                      <option key={s} value={s}>
                        {CERTIFICATE_SCOPE_LABELS[s]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Auto-issue type" htmlFor="tpl-autotype">
                  <Select
                    id="tpl-autotype"
                    value={draft.autoIssueType}
                    onChange={(e) => set('autoIssueType', e.target.value as CertificateType)}
                    disabled={!draft.autoIssueOnComplete}
                  >
                    {CERT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {CERTIFICATE_TYPE_LABELS[t]}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" loading={saving}>
            {submitLabel}
          </Button>
          {extraActions}
        </div>
      </div>

      {/* -------- live preview -------- */}
      <div className="lg:sticky lg:top-4 lg:self-start">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Preview
        </p>
        <div
          ref={previewRef}
          className="relative w-full overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm dark:border-slate-700"
          style={{ aspectRatio: '297 / 210' }}
        >
          {draft.backgroundImageUrl.trim() ? (
            <img
              src={draft.backgroundImageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="absolute inset-[4%] rounded border-2 border-double border-slate-300" />
          )}

          <PreviewLine show={draft.showTitle} y={draft.titleY} fontPx={draft.titleFontSize * scale} color={draft.titleColor} bold>
            {draft.titleText || 'Certificate'}
          </PreviewLine>
          <PreviewLine show={draft.showPresentedTo} y={draft.presentedToY} fontPx={draft.bodyFontSize * scale} color={draft.bodyColor}>
            {draft.presentedToText}
          </PreviewLine>
          <PreviewLine show y={draft.nameY} fontPx={draft.nameFontSize * scale} color={draft.nameColor} bold>
            Recipient Name
          </PreviewLine>
          <PreviewLine show={draft.showBody} y={draft.bodyY} fontPx={draft.bodyFontSize * scale} color={draft.bodyColor}>
            {draft.bodyText}
          </PreviewLine>
          <PreviewLine show={draft.showEvent} y={draft.eventY} fontPx={draft.eventFontSize * scale} color={draft.titleColor} bold>
            Event Title
          </PreviewLine>
          <PreviewLine show={draft.showDate} y={draft.dateY} fontPx={draft.bodyFontSize * scale} color={draft.bodyColor}>
            {today}
          </PreviewLine>
          {draft.showQr && (
            <span
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded bg-white/90 p-1 text-slate-500 shadow"
              style={{ top: `${draft.qrY * 100}%`, left: '50%' }}
              aria-hidden
            >
              <QrCode style={{ width: `${64 * scale}px`, height: `${64 * scale}px` }} />
            </span>
          )}
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
          <Award className="h-3.5 w-3.5" /> Approximate layout — the downloaded PDF renders on a full A4 page.
        </p>
      </div>
    </form>
  );
}
