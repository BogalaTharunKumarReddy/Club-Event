# Deployment Guide

CampusConnect is built to run online, not just on a laptop. This guide covers the
two realistic paths to a public deployment:

1. **Single host (Docker Compose)** — one VPS/server runs MySQL, the Spring Boot
   API, and the nginx-served React build. Frontend and API share one origin;
   nginx proxies `/api` and `/ws` to the backend. Simplest and cheapest.
2. **Split hosting** — the React build ships to a static host/CDN
   (Vercel, Netlify, Cloudflare Pages, S3+CloudFront) and the API + MySQL run on a
   managed platform (Render, Railway, Fly.io, a VPS, or Kubernetes). Frontend and
   API live on **different domains**, so CORS and absolute API URLs matter.

Both paths use the **same code** and the **same environment variables** — only the
values change. Nothing is hardcoded; every secret comes from the environment.

---

## 0. Prerequisites for any real deployment

Before you expose CampusConnect publicly, set these three things correctly. They
are the difference between a demo and a deployment.

### Generate a real JWT secret

The default in `.env.example` is a throwaway dev value. Generate your own — it must
be Base64 and decode to at least 32 bytes (256 bits):

```bash
openssl rand -base64 48
```

Put the output in `JWT_SECRET`. Never commit it. If you rotate it, all existing
access/refresh tokens are invalidated (users simply log in again).

### Use a strong database password

Set `MYSQL_ROOT_PASSWORD` (single-host) or your managed DB's password
(`SPRING_DATASOURCE_PASSWORD`) to a strong, unique value. The Compose file
**fails fast** if `MYSQL_ROOT_PASSWORD` or `JWT_SECRET` is missing — that is
intentional, so you never accidentally ship with blank secrets.

### Lock down CORS to your real frontend origin

`CORS_ALLOWED_ORIGINS` must list the exact browser origin(s) that serve the app —
scheme + host + port, comma-separated, **no trailing slash**. For example:

```
CORS_ALLOWED_ORIGINS=https://campusconnect.example.com
```

Wildcard patterns are supported for preview deployments (e.g.
`https://*.vercel.app`); the backend automatically switches to Spring's
`allowedOriginPatterns` when it sees a `*`, so credentialed CORS keeps working.
Prefer exact origins in production.

---

## 1. Single-host deployment (Docker Compose)

This is the fastest way to get a working public instance. You need a server with
Docker + Docker Compose and a domain pointed at it.

### Steps

```bash
# 1. Clone onto the server
git clone <your-repo-url> campusconnect && cd campusconnect

# 2. Create your real environment file
cp .env.example .env

# 3. Edit .env — at minimum:
#    - MYSQL_ROOT_PASSWORD   (strong password)
#    - JWT_SECRET            (openssl rand -base64 48)
#    - CORS_ALLOWED_ORIGINS  (your public origin, e.g. https://campusconnect.example.com)
#    - FRONTEND_BASE_URL     (same public origin — used in outgoing email links)
#    Leave VITE_API_BASE_URL=/api and VITE_WS_URL=/ws (nginx proxies same-origin).

# 4. Build and start the whole stack
docker compose up -d --build

# 5. Watch it come up
docker compose logs -f backend
```

Compose starts three services: `mysql` (with a persistent `mysql-data` volume),
`backend` (waits for MySQL to be healthy), and `frontend` (nginx; waits for the
backend health check). By default the app is on `http://<server>:8081` and the API
on `http://<server>:8080`.

### Put it behind HTTPS

Run a TLS terminator in front (Caddy, Traefik, or nginx with certbot). Point your
domain at the server, terminate TLS there, and proxy to the frontend container
(`:8081`). Because the SPA calls the API through its **own** origin (`/api`), you
only need one certificate for one domain. Then set:

```
CORS_ALLOWED_ORIGINS=https://campusconnect.example.com
FRONTEND_BASE_URL=https://campusconnect.example.com
```

### Change exposed ports

`BACKEND_PORT` and `FRONTEND_PORT` in `.env` control the host ports. The container
ports (8080 / 80) never change.

---

## 2. Split hosting (static frontend + managed API)

Use this when you want the frontend on a CDN and the API on a managed platform.
The two live on different domains, so the frontend is built with **absolute** API
URLs and the backend must allow the frontend's origin.

### 2a. Deploy the backend + MySQL

On your platform of choice (Render, Railway, Fly.io, a VPS, etc.):

- Provision a **MySQL 8** database (managed instances work — RDS, PlanetScale-style
  MySQL, Railway MySQL, etc.).
- Deploy the backend from `backend/Dockerfile` (it produces a self-contained JAR
  image on `eclipse-temurin:21-jre`).
- Set these environment variables on the backend service:

| Variable | Example | Notes |
|---|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://<db-host>:3306/campusconnect?useSSL=true&serverTimezone=UTC` | Point at your managed DB. Keep `serverTimezone=UTC`. |
| `SPRING_DATASOURCE_USERNAME` | `campusconnect` | |
| `SPRING_DATASOURCE_PASSWORD` | `••••••` | From the platform secret store, never in code. |
| `JWT_SECRET` | `openssl rand -base64 48` output | Required. |
| `CORS_ALLOWED_ORIGINS` | `https://campusconnect.example.com` | Your **frontend** origin. |
| `FRONTEND_BASE_URL` | `https://campusconnect.example.com` | Used in email links. |
| `JPA_DDL_AUTO` | `update` (first boot) → `validate` | See note below. |
| `SEED_ENABLED` | `true` first boot, then `false` | Seeds demo data into an empty DB. |
| `MAIL_ENABLED` / `MAIL_*` | optional | Enable to send real email. |
| `SERVER_PORT` | platform-provided port | Many platforms inject `$PORT`; map it to `SERVER_PORT`. |

