"use client";

import React from 'react';
import { ChatMessage } from '@/services/chatWebSocket';
import { useAppSelector } from '@/hooks/useTypedSelector';
import MessageAvatar from './MessageAvatar';
import MessageStatus from './MessageStatus';
import MessageTime from './MessageTime';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  profilePicture?: string;
  isLastMessageFromSender?: boolean;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
}

export default function MessageBubble({ 
  message, 
  isOwnMessage, 
  profilePicture, 
  isLastMessageFromSender, 
  isFirstInGroup = false,
  isLastInGroup = false
}: MessageBubbleProps) {
  const user = useAppSelector((state) => state.user);
  
  // Check if current user has seen the message
  const currentUsername = user?.username;
  const hasSeen = message.seen_list?.some(seen => seen.username === currentUsername);

  // Helper function to get display name
  const getDisplayName = (senderName: string) => {
    if (isOwnMessage) {
      return "You";
    }
    // Convert username to full name format
    return senderName
      .replace(/[_-]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-1`}>
      {/* Avatar for sender's messages (left side) - only show on last message of group */}
      {!isOwnMessage && isLastInGroup && (
        <div className="flex-shrink-0 mr-3 self-end">
          <MessageAvatar 
            username={message.sender_name || 'User'} 
            profilePicture={profilePicture}
            size="md"
          />
        </div>
      )}

      {/* Avatar for own messages (right side) - only show on last message of group */}
      {isOwnMessage && isLastInGroup && (
        <div className="flex-shrink-0 ml-3 self-end order-3">
          <MessageAvatar 
            username={user?.username || 'You'} 
            profilePicture={profilePicture}
            size="md"
          />
        </div>
      )}

      {/* Spacer for alignment when no avatar is shown */}
      {!isOwnMessage && !isLastInGroup && (
        <div className="flex-shrink-0 mr-3 w-10 h-10"></div>
      )}

      {/* Spacer for own messages when no avatar is shown */}
      {isOwnMessage && !isLastInGroup && (
        <div className="flex-shrink-0 ml-3 w-10 h-10 order-3"></div>
      )}

      <div className={`max-w-[280px] sm:max-w-xs lg:max-w-md xl:max-w-lg ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        {/* Sender Name - only show on first message of group */}
        {isFirstInGroup && (
          <div className={`mb-2 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
            <div className={`text-sm font-medium ${isOwnMessage ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
              {getDisplayName(message.sender_name || 'Unknown User')}
            </div>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`relative px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
            isOwnMessage
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-md'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          {/* Message Text */}
          <p className="text-sm leading-relaxed break-words">{message.text}</p>
          
          {/* Message Info - only show on last message of group */}
          {isLastInGroup && (
            <div className={`flex items-center justify-between mt-2 ${
              isOwnMessage ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'
            }`}>
              <MessageTime 
                timestamp={message.timestamp} 
                variant={isOwnMessage ? 'dark' : 'light'}
              />
              {isOwnMessage && (
                <div className="flex items-center gap-1 ml-2">
                  <MessageStatus 
                    isOwnMessage={isOwnMessage}
                    isLastMessageFromSender={isLastMessageFromSender || false}
                    isRead={message.is_read}
                    hasSeen={hasSeen || false}
                    variant="dark"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 