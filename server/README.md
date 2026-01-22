# Marketplace Server

A comprehensive Django-based marketplace platform that connects freelancers with clients. This platform provides job posting, bidding, real-time chat, notifications, payments, work diary tracking, and video meeting capabilities.

## 🚀 Features

### Core Functionality
- **User Management**: Separate user types (Freelancers, Clients, Arbitrators, Auditors) with custom authentication
- **Job Management**: Create, browse, and manage job postings with categories and skills
- **Bidding System**: Freelancers can submit proposals, clients can review and accept them
- **Contract Management**: Track contracts between clients and freelancers
- **Real-time Chat**: WebSocket-based messaging system for conversations
- **Notifications**: Real-time notification system via WebSocket
- **Payment Integration**: PayStation payment gateway integration
- **Work Diary**: Milestone and step tracking for project progress
- **Video Meetings**: Zoom SDK integration for virtual meetings
- **File Storage**: MinIO S3-compatible object storage for media files

### Technical Features
- **REST API**: Comprehensive RESTful API with DRF (Django REST Framework)
- **WebSocket Support**: Real-time communication using Django Channels
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation
- **Background Tasks**: Celery for asynchronous task processing
- **Email System**: Email verification and notifications
- **Authentication**: JWT-based authentication with refresh tokens
- **Google OAuth**: Sign in/up with Google integration
- **Database**: PostgreSQL with historical record tracking
- **Caching**: Redis for caching and WebSocket channel layers
- **Containerization**: Docker and Docker Compose for easy deployment

## 📋 Prerequisites

- **Docker** and **Docker Compose** (for containerized deployment)
- **Python 3.12+** (for local development)
- **PostgreSQL 17** (if running locally without Docker)
- **Redis 7.4** (if running locally without Docker)
- **MinIO** (S3-compatible storage server)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd server
```

### 2. Environment Configuration

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` and configure the following variables:

```bash
# User Configuration (for Docker)
UID=1000
GID=1000
VENV=/path/to/your/venv  # Only for local development

# Security & CORS
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Database Configuration
DB_ENGINE=django.db.backends.postgresql
DB_NAME=marketplace_db
DB_USER=postgres
DB_HOST=db  # Use 'localhost' for local development
DB_PORT=5432
POSTGRES_DB=${DB_NAME}
POSTGRES_USER=${DB_USER}

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=mailcatcher  # Use 'localhost' for local development
EMAIL_HOST_USER=
EMAIL_PORT=1025
EMAIL_USE_TLS=False
DEFAULT_FROM_EMAIL=your-email@example.com
SUPPORT_EMAIL=support@example.com

# Redis Configuration
REDIS_HOST=redis  # Use 'localhost' for local development
REDIS_PORT=6379
CELERY_BROKER_URL=redis://${REDIS_HOST}:${REDIS_PORT}/0
CELERY_RESULT_BACKEND=redis://${REDIS_HOST}:${REDIS_PORT}/1

# Zoom Integration
ZOOM_ACCOUNT_ID=your_zoom_account_id
ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_client_secret

# MinIO S3 Storage
MINIO_ENDPOINT_URL=http://aistor-server:9000
MINIO_BUCKET_NAME=marketplace
MINIO_REGION_NAME=us-east-1
MINIO_CUSTOM_DOMAIN=your-custom-domain
MINIO_SIGNATURE_VERSION=s3v4
MINIO_USE_SSL=False
MINIO_VERIFY=False
MINIO_ADDRESSING_STYLE=path
```

### 3. Secrets Configuration

Create the required secret files in the `secrets/` directory:

```bash
# Django secrets
mkdir -p secrets/django
echo "your-secret-key-here" > secrets/django/secret_key.txt
echo "your-smtp-password" > secrets/django/smtp_password.txt

# Database password
mkdir -p secrets/db
echo "your-db-password" > secrets/db/password.txt

# MinIO credentials
mkdir -p secrets/minio
echo "your-minio-access-key" > secrets/minio/access_key.txt
echo "your-minio-secret-key" > secrets/minio/secret_key.txt

# PayStation credentials
mkdir -p secrets/paystation
echo "your-paystation-merchant-id" > secrets/paystation/marchant_id.txt
echo "your-paystation-password" > secrets/paystation/password.txt
```

