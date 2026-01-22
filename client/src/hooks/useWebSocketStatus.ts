import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppSelector } from '@/hooks/useTypedSelector';
import WebSocketManager from '@/services/webSocketManager';
import { logError, logWebSocket } from '@/utils/logger';

interface WebSocketMessage {
  type: string;
  data?: unknown;
  timestamp?: number;
}

interface UseWebSocketStatusReturn {
  isOnline: boolean;
  send: (message: WebSocketMessage) => boolean;
  connect: () => void;
  disconnect: () => void;
  isConnecting: boolean;
  reconnectAttempts: number;
}

// Singleton WebSocket manager instance
let webSocketManager: WebSocketManager | null = null;

// Get WebSocket URL based on environment
const getWebSocketUrl = (notificationId: string): string => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const protocol = isDevelopment ? 'ws' : 'wss';
  const host = isDevelopment ? 'localhost:8000' : window.location.host;
  
  return `${protocol}://${host}/ws/notification/${notificationId}/`;
};

export const useWebSocketStatus = (notificationId?: string): UseWebSocketStatusReturn => {
  const [isOnline, setIsOnline] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [reconnectAttempts] = useState(0);
  const user = useAppSelector((state) => state.user);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Initialize WebSocket manager
  useEffect(() => {
    if (!notificationId || !user?.username) {
      return;
    }

    // Create WebSocket manager if it doesn't exist
    if (!webSocketManager) {
      const url = getWebSocketUrl(notificationId);
      webSocketManager = new WebSocketManager({
        url,
        reconnectInterval: 3000,
        maxReconnectAttempts: 5,
        heartbeatInterval: 30000,
      });

      logWebSocket('WebSocket manager created', { url, notificationId });
    }

    // Subscribe to status changes
    if (webSocketManager) {
      unsubscribeRef.current = webSocketManager.subscribeToStatus((status) => {
        setIsOnline(status);
        logWebSocket('WebSocket status changed', { status, notificationId });
      });

      // Connect automatically
      webSocketManager.connect();
      setIsConnecting(true);
    }

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [notificationId, user?.username]);

  // Monitor connection state
  useEffect(() => {
    if (!webSocketManager) return;

    const checkConnection = () => {
      if (!webSocketManager) return;
      const status = webSocketManager.getStatus();
      setIsOnline(status);
      setIsConnecting(false);
    };

    // Check initial status
    checkConnection();

    // Set up interval to monitor connection
    const interval = setInterval(checkConnection, 5000);

    return () => clearInterval(interval);
  }, []);

  // Send message function
  const send = useCallback((message: WebSocketMessage): boolean => {
    if (!webSocketManager) {
      logError('WebSocket manager not initialized');
      return false;
    }

    return webSocketManager.send(message);
  }, []);

  // Connect function
  const connect = useCallback(() => {
    if (!webSocketManager) {
      logError('WebSocket manager not initialized');
      return;
    }

    setIsConnecting(true);
    webSocketManager.connect();
  }, []);

  // Disconnect function
  const disconnect = useCallback(() => {
    if (!webSocketManager) {
      logError('WebSocket manager not initialized');
      return;
    }

    setIsConnecting(false);
    webSocketManager.disconnect();
  }, []);

  // Browser online/offline event listeners
  useEffect(() => {
    const handleOnline = () => {
      logWebSocket('Browser went online');
      if (webSocketManager && !webSocketManager.getStatus()) {
        webSocketManager.connect();
      }
    };

    const handleOffline = () => {
      logWebSocket('Browser went offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen for WebSocket events
  useEffect(() => {
    const handleNotification = (event: CustomEvent) => {
      logWebSocket('Notification received via WebSocket', { 
        notification: event.detail 
      });
      // Handle notification logic here
    };

    const handlePresence = (event: CustomEvent) => {
      logWebSocket('Presence update received via WebSocket', { 
        presence: event.detail 
      });
      // Handle presence logic here
    };

    window.addEventListener('websocket:notification', handleNotification as EventListener);
    window.addEventListener('websocket:presence', handlePresence as EventListener);

    return () => {
      window.removeEventListener('websocket:notification', handleNotification as EventListener);
      window.removeEventListener('websocket:presence', handlePresence as EventListener);
    };
  }, []);

  return {
    isOnline,
    send,
    connect,
    disconnect,
    isConnecting,
    reconnectAttempts,
  };
};

// Cleanup function for app shutdown
export const cleanupWebSocket = (): void => {
  if (webSocketManager) {
    webSocketManager.destroy();
    webSocketManager = null;
    logWebSocket('WebSocket manager destroyed');
  }
}; 