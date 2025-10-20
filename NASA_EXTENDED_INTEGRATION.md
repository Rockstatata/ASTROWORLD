# NASA Extended Integration Guide

## Overview

This document describes the complete NASA API integration in AstroWorld, including the three newly added services:
1. **NASA Image and Video Library** - Search and browse NASA's media collection
2. **TLE Satellite Tracking** - Track satellites in real-time using Two-Line Element sets
3. **GIBS (Global Imagery Browse Services)** - Satellite imagery visualization

## Architecture

### Backend-First Design (Security)
All NASA API calls are now made from the Django backend, not the frontend. This provides:
- **Security**: NASA API key never exposed to clients
- **Rate Limiting**: Centralized API usage control
- **Caching**: Reduces redundant NASA API calls
- **Error Handling**: Consistent error management

### Technology Stack
- **Backend**: Django 4.x + DRF (REST API)
- **Frontend**: React 19 + TypeScript + Vite
- **Caching**: Django cache framework (Redis/Memcached recommended)
- **Database**: SQLite (models for NASA Media and Satellites)

## Backend Implementation

### 1. Service Layer (`nasa_api/services.py`)

#### NASAImageLibraryService
Search and retrieve NASA images, videos, and audio.

**Methods**:
```python
search_media(query, media_type=None, year_start=None, year_end=None, page=1)
# Search NASA media library
# Returns: { 'collection': { 'items': [...] } }

get_asset_manifest(nasa_id)
# Get all available assets (resolutions) for a media item
# Returns: { 'collection': { 'items': [{ 'href': 'url' }] } }

get_metadata(nasa_id)
# Get detailed metadata for a media item
# Returns: { 'location': 'metadata_url' }

get_captions(nasa_id)
# Get captions/subtitles for video
# Returns: { 'location': 'captions_url' }

get_popular_images(limit=20)
# Get curated popular NASA images
# Returns: [{ 'nasa_id': '...', 'title': '...' }]
```

**Example Usage**:
```python
from nasa_api.services import nasa_image_service

# Search for Mars images from 2023
results = nasa_image_service.search_media(
    query="Mars",
    media_type="image",
    year_start="2023"
)

# Get popular images
popular = nasa_image_service.get_popular_images(limit=10)
```

#### TLEService
Two-Line Element satellite tracking data.

**Methods**:
```python
search_satellites(search=None, page=1)
# Search satellites by name
# Returns: { 'member': [{ 'satelliteId': 25544, 'name': 'ISS' }] }

get_satellite_by_id(satellite_id)
# Get TLE data for specific satellite (NORAD ID)
# Returns: { 'satelliteId': 25544, 'name': 'ISS', 'line1': '...', 'line2': '...' }

get_popular_satellites()
# Get TLE for ISS, Hubble, Tiangong, GPS, Starlink
# Returns: [{ 'satellite_id': 25544, 'name': 'ISS', 'tle_line1': '...', 'tle_line2': '...' }]

parse_tle(tle_line1, tle_line2)
# Parse TLE lines into orbital parameters
# Returns: { 'inclination': 51.6, 'period_minutes': 90.5, ... }
```

**Example Usage**:
```python
from nasa_api.services import tle_service

# Get ISS TLE
iss = tle_service.get_satellite_by_id(25544)

# Parse orbital parameters
orbital_params = tle_service.parse_tle(iss['line1'], iss['line2'])
print(f"ISS orbital period: {orbital_params['period_minutes']} minutes")
```

#### GIBSService
Global Imagery Browse Services for satellite imagery.

**Methods**:
```python
get_available_layers()
# Get all available GIBS imagery layers
# Returns: [{ 'id': 'MODIS_Terra_CorrectedReflectance_TrueColor', 'title': '...' }]

get_wmts_capabilities(projection='geographic')
# Get WMTS service capabilities XML
# Returns: { 'url': 'capabilities_url' }

get_wms_capabilities(projection='geographic')
# Get WMS service capabilities XML
# Returns: { 'url': 'capabilities_url' }

generate_tile_url(layer_id, date, tile_matrix_set, z, x, y, format='jpg')
# Generate WMTS tile URL for specific layer/date/tile
# Returns: 'https://gibs.earthdata.nasa.gov/wmts/.../tile.jpg'

generate_wms_url(layer_id, date, bbox, width, height, format='image/jpeg')
# Generate WMS GetMap URL
# Returns: 'https://gibs.earthdata.nasa.gov/wms/...'

get_latest_imagery(layer_id)
# Get latest available imagery for a layer
# Returns: { 'date': '2024-01-15', 'tile_url': '...', 'wms_url': '...' }
```

