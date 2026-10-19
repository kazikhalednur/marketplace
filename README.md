# Marketplace

A freelance marketplace for university students. Students register as **freelancers**
with their university email; **clients** post jobs, review proposals and hire. Each
accepted proposal becomes a contract with milestones, real-time chat, video meetings
and optional online payment.

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Redux Toolkit / RTK Query |
| Backend | Django 6, Django REST Framework, SimpleJWT, Django Channels, Celery |
| Data | PostgreSQL 18, Redis 7.4, MinIO (AIStor, S3-compatible) |
| Integrations | Google OAuth, Paystation (payments), Jitsi Meet (video), SMTP |
| Delivery | Docker Compose, Nginx, Jenkins, GPG-encrypted secrets |

## Repository structure

```
client/      Next.js frontend
server/      Django backend (project root: server/src)
database/    PostgreSQL and Redis images, env examples, backup scripts
minio/       MinIO (AIStor) images and env examples
nginx/       Reverse proxy (staging), config templates
jitsi/       Vendored docker-jitsi-meet stack
ssl/         GPG-encrypted TLS certificate and key
docs/        Documentation
compose.yaml           Local development stack
compose.staging.yaml   Staging stack
Jenkinsfile            CI/CD entry point
```

## Quick start (local)

```bash
docker network create local-public
# copy each */compose/local/.env.example (and minio/local/.env.example) to .env and fill it in
docker compose up --build
docker compose exec django python manage.py createsuperuser
```

Then add an accepted email domain in Django admin. Open the frontend at
<http://localhost:3000>, the API at <http://localhost:8000> and outgoing email at
<http://localhost:1080>. The full procedure, including the extra values the example env
files do not cover, is in [docs/development.md](docs/development.md).

## Documentation

**Getting started and development**
- [Development guide](docs/development.md): setup, daily workflow, seed data, linting, testing
- [Configuration reference](docs/configuration.md): environment variables, database settings, secrets

**Architecture and technical reference**
- [Architecture](docs/architecture.md): components, request and real-time flows, signals, topology
- [Backend guide](docs/backend.md): Django apps, conventions, management commands
- [Frontend guide](docs/frontend.md): routes, state, auth handling, WebSockets
- [Features and business rules](docs/features.md)
- [API reference](docs/api.md): REST, WebSocket and admin API (plus Swagger at `/api/schema/swagger-ui/`)
- [Data model](docs/data-model.md)

**Operations**
- [Deployment and operations](docs/deployment.md): Jenkins pipeline, health checks, backups, rollback
- [Security](docs/security.md)
- [Troubleshooting and FAQ](docs/troubleshooting.md)
- [Known issues and gaps](docs/known-issues.md)

**Users**
- [User manual](docs/user-manual.md): for freelancers, clients and administrators

## Project status

The core marketplace flow (registration, jobs, proposals, contracts, milestones, chat,
notifications, meetings, payment initiation) is implemented. There are no automated tests,
and several features referenced in the UI (connects, escrow, payouts) are not implemented.
See [docs/known-issues.md](docs/known-issues.md).
