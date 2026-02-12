# NGINX Dockerfile - Local Development
# Lightweight configuration for local development
# Based on official Alpine Linux image

FROM nginx:1.27-alpine

LABEL maintainer="DevOps Team <devops@cpchub.diu.edu.bd>"
LABEL description="NGINX reverse proxy for local development"
LABEL version="1.0"
LABEL environment="local"

# Install necessary packages
RUN apk add --no-cache \
    ca-certificates \
    tzdata \
    curl \
    && rm -rf /var/cache/apk/*

# Set timezone
ENV TZ=Asia/Dhaka
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Remove default NGINX configuration
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy main NGINX configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy LOCAL environment configurations
COPY conf.d/local/*.conf /etc/nginx/conf.d/

# Create log directory and set permissions
RUN mkdir -p /var/log/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chmod -R 755 /var/log/nginx

# Expose ports for local development
# 80: Client application (HTTP)
# 8000: Backend server API (HTTP)
# 9000: MinIO API (HTTP)
# 9001: MinIO Console (HTTP)
# 1080: MailCatcher Web UI (HTTP)
EXPOSE 80 8000 9000 9001 1080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# Start NGINX in foreground
CMD ["nginx", "-g", "daemon off;"]
