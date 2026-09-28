# CampusConnect — update notes & manual steps (2026-09-12, part 2)

This round addresses: **payment not showing at registration**, the **AI chatbot
appearing "missing"**, **email verification + forgot-password**, **removing old
data in MySQL**, and **turning the app into a native mobile app**.

As before, the build tools could not be run in this environment (the isolated
Linux sandbox has no access to the project files), so every change was made and
verified **by source inspection**. The real compile gates are `npm run build`
(frontend) and `mvn compile` (backend) — run them locally; see *Manual steps*.

> This supersedes item **4 ("Turn on the in-app AI assistant")** of
> `CHANGES-2026-09-12.md`: the assistant is **no longer hidden** when AI is
> disabled — see §2 below.

---

## What changed this round

### 1. Payment option now appears during event registration

**Problem:** for a paid event, the "Pay ₹X" button only appeared *after* you had
already registered, so it looked like paying wasn't offered at sign-up.

**Fix (`frontend/src/pages/events/EventDetailPage.tsx`, no backend change):** the
registration call-to-action for a paid, non-team event that isn't full is now a
single **"Register & pay ₹X"** action. It registers you, then immediately runs the
payment flow (`registrationService.register` → `paymentService.initiate` → mock
settle, or Razorpay hosted checkout when configured). The existing standalone
"Pay" button (for someone already registered but unpaid) is unchanged, and free
events still show plain **"Register now"**. A short hint under the button explains
the fee is confirmed right after registering. Waitlist behaviour (when full) is
preserved.

This reuses the existing payment gateway abstraction — nothing was duplicated. The
active provider is still chosen by `app.payment.provider` (default **mock**, which
settles instantly and is perfect for local use).

### 2. AI chatbot is now always available (built-in guide + optional LLM)

**Problem:** the help widget probes `GET /api/assistant/status` and hides itself
when the assistant is disabled. Since AI is off by default, the chatbot looked
**missing**.

**Fix (`backend/.../service/impl/AssistantServiceImpl.java`):** the assistant is
now **always on** for signed-in users:

- With **no AI key** (the default), it answers from a **built-in guide** — a
  keyword responder covering finding/registering for events, paying, teams,
  QR check-in/attendance, certificates + verification, clubs, app navigation, and
  account help (verify email / reset password). So students always get useful help.
- With an **AI key configured**, it uses the LLM for a full conversational
  experience (the key stays server-side and is never sent to the browser).
- If a configured LLM call fails (bad key, quota, network), it **degrades
  gracefully** to the same built-in guide instead of erroring.

`isEnabled()` now returns `true`, so `GET /api/assistant/status` reports
`enabled:true` and the widget always shows. The per-user rate limit still applies
on the LLM path. The widget footer text was adjusted so it's accurate whether the
answer came from the guide or the LLM
(`frontend/src/components/assistant/AssistantWidget.tsx`).

Enabling the LLM is **optional** (see manual steps §3).

### 3. Email verification & forgot-password — confirmed working, just enable delivery

These were **already fully implemented**; no code was added (honouring
"don't rebuild"). Verified end-to-end by inspection:

- **Sign-up** creates the account with `emailVerified=false` + a verification
  token and emails a `…/verify-email?token=…` link (`AuthServiceImpl.register`).
- **`/verify-email`**, **`/forgot-password`**, **`/reset-password`** routes exist
  in `App.tsx`; the login page links to **Forgot password?**.
- **Forgot-password** doesn't reveal whether an email exists, issues a 1-hour
  reset token, and emails a `…/reset-password?token=…` link.
- **Email transport** (`EmailServiceImpl`) is env-gated: when mail is disabled it
  **logs the full message (including the link)** so you can still verify/reset in
  local dev; when enabled it sends via SMTP.

To make real emails go out, set the SMTP env vars in manual steps §4.

### 4. "Remove old data in MySQL" — clean-slate reset script

New file **`db/reset-database.sql`**. It **deletes all rows from every table while
keeping the schema** (tables/columns/indexes/foreign keys) intact — so the app
still starts normally under `ddl-auto=update`. It disables FK checks, `TRUNCATE`s
all 29 tables (which also resets AUTO_INCREMENT), then re-enables checks. A
future-proof dynamic variant (truncates every table in the schema) is included,
commented, at the bottom.

**It is destructive and is NOT run automatically — you run it yourself.** See
manual steps §5.

### 5. Native mobile app (Android + iOS) via Capacitor

The existing React/Vite frontend can now be packaged as a **native app without a
rewrite**, using Capacitor. Added:

- `frontend/capacitor.config.ts` — `appId com.campusconnect.app`, `webDir: dist`,
  `androidScheme: https` (a secure context, required for the QR scanner camera).
- Capacitor deps + `cap:*` scripts in `frontend/package.json`.
- `frontend/.env.mobile.example` — absolute backend URLs for device builds.
- **`MOBILE.md`** — full setup/build/run guide (prerequisites, add platforms,
  backend URL, CORS, camera permissions, cleartext-HTTP note, producing APK/IPA,
  troubleshooting).

The API base URL was **already** env-driven (`VITE_API_BASE_URL || '/api'`), so no
code change was needed — a device build just supplies an absolute URL. Building the
actual APK/IPA requires Android Studio / Xcode (documented). See manual steps §6.

---

## Required manual steps

Run on your machine, in order. (If you haven't already, also do the cleanup +
build steps from the previous `CHANGES-2026-09-12.md`.)

### 1. Build the frontend (compile gate)

