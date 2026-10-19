# Development Guide

How to run, change and check the system on a developer machine. Commands are derived
from `compose.yaml`, the Dockerfiles, `server/Makefile` and `client/package.json`. They
were **not executed** while writing this guide unless stated otherwise.

- [Prerequisites](#prerequisites)
- [First-time setup (Docker, recommended)](#first-time-setup-docker-recommended)
- [Daily workflow](#daily-workflow)
- [Running without Docker](#running-without-docker)
- [Seed data](#seed-data)
- [Linting and formatting](#linting-and-formatting)
- [Testing and quality](#testing-and-quality)
- [Building](#building)
- [Repository conventions](#repository-conventions)

## Prerequisites

- Docker Engine with Docker Compose v2 and BuildKit (the Dockerfiles use `RUN --mount`).
- An **AIStor (MinIO) license file**. The MinIO image is
  `quay.io/minio/aistor/minio:latest`, which requires a license (`MINIO_LICENSE`).
- Optional, for running outside Docker: Python 3.12, Node.js 24 (the Docker images use
  `node:24.8.0`), PostgreSQL client libraries (`libpq-dev`).
- Optional, for Google sign-in: a Google Cloud OAuth "web application" client.

## First-time setup (Docker, recommended)

`compose.yaml` runs django, celeryworker, client, minio, db, redis and mailcatcher.
It does not include Nginx; services are reached on their own ports.

1. **Create the external network** used by every service:

   ```bash
   docker network create local-public
   ```

2. **Create env files** from the examples and fill them in
   (reference: [configuration.md](configuration.md)):

   ```bash
   cp server/compose/local/.env.example            server/compose/local/.env
   cp client/compose/local/.env.example            client/compose/local/.env
   cp database/postgres/compose/local/.env.example database/postgres/compose/local/.env
   cp database/redis/compose/local/.env.example    database/redis/compose/local/.env
   cp minio/local/.env.example                     minio/local/.env
   ```

   Then, in `server/compose/local/.env`:
   - add `SECRET_KEY=<random string>` (it is missing from the example);
   - make `DB_NAME`, `DB_USER`, `DB_PASSWORD` match `POSTGRES_DB`, `POSTGRES_USER`,
     `POSTGRES_PASSWORD` in the Postgres env file;
   - set `MINIO_ENDPOINT_URL=http://minio:9000` (the example's host name `aistor-server`
     does not resolve inside Compose; `minio` or `local-aistor-server` do);
   - set `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` (for a quick start, the MinIO root
     credentials) and `MINIO_CUSTOM_DOMAIN=localhost:9000` so browser-facing file URLs work;
   - fill the `JITSI_*` and `PAYSTATION_*` values (placeholders are fine if you do not use
     meetings or payments, but the variables must exist).

3. **Provide the MinIO license** at `./.data/minio.license` (or set
   `MINIO_LICENSE_PATH`).

4. **Google credentials** (optional): place the OAuth client JSON at
   `server/google_credentials.json`. Its first `redirect_uris` entry must be
   `http://localhost:3000/google-login`. If the file does not exist, Docker creates an
   empty directory at that path; the server still starts, but Google sign-in fails.

5. **Start everything**:

   ```bash
   docker compose up --build
   ```

   The django container runs `migrate` and then `runserver 0.0.0.0:8000`. The Celery
   worker restarts automatically on Python file changes (`watchfiles`).

6. **Create the storage bucket** named in `MINIO_BUCKET_NAME` using the MinIO console at
   <http://localhost:9001>. Nothing in the repository creates it automatically.

7. **Create an admin user and accepted domains**:

   ```bash
   docker compose exec django python manage.py createsuperuser
   ```

   Then, at <http://localhost:8000/admin/>:
   - add at least one **Accepted Domain** (freelancer sign-up is rejected otherwise);
   - check **Settings** (frontend URL `http://localhost:3000`, backend URL
     `http://localhost:8000`, timeouts).

| Service | URL |
|---|---|
| Frontend | <http://localhost:3000> |
| API, Django admin | <http://localhost:8000>, <http://localhost:8000/admin/> |
| Swagger UI | <http://localhost:8000/api/schema/swagger-ui/> |
| Django Debug Toolbar | shown on server-rendered pages when `SERVER_TYPE=local` |
| MinIO API / console | <http://localhost:9000> / <http://localhost:9001> |
| MailCatcher (all outgoing email) | <http://localhost:1080> |
| PostgreSQL / Redis | `localhost:5432` / `localhost:6379` |

## Daily workflow

- **Backend code** (`server/src`) is bind-mounted; `runserver` reloads on change.
- **Frontend code** (`client/`) is bind-mounted and runs `next dev`.
- **Migrations** after model changes:

  ```bash
  docker compose exec django python manage.py makemigrations
  docker compose exec django python manage.py migrate
  ```

  `make migrate` (from `server/`) runs both. The Makefile starts with `include .env`, so
  every `make` target fails unless `server/.env` exists (it can be a copy of
  `server/compose/local/.env`).
- **Shell**: `docker compose exec django python manage.py shell`.
- **Logs**: `docker compose logs -f django celeryworker`.
- **Email**: open MailCatcher at <http://localhost:1080> to read verification and reset
  emails.

## Running without Docker

`server/Makefile` supports a virtualenv workflow. It `include`s `server/.env` and uses
`$(VENV)` (path to the virtualenv's `bin/`):

```bash
cd server
python3.12 -m venv .venv && .venv/bin/pip install -r requirements/local.txt
cp compose/local/.env.example .env   # then edit: VENV=.venv/bin, hosts = localhost, SERVER_TYPE=local, DEBUG=True, SECRET_KEY=...
make server                          # makemigrations, migrate, runserver
```

On Linux `make server` also runs `sudo systemctl start postgresql.service`. PostgreSQL,
Redis, MinIO and an SMTP server must be reachable at the configured hosts. Start the
Celery worker separately:

```bash
cd server/src && ../.venv/bin/celery -A config.celery worker -l INFO
```

Frontend:

```bash
cd client
npm ci
cp .env.example .env.local
npm run dev
```

## Seed data

```bash
docker compose exec django python manage.py load_seed_data
```

Loads `server/src/seed/*.json` inside a transaction: super admins, categories, skills,
users, profiles, jobs, proposals. Non-admin seed users get the password `password123`;
super admin credentials come from `seed/super_admins.json`. Use it only on an empty local
database; running it twice fails on the unique super-admin and category rows. Never run
it against a shared or public environment.

## Linting and formatting

Backend (configured in `server/pyproject.toml`, `server/.flake8`,
`server/.pre-commit-config.yaml`):

```bash
cd server
make lint            # isort . ; black . ; flake8   (uses $(VENV); needs server/.env)
pre-commit install   # optional: run isort, black, blacken-docs, flake8 on commit
```

flake8 excludes migrations and `src/config/settings/*`, ignores `F405`/`F811`, max line 88.

Frontend:

```bash
cd client
npm run lint         # runs "next lint"
```

`next lint` was removed in Next.js 16, which this project uses; this script may fail.
Running `npx eslint .` with the existing `eslint.config.mjs` is the likely replacement
(**not verified**).

## Testing and quality

**There are no automated tests.** Every app has a `tests.py` containing only the Django
template stub, and there is no frontend test framework. There is no CI test or lint stage:
the Jenkins pipeline only builds and deploys.

The configured test command is:

```bash
cd server
make test            # coverage run --source='.' src/manage.py test ; coverage html
```

`coverage` is not listed in any requirements file, so it must be installed separately.
Running the tests needs a reachable database (Django creates a test database).

When `manage.py test` runs, `TESTING=True` disables the debug toolbar.

Manual verification before deploying is therefore essential: sign-up and email
verification, job creation, proposal submission and acceptance, milestones, chat, and the
payment flow against the Paystation sandbox.

## Building

| Artifact | Command |
|---|---|
| Staging server image | `docker compose -f compose.staging.yaml build django` (requires `server/google_credentials.json` to exist because the Dockerfile copies it) |
| Staging client image | `docker compose -f compose.staging.yaml build client` (requires `client/compose/staging/.env`) |
| Frontend production build | `cd client && npm run build` (output: `.next/standalone`) |
| OpenAPI schema file | `docker compose exec django python manage.py spectacular --file schema.yml` |

## Repository conventions

- Commit messages in recent history follow Conventional Commits style
  (`fix(biding): …`, `chore(client): …`, `build(client): …`).
- The default branch is `main`; Jenkins deploys staging from `main` and also builds
  feature branches against `origin/main` (see [deployment.md](deployment.md)).
- Never commit decrypted secrets (`.env`, `google_credentials.json`, certificates,
  `private.gpg`). See [configuration.md](configuration.md#secret-files-and-gpg-encryption).
