/**
 * TypeScript mirrors of the backend DTOs and enums.
 *
 * These types are hand-kept in sync with the Java records under
 * `com.campusconnect.dto`. The backend never exposes JPA entities directly, so
 * every shape here corresponds to a response/request DTO — not a database row.
 */

/* ------------------------------------------------------------------ */
/* Enums (mirror com.campusconnect.entity.enums)                       */
/* ------------------------------------------------------------------ */

export type Role = 'STUDENT' | 'CLUB_MEMBER' | 'CLUB_COORDINATOR' | 'ADMIN';

export type EventMode = 'ONLINE' | 'OFFLINE' | 'HYBRID';

export type EventStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'UPCOMING'
  | 'ONGOING'
  | 'COMPLETED'
  | 'CANCELLED';

export type RegistrationStatus =
  | 'REGISTERED'
  | 'CONFIRMED'
  | 'WAITLISTED'
  | 'CANCELLED';

export type RegistrationType = 'INDIVIDUAL' | 'TEAM';

export type AttendanceMethod = 'QR' | 'MANUAL';

export type CompetitionStatus = 'DRAFT' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export type CertificateType = 'PARTICIPATION' | 'WINNER' | 'MERIT';

export type CertificateRecipientScope = 'REGISTERED' | 'ATTENDED';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export type NotificationType =
  | 'REGISTRATION_CONFIRMATION'
  | 'EVENT_REMINDER'
  | 'SCHEDULE_UPDATE'
  | 'EVENT_CANCELLED'
  | 'ANNOUNCEMENT'
  | 'CERTIFICATE_ISSUED'
  | 'PAYMENT_UPDATE'
  | 'GENERAL';

export type AnnouncementScope = 'CLUB' | 'EVENT' | 'GENERAL';

export type ClubRole = 'MEMBER' | 'COORDINATOR';

export type MembershipStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'LEFT';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

/* ------------------------------------------------------------------ */
/* Generic envelopes                                                   */
/* ------------------------------------------------------------------ */

/** Standard response envelope returned by every endpoint. */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: unknown;
  timestamp?: string;
}

/** Pagination wrapper. */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

/** Returned by the upload endpoint; `url` is what we persist on entities. */
export interface UploadResponse {
  key: string;
  url: string;
  contentType: string;
  size: number;
  originalFilename: string;
}

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  studentId?: string;
  department?: string;
  phone?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponse;
}

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  studentId?: string;
  department?: string;
  phone?: string;
  profilePhotoUrl?: string;
  bio?: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  department?: string;
  phone?: string;
  bio?: string;
  profilePhotoUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/* ------------------------------------------------------------------ */
/* Admin (full-platform administration)                                */
/* ------------------------------------------------------------------ */

/** User row in the admin console — adds the account `enabled` flag. */
export interface AdminUserResponse {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  studentId?: string;
  department?: string;
  phone?: string;
  profilePhotoUrl?: string;
  enabled: boolean;
  emailVerified: boolean;
  createdAt: string;
}

/** Aggregated platform statistics for the admin dashboard. */
export interface PlatformStatsResponse {
  totalUsers: number;
  students: number;
  clubMembers: number;
  coordinators: number;
  admins: number;
  totalClubs: number;
  activeClubs: number;
  totalEvents: number;
  publishedEvents: number;
  totalRegistrations: number;
  successfulPayments: number;
  totalRevenue: number;
}

export interface AdminUpdateRoleRequest {
  role: Role;
}

export interface AdminUpdateUserStatusRequest {
  enabled: boolean;
}

/* ------------------------------------------------------------------ */
/* Clubs                                                               */
/* ------------------------------------------------------------------ */

export interface ClubResponse {
  id: number;
  name: string;
  description?: string;
  category?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  active: boolean;
  memberCount: number;
  eventCount: number;
  followerCount: number;
  /** Whether the current viewer follows this club (false when unauthenticated). */
  following: boolean;
  createdById: number;
  createdByName: string;
  createdAt: string;
}

