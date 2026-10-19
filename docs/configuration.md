# Configuration

Configuration comes from four places:

1. **Environment files per service** (`.env`), read by Docker Compose `env_file:`.
2. **Compose interpolation variables**, read from the shell environment (or a `.env` file
   next to the compose file) when `docker compose` parses `compose.yaml` /
   `compose.staging.yaml`.
3. **The `base.Settings` database row**, edited in Django admin.
4. **Secret files**: `server/google_credentials.json`, TLS certificate and key, MinIO
   license.

No real secret values appear in this document. Committed `.env.example` files contain
placeholders only.

- [Where each env file lives](#where-each-env-file-lives)
- [Backend (Django)](#backend-django)
- [Frontend (client)](#frontend-client)
- [PostgreSQL](#postgresql)
- [Redis](#redis)
- [MinIO](#minio)
- [Nginx](#nginx)
- [Compose interpolation variables](#compose-interpolation-variables)
- [Jitsi](#jitsi)
- [Database-stored settings](#database-stored-settings)
- [Secret files and GPG encryption](#secret-files-and-gpg-encryption)

## Where each env file lives

| Service | Local (`compose.yaml`) | Staging (`compose.staging.yaml`) |
|---|---|---|
| Django + Celery | `server/compose/local/.env` (example: `.env.example`) | `server/compose/staging/.env` (decrypted from `.env.gpg`) |
| Client | `client/compose/local/.env` | `client/compose/staging/.env` (decrypted; baked into the image at build time) |
| PostgreSQL | `database/postgres/compose/local/.env` | `database/postgres/compose/staging/.env` |
| Redis | `database/redis/compose/local/.env` | `database/redis/compose/staging/.env` |
| MinIO | `minio/local/.env` | `minio/staging/.env` |
| Jitsi | – | `jitsi/.env` (decrypted from `jitsi/compose/staging/.env.gpg`) |

All `.env` files are git-ignored (root `.gitignore`: `.env`). Copy the matching
`.env.example` and fill in values for local development.

## Backend (Django)

Read with `python-decouple` in `server/src/config/settings/`. "Required" means there is no
default and Django will not start without it.

### Core

| Variable | Required | Sensitive | Description |
|---|---|---|---|
| `SERVER_TYPE` | Yes | No | `local`, `staging` or `production`; selects the settings module. Compose sets it explicitly. |
| `SECRET_KEY` | Yes | **Yes** | Django secret key (also signs JWTs and email-verification tokens). Missing from `server/compose/local/.env.example` — add it manually. |
| `DEBUG` | Yes | No | Boolean. Compose sets `DEBUG: true` for both local and staging, overriding the env file. |
| `ALLOWED_HOSTS` | Yes | No | Comma-separated host names. |
| `CORS_ALLOWED_ORIGINS` | Yes | No | Comma-separated origins allowed to call the API (frontend origin). Credentials allowed. |
| `CSRF_TRUSTED_ORIGINS` | Yes | No | Comma-separated origins for CSRF (Django admin forms). |

### Database

| Variable | Required | Sensitive | Description |
|---|---|---|---|
| `DB_ENGINE` | Yes | No | `django.db.backends.postgresql`. |
| `DB_NAME`, `DB_USER`, `DB_HOST`, `DB_PORT` | Yes | No | Connection details; `DB_HOST=db` inside Compose. |
| `DB_PASSWORD` | Yes | **Yes** | Must match `POSTGRES_PASSWORD` of the database container. |

### Redis, Celery and Channels

| Variable | Required | Sensitive | Description |
|---|---|---|---|
| `REDIS_HOST` | Yes | No | Host for the Channels layer (port is fixed at 6379 in `base.py`). |
| `CELERY_BROKER_URL` | Yes | Maybe (if it contains a password) | e.g. `redis://redis:6379/0`. |
| `CELERY_RESULT_BACKEND` | Yes | Maybe | e.g. `redis://redis:6379/1`. |
| `REDIS_PORT` | No | No | Only used for interpolation inside the example env file. |

The example uses `${REDIS_HOST}`-style references inside the `.env` file. Docker Compose
expands these in `env_file` values, but other tools may not.

### Email

| Variable | Required | Sensitive | Description |
|---|---|---|---|
| `EMAIL_BACKEND` | Yes | No | e.g. `django.core.mail.backends.smtp.EmailBackend`. |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USE_TLS` | Yes | No | SMTP server (`mailcatcher`, `1025`, `False` locally). |
| `EMAIL_HOST_USER` | Yes (may be empty) | No | SMTP user. |
| `EMAIL_HOST_PASSWORD` | Yes (may be empty) | **Yes** | SMTP password. |
| `DEFAULT_FROM_EMAIL` | Yes | No | Sender address; the display name is "Marketplace". |
| `SUPPORT_EMAIL` | Yes | No | Read into settings; not referenced elsewhere in the code. |

### Object storage (MinIO / S3)

`server/src/config/settings/storage.py`. All are required.

| Variable | Sensitive | Description |
|---|---|---|
| `MINIO_ENDPOINT_URL` | No | S3 API URL reachable from the Django container (e.g. `http://minio:9000` in Compose; the example's `aistor-server` host name does not match a Compose service name). |
| `MINIO_ACCESS_KEY` | **Yes** | Access key. |
| `MINIO_SECRET_KEY` | **Yes** | Secret key. |
| `MINIO_BUCKET_NAME` | No | Bucket for uploads (`static/` prefix for static files). |
| `MINIO_REGION_NAME` | No | e.g. `us-east-1`. |
| `MINIO_SIGNATURE_VERSION` | No | `s3v4`. |
| `MINIO_ADDRESSING_STYLE` | No | `path`. |
| `MINIO_USE_SSL` | No | Boolean; also selects `https:` vs `http:` for generated URLs. |
| `MINIO_VERIFY` | No | Boolean; TLS certificate verification. |
| `MINIO_CUSTOM_DOMAIN` | No | Public host (and port) used in file URLs returned to browsers, e.g. `<public-host>:8444` in staging. |

Uploaded files are stored with `file_overwrite=False`. Whether URLs are pre-signed depends
on django-storages defaults (`querystring_auth`); this is not configured explicitly.

### Paystation

| Variable | Required | Sensitive | Description |
|---|---|---|---|
| `PAYSTATION_MARCHANT_ID` | Yes | **Yes** | Merchant ID (spelling "MARCHANT" is as in code). |
| `PAYSTATION_PASSWORD` | Yes | **Yes** | Merchant password. |
| `PAYSTATION_ENV` | No | No | `live` or `sandbox`. Default `live` in base/production, `sandbox` in staging. Credentials must match the environment. |
| `PAYSTATION_REQUEST_TIMEOUT` | No | No | Seconds, default 30. |

### Jitsi

| Variable | Required | Sensitive | Description |
|---|---|---|---|
| `JITSI_DOMAIN` | Yes | No | Jitsi host name returned to the frontend with each meeting token. |
| `JITSI_APP_ID` | Yes | No | Read into settings (the token uses `JITSI_ISSUER` / `JITSI_AUDIENCE`). |
| `JITSI_APP_SECRET` | Yes | **Yes** | HS256 signing secret; must match Jitsi's `JWT_APP_SECRET`. |
| `JITSI_ISSUER` | Yes | No | JWT `iss`; must be accepted by Jitsi (`JWT_ACCEPTED_ISSUERS`). |
| `JITSI_AUDIENCE` | Yes | No | JWT `aud`; must be accepted by Jitsi (`JWT_ACCEPTED_AUDIENCES`). |
| `JITSI_XMPP_DOMAIN` | No | No | JWT `sub`; default `meet.jitsi`. |

### Other backend inputs

| Input | Description |
|---|---|
| `server/google_credentials.json` | Google OAuth "web" client JSON (`client_id`, `client_secret`, `redirect_uris`). The **first** `redirect_uris` entry must equal the frontend's `NEXT_PUBLIC_GOOGLE_REDIRECT_URI`. Mounted into the container (local and staging) and also copied into the staging image. **Sensitive.** |
| `UID`, `GID`, `VENV` in `server/compose/local/.env.example` | Used by `server/Makefile` (which does `include .env` from `server/`) for running outside Docker. `VENV` is the path to the virtualenv's `bin` directory. |

## Frontend (client)

Next.js inlines `NEXT_PUBLIC_*` variables **at build time**. Changing them requires a
rebuild of the staging image.

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Backend origin, e.g. `http://localhost:8000` or `https://<public-host>:8443`. |
| `NEXT_PUBLIC_WEBSOCKET_URL` | Recommended | WebSocket origin (`ws://…` / `wss://…`). Derived from `NEXT_PUBLIC_API_URL` when unset. |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | For Google sign-in | Google OAuth client ID (public). |
| `NEXT_PUBLIC_GOOGLE_REDIRECT_URI` | For Google sign-in | Must be `<frontend origin>/google-login` and registered in Google Cloud Console. Defaults to the current origin + `/google-login`. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | No | Contact address shown on the landing page and footer; contact links are hidden when empty. |
| `NEXT_PUBLIC_BASE_URL` | No | Present in the example files but not read by the code (share links use the browser's origin). |

## PostgreSQL

Official `postgres:18` image variables:

| Variable | Sensitive | Description |
|---|---|---|
| `POSTGRES_DB` | No | Database name (must equal `DB_NAME`). |
| `POSTGRES_USER` | No | Superuser name. The staging `backup` script refuses to run as `postgres`. |
| `POSTGRES_PASSWORD` | **Yes** | Password. |
| `POSTGRES_HOST`, `POSTGRES_PORT` | No | Used by the staging maintenance scripts (`backup`, `restore`). |

## Redis

`database/redis/compose/*/.env` contains `REDIS_PORT`. Redis runs without a password in the
local compose file. For staging, the content of the encrypted env file was not inspected.

## MinIO

| Variable | Sensitive | Description |
|---|---|---|
| `MINIO_ROOT_USER` | **Yes** | Admin user. |
| `MINIO_ROOT_PASSWORD` | **Yes** | Admin password. |
| `MINIO_LICENSE` | No | License file path inside the container (`/minio.license`, mounted). The image is AIStor, which requires a license file. |
| `MINIO_BROWSER_REDIRECT_URL` | No | Public console URL (staging: `https://<public-host>:8445`). Do not set `MINIO_SERVER_URL` to the public API URL in staging (comment in `minio/staging/.env.example`). |
| `MINIO_SERVER_URL` | No | Local only (`http://127.0.0.1:9000`). |
| `MINIO_OBJECT_NAMING` | No | `extended`; set on first run. |
| `MINIO_OPTS` | No | Extra server options. |

## Nginx

| Variable | Where it is set | Description |
|---|---|---|
| `SERVER_NAME` | Jenkins/host environment → `compose.staging.yaml` → container | Public host name. The official nginx image renders `nginx/templates/staging/*.conf.template` into `/etc/nginx/conf.d/` at startup, replacing `${SERVER_NAME}`. The nginx pipeline fails early if it is unset. |
| `TZ`, `ENVIRONMENT` | `compose.staging.yaml` | `Asia/Dhaka`, `staging`. |

TLS files are expected at `/etc/nginx/ssl/server.crt` and `/etc/nginx/ssl/server.key`
(the repository's `ssl/` directory, mounted read-only).

## Compose interpolation variables

| Variable | File | Default | Description |
|---|---|---|---|
| `SERVER_NAME` | `compose.staging.yaml` | none (empty) | See [Nginx](#nginx). |
| `MINIO_PATH` | `compose.yaml` | `./.data/minio` | MinIO data directory. |
| `MINIO_LICENSE_PATH` | `compose.yaml` | `./.data/minio.license` | MinIO license file. |
| `POSTGRES_PATH` | `compose.yaml` | `./.data/postgres` | PostgreSQL data directory. |
| `REDIS_PATH` | `compose.yaml` | `./.data/redis` | Redis AOF directory. |
| `POSTGRES_USER`, `POSTGRES_DB` | both | `postgres`, `marketplace_local` / `marketplace_staging_db` | Used only in the database health check command. |
| `HOME` | `compose.staging.yaml` | shell | MinIO data lives in `${HOME}/minio/data` on the staging host. |

## Jitsi

`jitsi/` is a vendored copy of the upstream docker-jitsi-meet project. Its configuration is
`jitsi/.env` (see `jitsi/env.example` and the upstream documentation). For token
authentication with this backend, the Jitsi side must enable JWT authentication with an app
secret, accepted issuers and accepted audiences that match `JITSI_APP_SECRET`,
`JITSI_ISSUER` and `JITSI_AUDIENCE`. The staging values live in the encrypted
`jitsi/compose/staging/.env.gpg` and were not inspected.

## Database-stored settings

`base.Settings` is a single row edited in **Django admin → Base → Settings** (it cannot be
added or deleted there). It is created automatically after `migrate`, with defaults suited
to local development. **Update it in every deployed environment.**

| Field | Default | Effect |
|---|---|---|
| Frontend URL | `http://localhost:3000` | Links in verification emails, redirect after payment, proposal `job_link`. |
| Backend URL | `http://localhost:8000` | Paystation callback URL (`<backend URL>/payments/callback/`). Must be publicly reachable. |
| OTP Timeout | 300 seconds | Password-reset code validity. |
| Email Verification Timeout | 120 seconds | Verification link validity. Consider increasing; users often open emails later than 2 minutes. |

## Secret files and GPG encryption

Secrets for staging are committed **encrypted** with GPG and decrypted by Jenkins at
deploy time:

| Encrypted file | Decrypted to |
|---|---|
| `server/compose/staging/.env.gpg` | `server/compose/staging/.env` |
| `server/google_credentials.json.gpg` | `server/google_credentials.json` |
| `client/compose/staging/.env.gpg` | `client/compose/staging/.env` |
| `database/postgres/compose/staging/.env.gpg` | `database/postgres/compose/staging/.env` |
| `database/redis/compose/staging/.env.gpg` | `database/redis/compose/staging/.env` |
| `minio/staging/.env.gpg`, `minio/staging/minio.license.gpg` | `.env`, `minio.license` |
| `jitsi/compose/staging/.env.gpg` | `jitsi/.env` |
| `ssl/server.crt.gpg`, `ssl/server.key.gpg` | `ssl/server.crt`, `ssl/server.key` (and copies in `jitsi/web/keys/`) |

The Jenkins credentials `gpg-private-key` (file) and `gpg-passphrase` (string) are used
for decryption. The deployment key pair is **not** in the repository: the root
`.gitignore` ignores `*.gpg` (except `.env.gpg`), so `public.gpg` and `private.gpg` exist
only in maintainers' working copies. Other encrypted files (for example
`server/google_credentials.json.gpg`) are tracked because they were added explicitly or are
re-included by a directory `.gitignore` (`ssl/.gitignore`). When adding a new encrypted
file outside these rules, use `git add -f`.

To change a staging secret:

```bash
# 1. Decrypt (requires the private key and passphrase)
gpg --decrypt server/compose/staging/.env.gpg > server/compose/staging/.env

# 2. Edit server/compose/staging/.env

# 3. Re-encrypt for the deployment key, using a throwaway keyring
#    (public.gpg = the deployment public key, obtained from a maintainer)
export GNUPGHOME=$(mktemp -d)
gpg --import public.gpg
gpg --encrypt --batch --yes --trust-model always \
    --recipient <deployment key fingerprint> \
    --output server/compose/staging/.env.gpg server/compose/staging/.env

# 4. Commit only the .gpg file; never commit the decrypted file
```

The deployment key fingerprint can be listed with `gpg --show-keys public.gpg`. These
commands were derived from the pipeline scripts and have not been executed as part of
writing this document.

Never commit `private.gpg` or any decrypted file.
