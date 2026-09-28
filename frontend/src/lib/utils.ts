/** Small presentation + browser helpers shared across the UI. */

import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

/** Join class names, dropping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

/** Parse an ISO string / epoch into a Date, or null when unparseable. */
function toDate(value?: string | number | Date | null): Date | null {
  if (value === undefined || value === null || value === '') return null;
  const d =
    value instanceof Date
      ? value
      : typeof value === 'number'
        ? new Date(value)
        : parseISO(value);
  return isValid(d) ? d : null;
}

export function formatDate(value?: string | number | Date | null): string {
  const d = toDate(value);
  return d ? format(d, 'dd MMM yyyy') : '—';
}

export function formatDateTime(value?: string | number | Date | null): string {
  const d = toDate(value);
  return d ? format(d, 'dd MMM yyyy, h:mm a') : '—';
}

export function formatTime(value?: string | number | Date | null): string {
  const d = toDate(value);
  return d ? format(d, 'h:mm a') : '—';
}

export function fromNow(value?: string | number | Date | null): string {
  const d = toDate(value);
  return d ? formatDistanceToNow(d, { addSuffix: true }) : '';
}

/** Currency formatting. Backend fees are INR by convention for this app. */
export function formatCurrency(amount?: number | null, currency = 'INR'): string {
  if (amount === undefined || amount === null) return '—';
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount}`;
  }
}

/** Deadline / start helpers. */
export function isPast(value?: string | number | Date | null): boolean {
  const d = toDate(value);
  return d ? d.getTime() < Date.now() : false;
}

export function initials(name?: string | null): string {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

/** Trigger a browser download for a Blob (used for certificate PDFs / reports). */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoke on the next tick so the download has a chance to start.
  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}

/** Pull a user-friendly message out of an unknown thrown value. */
export function errorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  if (err && typeof err === 'object' && 'message' in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === 'string' && m.trim()) return m;
  }
  return fallback;
}
