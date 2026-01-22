import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWebSocketStatus } from '@/hooks/useWebSocketStatus';
import { useAppSelector } from '@/hooks/useTypedSelector';
import { Wifi, WifiOff, Send, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

interface WebSocketStatusProps {
  notificationId?: string;
  showTestControls?: boolean;
}

export const WebSocketStatus: React.FC<WebSocketStatusProps> = ({ 
  notificationId = 'default', 
  showTestControls = false 
}) => {
  const { isOnline, send, connect, disconnect, isConnecting } = useWebSocketStatus(notificationId);
  const user = useAppSelector((state) => state.user);
  const [lastMessage, setLastMessage] = useState<string>('');

  const handleTestPing = () => {
    const success = send({
      type: 'ping',
      data: { 
        user: user?.username,
        timestamp: Date.now()
      }
    });

    if (success) {
      setLastMessage('Ping sent successfully');
    } else {
      setLastMessage('Failed to send ping - not connected');
    }
  };

  const handleTestNotification = () => {
    const success = send({
      type: 'notification',
      data: {
        title: 'Test Notification',
        message: 'This is a test notification from WebSocket',
        user: user?.username,
        timestamp: Date.now()
      }
    });

    if (success) {
      setLastMessage('Test notification sent successfully');
    } else {
      setLastMessage('Failed to send notification - not connected');
    }
  };

  const handleTestPresence = () => {
    const success = send({
      type: 'presence',
      data: {
        user: user?.username,
        status: 'online',
        timestamp: Date.now()
      }
    });

    if (success) {
      setLastMessage('Presence update sent successfully');
    } else {
      setLastMessage('Failed to send presence update - not connected');
    }
  };

  const getStatusIcon = () => {
    if (isConnecting) {
      return <RefreshCw className="w-4 h-4 animate-spin text-yellow-500" />;
    }
    return isOnline ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <AlertCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getStatusText = () => {
    if (isConnecting) return 'Connecting...';
    return isOnline ? 'Connected' : 'Disconnected';
  };

  const getStatusColor = () => {
    if (isConnecting) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    return isOnline 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wifi className="w-5 h-5" />
          WebSocket Status
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium">{getStatusText()}</span>
          </div>
          <Badge className={getStatusColor()}>
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>

        {/* Connection Info */}
        <div className="text-sm text-muted-foreground space-y-1">
          <div>Notification ID: {notificationId}</div>
          <div>User: {user?.username || 'Not logged in'}</div>
          <div>Environment: {process.env.NODE_ENV}</div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={connect}
            disabled={isOnline || isConnecting}
            className="flex-1"
          >
            <Wifi className="w-4 h-4 mr-1" />
            Connect
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={disconnect}
            disabled={!isOnline}
            className="flex-1"
          >
            <WifiOff className="w-4 h-4 mr-1" />
            Disconnect
          </Button>
        </div>

        {/* Test Controls */}
        {showTestControls && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">Test Messages:</div>
            <div className="grid grid-cols-1 gap-2">
              <Button
                size="sm"
                onClick={handleTestPing}
                disabled={!isOnline}
                className="w-full"
              >
                <Send className="w-3 h-3 mr-1" />
                Send Ping
              </Button>
              <Button
                size="sm"
                onClick={handleTestNotification}
                disabled={!isOnline}
                className="w-full"
              >
                <Send className="w-3 h-3 mr-1" />
                Test Notification
              </Button>
              <Button
                size="sm"
                onClick={handleTestPresence}
                disabled={!isOnline}
                className="w-full"
              >
                <Send className="w-3 h-3 mr-1" />
                Test Presence
              </Button>
            </div>
          </div>
        )}

        {/* Last Message */}
        {lastMessage && (
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
            Last action: {lastMessage}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WebSocketStatus; 