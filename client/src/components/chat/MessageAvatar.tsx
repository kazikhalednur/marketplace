"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface MessageAvatarProps {
  username: string;
  profilePicture?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function MessageAvatar({ 
  username, 
  profilePicture, 
  size = 'md',
  className 
}: MessageAvatarProps) {
  // Helper to get user initials
  function getUserInitials() {
    const name = username.replace(/[_-]/g, ' ').trim();
    if (name && name.length > 0) {
      return name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
    }
    return null;
  }

  // Helper to determine if avatar is real
  function hasRealAvatar() {
    if (!profilePicture) return false;
    const avatarUrl = profilePicture.trim();
    if (!avatarUrl) return false;
    
    // Check if it's a placeholder
    const placeholderList = ["/avatar-placeholder.png", "/placeholder.png", "placeholder", "avatar-placeholder"];
    const isPlaceholder = placeholderList.some(placeholder => 
      avatarUrl.toLowerCase().includes(placeholder.toLowerCase())
    );
    
    // Check if it's a valid URL
    const isValidUrl = avatarUrl.startsWith('http://') || 
                      avatarUrl.startsWith('https://') || 
                      avatarUrl.startsWith('/') ||
                      avatarUrl.startsWith('data:') ||
                      avatarUrl.includes('.jpg') ||
                      avatarUrl.includes('.jpeg') ||
                      avatarUrl.includes('.png') ||
                      avatarUrl.includes('.gif') ||
                      avatarUrl.includes('.webp') ||
                      avatarUrl.includes('blob:') ||
                      avatarUrl.includes('gravatar') ||
                      avatarUrl.includes('cloudinary') ||
                      avatarUrl.includes('amazonaws') ||
                      avatarUrl.includes('googleusercontent');
    
    return !isPlaceholder && isValidUrl;
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6 text-xs';
      case 'lg':
        return 'w-10 h-10 text-lg';
      default:
        return 'w-8 h-8 text-sm';
    }
  };

  if (hasRealAvatar() && profilePicture) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profilePicture}
        alt={`${username}'s avatar`}
        width={size === 'sm' ? 24 : size === 'lg' ? 40 : 32}
        height={size === 'sm' ? 24 : size === 'lg' ? 40 : 32}
        className={cn(
          'rounded-full object-cover border border-border',
          getSizeClasses(),
          className
        )}
        loading="lazy"
      />
    );
  }

  return (
    <div className={cn(
      'rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium border border-border',
      getSizeClasses(),
      className
    )}>
      {getUserInitials() || username.charAt(0).toUpperCase()}
    </div>
  );
} 