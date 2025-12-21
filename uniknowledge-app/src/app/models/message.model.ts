export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface Message {
  messageId: number;
  senderId: number;
  senderUsername: string;
  senderAvatarUrl?: string;
  receiverId: number;
  receiverUsername: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  status?: MessageStatus; // For UI purposes
}

export interface Conversation {
  otherUserId: number;
  otherUsername: string;
  otherAvatarUrl?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isLastMessageFromMe: boolean;
}

export interface TypingIndicator {
  userId: number;
  username?: string;
}

