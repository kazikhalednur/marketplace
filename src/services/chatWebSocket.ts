import Cookies from 'js-cookie';
import { logWebSocket, logChat, logError } from '@/utils/logger';

export interface ChatMessage {
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

export interface TypingIndicator {
  type: 'typing_indicator';
  is_typing: boolean;
  user_type: string;
  user_name: string;
}

export interface ConversationInfo {
  type: 'conversation_info';
  conversation_id: string;
  status: string;
  user_type: 'client' | 'freelancer';
  user_name: string;
}

export interface ChatResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: ConversationInfo | ChatMessage[] | ChatMessage | TypingIndicator;
}

type MessageCallback = (messages: ChatMessage[]) => void;
type TypingCallback = (isTyping: boolean, sender: string) => void;
type ConnectionCallback = () => void;

export class ChatWebSocket {
  private ws: WebSocket | null = null;
  private roomName: string;
  private onMessages: MessageCallback;
  private onTyping: TypingCallback;
  private onConnected: ConnectionCallback;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private typingTimeout: ReturnType<typeof setTimeout> | null = null;
  private connectionAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private isConnecting: boolean = false;
  private messageAcknowledgmentTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    roomName: string, 
    onMessages: MessageCallback, 
    onTyping: TypingCallback,
    onConnected: ConnectionCallback
  ) {
    this.roomName = roomName;
    this.onMessages = onMessages;
    this.onTyping = onTyping;
    this.onConnected = onConnected;
    this.connect();
  }

  private connect() {
    // Prevent multiple simultaneous connection attempts
    if (this.isConnecting) {
      logWebSocket('Chat WebSocket connection already in progress, skipping...');
      return;
    }

    // Don't create multiple connections
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      logWebSocket('Chat WebSocket already connecting or connected, skipping...');
      return;
    }

    const token = Cookies.get('accessToken');
    
    // Check if we have the required data
    if (!token) {
      logWebSocket('No access token available, skipping chat WebSocket connection');
      return;
    }

    if (!this.roomName) {
      logWebSocket('No room name available, skipping chat WebSocket connection');
      return;
    }

    // Check if we've exceeded max reconnection attempts
    if (this.connectionAttempts >= this.maxReconnectAttempts) {
      logWebSocket('Max reconnection attempts reached, stopping connection attempts');
      return;
    }
    
    this.isConnecting = true;
    this.connectionAttempts++;
    
    // Connect to chat WebSocket
    const url = `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/ws/chat/${this.roomName}/?token=${token}`;
    
    logWebSocket('Attempting chat WebSocket connection...', {
      attempt: this.connectionAttempts,
      roomName: this.roomName,
      hasToken: !!token
    });
    
    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        logWebSocket('Chat WebSocket connected successfully');
        this.isConnecting = false;
        this.connectionAttempts = 0; // Reset attempts on successful connection
        this.onConnected();
      };

      this.ws.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          logChat('Raw chat WebSocket message received:', raw);
          logChat('Message structure analysis:', {
            hasSuccess: !!raw?.success,
            hasData: !!raw?.data,
            dataType: typeof raw?.data,
            dataKeys: raw?.data ? Object.keys(raw.data) : [],
            nestedDataKeys: raw?.data?.data ? Object.keys(raw.data.data) : [],
            isNotificationData: !!(raw?.data?.data?.results && Array.isArray(raw.data.data.results))
          });

          // Check if this is notification data (which we should ignore for chat)
          if (raw && raw.success && raw.data && raw.data.data && Array.isArray(raw.data.data.results)) {
            logChat('Received notification data through chat WebSocket, ignoring for chat functionality');
            return;
          }

          if (raw && raw.success && raw.data) {
            if (raw.data.type === 'conversation_info') {
              logChat('Conversation info received:', raw.data);
            } else if (raw.data.type === 'message' && Array.isArray(raw.data.data)) {
              const messages = raw.data.data;
              logChat('Messages received:', messages);
              this.onMessages(messages);
            } else if (raw.data.type === 'typing_indicator') {
              // Handle typing indicator
              const isTyping = raw.data.is_typing || false;
              const sender = raw.data.user_name || '';
              logChat('Typing indicator:', { isTyping, sender });
              this.onTyping(isTyping, sender);
            } else if (raw.data.type === 'message' && !Array.isArray(raw.data.data)) {
              // Single message received
              const message = raw.data.data;
              logChat('Single message received:', message);
              this.onMessages([message]);
            } else {
              logChat('Unknown message type received:', raw.data);
            }
          } else {
            logChat('Message does not match expected chat format:', raw);
          }
        } catch (err) {
          logError('Failed to parse chat message', err);
        }
      };

      this.ws.onclose = (event) => {
        logWebSocket('Chat WebSocket connection closed:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        
        this.isConnecting = false;
        
        // Only attempt reconnection if we haven't exceeded max attempts
        if (this.connectionAttempts < this.maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, this.connectionAttempts), 30000); // Exponential backoff, max 30s
          logWebSocket(`Scheduling reconnection attempt ${this.connectionAttempts + 1} in ${delay}ms`);
          this.reconnectTimeout = setTimeout(() => this.connect(), delay);
        } else {
          logWebSocket('Max reconnection attempts reached, not attempting to reconnect');
        }
      };

      this.ws.onerror = (err: Event) => {
        logWebSocket('Chat WebSocket connection error occurred', {
          error: err,
          attempt: this.connectionAttempts,
          maxAttempts: this.maxReconnectAttempts
        });
        
        // Don't log as error in development to reduce console noise
        if (process.env.NODE_ENV === 'production') {
          logError('Chat WebSocket connection failed', err);
        }
        
        this.isConnecting = false;
        
        // Close the connection to trigger onclose and reconnection logic
        if (this.ws) {
          this.ws.close();
        }
      };
    } catch (err) {
      logError('Failed to create chat WebSocket connection', err);
      this.isConnecting = false;
      
      // Schedule reconnection attempt
      if (this.connectionAttempts < this.maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, this.connectionAttempts), 30000);
        logWebSocket(`Scheduling reconnection attempt ${this.connectionAttempts + 1} in ${delay}ms after creation error`);
        this.reconnectTimeout = setTimeout(() => this.connect(), delay);
      }
    }
  }

  public sendMessage(message: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const messageData = {
        type: "message",
        text: message
      };
      this.ws.send(JSON.stringify(messageData));
      logChat('Message sent:', messageData);
      logChat('WebSocket state when sending:', this.ws.readyState);
      logChat('Room name:', this.roomName);
      
      // Return a promise to track message status
      return new Promise<boolean>((resolve) => {
        // Set a timeout to assume message was sent if no acknowledgment
        const timeout = setTimeout(() => {
          logChat('Message sent (timeout fallback)');
          resolve(true);
        }, 5000);
        
        // Store the timeout reference for cleanup
        this.messageAcknowledgmentTimeout = timeout;
      });
    } else {
      logWebSocket('Cannot send message: WebSocket not connected');
      logWebSocket('WebSocket state:', this.ws?.readyState);
      logWebSocket('Room name:', this.roomName);
      return Promise.resolve(false);
    }
  }

  public sendTypingIndicator(isTyping: boolean) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const typingData = {
        type: "typing",
        is_typing: isTyping
      };
      this.ws.send(JSON.stringify(typingData));
      logChat('Typing indicator sent:', typingData);
    }
  }

  public markMessageAsSeen(messageId: number, conversationId: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const seenData = {
        type: "mark_seen",
        message_id: messageId,
        conversation_id: conversationId
      };
      this.ws.send(JSON.stringify(seenData));
      logChat('Mark as seen sent:', seenData);
    }
  }

  public readMessage(messageId: number, conversationId: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const readData = {
        type: "mark_read",
        message_id: messageId,
        conversation_id: conversationId
      };
      this.ws.send(JSON.stringify(readData));
      logChat('Read message sent:', readData);
    }
  }

  public disconnect() {
    // Clear any pending reconnection attempts
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }
    
    if (this.messageAcknowledgmentTimeout) {
      clearTimeout(this.messageAcknowledgmentTimeout);
      this.messageAcknowledgmentTimeout = null;
    }
    
    // Reset connection state
    this.isConnecting = false;
    this.connectionAttempts = 0;
    
    // Close WebSocket connection
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    logWebSocket('Chat WebSocket disconnected');
  }

  public getConnectionStatus() {
    if (!this.ws) return 'disconnected';
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'disconnected';
    }
  }

  // Method to fetch all messages for a conversation
  // Note: The server doesn't support fetching historical messages via WebSocket
  // This method returns an empty array as a fallback
  public async fetchMessages(): Promise<ChatMessage[]> {
    logWebSocket('Fetch messages not supported by server, returning empty array');
    return [];
  }
} 