"use client";

import React from 'react';
import Image from 'next/image';

interface MessageAvatarProps {
  username: string;
  profilePicture?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function MessageAvatar({ username, profilePicture, size = 'md', className = '' }: MessageAvatarProps) {
  // Helper to get user initials
  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    return name.trim().split(' ').map((n: string) => n[0]).join('').toUpperCase();
  };

  // Helper to determine if avatar is real
  const hasRealAvatar = (avatarUrl?: string) => {
    if (!avatarUrl) return false;
    const url = avatarUrl.trim();
    if (!url) return false;
    
    // Check if it's a placeholder
    const placeholderList = ["/avatar-placeholder.png", "/placeholder.png", "placeholder", "avatar-placeholder"];
    const isPlaceholder = placeholderList.some(placeholder => 
      url.toLowerCase().includes(placeholder.toLowerCase())
    );
    
    // Check if it's a valid URL
    const isValidUrl = url.startsWith('http://') || 
                      url.startsWith('https://') || 
                      url.startsWith('/') ||
                      url.startsWith('data:') ||
                      url.includes('.jpg') ||
                      url.includes('.jpeg') ||
                      url.includes('.png') ||
                      url.includes('.gif') ||
                      url.includes('.webp') ||
                      url.includes('blob:') ||
                      url.includes('gravatar') ||
                      url.includes('cloudinary') ||
                      url.includes('amazonaws') ||
                      url.includes('googleusercontent');
    
    return !isPlaceholder && isValidUrl;
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  return (
    <div className={`flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white overflow-hidden shadow-lg border-2 border-white dark:border-gray-800 ${sizeClasses[size]} ${className}`}>
      {hasRealAvatar(profilePicture) && profilePicture ? (
        <Image 
          src={profilePicture} 
          alt={username || 'User'}
          fill
          className="object-cover"
          onError={() => {
            // Fallback to initials if image fails to load
            const fallback = document.querySelector(`[data-avatar-fallback="${username}"]`) as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
      ) : null}
      <span 
        data-avatar-fallback={username}
        className={`font-bold text-white ${hasRealAvatar(profilePicture) && profilePicture ? 'hidden' : 'flex'}`}
      >
        {getUserInitials(username || 'User')}
      </span>
    </div>
  );
} 