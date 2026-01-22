"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import messageWebSocketService, { Message, MessageCallback, TypingCallback, ConnectionCallback } from '@/services/messageWebSocket';
import { logWebSocket, logError } from '@/utils/logger';

interface MessageContextType {
  messages: Message[];
  isTyping: boolean;
  typingUser: string | null;
  isConnected: boolean;
  sendMessage: (message: string) => boolean;
  sendTypingIndicator: (isTyping: boolean) => boolean;
  markAsRead: (messageId: number) => boolean;
  connectToRoom: (roomName: string) => void;
  disconnect: () => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function useMessageContext() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessageContext must be used within a MessageWebSocketProvider');
  }
  return context;
}

export default function MessageWebSocketProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(true);

  // Handle incoming messages
  const handleMessages: MessageCallback = (newMessages) => {
    logWebSocket('Provider received messages:', newMessages);
    
    if (isMountedRef.current) {
      setMessages((prev) => {
        // Merge new messages, avoid duplicates by id
        const ids = new Set(prev.map((m) => m.id));
        const mergedMessages = [...newMessages.filter((m) => !ids.has(m.id)), ...prev];
        return mergedMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      });
    }
  };

  // Handle typing indicators
  const handleTyping: TypingCallback = (isTyping, sender) => {
    logWebSocket('Provider received typing indicator:', { isTyping, sender });
    
    if (isMountedRef.current) {
      setIsTyping(isTyping);
      setTypingUser(isTyping ? sender : null);
    }
  };

  // Handle connection established
  const handleConnected: ConnectionCallback = () => {
    logWebSocket('Provider: Message WebSocket connected');
    
    if (isMountedRef.current) {
      setIsConnected(true);
    }
  };

  // Connect to a chat room
  const connectToRoom = (roomName: string) => {
    logWebSocket('Connecting to message room:', roomName);
    
    // Clean up existing connection
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // Reset state
    setMessages([]);
    setIsTyping(false);
    setTypingUser(null);
    setIsConnected(false);
    setCurrentRoom(roomName);

    // Connect to the room
    unsubscribeRef.current = messageWebSocketService.connectToRoom(
      roomName,
      handleMessages,
      handleTyping,
      handleConnected
    );
  };

  // Send a message
  const sendMessage = (message: string): boolean => {
    if (!currentRoom) {
      logError('No room connected, cannot send message');
      return false;
    }
    
    const success = messageWebSocketService.sendMessage(message);
    if (success) {
      logWebSocket('Message sent successfully:', message);
    } else {
      logError('Failed to send message');
    }
    return success;
  };

  // Send typing indicator
  const sendTypingIndicator = (isTyping: boolean): boolean => {
    if (!currentRoom) {
      logError('No room connected, cannot send typing indicator');
      return false;
    }
    
    const success = messageWebSocketService.sendTypingIndicator(isTyping);
    if (success) {
      logWebSocket('Typing indicator sent:', isTyping);
    } else {
      logError('Failed to send typing indicator');
    }
    return success;
  };

  // Mark message as read
  const markAsRead = (messageId: number): boolean => {
    if (!currentRoom) {
      logError('No room connected, cannot mark message as read');
      return false;
    }
    
    const success = messageWebSocketService.markAsRead(messageId);
    if (success) {
      logWebSocket('Message marked as read:', messageId);
    } else {
      logError('Failed to mark message as read');
    }
    return success;
  };

  // Disconnect
  const disconnect = () => {
    logWebSocket('Disconnecting from message room');
    
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    
    messageWebSocketService.disconnect();
    
    // Reset state
    setMessages([]);
    setIsTyping(false);
    setTypingUser(null);
    setIsConnected(false);
    setCurrentRoom(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      messageWebSocketService.disconnect();
    };
  }, []);

  const value: MessageContextType = {
    messages,
    isTyping,
    typingUser,
    isConnected,
    sendMessage,
    sendTypingIndicator,
    markAsRead,
    connectToRoom,
    disconnect,
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
} 