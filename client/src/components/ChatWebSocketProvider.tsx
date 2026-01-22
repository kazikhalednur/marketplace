"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { ChatWebSocket } from '@/services/chatWebSocket';
import { ChatMessage } from '@/services/chatWebSocket';
import { logChat, logWebSocket } from '@/utils/logger';
import { useAppSelector } from '@/hooks/useTypedSelector';

interface ChatContextType {
  messages: ChatMessage[];
  isConnected: boolean;
  isTyping: boolean;
  typingUser: string;
  sendMessage: (message: string) => void;
  sendTypingIndicator: (isTyping: boolean) => void;
  readMessage: (messageId: number, conversationId: string) => void;
  markMessageAsSeen: (messageId: number, conversationId: string) => void;
  connectToRoom: (roomName: string) => void;
  disconnect: () => void;
  onMessageSent?: (message: ChatMessage) => void;
  setOnMessageSent: (callback: ((message: ChatMessage) => void) | undefined) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatWebSocketProvider');
  }
  return context;
}

export default function ChatWebSocketProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const user = useAppSelector((state) => state.user);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const wsRef = useRef<ChatWebSocket | null>(null);
  const isMountedRef = useRef(true);
  const previousMessageCount = useRef(0);
  const currentRoomRef = useRef<string | null>(null);
  const [onMessageSent, setOnMessageSent] = useState<((message: ChatMessage) => void) | undefined>(undefined);

  const connectToRoom = useCallback((roomName: string) => {
    logChat('Connecting to room:', roomName);
    
    // If this is a global connection, don't disconnect existing
    if (roomName.startsWith('global_')) {
      logChat('Global connection requested, maintaining existing connection');
      return;
    }
    
    // Disconnect existing connection
    if (wsRef.current) {
      wsRef.current.disconnect();
      wsRef.current = null;
    }

    // Reset state
    setMessages([]);
    setIsConnected(false);
    setIsTyping(false);
    setTypingUser('');
    previousMessageCount.current = 0;
    currentRoomRef.current = roomName;

    // Create new WebSocket connection
    wsRef.current = new ChatWebSocket(
      roomName,
      (newMessages) => {
        logChat('Provider received messages:', {
          count: newMessages.length,
          lastMessage: newMessages[newMessages.length - 1],
          roomName: roomName
        });
        
        if (isMountedRef.current) {
          setMessages(newMessages);
          previousMessageCount.current = newMessages.length;
          
          // Always trigger callback for any message update, not just new messages
          // This ensures conversation list updates immediately when WebSocket responds
          if (newMessages.length > 0) {
            const latestMessage = newMessages[newMessages.length - 1];
            if (latestMessage && onMessageSent) {
              // Add null checks for the latest message
              if (latestMessage.text && latestMessage.sender_name) {
                logChat('Triggering onMessageSent callback with latest message:', {
                  text: latestMessage.text,
                  sender: latestMessage.sender_name,
                  timestamp: latestMessage.timestamp,
                  roomName: roomName
                });
                onMessageSent(latestMessage);
              } else {
                logChat('Skipping onMessageSent callback - latest message is invalid:', latestMessage);
              }
            }
          }
        }
      },
      (isTyping, sender) => {
        logChat('Typing indicator received:', { isTyping, sender, roomName });
        if (isMountedRef.current) {
          setIsTyping(isTyping);
          setTypingUser(sender);
        }
      },
      () => {
        logChat('Chat WebSocket connected to room:', roomName);
        if (isMountedRef.current) {
          setIsConnected(true);
        }
      }
    );
  }, [onMessageSent]);

  // Create a global WebSocket connection for all conversations
  const createGlobalWebSocketConnection = useCallback(() => {
    if (!user?.username) return;
    
    // Create a global connection that listens to all conversations
    const globalRoomName = `global_${user.username}`;
    logChat('Creating global WebSocket connection for all conversations:', globalRoomName);
    
    const globalWs = new ChatWebSocket(
      globalRoomName,
      (newMessages) => {
        logChat('Global WebSocket received messages:', {
          count: newMessages.length,
          lastMessage: newMessages[newMessages.length - 1]
        });
        
        if (isMountedRef.current && newMessages.length > 0) {
          const latestMessage = newMessages[newMessages.length - 1];
          if (latestMessage && onMessageSent) {
            // Add null checks for the latest message
            if (latestMessage.text && latestMessage.sender_name) {
              logChat('Triggering global onMessageSent callback with latest message:', {
                text: latestMessage.text,
                sender: latestMessage.sender_name,
                timestamp: latestMessage.timestamp
              });
              onMessageSent(latestMessage);
            } else {
              logChat('Skipping global onMessageSent callback - latest message is invalid:', latestMessage);
            }
          }
        }
      },
      (isTyping, sender) => {
        logChat('Global typing indicator received:', { isTyping, sender });
      },
      () => {
        logChat('Global WebSocket connected for all conversations');
      }
    );
    
    return globalWs;
  }, [user?.username, onMessageSent]);

  // Initialize global WebSocket connection when user is available
  useEffect(() => {
    if (user?.username && !wsRef.current) {
      logChat('Initializing global WebSocket connection for user:', user.username);
      const globalWs = createGlobalWebSocketConnection();
      if (globalWs) {
        wsRef.current = globalWs;
      }
    }
  }, [user?.username, createGlobalWebSocketConnection]);

  const sendMessage = useCallback((message: string) => {
    if (wsRef.current) {
      wsRef.current.sendMessage(message);
    } else {
      logWebSocket('Cannot send message: No WebSocket connection');
    }
  }, []);

  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (wsRef.current) {
      wsRef.current.sendTypingIndicator(isTyping);
    }
  }, []);

  const readMessage = useCallback((messageId: number, conversationId: string) => {
    if (wsRef.current) {
      wsRef.current.readMessage(messageId, conversationId);
    }
  }, []);

  const markMessageAsSeen = useCallback((messageId: number, conversationId: string) => {
    if (wsRef.current) {
      wsRef.current.markMessageAsSeen(messageId, conversationId);
      logChat('Marking message as seen:', { messageId, conversationId });
    }
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.disconnect();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsTyping(false);
    setTypingUser('');
    setMessages([]);
    previousMessageCount.current = 0;
    currentRoomRef.current = null;
  }, []);

  useEffect(() => {
    logChat('ChatWebSocketProvider mounted');
    
    return () => {
      logChat('Cleaning up chat WebSocket connection on unmount');
      isMountedRef.current = false;
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
    };
  }, []);

  const value: ChatContextType = {
    messages,
    isConnected,
    isTyping,
    typingUser,
    sendMessage,
    sendTypingIndicator,
    readMessage,
    markMessageAsSeen,
    connectToRoom,
    disconnect,
    onMessageSent,
    setOnMessageSent,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
} 