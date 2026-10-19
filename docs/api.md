# API Reference

This is a map of the HTTP and WebSocket API exposed by the Django server. For request and
response field details, use the generated OpenAPI documentation:

- Schema: `GET /api/schema/`
- Swagger UI: `/api/schema/swagger-ui/`

These are served wherever the backend runs (e.g. `http://localhost:8000` locally, port
8443 behind Nginx in staging). The schema is produced by drf-spectacular from the code, so
it is the most precise source; where a view lacks `@extend_schema`, the schema may be
incomplete.

- [Conventions](#conventions)
- [Response envelope](#response-envelope)
- [Endpoints](#endpoints)
- [WebSocket API](#websocket-api)
- [Admin API](#admin-api)

## Conventions

- **Base URL**: the backend origin. There is no `/api/` prefix except for the schema.
- **Trailing slashes** are required (Django `APPEND_SLASH` cannot redirect POST bodies).
- **Authentication**: `Authorization: Bearer <access token>` (SimpleJWT). Unless an
  endpoint below says "Public", it requires a valid access token.
- **Auth column**: "Public" = no token needed; "Any user" / "Authenticated" = any valid token;
  "Owner" / "Uploader" / "Contract parties" = the view filters by the current user.
- **Roles**: "Client" / "Freelancer" means the endpoint checks `user.role`. Other users
  receive `403`.
- **IDs**: users, jobs, proposals, contracts, milestones, steps, payments and meetings use
  UUIDs; categories, skills, messages and notifications use integers.
- **Pagination**: list endpoints that paginate use DRF page-number pagination
  (`?page=`, `?page_size=` up to 100, default 10) and return
  `{count, next, previous, results}` inside `data`.
- **File uploads** use `multipart/form-data`.

## Response envelope

`utils.helpers.JSONRenderer` wraps every DRF response:

```json
// success (status < 400)
{
  "success": true,
  "status_code": 200,
  "message": "Request Successful",
  "data": { "...": "..." }
}

// error (status >= 400)
{
  "success": false,
  "status_code": 400,
  "message": "An error occurred",
  "error": { "field_name": ["Error message"] }
}
```

- `message` and `status_code` come from the view when it provides them (via
  `utils.helpers.Response`), otherwise defaults are used.
- An empty body (e.g. 204) becomes `{"status_code": 204, "message": "Deleted successfully"}`.
- Validation errors from serializers appear under `error`, keyed by field name, or under
  `non_field_errors` / `detail`.

`GET /payments/callback/` is an exception: it returns an HTTP 301 redirect.

## Endpoints

### Health and docs

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health_check/` | Public | `{"status": "healthy"}`. Used by Docker health checks. |
| GET | `/api/schema/` | Public | OpenAPI schema. |
| GET | `/api/schema/swagger-ui/` | Public | Swagger UI. |
| – | `/admin/` | Django session (staff) | Django admin. |

### Accounts (`/accounts/`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `signup/` | Public | Freelancer sign-up (accepted email domain + student ID). |
| POST | `signup-google/` | Public | Freelancer sign-up with Google `code`; returns tokens. |
| POST | `clients/signup/` | Public | Client sign-up. |
| POST | `clients/signup-google/` | Public | Client sign-up with Google `code` + `student_id`; returns tokens. |
| GET | `accepted-domain/` | Public | Active accepted email domains. |
| GET | `verify/email/<uidb64>/<token>/` | Public | Verify email address. |
| GET | `resend/email/<uidb64>/<token>/` | Public | Resend verification email after expiry. |
| POST | `signin/` | Public | Email + password → `access`, `refresh`. |
| POST | `signin-google/` | Public | Google `code` → `access`, `refresh`, `role`. |
| POST | `token/refresh/` | Public | Refresh → new access (+ rotated refresh). |
| POST | `token/verify/` | Public | Validate a token. |
| POST | `logout/` | Public | Blacklist a refresh token (`{"refresh": ...}`). |
| POST | `password-reset-mail/` | Public | Email a reset code. |
| POST | `otp-verify/` | Public | Check email + code. |
| POST | `password-reset/` | Public | Email + code + new password. |
| PUT | `password-change/` | Any user | Old + new password. |
| GET, PATCH | `info/` | Freelancer | Own profile (including sub-profiles). |
| GET, PATCH | `clients/info/` | Client | Own profile. |
| GET | `info/<username>/` | Any user | Another user's public profile. |

### Jobs (`/jobs/`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `` (root) | Public | Published jobs. Filters: `status`, `category`, `experience_level`, `min_budget`, `max_budget`, `skills`, `tags`, `search`. |
| GET | `<uuid>/` | Public | Published job detail. |
| GET | `categories-skills/` | Public | Categories with their skills. |
| GET | `dropdown/` | Client | Options for the job form. |
| POST | `create/` | Client | Create a job. |
| GET | `my-jobs/` | Client | Own jobs with filters. |
| GET, PATCH, DELETE | `my-jobs/<uuid>/` | Client | Own job. |

### Bidding (`/biding/`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET, POST | `proposals/` | Freelancer | Own proposals / submit a proposal (multipart, optional `attachments`). |
| GET, DELETE | `proposals/<uuid>/` | Freelancer | Own proposal. |
| GET | `contracts/` | Freelancer | Own contracts. |
| GET | `contracts/<uuid>/` | Freelancer | Contract detail. |
| GET | `client/proposals/<job_uuid>/` | Client | Proposals on own job. |
| PATCH | `client/proposals/update/<proposal_uuid>/` | Client | Change proposal `status` (accepting creates a contract). |
| GET | `client/contracts/` | Client | Own contracts. |
| GET | `client/contracts/stats/` | Client | Contract counts by status and period. |
| GET | `client/contracts/<uuid>/` | Client | Contract detail. |

### Work diary (`/work-diary/`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `client/milestones/stats/` | Client | Milestone statistics. |
| GET | `client/milestones/<contract_uuid>/` | Client | Milestone summary. |
| GET, POST | `client/milestones/<contract_uuid>/steps/` | Client | List / create steps. |
| POST | `client/milestones/<contract_uuid>/steps/swap/` | Client | Body `{"a": n, "b": m}` swaps step numbers. |
| PATCH | `client/milestones/<contract_uuid>/steps/<step_uuid>/` | Client | Edit step / set `in_review`, `accepted`, `rejected`. |
| GET | `milestones/<contract_uuid>/` | Freelancer | Milestone summary. |
| GET | `milestones/<contract_uuid>/steps/` | Freelancer | List steps. |
| PATCH | `milestones/<contract_uuid>/steps/<step_uuid>/` | Freelancer | Upload `code_zip` and/or `message` (multipart). |

### Payments (`/payments/`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `job/` | Job owner | Body `{"job_id": "<uuid>"}`. Returns `{status_code, message, payment_url}`. |
| GET | `callback/` | Public | Paystation return URL. Query: `status`, `invoice_number`, `trx_id`, `message`. Redirects (301) to the frontend payment page. |
| GET | `status/<invoice_number>/` | Any user | `{"data": {"status": "<trx_status>"}}`; 404 if unknown. |

### Chat (`/chat/`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `conversations/` | Any user | Own conversations. |
| GET | `conversations/<conversation_id>/` | Authenticated | Conversation detail. |
| PUT, PATCH | `conversations/<conversation_id>/status/` | Authenticated | Change conversation status. |
| GET, POST | `conversations/<conversation_id>/messages/` | Authenticated | List / send messages. |
| POST | `conversations/<conversation_id>/messages/<int:message_id>/read/` | Authenticated | Mark one message read. |
| POST | `conversations/<conversation_id>/messages/read-all/` | Authenticated | Mark all read. |

`conversation_id` is the 32-character `Conversation.conversation_id`, not the integer
primary key.

### Notifications (`/notifications/`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `` (root) | Any user | Own notifications (paginated). |
| GET | `stats/` | Any user | `total`, `unread`, `read`, `by_type`. |
| PATCH | `read/<int:pk>/` | Owner | Mark read. |
| POST | `read/all/` | Any user | Mark all read. |
| DELETE | `delete/<int:pk>/` | Owner | Delete one. |
| DELETE | `delete/all/` | Any user | Delete all. |

### Meetings (`/meetings/`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `create/` | Client | Create a meeting for an own active contract. |
| GET | `my/` | Any user | Meetings of the user's contracts. |
| GET | `history/` | Any user | Meetings the user has joined. |
| GET | `list/<contract_id>/` | Any user | Meetings of a contract. |
| GET | `freelancer-list/` | Client | Freelancers on active contracts. |
| GET | `join/<room_name>/` | Contract parties | Returns `{room_name, token, domain}`; `domain` is `JITSI_DOMAIN`. |

### Images (`/images/`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `upload/` | Any user | Multipart `image`; returns `{id, image}` (URL). |
| DELETE | `delete/<uuid>/` | Uploader | Delete own image. |

## WebSocket API

Connect with a valid access token in the query string (or an `Authorization: Bearer`
header for non-browser clients):

```
wss://<backend-host>/ws/notification/<notification_id>/?token=<access token>
wss://<backend-host>/ws/chat/<conversation_id>/?token=<access token>
```

When a connection is refused, the server accepts it, sends
`{"success": false, "status_code": <code>, "message": "..."}` and closes with an
application close code:

| HTTP meaning | Close code |
|---|---|
| 400 Bad Request | 3000 |
| 401 Unauthorized | 3001 |
| 403 Forbidden | 3002 |
| 404 Not Found | 3003 |
| 409 Conflict | 3004 |
| 413 Payload Too Large | 3005 |
| 429 Too Many Requests | 3007 |
| 500 Internal Error | 3008 |
| 503 Service Unavailable | 3009 |

Successful server messages are wrapped as `{"success": true, "status_code": 200, "data": {...}}`
unless noted.

### Notifications — `ws/notification/<notification_id>/`

`notification_id` is the value returned as `notification_id` by the profile endpoint; it
must belong to the authenticated user.

| Direction | Payload | Notes |
|---|---|---|
| server → client | `data: {message, data: {count, page, page_size, total_pages, results: [...]}}` | Sent on connect and in reply to `get_notifications`. |
| server → client | `{success, status_code, message, data: {count, page, page_size, total_pages, results}}` | Pushed (unwrapped) when a new notification is created; always page 1, size 10. |
| client → server | `{"action": "ping"}` | Replies with `data: {"message": "pong"}`. |
| client → server | `{"action": "get_notifications", "page": 1, "page_size": 10}` | Returns that page. |

### Chat — `ws/chat/<conversation_id>/`

Only the conversation's client or freelancer can connect, and only while the conversation
is `active`. On connect the server sends a `conversation_info` message and the recent
messages, then marks existing messages as read.

| Direction | Payload | Notes |
|---|---|---|
| client → server | `{"type": "message", "text": "..."}` | 1–1000 characters. The server broadcasts the latest 50 messages to all participants. |
| client → server | `{"type": "typing", "is_typing": true}` | Broadcast as `typing_indicator`. |
| client → server | `{"type": "read_message", "message_id": 123}` | Marks the message read and broadcasts the updated list. |
| server → client | `data: {"type": "message", "data": [message, ...]}` | `message` = `{id, text, timestamp, is_read, sender_type, sender_name, seen_list}`. |
| server → client | `data: {"type": "typing_indicator", "user_type", "user_name", "is_typing"}` | |
| server → client | `{"type": "conversation_status", "status", "updated_by"}` | Unwrapped. |

## Admin API

Base path `/admin-api/`. Every resource is a DRF router `ModelViewSet` supporting
`GET` (list), `POST`, `GET <id>/`, `PUT`/`PATCH <id>/`, `DELETE <id>/`, plus
`GET <id>/history/` (django-simple-history records). Payment resources are read-only.

Access: authenticated **staff** user (`is_staff=True`) with the Django model permission for
the action (`view_`, `add_`, `change_`, `delete_`). Superusers have all permissions.

| Path | Model |
|---|---|
| `accounts/users/` | `accounts.User` |
| `jobs/jobs/`, `jobs/categories/`, `jobs/skills/`, `jobs/attachments/` | `jobs.*` |
| `biding/proposals/`, `biding/contracts/`, `biding/attachments/` | `biding.*` |
| `images/images/` | `images.Image` |
| `chat/conversations/`, `chat/messages/` | `chat.*` |
| `notifications/notifications/` | `notifications.Notification` |
| `work-diary/milestones/`, `work-diary/milestone-steps/` | `work_diary.*` |
| `payments/payment-requests/`, `payments/payment-transactions/`, `payments/payment-history/`, `payments/payment-callback-logs/` | `payments.*` (read-only) |

Filtering and search parameters per resource are defined in `custom_admin/filters/` and
the view `search_fields`; see the Swagger UI.