### 4. Docker Deployment (Recommended)

#### Development Environment

```bash
# Build and start all services
docker compose up --build

# Run in detached mode
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

#### Staging Environment

```bash
# Use staging configuration
docker compose -f compose.staging.yaml up --build -d
```

The application will be available at:
- **API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin/
- **API Documentation**: http://localhost:8000/api/schema/swagger-ui/
- **Mailcatcher UI**: http://localhost:1080

### 5. Local Development (Without Docker)

#### Install Dependencies

```bash
# Create virtual environment
python3.12 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements/local.txt
```

#### Database Setup

Make sure PostgreSQL is running and create the database:

```bash
# On Linux
sudo systemctl start postgresql.service

# Create database
createdb marketplace_db
```

#### Run Migrations

```bash
cd src
python manage.py makemigrations
python manage.py migrate
```

#### Create Superuser

```bash
python manage.py createsuperuser
```

#### Load Seed Data (Optional)

```bash
python manage.py load_seed_data
```

#### Run Development Server

```bash
# Start Django server
python manage.py runserver

# In another terminal, start Celery worker
celery -A config.celery worker -l INFO
```

Or use the Makefile:

```bash
# Start server with automatic migrations
make server

# Run tests with coverage
make test

# Run linters (isort, black, flake8)
make lint

