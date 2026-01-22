"use client";

import React from 'react';

interface MessageTimeProps {
  timestamp: string;
  showDate?: boolean;
  className?: string;
  variant?: 'light' | 'dark';
}

export default function MessageTime({ 
  timestamp, 
  showDate = false, 
  className = '',
  variant = 'light'
}: MessageTimeProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Color schemes based on variant
  const colors = {
    light: 'text-gray-500 dark:text-gray-400',
    dark: 'text-white/70'
  };

  const currentColor = colors[variant];

  return (
    <div className={`text-xs font-medium ${currentColor} ${className}`}>
      {showDate ? formatDate(timestamp) : formatTime(timestamp)}
    </div>
  );
} 