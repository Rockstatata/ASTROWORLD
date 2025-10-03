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


# Initialize service instances
apod_service = APODService()
neo_service = NEOService()
mars_rover_service = MarsRoverService()
epic_service = EPICService()
exoplanet_service = ExoplanetService()
space_weather_service = SpaceWeatherService()
natural_event_service = NaturalEventService()