"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAppSelector } from '@/hooks/useTypedSelector';
import { Notification, NotificationWebSocket } from '@/services/notificationWebSocket';
// import { playNotificationSound } from '@/utils/notificationSound';
import { logNotification, logWebSocket } from '@/utils/logger';

interface NotificationContextType {
  notifications: Notification[];
  isLoading: boolean;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationWebSocketProvider');
  }
  return context;
}

export default function NotificationWebSocketProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const user = useAppSelector((state) => state.user);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const wsRef = useRef<NotificationWebSocket | null>(null);
  const isMountedRef = useRef(true);
  const previousNotificationCount = useRef(0);

  // Function to manually refresh notifications
  const refreshNotifications = () => {
    logNotification('Manually refreshing notifications');
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
        logNotification('Provider received notifications (refresh):', newNotifications);
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
    logWebSocket('NotificationWebSocketProvider mounted');
    logWebSocket('User:', user);
    logWebSocket('Notification ID:', user?.notification_id);
    
    // Reset loading state when notification_id changes
    setIsLoading(true);
    
    if (!user?.notification_id) {
      logWebSocket('No notification_id available, skipping WebSocket connection');
      setIsLoading(false);
      return;
    }

    logWebSocket('Creating global WebSocket connection with notification_id:', user.notification_id);
    
    // Clean up any existing connection
    if (wsRef.current) {
      logWebSocket('Cleaning up existing WebSocket connection');
      wsRef.current.disconnect();
    }

    // Create new WebSocket connection
    wsRef.current = new NotificationWebSocket(
      user.notification_id, 
      (newNotifications) => {
        logNotification('Provider received notifications:', newNotifications);
        
        if (isMountedRef.current) {
          // Always set loading to false immediately when we receive any response
          setIsLoading(false);
          
          setNotifications((prev) => {
            // Merge new notifications, avoid duplicates by id
            const ids = new Set(prev.map((n) => n.id));
            const mergedNotifications = [...newNotifications.filter((n) => !ids.has(n.id)), ...prev];
            logNotification('Merged notifications:', mergedNotifications);
            
            // Play sound if we have new notifications
            if (mergedNotifications.length > previousNotificationCount.current) {
              logNotification('Playing notification sound');
              // playNotificationSound(); // Commented out for future implementation
            }
            
            previousNotificationCount.current = mergedNotifications.length;
            return mergedNotifications;
          });
        }
      },
      () => {
        // Connection established callback
        if (isMountedRef.current) {
          // If we haven't received any notifications yet, set loading to false after connection
          setTimeout(() => {
            if (isMountedRef.current && isLoading) {
              setIsLoading(false);
            }
          }, 2000); // Wait 2 seconds after connection to see if we get notifications
        }
      }
    );

    // Set a timeout to ensure loading state is updated even if no messages are received
    const loadingTimeout = setTimeout(() => {
      if (isMountedRef.current && isLoading) {
        setIsLoading(false);
      }
    }, 5000); // 5 second timeout

    // Cleanup function
    return () => {
      clearTimeout(loadingTimeout);
      logWebSocket('Cleaning up WebSocket connection on unmount/change');
      isMountedRef.current = false;
      // Add a small delay to allow the WebSocket to establish connection
      setTimeout(() => {
        if (wsRef.current) {
          wsRef.current.disconnect();
          wsRef.current = null;
        }
      }, 100);
    };
  }, [user?.notification_id, isLoading, user]); // Include all dependencies

  const value: NotificationContextType = {
    notifications,
    isLoading,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
} 