export interface ClubRequest {
  name: string;
  description?: string;
  category?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface ClubMemberResponse {
  id: number;
  clubId: number;
  clubName: string;
  userId: number;
  fullName: string;
  email: string;
  clubRole: ClubRole;
  status: MembershipStatus;
  joinedAt: string;
}

/* ------------------------------------------------------------------ */
/* Events                                                              */
/* ------------------------------------------------------------------ */

export interface EventResponse {
  id: number;
  title: string;
  description?: string;
  category?: string;
  bannerUrl?: string;
  mode: EventMode;
  venue?: string;
  onlineUrl?: string;
  startDateTime: string;
  endDateTime: string;
  registrationDeadline?: string;
  capacity?: number;
  rules?: string;
  instructions?: string;
  status: EventStatus;
  paidEvent: boolean;
  fee?: number;
  teamEvent: boolean;
  minTeamSize?: number;
  maxTeamSize?: number;
  featured: boolean;
  clubId: number;
  clubName: string;
  createdById: number;
  createdByName: string;
  registeredCount: number;
  /** Whether the current viewer has saved/bookmarked this event (false when unauthenticated). */
  saved: boolean;
  createdAt: string;
}

export interface EventSummaryResponse {
  id: number;
  title: string;
  category?: string;
  mode: EventMode;
  venue?: string;
  bannerUrl?: string;
  startDateTime: string;
  endDateTime: string;
  registrationDeadline?: string;
  status: EventStatus;
  paidEvent: boolean;
  fee?: number;
  teamEvent: boolean;
  featured: boolean;
  capacity?: number;
  clubId: number;
  clubName: string;
  registeredCount: number;
  /** Whether the current viewer has saved/bookmarked this event (false when unauthenticated). */
  saved: boolean;
}

/* ------------------------------------------------------------------ */
/* Global search                                                       */
/* ------------------------------------------------------------------ */

/**
 * Aggregated result of a single free-text query. Each list holds the top few
 * matches per type; the `total*` counts report how many matched overall so the
 * UI can offer "view all" links. `users` is populated only for platform admins.
 */
export interface GlobalSearchResponse {
  events: EventSummaryResponse[];
  clubs: ClubResponse[];
  users: UserResponse[];
  totalEvents: number;
  totalClubs: number;
  totalUsers: number;
}

export interface EventRequest {
  title: string;
  description?: string;
  category?: string;
  bannerUrl?: string;
  mode: EventMode;
  venue?: string;
  onlineUrl?: string;
  startDateTime: string;
  endDateTime: string;
  registrationDeadline?: string;
  capacity?: number;
  rules?: string;
  instructions?: string;
  paidEvent: boolean;
  fee?: number;
  teamEvent: boolean;
  minTeamSize?: number;
  maxTeamSize?: number;
  featured?: boolean;
  clubId: number;
}

export interface EventScheduleResponse {
  id: number;
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime?: string;
  dayNumber?: number;
  speaker?: string;
  venue?: string;
}

export interface EventScheduleRequest {
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime?: string;
  dayNumber?: number;
  speaker?: string;
  venue?: string;
}

/* ------------------------------------------------------------------ */
/* Registration / Teams / Attendance                                   */
/* ------------------------------------------------------------------ */

export interface RegistrationRequest {
  eventId: number;
  teamId?: number;
}

export interface RegistrationResponse {
  id: number;
  eventId: number;
  eventTitle: string;
  userId: number;
  userName: string;
  teamId?: number;
  teamName?: string;
  type: RegistrationType;
  status: RegistrationStatus;
  ticketCode: string;
  createdAt: string;
}

export interface TeamRequest {
  name: string;
  eventId: number;
  maxSize?: number;
}

export interface AddTeamMemberRequest {
  email: string;
}

export interface TeamMemberResponse {
  id: number;
  teamId: number;
  userId: number;
  fullName: string;
  email: string;
  leader: boolean;
  joinedAt: string;
}

export interface TeamResponse {
  id: number;
  name: string;
  eventId: number;
  eventTitle: string;
  leaderId: number;
  leaderName: string;
  maxSize: number;
  memberCount: number;
  members: TeamMemberResponse[];
  createdAt: string;
}

export interface AttendanceResponse {
  id: number;
  registrationId: number;
  eventId: number;
  eventTitle: string;
  userId: number;
  userName: string;
  ticketCode: string;
  method: AttendanceMethod;
  checkInAt: string;
  checkOutAt?: string;
  markedById?: number;
  markedByName?: string;
}

export interface CheckInRequest {
  ticketCode: string;
}

export interface ManualCheckInRequest {
  registrationId: number;
}

/* ------------------------------------------------------------------ */
/* Payments                                                            */
/* ------------------------------------------------------------------ */

export interface PaymentInitiateRequest {
  eventId: number;
}

export interface PaymentResponse {
  id: number;
  eventId: number;
  eventTitle: string;
  userId: number;
  userName: string;
  amount: number;
  status: PaymentStatus;
  provider?: string;
  providerReference?: string;
  receiptNumber?: string;
  paidAt?: string;
  refundedAt?: string;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Audit log                                                           */
/* ------------------------------------------------------------------ */

export type AuditAction =
  | 'USER_ROLE_CHANGED'
  | 'USER_ENABLED'
  | 'USER_DISABLED'
  | 'USER_DELETED'
  | 'CLUB_ACTIVATED'
  | 'CLUB_DEACTIVATED'
  | 'CLUB_DELETED'
  | 'EVENT_STATUS_CHANGED'
  | 'EVENT_DELETED';

export interface AuditLogResponse {
  id: number;
  actorId?: number;
  actorName?: string;
  action: AuditAction;
  targetType?: string;
  targetId?: number;
  targetLabel?: string;
  detail?: string;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Competitions                                                        */
/* ------------------------------------------------------------------ */

export interface CompetitionResponse {
  id: number;
  eventId: number;
  eventTitle: string;
  title: string;
  description?: string;
  status: CompetitionStatus;
  teamBased: boolean;
  roundCount: number;
  judgeCount: number;
  createdAt: string;
}

export interface CompetitionRequest {
  eventId: number;
  title: string;
  description?: string;
  teamBased: boolean;
}

export interface UpdateCompetitionStatusRequest {
  status: CompetitionStatus;
}

export interface CompetitionRoundResponse {
  id: number;
  competitionId: number;
  name: string;
  roundNumber: number;
  description?: string;
  maxScore: number;
  scheduledAt?: string;
  createdAt: string;
}

export interface CompetitionRoundRequest {
  name: string;
  roundNumber: number;
  description?: string;
  maxScore: number;
  scheduledAt?: string;
}

export interface JudgeResponse {
  id: number;
  competitionId: number;
  userId: number;
  fullName: string;
  email: string;
}

export interface AddJudgeRequest {
  email: string;
}

export interface ScoreRequest {
  roundId: number;
  teamId?: number;
  participantId?: number;
  points: number;
  remarks?: string;
}

export interface ScoreResponse {
  id: number;
  roundId: number;
  roundName: string;
  judgeId: number;
  judgeName: string;
  teamId?: number;
  teamName?: string;
  participantId?: number;
  participantName?: string;
  points: number;
  remarks?: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  participantType: 'TEAM' | 'INDIVIDUAL';
  participantId: number;
  name: string;
  totalPoints: number;
}

/* ------------------------------------------------------------------ */
/* Certificates                                                        */
/* ------------------------------------------------------------------ */

export interface CertificateIssueRequest {
  email: string;
  eventId: number;
  type?: CertificateType;
  title?: string;
}

export interface CertificateResponse {
  id: number;
  userId: number;
  userName: string;
  eventId: number;
  eventTitle: string;
  type: CertificateType;
  title: string;
  certificateCode: string;
  verifyUrl: string;
  issuedAt: string;
  revoked: boolean;
  revokedAt?: string;
}

export interface CertificateVerificationResponse {
  valid: boolean;
  revoked: boolean;
  recipientName?: string;
  eventTitle?: string;
  type?: CertificateType;
  title?: string;
  issuedAt?: string;
  revokedAt?: string;
}

/**
 * Upsert payload for a certificate design. Every field except `name` is optional; the
 * backend coalesces omitted values to the stored template (or its defaults on first save).
 * Y positions are fractions of page height (0 = top, 1 = bottom); colours are `#RRGGBB`.
 */
export interface CertificateTemplateRequest {
  name: string;
  backgroundImageUrl?: string | null;