**Example Usage**:
```python
from nasa_api.services import gibs_service

# Get true color imagery
layers = gibs_service.get_available_layers()
modis_layer = next(l for l in layers if 'TrueColor' in l['id'])

# Get latest imagery
latest = gibs_service.get_latest_imagery(modis_layer['id'])

# Generate tile URL for web map
tile_url = gibs_service.generate_tile_url(
    layer_id=modis_layer['id'],
    date='2024-01-15',
    tile_matrix_set='GoogleMapsCompatible_Level9',
    z=3, x=4, y=2
)
```

### 2. Database Models (`nasa_api/models.py`)

#### NASAMediaItem
Stores NASA media library items.

**Fields**:
```python
nasa_id          # Unique NASA identifier
title            # Media title
description      # Full description
media_type       # 'image', 'video', or 'audio'
keywords         # JSON array of tags
preview_url      # Preview image URL
thumbnail_url    # Thumbnail image URL
original_url     # Original high-res URL
date_created     # When media was created
center           # NASA center (e.g., 'JPL')
photographer     # Photographer/creator
created_at       # When record was added to DB
updated_at       # Last update timestamp
```

#### Satellite
Stores satellite TLE data.

**Fields**:
```python
satellite_id     # NORAD catalog number (unique)
name             # Satellite name
orbit_type       # 'LEO', 'MEO', 'GEO', etc.
tle_line1        # TLE line 1
tle_line2        # TLE line 2
tle_date         # When TLE was generated
created_at       # When record was added to DB
updated_at       # Last update timestamp
```

### 3. API Endpoints (`nasa_api/views_extended.py` + `urls.py`)

#### NASA Image Library Endpoints

```
GET /api/nasa/images/search/?q=Mars&media_type=image&year_start=2023
# Search NASA media library
# Query params: q (required), media_type, year_start, year_end, page
# Returns: { 'collection': { 'items': [NASAMediaItem] } }

GET /api/nasa/images/popular/
# Get curated popular images
# Returns: [NASAMediaItem]

GET /api/nasa/images/asset/<nasa_id>/
# Get all available asset resolutions
# Returns: { 'collection': { 'items': [{ 'href': 'url' }] } }

GET /api/nasa/images/metadata/<nasa_id>/
# Get detailed metadata
# Returns: { metadata object }
```

#### TLE Satellite Endpoints

```
GET /api/nasa/tle/search/?search=ISS
# Search satellites by name
# Query params: search (optional), page
# Returns: [Satellite]

GET /api/nasa/tle/<satellite_id>/
# Get TLE for specific satellite (NORAD ID)
# Returns: Satellite object

GET /api/nasa/tle/popular/
# Get popular satellites (ISS, Hubble, Tiangong, etc.)
# Returns: [Satellite]
```

#### GIBS Imagery Endpoints

```
GET /api/nasa/gibs/layers/
# Get all available imagery layers
# Returns: [GIBSLayer]

GET /api/nasa/gibs/latest/<layer_id>/
# Get latest imagery for layer
# Returns: { 'date': '2024-01-15', 'urls': { 'tile': '...', 'wms': '...' } }

GET /api/nasa/gibs/tile-url/?layer=...&date=2024-01-15&z=3&x=4&y=2
# Generate WMTS tile URL
# Query params: layer, date, tileMatrixSet, z, x, y, format
# Returns: { 'tile_url': '...' }

GET /api/nasa/gibs/wms-url/?layer=...&date=2024-01-15&bbox=-180,-90,180,90&width=1024&height=512
# Generate WMS GetMap URL
# Query params: layer, date, bbox, width, height, format
# Returns: { 'wms_url': '...' }
```

#### Backend Proxy Endpoints (Consolidated)

These endpoints proxy the original 6 NASA APIs through the backend:

```
GET /api/nasa/proxy/apod/?date=2024-01-15
# Astronomy Picture of the Day
# Returns: { 'date': '...', 'title': '...', 'url': '...', 'explanation': '...' }

GET /api/nasa/proxy/neo/?start_date=2024-01-15&end_date=2024-01-16
# Near-Earth Objects feed
# Returns: { 'near_earth_objects': { '2024-01-15': [NEO] } }

GET /api/nasa/proxy/mars/?rover=curiosity
# Mars Rover photos
# Returns: { 'latest_photos': [MarsPhoto] }

GET /api/nasa/proxy/epic/
# Earth Polychromatic Imaging Camera
# Returns: [EPICImage]

GET /api/nasa/proxy/donki/?start_date=2024-01-01
# Space Weather (DONKI)
# Returns: [SpaceWeatherEvent]

GET /api/nasa/proxy/exoplanets/count/
# Exoplanet count
# Returns: { 'count': 5000 }
```

