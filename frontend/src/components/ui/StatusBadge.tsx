import { Badge } from './Badge';
import {
  EVENT_STATUS_LABELS,
  EVENT_STATUS_STYLES,
  REGISTRATION_STATUS_LABELS,
  REGISTRATION_STATUS_STYLES,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_STYLES,
  COMPETITION_STATUS_LABELS,
} from '@/lib/constants';
import type {
  EventStatus,
  RegistrationStatus,
  PaymentStatus,
  CompetitionStatus,
} from '@/types';

export function EventStatusBadge({ status }: { status: EventStatus }) {
  return <Badge className={EVENT_STATUS_STYLES[status]}>{EVENT_STATUS_LABELS[status]}</Badge>;
}

export function RegistrationStatusBadge({ status }: { status: RegistrationStatus }) {
  return (
    <Badge className={REGISTRATION_STATUS_STYLES[status]}>
      {REGISTRATION_STATUS_LABELS[status]}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge className={PAYMENT_STATUS_STYLES[status]}>{PAYMENT_STATUS_LABELS[status]}</Badge>
  );
}

const COMPETITION_STATUS_STYLES: Record<CompetitionStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
  ONGOING: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  COMPLETED: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

export function CompetitionStatusBadge({ status }: { status: CompetitionStatus }) {
  return (
    <Badge className={COMPETITION_STATUS_STYLES[status]}>
      {COMPETITION_STATUS_LABELS[status]}
    </Badge>
  );
}