# Update database only
make update-database
```

## 🐳 Docker Services

The application uses the following Docker services:

### Core Services

1. **db** (PostgreSQL 17)
   - Database for the application
   - Port: 5432 (internal)
   - Volume: `db-data`

2. **redis** (Redis 7.4)
   - Cache and WebSocket channel layer
   - Port: 6379 (internal)
   - Volume: `redis-data`

3. **mailcatcher**
   - Email testing tool
   - SMTP Port: 1025 (internal)
   - Web UI: http://localhost:1080

4. **django**
   - Main Django application
   - Port: 8000
   - Runs migrations and starts server automatically

5. **celeryworker**
   - Background task processor
   - Processes async tasks

### Networks

- **public-net**: External access
- **private-net**: Internal communication (isolated)
- **s3-net**: MinIO storage access (external)

## 📦 Project Structure

```
server/
├── compose/                    # Docker configuration files
│   ├── local/                 # Local development Docker files
│   │   └── django/
│   │       ├── Dockerfile
│   │       ├── start          # Django startup script
│   │       └── celery/
│   │           └── worker/
│   │               └── start  # Celery worker startup script
│   └── staging/               # Staging environment Docker files
├── requirements/              # Python dependencies
│   ├── base.txt              # Core dependencies
│   ├── local.txt             # Local development dependencies
│   ├── stage.txt             # Staging dependencies
│   ├── prod.txt              # Production dependencies
│   └── test.txt              # Testing dependencies
├── secrets/                   # Secret files (gitignored)
│   ├── django/
│   ├── db/
│   ├── minio/
│   └── paystation/
├── src/                       # Django application source code
│   ├── accounts/             # User management & authentication
│   ├── base/                 # Base app with utilities
│   ├── biding/               # Proposals and contracts
│   ├── chat/                 # Real-time messaging
│   ├── config/               # Django settings & configuration
│   │   ├── settings/
│   │   │   ├── base.py       # Base settings
│   │   │   ├── local.py      # Local settings
│   │   │   ├── staging.py    # Staging settings
│   │   │   ├── prod.py       # Production settings
│   │   │   ├── celery.py     # Celery configuration
│   │   │   ├── rest_framework.py  # DRF settings
│   │   │   ├── simple_jwt.py      # JWT settings
│   │   │   ├── spectacular.py     # API docs settings
│   │   │   └── storage.py         # Storage settings
│   │   ├── asgi.py           # ASGI configuration
│   │   ├── celery.py         # Celery app
│   │   ├── routing.py        # WebSocket routing
│   │   └── urls.py           # URL configuration
│   ├── images/               # Image management
│   ├── jobs/                 # Job postings
│   ├── meeting/              # Zoom meeting integration
│   ├── notifications/        # Notification system
│   ├── payments/             # Payment processing
│   ├── seed/                 # Seed data
│   ├── utils/                # Utility functions
│   ├── work_diary/           # Milestone tracking
│   └── manage.py             # Django management script
├── uploads/                   # User uploaded files (gitignored)
├── .env                       # Environment variables (gitignored)
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── .pre-commit-config.yaml   # Pre-commit hooks
├── compose.yaml              # Docker Compose for local
├── compose.staging.yaml      # Docker Compose for staging
├── Makefile                  # Development shortcuts
├── pyproject.toml            # Python project configuration
└── README.md                 # This file
```

## 🔌 API Endpoints

### Authentication & Accounts (`/accounts/`)

#### Authentication
- `POST /accounts/signin/` - Sign in with email/password
- `POST /accounts/signin-google/` - Sign in with Google OAuth
- `POST /accounts/logout/` - Logout user
- `POST /accounts/token/refresh/` - Refresh JWT token
- `POST /accounts/token/verify/` - Verify JWT token

#### Password Management
- `POST /accounts/password-reset-mail/` - Request password reset email
- `POST /accounts/otp-verify/` - Verify OTP for password reset
- `POST /accounts/password-reset/` - Reset password
- `POST /accounts/password-change/` - Change password (authenticated)

#### Email Verification
- `GET /accounts/verify/email/<uidb64>/<token>/` - Verify email address
- `GET /accounts/resend/email/<uidb64>/<token>/` - Resend verification email

#### Freelancer Endpoints
- `POST /accounts/signup/` - Freelancer signup
- `POST /accounts/signup-google/` - Freelancer signup with Google
- `GET /accounts/accepted-domain/` - Get accepted email domains
- `GET /accounts/info/` - Get freelancer info
- `PUT /accounts/info/` - Update freelancer info

#### Client Endpoints
- `POST /accounts/clients/signup/` - Client signup
- `POST /accounts/clients/signup-google/` - Client signup with Google
- `GET /accounts/clients/info/` - Get client info
- `PUT /accounts/clients/info/` - Update client info

### Jobs (`/jobs/`)

- `GET /jobs/` - List all published jobs
- `GET /jobs/<uuid:id>/` - Get job details
- `GET /jobs/categories-skills/` - List categories and skills

#### Client Job Management
- `GET /jobs/dropdown/` - Get dropdown data for job creation
- `POST /jobs/create/` - Create new job
- `GET /jobs/my-jobs/` - List client's jobs
- `GET /jobs/my-jobs/<uuid:id>/` - Get client's job details
- `PUT /jobs/my-jobs/<uuid:id>/` - Update job
- `DELETE /jobs/my-jobs/<uuid:id>/` - Delete job

### Bidding (`/biding/`)

#### Freelancer Proposals
- `GET /biding/proposals/` - List freelancer's proposals
- `POST /biding/proposals/` - Create new proposal
- `GET /biding/proposals/<uuid:id>/` - Get proposal details
- `PUT /biding/proposals/<uuid:id>/` - Update proposal
- `DELETE /biding/proposals/<uuid:id>/` - Delete proposal

#### Freelancer Contracts
- `GET /biding/contracts/` - List freelancer's contracts
- `GET /biding/contracts/<uuid:contract_id>/` - Get contract details

#### Client Bidding Management
- `GET /biding/client/proposals/<uuid:job_id>/` - List proposals for a job
- `PUT /biding/client/proposals/update/<uuid:proposal_id>/` - Update proposal status (accept/reject)
- `GET /biding/client/contracts/` - List client's contracts
- `GET /biding/client/contracts/stats/` - Get contract statistics
- `GET /biding/client/contracts/<uuid:contract_id>/` - Get contract details

### Chat (`/chat/`)

#### Conversations
- `GET /chat/conversations/` - List user's conversations
- `GET /chat/conversations/<str:conversation_id>/` - Get conversation details
- `PUT /chat/conversations/<str:conversation_id>/status/` - Update conversation status

#### Messages
- `GET /chat/conversations/<str:conversation_id>/messages/` - List messages
- `POST /chat/conversations/<str:conversation_id>/messages/` - Send message (via WebSocket)

#### Read Receipts
- `POST /chat/conversations/<str:conversation_id>/messages/<int:message_id>/read/` - Mark message as read
- `POST /chat/conversations/<str:conversation_id>/messages/read-all/` - Mark all messages as read

### Notifications (`/notifications/`)

- `GET /notifications/` - List user's notifications
- `GET /notifications/stats/` - Get notification statistics
- `PUT /notifications/read/<int:pk>/` - Mark notification as read
- `PUT /notifications/read/all/` - Mark all notifications as read
- `DELETE /notifications/delete/<int:pk>/` - Delete notification
- `DELETE /notifications/delete/all/` - Delete all notifications

### Work Diary (`/work-diary/`)

#### Client Milestone Management
- `GET /work-diary/client/milestones/stats/` - Get milestone statistics
- `GET /work-diary/client/milestones/<uuid:contract_id>/` - Get milestone details
- `GET /work-diary/client/milestones/<uuid:contract_id>/steps/` - List milestone steps
- `POST /work-diary/client/milestones/<uuid:contract_id>/steps/` - Create milestone step
- `POST /work-diary/client/milestones/<uuid:contract_id>/steps/swap/` - Swap step order
- `GET /work-diary/client/milestones/<uuid:contract_id>/steps/<uuid:step_id>/` - Get step details
- `PUT /work-diary/client/milestones/<uuid:contract_id>/steps/<uuid:step_id>/` - Update step
- `DELETE /work-diary/client/milestones/<uuid:contract_id>/steps/<uuid:step_id>/` - Delete step

#### Freelancer Milestone Management
- `GET /work-diary/milestones/<uuid:contract_id>/` - Get milestone details
- `GET /work-diary/milestones/<uuid:contract_id>/steps/` - List milestone steps
- `PUT /work-diary/milestones/<uuid:contract_id>/steps/<uuid:step_id>/` - Update step status

### Payments (`/payments/`)

- `POST /payments/job/` - Initiate job payment
- `POST /payments/callback/` - Payment gateway callback

### Meetings (`/meetings/`)

- `GET /meetings/auth/` - Get Zoom SDK authentication
- `GET /meetings/all/` - List all meetings
- `GET /meetings/<str:conversation_id>/` - List meetings for conversation
- `POST /meetings/<str:conversation_id>/` - Create new meeting

### Images (`/images/`)

- Image upload and management endpoints

### Admin & Documentation

- `GET /admin/` - Django admin panel
- `GET /api/schema/` - OpenAPI schema
- `GET /api/schema/swagger-ui/` - Swagger UI documentation
- `GET /health_check/` - Health check endpoint

## 🔌 WebSocket Endpoints

### Chat WebSocket

```
ws://localhost:8000/ws/chat/<conversation_id>/
```

**Events:**
- `chat_message` - Send/receive chat messages
- `typing` - Typing indicators
- `read_receipt` - Message read status

### Notifications WebSocket

```
ws://localhost:8000/ws/notifications/
```

**Events:**
- `notification` - Receive real-time notifications
- `notification_read` - Notification read status
- `notification_deleted` - Notification deletion

## 🗄️ Database Models

### Accounts App
- **User** - Base user model (abstract)
- **Client** - Client user type
- **Freelancer** - Freelancer user type
- **Arbitrator** - Arbitrator user type
- **Auditor** - Auditor user type
- **ClientProfile** - Client profile details
- **FreelancerProfile** - Freelancer profile details
- **FreelancerSubProfile** - Additional freelancer info
- **Education** - Education records
- **Experience** - Work experience records
- **Project** - Portfolio projects
- **OTP** - One-time passwords for verification
- **AcceptedDomain** - Whitelisted email domains
- **WebSocketID** - WebSocket connection tracking

### Jobs App
- **Job** - Job postings
- **Category** - Job categories
- **Skill** - Skills/technologies
- **Attachment** - Job attachments

### Bidding App
- **Proposal** - Freelancer proposals
- **Contract** - Accepted contracts
- **Attachment** - Proposal attachments

### Chat App
- **Conversation** - Chat conversations
- **Message** - Chat messages
- **ReadReceipt** - Message read tracking

### Notifications App
- **Notification** - User notifications

### Work Diary App
- **Milestone** - Project milestones
- **MilestoneStep** - Milestone steps/tasks

### Payments App
- **Payment** - Payment records
- **Transaction** - Transaction history

### Meetings App
- **Meeting** - Zoom meeting records

## 🧪 Testing

### Run Tests

```bash
# Using Makefile
make test

