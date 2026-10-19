# Backend (Django) Guide

The API server lives in [`server/`](../server). The Django project root (where
`manage.py` is) is `server/src/`.

- [Layout](#layout)
- [Settings modules](#settings-modules)
- [Django apps](#django-apps)
- [Conventions](#conventions)
- [Signals](#signals)
- [Management commands](#management-commands)
- [Where to make common changes](#where-to-make-common-changes)

## Layout

```
server/
├── Makefile                  # helper targets (server, test, lint, migrate)
├── pyproject.toml            # isort/black config
├── .flake8, .pre-commit-config.yaml
├── requirements/             # base.txt + local/stage/prod/ci
├── compose/
│   ├── local/                # Dockerfile, start scripts, .env.example
│   └── staging/              # Dockerfile, start scripts, .env.example, .env.gpg, pipeline.groovy
├── google_credentials.json.gpg
└── src/
    ├── manage.py
    ├── config/               # settings, URLs, ASGI/WSGI, Celery, WebSocket routing, JWT WS middleware
    ├── utils/                # response renderer, WebSocket base consumer, permissions, validators
    ├── seed/                 # JSON seed data used by `load_seed_data`
    └── <apps>/               # see below
```

## Settings modules

`config/settings/__init__.py` selects a module from the **`SERVER_TYPE`** environment
variable and raises an error if it is missing:

| `SERVER_TYPE` | Module | Differences from `base.py` |
|---|---|---|
| `local` | `local.py` | No password validators; local filesystem static storage; Swagger schema class; access token lifetime 30 days; Django Debug Toolbar (unless running tests). |
| `staging` | `staging.py` | `PAYSTATION_ENV` defaults to `sandbox`; Swagger schema class; access token lifetime 30 days. |
| `production` | `prod.py` | HTTPS-related settings (`SECURE_SSL_REDIRECT`, secure cookies, HSTS, `SECURE_PROXY_SSL_HEADER`). Not used by any compose file or pipeline in this repo. |

`base.py` imports the split settings files `celery.py`, `jitsi.py`, `rest_framework.py`,
`simple_jwt.py`, `spectacular.py` and `storage.py`. All environment variables are read
with `python-decouple`. See [configuration.md](configuration.md) for the full list.

## Django apps

| App | URL prefix | Responsibility | Key files |
|---|---|---|---|
| `base` | `/health_check/` | Singleton `Settings` model, health check, seed and settings commands. | `models.py`, `signals.py`, `management/commands/` |
| `accounts` | `/accounts/` | Users, roles, profiles, sign-up/sign-in (email and Google), email verification, password reset (OTP), accepted email domains, WebSocket IDs. | `models/`, `serializers/`, `views/`, `helpers.py`, `tokens.py`, `mails.py`, `tasks.py`, `permissions.py` |
| `jobs` | `/jobs/` | Jobs, categories, skills, job attachments; public job board and client job management. | `models/`, `filters.py`, `views/client/` |
| `biding` | `/biding/` | Proposals (bids), proposal attachments, contracts. | `models/`, `services.py`, `signals.py`, `views/{client,freelancer}/` |
| `work_diary` | `/work-diary/` | Milestones and milestone steps for a contract; file submissions (`code_zip`). | `models/milestone.py`, `signals.py`, `views/{client,freelancer}/` |
| `payments` | `/payments/` | Paystation job payments: history, request, transaction, callback log. | `utils.py` (`PaymentUtility`), `signals.py`, `views/` |
| `chat` | `/chat/`, `ws/chat/` | Conversations and messages between a client and a freelancer. | `models.py`, `consumers.py`, `views.py`, `signals.py` |
| `notifications` | `/notifications/`, `ws/notification/` | In-app notifications with WebSocket push. | `models.py`, `consumers.py`, `signals.py` |
| `meeting` | `/meetings/` | Jitsi meetings attached to contracts; JWT issuing; join history. | `models.py`, `views.py`, `jitsi.py` |
| `images` | `/images/` | Generic image upload/delete (e.g. avatars). | `models.py`, `views.py` |
| `custom_admin` | `/admin-api/` | REST admin API (DRF `ModelViewSet`s) used by the frontend admin pages. | `views/`, `serializers/`, `filters/`, `permissions.py`, `mixins.py` |

The app is named `biding` (single "d") throughout code and URLs.

## Conventions

### Response envelope

`REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"]` is `utils.helpers.JSONRenderer`, which wraps
every response. Views commonly return `utils.helpers.Response(status_code, message, data)`,
a helper that builds a DRF `Response` the renderer understands. Some views return a plain
DRF `Response`; the renderer still wraps those. Format details: [api.md](api.md#response-envelope).

### Models

- UUID primary keys are assigned in `save()` (`if not self.id: self.id = uuid4()`).
- Most models declare `history = HistoricalRecords()` (django-simple-history).
- Role-specific users are proxy models with their own managers that filter by `role`
  and force `role` in `save()`. Use `Client.objects` / `Freelancer.objects` when you need
  role-scoped queries.

### Permissions

- Default: `IsAuthenticated` (JWT).
- Role checks: `accounts.permissions.IsClient`, `IsFreelancer` (compare `user.role`).
- Admin API: `custom_admin.permissions.AdminPermission` = `is_staff` **and** Django model
  permissions (`view_`, `add_`, `change_`, `delete_`) for the model.
- WebSockets: async permission classes in `utils/permissions.py`, applied by
  `utils.websocket.BaseAuthConsumer`.
- Object ownership is enforced by filtering `get_queryset()` on the current user.

### Code style

`black` (line length 88), `isort` (black profile) and `flake8`, configured in
`pyproject.toml`, `.flake8` and `.pre-commit-config.yaml`. See
[development.md](development.md#linting-and-formatting).

## Signals

Signals are registered in each app's `apps.py` `ready()` method. Summary:

| Signal module | Trigger | Effect |
|---|---|---|
| `base/signals.py` | `post_migrate` | Ensures the `Settings` row with `pk=1` exists. |
| `accounts/signals.py` | `post_save` on `User`, `Freelancer`, `Client` (created) | Creates a `WebSocketID` with a random `notification_id`. |
| `accounts/signals.py` | `post_save` on `FreelancerProfile` | Creates a default `FreelancerSubProfile` if none exists. |
| `biding/signals.py` | `pre_save`/`post_save` on `Proposal` | When status changes to `accepted`, calls `biding.services.process_proposal_acceptance`. |
| `biding/signals.py` | `pre_save` on `Attachment` | Deletes the old local file when the file changes (uses `file.path`). |
| `work_diary/signals.py` | `post_save` on `Contract` (created) | Creates the contract's `Milestone`. |
| `work_diary/signals.py` | `pre_save`/`pre_delete` on `MilestoneStep` | Deletes replaced/removed `code_zip` files. |
| `work_diary/signals.py` | `post_save` on `MilestoneStep` | Recomputes `Milestone.number_of_steps` and status (`pending` / `active` / `completed`). |
| `chat/signals.py` | `post_save` on `Contract` (created) | Creates a `Conversation` for the client–freelancer pair if none exists. |
| `notifications/signals.py` | `post_save` on `Notification` (created) | Pushes the user's first page of notifications over WebSocket. |
| `payments/signals.py` | `post_save` on payment models | Creates `PaymentRequest` → `PaymentTransaction`; syncs statuses. |

Proposal acceptance is implemented twice: in `biding/services.py` (called by the signal)
and inline in `biding/serializers/client/proposal.py`. The serializer's `get_or_create`
finds the contract the signal already created, so only one contract is created per
proposal. Keep both in sync, or consolidate, when changing acceptance behaviour.

## Management commands

Run inside the container (`docker compose exec django python manage.py <command>`) or with
a local virtualenv from `server/src/`.

| Command | App | Purpose |
|---|---|---|
| `default_setting` | `base` | Ensures the `Settings` singleton exists (also done automatically after `migrate`). |
| `load_seed_data` | `base` | Loads `seed/*.json`: super admins, categories, skills, users, profiles, jobs, proposals. Seeded non-admin users get the password `password123`. Intended for empty development databases; it is not idempotent for super admins and categories. |
| `create_missing_sub_profiles [--dry-run]` | `accounts` | Creates a `FreelancerSubProfile` for each `FreelancerProfile` that has none. It does not create missing `FreelancerProfile` rows. |
| `create_websocket_id` | `accounts` | Creates a `WebSocketID` for users without one. The created rows have no `notification_id`, so those users still cannot connect to the notification WebSocket until one is set. |
| `create_contract [--all] [--dry-run]` | `biding` | Creates contracts for accepted proposals that have none. Its `--proposal-id` option is declared as an integer while proposal IDs are UUIDs, so only `--all` is usable. |
| `update_conversation_model [--dry-run] [--verbose]` | `chat` | One-off helper for the change that moved `Conversation` from a contract link to client/freelancer profile links. |

Read a command's source before running it against shared data.

## Where to make common changes

| Change | Where |
|---|---|
| Add an environment variable | `config/settings/*.py` (use `decouple.config`), both `compose/*/.env.example` files, [configuration.md](configuration.md). |
| New REST endpoint | App `views/` + `serializers/`, register in the app `urls.py`. Add `@extend_schema` for accurate OpenAPI output. |
| Change what happens on proposal acceptance | `biding/services.py` **and** `biding/serializers/client/proposal.py`. |
| Change job validation | `jobs/serializers/client/job.py`. |
| Change payment flow | `payments/utils.py`, `payments/signals.py`, `payments/views/`. |
| Change email content | `accounts/templates/accounts/emails/*.txt`, `accounts/mails.py`. |
| Change OTP/verification timeouts or frontend/backend URL | Django admin → **Settings** (database), not code. |
| Add an admin API resource | `custom_admin/views/`, `serializers/`, `filters/`, register in `custom_admin/urls.py`. |
| New WebSocket consumer | Subclass `utils.websocket.BaseAuthConsumer`, add a route in the app `routings.py` and include it in `config/routing.py`. |
