"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Volume2, Play } from 'lucide-react';
import { testNotificationAudio, getNotificationAudioState } from '@/utils/notificationSound';

interface AudioNotificationSetupProps {
  onClose?: () => void;
}

export default function AudioNotificationSetup({ onClose }: AudioNotificationSetupProps) {
  const [audioState, setAudioState] = useState({
    isInitialized: false,
    userInteracted: false,
    audioContextState: 'not-available'
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Only run on client side
    setIsClient(true);
    
    // Update state periodically
    const interval = setInterval(() => {
      if (typeof window !== 'undefined') {
        setAudioState(getNotificationAudioState());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleTestAudio = async () => {
    if (!isClient) return;
    
    setIsTesting(true);
    setTestResult('idle');
    
    try {
      const success = await testNotificationAudio();
      setTestResult(success ? 'success' : 'error');
    } catch (error) {
      console.error('Audio test failed:', error);
      setTestResult('error');
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusColor = () => {
    if (audioState.audioContextState === 'running') return 'bg-green-500';
    if (audioState.audioContextState === 'suspended') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusText = () => {
    if (!isClient) return 'Loading...';
    if (audioState.audioContextState === 'running') return 'Audio Ready';
    if (audioState.audioContextState === 'suspended') return 'Needs User Interaction';
    return 'Audio Not Available';
  };

  if (!isClient) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Audio Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Loading audio system...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Audio Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status:</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            <Badge variant="secondary" className="text-xs">
              {getStatusText()}
            </Badge>
          </div>
        </div>

        {/* User Interaction Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">User Interaction:</span>
          <Badge className={`text-xs ${audioState.userInteracted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {audioState.userInteracted ? 'Detected' : 'Required'}
          </Badge>
        </div>

        {/* Instructions */}
        <div className="text-sm text-muted-foreground space-y-2">
          <p>To enable audio notifications:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Click anywhere on the page</li>
            <li>Scroll or interact with the website</li>
            <li>Test the sound using the button below</li>
          </ul>
        </div>

        {/* Test Button */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleTestAudio}
            disabled={isTesting}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            {isTesting ? (
              <>
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                Testing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Test Sound
              </>
            )}
          </Button>
          
          {testResult === 'success' && (
            <Badge className="text-xs bg-green-500 text-white border-0">
              ✓ Success
            </Badge>
          )}
          {testResult === 'error' && (
            <Badge className="text-xs bg-red-500 text-white border-0">
              ✗ Failed
            </Badge>
          )}
        </div>

        {/* Troubleshooting */}
        {testResult === 'error' && (
          <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
            <p className="font-medium mb-1">Troubleshooting:</p>
            <ul className="space-y-1">
              <li>• Make sure your device volume is on</li>
              <li>• Try clicking on the page first</li>
              <li>• Check if your browser allows audio</li>
              <li>• Refresh the page and try again</li>
              <li>• Try a different browser</li>
            </ul>
          </div>
        )}

        {/* Close Button */}
        {onClose && (
          <Button onClick={onClose} variant="ghost" size="sm" className="w-full">
            Close
          </Button>
        )}
      </CardContent>
    </Card>
  );
} 