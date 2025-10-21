/**
 * Explore API Service
 * Handles all API calls for the Explore page features
 */
import axios from 'axios';
import type {
  ResearchPaper,
  ResearchPaperList,
  UserPaper,
  PublicUser,
  UserFollower,
  PublicJournal,
  Like,
  Comment,
  ExploreFilters,
  SavePaperRequest,
  FollowRequest,
  LikeRequest,
  CommentRequest,
  UpdatePaperNotesRequest,
  PaginatedResponse,
  PaginationParams
} from '../types/explore';

const API_BASE = 'http://localhost:8000/api/users';

// Create axios instance with auth
const api = axios.create({
  baseURL: API_BASE,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// =====================================================
// USERS API
// =====================================================

export const exploreUsersApi = {
  /**
   * Get list of public users for discovery
   */
  getUsers: async (params?: {
    search?: string;
    ordering?: string;
    page?: number;
  }): Promise<PaginatedResponse<PublicUser>> => {
    const response = await api.get('/explore/users/', { params });
    return response.data;
  },

  /**
   * Get specific user profile
   */
  getUser: async (userId: number): Promise<PublicUser> => {
    const response = await api.get(`/explore/users/${userId}/`);
    return response.data;
  },
};

// =====================================================
// RESEARCH PAPERS API
// =====================================================

export const paperApi = {
  /**
   * Get list of research papers
   */
  getPapers: async (params?: {
    source?: 'nasa_ads' | 'arxiv' | 'crossref';
    category?: string;
    search?: string;
    ordering?: string;
    page?: number;
  }): Promise<PaginatedResponse<ResearchPaperList>> => {
    const response = await api.get('/explore/papers/', { params });
    return response.data;
  },

  /**
   * Get specific research paper details
   */
  getPaper: async (paperId: number): Promise<ResearchPaper> => {
    const response = await api.get(`/explore/papers/${paperId}/`);
    return response.data;
  },

  /**
   * Get user's saved papers
   */
  getMySavedPapers: async (params?: {
    is_favorite?: boolean;
    read_status?: 'unread' | 'reading' | 'read';
    ordering?: string;
    page?: number;
  }): Promise<PaginatedResponse<UserPaper>> => {
    const response = await api.get('/explore/my-papers/', { params });
    return response.data;
  },

  /**
   * Save a research paper
   */
  savePaper: async (data: SavePaperRequest): Promise<UserPaper> => {
    const response = await api.post('/explore/my-papers/', data);
    return response.data;
  },

  /**
   * Update saved paper (notes, tags, etc.)
   */
  updateSavedPaper: async (
    userPaperId: number,
    data: UpdatePaperNotesRequest
  ): Promise<UserPaper> => {
    const response = await api.patch(`/explore/my-papers/${userPaperId}/`, data);
    return response.data;
  },

  /**
   * Remove saved paper
   */
  unsavePaper: async (userPaperId: number): Promise<void> => {
    await api.delete(`/explore/my-papers/${userPaperId}/`);
  },

  /**
   * Toggle favorite status of saved paper
   */
  toggleFavorite: async (userPaperId: number): Promise<UserPaper> => {
    const response = await api.post(`/explore/my-papers/${userPaperId}/toggle_favorite/`);
    return response.data;
  },
};

// =====================================================
// JOURNALS API
// =====================================================

export const journalApi = {
  /**
   * Get public journals for discovery
   */
  getPublicJournals: async (params?: {
    journal_type?: 'note' | 'observation' | 'ai_conversation' | 'discovery';
    search?: string;
    ordering?: string;
    page?: number;
  }): Promise<PaginatedResponse<PublicJournal>> => {
    const response = await api.get('/explore/journals/', { params });
    return response.data;
  },

  /**
   * Get specific journal
   */
  getJournal: async (journalId: number): Promise<PublicJournal> => {
    const response = await api.get(`/explore/journals/${journalId}/`);
    return response.data;
  },
};

// =====================================================
// FOLLOW/SOCIAL API
// =====================================================

export const followApi = {
  /**
   * Get users I'm following
   */
  getFollowing: async (): Promise<UserFollower[]> => {
    const response = await api.get('/explore/follow/');
    return response.data;
  },

  /**
   * Get my followers
   */
  getFollowers: async (): Promise<UserFollower[]> => {
    const response = await api.get('/explore/follow/followers/');
    return response.data;
  },

  /**
   * Follow a user
   */
  followUser: async (data: FollowRequest): Promise<UserFollower> => {
    const response = await api.post('/explore/follow/', data);
    return response.data;
  },

  /**
   * Unfollow a user
   */
  unfollowUser: async (followingId: number): Promise<void> => {
    await api.post('/explore/follow/unfollow/', { following_id: followingId });
  },
};

// =====================================================
// LIKES API
// =====================================================

export const likeApi = {
  /**
   * Get likes for a specific target
   */
  getLikes: async (targetType: string, targetId: number): Promise<Like[]> => {
    const response = await api.get('/explore/likes/', {
      params: { target_type: targetType, target_id: targetId }
    });
    return response.data;
  },

  /**
   * Like an item (journal, paper, comment)
   */
  likeItem: async (data: LikeRequest): Promise<Like> => {
    const response = await api.post('/explore/likes/', data);
    return response.data;
  },

  /**
   * Unlike an item
   */
  unlikeItem: async (targetType: string, targetId: number): Promise<void> => {
    await api.post('/explore/likes/unlike/', {
      target_type: targetType,
      target_id: targetId
    });
  },
};

// =====================================================
// COMMENTS API
// =====================================================

export const commentApi = {
  /**
   * Get comments for a specific target
   */
  getComments: async (
    targetType: 'journal' | 'paper' | 'event',
    targetId: number
  ): Promise<Comment[]> => {
    const response = await api.get('/explore/comments/', {
      params: { target_type: targetType, target_id: targetId }
    });
    return response.data;
  },

  /**
   * Create a new comment
   */
  createComment: async (data: CommentRequest): Promise<Comment> => {
    const response = await api.post('/explore/comments/', data);
    return response.data;
  },

  /**
   * Update a comment
   */
  updateComment: async (commentId: number, text: string): Promise<Comment> => {
    const response = await api.patch(`/explore/comments/${commentId}/`, { text });
    return response.data;
  },

  /**
   * Delete a comment
   */
  deleteComment: async (commentId: number): Promise<void> => {
    await api.delete(`/explore/comments/${commentId}/`);
  },
};

// =====================================================
// COMBINED/UTILITY API
// =====================================================

export const exploreApi = {
  /**
   * Get mixed feed for Explore page
   * This combines users, papers, and journals in a unified feed
   */
  getMixedFeed: async (filters?: ExploreFilters & PaginationParams) => {
    // Since we don't have a single mixed endpoint, we'll fetch from multiple
    // endpoints and combine them on the frontend
    const promises = [];

    if (!filters?.content_type || filters.content_type === 'all' || filters.content_type === 'users') {
      promises.push(
        exploreUsersApi.getUsers({
          search: filters?.search,
          page: filters?.page,
        }).then(data => ({
          type: 'users' as const,
          data: data.results,
          count: data.count
        }))
      );
    }

    if (!filters?.content_type || filters.content_type === 'all' || filters.content_type === 'papers') {
      promises.push(
        paperApi.getPapers({
          search: filters?.search,
          source: filters?.source,
          page: filters?.page,
        }).then(data => ({
          type: 'papers' as const,
          data: data.results,
          count: data.count
        }))
      );
    }

    if (!filters?.content_type || filters.content_type === 'all' || filters.content_type === 'journals') {
      promises.push(
        journalApi.getPublicJournals({
          search: filters?.search,
          journal_type: filters?.journal_type,
          page: filters?.page,
        }).then(data => ({
          type: 'journals' as const,
          data: data.results,
          count: data.count
        }))
      );
    }

    const results = await Promise.all(promises);
    return results;
  },

  /**
   * Search across all content types
   */
  searchAll: async (query: string, filters?: ExploreFilters) => {
    return exploreApi.getMixedFeed({
      ...filters,
      search: query
    });
  },
};

// Export all APIs as a single object for convenience
export const exploreApis = {
  users: exploreUsersApi,
  papers: paperApi,
  journals: journalApi,
  follow: followApi,
  likes: likeApi,
  comments: commentApi,
  explore: exploreApi,
};

export default exploreApis;