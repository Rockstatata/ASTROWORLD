import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiPostChat } from '../utils/murphaiUtils';

// Backend API configuration
const BACKEND_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const SKYMAP_API_BASE = `${BACKEND_BASE}/skymap`;

// Helper for authenticated backend requests
const backendFetch = async (endpoint: string, options?: RequestInit) => {
  const token = localStorage.getItem("access_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options?.headers,
  };
  
  const response = await fetch(`${SKYMAP_API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    // Try to parse error response as JSON, but handle cases where there's no content
    let errorData;
    try {
      const responseText = await response.text();
      errorData = responseText ? JSON.parse(responseText) : { error: response.statusText || 'Request failed' };
    } catch {
      errorData = { error: `HTTP ${response.status}: ${response.statusText || 'Unknown error'}` };
    }
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  // Handle responses with no content (like DELETE operations returning 204)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null;
  }
  
  return response.json();
};

// Helper to build query params
const buildQueryParams = (params?: Record<string, unknown>): string => {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

// Types
export interface SkyMarker {
  id: number;
  name: string;
  custom_name?: string;
  display_name: string;
  object_type: string;
  object_id?: string;
  designation?: string;
  catalog_number?: string;
  stellarium_type?: string;
  object_metadata?: Record<string, unknown>;
  ra: number;
  dec: number;
  alt?: number;
  az?: number;
  coordinate_string: string;
  notes?: string;
  is_tracking: boolean;
  tracking_start_date?: string;
  next_observation_date?: string;
  magnitude?: number;
  visibility_rating?: number;
  ai_description?: string;
  ai_generated_at?: string;
  tags: string[];
  color: string;
  is_public: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  observation_count?: number;
}

export interface SkyView {
  id: number;
  title: string;
  description?: string;
  preset_type: string;
  ra_center: number;
  dec_center: number;
  zoom_level: number;
  center_coordinate_string: string;
  stellarium_settings: Record<string, unknown>;
  observation_time?: string;
  location?: Record<string, unknown>;
  featured_markers: SkyMarker[];
  is_public: boolean;
  is_featured: boolean;
  load_count: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateMarkerData {
  name: string;
  object_type: string;
  object_id?: string;
  designation?: string;
  catalog_number?: string;
  stellarium_type?: string;
  object_metadata?: Record<string, unknown>;
  ra: number;
  dec: number;
  alt?: number;
  az?: number;
  notes?: string;
  custom_name?: string;
  tags?: string[];
  color?: string;
  is_public?: boolean;
  magnitude?: number;
  visibility_rating?: number;
}

export interface CreateViewData {
  title: string;
  description?: string;
  preset_type?: string;
  ra_center: number;
  dec_center: number;
  zoom_level: number;
  stellarium_settings?: Record<string, unknown>;
  observation_time?: string;
  location?: Record<string, unknown>;
  featured_marker_ids?: number[];
  is_public?: boolean;
  tags?: string[];
}

// Sky Markers Hooks
export const useSkyMarkers = (params?: {
  object_type?: string;
  is_tracking?: boolean;
  is_public?: boolean;
  tags?: string;
  search?: string;
  ordering?: string;
}) => {
  return useQuery({
    queryKey: ['skyMarkers', params],
    queryFn: async () => {
      try {
        return await backendFetch(`/markers/${buildQueryParams(params)}`);
      } catch (error) {
        console.error('Failed to fetch markers:', error);
        throw error;
      }
    },
    staleTime: 30000, // 30 seconds
    retry: (failureCount, error) => {
      // Don't retry on 401 (authentication errors)
      if (error.message.includes('401')) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useSkyMarker = (markerId: number) => {
  return useQuery({
    queryKey: ['skyMarker', markerId],
    queryFn: () => backendFetch(`/markers/${markerId}/`),
    enabled: !!markerId,
  });
};

export const useCreateMarker = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateMarkerData) => backendFetch('/markers/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skyMarkers'] });
    },
    onError: (error: Error) => {
      console.error('Failed to create marker:', error.message);
    },
  });
};

export const useUpdateMarker = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ markerId, data }: { markerId: number; data: Partial<SkyMarker> }) =>
      backendFetch(`/markers/${markerId}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, { markerId }) => {
      queryClient.invalidateQueries({ queryKey: ['skyMarkers'] });
      queryClient.invalidateQueries({ queryKey: ['skyMarker', markerId] });
    },
    onError: (error: Error) => {
      console.error('Failed to update marker:', error.message);
    },
  });
};

export const useDeleteMarker = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (markerId: number) => backendFetch(`/markers/${markerId}/`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skyMarkers'] });
    },
    onError: (error: Error) => {
      console.error('Failed to delete marker:', error.message);
    },
  });
};

