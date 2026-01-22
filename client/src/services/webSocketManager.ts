import { logError, logWebSocket } from '@/utils/logger';

interface WebSocketMessage {
  type: string;
  data?: unknown;
  timestamp?: number;
}

interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private isManualClose = false;
  private messageQueue: WebSocketMessage[] = [];
  private statusCallbacks: Set<(isOnline: boolean) => void> = new Set();

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      ...config
    };
  }

  // Connect to WebSocket
  public connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    this.isManualClose = false;

    try {
      this.ws = new WebSocket(this.config.url);
      this.setupEventHandlers();
    } catch (error) {
      logError('WebSocket connection failed', { error, url: this.config.url });
      this.handleConnectionError();
    }
  }

  // Disconnect WebSocket
  public disconnect(): void {
    this.isManualClose = true;
    this.clearTimers();
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    
    this.notifyStatusChange(false);
  }

  // Send message
  public send(message: WebSocketMessage): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        const messageWithTimestamp = {
          ...message,
          timestamp: Date.now()
        };
        this.ws.send(JSON.stringify(messageWithTimestamp));
        logWebSocket('Message sent', { message: messageWithTimestamp });
        return true;
      } catch (error) {
        logError('Failed to send WebSocket message', { error, message });
        return false;
      }
    } else {
      // Queue message for when connection is restored
      this.messageQueue.push(message);
      logWebSocket('Message queued', { message, queueLength: this.messageQueue.length });
      return false;
    }
  }

  // Get current connection status
  public getStatus(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Subscribe to status changes
  public subscribeToStatus(callback: (isOnline: boolean) => void): () => void {
    this.statusCallbacks.add(callback);
    
    // Immediately call with current status
    callback(this.getStatus());
    
    // Return unsubscribe function
    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  // Setup WebSocket event handlers
  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      logWebSocket('WebSocket connected', { url: this.config.url });
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.notifyStatusChange(true);
      this.startHeartbeat();
      this.flushMessageQueue();
    };

    this.ws.onclose = (event) => {
      logWebSocket('WebSocket disconnected', { 
        code: event.code, 
        reason: event.reason,
        wasClean: event.wasClean 
      });
      
      this.isConnecting = false;
      this.stopHeartbeat();
      this.notifyStatusChange(false);

      if (!this.isManualClose && event.code !== 1000) {
        this.handleReconnection();
      }
    };

    this.ws.onerror = (error) => {
      logError('WebSocket error', { error, url: this.config.url });
      this.handleConnectionError();
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        logError('Failed to parse WebSocket message', { error, data: event.data });
      }
    };
  }

  // Handle incoming messages
  private handleMessage(message: unknown): void {
    logWebSocket('Message received', { message });
    
    // Type guard for message structure
    if (typeof message !== 'object' || message === null) {
      logWebSocket('Invalid message format', { message });
      return;
    }
    
    const messageObj = message as { type?: string };
    
    // Handle heartbeat response
    if (messageObj.type === 'pong') {
      this.resetHeartbeat();
      return;
    }

    // Handle other message types
    switch (messageObj.type) {
      case 'notification':
        this.handleNotification(message);
        break;
      case 'presence':
        this.handlePresence(message);
        break;
      default:
        logWebSocket('Unknown message type', { type: messageObj.type, message });
    }
  }

  // Handle notification messages
  private handleNotification(message: unknown): void {
    // Dispatch custom event for notification handling
    const event = new CustomEvent('websocket:notification', { 
      detail: message 
    });
    window.dispatchEvent(event);
  }

  // Handle presence messages
  private handlePresence(message: unknown): void {
    // Dispatch custom event for presence handling
    const event = new CustomEvent('websocket:presence', { 
      detail: message 
    });
    window.dispatchEvent(event);
  }

  // Handle connection errors
  private handleConnectionError(): void {
    this.isConnecting = false;
    this.notifyStatusChange(false);
    
    if (!this.isManualClose) {
      this.handleReconnection();
    }
  }

  // Handle reconnection logic
  private handleReconnection(): void {
    if (this.reconnectAttempts >= (this.config.maxReconnectAttempts || 5)) {
      logError('Max reconnection attempts reached', { 
        attempts: this.reconnectAttempts 
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = this.config.reconnectInterval || 3000;
    
    logWebSocket('Attempting reconnection', { 
      attempt: this.reconnectAttempts, 
      delay 
    });

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Start heartbeat
  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, this.config.heartbeatInterval || 30000);
  }

  // Stop heartbeat
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // Reset heartbeat timer
  private resetHeartbeat(): void {
    this.stopHeartbeat();
    this.startHeartbeat();
  }

  // Flush queued messages
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  // Notify status change to subscribers
  private notifyStatusChange(isOnline: boolean): void {
    this.statusCallbacks.forEach(callback => {
      try {
        callback(isOnline);
      } catch (error) {
        logError('Error in status callback', { error });
      }
    });
  }

  // Clear all timers
  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // Cleanup
  public destroy(): void {
    this.disconnect();
    this.statusCallbacks.clear();
    this.messageQueue = [];
    this.clearTimers();
  }
}

export default WebSocketManager; 