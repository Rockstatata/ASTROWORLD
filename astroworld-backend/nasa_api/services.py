import requests
import logging
from datetime import datetime, timedelta
from django.conf import settings
from django.utils import timezone
from django.core.cache import cache
from typing import Optional, Dict, List, Any
import time

from .models import (
    APOD, NearEarthObject, NEOCloseApproach, MarsRover, MarsRoverPhoto,
    EPICImage, Exoplanet, SpaceWeatherEvent, NaturalEvent, NaturalEventGeometry,
    APIUsageLog
)

logger = logging.getLogger(__name__)

class NASAAPIService:
    """Base service for NASA API interactions"""
    
    def __init__(self):
        self.api_key = settings.NASA_API_KEY
        self.base_url = "https://api.nasa.gov"
        self.session = requests.Session()
        
    def _make_request(self, endpoint: str, params: Dict = None) -> Optional[Dict]:
        """Make a request to NASA API with error handling and logging"""
        if params is None:
            params = {}
        
        params['api_key'] = self.api_key
        url = f"{self.base_url}/{endpoint}"
        
        start_time = time.time()
        
        try:
            response = self.session.get(url, params=params, timeout=30)
            response_time = time.time() - start_time
            
            # Log API usage
            APIUsageLog.objects.create(
                endpoint=endpoint,
                timestamp=timezone.now(),
                response_time=response_time,
                status_code=response.status_code
            )
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"NASA API request failed for {endpoint}: {str(e)}")
            APIUsageLog.objects.create(
                endpoint=endpoint,
                timestamp=timezone.now(),
                response_time=time.time() - start_time,
                status_code=getattr(e.response, 'status_code', 0),
                error_message=str(e)
            )
            return None

class APODService(NASAAPIService):
    """Astronomy Picture of the Day service"""
    
    def fetch_apod(self, date: datetime = None, count: int = None) -> Optional[Dict]:
        """Fetch APOD for specific date or random images"""
        params = {}
        
        if date:
            params['date'] = date.strftime('%Y-%m-%d')
        elif count:
            params['count'] = min(count, 100)  # NASA API limit
            
        return self._make_request('planetary/apod', params)
    
    def sync_apod_data(self, days_back: int = 7) -> int:
        """Sync APOD data for the last N days"""
        synced_count = 0
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days_back)
        
        current_date = start_date
        while current_date <= end_date:
            # Check if we already have this date
            if not APOD.objects.filter(date=current_date).exists():
                data = self.fetch_apod(current_date)
                if data and 'error' not in data:
                    try:
                        APOD.objects.create(
                            nasa_id=f"apod_{current_date.strftime('%Y%m%d')}",
                            date=current_date,
                            title=data.get('title', ''),
                            explanation=data.get('explanation', ''),
                            url=data.get('url', ''),
                            hdurl=data.get('hdurl'),
                            media_type=data.get('media_type', 'image'),
                            copyright=data.get('copyright')
                        )
                        synced_count += 1
                    except Exception as e:
                        logger.error(f"Error saving APOD for {current_date}: {str(e)}")
            
            current_date += timedelta(days=1)
            time.sleep(0.1)  # Rate limiting
        
        return synced_count

class NEOService(NASAAPIService):
    """Near Earth Objects service"""
    
    def fetch_neo_feed(self, start_date: datetime = None, end_date: datetime = None) -> Optional[Dict]:
        """Fetch NEO feed for date range"""
        if not start_date:
            start_date = timezone.now().date()
        if not end_date:
            end_date = start_date + timedelta(days=7)
            
        params = {
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d')
        }
        
        return self._make_request('neo/rest/v1/feed', params)
    
    def fetch_neo_details(self, neo_id: str) -> Optional[Dict]:
        """Fetch detailed info for specific NEO"""
        return self._make_request(f'neo/rest/v1/neo/{neo_id}')
    
    def sync_neo_data(self, days_ahead: int = 30) -> int:
        """Sync NEO data for upcoming days"""
        synced_count = 0
        start_date = timezone.now().date()
        end_date = start_date + timedelta(days=days_ahead)
        
        # Fetch in chunks of 7 days (API limit)
        current_start = start_date
        while current_start < end_date:
            current_end = min(current_start + timedelta(days=6), end_date)
            
            data = self.fetch_neo_feed(current_start, current_end)
            if data and 'near_earth_objects' in data:
                for date_str, neo_list in data['near_earth_objects'].items():
                    for neo_data in neo_list:
                        neo, created = self._save_neo_data(neo_data)
                        if created:
                            synced_count += 1
            
            current_start = current_end + timedelta(days=1)
            time.sleep(0.5)  # Rate limiting
        
        return synced_count
    
    def _save_neo_data(self, neo_data: Dict) -> tuple:
        """Save NEO data to database"""
        neo_id = neo_data['id']
        
        neo, created = NearEarthObject.objects.get_or_create(
            nasa_id=neo_id,
            defaults={
                'name': neo_data['name'],
                'designation': neo_data.get('designation', ''),
                'is_potentially_hazardous': neo_data.get('is_potentially_hazardous_asteroid', False),
                'estimated_diameter_min_km': neo_data['estimated_diameter']['kilometers']['estimated_diameter_min'],
                'estimated_diameter_max_km': neo_data['estimated_diameter']['kilometers']['estimated_diameter_max'],
                'absolute_magnitude': neo_data.get('absolute_magnitude_h', 0),
                'is_sentry_object': neo_data.get('is_sentry_object', False)
            }
        )
        
        # Save close approach data
        for approach_data in neo_data.get('close_approach_data', []):
            NEOCloseApproach.objects.get_or_create(
                neo=neo,
                close_approach_date=approach_data['close_approach_date_full'],
                defaults={
                    'relative_velocity_kmh': float(approach_data['relative_velocity']['kilometers_per_hour']),
                    'miss_distance_km': float(approach_data['miss_distance']['kilometers']),
                    'orbiting_body': approach_data['orbiting_body']
                }
            )
        
        return neo, created

