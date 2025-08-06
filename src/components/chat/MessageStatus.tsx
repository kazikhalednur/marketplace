"use client";

import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

interface MessageStatusProps {
  isOwnMessage: boolean;
  isLastMessageFromSender: boolean;
  isRead: boolean;
  hasSeen: boolean;
  className?: string;
  variant?: 'light' | 'dark';
}

export default function MessageStatus({ 
  isOwnMessage, 
  isLastMessageFromSender, 
  isRead, 
  hasSeen, 
  className = '',
  variant = 'light'
}: MessageStatusProps) {
  // Only show status for sender's own messages and only if it's the very last message in the conversation
  if (!isOwnMessage || !isLastMessageFromSender) {
    return null;
  }

  // Color schemes based on variant
  const colors = {
    light: {
      seen: 'text-blue-600 dark:text-blue-400',
      delivered: 'text-green-600 dark:text-green-400',
      sent: 'text-gray-500 dark:text-gray-400'
    },
    dark: {
      seen: 'text-blue-300',
      delivered: 'text-green-300',
      sent: 'text-white/70'
    }
  };

  const currentColors = colors[variant];

  if (hasSeen) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <CheckCheck className={`w-3 h-3 ${currentColors.seen}`} />
        <span className={`text-xs font-medium ${currentColors.seen}`}>Seen</span>
      </div>
    );
  } else if (isRead) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <CheckCheck className={`w-3 h-3 ${currentColors.delivered}`} />
        <span className={`text-xs font-medium ${currentColors.delivered}`}>Delivered</span>
      </div>
    );
  } else {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Check className={`w-3 h-3 ${currentColors.sent}`} />
        <span className={`text-xs font-medium ${currentColors.sent}`}>Sent</span>
      </div>
    );
  }
} 