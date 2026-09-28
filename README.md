# CampusConnect

A full-stack **College Club & Event Management System**. Clubs publish events,
students register (individually or as teams), coordinators run check-in and
competitions with a live leaderboard, and the platform issues verifiable
certificates and tracks payments, feedback and analytics.

Built as a real, deployable product — not a mockup. Every screen is backed by a
real REST API and persistent MySQL data with full CRUD.

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS, React Router, Axios,
  React Hook Form + Zod, Recharts, i18next, STOMP/SockJS.
- **Backend:** Java 21 + Spring Boot 3.3, Spring Data JPA/Hibernate, Spring
  Security + JWT, Bean Validation, Spring Mail, WebSocket/STOMP.
- **Database:** MySQL 8.
- **Packaging:** Docker + Docker Compose (MySQL + API + nginx-served SPA).

---

## Table of contents

- [Features](#features)
- [Roles](#roles)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Quick start with Docker](#quick-start-with-docker)
- [Demo accounts](#demo-accounts)
- [Running locally without Docker](#running-locally-without-docker)
- [Project structure](#project-structure)
- [Security notes](#security-notes)
- [Documentation](#documentation)

---

## Features

The system is organised into four functional modules.

**Module 1 — Accounts, clubs & events.** Email/password registration and JWT
login with refresh tokens and password recovery; club creation and membership
(join → coordinator approval); event authoring with drafts, publishing, banners,
categories, capacity, schedules, and paid/team options.

**Module 2 — Registration, teams & attendance.** Individual and team
registration with waitlisting when capacity is reached; team creation and
membership; QR-based and manual check-in/check-out. Each registration carries an
opaque ticket code — the QR encodes only that code, never personal data.

**Module 3 — Competitions & live leaderboard.** Coordinators create competitions
under an event, define rounds, assign judges, and judges submit scores; a live
leaderboard streams over WebSocket/STOMP as scores are entered.

**Module 4 — Certificates, payments, analytics.** PDF certificate generation
(participation / winner / merit) with public verification by code; a payment
gateway abstraction (mock provider by default) for paid events; feedback with
rating summaries; and event/club analytics with downloadable Excel reports.

## Roles

There are four roles, each with a clearly scoped set of permissions:

| Role | Can do |
| --- | --- |
| **Student** | Browse and register for events, join clubs, form/join teams, give feedback, download their certificates, pay for paid events. |
| **Club Member** | Everything a student can, plus assist their club. |
| **Club Coordinator** | Manage their club(s): edit details, approve members, create/publish events, run attendance, run competitions, issue certificates, post announcements, view analytics. |
| **Admin** | Full platform administration: manage all users (roles, enable/disable), all clubs and all events across the system, plus platform-wide dashboards. |

Coordinator authority is always scoped to the club a coordinator actually
coordinates — a coordinator has no reach into clubs they don't run. Platform-wide
authority lives only in the dedicated **Admin** role, enforced server-side by
role-based access control on every admin endpoint.

## Architecture

```
                         ┌─────────────────────────────┐
   Browser  ── :8081 ──▶ │  frontend (nginx + React SPA)│
                         │   /api  ─┐   /ws ─┐           │
                         └──────────┼────────┼───────────┘
                                    │ proxy  │ proxy (WebSocket upgrade)
                                    ▼        ▼
                         ┌─────────────────────────────┐
                :8080 ──▶│  backend (Spring Boot API)   │
                         │  REST /api/**  +  STOMP /ws  │
                         └───────────────┬──────────────┘
                                         │ JDBC
                                         ▼
                         ┌─────────────────────────────┐
                :3306 ──▶│  mysql 8 (campusconnect)     │
                         └─────────────────────────────┘
```

In production the browser talks only to the frontend origin; nginx reverse-proxies
`/api` and `/ws` to the backend, so there is no cross-origin traffic. During local
development, Vite's dev server (`:5173`) proxies the same paths to the API.

## Tech stack

| Layer | Choices |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router, Axios, React Hook Form, Zod, Recharts, i18next, @stomp/stompjs + SockJS |
| Backend | Java 21, Spring Boot 3.3, Spring Web, Spring Data JPA (Hibernate), Spring Security, JJWT, Bean Validation, Spring Mail, Spring WebSocket, springdoc-openapi |
| Reports & docs | Apache POI (`.xlsx` reports), OpenPDF (certificates), ZXing (QR codes) |
| Database | MySQL 8 |
| Build & deploy | Maven, npm, Docker, Docker Compose, nginx |

## Quick start with Docker

**Prerequisites:** Docker Desktop (or Docker Engine) with the Compose plugin.

```bash
# 1) From the project root, create your env file and edit the secrets
cp .env.example .env
#    -> at minimum change MYSQL_ROOT_PASSWORD and JWT_SECRET

# 2) Build and start MySQL + backend + frontend
docker compose up --build

# 3) Open the app
#    Frontend (SPA)  ->  http://localhost:8081
#    Swagger UI      ->  http://localhost:8080/swagger-ui.html
```

The backend waits for MySQL to be healthy, creates the schema automatically
(`JPA_DDL_AUTO=update`), and seeds demo data on first run (`SEED_ENABLED=true`).
The frontend waits for the backend to report healthy before it starts.

To stop: `Ctrl+C`, then `docker compose down`. To also wipe the database volume:
`docker compose down -v`.

## Demo accounts

When seeding is enabled, these accounts are created (password is the same for all):

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@campusconnect.local` | `Password123!` |
| Club Coordinator | `coordinator@campusconnect.local` | `Password123!` |
| Club Member | `member@campusconnect.local` | `Password123!` |
| Student | `student@campusconnect.local` | `Password123!` |

Two more students (`vikram@campusconnect.local`, `sara@campusconnect.local`) plus
3 clubs and 5 events are also seeded. Seeding only runs when the database has no
users, and should be disabled in production (`SEED_ENABLED=false`).

## Running locally without Docker

See **[docs/setup.md](docs/setup.md)** for the full guide. In short:

```bash
# --- Backend (needs JDK 21 + a running MySQL) ---
cd backend
cp .env.example .env          # set DB creds + JWT_SECRET, then export them
mvn spring-boot:run           # API on http://localhost:8080

# --- Frontend (needs Node 20+) ---
cd frontend
cp .env.example .env          # defaults proxy /api + /ws to :8080
npm install
npm run dev                   # SPA on http://localhost:5173
```

## Project structure

```
campusconnect/
├── docker-compose.yml         # MySQL + backend + frontend
├── .env.example               # root env for Docker Compose (copy to .env)
├── backend/
│   ├── Dockerfile             # multi-stage Maven build -> JRE 21 runtime
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/campusconnect/
│       │   ├── config/        # security, JWT, CORS, WebSocket, seeding
│       │   ├── controller/    # REST controllers (/api/**)
│       │   ├── dto/           # request/response DTOs (never expose entities)
│       │   ├── entity/        # JPA entities + enums
│       │   ├── repository/    # Spring Data repositories
│       │   ├── service/       # business logic (+ impl)
│       │   └── security/      # JWT filter, user principal
│       └── resources/
│           └── application.yml
├── frontend/
│   ├── Dockerfile             # Vite build -> nginx
│   ├── nginx.conf             # SPA fallback + /api + /ws proxy
│   └── src/
│       ├── components/        # ui, domain, layout, routing
│       ├── context/           # auth, theme
│       ├── hooks/             # useApi, useStompTopic, ...
│       ├── lib/               # axios client, services, utils, constants
│       ├── pages/             # route pages (incl. manage/ for coordinators)
│       └── types/             # shared TypeScript DTOs
└── docs/
    ├── setup.md               # detailed local + Docker setup
    ├── database.md            # schema, enums, relationships, seeding
    ├── api.md                 # REST + WebSocket reference
    └── deployment.md          # online hosting: single-host & split-domain
```

## Security notes

Security was a first-class requirement. Highlights:

- **No hardcoded secrets.** All credentials (DB password, JWT secret, mail,
  payment/AI keys) come from environment variables. `.env` is git-ignored; only
  `.env.example` templates are committed.
- **JWT auth.** Stateless access tokens with refresh tokens; passwords hashed with
  BCrypt. The JWT secret must be Base64 and decode to at least 32 bytes.
- **DTOs, not entities.** The API never serialises JPA entities directly; every
  endpoint maps to purpose-built request/response DTOs.
- **Role-based access control.** Every endpoint is guarded by role and, where
  relevant, ownership: coordinators can only act on clubs they coordinate, and
  platform-wide operations are restricted to the dedicated `ADMIN` role and
  enforced server-side — never trusted from the client.
- **Opaque QR payloads.** Attendance QR codes encode only an opaque ticket code;
  no personal information is embedded.
- **Payment abstraction.** Payments go through a provider-agnostic interface
  (mock by default) so a real gateway can be added later without code changes and
  without hardcoding provider credentials.
- **Least privilege at runtime.** The backend container runs as a non-root user.
- **Client stays public.** Only non-sensitive `VITE_` config is compiled into the
  frontend bundle; secrets never reach the browser.

## Documentation

- **[docs/setup.md](docs/setup.md)** — prerequisites, local dev, Docker, env vars, troubleshooting.
- **[docs/database.md](docs/database.md)** — tables, enums, relationships, ER diagram, seeding.
- **[docs/api.md](docs/api.md)** — response envelope, auth, pagination, full endpoint reference, WebSocket, Swagger.
- **[docs/deployment.md](docs/deployment.md)** — deploying online: single-host (Docker Compose) and split-domain (static frontend + managed API), production env vars, HTTPS/CORS, checklist.

Interactive API docs are always available at `/swagger-ui.html` when the backend
is running.
