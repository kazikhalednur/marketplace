import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      // MinIO / S3 storage on port 9000 (local development)
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '9000',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
      },
      // Internal Docker network access to MinIO via nginx
      {
        protocol: 'http',
        hostname: 'local-marketplace-nginx',
        port: '9000',
      },
      // Allow all HTTPS sources
      {
        protocol: 'https',
        hostname: '**',
      },
      // Allow all HTTP sources (default port only)
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;