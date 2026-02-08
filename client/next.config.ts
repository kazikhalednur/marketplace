import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: [
      'images.unsplash.com',
      'randomuser.me',
      'i.pravatar.cc',
      '203.190.14.56',
      'cpchub.diu.edu.bd',
      'localhost',
      '127.0.0.1',
      'gravatar.com',
      'www.gravatar.com',
      'secure.gravatar.com',
      'lh3.googleusercontent.com',
      'graph.facebook.com',
      'platform-lookaside.fbsbx.com',
      'res.cloudinary.com',
      's3.amazonaws.com',
      's3-us-west-2.amazonaws.com',
      's3-eu-west-1.amazonaws.com',
      'cdn.discordapp.com',
      'media.discordapp.net',
      'i.imgur.com',
      'imgur.com',
      'avatars.githubusercontent.com',
      'github.com',
    ],
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