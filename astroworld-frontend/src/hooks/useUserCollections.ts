import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  userInteractionsAPI,
  type UserCollection,
  type CreateCollectionData,
  type CollectionQueryParams
} from '../services/userInteractions';

// =====================================================
// QUERY KEYS
// =====================================================

export const USER_COLLECTION_KEYS = {
  all: ['user-collections'] as const,
  lists: () => [...USER_COLLECTION_KEYS.all, 'list'] as const,
  list: (params?: CollectionQueryParams) => [...USER_COLLECTION_KEYS.lists(), params] as const,
  details: () => [...USER_COLLECTION_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...USER_COLLECTION_KEYS.details(), id] as const,
};

// =====================================================
// USER COLLECTION HOOKS
// =====================================================

/**
 * Hook to fetch all user collections with optional filtering
 */
export const useUserCollections = (params?: CollectionQueryParams) => {
  return useQuery({
    queryKey: USER_COLLECTION_KEYS.list(params),
    queryFn: async () => {
      const response = await userInteractionsAPI.collections.list(params);
      return response.data;
    },
  });
};

/**
 * Hook to fetch a specific collection with all its items
 */
export const useUserCollectionDetail = (id: number) => {
  return useQuery({
    queryKey: USER_COLLECTION_KEYS.detail(id),
    queryFn: async () => {
      const response = await userInteractionsAPI.collections.get(id);
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Hook to create a new collection
 */
export const useCreateCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCollectionData) => {
      const response = await userInteractionsAPI.collections.create(data);
      return response.data;
    },
    onSuccess: (newCollection) => {
      // Invalidate all collection queries
      queryClient.invalidateQueries({ queryKey: USER_COLLECTION_KEYS.all });
      
      // Optimistically update cache
      queryClient.setQueryData<UserCollection[]>(
        USER_COLLECTION_KEYS.lists(),
        (old) => old ? [newCollection, ...old] : [newCollection]
      );
    },
  });
};

/**
 * Hook to update an existing collection
 */
export const useUpdateCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateCollectionData> }) => {
      const response = await userInteractionsAPI.collections.update(id, data);
      return response.data;
    },
    onSuccess: (updatedCollection) => {
      // Invalidate all collection queries
      queryClient.invalidateQueries({ queryKey: USER_COLLECTION_KEYS.all });
      
      // Update specific collection in cache
      queryClient.setQueryData<UserCollection>(
        USER_COLLECTION_KEYS.detail(updatedCollection.id),
        updatedCollection
      );
    },
  });
};

/**
 * Hook to delete a collection
 */
export const useDeleteCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await userInteractionsAPI.collections.delete(id);
      return id;
    },
    onSuccess: (deletedId) => {
      // Invalidate all collection queries
      queryClient.invalidateQueries({ queryKey: USER_COLLECTION_KEYS.all });
      
      // Remove from cache
      queryClient.removeQueries({ queryKey: USER_COLLECTION_KEYS.detail(deletedId) });
    },
  });
};

/**
 * Hook to add an item to a collection
 */
export const useAddItemToCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ collectionId, contentId }: { collectionId: number; contentId: number }) => {
      const response = await userInteractionsAPI.collections.addItem(collectionId, contentId);
      return response.data;
    },
    onSuccess: (updatedCollection) => {
      // Invalidate all collection queries
      queryClient.invalidateQueries({ queryKey: USER_COLLECTION_KEYS.all });
      
      // Update specific collection in cache
      queryClient.setQueryData<UserCollection>(
        USER_COLLECTION_KEYS.detail(updatedCollection.id),
        updatedCollection
      );
    },
  });
};

/**
 * Hook to remove an item from a collection
 */
export const useRemoveItemFromCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ collectionId, contentId }: { collectionId: number; contentId: number }) => {
      const response = await userInteractionsAPI.collections.removeItem(collectionId, contentId);
      return response.data;
    },
    onSuccess: (updatedCollection) => {
      // Invalidate all collection queries
      queryClient.invalidateQueries({ queryKey: USER_COLLECTION_KEYS.all });
      
      // Update specific collection in cache
      queryClient.setQueryData<UserCollection>(
        USER_COLLECTION_KEYS.detail(updatedCollection.id),
        updatedCollection
      );
    },
  });
};
