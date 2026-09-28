# CampusConnect — Gap Analysis & Missing Features (2026-09-12)

A comprehensive review of the existing codebase for **half-built features, security
holes, production-readiness gaps, and UX dead-ends**. Everything below was found by
reading the actual source (the build sandbox is unavailable here), with concrete
`file:line` anchors so each item is verifiable and fixable in place.

This is a **findings report**. The highest-priority items (all **BLOCKER** and **HIGH**
rows) are then fixed in the same pass — see the companion runbook
`CHANGES-2026-09-12-part3.md` for exactly what changed and the manual build/verify steps.

Scope note honouring your standing directive: nothing here proposes a rebuild. Each fix
is a surgical edit to an existing file (or a small new file wired into existing plumbing),
and no duplicate component / API / route / DB logic is introduced.

---

## Severity legend

| Severity | Meaning |
| --- | --- |
| **BLOCKER** | Ships an exploitable hole or breaks a security constraint you set. Fix before any deploy. |
| **HIGH** | Real security/UX defect that a user or attacker will hit on normal paths. |
| **MEDIUM** | Production-hardening / correctness gap; not exploitable on its own. |
| **LOW** | Polish, ops nicety, or future-proofing. |

---

## Summary table

| # | Severity | Area | Gap | Fix effort |
| --- | --- | --- | --- | --- |
| 1 | **BLOCKER** | Auth/crypto | JWT signing secret is a hardcoded literal, **not** env-overridable; same secret committed in `docker-compose.yml` + `.env.example` | S |
| 2 | **BLOCKER** | Realtime authz | WebSocket endpoint has **no authentication**; any client can subscribe to **anyone's** private notification topic (IDOR) | M |
| 3 | **HIGH** | REST authz | `GET /api/users/{id}` returns any user's PII (email, phone, studentId) to any logged-in user (IDOR) | S |
| 4 | **HIGH** | UX dead-end | VOLUNTEER and ADMIN land on `/app/dashboard` after login — a page with **no nav entry for them**; volunteers see an empty/irrelevant screen | S |
| 5 | **MEDIUM** | Info leak | `server.error.include-message: always` echoes exception messages to clients in prod | S |
| 6 | **MEDIUM** | Secure default | `app.seed.enabled` defaults **true** — demo/admin data seeds itself in every fresh environment, incl. prod | S |
| 7 | **MEDIUM** | Secure default | Deleted demo admin is silently **resurrected** on next boot (`ensureDemoAdmin()` runs even when the DB already has users) | S |
| 8 | **LOW** | Ops | No `spring-boot-starter-actuator` dep, yet `/actuator/health` is permit-listed and referenced as a health check | S |
| 9 | **LOW** | Ops/CORS | `allowedHeaders("*")` with `allowCredentials(true)` is broader than needed | S |
| 10 | **LOW** | Delivery | Email + LLM + real payments are all **off by default** (correct), but there's no single "go-live checklist" surfacing the env they need | S |

Items **1–4** are implemented in this pass. **5–7** are cheap and also applied. **8–10**
are documented with the exact change to make but left as opt-in so nothing in your local
demo flow breaks.

---

## BLOCKER findings

### 1. JWT signing secret is hardcoded and not overridable

**Where:** `backend/src/main/resources/application.yml:53`, `docker-compose.yml:51`,
`.env.example:26`.

**What:** `app.jwt.secret` is set to a bare base64 literal:

```yaml
app:
  jwt:
    secret: BcQraUHV/s+MQZolSUk+iGBXqNx8uqz3R8R3rSZyTC5DeJlBU4rawIlM2NUY4XoVI+aE8Tmehce…
```

There is **no `${JWT_SECRET:…}` placeholder**, so the environment variable cannot
override it — the same key compiles into every build. The identical secret is **also
committed** in `docker-compose.yml` and `.env.example`. Because JWTs are signed with this
key, anyone who has seen the repo can **forge a valid token for any user, including
ADMIN**. This directly violates your constraint *"Do not hardcode passwords/API keys; use
environment variables."*

**Why it slipped through:** `JwtService.deriveKeyBytes()` accepts a plain string ≥32 bytes,
so the literal "works" — masking that it was never wired to an env var.

**Fix (applied):** make it genuinely overridable with an *obvious placeholder* default, and
require a real value in container/prod:

