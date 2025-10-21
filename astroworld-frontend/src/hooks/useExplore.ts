/**
 * Explore React Query Hooks
 * Custom hooks for Explore page data fetching and mutations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  ExploreFilters,
  SavePaperRequest,
  FollowRequest,
  LikeRequest,
  CommentRequest,
  UpdatePaperNotesRequest,
} from '../types/explore';
import { exploreApis } from '../services/exploreApi';

// Query keys for caching
export const exploreQueryKeys = {
  users: ['explore', 'users'] as const,
  user: (id: number) => ['explore', 'user', id] as const,
  papers: ['explore', 'papers'] as const,
  paper: (id: number) => ['explore', 'paper', id] as const,
  myPapers: ['explore', 'my-papers'] as const,
  journals: ['explore', 'journals'] as const,
  journal: (id: number) => ['explore', 'journal', id] as const,
  following: ['explore', 'following'] as const,
  followers: ['explore', 'followers'] as const,
  likes: (targetType: string, targetId: number) => ['explore', 'likes', targetType, targetId] as const,
  comments: (targetType: string, targetId: number) => ['explore', 'comments', targetType, targetId] as const,
  mixedFeed: (filters?: ExploreFilters) => ['explore', 'feed', filters] as const,
};

// =====================================================
// USERS HOOKS
// =====================================================

export const useExploreUsers = (params?: {
  search?: string;
  ordering?: string;
  page?: number;
}) => {
  return useQuery({
    queryKey: [...exploreQueryKeys.users, params],
    queryFn: () => exploreApis.users.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useExploreUser = (userId: number) => {
  return useQuery({
    queryKey: exploreQueryKeys.user(userId),
    queryFn: () => exploreApis.users.getUser(userId),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// =====================================================
// PAPERS HOOKS
// =====================================================

export const useExplorePapers = (params?: {
  source?: 'nasa_ads' | 'arxiv' | 'crossref';
  category?: string;
  search?: string;
  ordering?: string;
  page?: number;
}) => {
  return useQuery({
    queryKey: [...exploreQueryKeys.papers, params],
    queryFn: () => exploreApis.papers.getPapers(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useExplorePaper = (paperId: number) => {
  return useQuery({
    queryKey: exploreQueryKeys.paper(paperId),
    queryFn: () => exploreApis.papers.getPaper(paperId),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useMySavedPapers = (params?: {
  is_favorite?: boolean;
  read_status?: 'unread' | 'reading' | 'read';
  ordering?: string;
  page?: number;
}) => {
  return useQuery({
    queryKey: [...exploreQueryKeys.myPapers, params],
    queryFn: () => exploreApis.papers.getMySavedPapers(params),
    staleTime: 2 * 60 * 1000, // 2 minutes (user's own data changes more frequently)
  });
};

// =====================================================
// JOURNALS HOOKS
// =====================================================

export const usePublicJournals = (params?: {
  journal_type?: 'note' | 'observation' | 'ai_conversation' | 'discovery';
  search?: string;
  ordering?: string;
  page?: number;
}) => {
  return useQuery({
    queryKey: [...exploreQueryKeys.journals, params],
    queryFn: () => exploreApis.journals.getPublicJournals(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePublicJournal = (journalId: number) => {
  return useQuery({
    queryKey: exploreQueryKeys.journal(journalId),
    queryFn: () => exploreApis.journals.getJournal(journalId),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// =====================================================
// FOLLOW HOOKS
// =====================================================

export const useFollowing = () => {
  return useQuery({
    queryKey: exploreQueryKeys.following,
    queryFn: () => exploreApis.follow.getFollowing(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useFollowers = () => {
  return useQuery({
    queryKey: exploreQueryKeys.followers,
    queryFn: () => exploreApis.follow.getFollowers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// =====================================================
// LIKES HOOKS
// =====================================================

export const useLikes = (targetType: string, targetId: number) => {
  return useQuery({
    queryKey: exploreQueryKeys.likes(targetType, targetId),
    queryFn: () => exploreApis.likes.getLikes(targetType, targetId),
    staleTime: 1 * 60 * 1000, // 1 minute (likes change frequently)
  });
};

// =====================================================
// COMMENTS HOOKS
// =====================================================

export const useComments = (
  targetType: 'journal' | 'paper' | 'event',
  targetId: number
) => {
  return useQuery({
    queryKey: exploreQueryKeys.comments(targetType, targetId),
    queryFn: () => exploreApis.comments.getComments(targetType, targetId),
    staleTime: 30 * 1000, // 30 seconds (comments change frequently)
  });
};

// =====================================================
// MIXED FEED HOOK
// =====================================================

export const useExploreFeed = (filters?: ExploreFilters) => {
  return useQuery({
    queryKey: exploreQueryKeys.mixedFeed(filters),
    queryFn: () => exploreApis.explore.getMixedFeed(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// =====================================================
// MUTATION HOOKS
// =====================================================

// Paper mutations
export const useSavePaper = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: SavePaperRequest) => exploreApis.papers.savePaper(data),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: exploreQueryKeys.myPapers });
      queryClient.invalidateQueries({ queryKey: exploreQueryKeys.papers });
    },
  });
};

export const useUpdateSavedPaper = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userPaperId, data }: { userPaperId: number; data: UpdatePaperNotesRequest }) =>
      exploreApis.papers.updateSavedPaper(userPaperId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exploreQueryKeys.myPapers });
    },
  });
};

export const useUnsavePaper = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userPaperId: number) => exploreApis.papers.unsavePaper(userPaperId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exploreQueryKeys.myPapers });
      queryClient.invalidateQueries({ queryKey: exploreQueryKeys.papers });
    },
  });
};

export const useTogglePaperFavorite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userPaperId: number) => exploreApis.papers.toggleFavorite(userPaperId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exploreQueryKeys.myPapers });
    },
  });
};

// Follow mutations
export const useFollowUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: FollowRequest) => exploreApis.follow.followUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exploreQueryKeys.following });
      queryClient.invalidateQueries({ queryKey: exploreQueryKeys.users });
    },
  });
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (followingId: number) => exploreApis.follow.unfollowUser(followingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exploreQueryKeys.following });
      queryClient.invalidateQueries({ queryKey: exploreQueryKeys.users });
    },
  });
};

// Like mutations
export const useLikeItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: LikeRequest) => exploreApis.likes.likeItem(data),
    onSuccess: (_, variables) => {
      // Invalidate likes for this specific item
      queryClient.invalidateQueries({ 
        queryKey: exploreQueryKeys.likes(variables.target_type, variables.target_id) 
      });
      
      // Also invalidate the feed to update like counts
      if (variables.target_type === 'journal') {
        queryClient.invalidateQueries({ queryKey: exploreQueryKeys.journals });
      }
    },
  });
};

export const useUnlikeItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ targetType, targetId }: { targetType: string; targetId: number }) =>
      exploreApis.likes.unlikeItem(targetType, targetId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: exploreQueryKeys.likes(variables.targetType, variables.targetId) 
      });
      
      if (variables.targetType === 'journal') {
        queryClient.invalidateQueries({ queryKey: exploreQueryKeys.journals });
      }
    },
  });
};

// Comment mutations
export const useCreateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CommentRequest) => exploreApis.comments.createComment(data),
    onSuccess: (_, variables) => {
      // Invalidate comments for this target
      queryClient.invalidateQueries({ 
        queryKey: exploreQueryKeys.comments(variables.target_type, variables.target_id) 
      });
      
      // Update comment counts in feed
      if (variables.target_type === 'journal') {
        queryClient.invalidateQueries({ queryKey: exploreQueryKeys.journals });
      }
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ commentId, text }: { commentId: number; text: string }) =>
      exploreApis.comments.updateComment(commentId, text),
    onSuccess: () => {
      // Invalidate all comment queries (since we don't know which target this belongs to)
      queryClient.invalidateQueries({ queryKey: ['explore', 'comments'] });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (commentId: number) => exploreApis.comments.deleteComment(commentId),
    onSuccess: () => {
      // Invalidate all comment queries
      queryClient.invalidateQueries({ queryKey: ['explore', 'comments'] });
      queryClient.invalidateQueries({ queryKey: exploreQueryKeys.journals });
    },
  });
};

// =====================================================
// UTILITY HOOKS
// =====================================================

/**
 * Hook to check if user is following someone
 */
export const useIsFollowing = (userId: number) => {
  const { data: following } = useFollowing();
  return following?.some(f => f.following === userId) ?? false;
};

/**
 * Hook to check if user has liked an item
 */
export const useIsLiked = (targetType: string, targetId: number) => {
  const { data: likes } = useLikes(targetType, targetId);
  return likes && likes.length > 0;
};

/**
 * Hook to get like count for an item
 */
export const useLikeCount = (targetType: string, targetId: number) => {
  const { data: likes } = useLikes(targetType, targetId);
  return likes?.length ?? 0;
};

/**
 * Hook to get comment count for an item
 */
export const useCommentCount = (targetType: 'journal' | 'paper' | 'event', targetId: number) => {
  const { data: comments } = useComments(targetType, targetId);
  return comments?.length ?? 0;
};

/**
 * Hook for search functionality across all content
 */
export const useExploreSearch = (query: string, filters?: ExploreFilters) => {
  return useQuery({
    queryKey: ['explore', 'search', query, filters],
    queryFn: () => exploreApis.explore.searchAll(query, filters),
    enabled: query.length > 2, // Only search when query is meaningful
    staleTime: 30 * 1000, // 30 seconds
  });
};