class MarsRoverService(NASAAPIService):
    """Mars Rover Photos service"""
    
    def fetch_rover_photos(self, rover: str, sol: int = None, earth_date: str = None, 
                          camera: str = None, page: int = 1) -> Optional[Dict]:
        """Fetch Mars rover photos"""
        params = {'page': page}
        
        if sol is not None:
            params['sol'] = sol
        elif earth_date:
            params['earth_date'] = earth_date
        
        if camera:
            params['camera'] = camera
            
        return self._make_request(f'mars-photos/api/v1/rovers/{rover}/photos', params)
    
    def fetch_rover_manifest(self, rover: str) -> Optional[Dict]:
        """Fetch rover mission manifest"""
        return self._make_request(f'mars-photos/api/v1/manifests/{rover}')
    
    def sync_rover_data(self, rover_name: str, latest_sols: int = 10) -> int:
        """Sync latest photos from a rover"""
        synced_count = 0
        
        # Get or create rover
        manifest_data = self.fetch_rover_manifest(rover_name)
        if not manifest_data:
            return 0
            
        rover_info = manifest_data['photo_manifest']
        rover, created = MarsRover.objects.get_or_create(
            name=rover_name,
            defaults={
                'landing_date': rover_info['landing_date'],
                'launch_date': rover_info['launch_date'],
                'status': rover_info['status'],
                'max_sol': rover_info['max_sol'],
                'max_date': rover_info['max_date'],
                'total_photos': rover_info['total_photos']
            }
        )
        
        # Sync photos from latest sols
        max_sol = rover_info['max_sol']
        start_sol = max(0, max_sol - latest_sols)
        
        for sol in range(start_sol, max_sol + 1):
            photos_data = self.fetch_rover_photos(rover_name, sol=sol)
            if photos_data and 'photos' in photos_data:
                for photo_data in photos_data['photos']:
                    photo, created = MarsRoverPhoto.objects.get_or_create(
                        nasa_id=str(photo_data['id']),
                        defaults={
                            'rover': rover,
                            'sol': photo_data['sol'],
                            'img_src': photo_data['img_src'],
                            'earth_date': photo_data['earth_date'],
                            'camera_name': photo_data['camera']['name'],
                            'camera_full_name': photo_data['camera']['full_name']
                        }
                    )
                    if created:
                        synced_count += 1
            
            time.sleep(0.2)  # Rate limiting
        
        return synced_count

