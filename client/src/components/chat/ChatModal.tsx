"use client";

import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import ChatInterface from './ChatInterface';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  title?: string;
  profilePicture?: string;
}

export default function ChatModal({ isOpen, onClose, roomName, title = "Chat", profilePicture }: ChatModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] max-h-[90vh] p-0 overflow-hidden bg-background border-0 shadow-2xl">
        <VisuallyHidden>
          <DialogTitle>Chat with {title}</DialogTitle>
        </VisuallyHidden>
        <div className="flex-1 h-full overflow-hidden">
          <ChatInterface roomName={roomName} title={title} profilePicture={profilePicture} />
        </div>
      </DialogContent>
    </Dialog>
  );
} 