### 4. Caching Strategy

All endpoints implement caching to reduce NASA API calls:

| Endpoint | Cache TTL | Reason |
|----------|-----------|--------|
| APOD | 12 hours | Updates daily |
| NEO Feed | 6 hours | Updates ~4x/day |
| Mars Photos | 12 hours | Updates daily |
| EPIC | 12 hours | Updates daily |
| DONKI | 3 hours | Real-time events |
| Exoplanets | 24 hours | Rarely changes |
| Image Search | 1 hour | User-driven |
| Image Popular | 6 hours | Curated list |
| TLE Popular | 6 hours | Updates daily |
| TLE Search | 3 hours | Dynamic |
| GIBS Layers | 24 hours | Rarely changes |
| GIBS Latest | 12 hours | Updates daily |

Cache keys format: `nasa_{endpoint}_{params_hash}`

## Frontend Implementation

### 1. NASA API Service (`src/services/nasa/nasaAPI.ts`)

**Updated Architecture**:
- All methods now call backend endpoints via `/api/nasa/*`
- No direct NASA API calls
- No API key required in frontend
- Automatic authentication via JWT tokens

**New Methods**:

```typescript
// NASA Image Library
nasa.imageSearch(params: {
  q: string;
  media_type?: "image" | "video" | "audio";
  year_start?: string;
  year_end?: string;
  page?: number;
}): Promise<{ collection: { items: NASAMediaItem[] } }>

nasa.imagePopular(): Promise<NASAMediaItem[]>

nasa.imageAsset(nasa_id: string): Promise<{ collection: { items: Array<{ href: string }> } }>

nasa.imageMetadata(nasa_id: string): Promise<Record<string, unknown>>

// Satellite TLE
nasa.tleSearch(search?: string): Promise<Satellite[]>

nasa.tleById(satelliteId: number): Promise<Satellite>

nasa.tlePopular(): Promise<Satellite[]>

// GIBS Imagery
nasa.gibsLayers(): Promise<GIBSLayer[]>

nasa.gibsLatest(layerId: string): Promise<{ date: string; urls: { tile: string; wms: string } }>

nasa.gibsTileUrl(params: GIBSTileUrlParams): Promise<{ tile_url: string }>

nasa.gibsWmsUrl(params: WmsParams): Promise<{ wms_url: string }>
```

### 2. TypeScript Types

```typescript
// NASA Image Library
interface NASAMediaItem {
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

// Satellite TLE
interface Satellite {
  satellite_id: number; // NORAD ID
  name: string;
  orbit_type?: string;
  tle_line1: string;
  tle_line2: string;
  tle_date: string;
}

// GIBS
interface GIBSLayer {
  id: string;
  title: string;
  subtitle?: string;
  format: string;
  tileMatrixSet: string;
  startDate?: string;
  endDate?: string;
  projections?: string[];
}

interface GIBSTileUrlParams {
  layer: string;
  date: string;
  tileMatrixSet: string;
  z: number;
  x: number;
  y: number;
  format?: string;
}
```

### 3. React Hooks (To Be Created)

**useNASAImages Hook** (`src/hooks/nasa/useNASAImages.ts`):
```typescript
export function useNASAImages(query: string, options?: SearchOptions) {
  return useQuery({
    queryKey: ['nasa-images', query, options],
    queryFn: () => nasa.imageSearch({ q: query, ...options }),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function usePopularImages() {
  return useQuery({
    queryKey: ['nasa-images-popular'],
    queryFn: () => nasa.imagePopular(),
    staleTime: 1000 * 60 * 60 * 6, // 6 hours
  });
}
```

**useSatelliteTracking Hook** (`src/hooks/nasa/useSatelliteTracking.ts`):
```typescript
export function usePopularSatellites() {
  return useQuery({
    queryKey: ['satellites-popular'],
    queryFn: () => nasa.tlePopular(),
    staleTime: 1000 * 60 * 60 * 6, // 6 hours
    refetchInterval: 1000 * 60 * 60, // Refresh every hour
  });
}

export function useSatelliteById(satelliteId: number) {
  return useQuery({
    queryKey: ['satellite', satelliteId],
    queryFn: () => nasa.tleById(satelliteId),
    staleTime: 1000 * 60 * 60 * 3, // 3 hours
  });
}
```