```bash
cd campusconnect/frontend
npm install            # also pulls the new Capacitor packages
npm run build          # tsc -b && vite build  (strict: noUnusedLocals/Parameters)
```

### 2. Build the backend (compile gate)

```bash
cd campusconnect/backend
mvn compile            # Maven required; there is no ./mvnw wrapper
```

No DB migration needed (`ddl-auto=update`).

### 3. (Optional) Enable the conversational LLM

The chatbot already works without this (built-in guide). For full AI answers, set
for the backend before starting it:

```bash
AI_ENABLED=true
AI_API_KEY=sk-...                       # your key — server-side only, never shipped
AI_PROVIDER=openai
AI_BASE_URL=https://api.openai.com/v1   # any OpenAI-compatible endpoint
AI_MODEL=gpt-4o-mini
```

### 4. Enable real email delivery (verification + password reset)

Emails are logged (not sent) until you enable SMTP. To actually send, set:

```bash
MAIL_ENABLED=true
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-smtp-user
MAIL_PASSWORD=your-smtp-app-password    # use an app password, not your login
MAIL_FROM=no-reply@yourdomain.com
FRONTEND_BASE_URL=https://your-frontend-host   # used to build the links in emails
```

Notes: credentials come only from env (never hardcoded/committed). While
`MAIL_ENABLED=false`, check the backend logs for lines beginning `[MAIL disabled]`
— the verification/reset link is printed there for local testing. Set
`FRONTEND_BASE_URL` to wherever your app is reachable (for the mobile app this is
still your web frontend URL, since the links open in a browser).

### 5. Wipe old data in MySQL (destructive)

```bash
# 1) BACK UP FIRST
mysqldump -u root -p campusconnect > campusconnect-backup.sql

# 2) Run the reset (deletes all rows, keeps the schema)
mysql -u root -p campusconnect < db/reset-database.sql
```

After wiping: if `app.seed.enabled=true`, restarting the backend recreates the demo
data automatically. If seeding is off, the DB stays empty — register a new account
(the first self-registered user is a **STUDENT**; to get an **ADMIN**, either enable
seeding once, or run
`UPDATE \`user\` SET role='ADMIN' WHERE email='you@college.edu';`).

### 6. Build the mobile app

Follow **`MOBILE.md`**. Summary:

```bash
cd campusconnect/frontend
npm install
npx cap add android          # and/or: npx cap add ios   (macOS)
cp .env.mobile.example .env.production   # set VITE_API_BASE_URL / VITE_WS_URL (absolute)
npm run cap:run:android      # build + sync + open Android Studio
```

Then add the WebView origins to the backend CORS list and declare camera
permission (details + iOS steps in `MOBILE.md`):

```bash
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://localhost,capacitor://localhost
```

### 7. (Reference) Payment provider

Local dev needs nothing — the default `app.payment.provider=mock` settles instantly.
For real payments set `PAYMENT_PROVIDER=razorpay` plus the Razorpay keys (server-side
env only); the "Register & pay" flow then opens the hosted checkout automatically.

---

## How this was verified (inspection-only)

`tsc`, `npm` and `mvn` could not be executed here, so correctness was checked by
reading the source:

- **AssistantServiceImpl** — imports all used (`Locale`, `Set`,
  `ServiceUnavailableException`, `TooManyRequestsException`,
  `RestClientResponseException`, etc.); `AssistantChatResponse(String)` and
  `AssistantChatRequest.message()/history()`/`Turn.role()/content()` match the DTOs;
  new helpers are self-contained; no other caller depends on the old
  "disabled → 503" behaviour (only the controller's status/chat, and the widget).
- **EventDetailPage** — `handlePay`, `runPaymentFlow`, `handleRegisterAndPay`,
  `handleIndividualRegister` are all defined **and** referenced (no unused-locals
  break); reused imports (`CreditCard`, `Ticket`, `Clock`, `formatCurrency`,
  `errorMessage`, `paymentService`, `registrationService`, Razorpay helpers) already
  existed — no new imports.
- **AssistantWidget** — footer-only text change; still keyed off `enabled`
  (now always true).
- **package.json** — valid JSON; Capacitor deps/scripts added; existing scripts
  untouched.
- **capacitor.config.ts** — lives at the frontend root, which is **outside** the
  `tsc -b` project inputs (`tsconfig.json` includes only `src`; `tsconfig.node.json`
  only `vite.config.ts`), so it can't break the web build even before Capacitor is
  installed.
- **reset-database.sql** — table list matches the 29 `@Entity` classes (no hidden
  join tables; `@ElementCollection`/`@JoinTable` search returned none); `user` is
  back-quoted (reserved word); FK checks disabled around the truncates.

**Still recommended:** run steps 1 and 2 — they are the authoritative gates.

---

## Files changed / added this round

- `frontend/src/pages/events/EventDetailPage.tsx` — single-tap **Register & pay** CTA.
- `backend/src/main/java/com/campusconnect/service/impl/AssistantServiceImpl.java` —
  always-available assistant with built-in guide fallback.
- `frontend/src/components/assistant/AssistantWidget.tsx` — accurate footer text.
- `frontend/capacitor.config.ts` — **new**, Capacitor config.
- `frontend/.env.mobile.example` — **new**, mobile build env template.
- `frontend/package.json` — Capacitor deps + `cap:*` scripts.
- `db/reset-database.sql` — **new**, clean-slate MySQL reset.
- `MOBILE.md` — **new**, mobile build guide.

_No backend Java was changed for payments/email/mobile — those flows already
existed; only the assistant service was modified._
