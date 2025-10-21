// src/services/nasa/nasaServices.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with auth header support
const nasaAPIInstance = axios.create({
  baseURL: API_URL,
});

// Add auth interceptor to NASA API instance
nasaAPIInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// NASA API interfaces
export interface APOD {
  id: number;
  nasa_id: string;
  date: string;
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: 'image' | 'video';
  copyright?: string;
  created_at: string;
  updated_at: string;
  is_saved?: boolean;
}

export interface CloseApproach {
  close_approach_date: string;
  relative_velocity_kmh: number;
  miss_distance_km: number;
  orbiting_body: string;
}

export interface NearEarthObject {
  id: number;
  nasa_id: string;
  name: string;
  designation: string;
  is_potentially_hazardous: boolean;
  is_sentry_object: boolean;
  estimated_diameter_min_km: number;
  estimated_diameter_max_km: number;
  absolute_magnitude: number;
  next_close_approach_date?: string;
  next_close_approach_distance?: number;
  orbital_data?: any;
  close_approaches: CloseApproach[];
  next_approach?: CloseApproach;
  created_at: string;
  updated_at: string;
  is_saved?: boolean;
  is_tracked?: boolean;
}

export interface MarsRover {
  id: number;
  name: string;
  landing_date: string;
  launch_date: string;
  status: string;
  max_sol?: number;
  max_date?: string;
  total_photos?: number;
}

export interface MarsRoverPhoto {
  id: number;
  nasa_id: string;
  sol: number;
  img_src: string;
  earth_date: string;
  camera_name: string;
  camera_full_name: string;
  rover: MarsRover;
  created_at: string;
  updated_at: string;
  is_saved?: boolean;
}

export interface EPICImage {
  id: number;
  nasa_id: string;
  identifier: string;
  caption: string;
  image_url: string;
  date: string;
  centroid_coordinates?: any;
  dscovr_j2000_position?: any;
  lunar_j2000_position?: any;
  sun_j2000_position?: any;
  attitude_quaternions?: any;
  created_at: string;
  updated_at: string;
  is_saved?: boolean;
}

export interface Exoplanet {
  id: number;
  nasa_id: string;
  name: string;
  host_star: string;
  discovery_method: string;
  discovery_year?: number;
  orbital_period?: number;
  planet_radius?: number;
  planet_mass?: number;
  distance_from_earth?: number;
  equilibrium_temperature?: number;
  is_habitable_zone: boolean;
  stellar_magnitude?: number;
  created_at: string;
  updated_at: string;
  distance_light_years?: number;
  is_saved?: boolean;
  is_tracked?: boolean;
}

export interface SpaceWeatherEvent {
  id: number;
  nasa_id: string;
  event_type: string;
  event_time: string;
  link: string;
  summary: string;
  instruments: string[];
  created_at: string;
  updated_at: string;
  is_saved?: boolean;
  is_tracked?: boolean;
}

export interface EventGeometry {
  date: string;
  coordinates: [number, number];
  magnitude_value?: number;
  magnitude_unit?: string;
}

export interface NaturalEvent {
  id: number;
  nasa_id: string;
  title: string;
  description: string;
  link: string;
  closed: boolean;
  category_id: string;
  category_title: string;
  geometries: EventGeometry[];
  latest_geometry?: EventGeometry;
  created_at: string;
  updated_at: string;
  is_saved?: boolean;
  is_tracked?: boolean;
}

export interface SpaceEvent {
  id: number;
  nasa_id: string;
  title: string;
  description: string;
  event_type: 'ECLIPSE_SOLAR' | 'ECLIPSE_LUNAR' | 'SUPERMOON' | 'METEOR_SHOWER' | 
    'PLANETARY_ALIGNMENT' | 'CONJUNCTION' | 'COMET' | 'TRANSIT' | 'OCCULTATION' | 
    'EQUINOX' | 'SOLSTICE' | 'LAUNCH' | 'MISSION' | 'OTHER';
  event_type_display: string;
  event_date: string;
  end_date?: string;
  visibility: 'GLOBAL' | 'NORTHERN_HEMISPHERE' | 'SOUTHERN_HEMISPHERE' | 'PARTIAL' | 'LOCAL';
  visibility_display: string;
  location: string;
  coordinates?: [number, number]; // [longitude, latitude]
  magnitude?: number;
  peak_time?: string;
  duration_minutes?: number;
  image_url: string;
  source_url: string;
  source_name: string;
  is_featured: boolean;
  is_upcoming: boolean;
  created_at: string;
  updated_at: string;
  days_until_event: number;
  is_past: boolean;
  is_saved?: boolean;
  is_tracked?: boolean;
}

