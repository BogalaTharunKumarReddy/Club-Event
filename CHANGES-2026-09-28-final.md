# CampusConnect — Final Submission Changes

This document summarizes the last round of changes made to finalize the app for
submission. It builds on the earlier `CHANGES-*.md` and `IMPLEMENTATION_REPORT.md`
files, which remain valid.

## New features & fixes in this round

### 1. Student post-event feedback
- Students can now rate an event (1–5 stars) and leave an optional comment and
  suggestion once the event is **COMPLETED**.
- Two entry points, one shared implementation:
  - **My events** page — a "Rate event" button appears on completed registrations,
    opening a feedback dialog.
  - **Event detail** page — the feedback card shows inline after completion.
- Both surfaces are powered by a single shared component
  `components/domain/FeedbackForm.tsx` (no duplicated rating logic). The
  "My events" dialog wraps it in `components/domain/FeedbackModal.tsx`.
- Re-submitting updates the existing rating (backend upserts on event + user).
  The backend only accepts feedback from users who actually registered.
- The registration API now returns `eventStatus` so the UI knows when to offer
  feedback (`RegistrationResponse.eventStatus`).

### 2. Notifications management (full CRUD)
- View, mark read / **mark unread**, **delete one**, and **clear all**.
- New endpoints: `POST /notifications/{id}/unread`, `DELETE /notifications/{id}`,
  `DELETE /notifications/me`.
- Every operation is ownership-checked in the service layer (`requireOwned`) —
  a user can only touch their own notifications. Delete/clear actions are also
  wired into the notifications page and the notification bell.

### 3. Club lifecycle — reactivate
- The club deactivate ("delete") button already existed on the public club page,
  the coordinator clubs list, and the manage-club page.
- Added the missing inverse: coordinators can now **reactivate** a deactivated
  club (`POST /clubs/{id}/reactivate`, coordinator-scoped), so deactivation is no
  longer a one-way trap. Surfaced on the coordinator list and manage page.

### 4. Collapsible sidebar
- Desktop sidebar can collapse to an icon rail via a toggle button; the choice is
  remembered across sessions (localStorage). The mobile drawer is unchanged.

### 5. OTP sign-in (from earlier rounds, now finalized)
- Passwordless "sign in with a code" plus OTP 2FA step-up share one verify screen
  (`pages/auth/VerifyOtpPage.tsx`). Codes are delivered by email now, with a
  WhatsApp provider (Twilio) that degrades to logging when unconfigured.

### 6. CSS / visual polish
- Consolidated the design system in `src/index.css`: semantic button variants
  (`.btn-primary/secondary/ghost/danger/success`), a full badge palette
  (`.badge-neutral/success/warning/danger/info`), `.card` / `.card-hover`, and a
  `.surface-brand` gradient. Applied consistently across club pages, auth/OTP
  screens, and dialogs.

## Security notes
- No secrets are committed. `.env` is git-ignored; `.env.example` contains only
  safe placeholders (the previously-embedded MySQL password and JWT secret have
  been replaced with placeholders).
- Your local MySQL password remains as an **overridable default** in
  `backend/src/main/resources/application.yml`
  (`${SPRING_DATASOURCE_PASSWORD:...}`) so local runs work out of the box; set the
  env var to override it in any real deployment.
- All new endpoints authenticate the caller and authorize at the service layer
  (ownership for notifications, coordinator scope for clubs, registration check
  for feedback). Client-supplied user ids are never trusted — the authenticated
  principal is always used.

## Verification
- Frontend type-checks and builds clean (`tsc -b` passes).
- Backend reviewed by inspection (interfaces, impls, controllers, and repository
  methods are consistent for all new operations; routes match the frontend
  service layer).

## What's NOT included in this ZIP (regenerated locally)
- `node_modules/`, `backend/target/`, `frontend/dist/`, `.git/`
- Your real `.env` (secrets) — copy `.env.example` to `.env` and fill it in.

See `README.md` for full run instructions.
