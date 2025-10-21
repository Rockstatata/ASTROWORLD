// SpaceX API service - communicates with Django backend

const BACKEND_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const SPACEX_API_BASE = `${BACKEND_BASE}/spacex`;

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

  const response = await fetch(`${SPACEX_API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`SpaceX API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export interface SpaceXLaunch {
  id: number;
  spacex_id: string;
  flight_number: number;
  mission_name: string;
  launch_date_utc: string;
  launch_date_local: string;
  rocket?: {
    id: number;
    name: string;
    type: string;
  };
  launchpad?: {
    id: number;
    name: string;
    full_name: string;
  };
  launch_success: boolean | null;
  details?: string;
  links: {
    patch?: {
      small?: string;
      large?: string;
    };
    webcast?: string;
    article_link?: string;
    wikipedia?: string;
  };
  upcoming: boolean;
  auto_update: boolean;
}

export interface SpaceXRocket {
  id: number;
  spacex_id: string;
  name: string;
  type: string;
  active: boolean;
  stages: number;
  boosters: number;
  cost_per_launch: number | null;
  success_rate_pct: number | null;
  first_flight: string;
  country: string;
  company: string;
  height_meters: number | null;
  height_feet: number | null;
  diameter_meters: number | null;
  diameter_feet: number | null;
  mass_kg: number | null;
  mass_lb: number | null;
  payload_weights: Record<string, number | object>;
  description: string;
  wikipedia: string;
  flickr_images: string[];
}

export interface SpaceXHistoricalEvent {
  id: number;
  spacex_id: string;
  title: string;
  event_date_utc: string;
  event_date_unix: number;
  details: string;
  links: {
    reddit?: string;
    article?: string;
    wikipedia?: string;
  };
}

export interface SpaceXStats {
  total_launches: number;
  successful_launches: number;
  upcoming_launches: number;
  total_rockets: number;
  active_rockets: number;
  total_missions: number;
  historical_events: number;
  starlink_satellites: number;
  cores: number;
  capsules: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

class SpaceXService {
  async getLaunches(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    status?: string;
    rocket?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<PaginatedResponse<SpaceXLaunch>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.rocket) queryParams.append('rocket', params.rocket);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const endpoint = `/launches/?${queryParams.toString()}`;
    return await backendFetch(endpoint);
  }

  async getUpcomingLaunches(limit?: number): Promise<SpaceXLaunch[]> {
    const queryParams = limit ? `?limit=${limit}` : '';
    return await backendFetch(`/launches/upcoming/${queryParams}`);
  }

  async getLatestLaunch(): Promise<SpaceXLaunch> {
    return await backendFetch(`/launches/latest/`);
  }

  async getNextLaunch(): Promise<SpaceXLaunch> {
    return await backendFetch(`/launches/next/`);
  }

  async getLaunch(spacexId: string): Promise<SpaceXLaunch> {
    return await backendFetch(`/launches/${spacexId}/`);
  }

  async getRockets(): Promise<PaginatedResponse<SpaceXRocket>> {
    return await backendFetch(`/rockets/`);
  }

  async getRocket(spacexId: string): Promise<SpaceXRocket> {
    return await backendFetch(`/rockets/${spacexId}/`);
  }

  async getHistoricalEvents(params?: {
    page?: number;
    search?: string;
    year?: number;
  }): Promise<PaginatedResponse<SpaceXHistoricalEvent>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.year) queryParams.append('year', params.year.toString());

    const endpoint = `/history/?${queryParams.toString()}`;
    return await backendFetch(endpoint);
  }

  async getStats(): Promise<SpaceXStats> {
    return await backendFetch(`/stats/`);
  }

  async search(query: string): Promise<{
    launches: SpaceXLaunch[];
    rockets: SpaceXRocket[];
    historical_events: SpaceXHistoricalEvent[];
  }> {
    return await backendFetch(`/search/?q=${encodeURIComponent(query)}`);
  }

  // User interaction methods
  async saveLaunch(launchId: number): Promise<{ favorited: boolean }> {
    return await backendFetch(`/user/favorites/toggle/`, { 
      method: 'POST',
      body: JSON.stringify({ 
        item_type: 'launch', 
        item_id: launchId.toString() 
      })
    });
  }

  async unsaveLaunch(launchId: number): Promise<{ favorited: boolean }> {
    return this.saveLaunch(launchId);
  }

  async trackLaunch(launchId: number, notifyBeforeHours?: number): Promise<{ tracking: boolean }> {
    return await backendFetch(`/user/tracking/toggle/`, { 
      method: 'POST',
      body: JSON.stringify({ 
        launch_id: launchId.toString(),
        notify_before_hours: notifyBeforeHours || 24
      })
    });
  }

  async untrackLaunch(launchId: number): Promise<{ tracking: boolean }> {
    return this.trackLaunch(launchId);
  }

  async getSavedLaunches(): Promise<PaginatedResponse<{ 
    id: number; 
    item_type: string; 
    item_id: string; 
    notes: string; 
    tags: string[]; 
    saved_at: string; 
  }>> {
    return await backendFetch(`/user/favorites/?item_type=launch`);
  }

  async getTrackedLaunches(): Promise<PaginatedResponse<{ 
    id: number; 
    user: number; 
    launch: SpaceXLaunch; 
    notification_enabled: boolean; 
    notify_before_hours: number; 
    created_at: string; 
  }>> {
    return await backendFetch(`/user/tracking/`);
  }
}

export const spaceXService = new SpaceXService();
export default spaceXService;