export interface UserSavedItem {
  id: number;
  item_type: string;
  item_id: string;
  saved_at: string;
  notes: string;
  tags: string[];
  item_data?: any;
}

export interface UserTrackedObject {
  id: number;
  object_type: string;
  object_id: string;
  notification_enabled: boolean;
  created_at: string;
  object_data?: any;
}

// API Filter interfaces
export interface APODFilters {
  startDate?: string;
  endDate?: string;
  count?: number;
}

export interface NEOFilters {
  startDate?: string;
  endDate?: string;
  hazardousOnly?: boolean;
  minDiameter?: number;
  maxDiameter?: number;
}

export interface MarsPhotosFilters {
  sol?: number;
  earthDate?: string;
  camera?: string;
  rover?: string;
  page?: number;
}

export interface ExoplanetFilters {
  search?: string;
  discoveryMethod?: string;
  discoveryYear?: number;
  habitableZone?: boolean;
  minRadius?: number;
  maxRadius?: number;
  page?: number;
}

export interface SpaceWeatherFilters {
  eventType?: string;
  startDate?: string;
  endDate?: string;
}

export interface NaturalEventFilters {
  category?: string;
  status?: 'open' | 'closed' | 'all';
  days?: number;
}

export interface SpaceEventFilters {
  type?: string;
  visibility?: string;
  time_filter?: 'upcoming' | 'past' | 'all';
  featured?: boolean;
  search?: string;
  page?: number;
}

// NASA Image Library interfaces
export interface NASAMediaItem {
  nasa_id: string;
  href: string;
  data: Array<{
    nasa_id: string;
    title: string;
    description?: string;
    description_508?: string;
    keywords?: string[];
    media_type: 'image' | 'video' | 'audio';
    center?: string;
    date_created?: string;
    photographer?: string;
    location?: string;
    secondary_creator?: string;
    album?: string[];
  }>;
  links?: Array<{
    href: string;
    rel: string;
    render?: string;
  }>;
}

export interface NASAImageSearchResult {
  collection: {
    version: string;
    href: string;
    items: NASAMediaItem[];
    metadata?: {
      total_hits: number;
    };
    links?: Array<{
      rel: string;
      href: string;
      prompt?: string;
    }>;
  };
}

export interface NASAImageFilters {
  q: string;
  media_type?: 'image' | 'video' | 'audio';
  year_start?: string;
  year_end?: string;
  page?: number;
  page_size?: number;
}