**useGIBSImagery Hook** (`src/hooks/nasa/useGIBSImagery.ts`):
```typescript
export function useGIBSLayers() {
  return useQuery({
    queryKey: ['gibs-layers'],
    queryFn: () => nasa.gibsLayers(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

export function useLatestImagery(layerId: string) {
  return useQuery({
    queryKey: ['gibs-latest', layerId],
    queryFn: () => nasa.gibsLatest(layerId),
    staleTime: 1000 * 60 * 60 * 12, // 12 hours
  });
}
```

## Component Ideas

### 1. NASA Image Gallery Component

**Features**:
- Search NASA media library
- Filter by media type (image/video/audio)
- Filter by year range
- Beautiful masonry grid layout
- Lightbox for full-screen viewing
- Slideshow mode
- Download high-res images
- Share functionality

**Recommended Libraries**:
- `react-photo-album` - Masonry grid
- `yet-another-react-lightbox` - Lightbox
- `framer-motion` - Animations

### 2. Satellite Tracker Component

**Features**:
- Real-time satellite positions (ISS, Hubble, Tiangong, GPS, Starlink)
- 3D Earth visualization with satellite orbits
- Search satellites by name
- Show orbital parameters (inclination, period, altitude)
- Pass predictions (when satellite is overhead)
- Ground track visualization
- Live telemetry data

**Recommended Libraries**:
- `satellite.js` - TLE parsing & propagation
- `three.js` / `react-three-fiber` - 3D visualization
- `cesium` - Advanced 3D globe (alternative)
- `react-leaflet` - 2D ground track map

**Implementation Example**:
```typescript
import satellite from 'satellite.js';

function calculatePosition(tle1: string, tle2: string, date: Date) {
  const satrec = satellite.twoline2satrec(tle1, tle2);
  const positionAndVelocity = satellite.propagate(satrec, date);
  const positionEci = positionAndVelocity.position as satellite.EciVec3<number>;
  
  // Convert ECI to lat/lon/alt
  const gmst = satellite.gstime(date);
  const positionGd = satellite.eciToGeodetic(positionEci, gmst);
  
  return {
    latitude: satellite.degreesLat(positionGd.latitude),
    longitude: satellite.degreesLong(positionGd.longitude),
    altitude: positionGd.height,
  };
}
```

### 3. GIBS Satellite Imagery Viewer

**Features**:
- Interactive world map
- Multiple imagery layers (true color, infrared, vegetation, etc.)
- Date picker for historical imagery
- Layer opacity controls
- Compare mode (side-by-side or swipe)
- Animate time series
- Export imagery
- Measure tool

**Recommended Libraries**:
- `react-leaflet` - Base map
- `leaflet-tilelayer-wmts` - WMTS support
- `react-map-gl` - Mapbox alternative
- `openlayers` - Full-featured GIS

**Implementation Example**:
```typescript
import { TileLayer } from 'react-leaflet';

function GIBSTileLayer({ layer, date }: { layer: string; date: string }) {
  const tileUrl = `https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/${layer}/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`;
  
  return (
    <TileLayer
      url={tileUrl}
      attribution='NASA GIBS'
      maxZoom={9}
    />
  );
}
```

## Testing

### Backend Tests

```python
# tests/test_nasa_services.py
from nasa_api.services import nasa_image_service, tle_service, gibs_service

class TestNASAImageService:
    def test_search_media(self):
        results = nasa_image_service.search_media("Mars")
        assert 'collection' in results
        assert len(results['collection']['items']) > 0
    
    def test_get_popular_images(self):
        popular = nasa_image_service.get_popular_images(limit=5)
        assert len(popular) == 5
        assert all('nasa_id' in img for img in popular)

class TestTLEService:
    def test_get_iss_tle(self):
        iss = tle_service.get_satellite_by_id(25544)
        assert iss['satelliteId'] == 25544
        assert 'ISS' in iss['name'].upper()
        assert iss['line1'].startswith('1 25544')
    
    def test_parse_tle(self):
        iss = tle_service.get_satellite_by_id(25544)
        params = tle_service.parse_tle(iss['line1'], iss['line2'])
        assert 50 < params['inclination'] < 53  # ISS ~51.6°
        assert 88 < params['period_minutes'] < 93  # ISS ~90min

class TestGIBSService:
    def test_get_layers(self):
        layers = gibs_service.get_available_layers()
        assert len(layers) > 0
        assert any('TrueColor' in l['id'] for l in layers)
    
    def test_generate_tile_url(self):
        url = gibs_service.generate_tile_url(
            'MODIS_Terra_CorrectedReflectance_TrueColor',
            '2024-01-15',
            'GoogleMapsCompatible_Level9',
            z=3, x=4, y=2
        )
        assert 'gibs.earthdata.nasa.gov' in url
        assert '2024/01/15' in url
```