# Or directly
cd src
python manage.py test

# With coverage
coverage run --source='.' manage.py test
coverage html
```

### Code Quality

```bash
# Run all linters
make lint

# Individual tools
isort .          # Sort imports
black .          # Format code
flake8           # Lint code
```

### Pre-commit Hooks

Install pre-commit hooks for automatic code quality checks:

```bash
pip install pre-commit
pre-commit install
```

The hooks will run:
- `isort` - Import sorting
- `black` - Code formatting
- `flake8` - Linting
- `blacken-docs` - Format code in documentation

## 🔧 Management Commands

### Database Management

```bash
# Using Docker
docker compose exec django python manage.py makemigrations
docker compose exec django python manage.py migrate

# Or use Makefile
make migrate
```

### Load Seed Data

```bash
docker compose exec django python manage.py load_seed_data
```

### Create Superuser

```bash
docker compose exec django python manage.py createsuperuser
```

### Collect Static Files

```bash
docker compose exec django python manage.py collectstatic
```

## 📊 Monitoring & Logs

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f django
docker compose logs -f celeryworker
docker compose logs -f db
docker compose logs -f redis
```

### Health Check

```bash
curl http://localhost:8000/health_check/
```

### Container Status

```bash
docker compose ps
```

## 🔐 Security

### Secret Management
- All secrets are stored in separate files under `secrets/` directory
- Never commit secrets to version control
- Use Docker secrets for production deployment