// Main NASA API service
export const nasaAPI = {
  // APOD endpoints
  getAPOD: (date?: string): Promise<{ data: APOD }> =>
    nasaAPIInstance.get(`/nasa/apod/${date ? date + '/' : 'latest/'}`),

  getAPODRange: (startDate?: string, endDate?: string): Promise<{ data: APOD[] }> =>
    nasaAPIInstance.get('/nasa/apod/range/', { params: { start_date: startDate, end_date: endDate } }),

  getRandomAPOD: (count: number = 1): Promise<{ data: APOD[] }> =>
    nasaAPIInstance.get('/nasa/apod/random/', { params: { count } }),

  // Near Earth Objects
  getNearEarthObjects: (filters: NEOFilters = {}): Promise<{ data: { results: NearEarthObject[], count: number } }> =>
    nasaAPIInstance.get('/nasa/neo/', { params: filters }),

  getNEOById: (nasa_id: string): Promise<{ data: NearEarthObject }> =>
    nasaAPIInstance.get(`/nasa/neo/${nasa_id}/`),

  getUpcomingNEOs: (days: number = 7): Promise<{ data: NearEarthObject[] }> =>
    nasaAPIInstance.get('/nasa/neo/upcoming/', { params: { days } }),

  getHazardousNEOs: (): Promise<{ data: NearEarthObject[] }> =>
    nasaAPIInstance.get('/nasa/neo/hazardous/'),

  // Mars Rover Photos
  getMarsPhotos: (filters: MarsPhotosFilters = {}): Promise<{ data: { results: MarsRoverPhoto[], count: number } }> =>
    nasaAPIInstance.get('/nasa/mars-photos/', { params: filters }),

  getMarsPhotoById: (nasa_id: string): Promise<{ data: MarsRoverPhoto }> =>
    nasaAPIInstance.get(`/nasa/mars-photos/${nasa_id}/`),

  getRoverManifest: (rover: string): Promise<{ data: any }> =>
    nasaAPIInstance.get(`/nasa/mars-rovers/${rover}/`),

  getLatestMarsPhotos: (rover?: string): Promise<{ data: MarsRoverPhoto[] }> =>
    nasaAPIInstance.get('/nasa/mars-photos/latest/', { params: { rover } }),

  // EPIC Images
  getEPICImages: (date?: string): Promise<{ data: { results: EPICImage[], count: number } }> =>
    nasaAPIInstance.get('/nasa/epic/', { params: { date } }),

  getEPICImageById: (nasa_id: string): Promise<{ data: EPICImage }> =>
    nasaAPIInstance.get(`/nasa/epic/${nasa_id}/`),

  getLatestEPIC: (): Promise<{ data: EPICImage[] }> =>
    nasaAPIInstance.get('/nasa/epic/latest/'),

  // Exoplanets
  getExoplanets: (filters: ExoplanetFilters = {}): Promise<{ data: { results: Exoplanet[], count: number } }> =>
    nasaAPIInstance.get('/nasa/exoplanets/', { params: filters }),

  getExoplanetById: (nasa_id: string): Promise<{ data: Exoplanet }> =>
    nasaAPIInstance.get(`/nasa/exoplanets/${nasa_id}/`),

  searchExoplanets: (query: string): Promise<{ data: Exoplanet[] }> =>
    nasaAPIInstance.get('/nasa/exoplanets/search/', { params: { q: query } }),

  getHabitableExoplanets: (): Promise<{ data: Exoplanet[] }> =>
    nasaAPIInstance.get('/nasa/exoplanets/habitable/'),

  // Space Weather Events
  getSpaceWeatherEvents: (filters: SpaceWeatherFilters = {}): Promise<{ data: { results: SpaceWeatherEvent[], count: number } }> =>
    nasaAPIInstance.get('/nasa/space-weather/', { params: filters }),

  getSpaceWeatherById: (nasa_id: string): Promise<{ data: SpaceWeatherEvent }> =>
    nasaAPIInstance.get(`/nasa/space-weather/${nasa_id}/`),

  getRecentSpaceWeather: (days: number = 30): Promise<{ data: SpaceWeatherEvent[] }> =>
    nasaAPIInstance.get('/nasa/space-weather/recent/', { params: { days } }),

  // Natural Events
  getNaturalEvents: (filters: NaturalEventFilters = {}): Promise<{ data: { results: NaturalEvent[], count: number } }> =>
    nasaAPIInstance.get('/nasa/natural-events/', { params: filters }),

  getNaturalEventById: (nasa_id: string): Promise<{ data: NaturalEvent }> =>
    nasaAPIInstance.get(`/nasa/natural-events/${nasa_id}/`),

  getActiveEvents: (): Promise<{ data: NaturalEvent[] }> =>
    nasaAPIInstance.get('/nasa/natural-events/active/'),

  getEventsByCategory: (category: string): Promise<{ data: NaturalEvent[] }> =>
    nasaAPIInstance.get(`/nasa/natural-events/category/${category}/`),

  // Space Events
  getSpaceEvents: (filters: SpaceEventFilters = {}): Promise<{ data: { results: SpaceEvent[], count: number } }> =>
    nasaAPIInstance.get('/nasa/space-events/', { params: filters }),

  getSpaceEventById: (nasa_id: string): Promise<{ data: SpaceEvent }> =>
    nasaAPIInstance.get(`/nasa/space-events/${nasa_id}/`),

  getFeaturedSpaceEvents: (): Promise<{ data: SpaceEvent[] }> =>
    nasaAPIInstance.get('/nasa/space-events/featured/'),

  getUpcomingSpaceEvents: (): Promise<{ data: SpaceEvent[] }> =>
    nasaAPIInstance.get('/nasa/space-events/upcoming/'),

  getSpaceEventsByType: (eventType: string): Promise<{ data: SpaceEvent[] }> =>
    nasaAPIInstance.get(`/nasa/space-events/type/${eventType}/`),

  // User Favorites & Tracking
  getUserFavorites: (): Promise<{ data: UserSavedItem[] }> =>
    nasaAPIInstance.get('/nasa/user/favorites/'),

  addToFavorites: (itemType: string, itemId: string, notes?: string, tags?: string[]): Promise<{ data: UserSavedItem }> =>
    nasaAPIInstance.post('/nasa/saved/', { 
      item_type: itemType, 
      item_id: itemId, 
      notes: notes || '', 
      tags: tags || [] 
    }),

  removeFromFavorites: (id: number): Promise<void> =>
    nasaAPIInstance.delete(`/nasa/saved/${id}/`),

  updateFavorite: (id: number, notes?: string, tags?: string[]): Promise<{ data: UserSavedItem }> =>
    nasaAPIInstance.patch(`/nasa/saved/${id}/`, { notes, tags }),

  toggleFavorite: (itemType: string, itemId: string): Promise<{ data: { favorited: boolean } }> =>
    nasaAPIInstance.post('/nasa/user/favorites/toggle/', { item_type: itemType, item_id: itemId }),

  // User Tracking
  getUserTracking: (): Promise<{ data: UserTrackedObject[] }> =>
    nasaAPIInstance.get('/nasa/user/tracking/'),

  addToTracking: (objectType: string, objectId: string): Promise<{ data: UserTrackedObject }> =>
    nasaAPIInstance.post('/nasa/tracked/', { object_type: objectType, object_id: objectId }),

  removeFromTracking: (id: number): Promise<void> =>
    nasaAPIInstance.delete(`/nasa/tracked/${id}/`),

  toggleTracking: (objectType: string, objectId: string): Promise<{ data: { tracking: boolean } }> =>
    nasaAPIInstance.post('/nasa/user/tracking/toggle/', { object_type: objectType, object_id: objectId }),

  updateTrackingNotifications: (id: number, enabled: boolean): Promise<{ data: UserTrackedObject }> =>
    nasaAPIInstance.patch(`/nasa/tracked/${id}/`, { notification_enabled: enabled }),

  // Analytics & Stats
  getUserStats: (): Promise<{ data: any }> =>
    nasaAPIInstance.get('/nasa/user/stats/'),

  getPopularContent: (contentType?: string): Promise<{ data: any[] }> =>
    nasaAPIInstance.get('/nasa/popular/', { params: { type: contentType } }),

  // Search across all NASA data
  searchAll: (query: string, types?: string[]): Promise<{ data: any }> =>
    nasaAPIInstance.get('/nasa/search/', { params: { q: query, types: types?.join(',') } }),

  // Sync data manually
  syncData: (dataType?: string): Promise<{ data: { message: string } }> =>
    nasaAPIInstance.post('/nasa/sync/', { type: dataType }),

  // Get API status and limits
  getAPIStatus: (): Promise<{ data: any }> =>
    nasaAPIInstance.get('/nasa/status/'),

  // NASA Image Library endpoints
  searchImages: (filters: NASAImageFilters): Promise<{ data: NASAImageSearchResult }> =>
    nasaAPIInstance.get('/nasa/images/search/', { params: filters }),

  getPopularImages: (limit: number = 20): Promise<{ data: NASAImageSearchResult }> =>
    nasaAPIInstance.get('/nasa/images/popular/', { params: { limit } }),

  getImageAsset: (nasa_id: string): Promise<{ data: any }> =>
    nasaAPIInstance.get(`/nasa/images/asset/${nasa_id}/`),

  getImageMetadata: (nasa_id: string): Promise<{ data: any }> =>
    nasaAPIInstance.get(`/nasa/images/metadata/${nasa_id}/`),

  // GIBS (Global Imagery Browse Services) endpoints
  getGIBSCapabilities: (): Promise<{ data: any }> =>
    nasaAPIInstance.get('/nasa/gibs/capabilities/'),

  getGIBSImagery: (date?: string, layer?: string, bbox?: string): Promise<{ data: any }> =>
    nasaAPIInstance.get('/nasa/gibs/imagery/', { params: { date, layer, bbox } }),
};

export default nasaAPI;