class EPICService(NASAAPIService):
    """Earth Polychromatic Imaging Camera service"""
    
    def fetch_epic_images(self, date: datetime = None, available_dates: bool = False) -> Optional[Dict]:
        """Fetch EPIC images"""
        if available_dates:
            return self._make_request('EPIC/api/natural/all')
        
        if not date:
            date = timezone.now().date()
            
        date_str = date.strftime('%Y-%m-%d')
        return self._make_request(f'EPIC/api/natural/date/{date_str}')
    
    def sync_epic_data(self, days_back: int = 7) -> int:
        """Sync EPIC images"""
        synced_count = 0
        
        # Get available dates first
        available_data = self.fetch_epic_images(available_dates=True)
        if not available_data:
            return 0
        
        # Process recent dates
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days_back)
        
        for date_item in available_data[-days_back:]:  # Get recent dates
            try:
                date_obj = datetime.strptime(date_item['date'], '%Y-%m-%d').date()
                if start_date <= date_obj <= end_date:
                    images_data = self.fetch_epic_images(date_obj)
                    if images_data:
                        for image_data in images_data:
                            epic_image, created = EPICImage.objects.get_or_create(
                                nasa_id=image_data['identifier'],
                                defaults={
                                    'identifier': image_data['identifier'],
                                    'caption': image_data.get('caption', ''),
                                    'image_url': f"https://api.nasa.gov/EPIC/archive/natural/{date_obj.strftime('%Y/%m/%d')}/png/{image_data['image']}.png",
                                    'date': image_data['date'],
                                    'centroid_coordinates': image_data.get('centroid_coordinates', {}),
                                    'dscovr_j2000_position': image_data.get('dscovr_j2000_position', {}),
                                    'lunar_j2000_position': image_data.get('lunar_j2000_position', {}),
                                    'sun_j2000_position': image_data.get('sun_j2000_position', {}),
                                    'attitude_quaternions': image_data.get('attitude_quaternions', {})
                                }
                            )
                            if created:
                                synced_count += 1
                    
                    time.sleep(0.3)  # Rate limiting
            except Exception as e:
                logger.error(f"Error processing EPIC date {date_item}: {str(e)}")
        
        return synced_count

class ExoplanetService(NASAAPIService):
    """Exoplanet Archive service"""
    
    def __init__(self):
        super().__init__()
        self.exoplanet_base_url = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"
    
    def fetch_exoplanets(self, limit: int = 100, where_clause: str = "") -> Optional[List[Dict]]:
        """Fetch exoplanet data using TAP service"""
        query = f"""
        SELECT pl_name, hostname, discoverymethod, disc_year, pl_orbper, pl_rade, pl_masse,
               sy_dist, pl_eqt, pl_habitable
        FROM ps 
        {where_clause}
        ORDER BY disc_year DESC
        LIMIT {limit}
        """
        
        params = {
            'query': query,
            'format': 'json'
        }
        
        try:
            response = requests.get(self.exoplanet_base_url, params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Exoplanet API error: {str(e)}")
            return None
    
    def sync_exoplanet_data(self, limit: int = 1000) -> int:
        """Sync exoplanet data"""
        synced_count = 0
        
        data = self.fetch_exoplanets(limit=limit, where_clause="WHERE disc_year > 2020")
        if not data:
            return 0
        
        for planet_data in data:
            try:
                planet, created = Exoplanet.objects.get_or_create(
                    name=planet_data['pl_name'],
                    defaults={
                        'nasa_id': planet_data['pl_name'].replace(' ', '_'),
                        'host_star': planet_data.get('hostname', ''),
                        'discovery_method': planet_data.get('discoverymethod', ''),
                        'discovery_year': planet_data.get('disc_year'),
                        'orbital_period': planet_data.get('pl_orbper'),
                        'planet_radius': planet_data.get('pl_rade'),
                        'planet_mass': planet_data.get('pl_masse'),
                        'distance_from_earth': planet_data.get('sy_dist'),
                        'equilibrium_temperature': planet_data.get('pl_eqt'),
                        'is_habitable_zone': planet_data.get('pl_habitable') == 1
                    }
                )
                if created:
                    synced_count += 1
            except Exception as e:
                logger.error(f"Error saving exoplanet {planet_data.get('pl_name', 'unknown')}: {str(e)}")
        
        return synced_count

class SpaceWeatherService(NASAAPIService):
    """Space Weather Database service"""
    
    def fetch_space_weather_events(self, start_date: datetime = None, end_date: datetime = None, event_type: str = None) -> Optional[Dict]:
        """Fetch space weather events from DONKI"""
        if not start_date:
            start_date = timezone.now() - timedelta(days=30)
        if not end_date:
            end_date = timezone.now()
            
        params = {
            'startDate': start_date.strftime('%Y-%m-%d'),
            'endDate': end_date.strftime('%Y-%m-%d')
        }
        
        # Map event types to DONKI endpoints
        endpoints = {
            'CME': 'DONKI/CME',
            'FLR': 'DONKI/FLR', 
            'SEP': 'DONKI/SEP',
            'MPC': 'DONKI/MPC',
            'GST': 'DONKI/GST',
            'IPS': 'DONKI/IPS',
            'RBE': 'DONKI/RBE',
            'HSS': 'DONKI/HSS'
        }
        
        if event_type and event_type in endpoints:
            return self._make_request(endpoints[event_type], params)
        else:
            # Fetch all event types
            all_events = []
            for et, endpoint in endpoints.items():
                events = self._make_request(endpoint, params)
                if events:
                    for event in events:
                        event['event_type'] = et
                    all_events.extend(events)
            return all_events
    
    def sync_space_weather_data(self, days_back: int = 30) -> int:
        """Sync space weather events"""
        synced_count = 0
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days_back)
        
        events_data = self.fetch_space_weather_events(start_date, end_date)
        if not events_data:
            return 0
            
        for event_data in events_data:
            try:
                # Generate unique ID based on event type and identifier
                event_id = event_data.get('activityID') or event_data.get('flrID') or event_data.get('gstID') or event_data.get('messageID')
                if not event_id:
                    continue
                    
                event, created = SpaceWeatherEvent.objects.get_or_create(
                    nasa_id=f"{event_data.get('event_type', 'UNK')}_{event_id}",
                    defaults={
                        'event_type': event_data.get('event_type', 'UNK'),
                        'event_time': event_data.get('beginTime') or event_data.get('startTime') or event_data.get('eventTime'),
                        'link': event_data.get('link', ''),
                        'summary': event_data.get('summary', ''),
                        'instruments': event_data.get('instruments', []),
                        'linked_events': event_data.get('linkedEvents', [])
                    }
                )
                if created:
                    synced_count += 1
            except Exception as e:
                logger.error(f"Error saving space weather event {event_data.get('activityID', 'unknown')}: {str(e)}")
        
        return synced_count


