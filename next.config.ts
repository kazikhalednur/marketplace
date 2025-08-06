import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'images.unsplash.com',
      'randomuser.me',
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
      {
        protocol: 'https',
        hostname: '**',
        port: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
        port: '**',
      },
    ],
  },
};

export default nextConfig;
