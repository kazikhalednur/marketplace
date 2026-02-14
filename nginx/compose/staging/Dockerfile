# NGINX Dockerfile - Staging Environment
# Production-ready NGINX reverse proxy container
# Based on official Alpine Linux image for minimal size

FROM nginx:1.27-alpine

LABEL maintainer="DevOps Team <devops@cpchub.diu.edu.bd>"
LABEL description="NGINX reverse proxy for staging environment"
LABEL version="1.0"
LABEL environment="staging"

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

# Copy STAGING environment configurations
COPY conf.d/staging/*.conf /etc/nginx/conf.d/

# Create log directory and set permissions
RUN mkdir -p /var/log/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chmod -R 755 /var/log/nginx

# Create directory for SSL certificates (will be mounted at runtime)
RUN mkdir -p /etc/nginx/ssl && \
    chown -R nginx:nginx /etc/nginx/ssl && \
    chmod 700 /etc/nginx/ssl

# Expose all required ports for staging
# 80: HTTP redirect to HTTPS
# 443: Main client application (HTTPS)
# 8443: Backend server API (HTTPS)
# 8444: MinIO API (HTTPS)
# 8445: MinIO Console (HTTPS)
# 8447: Jenkins (HTTPS)
# 8448: MailCatcher (HTTPS)
EXPOSE 80 443 8443 8444 8445 8447 8448

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# Start NGINX in foreground
CMD ["nginx", "-g", "daemon off;"]
