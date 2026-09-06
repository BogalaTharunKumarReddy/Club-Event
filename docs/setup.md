# Setup guide

This guide covers running CampusConnect two ways: with **Docker Compose** (one
command) and **locally** (backend + frontend + MySQL run separately for active
development). It also documents every environment variable and common fixes.

- [Prerequisites](#prerequisites)
- [Option A — Docker Compose](#option-a--docker-compose)
- [Option B — Local development](#option-b--local-development)
- [Environment variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool | Version | Needed for |
| --- | --- | --- |
| Docker + Compose plugin | recent | Option A (containers) |
| JDK | 21 | Option B (backend) |
| Maven | 3.9+ | Option B (backend) — or use your IDE's bundled Maven |
| Node.js | 20+ | Option B (frontend) |
| MySQL | 8.x | Option B (database) |

---

## Option A — Docker Compose

This is the fastest way to see the whole system running.

```bash
# from the project root
cp .env.example .env
```

Open `.env` and change at least these before anything else:

- `MYSQL_ROOT_PASSWORD` — the database password (also used by the backend).
- `JWT_SECRET` — a strong Base64 value. Generate one with `openssl rand -base64 48`.

Then build and start everything:

```bash
docker compose up --build
```

What happens:

1. **mysql** starts and initialises the `campusconnect` database, then reports
   healthy via `mysqladmin ping`.
2. **backend** waits for MySQL to be healthy, connects over JDBC, lets Hibernate
   create/update the schema, and (on an empty DB) seeds demo data. It becomes
   healthy once `/v3/api-docs` responds.
3. **frontend** waits for the backend to be healthy, then nginx serves the built
   SPA and proxies `/api` + `/ws` to the backend.

| Service | URL |
| --- | --- |
| App (SPA) | http://localhost:8081 |
| API base | http://localhost:8080/api |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| OpenAPI JSON | http://localhost:8080/v3/api-docs |
| MySQL | localhost:3306 (user `root`) |

Useful commands:

```bash
docker compose logs -f backend      # follow backend logs
docker compose ps                   # container status/health
docker compose down                 # stop and remove containers
docker compose down -v              # also delete the MySQL data volume (fresh DB)
docker compose up --build backend   # rebuild just the backend after code changes
```

Ports are configurable in `.env` (`FRONTEND_PORT`, `BACKEND_PORT`, `MYSQL_PORT`)
if any of the defaults are already in use.

---

## Option B — Local development

Best when you're actively editing code and want hot reload.

### 1. MySQL

Have a MySQL 8 server running and create the database (the app can also create it
automatically thanks to `createDatabaseIfNotExist=true`, but doing it explicitly
is fine too):

```sql
CREATE DATABASE campusconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` so `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`,
`SPRING_DATASOURCE_PASSWORD` match your MySQL, and set a `JWT_SECRET`. Because
Spring Boot reads OS environment variables (not `.env` automatically), export them
into your shell first — for example:

```bash
# macOS/Linux: load the .env values into the current shell
set -a && source .env && set +a

mvn spring-boot:run
```

On Windows PowerShell you can set the important ones inline:

```powershell
$env:SPRING_DATASOURCE_PASSWORD="yourpassword"
$env:JWT_SECRET="your-base64-secret"
mvn spring-boot:run
```

The API starts on http://localhost:8080. If `SEED_ENABLED=true` and the database
is empty, demo data (see the [README](../README.md#demo-accounts)) is created.

Build a runnable jar instead:

```bash
mvn clean package            # produces target/campusconnect-backend.jar
java -jar target/campusconnect-backend.jar
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env          # defaults are fine for local dev
npm install
npm run dev
```

The SPA runs on http://localhost:5173. `vite.config.ts` proxies `/api` and `/ws`
to `VITE_PROXY_TARGET` (defaults to `http://localhost:8080`), so the frontend and
backend talk to each other without any CORS setup during development.

Other frontend scripts:

```bash
npm run build        # type-check + production build into dist/
npm run preview      # serve the production build locally
npm run lint         # eslint (if configured)
```

---

## Environment variables

### Backend / Docker Compose (root `.env`)

| Variable | Default | Description |
| --- | --- | --- |
| `MYSQL_DATABASE` | `campusconnect` | Database name created by the MySQL container. |
| `MYSQL_ROOT_PASSWORD` | — (required) | MySQL root password; also the backend datasource password. |
| `MYSQL_PORT` | `3306` | Host port for MySQL. |
| `SPRING_DATASOURCE_URL` | see `application.yml` | JDBC URL. In Compose it points at the `mysql` service. |
| `SPRING_DATASOURCE_USERNAME` | `root` | DB user. |
| `SPRING_DATASOURCE_PASSWORD` | — | DB password (Compose reuses `MYSQL_ROOT_PASSWORD`). |
| `JPA_DDL_AUTO` | `update` | Hibernate schema mode. Use `validate` with migrations in prod. |
| `JPA_SHOW_SQL` | `false` | Log SQL statements. |
| `JWT_SECRET` | — (required) | Base64 signing secret; must decode to ≥ 32 bytes. |
| `JWT_ACCESS_EXPIRATION` | `3600000` | Access-token lifetime (ms). |
| `JWT_REFRESH_EXPIRATION` | `604800000` | Refresh-token lifetime (ms). |
| `CORS_ALLOWED_ORIGINS` | localhost origins | Comma-separated browser origins allowed to call the API. |
| `FRONTEND_BASE_URL` | `http://localhost:8081` | Used to build links inside emails. |
| `BACKEND_PORT` | `8080` | Host port for the API. |
| `FRONTEND_PORT` | `8081` | Host port for the SPA. |
| `SEED_ENABLED` | `true` | Seed demo data on first empty-DB startup. Disable in prod. |
| `MAIL_ENABLED` | `false` | Send real email. When false, notifications are logged. |
| `MAIL_HOST` / `MAIL_PORT` | `smtp.gmail.com` / `587` | SMTP server. |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | — | SMTP credentials. |
| `MAIL_FROM` | `no-reply@campusconnect.local` | From address. |
| `PAYMENT_PROVIDER` | `mock` | Payment gateway implementation to use. |
| `PAYMENT_CURRENCY` | `INR` | Currency for payments. |
| `AI_ENABLED` | `false` | Enable optional AI integration. |
| `AI_PROVIDER` / `AI_BASE_URL` / `AI_API_KEY` / `AI_MODEL` | see `.env.example` | AI config (interface-only until a key is set). |

### Frontend (`frontend/.env`)

Only non-secret, public values belong here — everything is compiled into the
client bundle.

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `/api` | API base. Leave as `/api` to use the dev proxy or nginx; set an absolute URL to call a remote API directly. |
| `VITE_WS_URL` | `/ws` | WebSocket base for SockJS/STOMP. |
| `VITE_PROXY_TARGET` | `http://localhost:8080` | Dev-only: where Vite forwards `/api` and `/ws`. |

---

## Troubleshooting

**Backend exits with a JWT key error.** `JWT_SECRET` must be Base64 and decode to
at least 32 bytes (256 bits). Generate a valid one with `openssl rand -base64 48`.

**Backend can't connect to MySQL.** In Docker, make sure MySQL became healthy
(`docker compose ps`); the backend retries until it's up. Locally, confirm the
JDBC URL/host/port and that the user has access to the `campusconnect` database.

**Port already in use.** Change `FRONTEND_PORT`, `BACKEND_PORT` or `MYSQL_PORT`
in `.env` (Docker) or the relevant dev-server port, then restart.

**CORS errors in the browser.** Add the exact origin you're loading the app from
to `CORS_ALLOWED_ORIGINS`. Note that in Docker the browser calls the API
same-origin through nginx, so CORS shouldn't trigger there.

**WebSocket / live leaderboard not updating.** Confirm `/ws` is reachable. In
Docker, nginx upgrades the connection (see `frontend/nginx.conf`); locally, the
Vite proxy has `ws: true`. Check the browser console for the SockJS handshake.

**I want a clean database.** `docker compose down -v` removes the MySQL volume so
the next `up` recreates and reseeds it.

**Seed data didn't appear.** Seeding only runs when there are zero users. Wipe the
volume (above) or set `SEED_ENABLED=true` against an empty database.
