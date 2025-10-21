import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagingApi } from '../services/messaging';
import type { SendMessageRequest } from '../types/messaging';

// Get all message threads
export const useMessageThreads = () => {
  return useQuery({
    queryKey: ['message-threads'],
    queryFn: async () => {
      const response = await messagingApi.getThreads();
      return response.data;
    },
  });
};

// Get messages in a specific thread
export const useThreadMessages = (threadId: number | null) => {
  return useQuery({
    queryKey: ['thread-messages', threadId],
    queryFn: async () => {
      if (!threadId) throw new Error('Thread ID is required');
      const response = await messagingApi.getThreadMessages(threadId);
      return response.data;
    },
    enabled: !!threadId,
  });
};

// Get messages with a specific user
export const useMessagesWithUser = (userId: number | null) => {
  return useQuery({
    queryKey: ['messages-with-user', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      const response = await messagingApi.getMessagesWithUser(userId);
      return response.data;
    },
    enabled: !!userId,
  });
};

// Send a message
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendMessageRequest) => messagingApi.sendMessage(data),
    onSuccess: (_, variables) => {
      // Invalidate threads to refresh the list
      queryClient.invalidateQueries({ queryKey: ['message-threads'] });
      
      // Invalidate messages with this user
      queryClient.invalidateQueries({ 
        queryKey: ['messages-with-user', variables.recipient_id] 
      });
      
      // If we know which thread this belongs to, invalidate it too
      queryClient.invalidateQueries({ 
        queryKey: ['thread-messages'] 
      });
    },
  });
};