import Cookies from 'js-cookie';
import { buildChatWebSocketUrl } from '@/lib/websocketUrl';
import { logError, logWebSocket } from '@/utils/logger';
import WebSocketManager from './webSocketManager';

interface Message {
  id: number;
  text: string;
  sender_type: string;
  sender_name: string;
  timestamp: string;
  is_read: boolean;
  seen_list: Array<{
    username: string;
    seen_at: string;
  }>;
}



interface MessageCallback {
  (messages: Message[]): void;
}

interface TypingCallback {
  (isTyping: boolean, sender: string): void;
}

interface ConnectionCallback {
  (): void;
}

class MessageWebSocketService {
  private webSocketManager: WebSocketManager | null = null;
  private messageCallbacks: Set<MessageCallback> = new Set();
  private typingCallbacks: Set<TypingCallback> = new Set();
  private connectionCallbacks: Set<ConnectionCallback> = new Set();
  private currentRoomName: string | null = null;

  constructor() {
    // Don't initialize immediately - wait for room name
  }

  private initialize(roomName: string): void {
    try {
      const token = Cookies.get('accessToken');
      if (!token) {
        logError('No access token found for message WebSocket connection');
        return;
      }

      // Clean up existing connection if room name changed
      if (this.webSocketManager && this.currentRoomName !== roomName) {
        this.webSocketManager.destroy();
        this.webSocketManager = null;
      }

      const url = buildChatWebSocketUrl(roomName, token);

      // Create WebSocket manager
      this.webSocketManager = new WebSocketManager({
        url,
        reconnectInterval: 3000,
        maxReconnectAttempts: 5,
        heartbeatInterval: 30000,
      });

      this.currentRoomName = roomName;

      // Subscribe to status changes
      this.webSocketManager.subscribeToStatus((isOnline) => {
        if (isOnline) {
          this.notifyConnectionEstablished();
        }
      });

      // Listen for message events
      window.addEventListener('websocket:message', (event: Event) => {
        const customEvent = event as CustomEvent;
        this.handleMessage(customEvent.detail);
      });

      // Listen for typing events
      window.addEventListener('websocket:typing', (event: Event) => {
        const customEvent = event as CustomEvent;
        this.handleTyping(customEvent.detail);
      });

      // Connect automatically
      this.webSocketManager.connect();

      logWebSocket('Message WebSocket service initialized', { url, roomName });
    } catch (error) {
      logError('Failed to initialize message WebSocket service', { error, roomName });
    }
  }

  // Connect to a chat room
  public connectToRoom(roomName: string, onMessages: MessageCallback, onTyping: TypingCallback, onConnected: ConnectionCallback): () => void {
    // Initialize if not already done or if room name changed
    if (!this.webSocketManager || this.currentRoomName !== roomName) {
      this.initialize(roomName);
    }

    // Add callbacks
    this.messageCallbacks.add(onMessages);
    this.typingCallbacks.add(onTyping);
    this.connectionCallbacks.add(onConnected);

    // Return unsubscribe function
    return () => {
      this.messageCallbacks.delete(onMessages);
      this.typingCallbacks.delete(onTyping);
      this.connectionCallbacks.delete(onConnected);
    };
  }

  // Send a message
  public sendMessage(message: string): boolean {
    if (!this.webSocketManager) {
      logError('Message WebSocket manager not initialized');
      return false;
    }

    return this.webSocketManager.send({
      type: 'chat_message',
      data: {
        message,
        timestamp: Date.now()
      }
    });
  }

  // Send typing indicator
  public sendTypingIndicator(isTyping: boolean): boolean {
    if (!this.webSocketManager) {
      logError('Message WebSocket manager not initialized');
      return false;
    }

    return this.webSocketManager.send({
      type: 'typing_indicator',
      data: {
        is_typing: isTyping,
        timestamp: Date.now()
      }
    });
  }

  // Mark message as read
  public markAsRead(messageId: number): boolean {
    if (!this.webSocketManager) {
      logError('Message WebSocket manager not initialized');
      return false;
    }

    return this.webSocketManager.send({
      type: 'mark_read',
      data: {
        message_id: messageId,
        timestamp: Date.now()
      }
    });
  }

  // Get current connection status
  public getStatus(): boolean {
    return this.webSocketManager?.getStatus() || false;
  }

  // Disconnect
  public disconnect(): void {
    if (this.webSocketManager) {
      this.webSocketManager.disconnect();
    }
  }

  // Handle incoming messages
  private handleMessage(message: unknown): void {
    logWebSocket('Message received', { message });
    
    try {
      let messages: Message[] = [];
      
      if (Array.isArray(message)) {
        messages = message as Message[];
      } else if (typeof message === 'object' && message !== null && 'data' in message) {
        const messageObj = message as { data: unknown };
        if (Array.isArray(messageObj.data)) {
          messages = messageObj.data as Message[];
        } else {
          messages = [messageObj.data as Message];
        }
      } else {
        messages = [message as Message];
      }

      this.messageCallbacks.forEach(callback => {
        try {
          callback(messages);
        } catch (error) {
          logError('Error in message callback', { error });
        }
      });
    } catch (error) {
      logError('Error processing message', { error, message });
    }
  }

  // Handle typing indicators
  private handleTyping(typingData: unknown): void {
    logWebSocket('Typing indicator received', { typingData });
    
    try {
      const typingObj = typingData as { is_typing?: boolean; isTyping?: boolean; user_name?: string; sender?: string };
      const isTyping = typingObj.is_typing || typingObj.isTyping || false;
      const sender = typingObj.user_name || typingObj.sender || 'Unknown';
      
      this.typingCallbacks.forEach(callback => {
        try {
          callback(isTyping, sender);
        } catch (error) {
          logError('Error in typing callback', { error });
        }
      });
    } catch (error) {
      logError('Error processing typing indicator', { error, typingData });
    }
  }

  // Notify connection established
  private notifyConnectionEstablished(): void {
    logWebSocket('Message WebSocket connection established');
    
    this.connectionCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        logError('Error in connection callback', { error });
      }
    });
  }

  // Cleanup
  public destroy(): void {
    if (this.webSocketManager) {
      this.webSocketManager.destroy();
      this.webSocketManager = null;
    }
    
    this.messageCallbacks.clear();
    this.typingCallbacks.clear();
    this.connectionCallbacks.clear();
    this.currentRoomName = null;
    
    logWebSocket('Message WebSocket service destroyed');
  }
}

// Singleton instance
const messageWebSocketService = new MessageWebSocketService();

export default messageWebSocketService;
export type { Message, MessageCallback, TypingCallback, ConnectionCallback }; 