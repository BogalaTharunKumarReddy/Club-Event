/**
 * Typed service layer — one function per backend endpoint, grouped by domain.
 *
 * Components call these instead of touching axios directly, so the REST contract
 * lives in exactly one place and stays aligned with the Spring controllers.
 */

import { api } from './api';
import type {
  AddJudgeRequest,
  AddTeamMemberRequest,
  AdminUpdateRoleRequest,
  AdminUpdateUserStatusRequest,
  AdminUserResponse,
  AnnouncementRequest,
  AnnouncementResponse,
<<<<<<< HEAD
  AssistantChatRequest,
  AssistantChatResponse,
  AssistantStatusResponse,
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
  AttendanceResponse,
  AuditAction,
  AuditLogResponse,
  AuthResponse,
  CertificateBatchResponse,
  CertificateBulkIssueRequest,
  CertificateIssueRequest,
  CertificateParticipantResponse,
  CertificateRecipientScope,
  CertificateResponse,
  CertificateTemplateRequest,
  CertificateTemplateResponse,
  CertificateType,
  CertificateVerificationResponse,
  ChangePasswordRequest,
  CheckInRequest,
  ClubDashboardResponse,
  ClubMemberResponse,
  ClubRequest,
  ClubResponse,
  CompetitionRequest,
  CompetitionResponse,
  CompetitionRoundRequest,
  CompetitionRoundResponse,
  CommentRequest,
  CommentResponse,
  CommentUpdateRequest,
  EventRequest,
  EventResponse,
  EventScheduleRequest,
  EventScheduleResponse,
  EventStatsResponse,
  EventStatus,
  EventSummaryResponse,
  FeedbackRequest,
  FeedbackResponse,
  FeedbackSummary,
  ForgotPasswordRequest,
  GlobalSearchResponse,
  JudgeResponse,
  LeaderboardEntry,
<<<<<<< HEAD
  LoginOtpRequest,
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
  LoginRequest,
  ManualCheckInRequest,
  MediaRequest,
  MediaResponse,
  NotificationResponse,
  NotificationPreferenceResponse,
  NotificationPreferenceRequest,
  PageResponse,
  PaymentInitiateRequest,
<<<<<<< HEAD
  PaymentConfigResponse,
  PaymentVerifyRequest,
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
  PaymentResponse,
  PaymentStatus,
  PlatformStatsResponse,
  RegisterRequest,
<<<<<<< HEAD
=======
  RecruitVolunteerRequest,
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
  RegistrationRequest,
  RegistrationResponse,
  ResetPasswordRequest,
  Role,
  ScoreRequest,
  ScoreResponse,
<<<<<<< HEAD
=======
  TaskStatus,
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
  TeamRequest,
  TeamResponse,
  UpdateCompetitionStatusRequest,
  UpdateProfileRequest,
  UploadResponse,
  UserResponse,
<<<<<<< HEAD
  VerifyOtpRequest,
  VerifyTicketRequest,
  VolunteerAddRequest,
  VolunteerAssignRequest,
  VolunteerAchievementResponse,
  VolunteerAssignmentResponse,
  VolunteerAttendanceResponse,
  VolunteerDashboardResponse,
  VolunteerHoursResponse,
  VolunteerProfileUpdateRequest,
  VolunteerResponse,
  VolunteerScanRequest,
  VolunteerScanResponse,
  VolunteerScheduleItemResponse,
  VolunteerTaskCompleteRequest,
  VolunteerTaskCreateRequest,
=======
  VolunteerApplyRequest,
  VolunteerResponse,
  VolunteerTaskRequest,
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
  VolunteerTaskResponse,
} from '@/types';

/* ------------------------------- helpers -------------------------------- */

/** Drop undefined/null/'' params so we never send `?q=undefined`. */
function clean(params: object): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== '',
    ),
  );
}

/* --------------------------------- auth --------------------------------- */