### Environment Variables
- Sensitive data is loaded from secret files
- `.env` file is gitignored
- Use `.env.example` as a template

### CORS & CSRF
- Configure `CORS_ALLOWED_ORIGINS` for frontend domains
- Set `CSRF_TRUSTED_ORIGINS` for trusted domains
- Use HTTPS in production

### Authentication
- JWT tokens with refresh mechanism
- Token blacklisting on logout
- Google OAuth integration available

## 🚀 Deployment

### Production Checklist

1. **Environment Configuration**
   - Set `DEBUG=False`
   - Configure proper `ALLOWED_HOSTS`
   - Set up HTTPS
   - Use strong `SECRET_KEY`

2. **Database**
   - Use managed PostgreSQL service
   - Enable backups
   - Set up connection pooling

3. **Static & Media Files**
   - Configure MinIO/S3 for media storage
   - Collect static files
   - Enable CDN for static assets

4. **Security**
   - Enable HTTPS
   - Set secure cookies
   - Configure firewall rules
   - Enable rate limiting

5. **Monitoring**
   - Set up error tracking (e.g., Sentry)
   - Configure logging
   - Monitor resource usage

6. **Scaling**
   - Use multiple Celery workers
   - Configure Redis for production
   - Set up load balancer

### Staging Deployment

```bash
docker compose -f compose.staging.yaml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Follow PEP 8 guidelines
- Use `black` for code formatting
- Use `isort` for import sorting
- Run `flake8` for linting
- Write tests for new features

## 📝 License

[Add your license information here]

## 📧 Support

For support, email [your-support-email] or open an issue in the repository.

## 🙏 Acknowledgments

- Django & Django REST Framework
- Django Channels for WebSocket support
- Celery for background tasks
- PostgreSQL for database
- Redis for caching
- Docker for containerization
- All other open-source dependencies

---

**Note**: This is a comprehensive marketplace platform. Make sure to properly configure all services and secrets before deploying to production.
