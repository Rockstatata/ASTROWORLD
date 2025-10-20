import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  userInteractionsAPI,
  type UserContent,
  type SaveContentData,
  type UpdateContentData,
  type ContentQueryParams
} from '../services/userInteractions';

// =====================================================
// QUERY KEYS
// =====================================================

export const USER_CONTENT_KEYS = {
  all: ['user-content'] as const,
  lists: () => [...USER_CONTENT_KEYS.all, 'list'] as const,
  list: (params?: ContentQueryParams) => [...USER_CONTENT_KEYS.lists(), params] as const,
  details: () => [...USER_CONTENT_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...USER_CONTENT_KEYS.details(), id] as const,
  favorites: () => [...USER_CONTENT_KEYS.all, 'favorites'] as const,
};

// =====================================================
// USER CONTENT HOOKS
// =====================================================

/**
 * Hook to fetch all saved user content with optional filtering
 */
export const useUserContent = (params?: ContentQueryParams) => {
  return useQuery({
    queryKey: USER_CONTENT_KEYS.list(params),
    queryFn: async () => {
      const response = await userInteractionsAPI.content.list(params);
      return response.data;
    },
  });
};

/**
 * Hook to fetch a specific saved content item
 */
export const useUserContentDetail = (id: number) => {
  return useQuery({
    queryKey: USER_CONTENT_KEYS.detail(id),
    queryFn: async () => {
      const response = await userInteractionsAPI.content.get(id);
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Hook to fetch all favorited content
 */
export const useUserFavorites = () => {
  return useQuery({
    queryKey: USER_CONTENT_KEYS.favorites(),
    queryFn: async () => {
      const response = await userInteractionsAPI.content.favorites();
      return response.data;
    },
  });
};

/**
 * Hook to save new content
 */
export const useSaveContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SaveContentData) => {
      const response = await userInteractionsAPI.content.create(data);
      return response.data;
    },
    onSuccess: (newContent) => {
      // Invalidate all content queries
      queryClient.invalidateQueries({ queryKey: USER_CONTENT_KEYS.all });
      
      // Optimistically update cache
      queryClient.setQueryData<UserContent[]>(
        USER_CONTENT_KEYS.lists(),
        (old) => old ? [newContent, ...old] : [newContent]
      );
    },
  });
};

/**
 * Hook to update existing content (notes, tags, etc.)
 */
export const useUpdateContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateContentData }) => {
      const response = await userInteractionsAPI.content.update(id, data);
      return response.data;
    },
    onSuccess: (updatedContent) => {
      // Invalidate all content queries
      queryClient.invalidateQueries({ queryKey: USER_CONTENT_KEYS.all });
      
      // Update specific content in cache
      queryClient.setQueryData<UserContent>(
        USER_CONTENT_KEYS.detail(updatedContent.id),
        updatedContent
      );
    },
  });
};

/**
 * Hook to delete saved content
 */
export const useDeleteContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await userInteractionsAPI.content.delete(id);
      return id;
    },
    onSuccess: (deletedId) => {
      // Invalidate all content queries
      queryClient.invalidateQueries({ queryKey: USER_CONTENT_KEYS.all });
      
      // Remove from cache
      queryClient.removeQueries({ queryKey: USER_CONTENT_KEYS.detail(deletedId) });
    },
  });
};

/**
 * Hook to toggle favorite status of content
 */
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await userInteractionsAPI.content.toggleFavorite(id);
      return response.data;
    },
    onSuccess: (updatedContent) => {
      // Invalidate all content queries
      queryClient.invalidateQueries({ queryKey: USER_CONTENT_KEYS.all });
      
      // Update specific content in cache
      queryClient.setQueryData<UserContent>(
        USER_CONTENT_KEYS.detail(updatedContent.id),
        updatedContent
      );
    },
  });
};

/**
 * Hook to check if content is already saved
 */
export const useIsContentSaved = (contentType: string, contentId: string) => {
  const { data: savedContent } = useUserContent();
  
  return savedContent?.find(
    (item: UserContent) => item.content_type === contentType && item.content_id === contentId
  );
};

/**
 * Hook to check if content is favorited
 */
export const useIsContentFavorited = (contentType: string, contentId: string) => {
  const savedItem = useIsContentSaved(contentType, contentId);
  return savedItem?.is_favorite || false;
};
