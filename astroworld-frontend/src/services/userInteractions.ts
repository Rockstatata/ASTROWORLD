import axios from 'axios';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export type ContentType = 
  | 'apod' 
  | 'mars_photo' 
  | 'epic' 
  | 'neo' 
  | 'exoplanet' 
  | 'space_weather' 
  | 'news' 
  | 'celestial' 
  | 'event';

export type JournalType = 
  | 'note' 
  | 'observation' 
  | 'ai_conversation' 
  | 'discovery';

export type ActivityType = 
  | 'view' 
  | 'favorite' 
  | 'save' 
  | 'share' 
  | 'comment' 
  | 'journal' 
  | 'collection_create' 
  | 'subscription';

// =====================================================
// INTERFACES
// =====================================================

export interface UserContent {
  id: number;
  content_type: ContentType;
  content_id: string;
  title: string;
  notes?: string;
  tags?: string[];
  is_favorite: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SaveContentData {
  content_type: ContentType;
  content_id: string;
  title: string;
  notes?: string;
  tags?: string[];
  is_favorite?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpdateContentData {
  notes?: string;
  tags?: string[];
  is_favorite?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UserJournal {
  id: number;
  journal_type: JournalType;
  title: string;
  content: string;
  coordinates?: {
    ra?: string;
    dec?: string;
    alt?: string;
    az?: string;
  };
  is_public: boolean;
  related_content?: {
    id: number;
    content_type: ContentType;
    title: string;
  };
  ai_conversation_data?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreateJournalData {
  journal_type: JournalType;
  title: string;
  content: string;
  coordinates?: {
    ra?: string;
    dec?: string;
    alt?: string;
    az?: string;
  };
  is_public?: boolean;
  related_content_id?: number;
  ai_conversation_data?: Record<string, unknown>;
}

export interface UserCollection {
  id: number;
  name: string;
  description?: string;
  is_public: boolean;
  item_count: number;
  items: {
    id: number;
    content_type: ContentType;
    title: string;
  }[];
  created_at: string;
  updated_at: string;
}

export interface CreateCollectionData {
  name: string;
  description?: string;
  is_public?: boolean;
  item_ids?: number[];
}

export interface UserSubscription {
  id: number;
  event_type: string;
  event_id: string;
  event_name: string;
  event_date: string;
  is_active: boolean;
  notify_email: boolean;
  notify_in_app: boolean;
  notify_before_hours: number;
  created_at: string;
}

export interface CreateSubscriptionData {
  event_type: string;
  event_id: string;
  event_name: string;
  event_date: string;
  notify_email?: boolean;
  notify_in_app?: boolean;
  notify_before_hours?: number;
}

export interface UserActivity {
  id: number;
  activity_type: ActivityType;
  description: string;
  content?: {
    id: number;
    content_type: ContentType;
    title: string;
  };
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  bio?: string;
  profile_picture?: string;
  date_joined: string;
  saved_content_count: number;
  journals_count: number;
  collections_count: number;
  subscriptions_count: number;
  recent_activities: UserActivity[];
}

// =====================================================
// QUERY PARAMETERS
// =====================================================

export interface ContentQueryParams {
  content_type?: ContentType;
  is_favorite?: boolean;
  tags?: string;
  search?: string;
  ordering?: string;
}

export interface JournalQueryParams {
  journal_type?: JournalType;
  related_content?: number;
  search?: string;
  ordering?: string;
}

export interface CollectionQueryParams {
  search?: string;
  ordering?: string;
}

export interface SubscriptionQueryParams {
  active_only?: boolean;
  notify_email?: boolean;
  notify_in_app?: boolean;
  ordering?: string;
}

export interface ActivityQueryParams {
  activity_type?: ActivityType;
  limit?: number;
  ordering?: string;
}

// =====================================================
// API SERVICE
// =====================================================

/* eslint-disable @typescript-eslint/no-explicit-any */
const buildQueryString = (params?: any): string => {
  if (!params) return '';
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query.append(key, String(value));
    }
  });
  return query.toString() ? `?${query.toString()}` : '';
};

export const userInteractionsAPI = {
  // =====================================================
  // USER CONTENT
  // =====================================================
  
  content: {
    list: (params?: ContentQueryParams) =>
      axios.get<UserContent[]>(`/users/content/${buildQueryString(params)}`),
    
    get: (id: number) =>
      axios.get<UserContent>(`/users/content/${id}/`),
    
    create: (data: SaveContentData) =>
      axios.post<UserContent>('/users/content/', data),
    
    update: (id: number, data: UpdateContentData) =>
      axios.patch<UserContent>(`/users/content/${id}/`, data),
    
    delete: (id: number) =>
      axios.delete(`/users/content/${id}/`),
    
    favorites: () =>
      axios.get<UserContent[]>('/users/content/favorites/'),
    
    toggleFavorite: (id: number) =>
      axios.post<UserContent>(`/users/content/${id}/toggle_favorite/`),
  },

  // =====================================================
  // USER JOURNALS
  // =====================================================
  
  journals: {
    list: (params?: JournalQueryParams) =>
      axios.get<UserJournal[]>(`/users/journals/${buildQueryString(params)}`),
    
    get: (id: number) =>
      axios.get<UserJournal>(`/users/journals/${id}/`),
    
    create: (data: CreateJournalData) =>
      axios.post<UserJournal>('/users/journals/', data),
    
    update: (id: number, data: Partial<CreateJournalData>) =>
      axios.patch<UserJournal>(`/users/journals/${id}/`, data),
    
    delete: (id: number) =>
      axios.delete(`/users/journals/${id}/`),
    
    observations: () =>
      axios.get<UserJournal[]>('/users/journals/observations/'),
    
    aiConversations: () =>
      axios.get<UserJournal[]>('/users/journals/ai_conversations/'),
  },

  // =====================================================
  // USER COLLECTIONS
  // =====================================================
  
  collections: {
    list: (params?: CollectionQueryParams) =>
      axios.get<UserCollection[]>(`/users/collections/${buildQueryString(params)}`),
    
    get: (id: number) =>
      axios.get<UserCollection>(`/users/collections/${id}/`),
    
    create: (data: CreateCollectionData) =>
      axios.post<UserCollection>('/users/collections/', data),
    
    update: (id: number, data: Partial<CreateCollectionData>) =>
      axios.patch<UserCollection>(`/users/collections/${id}/`, data),
    
    delete: (id: number) =>
      axios.delete(`/users/collections/${id}/`),
    
    addItem: (collectionId: number, contentId: number) =>
      axios.post<UserCollection>(`/users/collections/${collectionId}/add_item/`, { 
        content_id: contentId 
      }),
    
    removeItem: (collectionId: number, contentId: number) =>
      axios.post<UserCollection>(`/users/collections/${collectionId}/remove_item/`, { 
        content_id: contentId 
      }),
  },

  // =====================================================
  // USER SUBSCRIPTIONS
  // =====================================================
  
  subscriptions: {
    list: (params?: SubscriptionQueryParams) =>
      axios.get<UserSubscription[]>(`/users/subscriptions/${buildQueryString(params)}`),
    
    get: (id: number) =>
      axios.get<UserSubscription>(`/users/subscriptions/${id}/`),
    
    create: (data: CreateSubscriptionData) =>
      axios.post<UserSubscription>('/users/subscriptions/', data),
    
    update: (id: number, data: Partial<CreateSubscriptionData>) =>
      axios.patch<UserSubscription>(`/users/subscriptions/${id}/`, data),
    
    delete: (id: number) =>
      axios.delete(`/users/subscriptions/${id}/`),
    
    toggleActive: (id: number) =>
      axios.post<UserSubscription>(`/users/subscriptions/${id}/toggle_active/`),
    
    upcoming: () =>
      axios.get<UserSubscription[]>('/users/subscriptions/upcoming/'),
  },

  // =====================================================
  // USER ACTIVITY
  // =====================================================
  
  activities: {
    list: (params?: ActivityQueryParams) =>
      axios.get<UserActivity[]>(`/users/activities/${buildQueryString(params)}`),
    
    get: (id: number) =>
      axios.get<UserActivity>(`/users/activities/${id}/`),
    
    recent: () =>
      axios.get<UserActivity[]>('/users/activities/recent/'),
  },

  // =====================================================
  // USER PROFILE
  // =====================================================
  
  profile: {
    get: () =>
      axios.get<UserProfile>('/users/profile/'),
  },
};