export const authService = {
  register: (body: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', body),
  login: (body: LoginRequest) => api.post<AuthResponse>('/auth/login', body),
<<<<<<< HEAD
  /** Passwordless sign-in: request a one-time code by email + WhatsApp. Returns a challenge. */
  requestLoginOtp: (body: LoginOtpRequest) =>
    api.post<AuthResponse>('/auth/login/otp', body),
  /** Complete any OTP challenge (2FA step-up or passwordless) — issues tokens on success. */
  verifyOtp: (body: VerifyOtpRequest) =>
    api.post<AuthResponse>('/auth/verify-otp', body),
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
  refresh: (refreshToken: string) =>
    api.post<AuthResponse>('/auth/refresh', { refreshToken }),
  verifyEmail: (token: string) =>
    api.get<void>('/auth/verify', { params: { token } }),
  forgotPassword: (body: ForgotPasswordRequest) =>
    api.post<void>('/auth/forgot-password', body),
  resetPassword: (body: ResetPasswordRequest) =>
    api.post<void>('/auth/reset-password', body),
  logout: () => api.post<void>('/auth/logout'),
};

/* --------------------------------- users -------------------------------- */

export const userService = {
  me: () => api.get<UserResponse>('/users/me'),
  updateProfile: (body: UpdateProfileRequest) =>
    api.put<UserResponse>('/users/me', body),
  changePassword: (body: ChangePasswordRequest) =>
    api.post<void>('/users/me/change-password', body),
  getById: (id: number) => api.get<UserResponse>(`/users/${id}`),
};

/* --------------------------------- files -------------------------------- */

export const fileService = {
  /**
   * Upload an image/PDF and get back its resolvable URL. `folder` is a logical prefix
   * (e.g. 'avatars', 'banners', 'media') the backend uses to organise storage.
   */
  upload: (file: File, folder?: string) => {
    const form = new FormData();
    form.append('file', file);
    if (folder) form.append('folder', folder);
    return api.postForm<UploadResponse>('/files', form);
  },
};

/* --------------------------------- clubs -------------------------------- */

export interface ClubSearchParams {
  q?: string;
  category?: string;
  active?: boolean;
  page?: number;
  size?: number;
}

export const clubService = {
  search: (params: ClubSearchParams = {}) =>
    api.get<PageResponse<ClubResponse>>('/clubs', { params: clean(params) }),
  getById: (id: number) => api.get<ClubResponse>(`/clubs/${id}`),
  create: (body: ClubRequest) => api.post<ClubResponse>('/clubs', body),
  update: (id: number, body: ClubRequest) =>
    api.put<ClubResponse>(`/clubs/${id}`, body),
  remove: (id: number) => api.delete<void>(`/clubs/${id}`),
<<<<<<< HEAD
  /** Bring a previously-deactivated club back online (coordinator scope). */
  reactivate: (id: number) => api.post<void>(`/clubs/${id}/reactivate`),
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
  members: (id: number) =>
    api.get<ClubMemberResponse[]>(`/clubs/${id}/members`),
  join: (id: number) => api.post<ClubMemberResponse>(`/clubs/${id}/join`),
  approveMember: (id: number, membershipId: number) =>
    api.post<ClubMemberResponse>(`/clubs/${id}/members/${membershipId}/approve`),
  removeMember: (id: number, membershipId: number) =>
    api.delete<void>(`/clubs/${id}/members/${membershipId}`),
  leave: (id: number) => api.post<void>(`/clubs/${id}/leave`),
  myMemberships: () =>
    api.get<ClubMemberResponse[]>('/clubs/me/memberships'),
  /** Follow a club to be notified about its new events. */
  follow: (id: number) => api.post<void>(`/clubs/${id}/follow`),
  /** Stop following a club. */
  unfollow: (id: number) => api.delete<void>(`/clubs/${id}/follow`),
  /** Clubs the current user follows (newest first). */
  myFollowing: () => api.get<ClubResponse[]>('/clubs/me/following'),
};

/* -------------------------------- events -------------------------------- */

export interface EventSearchParams {
  q?: string;
  category?: string;
  mode?: string;
  status?: EventStatus;
  clubId?: number;
  paid?: boolean;
  team?: boolean;
  featured?: boolean;
  from?: string;
  to?: string;
  includeDrafts?: boolean;
  page?: number;
  size?: number;
}

export const eventService = {
  search: (params: EventSearchParams = {}) =>
    api.get<PageResponse<EventSummaryResponse>>('/events', {
      params: clean(params),
    }),
  featured: () => api.get<EventSummaryResponse[]>('/events/featured'),
  getById: (id: number) => api.get<EventResponse>(`/events/${id}`),
  /** Download the event as an iCalendar (.ics) file. */
  calendar: (id: number) => api.getBlob(`/events/${id}/calendar.ics`),
  schedule: (id: number) =>
    api.get<EventScheduleResponse[]>(`/events/${id}/schedule`),
  create: (body: EventRequest) => api.post<EventResponse>('/events', body),
  update: (id: number, body: EventRequest) =>
    api.put<EventResponse>(`/events/${id}`, body),
  publish: (id: number) => api.post<EventResponse>(`/events/${id}/publish`),
  updateStatus: (id: number, status: EventStatus) =>
    api.patch<EventResponse>(`/events/${id}/status`, undefined, {
      params: { status },
    }),
  remove: (id: number) => api.delete<void>(`/events/${id}`),
  addSchedule: (id: number, body: EventScheduleRequest) =>
    api.post<EventScheduleResponse>(`/events/${id}/schedule`, body),
<<<<<<< HEAD
  updateSchedule: (id: number, scheduleId: number, body: EventScheduleRequest) =>
    api.put<EventScheduleResponse>(`/events/${id}/schedule/${scheduleId}`, body),
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
  removeSchedule: (id: number, scheduleId: number) =>
    api.delete<void>(`/events/${id}/schedule/${scheduleId}`),
  /** Save/bookmark an event for later. */
  save: (id: number) => api.post<void>(`/events/${id}/save`),
  /** Remove an event from your saved list. */
  unsave: (id: number) => api.delete<void>(`/events/${id}/save`),
  /** Events the current user has saved (newest first). */
  mySaved: () => api.get<EventSummaryResponse[]>('/events/me/saved'),
};

/* ----------------------------- registrations ---------------------------- */

export const registrationService = {
  register: (body: RegistrationRequest) =>
    api.post<RegistrationResponse>('/registrations', body),
  cancel: (id: number) => api.delete<void>(`/registrations/${id}`),
  mine: (page = 0, size = 20) =>
    api.get<PageResponse<RegistrationResponse>>('/registrations/me', {
      params: { page, size },
    }),
  myForEvent: (eventId: number) =>
    api.get<RegistrationResponse>(`/registrations/me/event/${eventId}`),
  forEvent: (eventId: number, page = 0, size = 20) =>
    api.get<PageResponse<RegistrationResponse>>(
      `/registrations/event/${eventId}`,
      { params: { page, size } },
    ),
  ticketQr: (id: number) => api.getBlob(`/registrations/${id}/qr`),
<<<<<<< HEAD
  /** Send a 6-digit code (email + WhatsApp) to verify ownership of this ticket. */
  requestTicketVerify: (id: number) =>
    api.post<void>(`/registrations/${id}/verify/request`),
  /** Confirm ticket ownership with the received code; returns the updated registration. */
  confirmTicketVerify: (id: number, body: VerifyTicketRequest) =>
    api.post<RegistrationResponse>(`/registrations/${id}/verify/confirm`, body),
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
};

/* --------------------------------- teams -------------------------------- */

export const teamService = {
  create: (body: TeamRequest) => api.post<TeamResponse>('/teams', body),
  getById: (id: number) => api.get<TeamResponse>(`/teams/${id}`),
  forEvent: (eventId: number) =>
    api.get<TeamResponse[]>(`/teams/event/${eventId}`),
  mine: () => api.get<TeamResponse[]>('/teams/me'),
  addMember: (id: number, body: AddTeamMemberRequest) =>
    api.post<TeamResponse>(`/teams/${id}/members`, body),
  removeMember: (id: number, membershipId: number) =>
    api.delete<void>(`/teams/${id}/members/${membershipId}`),
  remove: (id: number) => api.delete<void>(`/teams/${id}`),
};

/* ------------------------------ attendance ------------------------------ */

export const attendanceService = {
  checkIn: (body: CheckInRequest) =>
    api.post<AttendanceResponse>('/attendance/check-in', body),
  manualCheckIn: (body: ManualCheckInRequest) =>
    api.post<AttendanceResponse>('/attendance/manual', body),
  checkOut: (id: number) =>
    api.post<AttendanceResponse>(`/attendance/${id}/check-out`),
  forEvent: (eventId: number) =>
    api.get<AttendanceResponse[]>(`/attendance/event/${eventId}`),
  mine: () => api.get<AttendanceResponse[]>('/attendance/me'),
};

/* -------------------------------- payments ------------------------------ */

export const paymentService = {
<<<<<<< HEAD
  /** Non-secret checkout config (active provider + publishable key) for the browser. */
  config: () => api.get<PaymentConfigResponse>('/payments/config'),
  initiate: (body: PaymentInitiateRequest) =>
    api.post<PaymentResponse>('/payments/initiate', body),
  /** Confirm a hosted checkout (e.g. Razorpay) so the server can verify the signature. */
  verify: (body: PaymentVerifyRequest) =>
    api.post<PaymentResponse>('/payments/verify', body),
=======
  initiate: (body: PaymentInitiateRequest) =>
    api.post<PaymentResponse>('/payments/initiate', body),
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
  mine: () => api.get<PaymentResponse[]>('/payments/me'),
  getById: (id: number) => api.get<PaymentResponse>(`/payments/${id}`),
  forEvent: (eventId: number) =>
    api.get<PaymentResponse[]>(`/payments/event/${eventId}`),
  /** Refund a successful payment (coordinator of the owning club, or admin). */
  refund: (id: number) => api.post<PaymentResponse>(`/payments/${id}/refund`),
  /** Download a PDF receipt for a completed payment (payer, coordinator or admin). */
  receipt: (id: number) => api.getBlob(`/payments/${id}/receipt`),
<<<<<<< HEAD
  /**
   * Download a ZIP of PDF receipts for several completed payments. The query string is built
   * by hand so the ids repeat as `ids=1&ids=2` (Spring's `@RequestParam List` form) rather than
   * axios's default bracketed `ids[]=` serialisation.
   */
  receiptsZip: (ids: number[]) =>
    api.getBlob(`/payments/receipts.zip?${ids.map((id) => `ids=${encodeURIComponent(id)}`).join('&')}`),
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
};

/* ------------------------------ competitions ---------------------------- */

export const competitionService = {
  forEvent: (eventId: number) =>
    api.get<CompetitionResponse[]>(`/competitions/event/${eventId}`),
  getById: (id: number) => api.get<CompetitionResponse>(`/competitions/${id}`),
  rounds: (id: number) =>
    api.get<CompetitionRoundResponse[]>(`/competitions/${id}/rounds`),
  leaderboard: (id: number) =>
    api.get<LeaderboardEntry[]>(`/competitions/${id}/leaderboard`),
  create: (body: CompetitionRequest) =>
    api.post<CompetitionResponse>('/competitions', body),
<<<<<<< HEAD
  /** Delete a competition and all of its rounds, judges and scores (coordinator only). */
  remove: (id: number) => api.delete<void>(`/competitions/${id}`),
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
  updateStatus: (id: number, body: UpdateCompetitionStatusRequest) =>
    api.patch<CompetitionResponse>(`/competitions/${id}/status`, body),
  addRound: (id: number, body: CompetitionRoundRequest) =>
    api.post<CompetitionRoundResponse>(`/competitions/${id}/rounds`, body),
  removeRound: (roundId: number) =>
    api.delete<void>(`/competitions/rounds/${roundId}`),
  addJudge: (id: number, body: AddJudgeRequest) =>
    api.post<JudgeResponse>(`/competitions/${id}/judges`, body),
  judges: (id: number) =>
    api.get<JudgeResponse[]>(`/competitions/${id}/judges`),
  removeJudge: (id: number, judgeId: number) =>
    api.delete<void>(`/competitions/${id}/judges/${judgeId}`),
  submitScore: (body: ScoreRequest) =>
    api.post<ScoreResponse>('/competitions/scores', body),
  roundScores: (roundId: number) =>
    api.get<ScoreResponse[]>(`/competitions/rounds/${roundId}/scores`),
};

/* ------------------------------ certificates ---------------------------- */

export const certificateService = {
  issue: (body: CertificateIssueRequest) =>
    api.post<CertificateResponse>('/certificates', body),
  mine: () => api.get<CertificateResponse[]>('/certificates/me'),
  forEvent: (eventId: number) =>
    api.get<CertificateResponse[]>(`/certificates/event/${eventId}`),
  download: (id: number) => api.getBlob(`/certificates/${id}/download`),
  /** Revoke a certificate (coordinator of the owning club, or admin). Soft-delete. */
  revoke: (id: number) => api.delete<CertificateResponse>(`/certificates/${id}`),
  verify: (code: string) =>
    api.get<CertificateVerificationResponse>(`/certificates/verify/${code}`),
  /** Public download of a verified (non-revoked) certificate PDF by its code. */
  verifyDownload: (code: string) =>
    api.getBlob(`/certificates/verify/${code}/download`),

  /* -- event-bound template design (admin or coordinator) -- */
  getTemplate: (eventId: number) =>
    api.get<CertificateTemplateResponse>(`/certificates/event/${eventId}/template`),
  saveTemplate: (eventId: number, body: CertificateTemplateRequest) =>
    api.put<CertificateTemplateResponse>(
      `/certificates/event/${eventId}/template`,
      body,
    ),
  /** Copy a reusable library template's design onto an event. */
  applyTemplate: (eventId: number, templateId: number) =>
    api.post<CertificateTemplateResponse>(
      `/certificates/event/${eventId}/apply-template/${templateId}`,
    ),

  /* -- bulk issuing & delivery (admin or coordinator) -- */
  /** Bulk-issue to participants; scope/type fall back to the template defaults when omitted. */
  generate: (
    eventId: number,
    scope?: CertificateRecipientScope,
    type?: CertificateType,
  ) =>
    api.post<CertificateBatchResponse>(
      `/certificates/event/${eventId}/generate`,
      undefined,
      { params: clean({ scope, type }) },
    ),
  /**
   * The event's participants eligible for a certificate, for the selection picker. Scoped to the
   * event; each entry is flagged with attendance, payment and whether one is already issued.
   */
  eligibleParticipants: (
    eventId: number,
    scope?: CertificateRecipientScope,
    type?: CertificateType,
  ) =>
    api.get<CertificateParticipantResponse[]>(
      `/certificates/event/${eventId}/participants`,
      { params: clean({ scope, type }) },
    ),
  /** Issue certificates to an explicitly-selected set of participants. */
  generateSelected: (eventId: number, body: CertificateBulkIssueRequest) =>
    api.post<CertificateBatchResponse>(
      `/certificates/event/${eventId}/generate-selected`,
      body,
    ),
  /** Download every issued certificate for an event as a single ZIP. */
  downloadZip: (eventId: number) =>
    api.getBlob(`/certificates/event/${eventId}/zip`),
  /** Email each participant their certificate PDF; resolves to the number dispatched. */
  emailAll: (eventId: number) =>
    api.post<number>(`/certificates/event/${eventId}/email`),

  /* -- reusable template library (platform admin only) -- */
  listTemplates: () =>
    api.get<CertificateTemplateResponse[]>('/certificates/templates'),
  createTemplate: (body: CertificateTemplateRequest) =>
    api.post<CertificateTemplateResponse>('/certificates/templates', body),
  updateTemplate: (templateId: number, body: CertificateTemplateRequest) =>
    api.put<CertificateTemplateResponse>(
      `/certificates/templates/${templateId}`,
      body,
    ),
  deleteTemplate: (templateId: number) =>
    api.delete<void>(`/certificates/templates/${templateId}`),
};

/* -------------------------------- feedback ------------------------------ */

export const feedbackService = {
  submit: (body: FeedbackRequest) =>
    api.post<FeedbackResponse>('/feedback', body),
  myForEvent: (eventId: number) =>
    api.get<FeedbackResponse>(`/feedback/me/event/${eventId}`),
  forEvent: (eventId: number) =>
    api.get<FeedbackResponse[]>(`/feedback/event/${eventId}`),
  summary: (eventId: number) =>
    api.get<FeedbackSummary>(`/feedback/event/${eventId}/summary`),
<<<<<<< HEAD
  /** Remove a feedback entry — moderation for the event's club coordinator. */
  remove: (id: number) => api.delete<void>(`/feedback/${id}`),
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
};

/* ------------------------------ announcements --------------------------- */

export const announcementService = {
  create: (body: AnnouncementRequest) =>
    api.post<AnnouncementResponse>('/announcements', body),
<<<<<<< HEAD
  /** Edit an announcement's title/body/pinned flag (author or coordinator). */
  update: (
    id: number,
    body: Pick<AnnouncementRequest, 'title' | 'content' | 'pinned'>,
  ) => api.put<AnnouncementResponse>(`/announcements/${id}`, body),
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
  remove: (id: number) => api.delete<void>(`/announcements/${id}`),
  feed: () => api.get<AnnouncementResponse[]>('/announcements'),
  general: () => api.get<AnnouncementResponse[]>('/announcements/general'),
  forClub: (clubId: number) =>
    api.get<AnnouncementResponse[]>(`/announcements/club/${clubId}`),
  forEvent: (eventId: number) =>
    api.get<AnnouncementResponse[]>(`/announcements/event/${eventId}`),
};

/* --------------------------------- media -------------------------------- */

export const mediaService = {
  /** Add a media item to an event or club gallery (admin or active club member). */
  create: (body: MediaRequest) => api.post<MediaResponse>('/media', body),
  /** Delete a media item (uploader, or an admin/coordinator of the owning club). */
  remove: (id: number) => api.delete<void>(`/media/${id}`),
  /** Public gallery for an event. */
  forEvent: (eventId: number) =>
    api.get<MediaResponse[]>(`/media/event/${eventId}`),
  /** Public gallery for a club. */
  forClub: (clubId: number) =>
    api.get<MediaResponse[]>(`/media/club/${clubId}`),
};

/* -------------------------------- comments ------------------------------ */

export const commentService = {
  /** Public discussion thread for an event (top-level comments with nested replies). */
  forEvent: (eventId: number) =>
    api.get<CommentResponse[]>(`/comments/event/${eventId}`),
  /** Post a comment or question on an event (reply by setting parentId). */
  create: (eventId: number, body: CommentRequest) =>
    api.post<CommentResponse>(`/comments/event/${eventId}`, body),
  /** Edit your own comment. */
  update: (id: number, body: CommentUpdateRequest) =>
    api.put<CommentResponse>(`/comments/${id}`, body),
  /** Delete a comment (author, or an admin/coordinator of the owning club). */
  remove: (id: number) => api.delete<void>(`/comments/${id}`),
  /** Pin or unpin a top-level comment (admin/coordinator of the owning club). */
  setPinned: (id: number, pinned: boolean) =>
    api.patch<CommentResponse>(`/comments/${id}/pin`, undefined, {
      params: { pinned },
    }),
  /** Mark a top-level question resolved or reopen it (admin/coordinator or author). */
  setResolved: (id: number, resolved: boolean) =>
    api.patch<CommentResponse>(`/comments/${id}/resolve`, undefined, {
      params: { resolved },
    }),
};

/* --------------------------------- search ------------------------------- */

export const searchService = {
  /**
   * Global search across events, clubs and (admins only) users. Works
   * anonymously; a signed-in viewer also gets saved/followed flags on results.
   * `limit` caps how many matches come back per result type.
   */
  global: (q: string, limit = 5) =>
    api.get<GlobalSearchResponse>('/search', { params: clean({ q, limit }) }),
};

<<<<<<< HEAD
/* -------------------------------- assistant ----------------------------- */

export const assistantService = {
  /** Is the AI help assistant configured/available? Drives whether the widget renders. */
  status: () => api.get<AssistantStatusResponse>('/assistant/status'),
  /** Ask a question; `history` carries recent turns for context (trimmed server-side). */
  chat: (body: AssistantChatRequest) =>
    api.post<AssistantChatResponse>('/assistant/chat', body),
};

=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
/* -------------------------------- analytics ----------------------------- */

export const analyticsService = {
  clubDashboard: (clubId: number) =>
    api.get<ClubDashboardResponse>(`/analytics/club/${clubId}`),
  eventStats: (eventId: number) =>
    api.get<EventStatsResponse>(`/analytics/event/${eventId}`),
  clubReport: (clubId: number) =>
    api.getBlob(`/analytics/club/${clubId}/report`),
  eventReport: (eventId: number) =>
    api.getBlob(`/analytics/event/${eventId}/report`),
};

/* ------------------------------ notifications --------------------------- */

export const notificationService = {
  mine: (page = 0, size = 20) =>
    api.get<PageResponse<NotificationResponse>>('/notifications/me', {
      params: { page, size },
    }),
  unread: () => api.get<NotificationResponse[]>('/notifications/me/unread'),
  unreadCount: () =>
    api.get<Record<string, number>>('/notifications/me/unread-count'),
  markRead: (id: number) => api.post<void>(`/notifications/${id}/read`),
  markAllRead: () => api.post<void>('/notifications/read-all'),
<<<<<<< HEAD
  /** Flip a notification back to unread. */
  markUnread: (id: number) => api.post<void>(`/notifications/${id}/unread`),
  /** Permanently delete a single notification. */
  remove: (id: number) => api.delete<void>(`/notifications/${id}`),
  /** Permanently delete every notification (clear inbox). */
  clearAll: () => api.delete<void>('/notifications/me'),
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
  /** My email notification preferences. */
  preferences: () =>
    api.get<NotificationPreferenceResponse>('/notifications/preferences'),
  /** Replace my email notification preferences. */
  updatePreferences: (body: NotificationPreferenceRequest) =>
    api.put<NotificationPreferenceResponse>('/notifications/preferences', body),
  /** Public one-click unsubscribe using a token from an email link. */
  unsubscribe: (token: string) =>
    api.post<void>('/notifications/unsubscribe', undefined, { params: { token } }),
};

<<<<<<< HEAD
/* ------------------------------- volunteers -----------------------------
 * Volunteers are a club-scoped role. A club coordinator (or admin) adds an
 * existing user as a volunteer for their club — there is no public self-apply.
 * Volunteers are then assigned to that club's events with shifts and tasks.
 * The `/me/**` calls are the volunteer's own workspace; the club/event calls
 * are the coordinator/member management surface. Authorisation is enforced
 * server-side (role + per-record ownership / club access) regardless of which
 * of these the UI chooses to show.
 * ---------------------------------------------------------------------- */

export const volunteerService = {
  /* -- self-service (VOLUNTEER) -- */

  /** My volunteer profiles across all clubs I belong to. */
  myProfiles: () => api.get<VolunteerResponse[]>('/volunteers/me'),
  /** Update my own skills / availability. */
  updateMyProfile: (body: VolunteerProfileUpdateRequest) =>
    api.put<VolunteerResponse>('/volunteers/me', body),
  /** Everything the volunteer dashboard needs in one call. */
  dashboard: () => api.get<VolunteerDashboardResponse>('/volunteers/me/dashboard'),

  /** Events I'm assigned to (with shift + event context). */
  myEvents: () => api.get<VolunteerAssignmentResponse[]>('/volunteers/me/events'),
  /** Accept an event assignment offered to me. */
  acceptAssignment: (assignmentId: number) =>
    api.put<VolunteerAssignmentResponse>(`/volunteers/me/events/${assignmentId}/accept`),

  /** My assigned tasks across events. */
  myTasks: () => api.get<VolunteerTaskResponse[]>('/volunteers/me/tasks'),
  /** A single task of mine. */
  myTask: (taskId: number) =>
    api.get<VolunteerTaskResponse>(`/volunteers/me/tasks/${taskId}`),
  /** Mark one of my tasks as started (PENDING -> IN_PROGRESS). */
  startTask: (taskId: number) =>
    api.put<VolunteerTaskResponse>(`/volunteers/me/tasks/${taskId}/start`),
  /** Complete one of my tasks with optional notes. */
  completeTask: (taskId: number, body?: VolunteerTaskCompleteRequest) =>
    api.put<VolunteerTaskResponse>(`/volunteers/me/tasks/${taskId}/complete`, body ?? {}),

  /** My shift schedule (calendar view). */
  mySchedule: () =>
    api.get<VolunteerScheduleItemResponse[]>('/volunteers/me/schedule'),

  /** Mark my own volunteer check-in for an event I'm assigned to. */
  checkIn: (eventId: number) =>
    api.post<VolunteerAttendanceResponse>('/volunteers/me/attendance/check-in', undefined, {
      params: { eventId },
    }),
  /** Mark my own volunteer check-out for an event. */
  checkOut: (eventId: number) =>
    api.post<VolunteerAttendanceResponse>('/volunteers/me/attendance/check-out', undefined, {
      params: { eventId },
    }),
  /** My volunteer attendance history. */
  myAttendance: () =>
    api.get<VolunteerAttendanceResponse[]>('/volunteers/me/attendance'),

  /** My aggregated volunteer-hours summary. */
  myHours: () => api.get<VolunteerHoursResponse>('/volunteers/me/hours'),
  /** My earned/available achievements/badges. */
  myAchievements: () =>
    api.get<VolunteerAchievementResponse[]>('/volunteers/me/achievements'),

  /** Scan a participant's ticket QR to check them in (requires check-in duty).
   *  The payload carries only the opaque ticket code — never PII. */
  scan: (body: VolunteerScanRequest) =>
    api.post<VolunteerScanResponse>('/volunteers/scan', body),

  /* -- coordinator / member management -- */

  /** List a club's volunteers (coordinator or admin). */
  forClub: (clubId: number) =>
    api.get<VolunteerResponse[]>(`/volunteers/clubs/${clubId}`),
  /** Add an existing user (by email) as a volunteer for a club (coordinator or admin). */
  addVolunteer: (clubId: number, body: VolunteerAddRequest) =>
    api.post<VolunteerResponse>(`/volunteers/clubs/${clubId}`, body),
  /** Get a single volunteer profile (coordinator or admin). */
  get: (volunteerId: number) =>
    api.get<VolunteerResponse>(`/volunteers/${volunteerId}`),
  /** Approve a pending volunteer (coordinator or admin). */
  approve: (volunteerId: number) =>
    api.put<VolunteerResponse>(`/volunteers/${volunteerId}/approve`),
  /** Reject / deactivate a volunteer (coordinator or admin). */
  reject: (volunteerId: number) =>
    api.put<VolunteerResponse>(`/volunteers/${volunteerId}/reject`),

  /** Volunteers assigned to an event (coordinator/admin or active member). */
  forEvent: (eventId: number) =>
    api.get<VolunteerAssignmentResponse[]>(`/volunteers/events/${eventId}`),
  /** Assign a volunteer to an event with a shift (coordinator or admin). */
  assignToEvent: (eventId: number, body: VolunteerAssignRequest) =>
    api.post<VolunteerAssignmentResponse>(`/volunteers/events/${eventId}/assign`, body),
  /** Cancel a volunteer's event assignment (coordinator or admin). */
  cancelAssignment: (assignmentId: number) =>
    api.put<VolunteerAssignmentResponse>(`/volunteers/assignments/${assignmentId}/cancel`),

  /** Volunteer tasks for an event (coordinator/admin or active member). */
  tasksForEvent: (eventId: number) =>
    api.get<VolunteerTaskResponse[]>(`/volunteers/events/${eventId}/tasks`),
  /** Create a volunteer task for an event (coordinator/admin or active member). */
  createTask: (eventId: number, body: VolunteerTaskCreateRequest) =>
    api.post<VolunteerTaskResponse>(`/volunteers/events/${eventId}/tasks`, body),
  /** Volunteer attendance for an event (coordinator/admin or active member). */
  attendanceForEvent: (eventId: number) =>
    api.get<VolunteerAttendanceResponse[]>(`/volunteers/events/${eventId}/attendance`),
=======
/* ------------------------------- volunteers ----------------------------- */

export const volunteerService = {
  /** Student applies to volunteer for an event (pending coordinator approval). */
  apply: (body: VolunteerApplyRequest) =>
    api.post<VolunteerResponse>('/volunteers/apply', body),
  /** Coordinator/admin directly recruits an existing user by email (auto-approved). */
  recruit: (eventId: number, body: RecruitVolunteerRequest) =>
    api.post<VolunteerResponse>(`/volunteers/event/${eventId}/recruit`, body),
  /** Coordinator/admin approves a pending volunteer, optionally overriding their role. */
  approve: (volunteerId: number, role?: string) =>
    api.post<VolunteerResponse>(
      `/volunteers/${volunteerId}/approve`,
      undefined,
      { params: clean({ role }) },
    ),
  /** Remove a volunteer (coordinator/admin) or withdraw your own application. */
  remove: (volunteerId: number) =>
    api.delete<void>(`/volunteers/${volunteerId}`),
  /** Full volunteer roster for an event (coordinator/admin). */
  forEvent: (eventId: number) =>
    api.get<VolunteerResponse[]>(`/volunteers/event/${eventId}`),
  /** My own volunteer enrollments across all events. */
  mine: () => api.get<VolunteerResponse[]>('/volunteers/me'),

  /* -- tasks -- */
  assignTask: (volunteerId: number, body: VolunteerTaskRequest) =>
    api.post<VolunteerTaskResponse>(`/volunteers/${volunteerId}/tasks`, body),
  tasksForVolunteer: (volunteerId: number) =>
    api.get<VolunteerTaskResponse[]>(`/volunteers/${volunteerId}/tasks`),
  tasksForEvent: (eventId: number) =>
    api.get<VolunteerTaskResponse[]>(`/volunteers/event/${eventId}/tasks`),
  myTasks: () => api.get<VolunteerTaskResponse[]>('/volunteers/me/tasks'),
  updateTaskStatus: (taskId: number, status: TaskStatus) =>
    api.patch<VolunteerTaskResponse>(`/volunteers/tasks/${taskId}/status`, {
      status,
    }),
  removeTask: (taskId: number) =>
    api.delete<void>(`/volunteers/tasks/${taskId}`),
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
};

/* ---------------------------------- admin ------------------------------- */

export interface AdminUserSearchParams {
  q?: string;
  role?: Role;
  page?: number;
  size?: number;
}

export interface AdminPaymentSearchParams {
  status?: PaymentStatus;
  page?: number;
  size?: number;
}

export interface AdminAuditSearchParams {
  action?: AuditAction;
  page?: number;
  size?: number;
}

/**
 * Full-platform administration. Every call requires the ADMIN role; the backend
 * enforces this via {@code @PreAuthorize} plus a URL rule, so a non-admin token
 * yields 403 regardless of what the UI shows.
 */
export const adminService = {
  stats: () => api.get<PlatformStatsResponse>('/admin/stats'),

  // users
  listUsers: (params: AdminUserSearchParams = {}) =>
    api.get<PageResponse<AdminUserResponse>>('/admin/users', {
      params: clean(params),
    }),
  getUser: (id: number) => api.get<AdminUserResponse>(`/admin/users/${id}`),
  updateRole: (id: number, body: AdminUpdateRoleRequest) =>
    api.patch<AdminUserResponse>(`/admin/users/${id}/role`, body),
  updateStatus: (id: number, body: AdminUpdateUserStatusRequest) =>
    api.patch<AdminUserResponse>(`/admin/users/${id}/status`, body),
  deleteUser: (id: number) => api.delete<void>(`/admin/users/${id}`),

  // clubs
  listClubs: (page = 0, size = 20) =>
    api.get<PageResponse<ClubResponse>>('/admin/clubs', {
      params: { page, size },
    }),
  setClubActive: (id: number, active: boolean) =>
    api.patch<ClubResponse>(`/admin/clubs/${id}/status`, undefined, {
      params: { active },
    }),
  deleteClub: (id: number) => api.delete<void>(`/admin/clubs/${id}`),

  // events
  listEvents: (page = 0, size = 20) =>
    api.get<PageResponse<EventSummaryResponse>>('/admin/events', {
      params: { page, size },
    }),
  updateEventStatus: (id: number, status: EventStatus) =>
    api.patch<EventResponse>(`/admin/events/${id}/status`, undefined, {
      params: { status },
    }),
  deleteEvent: (id: number) => api.delete<void>(`/admin/events/${id}`),

  // payments
  listPayments: (params: AdminPaymentSearchParams = {}) =>
    api.get<PageResponse<PaymentResponse>>('/admin/payments', {
      params: clean(params),
    }),

  // audit log
  listAuditLogs: (params: AdminAuditSearchParams = {}) =>
    api.get<PageResponse<AuditLogResponse>>('/admin/audit-logs', {
      params: clean(params),
    }),
};
