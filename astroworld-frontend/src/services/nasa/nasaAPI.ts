// src/services/nasa/nasaAPI.ts
// ======= UPDATED: All NASA API calls now go through Django backend =======
// No API keys needed in frontend - backend handles all NASA API communication

const BACKEND_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const NASA_API_BASE = `${BACKEND_BASE}/nasa`;

// Helper for authenticated backend requests
const backendFetch = async (endpoint: string, options?: RequestInit) => {
  const token = localStorage.getItem("accessToken");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options?.headers,
  };
  
  const response = await fetch(`${NASA_API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`Backend request failed: ${response.statusText}`);
  }
  
  return response.json();
};

export interface ApodItem {
  date: string;
  explanation: string;
  hdurl?: string;
  url: string;
  media_type: "image" | "video";
  title: string;
  copyright?: string;
}

export interface DonkiEvent {
  activityID?: string;
  messageType?: string;
  messageIssueTime?: string;
  messageBody?: string;
  messageID?: string;
  messageURL?: string;
}

export interface NeoCloseApproach {
  close_approach_date_full: string;
  relative_velocity: { kilometers_per_second: string };
  miss_distance: { lunar: string; kilometers: string };
  orbiting_body: string;
}

export interface NeoObject {
  id: string;
  name: string;
  absolute_magnitude_h: number;
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: NeoCloseApproach[];
  estimated_diameter: {
    kilometers: { estimated_diameter_min: number; estimated_diameter_max: number };
  };
}

export interface EpicItem {
  image: string; // image ID
  date: string;  // UTC timestamp
  caption?: string;
}

export interface MarsPhoto {
  id: number;
  img_src: string;
  earth_date: string;
  camera: { name: string; full_name: string };
  rover: { name: string; landing_date: string; status: string };
}

export interface ExoplanetCount { count: number }

// ======= NEW: NASA Image Library Types =======
export interface NASAMediaItem {
  nasa_id: string;
  title: string;
  description?: string;
  media_type: "image" | "video" | "audio";
  keywords?: string[];
  preview_url?: string;
  thumbnail_url?: string;
  original_url?: string;
  date_created: string;
  center?: string;
  photographer?: string;
}

// ======= NEW: Satellite TLE Types =======
export interface Satellite {
  satellite_id: number; // NORAD ID
  name: string;
  orbit_type?: string;
  tle_line1: string;
  tle_line2: string;
  tle_date: string;
}

// ======= NEW: GIBS Types =======
export interface GIBSLayer {
  id: string;
  title: string;
  subtitle?: string;
  format: string;
  tileMatrixSet: string;
  startDate?: string;
  endDate?: string;
  projections?: string[];
}

export interface GIBSTileUrlParams {
  layer: string;
  date: string;
  tileMatrixSet: string;
  z: number;
  x: number;
  y: number;
  format?: string;
}

export const nasa = {
  // ======= APOD =======
  async apod(date?: string): Promise<ApodItem> {
    const params = date ? `?date=${date}` : "";
    return backendFetch(`/proxy/apod/${params}`);
  },

  // ======= DONKI: Space Weather =======
  async donkiNotifications(startDateISO: string): Promise<DonkiEvent[]> {
    return backendFetch(`/proxy/donki/?start_date=${startDateISO}`);
  },

  // ======= NEO Feed =======
  async neowsFeed(start: string, end: string) {
    return backendFetch(`/proxy/neo/?start_date=${start}&end_date=${end}`) as Promise<{
      near_earth_objects: Record<string, NeoObject[]>;
    }>;
  },

  // ======= EPIC =======
  async epicMostRecent(): Promise<EpicItem[]> {
    return backendFetch("/proxy/epic/");
  },

  // EPIC image URL builder (backend provides full URLs now)
  epicImageUrl(dateISO: string, imageId: string, type: "png" | "jpg" = "jpg") {
    const d = new Date(dateISO);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${NASA_API_BASE}/proxy/epic/?date=${y}-${m}-${day}&image_id=${imageId}&type=${type}`;
  },

  // ======= Mars Rover Photos =======
  async marsLatest(rover: string = "curiosity"): Promise<{ latest_photos: MarsPhoto[] }> {
    return backendFetch(`/proxy/mars/?rover=${rover}`);
  },

  // ======= Exoplanet Count =======
  async exoplanetCount(): Promise<ExoplanetCount> {
    return backendFetch("/proxy/exoplanets/count/");
  },

  // ======= NASA Image Library (NEW) =======
  async imageSearch(params: {
    q: string;
    media_type?: "image" | "video" | "audio";
    year_start?: string;
    year_end?: string;
    page?: number;
  }): Promise<{ collection: { items: NASAMediaItem[] } }> {
    const searchParams: Record<string, string> = { q: params.q };
    if (params.media_type) searchParams.media_type = params.media_type;
    if (params.year_start) searchParams.year_start = params.year_start;
    if (params.year_end) searchParams.year_end = params.year_end;
    if (params.page) searchParams.page = params.page.toString();
    const queryParams = new URLSearchParams(searchParams).toString();
    return backendFetch(`/images/search/?${queryParams}`);
  },

  async imagePopular(): Promise<NASAMediaItem[]> {
    return backendFetch("/images/popular/");
  },

  async imageAsset(nasa_id: string): Promise<{ collection: { items: Array<{ href: string }> } }> {
    return backendFetch(`/images/asset/${nasa_id}/`);
  },

  async imageMetadata(nasa_id: string): Promise<Record<string, unknown>> {
    return backendFetch(`/images/metadata/${nasa_id}/`);
  },

  // ======= Satellite TLE Tracking (NEW) =======
  async tleSearch(search?: string): Promise<Satellite[]> {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    return backendFetch(`/tle/search/${params}`);
  },

  async tleById(satelliteId: number): Promise<Satellite> {
    return backendFetch(`/tle/${satelliteId}/`);
  },

  async tlePopular(): Promise<Satellite[]> {
    return backendFetch("/tle/popular/");
  },

  // ======= GIBS Satellite Imagery (NEW) =======
  async gibsLayers(): Promise<GIBSLayer[]> {
    return backendFetch("/gibs/layers/");
  },

  async gibsLatest(layerId: string): Promise<{ date: string; urls: { tile: string; wms: string } }> {
    return backendFetch(`/gibs/latest/${layerId}/`);
  },

  async gibsTileUrl(params: GIBSTileUrlParams): Promise<{ tile_url: string }> {
    const searchParams: Record<string, string> = {
      layer: params.layer,
      date: params.date,
      tileMatrixSet: params.tileMatrixSet,
      z: params.z.toString(),
      x: params.x.toString(),
      y: params.y.toString(),
    };
    if (params.format) searchParams.format = params.format;
    const queryParams = new URLSearchParams(searchParams).toString();
    return backendFetch(`/gibs/tile-url/?${queryParams}`);
  },

  async gibsWmsUrl(params: {
    layer: string;
    date: string;
    bbox: string;
    width: number;
    height: number;
    format?: string;
  }): Promise<{ wms_url: string }> {
    const searchParams: Record<string, string> = {
      layer: params.layer,
      date: params.date,
      bbox: params.bbox,
      width: params.width.toString(),
      height: params.height.toString(),
    };
    if (params.format) searchParams.format = params.format;
    const queryParams = new URLSearchParams(searchParams).toString();
    return backendFetch(`/gibs/wms-url/?${queryParams}`);
  },

  async gibsImagery(params: {
    layer: string;
    date: string;
    region: 'geographic' | 'arctic' | 'antarctic';
    format?: string;
    width?: number;
    height?: number;
  }): Promise<{ image_url: string; metadata?: Record<string, unknown> }> {
    const searchParams: Record<string, string> = {
      layer: params.layer,
      date: params.date,
      region: params.region,
    };
    if (params.format) searchParams.format = params.format;
    if (params.width) searchParams.width = params.width.toString();
    if (params.height) searchParams.height = params.height.toString();
    const queryParams = new URLSearchParams(searchParams).toString();
    return backendFetch(`/gibs/imagery/?${queryParams}`);
  },

  async gibsCapabilities(): Promise<Record<string, unknown>> {
    return backendFetch("/gibs/capabilities/");
  },
};