  titleText?: string;
  presentedToText?: string;
  bodyText?: string;

  showTitle?: boolean;
  showPresentedTo?: boolean;
  showBody?: boolean;
  showEvent?: boolean;
  showDate?: boolean;
  showQr?: boolean;

  titleY?: number;
  presentedToY?: number;
  nameY?: number;
  bodyY?: number;
  eventY?: number;
  dateY?: number;
  qrY?: number;

  titleFontSize?: number;
  nameFontSize?: number;
  bodyFontSize?: number;
  eventFontSize?: number;

  titleColor?: string;
  nameColor?: string;
  bodyColor?: string;

  requirePayment?: boolean;
  autoIssueOnComplete?: boolean;
  autoIssueScope?: CertificateRecipientScope;
  autoIssueType?: CertificateType;
}

/**
 * A certificate design. When `eventId` is null this is a reusable library template;
 * otherwise it is bound to that event.
 */
export interface CertificateTemplateResponse {
  id: number;
  name: string;
  eventId?: number | null;
  eventTitle?: string | null;
  backgroundImageUrl?: string | null;

  titleText?: string;
  presentedToText?: string;
  bodyText?: string;

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

  updatedAt?: string;
}

/** Outcome of a bulk certificate generation. */
export interface CertificateBatchResponse {
  issued: number;
  skipped: number;
  reasons: string[];
}

/**
 * A participant of a specific event eligible for a certificate, shown in the picker before a
 * targeted bulk generation. Always scoped to the one event.
 */
export interface CertificateParticipantResponse {
  userId: number;
  fullName: string;
  email: string;
  attended: boolean;
  paid: boolean;
  alreadyIssued: boolean;
}

/** Targeted bulk-issue payload: issue `type` to exactly the chosen participants. */
export interface CertificateBulkIssueRequest {
  userIds: number[];
  type?: CertificateType;
}

/* ------------------------------------------------------------------ */
/* Feedback                                                            */
/* ------------------------------------------------------------------ */

export interface FeedbackRequest {
  eventId: number;
  rating: number;
  comment?: string;
  suggestion?: string;
}

export interface FeedbackResponse {
  id: number;
  eventId: number;
  eventTitle: string;
  userId: number;
  userName: string;
  rating: number;
  comment?: string;
  suggestion?: string;
  createdAt: string;
}

export interface FeedbackSummary {
  eventId: number;
  averageRating: number;
  totalResponses: number;
  distribution: Record<number, number>;
}

/* ------------------------------------------------------------------ */
/* Announcements                                                       */
/* ------------------------------------------------------------------ */

export interface AnnouncementRequest {
  scope: AnnouncementScope;
  clubId?: number;
  eventId?: number;
  title: string;
  content: string;
  pinned: boolean;
}

export interface AnnouncementResponse {
  id: number;
  scope: AnnouncementScope;
  clubId?: number;
  clubName?: string;
  eventId?: number;
  eventTitle?: string;
  title: string;
  content: string;
  pinned: boolean;
  authorId: number;
  authorName: string;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export interface NotificationResponse {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

/** A user's email notification preferences. In-app notifications are always delivered. */
export interface NotificationPreferenceResponse {
  emailEnabled: boolean;
  emailOnEvents: boolean;
  emailOnAnnouncements: boolean;
  emailOnCertificates: boolean;
  emailOnPayments: boolean;
  emailOnGeneral: boolean;
}

/** Full replacement of email notification preferences (every flag required). */
export type NotificationPreferenceRequest = NotificationPreferenceResponse;

/* ------------------------------------------------------------------ */
/* Analytics                                                           */
/* ------------------------------------------------------------------ */

export interface EventStatsResponse {
  eventId: number;
  eventTitle: string;
  status: EventStatus;
  totalRegistrations: number;
  activeRegistrations: number;
  confirmed: number;
  waitlisted: number;
  cancelled: number;
  attendanceCount: number;
  attendanceRate: number;
  revenue: number;
  averageRating: number;
  feedbackCount: number;
}

export interface ClubDashboardResponse {
  clubId: number;
  clubName: string;
  totalEvents: number;
  upcomingEvents: number;
  totalMembers: number;
  totalRegistrations: number;
  totalAttendance: number;
  totalRevenue: number;
  averageRating: number;
  events: EventStatsResponse[];
}

/* ------------------------------------------------------------------ */
/* Volunteers                                                          */
/* ------------------------------------------------------------------ */

export interface VolunteerResponse {
  id: number;
  eventId: number;
  eventTitle: string;
  userId: number;
  userName: string;
  userEmail: string;
  approved: boolean;
  role?: string;
  taskCount: number;
  completedTaskCount: number;
  createdAt: string;
}

export interface VolunteerTaskResponse {
  id: number;
  volunteerId: number;
  eventId: number;
  eventTitle: string;
  assigneeId: number;
  assigneeName: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueAt?: string;
  createdAt: string;
}

export interface VolunteerApplyRequest {
  eventId: number;
  preferredRole?: string;
}

export interface RecruitVolunteerRequest {
  email: string;
  role?: string;
}

export interface VolunteerTaskRequest {
  title: string;
  description?: string;
  dueAt?: string;
}

export interface UpdateTaskStatusRequest {
  status: TaskStatus;
}

/* ------------------------------------------------------------------ */
/* Media gallery                                                       */
/* ------------------------------------------------------------------ */

export type MediaType = 'IMAGE' | 'VIDEO';

export interface MediaResponse {
  id: number;
  eventId?: number;
  eventTitle?: string;
  clubId?: number;
  clubName?: string;
  url: string;
  mediaType: MediaType;
  caption?: string;
  uploadedById?: number;
  uploadedByName?: string;
  createdAt: string;
}

export interface MediaRequest {
  eventId?: number;
  clubId?: number;
  url: string;
  mediaType: MediaType;
  caption?: string;
}

/* ------------------------------------------------------------------ */
/* Event discussion / Q&A                                              */
/* ------------------------------------------------------------------ */

export interface CommentResponse {
  id: number;
  eventId: number;
  authorId: number;
  authorName: string;
  authorPhotoUrl?: string;
  content: string;
  pinned: boolean;
  resolved: boolean;
  /** Author was an admin/coordinator of the hosting club when they posted. */
  fromOrganizer: boolean;
  edited: boolean;
  /** Present on replies; absent on top-level comments. */
  parentId?: number;
  createdAt: string;
  updatedAt: string;
  replyCount: number;
  /** Nested replies (only populated on top-level comments). */
  replies: CommentResponse[];
}

export interface CommentRequest {
  content: string;
  /** Set to reply to an existing comment; omit for a new top-level comment/question. */
  parentId?: number;
}

export interface CommentUpdateRequest {
  content: string;
}
