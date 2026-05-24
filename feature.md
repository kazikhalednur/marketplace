# Implemented Features

This document lists features reflected in the codebase (backend routes, apps, WebSockets, and frontend pages). It is organized by domain.

---

## Platform & operations

- **Health check** endpoint for uptime monitoring (`health_check/`).
- **OpenAPI schema** and **Swagger UI** for REST discovery (`api/schema/`, `api/schema/swagger-ui/`).
- **Django Admin** site (`admin/`).
- **Docker Compose** stacks for local/staging-style deployment across client, server, database (PostgreSQL, Redis), MinIO, Nginx, Mailcatcher, Jitsi-related assets.
- **Nginx** reverse proxy and TLS-oriented configs for staging.
- **Jenkins pipeline** for selective service builds/deployments (`Jenkinsfile`).
- **Mailcatcher** integration for local email testing (compose setup).
- **Debug toolbar** wired for local non-test runs (`SERVER_TYPE == local`).
- **Seed / demo data** loading via management commands and JSON fixtures (`base.management.commands.load_seed_data`, `seed/`).

---

## Accounts & authentication

- **JWT authentication**: access/refresh flow (`token/refresh/`, `token/verify/`, `signin/`, `logout/`).
- **Email + password** sign-in; **role-specific signup** for freelancers and clients (`signup/`, `clients/signup/`).
- **Google OAuth** sign-in and sign-up for both roles (`signin-google/`, `signup-google/`, `clients/signup-google/`).
- **Password reset** via email and **OTP verification** flow (`password-reset-mail/`, `otp-verify/`, `password-reset/`).
- **Password change** for authenticated users (`password-change/`).
- **Email verification** and **resend verification** links (`verify/email/.../`, `resend/email/.../`).
- **User profile / info** for current user and by username (`info/`, `info/<username>/`, `clients/info/`).
- **Accepted email domain** policy API for allowed signup domains (`accepted-domain/`).
- **Role-based access** patterns in API (client vs freelancer vs admin usage across apps).

**Frontend (auth & profile):** login, register (student/freelancer vs employer forms), password reset (request email, OTP, new password), email verification page, public profile by username, unauthorized page.

---

## Jobs marketplace

- **Public job listing** and **job detail** by id.
- **Category and skill** listing for filters and forms (`categories-skills/`).
- **Client job creation** and **client’s own jobs** list and detail (`create/`, `my-jobs/`, `my-jobs/<id>/`).
- **Dropdown / metadata** support for job forms (`dropdown/`).

**Frontend:** home/dashboard with job listing, filters, job create/edit modals, job detail modal, client “my jobs”.

---

## Bidding (proposals) & contracts

- **Freelancer**: create/list proposals; proposal detail (`proposals/`, `proposals/<id>/`).
- **Freelancer**: list and detail **contracts** (`contracts/`, `contracts/<contract_id>/`).
- **Client**: list proposals per job; update proposal status (`client/proposals/<job_id>/`, `client/proposals/update/<proposal_id>/`).
- **Client**: contract list, stats, and detail (`client/contracts/`, `client/contracts/stats/`, `client/contracts/<contract_id>/`).

**Frontend:** dashboard bids section, “my bids”, contract list and contract detail by id, manage work.

---

## Work diary & milestones

- **Milestone views** for both roles tied to a contract.
- **Client**: milestone stats; milestone detail; create/list/reorder milestone **steps**; step detail; step **swap** order (`client/milestones/...`).
- **Freelancer**: milestone detail; list steps; update a step (`milestones/.../steps/...`).

**Frontend:** “manage work” flow aligned with contract/milestone work (page under `(root)/manage-work/`).

---

## Payments

- **Initiate job-related payment** (`payments/job/`).
- **Payment gateway callback** handler (`payments/callback/`).
- **Payment status** by invoice number (`payments/status/<invoice_number>/`).

**Frontend:** payment/invoice view by `invoice_id` (`(root)/payments/[invoice_id]/`).

---

## Chat & messaging

- **Conversations** list and detail.
- **Conversation status** updates.
- **Messages** in a conversation (list/create via API design in `MessageListView`).
- **Read receipts**: mark one message read; mark all messages read in a conversation.

**Real-time:** WebSocket **Chat** consumer for live messaging.

**Frontend:** dedicated **chat** page and **messages** page (inbox-style).

---

## Notifications

- **List notifications** with filters/query params as implemented in views.
- **Notification statistics** (`stats/`).
- **Mark read** (single and all).
- **Delete** (single and all).

**Real-time:** WebSocket **Notification** consumer.

**Frontend:** admin notifications page; notifications surfaced in UI as implemented (e.g. header/bell where wired).

---

## Meetings (video)

- **Create** a meeting.
- **List freelancers** for scheduling context (`freelancer-list/`).
- **Meeting history** and **my meetings**.
- **Join** meeting with room name (Jitsi token/room flow in server).
- **Meetings for a contract** (`list/<contract_id>/`).

**Frontend:** meetings list page; **meeting room** page by `room_name` (`meeting/[room_name]/`).

---

## Images & file handling

- **Image upload** and **delete** by id (`images/upload/`, `images/delete/<id>/`).
- **S3-compatible storage** (MinIO) via Django storage settings for media/static in configured environments.

---

## Custom admin API (admin-api)

REST **ViewSets** (CRUD or read-only as implemented) for operations staff, including:

- **Users, OTPs, accepted domains, WebSocket IDs**
- **Jobs, categories, skills, job attachments**
- **Proposals, contracts, bidding attachments**
- **Images**
- **Conversations, messages**
- **Notifications**
- **Milestones, milestone steps**
- **Payment requests, transactions, history, callback logs** (noted as read-only where applicable in code)

---

## Admin UI (Next.js)

Pages under `admin/` for back-office style use:

- Dashboard home, **users**, **jobs**, **bids**, **contracts**, **milestones**, **messages**, **notifications**
- **Taxonomy** (categories/skills management)
- **Audit logs**, **reports**, **settings**

---

## Real-time & background processing

- **Django Channels** with **Redis** for WebSocket layer.
- **Celery** configuration for asynchronous tasks (workers/queues as defined in settings).
- **WebSocket auth** middleware for token-based connection security.

---

## API documentation & quality tooling

- **drf-spectacular**-driven schema and Swagger UI.
- **Pre-commit** / **lint & format** tooling in server (`black`, `isort`, `flake8`, etc. in project config).
- **Makefile** targets for tests, coverage, and local workflows on the server.

---

## Summary count (rough)

- **Backend URL modules:** `accounts`, `jobs`, `images`, `biding`, `notifications`, `chat`, `work_diary`, `payments`, `meeting`, `custom_admin`, plus `health_check`, `admin`, OpenAPI.
- **Primary frontend app routes:** ~20+ top-level pages including auth, dashboard, jobs, bids, contracts, chat, messages, meetings, payments, profile, admin suite, email verification, unauthorized, not-found.

---

*If you need this split into “MVP vs stretch” or mapped to report chapters, say which sections your institution requires.*
