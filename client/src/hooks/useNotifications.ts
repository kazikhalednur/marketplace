import { useEffect, useRef, useState } from 'react';
import { useAppSelector } from './useTypedSelector';
import { Notification, NotificationWebSocket } from '@/services/notificationWebSocket';
import { useGetConversationsQuery } from '@/features/api/apiSlice';

export function useNotifications() {
  const user = useAppSelector((state) => state.user);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const wsRef = useRef<NotificationWebSocket | null>(null);
  const isMountedRef = useRef(true);
  
  // Function to manually refresh notifications
  const refreshNotifications = () => {
    // console.log('🔄 Manually refreshing notifications');
    setIsLoading(true);
    
    // Force disconnect and reconnect of WebSocket
    if (wsRef.current) {
      wsRef.current.disconnect();
      wsRef.current = null;
    }
    
    // Clear notifications to ensure we get fresh data
    setNotifications([]);
    
    // Reconnect will happen in the useEffect
    if (user?.notification_id) {
      wsRef.current = new NotificationWebSocket(user.notification_id, (newNotifications) => {
        // console.log('📨 Hook received notifications (refresh):', newNotifications);
        if (isMountedRef.current) {
          setNotifications(newNotifications);
          setIsLoading(false);
        }
      });
    } else {
      // If no user ID, just stop loading
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // console.log('🔍 useNotifications hook called');
    // console.log('🔍 User:', user);
    // console.log('🔍 Notification ID:', user?.notification_id);
    
    // Reset loading state when notification_id changes
    setIsLoading(true);
    
    if (!user?.notification_id) {
      // console.log('❌ No notification_id available, skipping WebSocket connection');
      setIsLoading(false);
      return;
    }

    // console.log('✅ Creating WebSocket connection with notification_id:', user.notification_id);
    
    // Clean up any existing connection
    if (wsRef.current) {
      // console.log('🧹 Cleaning up existing WebSocket connection');
      wsRef.current.disconnect();
    }

    // Create new WebSocket connection
    wsRef.current = new NotificationWebSocket(user.notification_id, (newNotifications) => {
      // console.log('📨 Hook received notifications:', newNotifications);
      if (isMountedRef.current) {
        setNotifications((prev) => {
          // Merge new notifications, avoid duplicates by id
          const ids = new Set(prev.map((n) => n.id));
          const mergedNotifications = [...newNotifications.filter((n) => !ids.has(n.id)), ...prev];
          // console.log('📨 Merged notifications:', mergedNotifications);
          return mergedNotifications;
        });
        // Always set loading to false when we receive any response
        setIsLoading(false);
      }
    });

    // Set a timeout to stop loading state if no notifications arrive
    const loadingTimeout = setTimeout(() => {
      if (isMountedRef.current) {
        // console.log('🕒 Loading timeout reached, setting isLoading to false');
        setIsLoading(false);
        // Force an empty array if we still don't have notifications after timeout
        setNotifications(prev => {
          if (prev.length === 0) {
            // console.log('📭 No notifications received after timeout, ensuring empty array');
            return [];
          }
          return prev;
        });
      }
    }, 3000); // 3 seconds timeout

    // Cleanup function
    return () => {
      // console.log('🧹 Cleaning up WebSocket connection on unmount/change');
      isMountedRef.current = false;
      clearTimeout(loadingTimeout);
      // Add a small delay to allow the WebSocket to establish connection
      setTimeout(() => {
        if (wsRef.current) {
          wsRef.current.disconnect();
          wsRef.current = null;
        }
      }, 100);
    };
  }, [user, user?.notification_id]);

  return { notifications, isLoading, refreshNotifications };
}

export const useConversations = () => {
  const { data: conversationsData, isLoading, error } = useGetConversationsQuery();
  const user = useAppSelector((state) => state.user);
  
  const conversations = conversationsData?.data || [];
  
  // Find conversation by username (either freelancer or client)
  const findConversationByUsername = (username: string) => {
    return conversations.find(conversation => 
      conversation.freelancer_name === username || 
      conversation.client_name === username
    );
  };
  
  // Find conversation by conversation_id
  const findConversationById = (conversationId: string) => {
    return conversations.find(conversation => 
      conversation.conversation_id === conversationId
    );
  };
  
  // Get conversation_id for a specific username
  const getConversationId = (username: string) => {
    const conversation = findConversationByUsername(username);
    return conversation?.conversation_id || null;
  };
  
  // Get all conversations for current user
  const getUserConversations = () => {
    if (!user?.username) return [];
    
    return conversations.filter(conversation => 
      conversation.freelancer_name === user.username || 
      conversation.client_name === user.username
    );
  };
  
  return {
    conversations,
    isLoading,
    error,
    findConversationByUsername,
    findConversationById,
    getConversationId,
    getUserConversations,
  };
};
