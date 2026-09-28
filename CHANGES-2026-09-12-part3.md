# CampusConnect — update notes & manual steps (2026-09-12, part 3)

This round acts on the prioritized findings in **`GAP-ANALYSIS-2026-09-12.md`**.
It closes the two **BLOCKER** security gaps, both **HIGH** gaps, and the cheap
**MEDIUM** hardening items — every one of them with surgical, no-rebuild edits
that preserve existing behaviour and add no duplicate components, APIs, routes,
or DB logic.

As with parts 1 and 2, the build tools could not be run in this environment (the
isolated Linux sandbox has no access to the project files), so every change was
made and **verified by source inspection**: each new/changed TypeScript import is
actually used (the project builds under `noUnusedLocals`/`noUnusedParameters`, so
a stray import *fails* the build), and each Java change was checked against the
real method signatures in the surrounding code. The authoritative compile gates
are still `npm run build` (frontend) and `mvn -q -DskipTests compile` (backend) —
run them locally; see *Manual steps* at the end.

---

## What changed this round

### BLOCKER 1 — JWT signing secret is now environment-overridable (and fails fast in Docker)

**Problem:** `app.jwt.secret` in `application.yml` was a bare literal. Because it
wasn't wrapped in a `${…}` placeholder, setting a `JWT_SECRET` environment
variable did **nothing** — the app always signed tokens with the value baked into
the committed file. Anyone with the repo could forge tokens for any user against
any deployment that shipped that default.

**Fix:**

- `backend/.../resources/application.yml` — the secret is now
  `secret: ${JWT_SECRET:dev-only-insecure-signing-key-change-me-in-production-0123456789}`.
  Locally it still boots with no setup (the placeholder is an obvious ≥32-char
  dev value; `JwtService` SHA-256-pads/derives the key as before). In any shared
  or production environment, `JWT_SECRET` now genuinely overrides it.
- `docker-compose.yml` — `JWT_SECRET: "${JWT_SECRET:?Set JWT_SECRET in .env (generate with openssl rand -base64 48)}"`.
  The `:?` guard means the backend container **refuses to start** if the secret
  isn't set, so a real deployment can't silently fall back to a known key.
- `.env.example` — ships a clearly-labelled dev placeholder plus the
  `openssl rand -base64 48` generation hint.

**Note (correcting a claim from an earlier round):** an earlier note described
this dev secret as already "env-overridable." That was inaccurate — it was a
plain literal and could **not** be overridden. It can now.

The local MySQL datasource password (`SPRING_DATASOURCE_PASSWORD` /
`MYSQL_ROOT_PASSWORD`, default `tharun1437`) was **left untouched** on purpose —
it is your real local credential and is already env-overridable. Change it (and
`JWT_SECRET`) before any public deployment; never commit a real `.env`.

### BLOCKER 2 — WebSocket notifications are now authenticated & authorized (IDOR closed)

**Problem:** the STOMP `/ws` endpoint is `permitAll` (SockJS can't carry a bearer
header on the handshake), and nothing re-checked identity afterward. Any client
could `SUBSCRIBE` to `/topic/notifications/{anyUserId}` and receive another
user's private notifications — a classic IDOR.

**Fix (no new endpoint, no broker change):**

- **New** `backend/.../config/StompAuthChannelInterceptor.java` — a
  `ChannelInterceptor` on the client inbound channel that:
  - on **CONNECT**, reads `Authorization: Bearer <jwt>` from the STOMP frame and
    validates it with the *same* `JwtService` + `CustomUserDetailsService` the REST
    filter uses, binding the authenticated principal to the STOMP session
    (missing token → anonymous, public topics only; present-but-invalid → rejected);
  - on **SUBSCRIBE** to `/topic/notifications/{userId}`, requires an authenticated
    principal whose id matches `{userId}` (ADMIN exempt). Cross-user attempts are
    logged and rejected. Public topics (e.g. leaderboards) pass through unchanged.
- `backend/.../config/WebSocketConfig.java` — wires the interceptor via
  `configureClientInboundChannel(...)`. No dependency cycle (interceptor depends
  on security beans only; the config depends on the interceptor).
- `frontend/src/lib/ws.ts` — the shared STOMP client now attaches the access
  token on every (re)connect through `beforeConnect`, reading it fresh from
  `tokenStore` so login/refresh/reconnect all send a current token.

### HIGH 3 — `GET /api/users/{id}` no longer leaks other users' PII

**Problem:** the endpoint returned any user's full profile (email, phone,
student id, department) to *any* authenticated caller.