### Frontend Tests

```typescript
// tests/nasa.test.ts
import { nasa } from '@/services/nasa/nasaAPI';

describe('NASA API Service', () => {
  test('imageSearch returns results', async () => {
    const results = await nasa.imageSearch({ q: 'Mars' });
    expect(results.collection.items.length).toBeGreaterThan(0);
  });

  test('tlePopular returns ISS', async () => {
    const satellites = await nasa.tlePopular();
    const iss = satellites.find(s => s.satellite_id === 25544);
    expect(iss).toBeDefined();
    expect(iss?.name).toContain('ISS');
  });

  test('gibsLayers returns available layers', async () => {
    const layers = await nasa.gibsLayers();
    expect(layers.length).toBeGreaterThan(0);
    expect(layers.some(l => l.id.includes('TrueColor'))).toBe(true);
  });
});
```

## Deployment Considerations

### Environment Variables

**Backend** (`.env`):
```bash
NASA_API_KEY=your_nasa_api_key_here
DJANGO_SECRET_KEY=your_django_secret
DEBUG=False
ALLOWED_HOSTS=your-domain.com
CACHE_BACKEND=redis://localhost:6379/1
```

**Frontend** (`.env`):
```bash
VITE_API_URL=https://your-backend-domain.com/api
# No NASA_API_KEY needed!
```

### Performance Optimization

1. **Enable Redis Caching**:
```python
# settings.py
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}
```

2. **Add Celery Tasks for Background Updates**:
```python
# tasks.py
from celery import shared_task
from .services import tle_service

@shared_task
def update_popular_satellites():
    """Update TLE data for popular satellites every hour"""
    satellites = tle_service.get_popular_satellites()
    # Save to database
    for sat_data in satellites:
        Satellite.objects.update_or_create(
            satellite_id=sat_data['satellite_id'],
            defaults=sat_data
        )
```

3. **CDN for Static Assets**:
- Serve NASA images through CloudFlare or AWS CloudFront
- Cache GIBS tiles at edge locations

### Rate Limiting

Implement rate limiting to protect backend:

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour'
    }
}
```

## Troubleshooting

### Common Issues

**1. NASA API Rate Limit Exceeded**
- Increase cache TTL values
- Implement request throttling
- Use NASA API key instead of DEMO_KEY

**2. GIBS Tiles Not Loading**
- Check date format (YYYY-MM-DD)
- Verify layer ID matches GIBS documentation
- Ensure tile coordinates (z/x/y) are within bounds

**3. TLE Data Outdated**
- TLE data becomes inaccurate after ~1 week
- Implement daily refresh task with Celery
- Cache TLE for max 24 hours

**4. Frontend Not Receiving Data**
- Check CORS settings in Django
- Verify JWT token is being sent in headers
- Check network tab for API errors

### Debug Mode

Enable verbose logging:

```python
# settings.py
LOGGING = {
    'version': 1,
    'handlers': {
        'file': {
            'class': 'logging.FileHandler',
            'filename': 'nasa_api.log',
        },
    },
    'loggers': {
        'nasa_api': {
            'handlers': ['file'],
            'level': 'DEBUG',
        },
    },
}
```

## Resources

### NASA API Documentation
- [NASA APIs Portal](https://api.nasa.gov/)
- [NASA Image Library API](https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf)
- [TLE API Docs](https://tle.ivanstanojevic.me/api/docs)
- [GIBS Documentation](https://nasa-gibs.github.io/gibs-api-docs/)

### Libraries
- [satellite.js](https://github.com/shashwatak/satellite-js) - TLE propagation
- [react-leaflet](https://react-leaflet.js.org/) - Map component
- [yet-another-react-lightbox](https://yet-another-react-lightbox.com/) - Image viewer

### NASA Resources
- [Earthdata](https://earthdata.nasa.gov/) - Earth observation data
- [Space Station Tracker](https://spotthestation.nasa.gov/) - ISS tracking
- [Eyes on the Solar System](https://eyes.nasa.gov/) - 3D visualization

## Future Enhancements

1. **NASA Exoplanet Archive** - Detailed exoplanet explorer
2. **NASA FIRMS** - Fire Information for Resource Management (wildfires)
3. **NASA SSD/CNEOS** - Small-Body Database (asteroids, comets)
4. **NASA Techport** - NASA technology portfolio
5. **NASA Mars Weather** - InSight lander weather data
6. **Real-time ISS Position** - Live ISS tracking with crew info
7. **AR Satellite Viewer** - View satellites in augmented reality
8. **Social Features** - Share favorite images, follow missions

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**Maintained By**: AstroWorld Development Team
