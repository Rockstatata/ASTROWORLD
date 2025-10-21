// Skymap API service for interacting with backend skymap endpoints
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
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  // For responses with no content (like DELETE 204), return null
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
};// Types for Skymap API
export interface SkyMarker {
  id: number;
  user: {
    id: number;
    username: string;
    full_name?: string;
  };
  name: string;
  custom_name?: string;
  display_name: string;
  object_type: string;
  object_id?: string;
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
  observation_count: number;
}

export interface SkyView {
  id: number;
  user: {
    id: number;
    username: string;
    full_name?: string;
  };
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

export interface MarkerObservation {
  id: number;
  marker: SkyMarker;
  user: {
    id: number;
    username: string;
  };
  observation_type: string;
  observation_date: string;
  duration_minutes?: number;
  seeing_conditions?: number;
  weather_notes?: string;
  equipment: Record<string, unknown>;
  notes: string;
  sketch_image?: string;
  photo_image?: string;
  location?: Record<string, unknown>;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIDescriptionRequest {
  object_name: string;
  object_type?: string;
  coordinates?: {
    ra: number;
    dec: number;
  };
  additional_context?: string;
}

export interface AIDescriptionResponse {
  description: string;
  generated_at: string;
  confidence?: number;
  sources?: string[];
}

export interface PublicDiscoveryResponse {
  featured_markers: SkyMarker[];
  recent_markers: SkyMarker[];
  popular_views: SkyView[];
}

export interface SkymapStats {
  summary: {
    total_markers: number;
    tracking_markers: number;
    public_markers: number;
    total_views: number;
    total_view_loads: number;
    total_observations: number;
  };
  object_type_distribution: Array<{
    object_type: string;
    count: number;
  }>;
  recent_activity: {
    markers: SkyMarker[];
    observations: MarkerObservation[];
  };
}

// Sky Marker API endpoints
export const skyMarkerApi = {
  // Get all user's markers
  getMarkers: async (params?: {
    object_type?: string;
    is_tracking?: boolean;
    is_public?: boolean;
    tags?: string;
    search?: string;
    ordering?: string;
  }) => {
    return backendFetch('/markers/' + buildQueryParams(params));
  },

  // Create new marker
  createMarker: async (data: {
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
  }) => {
    return backendFetch('/markers/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Get specific marker
  getMarker: async (markerId: number) => {
    return backendFetch(`/markers/${markerId}/`);
  },

  // Update marker
  updateMarker: async (markerId: number, data: Partial<SkyMarker>) => {
    return backendFetch(`/markers/${markerId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  // Delete marker
  deleteMarker: async (markerId: number) => {
    return backendFetch(`/markers/${markerId}/`, {
      method: 'DELETE'
    });
  },

  // Get tracking markers
  getTrackingMarkers: async () => {
    return backendFetch('/markers/tracking/');
  },

  // Toggle tracking status
  toggleTracking: async (markerId: number) => {
    return backendFetch(`/markers/${markerId}/toggle_tracking/`, {
      method: 'POST'
    });
  },

  // Toggle public status
  togglePublic: async (markerId: number) => {
    return backendFetch(`/markers/${markerId}/toggle_public/`, {
      method: 'POST'
    });
  },

  // Update AI description
  updateAIDescription: async (markerId: number) => {
    return backendFetch(`/markers/${markerId}/update_ai_description/`, {
      method: 'POST'
    });
  },

  // Find nearby markers
  getNearbyMarkers: async (ra: number, dec: number, radius = 5) => {
    return backendFetch('/markers/nearby/' + buildQueryParams({ ra, dec, radius }));
  },
};

// Sky View API endpoints
export const skyViewApi = {
  // Get all user's views
  getViews: async (params?: {
    preset_type?: string;
    is_public?: boolean;
    search?: string;
    ordering?: string;
  }) => {
    return backendFetch('/views/' + buildQueryParams(params));
  },

  // Create new view
  createView: async (data: {
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
  }) => {
    return backendFetch('/views/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Get specific view
  getView: async (viewId: number) => {
    return backendFetch(`/views/${viewId}/`);
  },

  // Update view
  updateView: async (viewId: number, data: Partial<SkyView>) => {
    return backendFetch(`/views/${viewId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  // Delete view
  deleteView: async (viewId: number) => {
    return backendFetch(`/views/${viewId}/`, {
      method: 'DELETE'
    });
  },

  // Load view (increments usage count)
  loadView: async (viewId: number) => {
    return backendFetch(`/views/${viewId}/load_view/`, {
      method: 'POST'
    });
  },

  // Toggle public status
  togglePublic: async (viewId: number) => {
    return backendFetch(`/views/${viewId}/toggle_public/`, {
      method: 'POST'
    });
  },

  // Get popular views
  getPopularViews: async () => {
    return backendFetch('/views/popular/');
  },
};

// Marker Observation API endpoints
export const observationApi = {
  // Get all user's observations
  getObservations: async (params?: {
    marker_id?: number;
    observation_type?: string;
    search?: string;
    ordering?: string;
  }) => {
    return backendFetch('/observations/' + buildQueryParams(params));
  },

  // Create new observation
  createObservation: async (data: {
    marker_id: number;
    observation_type?: string;
    observation_date?: string;
    duration_minutes?: number;
    seeing_conditions?: number;
    weather_notes?: string;
    equipment?: Record<string, unknown>;
    notes: string;
    sketch_image?: string;
    photo_image?: string;
    location?: Record<string, unknown>;
    is_public?: boolean;
  }) => {
    return backendFetch('/observations/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Get specific observation
  getObservation: async (observationId: number) => {
    return backendFetch(`/observations/${observationId}/`);
  },

  // Update observation
  updateObservation: async (observationId: number, data: Partial<MarkerObservation>) => {
    return backendFetch(`/observations/${observationId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  // Delete observation
  deleteObservation: async (observationId: number) => {
    return backendFetch(`/observations/${observationId}/`, {
      method: 'DELETE'
    });
  },
};

// AI Description API
export const aiApi = {
  // Generate AI description for celestial object
  generateDescription: async (data: AIDescriptionRequest) => {
    return backendFetch('/ai-description/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
};

// Public Discovery API
export const discoveryApi = {
  // Get public markers and views for discovery
  getPublicContent: async () => {
    return backendFetch('/discover/');
  },

  // Share/discover a marker
  shareMarker: async (data: {
    marker_id: number;
    discovery_source?: string;
    rating?: number;
  }) => {
    return backendFetch('/share/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Get user's discovered markers
  getDiscoveredMarkers: async () => {
    return backendFetch('/share/');
  },
};

// Stats API
export const statsApi = {
  // Get user's skymap statistics
  getStats: async () => {
    return backendFetch('/stats/');
  },
};

// Export all APIs
export default {
  markers: skyMarkerApi,
  views: skyViewApi,
  observations: observationApi,
  ai: aiApi,
  discovery: discoveryApi,
  stats: statsApi,
};