export const useToggleMarkerTracking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (markerId: number) => backendFetch(`/markers/${markerId}/toggle_tracking/`, {
      method: 'POST',
    }),
    onSuccess: (_, markerId) => {
      queryClient.invalidateQueries({ queryKey: ['skyMarkers'] });
      queryClient.invalidateQueries({ queryKey: ['skyMarker', markerId] });
    },
    onError: (error: Error) => {
      console.error('Failed to update tracking status:', error.message);
    },
  });
};

export const useToggleMarkerPublic = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (markerId: number) => backendFetch(`/markers/${markerId}/toggle_public/`, {
      method: 'POST',
    }),
    onSuccess: (_, markerId) => {
      queryClient.invalidateQueries({ queryKey: ['skyMarkers'] });
      queryClient.invalidateQueries({ queryKey: ['skyMarker', markerId] });
    },
    onError: (error: Error) => {
      console.error('Failed to update public visibility:', error.message);
    },
  });
};

export const useRequestAIDescription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (markerId: number) => backendFetch(`/markers/${markerId}/update_ai_description/`, {
      method: 'POST',
    }),
    onSuccess: (_, markerId) => {
      queryClient.invalidateQueries({ queryKey: ['skyMarker', markerId] });
    },
    onError: (error: Error) => {
      console.error('Failed to generate AI description:', error.message);
    },
  });
};

// Sky Views Hooks
export const useSkyViews = (params?: {
  preset_type?: string;
  is_public?: boolean;
  search?: string;
  ordering?: string;
}) => {
  return useQuery({
    queryKey: ['skyViews', params],
    queryFn: () => backendFetch(`/views/${buildQueryParams(params)}`),
    staleTime: 30000,
  });
};

export const useSkyView = (viewId: number) => {
  return useQuery({
    queryKey: ['skyView', viewId],
    queryFn: () => backendFetch(`/views/${viewId}/`),
    enabled: !!viewId,
  });
};

export const useCreateView = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateViewData) => backendFetch('/views/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skyViews'] });
    },
    onError: (error: Error) => {
      console.error('Failed to save view:', error.message);
    },
  });
};

export const useLoadView = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (viewId: number) => backendFetch(`/views/${viewId}/load_view/`, {
      method: 'POST',
    }),
    onSuccess: (_, viewId) => {
      queryClient.invalidateQueries({ queryKey: ['skyViews'] });
      queryClient.invalidateQueries({ queryKey: ['skyView', viewId] });
    },
    onError: (error: Error) => {
      console.error('Failed to load view:', error.message);
    },
  });
};

// Discovery Hooks
export const usePublicDiscovery = () => {
  return useQuery({
    queryKey: ['publicDiscovery'],
    queryFn: () => backendFetch('/discover/'),
    staleTime: 60000, // 1 minute
  });
};

// AI Description Hook
export const useGenerateAIDescription = () => {
  return useMutation({
    mutationFn: async (data: {
      object_name: string;
      object_type?: string;
      coordinates?: { ra: number; dec: number };
      additional_context?: string;
    }) => {
      const { object_name, object_type, coordinates, additional_context } = data;
      
      if (!object_name?.trim()) {
        throw new Error('Object name is required');
      }
      
      // Create a detailed prompt for Murph AI
      let prompt = `Please provide a detailed astronomical description of ${object_name}`;
      
      if (object_type) {
        prompt += ` (${object_type})`;
      }
      
      if (coordinates) {
        prompt += ` located at RA ${coordinates.ra.toFixed(2)}°, Dec ${coordinates.dec.toFixed(2)}°`;
      }
      
      prompt += '. Include information about its type, distance, notable features, and any interesting facts for amateur astronomers.';
      
      if (additional_context) {
        prompt += ` Additional context: ${additional_context}`;
      }
      
      try {
        const response = await apiPostChat(prompt);
        
        if (!response || response.trim().length === 0) {
          throw new Error('Received empty response from AI service');
        }
        
        return {
          description: response
        };
      } catch (error) {
        console.error('AI generation error:', error);
        
        if (error instanceof Error) {
          throw error;
        }
        
        throw new Error('Failed to communicate with AI service');
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors
      if (error.message.includes('required') || error.message.includes('empty')) {
        return false;
      }
      return failureCount < 2;
    },
    onError: (error: Error) => {
      console.error('Failed to generate AI description:', error.message);
    },
  });
};

// Stats Hook
export const useSkymapStats = () => {
  return useQuery({
    queryKey: ['skymapStats'],
    queryFn: () => backendFetch('/stats/'),
    staleTime: 300000, // 5 minutes
  });
};