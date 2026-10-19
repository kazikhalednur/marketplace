# Security

This document describes the security mechanisms that are implemented in the code and the
configuration that operators are responsible for. It does not claim the system is secure.
Because this repository is public, specific vulnerability findings are not published
here; report suspected vulnerabilities privately to the maintainers (see
[Reporting a vulnerability](#reporting-a-vulnerability)).

- [Authentication](#authentication)
- [Authorization](#authorization)
- [Input validation](#input-validation)
- [Transport and HTTP headers](#transport-and-http-headers)
- [Secrets management](#secrets-management)
- [Data protection](#data-protection)
- [Dependencies](#dependencies)
- [Operator hardening checklist](#operator-hardening-checklist)
- [Reporting a vulnerability](#reporting-a-vulnerability)

## Authentication

Implemented (verified in code):

- **JWT** via `djangorestframework-simplejwt` for REST and WebSocket requests. Access token
  lifetime: 5 minutes (base settings) or 30 days (`local`, `staging`). Refresh tokens
  rotate on use and the previous refresh token is blacklisted
  (`rest_framework_simplejwt.token_blacklist`).
- **Passwords** are hashed with Django's default hasher. Django's password validators are
  enabled except in `local` settings.
- **Email verification** is required before email/password sign-in; verification links
  are signed, time-limited tokens.
- **Google sign-in** verifies the Google ID token (`google.oauth2.id_token`) and matches both
  email and Google subject ID.
- **Password reset** uses a short, time-limited code sent by email.
- **Django admin** uses Django session authentication with CSRF protection.

Frontend token handling: tokens are stored in JavaScript-readable cookies and sent as a
`Bearer` header; the WebSocket token is sent as a query parameter (browsers cannot set
WebSocket headers). See [frontend.md](frontend.md#authentication-handling).

## Authorization

- Default DRF permission is `IsAuthenticated`; public endpoints opt out explicitly.
- Role checks (`IsClient`, `IsFreelancer`) compare `user.role`.
- Object-level access is implemented by filtering querysets to the requesting user's own
  objects (jobs, proposals, contracts, milestones, notifications, images).
- WebSocket consumers verify the user owns the notification channel or is a participant in
  the conversation.
- The admin API requires `is_staff` **and** Django model permissions for each action.
- Frontend route guards are cosmetic; the backend is the enforcement point.

## Input validation

- DRF serializers validate request bodies (types, lengths, business rules described in
  [features.md](features.md)).
- Job attachment files are limited to 2 MB; proposal attachments must be images; chat
  messages are limited to 1000 characters.
- Nginx limits request bodies to 100 MB globally and 1 GB on the MinIO API port.
- The ORM is used for all database access (no raw SQL found).

## Transport and HTTP headers

Staging Nginx (`nginx/nginx.conf`, `nginx/templates/staging/`):

- TLS 1.2/1.3 with ECDHE-GCM ciphers; HTTP on port 80 redirects to HTTPS.
- `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options:
  SAMEORIGIN`, `Referrer-Policy` (frontend), `server_tokens off`.

Django: `SecurityMiddleware`, `XFrameOptionsMiddleware`, CSRF middleware and
`django-cors-headers` (origins from `CORS_ALLOWED_ORIGINS`). The `production` settings
module additionally enables `SECURE_SSL_REDIRECT`, secure cookies and HSTS; the `staging`
module does not.

## Secrets management

- Staging secrets are committed **only in GPG-encrypted form** (`*.gpg`) and decrypted by
  Jenkins at deploy time using Jenkins-managed credentials.
- Decrypted files (`.env`, `google_credentials.json`, TLS key, MinIO license) are
  git-ignored. `ssl/.gitignore` ignores everything except encrypted files.
- `.env.example` files must contain placeholders only.
- See [configuration.md](configuration.md#secret-files-and-gpg-encryption) for the
  procedure.

If a secret is ever committed in plain text, treat it as compromised: rotate it at the
provider. Removing it in a later commit does not remove it from Git history.

## Data protection

- Personal data stored: names, email, phone, student ID, profile details, chat messages,
  payment metadata (transaction ID, payer mobile number, payment method).
- Payment card data is not handled by this system; payment happens on the Paystation page.
- Uploaded files are stored in MinIO; access depends on bucket policy and django-storages
  URL settings (see [configuration.md](configuration.md#object-storage-minio--s3)).
- Most models keep a full change history (django-simple-history), including personal
  fields. Deleting a record does not delete its history rows.
- No data-retention or account-deletion workflow exists.

## Dependencies

- Python dependencies are pinned in `server/requirements/base.txt` except
  `django-storages[s3]`, `gunicorn` and `uvicorn[standard]`.
- JavaScript dependencies use caret ranges in `client/package.json`, locked by
  `package-lock.json`.
- The MinIO image uses the `latest` tag.
- No automated dependency or vulnerability scanning is configured.

## Operator hardening checklist

Recommendations for any internet-facing deployment, not current implementation:

- Run with `DEBUG=False` and a dedicated settings module with HTTPS-only cookies and HSTS.
- Configure DRF throttling for authentication and password-reset endpoints.
- Do not expose MailCatcher, the MinIO console or other admin interfaces publicly;
  restrict them by firewall, VPN or authentication.
- Keep access tokens short-lived and implement token refresh and server-side logout in the
  frontend.
- Avoid logging full request URLs where they may contain tokens, or redact them.
- Review the object-level permission of every endpoint when adding or changing views.
- Enable dependency scanning (for example GitHub Dependabot) and pin image tags.
- Automate off-host database and object-storage backups.

## Reporting a vulnerability

Do not open a public issue for security problems. Contact the repository maintainers
privately. (A dedicated security contact has not been defined; **requires project-owner
confirmation**.)
