# API reference

The backend exposes a REST API under `/api` and a STOMP WebSocket at `/ws`.
Interactive, always-current documentation is served by Swagger UI when the app is
running:

- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **OpenAPI JSON:** http://localhost:8080/v3/api-docs

This document summarises conventions and lists every endpoint.

- [Conventions](#conventions)
- [Authentication](#authentication)
- [Access levels](#access-levels)
- [Endpoints](#endpoints)
- [WebSocket](#websocket)

---

## Conventions

**Base URL.** All REST routes are prefixed with `/api` (e.g. `POST /api/auth/login`).
There is no servlet context path.

**Response envelope.** Every JSON response is wrapped in a consistent envelope:

```json
{
  "success": true,
  "message": "Optional human-readable message",
  "data": { }
}
```

On success, `data` holds the payload (an object, an array, or a paged result). On
error, `success` is `false`, `message` describes the problem, and `data` is usually
`null`.

**Pagination.** List endpoints that page return a `PageResponse<T>`:

```json
{
  "content": [ ],
  "page": 0,
  "size": 12,
  "totalElements": 42,
  "totalPages": 4,
  "first": true,
  "last": false
}
```

Pages are **zero-based**. Pass `?page=` and `?size=` (and where supported, `?sort=`)
as query parameters.

**Content types.** Requests and responses are `application/json`, except binary
downloads: certificates are returned as `application/pdf` and analytics reports as
`.xlsx` (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`).

**Money & dates.** Amounts are in the configured currency (INR by default). Date-times
are ISO-8601.

## Authentication

Authentication uses **JWT bearer tokens**.

1. `POST /api/auth/register` or `POST /api/auth/login` returns an **access token** and
   a **refresh token**.
2. Send the access token on every protected request:

   ```http
   Authorization: Bearer <accessToken>
   ```

3. When the access token expires, call `POST /api/auth/refresh` with the refresh token
   to obtain a new pair. (The web client does this automatically on a `401`.)

Passwords are hashed with BCrypt and never returned. The JWT secret and token
lifetimes are configured via environment variables.

## Access levels

| Marker | Meaning |
| --- | --- |
| 🌐 | **Public** — no authentication required. |
| 🔒 | **Authenticated** — any signed-in user. |
| 👑 | **Coordinator** — authenticated *and* the caller must coordinate the relevant club. This is enforced in the service layer via ownership checks (there is no global admin). |

## Endpoints

### Auth — `/api/auth`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| POST | `/register` | 🌐 | Create an account; returns tokens. |
| POST | `/login` | 🌐 | Sign in; returns tokens. |
| POST | `/refresh` | 🌐 | Exchange a refresh token for a new token pair. |
| GET | `/verify` | 🌐 | Verify an email/account token. |
| POST | `/forgot-password` | 🌐 | Request a password-reset link. |
| POST | `/reset-password` | 🌐 | Reset a password using the emailed token. |
| POST | `/logout` | 🔒 | Invalidate the current session/refresh token. |

### Users — `/api/users`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| GET | `/me` | 🔒 | Current user's profile. |
| PUT | `/me` | 🔒 | Update the current user's profile. |
| POST | `/me/change-password` | 🔒 | Change the current user's password. |
| GET | `/{id}` | 🔒 | Fetch a user's public profile. |

### Clubs — `/api/clubs`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| GET | `` | 🌐 | List clubs. |
| GET | `/{id}` | 🌐 | Club details (with member/event counts). |
| POST | `` | 🔒 | Create a club (creator becomes coordinator). |
| PUT | `/{id}` | 👑 | Update club details. |
| DELETE | `/{id}` | 👑 | Delete a club. |
| GET | `/{id}/members` | 👑 | List members (incl. pending). |
| POST | `/{id}/join` | 🔒 | Request to join a club. |
| POST | `/{id}/members/{membershipId}/approve` | 👑 | Approve a pending member. |
| DELETE | `/{id}/members/{membershipId}` | 👑 | Reject/remove a member. |
| POST | `/{id}/leave` | 🔒 | Leave a club. |
| GET | `/me/memberships` | 🔒 | The caller's club memberships. |

### Events — `/api/events`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| GET | `` | 🌐 | List/search events (query params for filters, paging). |
| GET | `/featured` | 🌐 | Featured events. |
| GET | `/{id}` | 🌐 | Event details. |
| GET | `/{id}/schedule` | 🌐 | Event agenda. |
| POST | `` | 👑 | Create an event (as draft). |
| PUT | `/{id}` | 👑 | Update an event. |
| POST | `/{id}/publish` | 👑 | Publish a draft. |
| PATCH | `/{id}/status` | 👑 | Change event status. |
| DELETE | `/{id}` | 👑 | Delete an event. |
| POST | `/{id}/schedule` | 👑 | Add a schedule item. |
| DELETE | `/{id}/schedule/{scheduleId}` | 👑 | Remove a schedule item. |

### Registrations — `/api/registrations`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| POST | `` | 🔒 | Register for an event (individual or team). |
| DELETE | `/{id}` | 🔒 | Cancel a registration. |
| GET | `/me` | 🔒 | The caller's registrations. |
| GET | `/me/event/{eventId}` | 🔒 | The caller's registration for an event. |
| GET | `/event/{eventId}` | 👑 | All registrations for an event (paged). |
| GET | `/{id}/qr` | 🔒 | QR image for a registration's ticket code. |

### Teams — `/api/teams`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| POST | `` | 🔒 | Create a team for a team event. |
| GET | `/{id}` | 🔒 | Team details. |
| GET | `/event/{eventId}` | 🔒 | Teams for an event. |
| GET | `/me` | 🔒 | The caller's teams. |
| POST | `/{id}/members` | 🔒 | Add a member to a team. |
| DELETE | `/{id}/members/{membershipId}` | 🔒 | Remove a team member. |
| DELETE | `/{id}` | 🔒 | Disband a team. |

### Attendance — `/api/attendance`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| POST | `/check-in` | 👑 | Check in by scanning a ticket code (QR). |
| POST | `/manual` | 👑 | Manual check-in by registration id. |
| POST | `/{id}/check-out` | 👑 | Check out an attendee. |
| GET | `/event/{eventId}` | 👑 | Attendance records for an event. |
| GET | `/me` | 🔒 | The caller's own attendance history. |

### Competitions — `/api/competitions`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| GET | `/event/{eventId}` | 🌐 | Competitions under an event. |
| GET | `/{id}` | 🌐 | Competition details. |
| GET | `/{id}/rounds` | 🌐 | Rounds of a competition. |
| GET | `/{id}/leaderboard` | 🌐 | Current leaderboard. |
| POST | `` | 👑 | Create a competition. |
| PATCH | `/{id}/status` | 👑 | Change competition status. |
| POST | `/{id}/rounds` | 👑 | Add a round. |
| DELETE | `/rounds/{roundId}` | 👑 | Remove a round. |
| POST | `/{id}/judges` | 👑 | Assign a judge (by email). |
| GET | `/{id}/judges` | 🔒 | List judges. |
| DELETE | `/{id}/judges/{judgeId}` | 👑 | Remove a judge. |
| POST | `/scores` | 🔒 | Submit a score (judge-only, competition must be `ONGOING`). |
| GET | `/rounds/{roundId}/scores` | 🔒 | Scores for a round. |

### Certificates — `/api/certificates`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| POST | `` | 👑 | Issue a certificate (by attendee email). |
| GET | `/me` | 🔒 | The caller's certificates. |
| GET | `/event/{eventId}` | 👑 | Certificates issued for an event. |
| GET | `/{id}/download` | 🔒 | Download a certificate PDF. |
| GET | `/verify/{code}` | 🌐 | Publicly verify a certificate by code. |

### Payments — `/api/payments`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| POST | `/initiate` | 🔒 | Start a payment for a paid event (via the provider abstraction). |
| GET | `/me` | 🔒 | The caller's payments. |
| GET | `/{id}` | 🔒 | A payment's details. |
| GET | `/event/{eventId}` | 👑 | Payments for an event. |

### Feedback — `/api/feedback`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| POST | `` | 🔒 | Submit feedback for an event. |
| GET | `/me/event/{eventId}` | 🔒 | The caller's feedback for an event. |
| GET | `/event/{eventId}` | 👑 | All feedback for an event. |
| GET | `/event/{eventId}/summary` | 🌐 | Rating summary (average + distribution). |

### Announcements — `/api/announcements`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| POST | `` | 👑 | Create a club/event/general announcement. |
| DELETE | `/{id}` | 👑 | Delete an announcement. |
| GET | `` | 🌐 | List announcements. |
| GET | `/general` | 🌐 | General announcements. |
| GET | `/club/{clubId}` | 🌐 | A club's announcements. |
| GET | `/event/{eventId}` | 🌐 | An event's announcements. |

### Notifications — `/api/notifications`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| GET | `/me` | 🔒 | The caller's notifications. |
| GET | `/me/unread` | 🔒 | Unread notifications. |
| GET | `/me/unread-count` | 🔒 | Count of unread notifications. |
| POST | `/{id}/read` | 🔒 | Mark one as read. |
| POST | `/read-all` | 🔒 | Mark all as read. |

### Analytics — `/api/analytics`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| GET | `/club/{clubId}` | 👑 | Club dashboard metrics. |
| GET | `/event/{eventId}` | 👑 | Event statistics. |
| GET | `/club/{clubId}/report` | 👑 | Download club report (`.xlsx`). |
| GET | `/event/{eventId}/report` | 👑 | Download event report (`.xlsx`). |

## WebSocket

Real-time updates use **STOMP over SockJS**.

- **Endpoint:** `/ws` (SockJS). The web client connects with `@stomp/stompjs` +
  `sockjs-client`.
- **Broker:** a simple in-memory broker with the `/topic` prefix.
- **Leaderboard topic:** the client subscribes to
  `/topic/competitions/{competitionId}/leaderboard`; whenever a score is submitted the
  server publishes the recomputed leaderboard to that topic, so all viewers update live.
- **Notifications topic:** each user subscribes to `/topic/notifications/{userId}` to
  receive their notifications in real time.

In development the Vite dev server proxies `/ws` (with WebSocket upgrade) to the
backend; in Docker, nginx does the same. No secrets are exchanged over the socket.
