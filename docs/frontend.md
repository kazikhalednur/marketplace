# Frontend (Next.js) Guide

The web client lives in [`client/`](../client). It is a Next.js 16 App Router project
written in TypeScript with React 19, Tailwind CSS 4, shadcn/ui-style components and
Redux Toolkit / RTK Query. The `package.json` name is `defense-client`.

- [Layout](#layout)
- [Routes](#routes)
- [State and data fetching](#state-and-data-fetching)
- [Authentication handling](#authentication-handling)
- [WebSockets](#websockets)
- [Environment variables](#environment-variables)
- [Known frontend/backend mismatches](#known-frontendbackend-mismatches)
- [Where to make common changes](#where-to-make-common-changes)

## Layout

```
client/
├── next.config.ts          # output: 'standalone'; next/image remote patterns
├── compose/{local,staging} # Dockerfiles, env examples, staging .env.gpg, pipeline.groovy
└── src/
    ├── app/                # routes (App Router)
    ├── components/         # UI (components/ui), chat, navbar, profile, payment, WebSocket providers
    ├── features/           # RTK Query APIs (features/api), Redux slices (userSlice, jobs filter)
    ├── hooks/              # useAuth, useNotifications, useProfile, useWebSocketStatus, ...
    ├── lib/                # constants, Google OAuth helpers, WebSocket URL builder, app URL
    ├── services/           # WebSocket clients (chat, messages, notifications), network status
    ├── store/              # Redux store and Provider
    ├── types/              # shared TypeScript types
    ├── utils/              # auth token cookies, formatting, badges, logger
    └── proxy.ts            # Next.js proxy (formerly middleware) – currently a no-op
```

Several folders contain their own `README.md` files written during development. Treat
this document as the reference; those files have not been verified line by line.

## Routes

| Path | File | Who | Purpose |
|---|---|---|---|
| `/` | `app/page.tsx` | Public | Landing page; redirects signed-in users to `/dashboard`. |
| `/login` | `app/(auth)/login/page.tsx` | Public | Email/password and Google sign-in. |
| `/register` | `app/(auth)/register/` | Public | Choose "Freelancer" (`StudentForm`) or "Client" (`EmployerForm`). |
| `/google-login` | `app/(auth)/google-login/page.tsx` | Public | Google OAuth redirect target; completes sign-in or sign-up. |
| `/reset-password` | `app/(auth)/reset-password/` | Public | Three steps: request email, verify code, set new password. |
| `/email-verified/[uid]/[token]` | `app/(root)/email-verified/...` | Public | Target of the verification email link; calls the verify endpoint. |
| `/dashboard` | `app/(root)/dashboard/` | Public (actions need sign-in) | Job board with filters, search, pagination; job detail modal (freelancers apply, clients view bids). |
| `/my-jobs` | `app/(root)/my-jobs/page.tsx` | Client | Client's own jobs; create, edit, delete, pay. |
| `/my-bids` | `app/(root)/my-bids/page.tsx` | Freelancer | Freelancer's proposals. |
| `/contract` | `app/(root)/contract/page.tsx` | Client, freelancer | Contract list. |
| `/contract/[id]` | `app/(root)/contract/[id]/page.tsx` | Client, freelancer | Contract detail: milestones, submissions, meetings. |
| `/manage-work` | `app/(root)/manage-work/page.tsx` | Client | Work overview and stats. |
| `/messages`, `/chat` | `app/(root)/messages/`, `app/(root)/chat/` | Signed in | Conversations and real-time chat. |
| `/meetings` | `app/(root)/meetings/page.tsx` | Signed in | Meeting list; clients schedule meetings. |
| `/meeting/[room_name]` | `app/meeting/[room_name]/page.tsx` | Contract parties | Embedded Jitsi meeting. |
| `/payments/[invoice_id]` | `app/(root)/payments/[invoice_id]/page.tsx` | Client | Payment result page (Paystation callback redirects here). |
| `/profile`, `/profile/[username]` | `app/(root)/profile/` | Signed in | Own and other users' profiles. |
| `/admin/*` | `app/admin/` | Admin role | Admin UI over `/admin-api/`. Users, jobs, bids, contracts and milestones pages call the API; `reports` and `settings` show static placeholder content. |
| `/unauthorized` | `app/unauthorized/` | – | Access-denied page. |

Role checks for pages are done inside the page components (for example
`user?.role !== "client"` in `my-jobs`). The admin layout checks `user.role === "admin"`
only in non-development builds; in `next dev` the admin pages render for everyone and the
navbar shows an "Admin Panel (Temp)" link. The backend still enforces staff permissions on
every `/admin-api/` call.

## State and data fetching

The Redux store (`src/store/store.ts`) registers these RTK Query APIs:

| API slice | File | Covers |
|---|---|---|
| `apiSlice` | `features/api/apiSlice.ts` | Auth, profile, proposals, contracts, milestones, conversations, images. `freelancerContractsApi.ts` injects endpoints into it. |
| `jobsApi` | `features/api/jobsApi.ts` | Job board, client jobs, dropdowns, applying to jobs. |
| `notificationsApi` | `features/api/notificationsApi.ts` | Notification list/read/delete. |
| `meetingsApi` | `features/api/meetingsApi.ts` | Meetings create/list/join. |
| `paymentsApi` | `features/api/paymentsApi.ts` | Job payment initiation and status. |
| `adminApi` | `features/api/adminApi.ts` | `/admin-api/` resources. |

Plain slices: `features/userSlice.ts` (current user) and
`features/jobs/jobsFilterSlice.ts` (job board filters).

Each API uses `fetchBaseQuery` with `baseUrl: process.env.NEXT_PUBLIC_API_URL` and adds
`Authorization: Bearer <accessToken cookie>` in `prepareHeaders`.

## Authentication handling

- **Sign-in** stores tokens with `utils/authTokens.ts#setAuthTokens`: cookies
  `accessToken` and `refreshToken`, path `/`, expiring in 7 days (30 with "remember me").
  They are ordinary JavaScript-set cookies, so they are not `HttpOnly`.
- **Current user**: `hooks/useAuth.tsx` loads `accounts/info/` (freelancer) or
  `accounts/clients/info/` (client) and stores the result in `userSlice`.
- **Sign-out** (`useAuth().logout`) clears the Redux user and deletes the cookies. It
  does not call the backend `accounts/logout/` endpoint, so the refresh token is not
  blacklisted server-side.
- **Token refresh**: the frontend never calls `accounts/token/refresh/`. When the access
  token expires, API calls fail with 401 until the user signs in again. Staging and local
  settings use a 30-day access token lifetime; the base setting is 5 minutes.
- **Google OAuth** (`lib/googleOAuth.ts`): builds the Google authorization URL, stores the
  flow (`login`, `signup-freelancer`, `signup-client`) and a `state` value in
  `sessionStorage`, and on `/google-login` posts the returned `code` to the matching
  backend endpoint. Client sign-up with Google asks for a student ID first.
- **Route protection**: `src/proxy.ts` matches `/dashboard`, `/admin` and others but
  returns `NextResponse.next()` without checks. Protection is client-side only.

## WebSockets

| File | Purpose |
|---|---|
| `lib/websocketUrl.ts` | Builds `ws(s)://…/ws/notification/<id>/?token=…` and `…/ws/chat/<room>/?token=…` from `NEXT_PUBLIC_WEBSOCKET_URL` (or derives it from `NEXT_PUBLIC_API_URL`). |
| `services/webSocketManager.ts` | Generic client with reconnection and status tracking. |
| `services/notificationWebSocket.ts`, `components/NotificationWebSocketProvider.tsx` | Notification stream; requires the user's `notification_id` from the profile endpoint. |
| `services/chatWebSocket.ts`, `services/messageWebSocket.ts`, `components/ChatWebSocketProvider.tsx`, `components/MessageWebSocketProvider.tsx` | Chat. |
| `services/networkStatus.ts`, `hooks/useNetworkStatus.ts` | Browser online/offline tracking. |

Message formats are documented in [api.md](api.md#websocket-api).

## Environment variables

All are `NEXT_PUBLIC_*`, so they are **inlined at build time**. For the staging image they
come from `client/compose/staging/.env` (decrypted from `.env.gpg` by Jenkins and copied to
`.env.production` during `npm run build`). See [configuration.md](configuration.md#frontend-client).

## Known frontend/backend mismatches

Verified by comparing `features/api/*.ts` with the Django URL configuration:

- `apiSlice.ts` and `freelancerContractsApi.ts` call
  `work-diary/milestones/<contract>/steps/<step>/submissions/` and
  `work-diary/client/milestones/<contract>/steps/<step>/submissions/<id>/update/`. These
  routes do not exist in `server/src/work_diary/urls.py`. The backend accepts a single
  `code_zip` file on the step itself (`PATCH work-diary/milestones/<contract>/steps/<step>/`).
- `services/profileService.ts` calls `/api/accounts/info/<username>/` and
  `/api/users/<username>/profile`; the backend has no `/api/` prefix for these routes.
  This service is only used by `components/profile/ProfileUrlGenerator.tsx`.
- The contract page shows milestone states such as `submitted`, which the backend never
  sets through the API (see [features.md](features.md#milestones-work-diary)).

## Where to make common changes

| Change | Where |
|---|---|
| New backend endpoint call | Add an endpoint to the relevant RTK Query slice in `features/api/`. |
| New page | `src/app/(root)/<route>/page.tsx` (signed-in area) or `src/app/(auth)/` (public auth pages). |
| Navigation links | `components/navbar/Navbar.tsx`, `components/navbar/MobileSidebar.tsx`. |
| Fixed option lists (tags, statuses, experience levels) | `lib/constants.ts`. Keep in sync with Django model choices. |
| Contact email | `NEXT_PUBLIC_CONTACT_EMAIL` (`lib/constants.ts#CONTACT_EMAIL`). |
| Allowed remote image hosts | `next.config.ts` (`images.remotePatterns`). It currently allows any HTTP/HTTPS host. |