class NaturalEventService:
    """EONET Natural Events service (doesn't use NASA API key)"""
    
    def __init__(self):
        self.base_url = "https://eonet.gsfc.nasa.gov/api/v3"
        self.session = requests.Session()
    
    def fetch_natural_events(self, status: str = 'open', category: str = None, limit: int = None) -> Optional[Dict]:
        """Fetch natural events from EONET"""
        params = {'status': status}
        if category:
            params['category'] = category
        if limit:
            params['limit'] = limit
            
        try:
            response = self.session.get(f"{self.base_url}/events", params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"EONET API error: {str(e)}")
            return None
    
    def fetch_event_categories(self) -> Optional[List[Dict]]:
        """Fetch available event categories"""
        try:
            response = self.session.get(f"{self.base_url}/categories", timeout=30)
            response.raise_for_status()
            return response.json().get('categories', [])
        except Exception as e:
            logger.error(f"EONET categories API error: {str(e)}")
            return None
    
    def sync_natural_events_data(self, limit: int = 500) -> int:
        """Sync natural events data"""
        synced_count = 0
        
        # Fetch open events
        events_data = self.fetch_natural_events(status='open', limit=limit)
        if not events_data or 'events' not in events_data:
            return 0
            
        for event_data in events_data['events']:
            try:
                event, created = NaturalEvent.objects.get_or_create(
                    nasa_id=event_data['id'],
                    defaults={
                        'title': event_data['title'],
                        'description': event_data.get('description', ''),
                        'link': event_data.get('link', ''),
                        'closed': event_data.get('closed') is not None,
                        'category_id': event_data['categories'][0]['id'] if event_data.get('categories') else '',
                        'category_title': event_data['categories'][0]['title'] if event_data.get('categories') else ''
                    }
                )
                
                # Save geometry data
                for geometry in event_data.get('geometry', []):
                    NaturalEventGeometry.objects.get_or_create(
                        event=event,
                        date=geometry['date'],
                        defaults={
                            'coordinates': geometry['coordinates'],
                            'magnitude_value': geometry.get('magnitudeValue'),
                            'magnitude_unit': geometry.get('magnitudeUnit', '')
                        }
                    )
                
                if created:
                    synced_count += 1
            except Exception as e:
                logger.error(f"Error saving natural event {event_data.get('id', 'unknown')}: {str(e)}")
        
        return synced_count


