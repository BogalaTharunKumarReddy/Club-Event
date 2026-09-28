/**
 * Application-wide constants and small lookup tables.
 *
 * NOTE: nothing secret belongs in here — this file is bundled into the client.
 * Backend base URLs come from `import.meta.env` (see `.env.example`).
 */

import type {
  Role,
  EventStatus,
  EventMode,
  RegistrationStatus,
  CompetitionStatus,
  PaymentStatus,
  MembershipStatus,
  CertificateType,
  CertificateRecipientScope,
  AuditAction,
<<<<<<< HEAD
  VolunteerStatus,
  VolunteerTaskStatus,
  VolunteerTaskPriority,
  VolunteerAttendanceStatus,
  VolunteerAssignmentStatus,
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
} from '@/types';

/** Base URL for REST calls. Defaults to the Vite dev-proxy path. */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/** Base URL for the SockJS/STOMP endpoint. */
export const WS_URL = import.meta.env.VITE_WS_URL || '/ws';

/**
 * Keys used for the browser-side token store.
 *
 * These hold the runtime JWTs issued to the logged-in user — they are NOT
 * application secrets and never ship inside the source bundle. For hardened
 * deployments, prefer serving these as httpOnly cookies from the backend; this
 * SPA uses Bearer-header auth, so the tokens live in localStorage here.
 */
export const STORAGE_KEYS = {
  accessToken: 'cc.accessToken',
  refreshToken: 'cc.refreshToken',
  theme: 'cc.theme',
  language: 'cc.language',
<<<<<<< HEAD
  sidebarCollapsed: 'cc.sidebarCollapsed',
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
} as const;

export const ROLE_LABELS: Record<Role, string> = {
  STUDENT: 'Student',
<<<<<<< HEAD
  VOLUNTEER: 'Volunteer',
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
  CLUB_MEMBER: 'Club Member',
  CLUB_COORDINATOR: 'Club Coordinator',
  ADMIN: 'Administrator',
};

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  UPCOMING: 'Upcoming',
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

/** Tailwind badge classes per event status (light + dark). */
export const EVENT_STATUS_STYLES: Record<EventStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
  PUBLISHED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  UPCOMING: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  ONGOING: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  COMPLETED: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

export const EVENT_MODE_LABELS: Record<EventMode, string> = {
  ONLINE: 'Online',
  OFFLINE: 'In person',
  HYBRID: 'Hybrid',
};

export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  REGISTERED: 'Registered',
  CONFIRMED: 'Confirmed',
  WAITLISTED: 'Waitlisted',
  CANCELLED: 'Cancelled',
};

export const REGISTRATION_STATUS_STYLES: Record<RegistrationStatus, string> = {
  REGISTERED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  CONFIRMED: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  WAITLISTED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

export const COMPETITION_STATUS_LABELS: Record<CompetitionStatus, string> = {
  DRAFT: 'Draft',
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Pending',
  SUCCESS: 'Paid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
};

export const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  SUCCESS: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  FAILED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  REFUNDED: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

export const MEMBERSHIP_STATUS_LABELS: Record<MembershipStatus, string> = {
  PENDING: 'Pending',
  ACTIVE: 'Active',
  REJECTED: 'Rejected',
  LEFT: 'Left',
};

<<<<<<< HEAD
/* ------------------------------ volunteers ------------------------------ */

export const VOLUNTEER_STATUS_LABELS: Record<VolunteerStatus, string> = {
  PENDING: 'Pending approval',
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended',
};

export const VOLUNTEER_STATUS_STYLES: Record<VolunteerStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  INACTIVE: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  SUSPENDED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

export const VOLUNTEER_TASK_STATUS_LABELS: Record<VolunteerTaskStatus, string> = {
  PENDING: 'To do',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const VOLUNTEER_TASK_STATUS_STYLES: Record<VolunteerTaskStatus, string> = {
  PENDING: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

export const VOLUNTEER_TASK_PRIORITY_LABELS: Record<VolunteerTaskPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export const VOLUNTEER_TASK_PRIORITY_STYLES: Record<VolunteerTaskPriority, string> = {
  LOW: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  HIGH: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  URGENT: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

export const VOLUNTEER_ATTENDANCE_STATUS_LABELS: Record<VolunteerAttendanceStatus, string> = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  LATE: 'Late',
  EXCUSED: 'Excused',
};

export const VOLUNTEER_ATTENDANCE_STATUS_STYLES: Record<VolunteerAttendanceStatus, string> = {
  PRESENT: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  ABSENT: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  LATE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  EXCUSED: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

export const VOLUNTEER_ASSIGNMENT_STATUS_LABELS: Record<VolunteerAssignmentStatus, string> = {
  ASSIGNED: 'Assigned',
  ACCEPTED: 'Accepted',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const VOLUNTEER_ASSIGNMENT_STATUS_STYLES: Record<VolunteerAssignmentStatus, string> = {
  ASSIGNED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  ACCEPTED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
export const CERTIFICATE_TYPE_LABELS: Record<CertificateType, string> = {
  PARTICIPATION: 'Participation',
  WINNER: 'Winner',
  MERIT: 'Merit',
};

export const CERTIFICATE_SCOPE_LABELS: Record<CertificateRecipientScope, string> = {
  REGISTERED: 'All registered participants',
  ATTENDED: 'Only those who attended',
};

/** Human-readable labels for admin audit-log actions. */
export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  USER_ROLE_CHANGED: 'Role changed',
  USER_ENABLED: 'User enabled',
  USER_DISABLED: 'User disabled',
  USER_DELETED: 'User deleted',
  CLUB_ACTIVATED: 'Club activated',
  CLUB_DEACTIVATED: 'Club deactivated',
  CLUB_DELETED: 'Club deleted',
  EVENT_STATUS_CHANGED: 'Event status changed',
  EVENT_DELETED: 'Event deleted',
};

/** Tailwind badge classes per audit action group (light + dark). */
export const AUDIT_ACTION_STYLES: Record<AuditAction, string> = {
  USER_ROLE_CHANGED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  USER_ENABLED: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  USER_DISABLED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  USER_DELETED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  CLUB_ACTIVATED: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  CLUB_DEACTIVATED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  CLUB_DELETED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  EVENT_STATUS_CHANGED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  EVENT_DELETED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

/** Roles allowed to reach coordinator-only areas of the UI. */
export const COORDINATOR_ROLES: Role[] = ['CLUB_COORDINATOR'];

/** Roles that can access club-management areas (members + coordinators). */
export const CLUB_STAFF_ROLES: Role[] = ['CLUB_MEMBER', 'CLUB_COORDINATOR'];

/** Roles allowed to reach the full-platform admin console. */
export const ADMIN_ROLES: Role[] = ['ADMIN'];

<<<<<<< HEAD
/** Roles allowed to reach the volunteer workspace. */
export const VOLUNTEER_ROLES: Role[] = ['VOLUNTEER'];

=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
export const DEFAULT_PAGE_SIZE = 12;

export const EVENT_CATEGORIES = [
  'Technical',
  'Cultural',
  'Sports',
  'Workshop',
  'Seminar',
  'Hackathon',
  'Competition',
  'Social',
  'Other',
];
