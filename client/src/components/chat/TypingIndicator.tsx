"use client";

import React from 'react';
import MessageAvatar from './MessageAvatar';

interface TypingIndicatorProps {
  isTyping: boolean;
  typingUser: string;
  profilePicture?: string;
}

export default function TypingIndicator({ isTyping, typingUser, profilePicture }: TypingIndicatorProps) {
  if (!isTyping || !typingUser) {
    return null;
  }

  return (
    <div className="flex justify-start mb-1">
      <div className="flex items-center gap-2 max-w-xs lg:max-w-md xl:max-w-lg">
        {/* Avatar */}
        <MessageAvatar 
          username={typingUser} 
          profilePicture={profilePicture}
          size="sm"
        />
        
        {/* Typing Bubble */}
        <div className="bg-muted text-foreground px-4 py-2 rounded-2xl rounded-bl-md shadow-sm">
          <div className="flex items-center gap-1">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
        
        {/* Sender Name */}
        <div className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{typingUser}</span>
          <span className="ml-1">is writing...</span>
        </div>
      </div>
    </div>
  );
} 