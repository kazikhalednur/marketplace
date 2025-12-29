ARG PYTHON_VERSION=3.12.12
FROM python:${PYTHON_VERSION}-slim-bookworm AS base

FROM base AS builder

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

RUN --mount=type=cache,target=/root/.cache/pip \
    --mount=type=bind,source=requirements/base.txt,target=requirements/base.txt \
    --mount=type=bind,source=requirements/stage.txt,target=requirements/stage.txt \
    python -m pip install --prefix=/install -r requirements/stage.txt

FROM base AS runtime

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY ./compose/staging/django/start /start
COPY ./compose/staging/django/celery/worker/start /start-celeryworker

RUN sed -i 's/\r$//g' /start \
    && sed -i 's/\r$//g' /start-celeryworker \
    && chmod +x /start \
    && chmod +x /start-celeryworker

ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser

COPY --from=builder /install /usr/local
COPY . /app/

RUN chown -R appuser:appuser /app

USER appuser

CMD ["/start"]
