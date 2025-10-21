export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  bio?: string;
  profile_picture?: string;
  date_joined: string;
}

export interface UserMessage {
  id: number;
  sender: User;
  recipient: User;
  message: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MessageThread {
  id: number;
  user1: User;
  user2: User;
  other_user: User; // The other user (not current user)
  last_message?: UserMessage;
  last_activity: string;
  unread_count: number;
  created_at: string;
}

export interface SendMessageRequest {
  recipient_id: number;
  message: string;
}

export interface MessageThreadResponse {
  thread: MessageThread;
  messages: UserMessage[];
}