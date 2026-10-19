# Troubleshooting and FAQ

Problems developers, operators and users are likely to meet, with diagnostic steps. Causes
are marked "likely" when they are inferred from the code rather than observed.

- [Setup and start-up](#setup-and-start-up)
- [Authentication and accounts](#authentication-and-accounts)
- [Files and storage](#files-and-storage)
- [Real-time features](#real-time-features)
- [Payments](#payments)
- [Meetings](#meetings)
- [Deployment (staging)](#deployment-staging)
- [FAQ](#faq)

## Setup and start-up

### `network local-public declared as external, but could not be found`
- **Cause**: the Compose network is external and must exist first.
- **Fix**: `docker network create local-public`.

### Django exits with `Couldn't read SERVER_TYPE...` or `UndefinedValueError: X not found`
- **Cause**: a required environment variable is missing (`python-decouple` has no default
  for most settings).
- **Diagnose**: `docker compose logs django`; compare the env file with
  [configuration.md](configuration.md#backend-django). `SECRET_KEY` is missing from the
  local example and must be added.

### Django cannot connect to the database
- **Diagnose**: `docker compose ps db` (health), `docker compose logs db`.
- **Likely causes**: `DB_*` values differ from `POSTGRES_*`; `DB_HOST` is not `db`;
  the database volume was initialised earlier with different credentials (Postgres only
  applies `POSTGRES_*` on first initialisation).

### Uploads fail / `EndpointConnectionError` / `NoSuchBucket`
- **Likely causes**: `MINIO_ENDPOINT_URL` points at a host that does not resolve inside
  Compose (use `http://minio:9000` locally); the bucket named in `MINIO_BUCKET_NAME` does
  not exist; wrong access keys.
- **Diagnose**: `docker compose logs django`; open the MinIO console
  (local <http://localhost:9001>) and check the bucket.

### MinIO container exits immediately
- **Likely cause**: missing or invalid AIStor license file. Check `MINIO_LICENSE_PATH`
  (local default `./.data/minio.license`) and `docker compose logs minio`.

### `make <target>` fails with `.env: No such file or directory`
- **Cause**: `server/Makefile` includes `server/.env`. Create it (for example a copy of
  `server/compose/local/.env`).

### Frontend shows network errors or CORS errors
- **Diagnose**: browser dev tools → Network/Console.
- **Likely causes**: `NEXT_PUBLIC_API_URL` wrong (remember it is build-time for staging);
  frontend origin missing from `CORS_ALLOWED_ORIGINS`; API host missing from
  `ALLOWED_HOSTS` (Django returns 400 `DisallowedHost`).

## Authentication and accounts

### Freelancer sign-up says "Try with your varsity mail address"
- **Cause**: the email domain is not in the active Accepted Domains list.
- **Fix**: add the domain in Django admin → Accounts → Accepted Domains.

### No verification or reset email arrives
- **Diagnose**: check the Celery worker (`docker compose logs celeryworker`), Redis health,
  and MailCatcher (local <http://localhost:1080>) — in local and staging, mail goes to
  MailCatcher unless SMTP is configured otherwise.
- **Likely causes**: worker not running; wrong `EMAIL_*` settings; wrong
  `CELERY_BROKER_URL`.

### Verification link says it has expired
- **Cause**: the default link lifetime is 120 seconds (`Settings.email_verify_timeout`).
- **Fix (user)**: use the resend option shown on the page (allowed once).
- **Fix (operator)**: increase the timeout in Django admin → Settings.

### Verification link points to `localhost`
- **Cause**: `Settings.frontend_url` still has its default. Update it in Django admin.

### "Email is not verified" at sign-in
- The user has not completed email verification. An admin can set `email_verified` and
  `is_active` in Django admin if appropriate.

### Users are suddenly signed out / every request returns 401
- **Likely cause**: the access token expired; the frontend does not refresh tokens. Users
  must sign in again. Check `ACCESS_TOKEN_LIFETIME` for the environment
  ([features.md](features.md#sign-in-sign-out-and-password-reset)).

### Google sign-in fails with "Invalid Google code or credentials"
- **Likely causes**: `server/google_credentials.json` missing (Docker may have created an
  empty directory with that name); the first `redirect_uris` entry differs from
  `NEXT_PUBLIC_GOOGLE_REDIRECT_URI`; the redirect URI is not registered in Google Cloud;
  the code was already used (codes are single-use).
- **Diagnose**: the error `details` field contains the underlying message.

### Google sign-in says "Invalid User"
- The Google account has not been used to sign up, or the account was created with email
  and password (Google sign-in requires the stored Google ID).

## Files and storage

### Images or attachments do not load in the browser
- **Likely causes**: `MINIO_CUSTOM_DOMAIN` is not reachable from the browser; mixed content
  (HTTP file URLs on an HTTPS page — check `MINIO_USE_SSL`); bucket policy denies anonymous
  reads.

### Upload rejected with "File too large"
- Job attachments are limited to 2 MB; Nginx limits other uploads to 100 MB (1 GB on the
  MinIO API port).

## Real-time features

### Notifications or chat do not update live
- **Diagnose**: browser dev tools → Network → WS. Check the close code:

  | Close code | Meaning |
  |---|---|
  | 3000 | Bad request (malformed message; on the notification socket also a wrong or foreign notification ID) |
  | 3001 | Not authenticated (missing/expired token) |
  | 3003 | Chat: conversation not found, not active, or user not a participant / has no profile |
  | 3008 | Server error |

- **Likely causes**: expired access token; `NEXT_PUBLIC_WEBSOCKET_URL` wrong (`ws://` vs
  `wss://`); Redis down (`docker compose logs redis`); the proxy not forwarding `Upgrade`
  headers (staging Nginx does).
- A user whose `WebSocketID` has no `notification_id` cannot connect to notifications.

### "Conversation not found" in chat
- Conversations are created when a contract is created. Only `active` conversations accept
  connections; check the status in Django admin.

## Payments

### "Payment gateway credentials are invalid for the configured environment"
- **Cause**: Paystation returned code 1001. Sandbox credentials only work with
  `PAYSTATION_ENV=sandbox` and live credentials with `live`.

### Payment page never returns / callback fails
- **Likely causes**: `Settings.backend_url` is not a public HTTPS URL (Paystation redirects
  the browser to `<backend_url>/payments/callback/`); the invoice number in the callback is
  unknown (server error).
- **Diagnose**: Nginx `server_access.log` for `/payments/callback/`, django container logs,
  admin API `payments/payment-callback-logs/`.

### Payment succeeded but the job still shows "Payment method not verified"
- Expected with the current code: a successful payment does not change verification
  flags. An admin can set `is_payment_verified` on the client profile. See
  [known-issues.md](known-issues.md#payments).

## Meetings

### Jitsi shows an authentication error
- **Likely causes**: `JITSI_APP_SECRET`, `JITSI_ISSUER` or `JITSI_AUDIENCE` do not match the
  Jitsi configuration; the token (valid 1 hour) expired — rejoin from the Meetings page;
  `JITSI_DOMAIN` is wrong.

### "You are not authorized to join this meeting"
- Only the contract's client and freelancer can join its meetings.

## Deployment (staging)

### Nginx pipeline fails with "SERVER_NAME is not set"
- Define `SERVER_NAME` as a Jenkins environment variable (global or job level).

### `nginx -t` fails in the validation stage
- **Diagnose**: the stage prints the validation log. Typical causes: certificate files not
  decrypted (`ssl/server.crt`, `ssl/server.key`), template syntax error.

### A service did not redeploy after a push
- Jenkins only diffs the last commit on `main`. Stop the container
  (`docker stop <container>`) and re-run the job, or push a commit that touches the
  service folder. See [deployment.md](deployment.md#jenkins-pipeline).

### Server health check times out after deploy
- `docker logs staging-marketplace-server` — common causes are a failing migration (the
  start script runs `migrate`) or a missing environment variable.

### Containers are down after a host reboot
- django, celeryworker, client, db and redis have no restart policy. Re-run the Jenkins job
  or `docker compose -f compose.staging.yaml up -d`.

### Django admin or Swagger UI appear unstyled
- Likely missing static files in MinIO; run `collectstatic` (see
  [deployment.md](deployment.md#service-start-up)).

## FAQ

**Where is the API documentation?** Swagger UI at `/api/schema/swagger-ui/` on the
backend, plus [api.md](api.md).

**How do I change the frontend URL used in emails?** Django admin → Settings. It is stored
in the database, not in environment variables.

**How do I make someone an admin?** `createsuperuser`, or in Django admin set `is_staff`
(and permissions) on the user. The frontend admin pages also check `role == "admin"`.

**Can a user be both client and freelancer?** No. The role is fixed per account; use two
accounts with different emails.

**How do I reset local data?** Stop Compose and remove `./.data/postgres`,
`./.data/redis` and `./.data/minio` (destroys all local data), then start again.

**Where do escalations go?** Not defined in the repository; **requires project-owner
confirmation**.
