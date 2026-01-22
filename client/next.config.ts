import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      // This pattern allows images from ANY secure (https) source.
      // Note: This is broad. For maximum security, replace "**" with specific domains.
      {
        protocol: 'https',
        hostname: '**',
      },
      // This pattern allows images from ANY insecure (http) source.
      {
        protocol: 'http',
        hostname: '**',
      },
      // Specifically for local development if you use local IPs or localhost
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
  },
};

export default nextConfig;