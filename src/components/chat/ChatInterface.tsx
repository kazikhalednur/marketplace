"use client";

import React, { useState, useEffect, useRef, useCallback, Fragment } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Paperclip, Smile } from 'lucide-react';
import { useChatContext } from '@/components/ChatWebSocketProvider';
import { useAppSelector } from '@/hooks/useTypedSelector';
// import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { ChatMessage } from '@/services/chatWebSocket';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
// import { UserOnlineStatus } from '@/components/ui/OnlineStatus';
import MessageAvatar from './MessageAvatar';
import { isSameMinute } from '@/utils/time';

interface ChatInterfaceProps {
  roomName: string;
  title?: string;
  profilePicture?: string;
}

export default function ChatInterface({ roomName, title = "Chat", profilePicture }: ChatInterfaceProps) {
  const { 
    messages, 
    isConnected, 
    isTyping, 
    typingUser, 
    sendMessage, 
    sendTypingIndicator, 
    readMessage,
    connectToRoom 
  } = useChatContext();
  
  const user = useAppSelector((state) => state.user);
  // const { getUserStatus } = useNetworkStatus();
  const [inputMessage, setInputMessage] = useState('');
  const [isTypingLocal, setIsTypingLocal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentRoomRef = useRef<string>('');



  // Connect to room when component mounts or roomName changes
  useEffect(() => {
    if (roomName && roomName !== currentRoomRef.current) {
      currentRoomRef.current = roomName;
      connectToRoom(roomName);
    }
  }, [roomName, connectToRoom]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicator
  useEffect(() => {
    if (isTypingLocal) {
      sendTypingIndicator(true);
      
      // Clear typing indicator after 3 seconds of no input
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTypingLocal(false);
        sendTypingIndicator(false);
      }, 3000);
    } else {
      sendTypingIndicator(false);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isTypingLocal, sendTypingIndicator]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    if (!isTypingLocal) {
      setIsTypingLocal(true);
    }
    
    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTypingLocal(false);
    }, 3000);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() && isConnected) {
      sendMessage(inputMessage.trim());
      setInputMessage('');
      setIsTypingLocal(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isOwnMessage = useCallback((message: ChatMessage) => {
    return message?.sender_name === user?.username;
  }, [user?.username]);

  // Function to determine if a message is first in its group
  const isFirstInGroup = (messageIndex: number) => {
    if (messageIndex === 0) return true;
    
    const currentMessage = messages[messageIndex];
    const previousMessage = messages[messageIndex - 1];
    
    // Add null checks
    if (!currentMessage?.sender_name || !previousMessage?.sender_name) return true;
    
    // If previous message is from different sender, this is first in group
    if (currentMessage.sender_name !== previousMessage.sender_name) return true;
    
    // If time difference is more than 1 minute, this is first in group
    if (!isSameMinute(currentMessage.timestamp, previousMessage.timestamp)) return true;
    
    // Same sender and within 1 minute, so not first in group
    return false;
  };

  // Function to determine if a message is last in its group
  const isLastInGroup = (messageIndex: number) => {
    if (messageIndex === messages.length - 1) return true;
    
    const currentMessage = messages[messageIndex];
    const nextMessage = messages[messageIndex + 1];
    
    // Add null checks
    if (!currentMessage?.sender_name || !nextMessage?.sender_name) return true;
    
    // If next message is from different sender, this is last in group
    if (currentMessage.sender_name !== nextMessage.sender_name) return true;
    
    // If time difference is more than 1 minute, this is last in group
    if (!isSameMinute(currentMessage.timestamp, nextMessage.timestamp)) return true;
    
    // Same sender and within 1 minute, so not last in group
    return false;
  };

  // Mark messages as read when they come into view
  const markMessagesAsRead = useCallback(() => {
    if (!isConnected || !currentRoomRef.current) return;
    
    // Mark unread messages as read
    messages.forEach((message) => {
      if (!message.is_read && !isOwnMessage(message)) {
        readMessage(message.id, currentRoomRef.current);
      }
    });
  }, [messages, isConnected, readMessage, isOwnMessage]);

  // Mark messages as read when component mounts or messages change
  useEffect(() => {
    markMessagesAsRead();
  }, [markMessagesAsRead]);

  return (
    <div className="w-full h-full max-h-full flex flex-col bg-background">
      {/* Header */}
      <div className="pb-4 pt-4 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex-shrink-0 shadow-sm">
        <div className="flex items-center px-4 md:px-6">
          <div className="flex items-center gap-4">
            <MessageAvatar 
              username={title || 'Chat'} 
              profilePicture={profilePicture}
              size="lg"
              className="w-14 h-14"
            />
            <div className="flex flex-col">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">{title}</h2>
              <div className="flex items-center gap-3 mt-1">
                {/* Online/Offline Status - Commented out
                <UserOnlineStatus
                  username={title}
                  isOnline={getUserStatus(title)?.isOnline || false}
                  lastSeen={getUserStatus(title)?.lastSeen}
                  size="sm"
                  showText={true}
                />
                */}
                {isTyping && typingUser && typingUser !== user?.username && (
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">writing...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col p-0 min-h-0 h-full">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-0">
          {!isConnected && (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center shadow-lg">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-500 dark:text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">Setting up your chat...</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This will only take a moment</p>
                </div>
              </div>
            </div>
          )}
          
          {isConnected && messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl">💬</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Ready to chat!</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                  Send your first message to start the conversation. Your messages will appear here.
                </p>
              </div>
            </div>
          )}
          
          {messages.map((message, index) => (
            <Fragment key={`${message.id}-${index}`}>
              {/* Message Bubble */}
              <MessageBubble
                message={message}
                isOwnMessage={isOwnMessage(message)}
                isFirstInGroup={isFirstInGroup(index)}
                isLastInGroup={isLastInGroup(index)}
                profilePicture={profilePicture}
              />
            </Fragment>
          ))}
          
          {/* Only show typing indicator if someone else is typing */}
          {isTyping && typingUser && typingUser !== user?.username && (
            <TypingIndicator 
              isTyping={isTyping} 
              typingUser={typingUser} 
              profilePicture={profilePicture}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 backdrop-blur-sm p-4 md:p-6 flex-shrink-0 shadow-lg">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <Input
                value={inputMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Write your message here..."
                disabled={!isConnected}
                className="pr-20 py-4 text-sm border-2 focus:border-blue-500 dark:focus:border-blue-400 transition-colors rounded-xl bg-white dark:bg-gray-800 shadow-sm h-12"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  disabled={!isConnected}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  disabled={!isConnected}
                >
                  <Smile className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || !isConnected}
              size="icon"
              className="h-12 w-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Connection Status */}
          {!isConnected && (
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center bg-gray-100 dark:bg-gray-800 rounded-lg py-2">
              Setting up your chat connection...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}