class SpaceEventService:
    """Service for fetching and managing space events like eclipses, supermoons, etc."""
    
    def __init__(self):
        self.session = requests.Session()
        
    def fetch_astronomical_events(self) -> List[Dict]:
        """Fetch astronomical events from multiple sources"""
        events = []
        
        # Add manual curated events (can be expanded with real APIs)
        events.extend(self._get_curated_events_2025())
        
        # TODO: Add integration with:
        # - NASA Eclipse API
        # - TimeandDate.com API
        # - In-The-Sky.org API
        # - Astronomy calendars
        
        return events
    
    def _get_curated_events_2025(self) -> List[Dict]:
        """Get curated space events for 2025"""
        from datetime import datetime
        
        events = [
            {
                'nasa_id': 'eclipse_total_2025_03_29',
                'title': 'Total Solar Eclipse',
                'description': 'A spectacular total solar eclipse will be visible across parts of the Atlantic, Europe, Asia, and Africa. The path of totality will pass through the Faroe Islands, northwestern Spain, Algeria, Tunisia, Libya, Egypt, Saudi Arabia, Iran, Afghanistan, Pakistan, India, and China.',
                'event_type': 'ECLIPSE_SOLAR',
                'event_date': datetime(2025, 3, 29, 10, 0),
                'end_date': datetime(2025, 3, 29, 14, 30),
                'visibility': 'PARTIAL',
                'location': 'Atlantic, Europe, Asia, Africa',
                'coordinates': [29.0, 45.0],
                'peak_time': datetime(2025, 3, 29, 12, 15),
                'duration_minutes': 270,
                'image_url': 'https://images.nasa.gov/eclipse-2025-preview.jpg',
                'source_url': 'https://eclipse.gsfc.nasa.gov/SEpath/SEpath2025.html',
                'source_name': 'NASA Eclipse Website',
                'is_featured': True
            },
            {
                'nasa_id': 'supermoon_2025_11_05',
                'title': 'Supermoon - Beaver Moon',
                'description': 'The November 2025 supermoon, traditionally called the Beaver Moon, will appear larger and brighter than usual as it reaches its closest approach to Earth.',
                'event_type': 'SUPERMOON',
                'event_date': datetime(2025, 11, 5, 18, 30),
                'visibility': 'GLOBAL',
                'location': 'Worldwide',
                'magnitude': -12.7,
                'peak_time': datetime(2025, 11, 5, 21, 0),
                'duration_minutes': 720,
                'image_url': 'https://images.nasa.gov/supermoon-preview.jpg',
                'source_url': 'https://moon.nasa.gov/news/196/super-blue-blood-moon-coming-jan-31/',
                'source_name': 'NASA Moon Info',
                'is_featured': True
            },
            {
                'nasa_id': 'geminids_2025_12_14',
                'title': 'Geminids Meteor Shower Peak',
                'description': 'The Geminids meteor shower, one of the year\'s most reliable and prolific meteor showers, reaches its peak. Expect up to 120 meteors per hour under dark skies.',
                'event_type': 'METEOR_SHOWER',
                'event_date': datetime(2025, 12, 14, 2, 0),
                'end_date': datetime(2025, 12, 14, 6, 0),
                'visibility': 'GLOBAL',
                'location': 'Best viewed from Northern Hemisphere',
                'peak_time': datetime(2025, 12, 14, 4, 0),
                'duration_minutes': 240,
                'image_url': 'https://images.nasa.gov/geminids-preview.jpg',
                'source_url': 'https://solarsystem.nasa.gov/asteroids-comets-and-meteors/meteors-and-meteorites/geminids/in-depth/',
                'source_name': 'NASA Solar System',
                'is_featured': True
            },
            {
                'nasa_id': 'winter_solstice_2025_12_21',
                'title': 'Winter Solstice',
                'description': 'The winter solstice marks the shortest day and longest night of the year in the Northern Hemisphere. This astronomical event occurs when the Sun reaches its southernmost position in the sky.',
                'event_type': 'SOLSTICE',
                'event_date': datetime(2025, 12, 21, 15, 3),
                'visibility': 'NORTHERN_HEMISPHERE',
                'location': 'Northern Hemisphere',
                'source_url': 'https://solarsystem.nasa.gov/news/1571/the-first-day-of-winter/',
                'source_name': 'NASA Solar System',
                'is_featured': False
            },
            {
                'nasa_id': 'venus_jupiter_conjunction_2025_08_12',
                'title': 'Venus-Jupiter Conjunction',
                'description': 'Venus and Jupiter will appear extremely close together in the evening sky, creating a spectacular celestial show. The two brightest planets will be separated by less than 1 degree.',
                'event_type': 'CONJUNCTION',
                'event_date': datetime(2025, 8, 12, 20, 30),
                'visibility': 'GLOBAL',
                'location': 'Western sky after sunset',
                'magnitude': -4.5,
                'peak_time': datetime(2025, 8, 12, 21, 0),
                'duration_minutes': 180,
                'image_url': 'https://images.nasa.gov/conjunction-preview.jpg',
                'source_url': 'https://solarsystem.nasa.gov/news/planetary-conjunctions/',
                'source_name': 'NASA Solar System',
                'is_featured': True
            }
        ]
        
        return events
    
    def sync_space_events(self) -> int:
        """Sync space events to database"""
        from .models import SpaceEvent
        synced_count = 0
        
        events_data = self.fetch_astronomical_events()
        
        for event_data in events_data:
            event, created = SpaceEvent.objects.get_or_create(
                nasa_id=event_data['nasa_id'],
                defaults=event_data
            )
            
            if created:
                synced_count += 1
                logger.info(f"Created space event: {event.title}")
            else:
                # Update existing event
                for key, value in event_data.items():
                    if key != 'nasa_id':
                        setattr(event, key, value)
                event.save()
                logger.info(f"Updated space event: {event.title}")
        
        return synced_count


