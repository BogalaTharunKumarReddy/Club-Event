# CampusConnect — Implementation Report

Scope: the 23-section update spec (home page, role dashboards, QR scanner, certificates, payments, announcements/gallery/discussion/feedback, shared visibility, sidebar bug, club-page CSS, global image-URL removal, role-based sidebar, security, database, responsiveness). The existing application was **updated in place** — no rebuild, no duplicate components/APIs/routes. Where the spec was already satisfied by prior work, that was verified rather than re-implemented.

Verification basis: the frontend strict TypeScript build (`npx tsc -b`) passes (exit 0). Backend Java was verified by inspection — the sandbox has no `javac`/Maven and no running MySQL, so it cannot compile or run the server (see §9).

---

## 1. Files changed

Frontend — image-URL removal (#17) and this pass:

- `src/components/domain/CertificateTemplateForm.tsx` — replaced the raw "Background image URL" text field with the upload-only `<ImageUpload folder="certificates">`; docstring updated.
- `src/components/ui/SectionLoader.tsx` (new) + `src/components/ui/index.ts` — in-container loader that does not cover the fixed sidebar.
- `src/index.css` — added `.no-scrollbar` utility (scrollable tab strips without a visible scrollbar).
- `src/pages/clubs/ClubDetailPage.tsx`, `src/components/domain/ClubCard.tsx`, `src/pages/manage/ManageClubPage.tsx` — club-page overflow/responsive fixes (#16/#21).
- Loader swaps (bare full-viewport loader → `SectionLoader`) in `eventTabs.tsx`, `EventFormPage.tsx`, `ManageCompetitionPage.tsx`, `ManageDashboardPage.tsx`, `TeamDetailPage.tsx`, `volunteer/VolunteerTaskDetailPage.tsx` (#15).

Backend:

- `service/impl/CertificateServiceImpl.java` — `loadImage` is now an instance method with a `loadLocalUpload` helper so an uploaded (relative `/api/files/…`) certificate background is read straight from `LocalStorageService` and rendered by OpenPDF; `data:` and absolute-http/S3 URLs still work. Constructor gained `LocalStorageService` + `app.storage.local.public-base-url`.
- `entity/Certificate.java` — added DB-level unique constraint `uk_cert_user_event_type (user_id, event_id, type)` (#20, duplicate-certificate guard).

Verified already-compliant (no change needed): `LandingPage.tsx` (#1 — no events buttons/FAQ/"Ready to Join"), `ProfilePage.tsx` / `EventFormPage.tsx` / `ManageClubPage.tsx` / `MediaGallery.tsx` image inputs (all `ImageUpload`), `Sidebar.tsx` role gating (#11/#12/#13/#18), `AppLayout.tsx` shell (#15).

Note: earlier phases of this engagement (recorded in project memory) delivered the feature backbone — volunteer management, media gallery, discussion, feedback, waitlist, certificates-as-templates + receipts, audit log, `EntityPurgeService`, and the backend authorization audit. Those were the inputs this pass verified and finished.

## 2. Database / migration changes

Schema management is `ddl-auto=update` (no destructive migrations; additive only). Changes:

- `certificates`: added unique constraint `uk_cert_user_event_type (user_id, event_id, type)`. Previously duplicate prevention was service-only (`existsByUserIdAndEventIdAndType`); this closes the auto-issue-vs-manual concurrency window at the DB level. Safe under `update` — the long-standing service guard means no existing rows violate it.

Integrity model (verified, unchanged): the backbone `Users → Clubs → Events → Registrations → (ticket_code) → Attendance → Certificates → Payments` plus memberships/saved/following/teams/announcements/gallery/discussion/feedback/volunteer/competition all carry proper FKs (mandatory FKs `optional=false, nullable=false`; optional ones nullable). FKs are RESTRICT (no `ON DELETE CASCADE`, no JPA cascade — deliberate). Deletion goes through `EntityPurgeService.purge{User,Event,Club}`, which deletes children in dependency order and preserves shared/other-user data by nulling optional author/creator pointers, so there are no FK errors or orphans. Duplicate attendance is blocked three ways (service check + `uk_att_registration` + `@OneToOne` on `registration_id`).

## 3. API changes

No new endpoints were needed this pass — the spec's features were already exposed. Behavioral change:

- `GET /api/files/**` (public read) is now also consumed server-side by certificate rendering for uploaded backgrounds; no signature change.

Endpoints relied on by the spec (already present, verified): user/club/event admin deletes (`DELETE /api/admin/users|clubs|events/{id}`); per-resource deletes for announcements, certificates, comments (discussion), feedback, media (gallery), registrations, teams, events, clubs, competition rounds/judges; attendance check-in (`POST /api/attendance/check-in`, `POST /api/attendance/manual`); volunteer scan (`POST /api/volunteers/scan`); certificate template GET/PUT + generate + `GET …/event/{id}/zip` + email; payment refund + `GET /api/payments/receipts.zip?ids=…` and single `receipt`.

## 4. Route changes

No route additions this pass. Relevant existing structure (verified): every `/app/*` page is nested under `ProtectedRoute → AppLayout` (fixed sidebar + topbar + `Outlet`), so no authenticated management page can render without the sidebar (#15). Role-gated subtrees via `RoleRoute`: coordinator (`CLUB_COORDINATOR`), scanner `/app/scan` (`CLUB_MEMBER` + `CLUB_COORDINATOR`), volunteer (`VOLUNTEER`), admin (`ADMIN`). Certificate verification exists both public (`/verify-certificate`) and authenticated (`/app/verify-certificate`) so signed-in users keep the sidebar.

## 5. Permission changes

Two-tier model (verified): URL security in `SecurityConfig` (authenticated-by-default + an explicit public GET allow-list; `/api/admin/**` = `hasRole('ADMIN')`) plus per-resource authorization in the service layer via `ClubAccess`. The backend authorization audit (all mutating endpoints across 20 controllers) found no privilege-escalation gaps — every mutation is club-scoped, ownership-scoped, admin-gated, or a legitimate self-service action, so unauthorized users cannot act by calling endpoints directly (#19).

Admin-inclusion was unified during that audit (purely additive — grants platform ADMIN on moderation surfaces, removes no one's access): `AnnouncementServiceImpl.canManage` and GENERAL-scope moderation, `FeedbackServiceImpl` list+delete, and `CertificateServiceImpl.issue` moved from admin-excluded `requireCoordinator` to admin-inclusive `requireAdminOrCoordinator`, matching discussion/media/payments/attendance. Club-authoring surfaces (event publish/status/create, club update/deactivate/membership, competition authoring) remain coordinator-scoped by design; admins act on those through the dedicated `/api/admin/**` surface.

Sidebar/nav gating (verified in `Sidebar.tsx`): My Events / Saved / Following show only for STUDENT / CLUB_MEMBER / CLUB_COORDINATOR (excludes VOLUNTEER and ADMIN); Volunteering excludes STUDENT and VOLUNTEER's duplicate; VOLUNTEER has its own section (dashboard/events/tasks/attendance/scan); ADMIN has no "My Events". This is frontend convenience only — the backend enforces access independently.

## 6. QR attendance implementation (#4)

Scanning is restricted to CLUB_COORDINATOR, CLUB_MEMBER, and VOLUNTEER (never student/admin), enforced by `RoleRoute` on the routes and by service-layer authorization on the endpoints. A single reusable camera component (`components/scan/QrScanner.tsx`) uses the browser-native `BarcodeDetector` with the rear camera (`facingMode: environment`); on unsupported browsers it shows a notice and callers fall back to manual ticket entry. Three surfaces: `/app/scan` (member + coordinator), the coordinator per-event Attendance panel, and `/app/volunteer/scan` (volunteer, event-scoped).

Workflow and rejection matrix (both `AttendanceServiceImpl.checkInByTicket` and `VolunteerServiceImpl.scan`): the scan submits only the opaque `ticketCode`; the backend resolves the registration and event from the ticket, authorizes the scanner against that event's club, then creates the attendance row — rejecting with clear messages on unrecognized ticket, wrong event (volunteer flow), cancelled/waitlisted registration, unauthorized scanner, or duplicate. Attendance is per-registration, so a team of four is four independent tickets → four dedup-protected check-ins. The QR payload carries no PII (only the ticket code), satisfying "never expose sensitive information in the QR payload."

## 7. Certificate implementation (#5)

Coordinators/admins design one certificate per event (or reusable admin templates) via `CertificateTemplateForm` — now upload-only for the background image. Generation iterates distinct users from the chosen scope (REGISTERED or ATTENDED), so each team member receives their own certificate; `existsByUserIdAndEventIdAndType` plus the new DB unique constraint guarantee no duplicates. Auto-issue on event completion runs from both the coordinator and admin status-change paths, guarded by `status == COMPLETED && previous != COMPLETED` and gated by the template's opt-in flag; it is isolated in `REQUIRES_NEW` so a certificate failure can never roll back the status change. View/Edit/Delete (revoke) and bulk ZIP download / email-all are exposed to authorized roles. Server-side rendering (OpenPDF) now resolves uploaded backgrounds, data-URLs, and absolute URLs alike.

## 8. Bulk receipt implementation (#2/#6)

`GET /api/payments/receipts.zip?ids=…` streams a ZIP of the selected receipts (`PaymentServiceImpl.renderReceiptsZip`), authorized as owner or admin/coordinator. The admin Payments page (`AdminPaymentsPage.tsx`) provides multi-select: per-row checkboxes plus a select-all-on-page control, with the selection accumulating across pages in a `Set<number>`; a selection bar shows the count and a "Download receipts (ZIP)" action. Only receiptable payments (SUCCESS/REFUNDED) are selectable, and single-receipt download remains per row. The coordinator per-event Payments panel offers the same capability.

## 9. Testing performed

- Frontend strict build: `npx tsc -b` in `frontend/` returns exit 0 after every change (authoritative type check under project references; catches unused locals/params). `vite build` cannot run in this sandbox (blocked npm registry + Rollup native binary) — that is environment-only, not a code error; run it locally.
- Backend: verified by code inspection and tracing each changed method into its callers/callees — the sandbox has no `javac`/Maven and no MySQL, so it cannot compile or run the server. The `CertificateServiceImpl` change was checked for a single call site, correct overloads (`Image.getInstance(byte[])` / `(URL)`), and complete imports/constructor wiring.
- Static audits: full authorization sweep of all mutating endpoints; entity/repository integrity audit (30 entities, 28 repos); global grep sweep confirming no user-facing image-URL text input remains anywhere in `frontend/src`.

## 10. Remaining issues / recommended next steps

- Live, multi-role runtime testing (Admin, Club Coordinator, Coordinator Member, Volunteer, Student) against a running MySQL + Spring Boot + browser was not possible in this environment. Recommended before release: start the stack (see `docs/deployment.md`), then exercise per role — user deletion with dependent data, bulk receipt ZIP, QR check-in incl. duplicate/wrong-event/cancelled rejections, certificate auto-issue on completion for a team event, and gallery image upload.
- Certificate background upload: after uploading, confirm the PDF renders the image end-to-end (the code path is wired and falls back gracefully to the plain design if a background can't be loaded).
- `vite build` should be run locally to confirm the production bundle (the sandbox only runs the type-check).
- Responsive check: the club-page family and tab strips were fixed and reasoned through at 1920/1440/1280/1024/768/480/390/360; a quick device-emulator pass is still worth doing on the heavier data tables.