The API exposes a health endpoint at `/actuator/health` and API docs at
`/swagger-ui.html` — use the former for the platform's health check.

### 2b. Build and deploy the frontend

The React bundle needs to know the **absolute** URLs of the API and WebSocket at
**build time** (Vite inlines `VITE_*` values into the static bundle). Set these in
your static host's build environment:

```
VITE_API_BASE_URL=https://api.campusconnect.example.com/api
VITE_WS_URL=https://api.campusconnect.example.com/ws
```

Then build:

```bash
cd frontend
npm ci
npm run build      # outputs static files to frontend/dist
```

Deploy `frontend/dist` to your static host. On Vercel/Netlify, set the build
command to `npm run build`, the output directory to `dist`, and add the two
`VITE_*` variables above. Add an SPA rewrite so deep links work: route all paths
to `/index.html` (Netlify `_redirects`: `/* /index.html 200`; Vercel: a catch-all
rewrite to `/index.html`).

> **Important:** `VITE_*` variables are compiled into the client bundle and are
> therefore **public**. Never put secrets in them — they are only base URLs.

### 2c. Wire the two together

1. Backend `CORS_ALLOWED_ORIGINS` = the frontend's public origin.
2. Frontend `VITE_API_BASE_URL` / `VITE_WS_URL` = the backend's public origin
   (with `/api` and `/ws` suffixes).
3. Both must be served over **HTTPS** in production. A browser on an `https://`
   page will refuse to open an `http://` or `ws://` connection (mixed content),
   so the API must be `https://` and SockJS will negotiate `wss://` automatically.

---

## 3. Production environment variable reference

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `JWT_SECRET` | **Yes** | dev value | Base64, ≥32 bytes. Signs access/refresh tokens. |
| `SPRING_DATASOURCE_URL` | Yes (prod) | localhost MySQL | JDBC URL to your database. |
| `SPRING_DATASOURCE_USERNAME` | Yes (prod) | `root` | DB user. |
| `SPRING_DATASOURCE_PASSWORD` | **Yes** | `root` | DB password. |
| `CORS_ALLOWED_ORIGINS` | **Yes** | localhost list | Comma-separated allowed browser origins. |
| `FRONTEND_BASE_URL` | Recommended | `http://localhost:8081` | Base for links in emails. |
| `VITE_API_BASE_URL` | Split hosting | `/api` | Absolute API base baked into the frontend build. |
| `VITE_WS_URL` | Split hosting | `/ws` | Absolute WebSocket base baked into the frontend build. |
| `JPA_DDL_AUTO` | No | `update` | `update` to auto-create schema; `validate` once stable. |
| `SEED_ENABLED` | No | `true` | Seed demo data on first empty-DB boot. Turn off after. |
| `JWT_ACCESS_EXPIRATION` | No | `3600000` | Access token lifetime (ms). |
| `JWT_REFRESH_EXPIRATION` | No | `604800000` | Refresh token lifetime (ms). |
| `MAIL_ENABLED` + `MAIL_*` | No | disabled | Real email sending (else logged). |
| `PAYMENT_PROVIDER` | No | `mock` | Payment gateway abstraction; swap without code changes. |
| `SERVER_PORT` | No | `8080` | API listen port. |

Secrets (`JWT_SECRET`, DB password, mail/payment credentials) must come from your
platform's secret store or a git-ignored `.env` — never from committed files.

---

## 4. Post-deploy checklist

- [ ] `JWT_SECRET` and DB password are strong, unique, and not in git.
- [ ] `CORS_ALLOWED_ORIGINS` lists your real frontend origin(s), no trailing slash.
- [ ] Frontend and API are both on HTTPS (no mixed-content blocking).
- [ ] Log in as a seeded coordinator, create an event, register as a student —
      the full flow works against the deployed API.
- [ ] Live leaderboard / notifications update (confirms WebSocket `wss://` works).
- [ ] `SEED_ENABLED=false` after the first successful boot, so demo data isn't
      re-seeded and the DB reflects real usage.
- [ ] Set `JPA_DDL_AUTO=validate` once the schema is stable to prevent accidental
      schema drift in production.

---

## 5. Troubleshooting

**Login shows a network error / CORS error in the browser console.**
The frontend origin isn't in `CORS_ALLOWED_ORIGINS`, or the API URL baked into the
build is wrong. Confirm `VITE_API_BASE_URL` points at the live API and the backend
`CORS_ALLOWED_ORIGINS` contains the exact frontend origin (scheme + host + port).

**Local dev only: "Network Error" on login while `http://localhost:8080` opens fine.**
This is the IPv4/IPv6 proxy quirk. The Vite dev proxy targets `127.0.0.1:8080`
(not `localhost`) precisely to avoid it — make sure you didn't change that back.

**Backend container exits immediately.**
A required secret is unset. Compose intentionally fails fast when
`MYSQL_ROOT_PASSWORD` or `JWT_SECRET` is missing. Check `docker compose logs backend`.

**WebSocket won't connect on the deployed site.**
Ensure the API is HTTPS (so SockJS can use `wss://`), that `VITE_WS_URL` points at
the API origin's `/ws`, and that any proxy in front forwards `Upgrade`/`Connection`
headers (the bundled `frontend/nginx.conf` already does this for single-host).

**401s immediately after deploying a new backend.**
`JWT_SECRET` changed, so old tokens are invalid. Users just log in again.
