import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWebSocketStatus } from '@/hooks/useWebSocketStatus';
import { useAppSelector } from '@/hooks/useTypedSelector';
import { Wifi, WifiOff, Send, RefreshCw, AlertCircle, CheckCircle, Settings } from 'lucide-react';

export const WebSocketStatusDemo: React.FC = () => {
  const { isOnline, send, connect, disconnect, isConnecting } = useWebSocketStatus('demo-notification');
  const user = useAppSelector((state) => state.user);

  const handleTestMessage = () => {
    const success = send({
      type: 'test',
      data: {
        message: 'Hello from React WebSocket!',
        user: user?.username,
        timestamp: Date.now()
      }
    });

    if (success) {
      console.log('Test message sent successfully');
    } else {
      console.log('Failed to send test message');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            WebSocket Integration Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Display */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              {isConnecting ? (
                <RefreshCw className="w-5 h-5 animate-spin text-yellow-500" />
              ) : isOnline ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <div>
                <div className="font-medium">
                  {isConnecting ? 'Connecting...' : isOnline ? 'Connected' : 'Disconnected'}
                </div>
                <div className="text-sm text-muted-foreground">
                  WebSocket Status
                </div>
              </div>
            </div>
            <Badge variant="secondary" className={isOnline ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>

          {/* Connection Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">User:</span>
                <span className="font-medium">{user?.username || 'Not logged in'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Environment:</span>
                <span className="font-medium">{process.env.NODE_ENV}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Protocol:</span>
                <span className="font-medium">
                  {process.env.NODE_ENV === 'development' ? 'ws' : 'wss'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Host:</span>
                <span className="font-medium">
                  {process.env.NODE_ENV === 'development' ? 'localhost:8000' : window.location.host}
                </span>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={connect}
              disabled={isOnline || isConnecting}
              className="flex-1"
              variant="outline"
            >
              <Wifi className="w-4 h-4 mr-2" />
              Connect
            </Button>
            <Button
              onClick={disconnect}
              disabled={!isOnline}
              className="flex-1"
              variant="outline"
            >
              <WifiOff className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          </div>

          {/* Test Message */}
          <div className="space-y-2">
            <Button
              onClick={handleTestMessage}
              disabled={!isOnline}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Test Message
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Check browser console for message status
            </p>
          </div>

          {/* Features List */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-3">WebSocket Features:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Automatic reconnection on disconnect</li>
              <li>• Heartbeat/ping-pong for connection health</li>
              <li>• Message queuing when offline</li>
              <li>• Browser online/offline detection</li>
              <li>• Environment-aware URL generation</li>
              <li>• Comprehensive error handling</li>
              <li>• Singleton pattern for app-wide management</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebSocketStatusDemo; 