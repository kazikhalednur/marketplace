# WebSocket Management System

This directory contains a comprehensive WebSocket management system that provides robust connection handling, automatic reconnection, and status monitoring for real-time communication.

## 🏗️ Architecture

### Core Components

1. **`webSocketManager.ts`** - Class-based WebSocket client with advanced features
2. **`useWebSocketStatus.ts`** - React hook for consuming WebSocket status
3. **`notificationWebSocket.ts`** - Specialized service for notification handling
4. **`WebSocketStatus.tsx`** - UI component for displaying connection status
5. **`WebSocketStatusDemo.tsx`** - Demo component showing integration

## 🚀 Features

### WebSocket Manager (`webSocketManager.ts`)
- ✅ **Automatic Reconnection**: Handles unexpected disconnects with configurable retry logic
- ✅ **Heartbeat System**: Ping/pong mechanism for connection health monitoring
- ✅ **Message Queuing**: Queues messages when offline, sends when reconnected
- ✅ **Status Callbacks**: Subscribe to connection status changes
- ✅ **Error Handling**: Comprehensive error logging and recovery
- ✅ **Environment Detection**: Automatically switches between `ws://` (dev) and `wss://` (prod)

### React Hook (`useWebSocketStatus.ts`)
- ✅ **Singleton Pattern**: Single WebSocket instance across the app
- ✅ **Status Monitoring**: Real-time connection status updates
- ✅ **Browser Events**: Listens to browser online/offline events
- ✅ **Message Sending**: Simple API for sending messages
- ✅ **Cleanup**: Proper cleanup on component unmount

### UI Components
- ✅ **Status Display**: Visual indicators for connection state
- ✅ **Test Controls**: Buttons for testing WebSocket functionality
- ✅ **Environment Info**: Shows connection details and configuration

## 📖 Usage

### Basic Usage

```tsx
import { useWebSocketStatus } from '@/hooks/useWebSocketStatus';

function MyComponent() {
  const { isOnline, send, connect, disconnect } = useWebSocketStatus('my-notification-id');

  const handleSendMessage = () => {
    send({
      type: 'chat',
      data: { message: 'Hello World!' }
    });
  };

  return (
    <div>
      <p>Status: {isOnline ? 'Online' : 'Offline'}</p>
      <button onClick={handleSendMessage} disabled={!isOnline}>
        Send Message
      </button>
    </div>
  );
}
```

### Using the Status Component

```tsx
import { WebSocketStatus } from '@/components/ui/WebSocketStatus';

function Dashboard() {
  return (
    <div>
      <WebSocketStatus 
        notificationId="dashboard-notifications"
        showTestControls={true}
      />
    </div>
  );
}
```

### Using the Demo Component

```tsx
import { WebSocketStatusDemo } from '@/components/ui/WebSocketStatusDemo';

function SettingsPage() {
  return (
    <div>
      <WebSocketStatusDemo />
    </div>
  );
}
```

## 🔧 Configuration

### WebSocket URL Generation

The system automatically generates WebSocket URLs based on the environment:

- **Development**: `ws://localhost:8000/ws/notification/{notificationId}/`
- **Production**: `wss://yourdomain.com/ws/notification/{notificationId}/`

### Configuration Options

```typescript
const webSocketManager = new WebSocketManager({
  url: 'ws://localhost:8000/ws/notification/my-id/',
  reconnectInterval: 3000,        // Reconnection delay in ms
  maxReconnectAttempts: 5,        // Maximum reconnection attempts
  heartbeatInterval: 30000,       // Heartbeat interval in ms
});
```

## 🔄 Integration with Existing Code

### Replacing Current WebSocket Usage

**Before (Old Pattern):**
```typescript
// Old notification WebSocket
const notificationWs = new NotificationWebSocket(
  notificationId, 
  handleNotifications, 
  onConnected
);
```

**After (New Pattern):**
```typescript
// New WebSocket hook
const { isOnline, send } = useWebSocketStatus(notificationId);

// Subscribe to notifications
useEffect(() => {
  const unsubscribe = notificationWebSocketService.subscribeToNotifications(handleNotifications);
  return unsubscribe;
}, []);
```

### Updating Chat WebSocket

The existing chat system can be enhanced with the new WebSocket manager:

```typescript
// In ChatWebSocketProvider.tsx
const { isOnline, send } = useWebSocketStatus('chat-room-' + roomName);

// Send messages
const sendMessage = (message: string) => {
  send({
    type: 'chat_message',
    data: {
      message,
      room: roomName,
      sender: user?.username
    }
  });
};
```

## 🎯 Benefits for Your Project

### 1. **Enhanced Reliability**
- Automatic reconnection prevents lost connections
- Message queuing ensures no messages are lost
- Heartbeat system detects connection issues early

### 2. **Better User Experience**
- Real-time status indicators
- Graceful handling of network issues
- Consistent behavior across environments

### 3. **Developer Experience**
- Simple React hooks API
- Comprehensive logging and debugging
- Type-safe message handling

### 4. **Production Ready**
- Environment-aware configuration
- Error handling and recovery
- Performance optimized with singleton pattern

## 🔍 Monitoring and Debugging

### Console Logging

The system provides detailed logging in development:

```
🔌 [WebSocket] WebSocket manager created { url: "ws://localhost:8000/ws/notification/demo/", notificationId: "demo" }
🔌 [WebSocket] WebSocket connected { url: "ws://localhost:8000/ws/notification/demo/" }
🔌 [WebSocket] Message sent { message: { type: "ping", timestamp: 1234567890 } }
```

### Status Monitoring

Use the `WebSocketStatus` component to monitor connection health in real-time.

## 🚨 Error Handling

The system handles various error scenarios:

- **Network Disconnection**: Automatic reconnection with exponential backoff
- **Server Errors**: Graceful degradation and retry logic
- **Invalid Messages**: Parsing errors are logged and handled
- **Browser Offline**: Detects and responds to browser online/offline events

## 📋 Migration Guide

### Step 1: Update Imports
```typescript
// Old
import { NotificationWebSocket } from '@/services/notificationWebSocket';

// New
import { useWebSocketStatus } from '@/hooks/useWebSocketStatus';
import notificationWebSocketService from '@/services/notificationWebSocket';
```

### Step 2: Replace WebSocket Usage
```typescript
// Old pattern
const ws = new NotificationWebSocket(id, callback);

// New pattern
const { isOnline, send } = useWebSocketStatus(id);
```

### Step 3: Update Event Handling
```typescript
// Old pattern
ws.onmessage = (event) => { /* handle message */ };

// New pattern
useEffect(() => {
  const unsubscribe = notificationWebSocketService.subscribeToNotifications(handleMessage);
  return unsubscribe;
}, []);
```

## 🎉 Getting Started

1. **Add the WebSocket Status component to your dashboard:**
```tsx
import { WebSocketStatus } from '@/components/ui/WebSocketStatus';

// In your dashboard component
<WebSocketStatus notificationId="dashboard" showTestControls={true} />
```

2. **Use the hook in your components:**
```tsx
import { useWebSocketStatus } from '@/hooks/useWebSocketStatus';

// In your component
const { isOnline, send } = useWebSocketStatus('my-notifications');
```

3. **Test the integration:**
```tsx
import { WebSocketStatusDemo } from '@/components/ui/WebSocketStatusDemo';

// Add to a settings or debug page
<WebSocketStatusDemo />
```

This WebSocket system provides a robust, production-ready solution for real-time communication in your React application! 🚀 