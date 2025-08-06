"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Plus, Mail, MessageSquare } from 'lucide-react';
import { useConversations } from '@/hooks/useNotifications';
import { useAppSelector } from '@/hooks/useTypedSelector';
import { formatDistanceToNow } from 'date-fns';
import { ChatModal, MessageAvatar } from '@/components/chat';
import { useChatContext } from '@/components/ChatWebSocketProvider';
import { ChatMessage } from '@/services/chatWebSocket';
import { Conversation } from '@/features/api/apiSlice';

// Enhanced conversation interface for display
interface EnhancedConversation extends Conversation {
  display_name?: string;
  profile_name?: string;
  other_party?: string;
  last_message_timestamp?: string;
  is_last_message_from_user?: boolean;
  unique_id?: string;
  profile_picture?: string;
}

export default function MessagesPage() {
  const { conversations, isLoading, error } = useConversations();
  const user = useAppSelector((state) => state.user);
  const { messages: currentChatMessages, setOnMessageSent, connectToRoom } = useChatContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedConversationData, setSelectedConversationData] = useState<EnhancedConversation | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [conversationMessages, setConversationMessages] = useState<Map<string, ChatMessage[]>>(new Map());
  
  const selectedConversationRef = useRef<string | null>(null);
  
  // State to trigger conversation list updates
  const [conversationUpdateTrigger, setConversationUpdateTrigger] = useState(0);

  // Update refs when selectedConversation changes
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // Load messages for all conversations (now just initialize empty arrays)
  const loadConversationMessages = useCallback(async (conversationId: string) => {
    if (!user?.username || !conversations.length) return [];

    console.log(`📥 Initializing messages for conversation: ${conversationId}`);
    
    // Initialize with empty array since server doesn't support fetching historical messages
    const messages: ChatMessage[] = [];
    
    setConversationMessages(prev => {
      const updated = new Map(prev);
      updated.set(conversationId, messages);
      console.log(`📋 Updated conversation messages Map for ${conversationId}:`, messages.length, 'messages');
      return updated;
    });
    
    // Force conversation list update after initializing messages
    setConversationUpdateTrigger(prev => {
      console.log(`🔄 Triggering conversation list update after initializing messages (${prev + 1}) for conversation: ${conversationId}`);
      return prev + 1;
    });
    
    return messages;
  }, [user?.username, conversations.length]);

  // Set current user when component mounts
  useEffect(() => {
    if (user?.username && conversations.length > 0) {
      console.log('🚀 Component mounted, initializing conversation messages for all conversations');
      
      // Initialize conversation messages for all conversations
      conversations.forEach(async (conversation) => {
        if (conversation.conversation_id) {
          try {
            await loadConversationMessages(conversation.conversation_id);
          } catch (error) {
            console.log(`❌ Failed to load messages for conversation ${conversation.conversation_id}:`, error);
          }
        }
      });
      
      // Force initial conversation list update
      setConversationUpdateTrigger(prev => {
        console.log(`🔄 Initial conversation list update trigger (${prev + 1})`);
        return prev + 1;
      });
    }
  }, [user?.username, conversations, loadConversationMessages]);

  // Helper function to find which conversation a message belongs to
  const findConversationForMessage = useCallback((message: ChatMessage): string | null => {
    if (!user?.username || !conversations.length) {
      console.log('❌ Cannot find conversation: missing user or conversations');
      return null;
    }

    console.log(`🔍 Finding conversation for message from ${message.sender_name} (current user: ${user.username})`);

    // If this is a message sent by the current user, use the selected conversation
    if (message.sender_name === user.username) {
      console.log(`✅ Message is from current user, using selected conversation: ${selectedConversationRef.current}`);
      return selectedConversationRef.current;
    }

    // If this is a message received from another user, find their conversation
    for (const conversation of conversations) {
      const otherParty = conversation.freelancer_name === user.username 
        ? conversation.client_name 
        : conversation.freelancer_name;
      
      if (otherParty === message.sender_name) {
        console.log(`✅ Found conversation for received message: ${conversation.conversation_id} from ${message.sender_name}`);
        return conversation.conversation_id;
      }
    }

    // If no exact match found, try to find by conversation participants
    for (const conversation of conversations) {
      if (conversation.freelancer_name === message.sender_name || 
          conversation.client_name === message.sender_name) {
        console.log(`✅ Found conversation by participant match: ${conversation.conversation_id} for ${message.sender_name}`);
        return conversation.conversation_id;
      }
    }

    console.log(`❌ No conversation found for message from: ${message.sender_name}`);
    console.log('Available conversations:', conversations.map(c => ({
      id: c.conversation_id,
      client: c.client_name,
      freelancer: c.freelancer_name
    })));
    return selectedConversationRef.current; // Fallback to selected conversation
  }, [user?.username, conversations, selectedConversationRef]);

  // Create global WebSocket connection for all conversations
  useEffect(() => {
    if (user?.username) {
      console.log('🌐 Creating global WebSocket connection for real-time updates');
      
      // Connect to a global room that receives all messages for this user
      const globalRoomName = `global_${user.username}`;
      connectToRoom(globalRoomName);
      
      console.log(`🌐 Connected to global room: ${globalRoomName} for real-time updates`);
      
      // Set up a global message handler that processes all incoming messages
      const handleGlobalMessage = (message: ChatMessage) => {
        // Add null checks for the message object
        if (!message) {
          console.log('❌ Global message handler received undefined message');
          return;
        }

        // Additional null checks for message properties
        if (!message.text || !message.sender_name) {
          console.log('❌ Global message handler received invalid message:', message);
          return;
        }

        console.log('🌐 Global WebSocket message received:', {
          text: message.text,
          sender: message.sender_name,
          timestamp: message.timestamp,
          isOwnMessage: message.sender_name === user?.username
        });
        
        // Process the message immediately for conversation list update
        const targetConversationId = findConversationForMessage(message);
        
        if (targetConversationId) {
          console.log(`✅ Global message belongs to conversation: ${targetConversationId}`);
          
          // Update conversation messages immediately
          setConversationMessages(prev => {
            const updated = new Map(prev);
            const currentMessages = updated.get(targetConversationId) || [];
            
            // Check for duplicates
            const messageExists = currentMessages.some(existingMsg => 
              existingMsg.id === message.id || 
              (existingMsg.text === message.text && existingMsg.timestamp === message.timestamp)
            );
            
            if (!messageExists) {
              console.log(`➕ Adding global message to conversation ${targetConversationId}:`, message.text);
              updated.set(targetConversationId, [...currentMessages, message]);
              
              // Force immediate conversation list update
              setConversationUpdateTrigger(prev => {
                console.log(`🔄 Global message triggered conversation list update (${prev + 1})`);
                return prev + 1;
              });
            } else {
              console.log(`⏭️ Global message already exists in conversation ${targetConversationId}, skipping`);
            }
            
            return updated;
          });
        } else {
          console.log('❌ Could not determine conversation for global message:', {
            messageText: message.text,
            sender: message.sender_name,
            messageId: message.id,
            availableConversations: conversations.map(c => ({
              id: c.conversation_id,
              client: c.client_name,
              freelancer: c.freelancer_name
            }))
          });
        }
      };
      
      // Set up the global message handler
      setOnMessageSent(handleGlobalMessage);
    }
  }, [user?.username, connectToRoom, setOnMessageSent, conversations, findConversationForMessage]);

  // Load messages for all conversations in background
  useEffect(() => {
    if (user?.username && conversations.length > 0) {
      console.log('📥 Starting background loading for all conversations:', conversations.length);
      
      // Initialize conversation messages for all conversations
      conversations.forEach(async (conversation) => {
        if (conversation.conversation_id) {
          try {
            console.log(`📥 Loading messages for conversation: ${conversation.conversation_id}`);
            const messages = await loadConversationMessages(conversation.conversation_id);
            if (messages && messages.length > 0) {
              console.log(`✅ Loaded ${messages.length} messages for conversation ${conversation.conversation_id}`);
              // The loadConversationMessages function now handles the trigger internally
            } else {
              console.log(`⚠️ No messages loaded for conversation ${conversation.conversation_id}`);
              // Still trigger update even if no messages to refresh the list
              setConversationUpdateTrigger(prev => {
                console.log(`🔄 Triggering update for empty conversation (${prev + 1}): ${conversation.conversation_id}`);
                return prev + 1;
              });
            }
          } catch (error) {
            console.log(`❌ Failed to load messages for conversation ${conversation.conversation_id}:`, error);
            // Trigger update even on error to refresh the list
            setConversationUpdateTrigger(prev => {
              console.log(`🔄 Triggering update after error (${prev + 1}): ${conversation.conversation_id}`);
              return prev + 1;
            });
          }
        }
      });
    }
  }, [user?.username, conversations, loadConversationMessages]);

  // Real-time update: When current chat messages change, update the conversation messages
  useEffect(() => {
    if (selectedConversation && currentChatMessages.length > 0) {
      setConversationMessages(prev => {
        const updated = new Map(prev);
        updated.set(selectedConversation, currentChatMessages);
        return updated;
      });
    }
  }, [currentChatMessages, selectedConversation]);

  // Ensure WebSocket connections for all conversations
  useEffect(() => {
    if (conversations.length > 0 && user?.username) {
      console.log('🔌 Setting up WebSocket connections for all conversations:', conversations.length);
      
      // Connect to all conversations to ensure real-time updates
      conversations.forEach(conversation => {
        if (conversation.conversation_id) {
          console.log(`🔌 Ensuring WebSocket connection for conversation: ${conversation.conversation_id}`);
          // The ChatWebSocketProvider will handle the connection when needed
        }
      });
    }
  }, [conversations, user?.username]);

  // Force conversation list updates when conversationMessages changes
  useEffect(() => {
    console.log(`📋 Conversation messages Map changed, size: ${conversationMessages.size}`);
    console.log(`📋 Conversations in Map:`, Array.from(conversationMessages.keys()));
    
    // Force conversation list update when messages are loaded
    setConversationUpdateTrigger(prev => {
      console.log(`🔄 Triggering update due to conversationMessages change (${prev + 1})`);
      return prev + 1;
    });
  }, [conversationMessages]);

  // Force conversation list updates when messages change
  useEffect(() => {
    if (conversationUpdateTrigger > 0) {
      console.log(`🔄 Conversation update trigger activated (${conversationUpdateTrigger}), forcing conversation list refresh`);
      console.log(`🔄 Current conversation messages Map size: ${conversationMessages.size}`);
      // The getUniqueProfiles function will re-compute due to the trigger
      // This ensures the conversation list updates immediately
    }
  }, [conversationUpdateTrigger, conversationMessages.size]);

  // Debug logging for conversations
  console.log('🔍 MessagesPage Debug:', {
    user: user?.username,
    isLoading,
    error,
    conversationsCount: conversations?.length || 0,
    conversations: conversations,
    hasUser: !!user,
    userNotificationId: user?.notification_id
  });

  // Show loading state only if we have a user and the API call is still loading
  const shouldShowLoading = isLoading && user?.username;

  // Show error state if there's an error
  if (error) {
    console.error('❌ Conversations API error:', error);
  }

  // If no user, show a simple message
  if (!user?.username) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Please log in to view messages
              </h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to format username to full name
  const formatUsernameToFullName = (username: string) => {
    if (!username) return 'Unknown User';
    
    // If it's already a full name (contains space), return as is
    if (username.includes(' ')) {
      return username;
    }
    
    // Convert username to title case (e.g., "john_doe" -> "John Doe")
    return username
      .replace(/[_-]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Helper functions - defined before use
  const getOtherPartyName = (conversation: EnhancedConversation) => {
    if (!user?.username) return 'Unknown User';
    
    // Use the other_party field if available
    if (conversation.other_party) {
      return formatUsernameToFullName(conversation.other_party);
    }
    
    // Fallback to original logic
    const otherParty = conversation.freelancer_name === user.username 
      ? conversation.client_name 
      : conversation.freelancer_name;
    
    return formatUsernameToFullName(otherParty);
  };

  const formatLastMessage = (lastMessage: string | null, isOwnMessage: boolean = false) => {
    if (!lastMessage) return null;
    
    // Handle case where lastMessage might be an object
    if (typeof lastMessage === 'object') {
      return null;
    }
    
    // Ensure it's a string
    const messageText = String(lastMessage);
    
    // If message is empty or just whitespace
    if (!messageText.trim()) {
      return null;
    }
    
    const truncatedMessage = messageText.length > 60 ? `${messageText.substring(0, 60)}...` : messageText;
    
    // Add "You: " prefix if it's the user's own message
    if (isOwnMessage) {
      return `You: ${truncatedMessage}`;
    }
    
    return truncatedMessage;
  };

  // Get the actual last message from WebSocket data
  const getLastMessageForConversation = (conversationId: string) => {
    const messages = conversationMessages.get(conversationId);
    console.log(`🔍 Getting last message for conversation ${conversationId}:`, {
      hasMessages: !!messages,
      messageCount: messages?.length || 0,
      lastMessage: messages?.[messages.length - 1]?.text
    });
    
    if (!messages || messages.length === 0) {
      console.log(`❌ No messages found for conversation ${conversationId}`);
      return null;
    }

    const lastMessage = messages[messages.length - 1];
    
    // Add null checks for lastMessage and its properties
    if (!lastMessage || !lastMessage.sender_name) {
      console.log(`❌ Invalid last message for conversation ${conversationId}:`, lastMessage);
      return null;
    }
    
    const isOwnMessage = lastMessage.sender_name === user?.username;
    
    console.log(`✅ Found last message for conversation ${conversationId}:`, {
      text: lastMessage.text,
      sender: lastMessage.sender_name,
      timestamp: lastMessage.timestamp,
      isOwnMessage
    });
    
    return {
      text: lastMessage.text,
      timestamp: lastMessage.timestamp,
      isOwnMessage
    };
  };

  // Get unique profiles that have sent messages to the current user
  const getUniqueProfiles = () => {
    // Force re-computation when conversationUpdateTrigger changes
    // This ensures the conversation list updates immediately when WebSocket responses are received
    const trigger = conversationUpdateTrigger; // Use the trigger to force re-computation
    
    console.log(`📋 Computing unique profiles (trigger: ${trigger})`);
    console.log(`📋 Conversation messages Map size: ${conversationMessages.size}`);
    
    if (!user?.username) return [];
    
    // If conversations is undefined or null, return empty array
    if (!conversations) {
      console.log('📋 No conversations data available');
      return [];
    }
    
    // Get all conversations where user is involved
    const allUserConversations = conversations.filter(conversation => 
      conversation.freelancer_name === user.username || 
      conversation.client_name === user.username
    );

    console.log(`📋 Found ${allUserConversations.length} conversations for user ${user.username}`);

    // Create a map to track unique profiles and their latest message
    const uniqueProfiles = new Map<string, EnhancedConversation>();
    
    allUserConversations.forEach((conversation) => {
      // Determine the other party (not the current user)
      const otherParty = conversation.freelancer_name === user.username 
        ? conversation.client_name 
        : conversation.freelancer_name;
      
      // Skip if other party is the same as current user (self-conversation)
      if (otherParty === user.username) {
        return;
      }
      
      // Skip if other party is empty or null
      if (!otherParty) {
        return;
      }
      
      // Include all conversations, even if no last_message (for new conversations)
      const currentMessageTime = conversation.created_at;
      const existingProfile = uniqueProfiles.get(otherParty);
      const existingMessageTime = existingProfile?.created_at;
      
      // Keep the most recent conversation for each unique profile
      if (!existingProfile || new Date(currentMessageTime) > new Date(existingMessageTime || '')) {
        // Get the actual last message from WebSocket data for this specific conversation
        const lastMessageData = getLastMessageForConversation(conversation.conversation_id);
        
        // Debug: Log which conversation is being processed
        console.log(`📋 Processing conversation ${conversation.conversation_id} for ${otherParty}:`, {
          lastMessage: lastMessageData?.text,
          timestamp: lastMessageData?.timestamp,
          isOwnMessage: lastMessageData?.isOwnMessage,
          trigger: trigger, // Log the trigger to show when updates happen
          hasWebSocketData: !!lastMessageData,
          apiLastMessage: conversation.last_message,
          conversationMessagesSize: conversationMessages.size,
          hasMessagesInMap: conversationMessages.has(conversation.conversation_id)
        });
        
        // Prioritize WebSocket data over API data for the most recent messages
        let lastMessageText = null;
        let lastMessageTimestamp = null;
        let isLastMessageFromUser = false;
        
        if (lastMessageData?.text) {
          // Use WebSocket data if available (most recent)
          lastMessageText = lastMessageData.text;
          lastMessageTimestamp = lastMessageData.timestamp;
          isLastMessageFromUser = lastMessageData.isOwnMessage;
          console.log(`✅ Using WebSocket data for ${otherParty}: ${lastMessageText}`);
        } else if (conversation.last_message) {
          // Fall back to API data if WebSocket data not available
          lastMessageText = conversation.last_message;
          lastMessageTimestamp = conversation.created_at;
          isLastMessageFromUser = false; // API doesn't provide this info
          console.log(`📋 Using API data for ${otherParty}: ${lastMessageText}`);
        } else {
          // No message data available
          console.log(`❌ No message data available for ${otherParty}`);
        }
        
        uniqueProfiles.set(otherParty, {
          ...conversation,
          display_name: formatUsernameToFullName(otherParty),
          profile_name: otherParty,
          other_party: otherParty,
          last_message: lastMessageText || null,
          last_message_timestamp: lastMessageTimestamp || undefined,
          is_last_message_from_user: isLastMessageFromUser,
          unique_id: `${otherParty}_${conversation.conversation_id || conversation.id}`
        });
      }
    });
    
    // Sort by most recent conversation first
    const sortedProfiles = Array.from(uniqueProfiles.values()).sort((a, b) => {
      const timeA = a.last_message_timestamp ? new Date(a.last_message_timestamp).getTime() : new Date(a.created_at).getTime();
      const timeB = b.last_message_timestamp ? new Date(b.last_message_timestamp).getTime() : new Date(b.created_at).getTime();
      return timeB - timeA;
    });
    
    console.log(`📋 Returning ${sortedProfiles.length} unique profiles`);
    return sortedProfiles;
  };

  // Use conversationUpdateTrigger to force re-render when new messages are received
  const uniqueProfiles = getUniqueProfiles();
  const filteredProfiles = uniqueProfiles.filter(profile =>
    profile.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.profile_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConversationClick = (conversationId: string, conversationData: EnhancedConversation) => {
    console.log(`💬 Opening conversation: ${conversationId} (${conversationData.conversation_id})`);
    
    setSelectedConversation(conversationId);
    setSelectedConversationData(conversationData);
    setIsChatOpen(true);
    
    // Connect to the specific conversation's WebSocket room
    if (conversationData.conversation_id) {
      console.log(`🔌 Connecting to conversation WebSocket room: ${conversationData.conversation_id}`);
      connectToRoom(conversationData.conversation_id);
    }
  };

  const handleCloseChat = () => {
    console.log('❌ Closing chat modal');
    setIsChatOpen(false);
    setSelectedConversation(null);
    setSelectedConversationData(null);
    
    // Reconnect to global room when closing chat
    if (user?.username) {
      const globalRoomName = `global_${user.username}`;
      console.log(`🔌 Reconnecting to global room: ${globalRoomName}`);
      connectToRoom(globalRoomName);
    }
  };

  const totalUnreadCount = uniqueProfiles.reduce((total, profile) => total + (profile.unread_count || 0), 0);

  if (shouldShowLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Messages</h1>
                  {totalUnreadCount > 0 && (
                    <p className="text-muted-foreground flex items-center gap-2 mt-2">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        {totalUnreadCount} unread
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="grid gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Messages</h1>
                {totalUnreadCount > 0 && (
                  <p className="text-muted-foreground flex items-center gap-2 mt-2">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      {totalUnreadCount} unread
                    </span>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Chat
                </Button>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="space-y-2">
            {filteredProfiles.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {searchTerm ? 'No conversations found' : 'No conversations yet'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  {searchTerm 
                    ? 'Try adjusting your search terms or start a new conversation.'
                    : 'Start messaging with other users to see your conversations here.'
                  }
                </p>
              </div>
            ) : (
              filteredProfiles.map((profile) => {
                const uniqueKey = profile.unique_id || `${profile.profile_name}_${profile.conversation_id}`;
                const hasUnreadMessages = (profile.unread_count || 0) > 0;
                const otherPartyName = profile.display_name || getOtherPartyName(profile);
                const lastMessageTime = profile.last_message_timestamp || profile.created_at;
                const lastMessage = profile.last_message ? formatLastMessage(profile.last_message, profile.is_last_message_from_user) : null;
                const isLoading = false; // Removed loadingMessages.has(profile.conversation_id)

                return (
                  <Card 
                    key={uniqueKey}
                    className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.01] overflow-hidden border-0 shadow-sm ${
                      hasUnreadMessages 
                        ? 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-l-4 border-blue-500 shadow-md' 
                        : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-blue-50/30 dark:hover:bg-blue-900/10'
                    }`}
                    onClick={() => handleConversationClick(profile.conversation_id, profile)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <MessageAvatar 
                            username={profile.profile_name || ''} 
                            size="lg"
                            className="w-14 h-14 ring-2 ring-white dark:ring-gray-800 shadow-lg"
                          />
                          {hasUnreadMessages && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">
                                {profile.unread_count > 9 ? '9+' : profile.unread_count}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 min-w-0">
                          {/* Header Row */}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className={`font-bold text-lg truncate ${
                                hasUnreadMessages 
                                  ? 'text-blue-900 dark:text-blue-100' 
                                  : 'text-gray-900 dark:text-gray-100'
                              }`}>
                                {otherPartyName}
                              </h3>
                            </div>
                            
                            {/* Time */}
                            <div className="flex-shrink-0 ml-3">
                              <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap font-medium">
                                {formatDistanceToNow(new Date(lastMessageTime), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                          
                          {/* Message Preview */}
                          {isLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                              <p className="text-sm text-gray-400 dark:text-gray-500">
                                Loading messages...
                              </p>
                            </div>
                          ) : lastMessage ? (
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <p className={`text-sm truncate flex-1 ${
                                hasUnreadMessages 
                                  ? 'text-blue-700 dark:text-blue-300 font-medium' 
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}>
                                {lastMessage}
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <p className="text-sm text-gray-400 dark:text-gray-500">
                                No messages yet
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {isChatOpen && selectedConversation && selectedConversationData && (
        <ChatModal
          isOpen={isChatOpen}
          onClose={handleCloseChat}
          roomName={selectedConversation}
          title={selectedConversationData.display_name || getOtherPartyName(selectedConversationData)}
          profilePicture={selectedConversationData.profile_picture}
        />
      )}
    </div>
  );
} 