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
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}>
      {!isOwnMessage ? (
        // Left side - Other person's messages
        <div className="flex items-end gap-3 max-w-[85%]">
          {/* Avatar - only show on last message of group */}
          {isLastInGroup ? (
            <div className="flex-shrink-0">
              <MessageAvatar 
                username={message.sender_name || 'User'} 
                profilePicture={profilePicture}
                size="md"
              />
            </div>
          ) : (
            <div className="flex-shrink-0 w-8 h-8"></div>
          )}
          
          {/* Message content */}
          <div className="min-w-0 flex-1">
            {/* Sender Name - only show on first message of group */}
            {isFirstInGroup && (
              <div className="mb-2 text-left">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {getDisplayName(message.sender_name || 'Unknown User')}
                </div>
              </div>
            )}

            {/* Message Bubble */}
            <div className="relative px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600">
              {/* Message Text */}
              <p className="text-sm leading-relaxed break-words">{message.text}</p>
              
              {/* Message Info - only show on last message of group */}
              {isLastInGroup && (
                <div className="flex items-center justify-between mt-2 text-gray-500 dark:text-gray-400">
                  <MessageTime 
                    timestamp={message.timestamp} 
                    variant="light"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Right side - Own messages
        <div className="flex items-end gap-3 max-w-[85%] ml-auto">
          {/* Message content */}
          <div className="min-w-0 flex-1 text-right">
            {/* Sender Name - only show on first message of group */}
            {isFirstInGroup && (
              <div className="mb-2 text-right">
                <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {getDisplayName(message.sender_name || 'Unknown User')}
                </div>
              </div>
            )}

            {/* Message Bubble */}
            <div className="relative px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-md ml-auto">
              {/* Message Text */}
              <p className="text-sm leading-relaxed break-words">{message.text}</p>
              
              {/* Message Info - only show on last message of group */}
              {isLastInGroup && (
                <div className="flex items-center justify-between mt-2 text-white/90">
                  <MessageTime 
                    timestamp={message.timestamp} 
                    variant="dark"
                  />
                  <div className="flex items-center gap-1 ml-2">
                    <MessageStatus 
                      isOwnMessage={isOwnMessage}
                      isLastMessageFromSender={isLastMessageFromSender || false}
                      isRead={message.is_read}
                      hasSeen={hasSeen || false}
                      variant="dark"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Avatar - only show on last message of group */}
          {isLastInGroup ? (
            <div className="flex-shrink-0">
              <MessageAvatar 
                username={user?.username || 'You'} 
                size="md"
              />
            </div>
          ) : (
            <div className="flex-shrink-0 w-8 h-8"></div>
          )}
        </div>
      )}
    </div>
  );
}