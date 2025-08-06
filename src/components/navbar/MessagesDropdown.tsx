"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';
import { useConversations } from '@/hooks/useNotifications';
import { useAppSelector } from '@/hooks/useTypedSelector';
import { useRouter } from 'next/navigation';
import { useChatContext } from '@/components/ChatWebSocketProvider';
import { ChatMessage } from '@/services/chatWebSocket';

export default function MessagesDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { conversations } = useConversations();
  const user = useAppSelector((state) => state.user);
  const { setOnMessageSent } = useChatContext();

  // Set up message sent callback to update conversation list instantly
  useEffect(() => {
    const handleMessageSent = (message: ChatMessage) => {
      // Add null checks for the message object
      if (!message) {
        console.log('MessagesDropdown: Message sent callback received undefined message');
        return;
      }
      
      // When a message is sent, we could trigger a refresh of conversations
      // For now, this is a placeholder for when dropdown is re-enabled
      // Using setTimeout to defer any potential state updates outside of render cycle
      setTimeout(() => {
        console.log('MessagesDropdown: Message sent, conversation should update:', {
          text: message.text || 'No text',
          sender: message.sender_name || 'Unknown sender',
          timestamp: message.timestamp || 'No timestamp'
        });
      }, 0);
    };

    setOnMessageSent(handleMessageSent);

    // Cleanup function
    return () => {
      setOnMessageSent(undefined);
    };
  }, [setOnMessageSent]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  // Get user's conversations
  const getUserConversations = () => {
    if (!user?.username) return [];
    
    return conversations.filter(conversation => 
      conversation.freelancer_name === user.username || 
      conversation.client_name === user.username
    );
  };

  const userConversations = getUserConversations();
  const unreadCount = userConversations.reduce((total, conv) => total + conv.unread_count, 0);



  // Navigate to messages page
  const handleMessagesClick = () => {
    router.push('/messages');
  };

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        className="relative p-2 hover:bg-muted/50 transition-colors"
        onClick={handleMessagesClick}
        aria-label="Open messages"
      >
        <MessageCircle className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white border-0"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Commented out dropdown code for future implementation */}
      {/*
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-80 bg-popover border border-border shadow-xl rounded-2xl py-2 z-50"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-semibold text-lg">Messages</h3>
            <Badge variant="secondary" className="text-xs">
              {userConversations.length} conversations
            </Badge>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary"></div>
                <span className="ml-2 text-sm text-muted-foreground">Loading messages...</span>
              </div>
            ) : userConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <MessageSquare className="w-12 h-12 text-muted-foreground mb-3" />
                <h4 className="font-medium text-foreground mb-1">No messages yet</h4>
                <p className="text-sm text-muted-foreground text-center">
                  Start a conversation by visiting someone's profile and clicking "Send Message"
                </p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {userConversations.slice(0, 5).map((conversation) => {
                  if (!conversation || !conversation.id) return null;
                  
                  return (
                    <Card
                      key={conversation.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors border-0 shadow-none"
                      onClick={() => handleConversationClick(conversation.conversation_id, conversation)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <MessageAvatar 
                            username={getOtherPartyName(conversation)}
                            profilePicture={conversation.profile_picture || conversation.avatar}
                            size="md"
                          />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-sm truncate">
                                {getOtherPartyName(conversation)}
                              </h4>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {conversation.created_at ? formatDistanceToNow(new Date(conversation.created_at), { addSuffix: true }) : 'Recently'}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-xs text-muted-foreground mb-2">
                              {conversation.contract_title || 'No title'}
                            </p>
                            
                            <p className="text-sm text-muted-foreground truncate">
                              {formatLastMessage(conversation.last_message)}
                            </p>
                            
                            {conversation.unread_count > 0 && (
                              <div className="flex items-center justify-between mt-2">
                                <Badge className="text-xs bg-red-500 text-white border-0">
                                  {conversation.unread_count} new
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {userConversations.length > 0 && (
            <div className="border-t border-border px-4 py-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                asChild
              >
                <Link href="/messages" onClick={() => setIsOpen(false)}>
                  View All Messages
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
      */}

      {/* Commented out chat modal for future implementation */}
      {/*
      {selectedConversation && (
        <ChatModal
          isOpen={isChatOpen}
          onClose={handleCloseChat}
          roomName={selectedConversation}
          title={getOtherPartyName(selectedConversationData)}
          profilePicture={selectedConversationData?.profile_picture || selectedConversationData?.avatar}
        />
      )}
      */}
    </div>
  );
} 