```yaml
secret: ${JWT_SECRET:dev-only-insecure-signing-key-change-me-in-production-0123456789}
```

```yaml
# docker-compose.yml
JWT_SECRET: ${JWT_SECRET:?Set JWT_SECRET in .env — generate with: openssl rand -base64 48}
```

`.env.example` gets the same non-secret placeholder (so `cp .env.example .env` still boots
locally), with a comment to generate a real one. `JwtService` already SHA-256-pads short
keys, so the dev default is safe for local use and the prod value is mandatory.

**Deliberately left alone:** `spring.datasource.password: ${SPRING_DATASOURCE_PASSWORD:tharun1437}`
and `MYSQL_ROOT_PASSWORD` — these are your **real local MySQL credentials**, already
env-overridable, and changing them would break your local dev. They are dev-only defaults,
not committed production secrets. (Just don't reuse that password in a public deployment.)

### 2. WebSocket has no authentication — private notifications are world-readable

**Where:** `backend/.../config/SecurityConfig.java:56` (`/ws/**` permitAll),
`backend/.../config/WebSocketConfig.java` (no inbound interceptor),
`backend/.../service/impl/NotificationServiceImpl.java` (publishes to
`/topic/notifications/{userId}`), `frontend/src/lib/ws.ts` (connects with no token).

**What:** The STOMP/SockJS endpoint is `permitAll` (correct — the HTTP handshake can't
carry the auth header for SockJS), **but nothing authenticates the STOMP CONNECT and
nothing authorizes SUBSCRIBE**. Notifications are pushed per-user to
`/topic/notifications/{userId}`, and `{userId}` is a guessable sequential id. Any client
can open the socket and `SUBSCRIBE /topic/notifications/42` to receive **another user's
private notifications** — a classic IDOR over WebSocket.

**Fix (applied):** add a `StompAuthChannelInterceptor` (Spring `ChannelInterceptor`) wired
into `configureClientInboundChannel`:

- On **CONNECT**, read the `Authorization: Bearer …` native header, validate it with the
  existing `JwtService` + `CustomUserDetailsService`, and bind the authenticated principal
  to the STOMP session (`accessor.setUser(...)`). Anonymous connects are allowed only for
  public topics; a present-but-invalid token is rejected.
- On **SUBSCRIBE** to `/topic/notifications/{id}`, require an authenticated principal whose
  id matches `{id}` (ADMIN exempt). Public topics (e.g. competition leaderboards) pass
  through unchanged.

The frontend `ws.ts` now attaches the access token via a `beforeConnect` hook so reconnects
and token refreshes keep working. This satisfies *"Authorization must be enforced at both
frontend and backend"* for the realtime channel and closes the IDOR without changing the
notification API surface.

---

## HIGH findings

### 3. `GET /api/users/{id}` leaks PII to any authenticated user

**Where:** `backend/.../controller/UserController.java` (`getById`),
`backend/.../dto/response/UserResponse.java` (exposes `email`, `phone`, `studentId`).

**What:** Any logged-in user can fetch any other user's full profile — including email,
phone number and student id — by incrementing the id. The endpoint has no ownership/role
check. (Confirmed the frontend never calls `userService.getById`, so gating it is
non-breaking.)

**Fix (applied):** require the caller to be the owner or an ADMIN:

```java
if (!id.equals(principal.getId()) && principal.getRole() != Role.ADMIN) {
    throw new ForbiddenException("You can only view your own profile.");
}
```

### 4. VOLUNTEER / ADMIN land on a dashboard they have no navigation to

**Where:** `frontend/src/App.tsx:118` (`/app` index → `Navigate to="dashboard"`),
`frontend/src/pages/auth/LoginPage.tsx:36-41` (post-login `|| '/app/dashboard'`),
`frontend/src/components/routing/GuestRoute.tsx:16-18`,
`frontend/src/components/layout/Sidebar.tsx` (Dashboard item excludes VOLUNTEER).

**What:** After login everyone is sent to `/app/dashboard`. The sidebar's Dashboard entry
is only shown to `STUDENT, CLUB_MEMBER, CLUB_COORDINATOR, ADMIN` — **VOLUNTEER is
excluded** — so a volunteer lands on a student dashboard with **no way back to it** and no
indication where their tools are. ADMINs likewise start away from the admin console.

**Fix (applied):** add a tiny `roleHome(role)` helper and a `RoleHomeRedirect` component;
route the `/app` index, `GuestRoute`, and the `LoginPage` post-login navigation through it
so VOLUNTEER → `/app/volunteer/dashboard`, ADMIN → `/app/admin`, everyone else →
`/app/dashboard`. The mobile/topbar brand links are pointed at the same helper for
consistency. No routes are added or removed.

---

## MEDIUM findings

### 5. Verbose error messages returned to clients

**Where:** `backend/src/main/resources/application.yml:4-6`.

`server.error.include-message: always` and `include-binding-errors: always` echo raw
exception text to HTTP clients — useful in dev, an information leak in prod. **Fix
(applied):** switch both to `on_param`, so details appear only when explicitly requested
during debugging.

### 6. Data seeding is on by default

**Where:** `application.yml:70` (`app.seed.enabled: ${SEED_ENABLED:true}`),
`backend/.../config/DataSeeder.java`.

A fresh environment (including a real deployment) auto-creates demo clubs, events and a
**demo admin**. Secure default should be **off**. **Fix (applied):** default to `false` in
`application.yml`; keep it opt-in (`SEED_ENABLED=true`) for the docker demo, with a comment.
The seeder bean is already `@ConditionalOnProperty`, so this fully disables it unless asked.

### 7. Deleted demo admin is resurrected on every boot

**Where:** `backend/.../config/DataSeeder.java:54-58` + `ensureDemoAdmin()` (lines ~227-234).

Even when the DB already has users, `run()` calls `ensureDemoAdmin()`, which **re-creates
the demo admin** if it was deleted. That means an operator who deliberately removes the
built-in admin finds it back after the next restart — a persistence/backdoor smell. **Fix
(applied):** remove the `ensureDemoAdmin()` call from the "already seeded" branch and delete
the method. First-run seeding (guarded by #6) is unchanged.

---

## LOW findings

### 8. Health-check path is permit-listed but Actuator isn't on the classpath

**Where:** `SecurityConfig.java:58` permits `/actuator/health`; `pom.xml` has no
`spring-boot-starter-actuator`. The path 404s, so container/orchestrator health checks
against it will fail. **Recommended (documented, not forced):** add the actuator starter and
expose only `health`, or point your health check at an existing lightweight endpoint. Left
opt-in to avoid changing your dependency set unannounced.

### 9. CORS is broader than necessary

**Where:** `SecurityConfig.java` CORS bean: `allowedHeaders("*")` with
`allowCredentials(true)` and a configurable origin list. Functional, but tightening
`allowedHeaders` to the ones you actually send (`Authorization, Content-Type`) reduces
surface. **Recommended (documented):** narrow when convenient; not exploitable given the
explicit origin allow-list.

### 10. No single go-live checklist for the "off by default" integrations

Email, the conversational LLM, and real payments are all correctly **disabled without
env** — but their required variables are spread across prior runbooks. **Fix (applied):**
consolidated into a "Go-live checklist" in `CHANGES-2026-09-12-part3.md` so nothing is
missed at deploy time.

---

## What was checked and found already solid (no action)

- **Passwords** are BCrypt-hashed; login/refresh/JWT filter chain is coherent.
- **Method-level security** (`@EnableMethodSecurity`) is on and used on sensitive services.
- **QR payloads** carry an opaque token, not PII — matches your "never expose sensitive
  info in the QR payload" constraint.
- **Payment provider** is a proper abstraction (mock/razorpay) with **no** hardcoded
  provider credentials; keys are server-side env only.
- **Entities are not returned directly** — controllers map to DTO records.
- **Email/LLM** never expose secrets to the browser (server-side only, key never shipped).
- **Frontend + backend authorization** are both present on the REST role-guarded routes
  (the WebSocket channel was the one place backend enforcement was missing — item 2).

---

## How these were verified (inspection-only)

The isolated build sandbox can't run `tsc`/`mvn`/`npm` here, so each fix was made to
compile cleanly by reading the surrounding code: confirming every new import is used,
matching the `ChannelInterceptor` / `StompHeaderAccessor` API, checking `roleHome` covers
the exact `Role` union (`STUDENT | VOLUNTEER | CLUB_MEMBER | CLUB_COORDINATOR | ADMIN`),
and confirming `userService.getById` has no frontend caller before gating it. The
authoritative gates remain your local `npm run build` and `mvn compile` — listed as step 1
in the runbook.
