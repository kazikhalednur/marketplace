"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import ChatModal from './ChatModal';
import { useConversations } from '@/hooks/useNotifications';

interface SendMessageButtonProps {
  username: string;
  profilePicture?: string;
}

export default function SendMessageButton({ username, profilePicture }: SendMessageButtonProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { getConversationId, isLoading } = useConversations();
  const conversationId = getConversationId(username);

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  return (
    <>
      <Button
        onClick={handleOpenChat}
        disabled={isLoading || !conversationId}
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Send Message
      </Button>
      
      {conversationId && (
        <ChatModal
          isOpen={isChatOpen}
          onClose={handleCloseChat}
          roomName={conversationId}
          title={username}
          profilePicture={profilePicture}
        />
      )}
    </>
  );
} 