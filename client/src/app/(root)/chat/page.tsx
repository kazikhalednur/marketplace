"use client";

import React from 'react';
import ChatInterface from '@/components/chat/ChatInterface';

export default function ChatPage() {
  // Static room name as specified
  const roomName = "E17BC782D6674758BE6D5BC920B1965B";

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Chat Room</h1>
        <ChatInterface roomName={roomName} />
      </div>
    </div>
  );
} 