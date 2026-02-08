"use client";

import React from 'react';

interface MessageSenderProps {
  senderName: string;
  isOwnMessage: boolean;
  className?: string;
}

export default function MessageSender({ senderName, isOwnMessage, className = '' }: MessageSenderProps) {
  // Helper to get full name from sender name
  const getFullName = (senderName: string) => {
    if (!senderName) return 'Unknown User';
    
    // Convert username to full name format
    // If it's already a full name (contains space), return as is
    if (senderName.includes(' ')) {
      return senderName;
    }
    
    // If it's a username, convert to title case
    return senderName
      .replace(/[_-]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  if (isOwnMessage) {
    return (
      <div className={`mb-1 px-1 text-right ${className}`}>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          You
        </span>
      </div>
    );
  }

  return (
    <div className={`mb-1 px-1 ${className}`}>
      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        {getFullName(senderName || 'Unknown User')}
      </span>
    </div>
  );
} 