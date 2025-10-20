import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  userInteractionsAPI,
  type UserSubscription,
  type CreateSubscriptionData,
  type SubscriptionQueryParams,
  type ActivityQueryParams
} from '../services/userInteractions';

// =====================================================
// SUBSCRIPTION QUERY KEYS
// =====================================================

export const USER_SUBSCRIPTION_KEYS = {
  all: ['user-subscriptions'] as const,
  lists: () => [...USER_SUBSCRIPTION_KEYS.all, 'list'] as const,
  list: (params?: SubscriptionQueryParams) => [...USER_SUBSCRIPTION_KEYS.lists(), params] as const,
  details: () => [...USER_SUBSCRIPTION_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...USER_SUBSCRIPTION_KEYS.details(), id] as const,
  upcoming: () => [...USER_SUBSCRIPTION_KEYS.all, 'upcoming'] as const,
};

// =====================================================
// USER SUBSCRIPTION HOOKS
// =====================================================

/**
 * Hook to fetch all user subscriptions with optional filtering
 */
export const useUserSubscriptions = (params?: SubscriptionQueryParams) => {
  return useQuery({
    queryKey: USER_SUBSCRIPTION_KEYS.list(params),
    queryFn: async () => {
      const response = await userInteractionsAPI.subscriptions.list(params);
      return response.data;
    },
  });
};

/**
 * Hook to fetch a specific subscription
 */
export const useUserSubscriptionDetail = (id: number) => {
  return useQuery({
    queryKey: USER_SUBSCRIPTION_KEYS.detail(id),
    queryFn: async () => {
      const response = await userInteractionsAPI.subscriptions.get(id);
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Hook to fetch upcoming active subscriptions
 */
export const useUpcomingSubscriptions = () => {
  return useQuery({
    queryKey: USER_SUBSCRIPTION_KEYS.upcoming(),
    queryFn: async () => {
      const response = await userInteractionsAPI.subscriptions.upcoming();
      return response.data;
    },
  });
};

/**
 * Hook to create a new subscription
 */
export const useCreateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSubscriptionData) => {
      const response = await userInteractionsAPI.subscriptions.create(data);
      return response.data;
    },
    onSuccess: (newSubscription: UserSubscription) => {
      // Invalidate all subscription queries
      queryClient.invalidateQueries({ queryKey: USER_SUBSCRIPTION_KEYS.all });
      
      // Optimistically update cache
      queryClient.setQueryData<UserSubscription[]>(
        USER_SUBSCRIPTION_KEYS.lists(),
        (old) => old ? [newSubscription, ...old] : [newSubscription]
      );
    },
  });
};

/**
 * Hook to update an existing subscription
 */
export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateSubscriptionData> }) => {
      const response = await userInteractionsAPI.subscriptions.update(id, data);
      return response.data;
    },
    onSuccess: (updatedSubscription: UserSubscription) => {
      // Invalidate all subscription queries
      queryClient.invalidateQueries({ queryKey: USER_SUBSCRIPTION_KEYS.all });
      
      // Update specific subscription in cache
      queryClient.setQueryData<UserSubscription>(
        USER_SUBSCRIPTION_KEYS.detail(updatedSubscription.id),
        updatedSubscription
      );
    },
  });
};

/**
 * Hook to delete a subscription
 */
export const useDeleteSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await userInteractionsAPI.subscriptions.delete(id);
      return id;
    },
    onSuccess: (deletedId: number) => {
      // Invalidate all subscription queries
      queryClient.invalidateQueries({ queryKey: USER_SUBSCRIPTION_KEYS.all });
      
      // Remove from cache
      queryClient.removeQueries({ queryKey: USER_SUBSCRIPTION_KEYS.detail(deletedId) });
    },
  });
};

/**
 * Hook to toggle subscription active status
 */
export const useToggleSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await userInteractionsAPI.subscriptions.toggleActive(id);
      return response.data;
    },
    onSuccess: (updatedSubscription: UserSubscription) => {
      // Invalidate all subscription queries
      queryClient.invalidateQueries({ queryKey: USER_SUBSCRIPTION_KEYS.all });
      
      // Update specific subscription in cache
      queryClient.setQueryData<UserSubscription>(
        USER_SUBSCRIPTION_KEYS.detail(updatedSubscription.id),
        updatedSubscription
      );
    },
  });
};

// =====================================================
// ACTIVITY QUERY KEYS
// =====================================================

export const USER_ACTIVITY_KEYS = {
  all: ['user-activities'] as const,
  lists: () => [...USER_ACTIVITY_KEYS.all, 'list'] as const,
  list: (params?: ActivityQueryParams) => [...USER_ACTIVITY_KEYS.lists(), params] as const,
  details: () => [...USER_ACTIVITY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...USER_ACTIVITY_KEYS.details(), id] as const,
  recent: () => [...USER_ACTIVITY_KEYS.all, 'recent'] as const,
};

// =====================================================
// USER ACTIVITY HOOKS
// =====================================================

/**
 * Hook to fetch all user activities with optional filtering
 */
export const useUserActivities = (params?: ActivityQueryParams) => {
  return useQuery({
    queryKey: USER_ACTIVITY_KEYS.list(params),
    queryFn: async () => {
      const response = await userInteractionsAPI.activities.list(params);
      return response.data;
    },
  });
};

/**
 * Hook to fetch a specific activity
 */
export const useUserActivityDetail = (id: number) => {
  return useQuery({
    queryKey: USER_ACTIVITY_KEYS.detail(id),
    queryFn: async () => {
      const response = await userInteractionsAPI.activities.get(id);
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Hook to fetch recent activities (last 50)
 */
export const useRecentActivities = () => {
  return useQuery({
    queryKey: USER_ACTIVITY_KEYS.recent(),
    queryFn: async () => {
      const response = await userInteractionsAPI.activities.recent();
      return response.data;
    },
  });
};

// =====================================================
// PROFILE QUERY KEYS
// =====================================================

export const USER_PROFILE_KEYS = {
  all: ['user-profile'] as const,
  detail: () => [...USER_PROFILE_KEYS.all, 'detail'] as const,
};

// =====================================================
// USER PROFILE HOOKS
// =====================================================

/**
 * Hook to fetch comprehensive user profile with aggregated stats
 */
export const useUserProfile = () => {
  return useQuery({
    queryKey: USER_PROFILE_KEYS.detail(),
    queryFn: async () => {
      const response = await userInteractionsAPI.profile.get();
      return response.data;
    },
  });
};
