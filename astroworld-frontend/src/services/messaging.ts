import axios from 'axios';
import type { MessageThread, UserMessage, SendMessageRequest, MessageThreadResponse } from '../types/messaging';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const messagingApi = {
  // Get all message threads for current user
  getThreads: () => api.get<MessageThread[]>('/users/messages/threads/'),
  
  // Get messages in a specific thread
  getThreadMessages: (threadId: number) => 
    api.get<MessageThreadResponse>(`/users/messages/threads/${threadId}/`),
  
  // Send a message to another user
  sendMessage: (data: SendMessageRequest) => 
    api.post<UserMessage>('/users/messages/send/', data),
  
  // Get messages between current user and another user
  getMessagesWithUser: (userId: number) => 
    api.get<UserMessage[]>(`/users/messages/with/${userId}/`),
};