# Initialize service instances
apod_service = APODService()
neo_service = NEOService()
mars_rover_service = MarsRoverService()
epic_service = EPICService()
exoplanet_service = ExoplanetService()
space_weather_service = SpaceWeatherService()
natural_event_service = NaturalEventService()
space_event_service = SpaceEventService()


class NASAImageLibraryService:
    """NASA Image and Video Library service"""
    
    def __init__(self):
        self.base_url = "https://images-api.nasa.gov"
        self.session = requests.Session()
    
    def search_media(self, query: str, media_type: str = None, year_start: int = None, 
                     year_end: int = None, page: int = 1, page_size: int = 100) -> Optional[Dict]:
        """Search NASA media library"""
        params = {
            'q': query,
            'page': page,
            'page_size': min(page_size, 100)  # API limit
        }
        
        if media_type:
            params['media_type'] = media_type  # 'image', 'video', 'audio'
        if year_start:
            params['year_start'] = year_start
        if year_end:
            params['year_end'] = year_end
        
        try:
            response = self.session.get(f"{self.base_url}/search", params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"NASA Image Library search error: {str(e)}")
            return None
    
    def get_asset_manifest(self, nasa_id: str) -> Optional[Dict]:
        """Get asset manifest for a media item"""
        try:
            response = self.session.get(f"{self.base_url}/asset/{nasa_id}", timeout=30)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"NASA asset manifest error for {nasa_id}: {str(e)}")
            return None
    
    def get_metadata(self, nasa_id: str) -> Optional[Dict]:
        """Get metadata location for a media item"""
        try:
            response = self.session.get(f"{self.base_url}/metadata/{nasa_id}", timeout=30)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"NASA metadata error for {nasa_id}: {str(e)}")
            return None
    
    def get_captions(self, nasa_id: str) -> Optional[Dict]:
        """Get captions location for a video"""
        try:
            response = self.session.get(f"{self.base_url}/captions/{nasa_id}", timeout=30)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"NASA captions error for {nasa_id}: {str(e)}")
            return None
    
    def get_popular_images(self, limit: int = 20) -> Optional[Dict]:
        """Get popular/featured images - searches for high-interest topics"""
        popular_queries = [
            'hubble', 'mars', 'earth', 'jupiter', 'saturn', 'nebula', 
            'galaxy', 'astronaut', 'spacewalk', 'iss'
        ]
        
        all_results = []
        for query in popular_queries[:3]:  # Limit to avoid too many requests
            result = self.search_media(query, media_type='image', page_size=limit//3)
            if result and 'collection' in result and 'items' in result['collection']:
                all_results.extend(result['collection']['items'][:limit//3])
            time.sleep(0.2)  # Rate limiting
        
        return {
            'collection': {
                'items': all_results[:limit],
                'metadata': {'total_hits': len(all_results)}
            }
        }


class TLEService:
    """Two-Line Element Set service for satellite tracking"""
    
    def __init__(self):
        self.base_url = "http://tle.ivanstanojevic.me/api/tle"
        self.session = requests.Session()
    
    def search_satellite(self, query: str) -> Optional[List[Dict]]:
        """Search for satellite by name"""
        try:
            response = self.session.get(
                f"{self.base_url}",
                params={'search': query},
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"TLE search error for '{query}': {str(e)}")      
            return None
    
    def get_satellite_by_id(self, satellite_id: int) -> Optional[Dict]:
        """Get satellite TLE by satellite number"""
        try:
            response = self.session.get(f"{self.base_url}/{satellite_id}", timeout=30)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"TLE get error for ID {satellite_id}: {str(e)}")
            return None
    
    def get_all_tle(self) -> Optional[List[Dict]]:
        """Get all TLE records"""
        try:
            response = self.session.get(f"{self.base_url}", timeout=60)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"TLE get all error: {str(e)}")
            return None
    
    def get_popular_satellites(self) -> Optional[List[Dict]]:
        """Get TLE for popular satellites (ISS, Hubble, etc.)"""
        # Fallback static data when TLE API is not available
        fallback_satellites = [
            {
                "satellite_id": 25544,
                "name": "ISS (ZARYA)",
                "orbit_type": "LEO",
                "tle_line1": "1 25544U 98067A   25293.50000000  .00002182  00000-0  40768-4 0  9990",
                "tle_line2": "2 25544  51.6461 339.7939 0001393  92.8340 267.3124 15.49309239000000",
                "tle_date": "2025-10-20T00:00:00Z"
            },
            {
                "satellite_id": 20580,
                "name": "HST (HUBBLE SPACE TELESCOPE)",
                "orbit_type": "LEO",
                "tle_line1": "1 20580U 90037B   25293.50000000  .00000000  00000-0  00000-0 0  9999",
                "tle_line2": "2 20580  28.4684 276.2531 0002978 321.7771  38.2675 15.09309239000000",
                "tle_date": "2025-10-20T00:00:00Z"
            },
            {
                "satellite_id": 48274,
                "name": "TIANGONG-1",
                "orbit_type": "LEO",
                "tle_line1": "1 48274U 21035A   25293.50000000  .00001500  00000-0  28000-4 0  9999",
                "tle_line2": "2 48274  41.4737 156.2039 0003040 315.0340  45.0234 15.61309239000000",
                "tle_date": "2025-10-20T00:00:00Z"
            },
            {
                "satellite_id": 32384,
                "name": "NAVSTAR 53 (GPS BIIF-4)",
                "orbit_type": "MEO",
                "tle_line1": "1 32384U 07047A   25293.50000000 -.00000079  00000-0  00000-0 0  9999",
                "tle_line2": "2 32384  55.0000 201.7039 0001000 180.0000 180.0000  2.00561393000000",
                "tle_date": "2025-10-20T00:00:00Z"
            },
            {
                "satellite_id": 44713,
                "name": "STARLINK-1007",
                "orbit_type": "LEO",
                "tle_line1": "1 44713U 19074A   25293.50000000  .00001200  00000-0  90000-4 0  9999",
                "tle_line2": "2 44713  53.0537  47.2039 0001532  90.0000 270.1234 15.05939239000000",
                "tle_date": "2025-10-20T00:00:00Z"
            }
        ]
        
        # Try the API first, fallback to static data
        try:
            popular_satellites = ['ISS', 'HUBBLE', 'TIANGONG', 'GPS', 'STARLINK']
            results = []
            
            for sat_name in popular_satellites:
                tle_data = self.search_satellite(sat_name)
                if tle_data and isinstance(tle_data, list) and len(tle_data) > 0:
                    results.append(tle_data[0])
                time.sleep(0.2)  # Rate limiting
            
            if results:
                return results
                
        except Exception as e:
            logger.warning(f"TLE API unavailable, using fallback data: {str(e)}")
        
        # Return fallback data if API fails
        return fallback_satellites


class GIBSService(NASAAPIService):
    """Global Imagery Browse Services"""
    
    def __init__(self):
        super().__init__()
        self.gibs_base_url = "https://gibs.earthdata.nasa.gov"
        self.wmts_base_url = f"{self.gibs_base_url}/wmts/epsg4326/best"
        self.wms_base_url = f"{self.gibs_base_url}/wms/epsg4326/best"
    
    def get_available_layers(self) -> Dict:
        """Get information about available GIBS layers"""
        # Most popular/useful layers for visualization
        return {
            'layers': [
                {
                    'id': 'VIIRS_SNPP_CorrectedReflectance_TrueColor',
                    'title': 'VIIRS True Color (Day)',
                    'description': 'Corrected Reflectance from VIIRS on Suomi NPP',
                    'type': 'image',
                    'format': 'image/jpeg',
                    'temporal': True,
                    'category': 'Earth Observations'
                },
                {
                    'id': 'MODIS_Terra_CorrectedReflectance_TrueColor',
                    'title': 'MODIS Terra True Color',
                    'description': 'Corrected Reflectance from MODIS on Terra',
                    'type': 'image',
                    'format': 'image/jpeg',
                    'temporal': True,
                    'category': 'Earth Observations'
                },
                {
                    'id': 'VIIRS_SNPP_DayNightBand_ENCC',
                    'title': 'Earth at Night (VIIRS)',
                    'description': 'Day/Night Band Enhanced Near Constant Contrast',
                    'type': 'image',
                    'format': 'image/png',
                    'temporal': True,
                    'category': 'Nighttime'
                },
                {
                    'id': 'BlueMarble_NextGeneration',
                    'title': 'Blue Marble',
                    'description': 'NASA Blue Marble Next Generation',
                    'type': 'image',
                    'format': 'image/jpeg',
                    'temporal': False,
                    'category': 'Base Maps'
                },
                {
                    'id': 'MODIS_Aqua_CorrectedReflectance_TrueColor',
                    'title': 'MODIS Aqua True Color',
                    'description': 'Corrected Reflectance from MODIS on Aqua',
                    'type': 'image',
                    'format': 'image/jpeg',
                    'temporal': True,
                    'category': 'Earth Observations'
                },
                {
                    'id': 'MODIS_Combined_Thermal_Anomalies_All',
                    'title': 'Fires and Thermal Anomalies',
                    'description': 'Combined MODIS thermal anomalies',
                    'type': 'image',
                    'format': 'image/png',
                    'temporal': True,
                    'category': 'Hazards'
                }
            ]
        }
    
    def get_wmts_capabilities(self) -> Optional[str]:
        """Get WMTS capabilities document"""
        try:
            response = requests.get(
                f"{self.wmts_base_url}/1.0.0/WMTSCapabilities.xml",
                timeout=30
            )
            response.raise_for_status()
            return response.text
        except Exception as e:
            logger.error(f"GIBS WMTS capabilities error: {str(e)}")
            return None
    
    def get_wms_capabilities(self) -> Optional[str]:
        """Get WMS capabilities document"""
        try:
            response = requests.get(
                f"{self.wms_base_url}/wms.cgi",
                params={'SERVICE': 'WMS', 'REQUEST': 'GetCapabilities', 'VERSION': '1.3.0'},
                timeout=30
            )
            response.raise_for_status()
            return response.text
        except Exception as e:
            logger.error(f"GIBS WMS capabilities error: {str(e)}")
            return None
    
    def generate_tile_url(self, layer: str, date: str, z: int, x: int, y: int, 
                         format: str = 'jpeg') -> str:
        """Generate WMTS tile URL"""
        return (
            f"{self.wmts_base_url}/{layer}/default/{date}/250m/{z}/{y}/{x}.{format}"
        )
    
    def generate_wms_url(self, layers: str, bbox: str, width: int = 512, height: int = 512,
                        date: str = None, format: str = 'image/jpeg') -> str:
        """Generate WMS GetMap URL"""
        params = {
            'SERVICE': 'WMS',
            'REQUEST': 'GetMap',
            'VERSION': '1.3.0',
            'LAYERS': layers,
            'STYLES': '',
            'CRS': 'EPSG:4326',
            'BBOX': bbox,
            'WIDTH': width,
            'HEIGHT': height,
            'FORMAT': format
        }
        
        if date:
            params['TIME'] = date
        
        param_str = '&'.join([f"{k}={v}" for k, v in params.items()])
        return f"{self.wms_base_url}/wms.cgi?{param_str}"
    
    def get_latest_imagery(self, layer: str = 'VIIRS_SNPP_CorrectedReflectance_TrueColor') -> Dict:
        """Get latest available imagery information for a layer"""
        # Use yesterday's date as latest (GIBS usually has 1-day delay)
        latest_date = (timezone.now() - timedelta(days=1)).strftime('%Y-%m-%d')
        
        return {
            'layer': layer,
            'date': latest_date,
            'preview_url': self.generate_wms_url(
                layers=layer,
                bbox='-180,-90,180,90',
                width=512,
                height=256,
                date=latest_date
            ),
            'wmts_template': f"{self.wmts_base_url}/{layer}/default/{latest_date}/250m/{{z}}/{{y}}/{{x}}.jpg"
        }
    
    def get_imagery(self, layer: str, date: str, region: str = 'geographic',
                   format: str = 'image/png', width: int = 512, height: int = 512) -> Dict:
        """Get imagery data for a specific layer, date, and region"""
        try:
            # Define bounding boxes for different regions
            region_bounds = {
                'geographic': '-180,-90,180,90',  # Global view
                'arctic': '-180,60,180,90',       # Arctic view
                'antarctic': '-180,-90,180,-60'   # Antarctic view
            }
            
            bbox = region_bounds.get(region, region_bounds['geographic'])
            
            # Generate WMS URL for the imagery
            image_url = self.generate_wms_url(
                layers=layer,
                bbox=bbox,
                width=width,
                height=height,
                date=date,
                format=format
            )
            
            return {
                'image_url': image_url,
                'metadata': {
                    'layer': layer,
                    'date': date,
                    'region': region,
                    'format': format,
                    'dimensions': {
                        'width': width,
                        'height': height
                    },
                    'bbox': bbox
                }
            }
            
        except Exception as e:
            logger.error(f"GIBS imagery generation error: {str(e)}")
            return None


# Initialize new service instances
nasa_image_service = NASAImageLibraryService()
tle_service = TLEService()
gibs_service = GIBSService()