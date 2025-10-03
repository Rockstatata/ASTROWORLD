// src/services/nasa/nasaServices.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

// Main NASA API service
export const nasaAPI = {
  // APOD endpoints
  getAPOD: (date?: string): Promise<{ data: APOD }> =>
    axios.get(`/api/nasa/apod/${date ? date + '/' : 'latest/'}`),

  getAPODRange: (startDate?: string, endDate?: string): Promise<{ data: APOD[] }> =>
    axios.get('/api/nasa/apod/range/', { params: { start_date: startDate, end_date: endDate } }),

  getRandomAPOD: (count: number = 1): Promise<{ data: APOD[] }> =>
    axios.get('/api/nasa/apod/random/', { params: { count } }),

  // Near Earth Objects
  getNearEarthObjects: (filters: NEOFilters = {}): Promise<{ data: { results: NearEarthObject[], count: number } }> =>
    axios.get('/api/nasa/neo/', { params: filters }),

  getNEOById: (nasa_id: string): Promise<{ data: NearEarthObject }> =>
    axios.get(`/api/nasa/neo/${nasa_id}/`),

  getUpcomingNEOs: (days: number = 7): Promise<{ data: NearEarthObject[] }> =>
    axios.get('/api/nasa/neo/upcoming/', { params: { days } }),

  getHazardousNEOs: (): Promise<{ data: NearEarthObject[] }> =>
    axios.get('/api/nasa/neo/hazardous/'),

  // Mars Rover Photos
  getMarsPhotos: (filters: MarsPhotosFilters = {}): Promise<{ data: { results: MarsRoverPhoto[], count: number } }> =>
    axios.get('/api/nasa/mars-photos/', { params: filters }),

  getMarsPhotoById: (nasa_id: string): Promise<{ data: MarsRoverPhoto }> =>
    axios.get(`/api/nasa/mars-photos/${nasa_id}/`),

  getRoverManifest: (rover: string): Promise<{ data: any }> =>
    axios.get(`/api/nasa/mars-rovers/${rover}/`),

  getLatestMarsPhotos: (rover?: string): Promise<{ data: MarsRoverPhoto[] }> =>
    axios.get('/api/nasa/mars-photos/latest/', { params: { rover } }),

  // EPIC Images
  getEPICImages: (date?: string): Promise<{ data: { results: EPICImage[], count: number } }> =>
    axios.get('/api/nasa/epic/', { params: { date } }),

  getEPICImageById: (nasa_id: string): Promise<{ data: EPICImage }> =>
    axios.get(`/api/nasa/epic/${nasa_id}/`),

  getLatestEPIC: (): Promise<{ data: EPICImage[] }> =>
    axios.get('/api/nasa/epic/latest/'),

  // Exoplanets
  getExoplanets: (filters: ExoplanetFilters = {}): Promise<{ data: { results: Exoplanet[], count: number } }> =>
    axios.get('/api/nasa/exoplanets/', { params: filters }),

  getExoplanetById: (nasa_id: string): Promise<{ data: Exoplanet }> =>
    axios.get(`/api/nasa/exoplanets/${nasa_id}/`),

  searchExoplanets: (query: string): Promise<{ data: Exoplanet[] }> =>
    axios.get('/api/nasa/exoplanets/search/', { params: { q: query } }),

  getHabitableExoplanets: (): Promise<{ data: Exoplanet[] }> =>
    axios.get('/api/nasa/exoplanets/habitable/'),

  // Space Weather Events
  getSpaceWeatherEvents: (filters: SpaceWeatherFilters = {}): Promise<{ data: { results: SpaceWeatherEvent[], count: number } }> =>
    axios.get('/api/nasa/space-weather/', { params: filters }),

  getSpaceWeatherById: (nasa_id: string): Promise<{ data: SpaceWeatherEvent }> =>
    axios.get(`/api/nasa/space-weather/${nasa_id}/`),

  getRecentSpaceWeather: (days: number = 30): Promise<{ data: SpaceWeatherEvent[] }> =>
    axios.get('/api/nasa/space-weather/recent/', { params: { days } }),

  // Natural Events
  getNaturalEvents: (filters: NaturalEventFilters = {}): Promise<{ data: { results: NaturalEvent[], count: number } }> =>
    axios.get('/api/nasa/natural-events/', { params: filters }),

  getNaturalEventById: (nasa_id: string): Promise<{ data: NaturalEvent }> =>
    axios.get(`/api/nasa/natural-events/${nasa_id}/`),

  getActiveEvents: (): Promise<{ data: NaturalEvent[] }> =>
    axios.get('/api/nasa/natural-events/active/'),

  getEventsByCategory: (category: string): Promise<{ data: NaturalEvent[] }> =>
    axios.get(`/api/nasa/natural-events/category/${category}/`),

  // User Favorites & Tracking
  getUserFavorites: (): Promise<{ data: UserSavedItem[] }> =>
    axios.get('/api/nasa/user/favorites/'),

  addToFavorites: (itemType: string, itemId: string, notes?: string, tags?: string[]): Promise<{ data: UserSavedItem }> =>
    axios.post('/api/nasa/saved/', { 
      item_type: itemType, 
      item_id: itemId, 
      notes: notes || '', 
      tags: tags || [] 
    }),

  removeFromFavorites: (id: number): Promise<void> =>
    axios.delete(`/api/nasa/saved/${id}/`),

  updateFavorite: (id: number, notes?: string, tags?: string[]): Promise<{ data: UserSavedItem }> =>
    axios.patch(`/api/nasa/saved/${id}/`, { notes, tags }),

  toggleFavorite: (itemType: string, itemId: string): Promise<{ data: { favorited: boolean } }> =>
    axios.post('/api/nasa/user/favorites/toggle/', { item_type: itemType, item_id: itemId }),

  // User Tracking
  getUserTracking: (): Promise<{ data: UserTrackedObject[] }> =>
    axios.get('/api/nasa/user/tracking/'),

  addToTracking: (objectType: string, objectId: string): Promise<{ data: UserTrackedObject }> =>
    axios.post('/api/nasa/tracked/', { object_type: objectType, object_id: objectId }),

  removeFromTracking: (id: number): Promise<void> =>
    axios.delete(`/api/nasa/tracked/${id}/`),

  toggleTracking: (objectType: string, objectId: string): Promise<{ data: { tracking: boolean } }> =>
    axios.post('/api/nasa/user/tracking/toggle/', { object_type: objectType, object_id: objectId }),

  updateTrackingNotifications: (id: number, enabled: boolean): Promise<{ data: UserTrackedObject }> =>
    axios.patch(`/api/nasa/tracked/${id}/`, { notification_enabled: enabled }),

  // Analytics & Stats
  getUserStats: (): Promise<{ data: any }> =>
    axios.get('/api/nasa/user/stats/'),

  getPopularContent: (contentType?: string): Promise<{ data: any[] }> =>
    axios.get('/api/nasa/popular/', { params: { type: contentType } }),

  // Search across all NASA data
  searchAll: (query: string, types?: string[]): Promise<{ data: any }> =>
    axios.get('/api/nasa/search/', { params: { q: query, types: types?.join(',') } }),

  // Sync data manually
  syncData: (dataType?: string): Promise<{ data: { message: string } }> =>
    axios.post('/api/nasa/sync/', { type: dataType }),

  // Get API status and limits
  getAPIStatus: (): Promise<{ data: any }> =>
    axios.get('/api/nasa/status/'),
};

export default nasaAPI;