**Fix (`backend/.../controller/UserController.java`):** `getById` now returns
`403 Forbidden` unless the caller is requesting their own id or is an ADMIN,
reusing the existing `ForbiddenException` (already mapped to HTTP 403 by
`GlobalExceptionHandler`). `GET /api/users/me` is unchanged, and the frontend
never called `getById`, so nothing legitimate breaks.

### HIGH 4 — Volunteers and admins land on a real home, not a dead-end

**Problem:** after login *every* role was sent to `/app/dashboard`. Volunteers
and admins have no navigation entry there (they use their own workspace/console),
so they arrived at a page with no way forward.

**Fix (one helper, reused everywhere a landing path was hard-coded):**

- **New** `frontend/src/lib/roleHome.ts` — `roleHome(role)` returns
  `/app/volunteer/dashboard` for VOLUNTEER, `/app/admin` for ADMIN, and
  `/app/dashboard` for everyone else. Both targets are confirmed real routes in
  `App.tsx`.
- **New** `frontend/src/components/routing/RoleHomeRedirect.tsx` — the `/app`
  index now redirects by role instead of a fixed `to="dashboard"`.
- Every other previously hard-coded `/app/dashboard` landing now calls
  `roleHome(user.role)`: `App.tsx` (index), `GuestRoute.tsx`, `LoginPage.tsx`,
  `RegisterPage.tsx`, `Sidebar.tsx` (brand link), `Topbar.tsx` (mobile brand
  link), and `LandingPage.tsx` (the authenticated "Go to dashboard" CTA). The
  Dashboard *nav item* itself stays `/app/dashboard` and remains hidden from
  volunteers, as before.

### MEDIUM 5 — API error responses no longer echo internals by default

`application.yml` → `server.error.include-message: on_param` and
`include-binding-errors: on_param`. Exception text and binding details are now
returned only when explicitly requested (`?message=…`), so production error
bodies don't leak stack/exception internals. Flip to `always` locally if you want
them while debugging.

### MEDIUM 6 — Demo seeding is OFF by default

`application.yml` → `app.seed.enabled: ${SEED_ENABLED:false}`. The secure default
is now **off**; opt in with `SEED_ENABLED=true`. The Docker demo stack still sets
`SEED_ENABLED=true` (with a comment warning it creates a demo admin with a known
password) so the one-command demo keeps working.

### MEDIUM 7 — The demo admin can no longer be silently resurrected

`backend/.../config/DataSeeder.java` — removed the `ensureDemoAdmin()` call (and
the whole method) that re-created the known-password demo admin on startup **even
when the database already had users**. Seeding is now genuinely first-run-only,
and only when explicitly enabled.

---

## Documented but intentionally NOT auto-applied

These three lower-severity items from the gap analysis are **write-ups/opt-ins**,
not code changes, because they need an environment decision or a dependency you
should choose to add:

- **LOW 8 — actuator health path.** `management.endpoint` config assumes
  `spring-boot-starter-actuator`; add the dependency if you want `/actuator/health`
  for your platform's health checks. (Docker currently gates the frontend on the
  backend being *started*, not on an actuator probe.)
- **LOW 9 — CORS `allowedHeaders("*")`.** Fine for a token-in-header SPA;
  tighten to an explicit list if your security review requires it.
- **LOW 10 — go-live checklist.** Captured in the gap report's final section; the
  *Manual steps* below are the actionable short form.

---

## Manual steps (run locally — the sandbox can't)

1. **Backend compiles:** from `backend/`, `mvn -q -DskipTests compile`.
2. **Frontend builds** (this is also the unused-import gate): from `frontend/`,
   `npm ci && npm run build`.
3. **Smoke-test the two security fixes:**
   - *WebSocket authz:* sign in as user A, open the app, then in the browser
     console try subscribing to another user's topic — the SUBSCRIBE is now
     rejected. Your own notifications still arrive in real time.
   - *User PII:* `GET /api/users/{someoneElsesId}` with your token now returns
     **403**; `GET /api/users/me` still returns your profile.
   - *Role landing:* log in as a volunteer and as an admin — each lands on their
     own home, not an empty `/app/dashboard`.
4. **Before any real deployment:**
   - Set a strong `JWT_SECRET` (`openssl rand -base64 48`) in `.env` — Docker now
     **fails fast** without it.
   - Change `MYSQL_ROOT_PASSWORD` from the local default.
   - Leave `SEED_ENABLED` **unset/false** in production (default is now off).
   - Consider `JPA_DDL_AUTO=validate` with migrations instead of `update`.

No database migration is required for this round — all changes are config,
authorization logic, and routing.
