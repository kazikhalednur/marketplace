// Chat System Components
export { default as MessageAvatar } from './MessageAvatar';
export { default as MessageBubble } from './MessageBubble';
export { default as MessageSender } from './MessageSender';
export { default as MessageStatus } from './MessageStatus';
export { default as MessageTime } from './MessageTime';
export { default as TypingIndicator } from './TypingIndicator';
export { default as ChatInterface } from './ChatInterface';
export { default as ChatModal } from './ChatModal';

// Re-export types for convenience
export type { ChatMessage } from '@/services/chatWebSocket'; 