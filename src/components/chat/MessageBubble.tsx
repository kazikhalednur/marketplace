"use client";

import React from 'react';
import { ChatMessage } from '@/services/chatWebSocket';
import { useAppSelector } from '@/hooks/useTypedSelector';
import MessageAvatar from './MessageAvatar';
import MessageStatus from './MessageStatus';
import MessageTime from './MessageTime';
import MessageSender from './MessageSender';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  profilePicture?: string;
  isLastMessageFromSender?: boolean;
  shouldShowDate?: boolean;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
}

export default function MessageBubble({ 
  message, 
  isOwnMessage, 
  profilePicture, 
  isLastMessageFromSender, 
  shouldShowDate,
  isFirstInGroup = false,
  isLastInGroup = false
}: MessageBubbleProps) {
  const user = useAppSelector((state) => state.user);
  
  // Check if current user has seen the message
  const currentUsername = user?.username;
  const hasSeen = message.seen_list?.some(seen => seen.username === currentUsername);

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

      {/* Spacer for alignment when no avatar is shown */}
      {!isOwnMessage && !isLastInGroup && (
        <div className="flex-shrink-0 mr-3 w-10 h-10"></div>
      )}

      <div className={`max-w-[280px] sm:max-w-xs lg:max-w-md xl:max-w-lg ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        {/* Sender Name - only show on first message of group */}
        {isFirstInGroup && (
          <MessageSender 
            senderName={message.sender_name || 'Unknown User'} 
            isOwnMessage={isOwnMessage}
          />
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
        
        {/* Date - only show after last message of group */}
        {shouldShowDate && isLastInGroup && (
          <div className={`mt-1 px-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
            <MessageTime 
              timestamp={message.timestamp} 
              showDate={true}
              variant={isOwnMessage ? 'dark' : 'light'}
            />
          </div>
        )}
      </div>
    </div>
  );
} 