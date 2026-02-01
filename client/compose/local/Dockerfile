# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.13.0
FROM node:${NODE_VERSION}-alpine AS base

WORKDIR /usr/src/app

# --- Development Stage ---
FROM base AS dev

# Use development environment
ENV NODE_ENV=development

# Install dependencies using cache mounts for speed
# We include devDependencies here so tools like Tailwind/PostCSS work
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# Copy source code (though in dev, we usually override this with a volume)
COPY . .

# Expose the standard Next.js dev port
EXPOSE 3000

# Next.js collects completely anonymous telemetry details about general usage.
# Learn more here: https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Run the development server with hot-reloading
CMD ["npm", "run", "dev"]