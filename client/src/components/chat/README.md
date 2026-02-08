# Chat Components

This directory contains all the chat-related components for the application.

## Components

### ChatInterface
The main chat interface component that handles message display, input, and real-time communication.

**Key Features:**
- Real-time message display
- Typing indicators
- Message grouping by sender and time (1-minute intervals)
- Auto-scroll to bottom
- Message read status

**Message Layout:**
Messages are displayed with the following layout:
- **Profile Picture**: Shown at the last message of each group (both own and other messages)
- **Full Name**: Shown at the first message of each group ("You" for own messages, full name for others)
- **Time**: Shown at the last message of each group below the message text
- **Message Status**: Shown at the last message of own message groups

**Grouping Logic:**
Messages are grouped based on two criteria:
1. **Same Sender**: Messages must be from the same sender
2. **Time Difference**: Messages must be sent within 1 minute of each other

If either condition is not met, a new group is created.

**Recent Updates:**
Updated message grouping to implement 1-minute time difference logic:
1. Profile pictures appear at the last message of each group
2. Full names (or "You" for own messages) appear at the first message of each group
3. Time appears at the last message of each group below the message text
4. Messages are only grouped if they are from the same sender AND within 1 minute of each other

### MessageBubble
Individual message bubble component that displays a single message.

**Props:**
- `message`: The message object
- `isOwnMessage`: Whether the message is from the current user
- `profilePicture`: Profile picture URL
- `isFirstInGroup`: Whether this is the first message in a group
- `isLastInGroup`: Whether this is the last message in a group

**Layout Features:**
- **Own Messages**: Right-aligned with blue gradient background
- **Other Messages**: Left-aligned with white/dark background
- **Profile Pictures**: Shown at the last message of each group
- **Names and Time**: Shown at the first message of each group
- **Message Status**: Shown at the last message of own message groups

### MessageAvatar
Avatar component for chat messages.

### TypingIndicator
Shows when another user is typing.

### SendMessageButton
Button component for sending messages.

## Usage

```tsx
import ChatInterface from '@/components/chat/ChatInterface';

<ChatInterface 
  roomName="conversation-123"
  title="John Doe"
  profilePicture="https://example.com/avatar.jpg"
/>
```

## Message Grouping

The chat interface automatically groups messages by sender and time. Messages are only grouped together if they meet both criteria:
1. **Same Sender**: Messages must be from the same sender
2. **Time Difference**: Messages must be sent within 1 minute of each other

**Grouping Logic:**
1. Messages are grouped by sender (consecutive messages from the same sender)
2. Messages are only grouped if the time difference is less than 1 minute
3. Profile pictures appear at the last message of each group
4. Names appear at the first message of each group
5. Time appears at the last message of each group below the message text
6. Message status appears at the last message of own message groups

**Display Format:**
- **First Message**: Shows sender name
- **Middle Messages**: Show only message content
- **Last Message**: Shows profile picture, time below message text, and message status (for own messages)

**Example Scenarios:**
- **Same sender, 30 seconds apart**: Grouped together
- **Same sender, 2 minutes apart**: Separate groups
- **Different senders**: Always separate groups
- **Same sender, 45 seconds apart**: Grouped together

## WebSocket Integration

The chat components integrate with WebSocket connections for real-time messaging. The `ChatWebSocketProvider` manages the WebSocket connections and provides the chat context to all chat components. 