import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  userInteractionsAPI,
  type UserJournal,
  type CreateJournalData,
  type JournalQueryParams
} from '../services/userInteractions';

// =====================================================
// QUERY KEYS
// =====================================================

export const USER_JOURNAL_KEYS = {
  all: ['user-journals'] as const,
  lists: () => [...USER_JOURNAL_KEYS.all, 'list'] as const,
  list: (params?: JournalQueryParams) => [...USER_JOURNAL_KEYS.lists(), params] as const,
  details: () => [...USER_JOURNAL_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...USER_JOURNAL_KEYS.details(), id] as const,
  observations: () => [...USER_JOURNAL_KEYS.all, 'observations'] as const,
  aiConversations: () => [...USER_JOURNAL_KEYS.all, 'ai-conversations'] as const,
};

// =====================================================
// USER JOURNAL HOOKS
// =====================================================

/**
 * Hook to fetch all user journals with optional filtering
 */
export const useUserJournals = (params?: JournalQueryParams) => {
  return useQuery({
    queryKey: USER_JOURNAL_KEYS.list(params),
    queryFn: async () => {
      const response = await userInteractionsAPI.journals.list(params);
      return response.data;
    },
  });
};

/**
 * Hook to fetch a specific journal entry
 */
export const useUserJournalDetail = (id: number) => {
  return useQuery({
    queryKey: USER_JOURNAL_KEYS.detail(id),
    queryFn: async () => {
      const response = await userInteractionsAPI.journals.get(id);
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Hook to fetch all observation journals with coordinates
 */
export const useUserObservations = () => {
  return useQuery({
    queryKey: USER_JOURNAL_KEYS.observations(),
    queryFn: async () => {
      const response = await userInteractionsAPI.journals.observations();
      return response.data;
    },
  });
};

/**
 * Hook to fetch all Murph AI conversation journals
 */
export const useUserAIConversations = () => {
  return useQuery({
    queryKey: USER_JOURNAL_KEYS.aiConversations(),
    queryFn: async () => {
      const response = await userInteractionsAPI.journals.aiConversations();
      return response.data;
    },
  });
};

/**
 * Hook to create a new journal entry
 */
export const useCreateJournal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateJournalData) => {
      const response = await userInteractionsAPI.journals.create(data);
      return response.data;
    },
    onSuccess: (newJournal) => {
      // Invalidate all journal queries
      queryClient.invalidateQueries({ queryKey: USER_JOURNAL_KEYS.all });
      
      // Optimistically update cache
      queryClient.setQueryData<UserJournal[]>(
        USER_JOURNAL_KEYS.lists(),
        (old) => old ? [newJournal, ...old] : [newJournal]
      );
    },
  });
};

/**
 * Hook to update an existing journal entry
 */
export const useUpdateJournal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateJournalData> }) => {
      const response = await userInteractionsAPI.journals.update(id, data);
      return response.data;
    },
    onSuccess: (updatedJournal) => {
      // Invalidate all journal queries
      queryClient.invalidateQueries({ queryKey: USER_JOURNAL_KEYS.all });
      
      // Update specific journal in cache
      queryClient.setQueryData<UserJournal>(
        USER_JOURNAL_KEYS.detail(updatedJournal.id),
        updatedJournal
      );
    },
  });
};

/**
 * Hook to delete a journal entry
 */
export const useDeleteJournal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await userInteractionsAPI.journals.delete(id);
      return id;
    },
    onSuccess: (deletedId) => {
      // Invalidate all journal queries
      queryClient.invalidateQueries({ queryKey: USER_JOURNAL_KEYS.all });
      
      // Remove from cache
      queryClient.removeQueries({ queryKey: USER_JOURNAL_KEYS.detail(deletedId) });
    },
  });
};
