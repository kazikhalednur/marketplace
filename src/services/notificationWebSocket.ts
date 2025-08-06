import Cookies from 'js-cookie';
import { logWebSocket, logNotification, logError } from '@/utils/logger';

export interface Notification {
  id: number;
  message_type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface WebSocketNotificationResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    count: number;
    page: number;
    page_size: number;
    total_pages: number;
    results: Notification[];
  };
}

type NotificationCallback = (notifications: Notification[]) => void;

export class NotificationWebSocket {
  private ws: WebSocket | null = null;
  private notificationId: string;
  private onNotifications: NotificationCallback;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private onConnected?: () => void;
  private connectionAttempts = 0;
  private maxConnectionAttempts = 3;

  constructor(notificationId: string, onNotifications: NotificationCallback, onConnected?: () => void) {
    this.notificationId = notificationId;
    this.onNotifications = onNotifications;
    this.onConnected = onConnected;
    this.connect();
  }

  private connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      logWebSocket('WebSocket already connected, skipping connection attempt');
      return;
    }

    if (!this.notificationId) {
      logWebSocket('No notification ID available, skipping WebSocket connection');
      this.onNotifications([]);
      return;
    }
    
    // Get token from cookies
    const token = Cookies.get('accessToken');
    if (!token) {
      logWebSocket('No access token available, skipping WebSocket connection');
      this.onNotifications([]);
      return;
    }

    // Check if we've exceeded max connection attempts
    if (this.connectionAttempts >= this.maxConnectionAttempts) {
      logWebSocket('Max connection attempts reached, stopping reconnection');
      this.onNotifications([]);
      return;
    }
    
    this.connectionAttempts++;
    
    // Connect without token in URL - send it as a message after connection
    const url = `wss://cpchub.diu.edu.bd:8443/ws/notification/${this.notificationId}/?token=${token}`;
    
    logWebSocket('Attempting WebSocket connection...');
    logWebSocket('Notification ID:', this.notificationId);
    logWebSocket('WebSocket URL:', url);
    logWebSocket('Token available:', !!token);
    logWebSocket('Connection attempt:', this.connectionAttempts);
    
    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        logWebSocket('WebSocket connected successfully:', url);
        this.connectionAttempts = 0; // Reset connection attempts on successful connection
        this.onConnected?.();
      };

      this.ws.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          logNotification('Raw WebSocket message received:', raw);
          logNotification('Raw message type:', typeof raw);
          logNotification('Raw message keys:', Object.keys(raw || {}));

          // Support multiple possible structures
          let notifications: Notification[] = [];
          
          // Structure 1: raw.data.data.results (double nested)
          if (
            raw &&
            raw.success &&
            raw.data &&
            raw.data.data &&
            Array.isArray(raw.data.data.results)
          ) {
            logNotification('Found notifications in raw.data.data.results');
            notifications = raw.data.data.results;
          }
          // Structure 2: raw.data.results (single nested)
          else if (
            raw &&
            raw.success &&
            raw.data &&
            Array.isArray(raw.data.results)
          ) {
            logNotification('Found notifications in raw.data.results');
            notifications = raw.data.results;
          }
          // Structure 3: raw.results (direct)
          else if (
            raw &&
            Array.isArray(raw.results)
          ) {
            logNotification('Found notifications in raw.results');
            notifications = raw.results;
          }
          // Structure 4: raw is directly an array
          else if (
            Array.isArray(raw)
          ) {
            logNotification('Raw message is directly an array');
            notifications = raw;
          }
          // Structure 5: raw.data is directly an array
          else if (
            raw &&
            raw.data &&
            Array.isArray(raw.data)
          ) {
            logNotification('Found notifications in raw.data (array)');
            notifications = raw.data;
          }
          // Structure 6: raw.data.data is directly an array
          else if (
            raw &&
            raw.data &&
            raw.data.data &&
            Array.isArray(raw.data.data)
          ) {
            logNotification('Found notifications in raw.data.data (array)');
            notifications = raw.data.data;
          }
          // Structure 7: raw is a single notification object
          else if (
            raw &&
            typeof raw === 'object' &&
            !Array.isArray(raw) &&
            raw.id &&
            raw.message
          ) {
            logNotification('Raw message is a single notification object');
            notifications = [raw];
          }
          // Structure 8: raw.data is a single notification object
          else if (
            raw &&
            raw.data &&
            typeof raw.data === 'object' &&
            !Array.isArray(raw.data) &&
            raw.data.id &&
            raw.data.message
          ) {
            logNotification('Raw message data is a single notification object');
            notifications = [raw.data];
          }
          // Structure 9: raw.data.data is a single notification object
          else if (
            raw &&
            raw.data &&
            raw.data.data &&
            typeof raw.data.data === 'object' &&
            !Array.isArray(raw.data.data) &&
            raw.data.data.id &&
            raw.data.data.message
          ) {
            logNotification('Raw message data.data is a single notification object');
            notifications = [raw.data.data];
          }
          else {
            logNotification('No recognized notification structure found in:', raw);
            logNotification('Available paths checked:');
            logNotification('- raw.data.data.results:', raw?.data?.data?.results);
            logNotification('- raw.data.results:', raw?.data?.results);
            logNotification('- raw.results:', raw?.results);
            logNotification('- raw (array):', Array.isArray(raw));
            logNotification('- raw.data (array):', Array.isArray(raw?.data));
            logNotification('- raw.data.data (array):', Array.isArray(raw?.data?.data));
            logNotification('- raw (single object):', raw?.id && raw?.message);
            logNotification('- raw.data (single object):', raw?.data?.id && raw?.data?.message);
            logNotification('- raw.data.data (single object):', raw?.data?.data?.id && raw?.data?.data?.message);
          }

          // Validate notifications structure
          if (notifications.length > 0) {
            const firstNotification = notifications[0];
            logNotification('First notification structure:', {
              id: firstNotification.id,
              message_type: firstNotification.message_type,
              message: firstNotification.message,
              is_read: firstNotification.is_read,
              created_at: firstNotification.created_at,
              hasRequiredFields: !!(firstNotification.id && firstNotification.message)
            });
          }

          // Always call the callback, even with empty notifications
          logNotification('Final notifications processed:', notifications);
          this.onNotifications(notifications);
          
          if (notifications.length === 0) {
            logNotification('No notifications found in message. Raw message was:', raw);
          } else {
            logNotification(`Successfully processed ${notifications.length} notifications`);
          }
        } catch (err) {
          logError('Failed to parse notification message', err);
          logError('Raw message that failed to parse:', event.data);
          // Still call callback with empty array to update loading state
          this.onNotifications([]);
        }
      };

      this.ws.onclose = (event) => {
        logWebSocket('WebSocket connection closed:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        
        // Only reconnect if it wasn't a clean close
        if (!event.wasClean) {
          logWebSocket('Attempting to reconnect in 5 seconds...');
          this.reconnectTimeout = setTimeout(() => this.connect(), 5000);
        }
      };

      this.ws.onerror = (err: Event) => {
        logError('WebSocket connection error:', {
          error: err,
          readyState: this.ws?.readyState,
          url: url
        });
        
        // Don't log the raw error object to console to avoid noise
        // Only call callback with empty array to update loading state
        this.onNotifications([]);
        
        // Close the connection if it exists
        if (this.ws) {
          this.ws.close();
        }
      };
    } catch (err) {
      logError('Failed to create WebSocket connection', err);
      this.onNotifications([]);
    }
  }

  public disconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.ws?.close();
  }
}