// Space Events API service - communicates with Django backend

const BACKEND_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const SPACE_EVENTS_API_BASE = `${BACKEND_BASE}/nasa/space-events`;

// Helper for authenticated backend requests
const backendFetch = async (endpoint: string, options?: RequestInit) => {
  const token = localStorage.getItem("accessToken");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> || {}),
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${SPACE_EVENTS_API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`Space Events API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export interface SpaceEvent {
  id: number;
  nasa_id: string;
  title: string;
  description: string;
  event_type: string;
  event_date: string;
  end_date?: string;
  visibility: string;
  location?: string;
  coordinates?: [number, number];
  magnitude?: number;
  peak_time?: string;
  duration_minutes?: number;
  image_url?: string;
  source_url?: string;
  source_name?: string;
  is_featured: boolean;
  is_upcoming: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

class SpaceEventsService {
  async getUpcomingEvents(): Promise<SpaceEvent[]> {
    return await backendFetch('/upcoming/');
  }

  async getFeaturedEvents(): Promise<SpaceEvent[]> {
    return await backendFetch('/featured/');
  }

  async getEventsByType(eventType: string): Promise<SpaceEvent[]> {
    return await backendFetch(`/type/${eventType}/`);
  }

  async getAllEvents(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    event_type?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<PaginatedResponse<SpaceEvent>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.event_type) queryParams.append('event_type', params.event_type);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const endpoint = `/?${queryParams.toString()}`;
    return await backendFetch(endpoint);
  }

  async syncEvents(): Promise<{ message: string; count: number }> {
    return await backendFetch('/sync/', { method: 'POST' });
  }
}

export const spaceEventsService = new SpaceEventsService();
export default spaceEventsService;