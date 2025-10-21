import requests
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional
from django.conf import settings
from django.utils import timezone as django_timezone
from .models import (
    SpaceXRocket, SpaceXLaunchpad, SpaceXLaunch, SpaceXHistoricalEvent,
    SpaceXMission, SpaceXStarlink, SpaceXCore, SpaceXCapsule
)

logger = logging.getLogger(__name__)

class SpaceXAPIService:
    """Service to interact with SpaceX API"""
    
    BASE_URL = "https://api.spacexdata.com"
    
    def __init__(self):
        self.session = requests.Session()
        self.session.timeout = 30
    
    def _make_request(self, endpoint: str, params: Optional[Dict] = None) -> Optional[Dict]:
        """Make a request to SpaceX API"""
        try:
            url = f"{self.BASE_URL}{endpoint}"
            response = self.session.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"SpaceX API request failed for {endpoint}: {e}")
            return None
    
    def fetch_rockets(self) -> List[Dict]:
        """Fetch all rockets from SpaceX API"""
        data = self._make_request("/v4/rockets")
        return data if data else []
    
    def fetch_launchpads(self) -> List[Dict]:
        """Fetch all launchpads from SpaceX API"""
        data = self._make_request("/v4/launchpads")
        return data if data else []
    
    def fetch_launches(self, upcoming: bool = None) -> List[Dict]:
        """Fetch launches from SpaceX API"""
        if upcoming is True:
            endpoint = "/v5/launches/upcoming"
        elif upcoming is False:
            endpoint = "/v5/launches/past"
        else:
            endpoint = "/v5/launches"
        
        data = self._make_request(endpoint)
        return data if data else []
    
    def fetch_latest_launch(self) -> Optional[Dict]:
        """Fetch latest SpaceX launch"""
        return self._make_request("/v5/launches/latest")
    
    def fetch_next_launch(self) -> Optional[Dict]:
        """Fetch next SpaceX launch"""
        return self._make_request("/v5/launches/next")
    
    def fetch_historical_events(self) -> List[Dict]:
        """Fetch SpaceX historical events"""
        data = self._make_request("/v4/history")
        return data if data else []
    
    def fetch_missions(self) -> List[Dict]:
        """Fetch SpaceX missions"""
        data = self._make_request("/v4/missions")
        return data if data else []
    
    def fetch_starlink(self) -> List[Dict]:
        """Fetch Starlink satellites"""
        data = self._make_request("/v4/starlink")
        return data if data else []
    
    def fetch_cores(self) -> List[Dict]:
        """Fetch SpaceX cores"""
        data = self._make_request("/v4/cores")
        return data if data else []
    
    def fetch_capsules(self) -> List[Dict]:
        """Fetch SpaceX capsules"""
        data = self._make_request("/v4/capsules")
        return data if data else []

class SpaceXDataSyncService:
    """Service to sync SpaceX data with local database"""
    
    def __init__(self):
        self.api_service = SpaceXAPIService()
    
    def _parse_datetime(self, date_string: str) -> Optional[datetime]:
        """Parse datetime string from SpaceX API"""
        if not date_string:
            return None
        try:
            # SpaceX API uses ISO format
            return datetime.fromisoformat(date_string.replace('Z', '+00:00'))
        except (ValueError, TypeError):
            return None
    
    def _parse_date(self, date_string: str) -> Optional[datetime.date]:
        """Parse date string from SpaceX API"""
        if not date_string:
            return None
        try:
            return datetime.fromisoformat(date_string.replace('Z', '+00:00')).date()
        except (ValueError, TypeError):
            return None
    
    def sync_rockets(self) -> int:
        """Sync rockets data"""
        rockets_data = self.api_service.fetch_rockets()
        synced_count = 0
        
        for rocket_data in rockets_data:
            try:
                rocket, created = SpaceXRocket.objects.update_or_create(
                    spacex_id=rocket_data.get('id'),
                    defaults={
                        'name': rocket_data.get('name', ''),
                        'type': rocket_data.get('type', ''),
                        'active': rocket_data.get('active', True),
                        'stages': rocket_data.get('stages'),
                        'boosters': rocket_data.get('boosters'),
                        'cost_per_launch': rocket_data.get('cost_per_launch'),
                        'success_rate_pct': rocket_data.get('success_rate_pct'),
                        'first_flight': self._parse_date(rocket_data.get('first_flight')),
                        'country': rocket_data.get('country', ''),
                        'company': rocket_data.get('company', 'SpaceX'),
                        'height_meters': rocket_data.get('height', {}).get('meters'),
                        'height_feet': rocket_data.get('height', {}).get('feet'),
                        'diameter_meters': rocket_data.get('diameter', {}).get('meters'),
                        'diameter_feet': rocket_data.get('diameter', {}).get('feet'),
                        'mass_kg': rocket_data.get('mass', {}).get('kg'),
                        'mass_lb': rocket_data.get('mass', {}).get('lb'),
                        'payload_weights': rocket_data.get('payload_weights', []),
                        'description': rocket_data.get('description', ''),
                        'wikipedia': rocket_data.get('wikipedia', ''),
                        'flickr_images': rocket_data.get('flickr_images', []),
                    }
                )
                synced_count += 1
                logger.info(f"Synced rocket: {rocket.name}")
                
            except Exception as e:
                logger.error(f"Error syncing rocket {rocket_data.get('id')}: {e}")
        
        return synced_count
    
    def sync_launchpads(self) -> int:
        """Sync launchpads data"""
        pads_data = self.api_service.fetch_launchpads()
        synced_count = 0
        
        for pad_data in pads_data:
            try:
                pad, created = SpaceXLaunchpad.objects.update_or_create(
                    spacex_id=pad_data.get('id'),
                    defaults={
                        'name': pad_data.get('name', ''),
                        'full_name': pad_data.get('full_name', ''),
                        'locality': pad_data.get('locality', ''),
                        'region': pad_data.get('region', ''),
                        'latitude': pad_data.get('latitude'),
                        'longitude': pad_data.get('longitude'),
                        'launch_attempts': pad_data.get('launch_attempts', 0),
                        'launch_successes': pad_data.get('launch_successes', 0),
                        'status': pad_data.get('status', ''),
                        'details': pad_data.get('details', ''),
                    }
                )
                synced_count += 1
                logger.info(f"Synced launchpad: {pad.name}")
                
            except Exception as e:
                logger.error(f"Error syncing launchpad {pad_data.get('id')}: {e}")
        
        return synced_count
    
    def sync_launches(self, upcoming_only: bool = False) -> int:
        """Sync launches data"""
        if upcoming_only:
            launches_data = self.api_service.fetch_launches(upcoming=True)
        else:
            launches_data = self.api_service.fetch_launches()
        
        synced_count = 0
        
        for launch_data in launches_data:
            try:
                # Get rocket and launchpad objects
                rocket = None
                if launch_data.get('rocket'):
                    try:
                        rocket = SpaceXRocket.objects.get(spacex_id=launch_data['rocket'])
                    except SpaceXRocket.DoesNotExist:
                        pass
                
                launchpad = None
                if launch_data.get('launchpad'):
                    try:
                        launchpad = SpaceXLaunchpad.objects.get(spacex_id=launch_data['launchpad'])
                    except SpaceXLaunchpad.DoesNotExist:
                        pass
                
                launch, created = SpaceXLaunch.objects.update_or_create(
                    spacex_id=launch_data.get('id'),
                    defaults={
                        'flight_number': launch_data.get('flight_number'),
                        'mission_name': launch_data.get('name', ''),
                        'mission_id': launch_data.get('mission_id', []),
                        'launch_date_utc': self._parse_datetime(launch_data.get('date_utc')),
                        'launch_date_local': self._parse_datetime(launch_data.get('date_local')),
                        'is_tentative': launch_data.get('tbd', False),
                        'tentative_max_precision': launch_data.get('date_precision', ''),
                        'tbd': launch_data.get('tbd', False),
                        'rocket': rocket,
                        'launchpad': launchpad,
                        'launch_success': launch_data.get('success'),
                        'launch_failure_details': launch_data.get('failures', []),
                        'details': launch_data.get('details', ''),
                        'static_fire_date_utc': self._parse_datetime(launch_data.get('static_fire_date_utc')),
                        'timeline': launch_data.get('timeline', {}),
                        'crew': launch_data.get('crew', []),
                        'ships': launch_data.get('ships', []),
                        'cores': launch_data.get('cores', []),
                        'fairings': launch_data.get('fairings', {}),
                        'payloads': launch_data.get('payloads', []),
                        'links': launch_data.get('links', {}),
                        'upcoming': launch_data.get('upcoming', False),
                    }
                )
                synced_count += 1
                logger.info(f"Synced launch: {launch.mission_name}")
                
            except Exception as e:
                logger.error(f"Error syncing launch {launch_data.get('id')}: {e}")
        
        return synced_count
    
    def sync_historical_events(self) -> int:
        """Sync historical events data"""
        events_data = self.api_service.fetch_historical_events()
        synced_count = 0
        
        for event_data in events_data:
            try:
                event, created = SpaceXHistoricalEvent.objects.update_or_create(
                    spacex_id=event_data.get('id'),
                    defaults={
                        'title': event_data.get('title', ''),
                        'event_date_utc': self._parse_datetime(event_data.get('event_date_utc')),
                        'event_date_unix': event_data.get('event_date_unix'),
                        'flight_number': event_data.get('flight_number'),
                        'details': event_data.get('details', ''),
                        'links': event_data.get('links', {}),
                    }
                )
                synced_count += 1
                logger.info(f"Synced historical event: {event.title}")
                
            except Exception as e:
                logger.error(f"Error syncing historical event {event_data.get('id')}: {e}")
        
        return synced_count
    
    def sync_missions(self) -> int:
        """Sync missions data"""
        missions_data = self.api_service.fetch_missions()
        synced_count = 0
        
        for mission_data in missions_data:
            try:
                mission, created = SpaceXMission.objects.update_or_create(
                    spacex_id=mission_data.get('id'),
                    defaults={
                        'mission_name': mission_data.get('name', ''),
                        'mission_id': mission_data.get('mission_id', ''),
                        'manufacturers': mission_data.get('manufacturers', []),
                        'payload_ids': mission_data.get('payload_ids', []),
                        'description': mission_data.get('description', ''),
                        'wikipedia': mission_data.get('wikipedia', ''),
                        'website': mission_data.get('website', ''),
                        'twitter': mission_data.get('twitter', ''),
                    }
                )
                synced_count += 1
                logger.info(f"Synced mission: {mission.mission_name}")
                
            except Exception as e:
                logger.error(f"Error syncing mission {mission_data.get('id')}: {e}")
        
        return synced_count
    
    def sync_starlink(self, limit: int = 1000) -> int:
        """Sync Starlink data (limited due to large dataset)"""
        starlink_data = self.api_service.fetch_starlink()
        synced_count = 0
        
        # Limit the number of Starlink satellites to sync
        if limit and len(starlink_data) > limit:
            starlink_data = starlink_data[:limit]
        
        for sat_data in starlink_data:
            try:
                satellite, created = SpaceXStarlink.objects.update_or_create(
                    spacex_id=sat_data.get('id'),
                    defaults={
                        'version': sat_data.get('version', ''),
                        'launch': sat_data.get('launch', ''),
                        'longitude': sat_data.get('longitude'),
                        'latitude': sat_data.get('latitude'),
                        'height_km': sat_data.get('height_km'),
                        'velocity_kms': sat_data.get('velocity_kms'),
                    }
                )
                synced_count += 1
                
            except Exception as e:
                logger.error(f"Error syncing Starlink satellite {sat_data.get('id')}: {e}")
        
        logger.info(f"Synced {synced_count} Starlink satellites")
        return synced_count
    
    def sync_cores(self) -> int:
        """Sync cores data"""
        cores_data = self.api_service.fetch_cores()
        synced_count = 0
        
        for core_data in cores_data:
            try:
                core, created = SpaceXCore.objects.update_or_create(
                    spacex_id=core_data.get('id'),
                    defaults={
                        'serial': core_data.get('serial', ''),
                        'block': core_data.get('block'),
                        'status': core_data.get('status', ''),
                        'reuse_count': core_data.get('reuse_count', 0),
                        'rtls_attempts': core_data.get('rtls_attempts', 0),
                        'rtls_landings': core_data.get('rtls_landings', 0),
                        'asds_attempts': core_data.get('asds_attempts', 0),
                        'asds_landings': core_data.get('asds_landings', 0),
                        'last_update': core_data.get('last_update', ''),
                        'launches': core_data.get('launches', []),
                    }
                )
                synced_count += 1
                
            except Exception as e:
                logger.error(f"Error syncing core {core_data.get('id')}: {e}")
        
        logger.info(f"Synced {synced_count} cores")
        return synced_count
    
    def sync_capsules(self) -> int:
        """Sync capsules data"""
        capsules_data = self.api_service.fetch_capsules()
        synced_count = 0
        
        for capsule_data in capsules_data:
            try:
                capsule, created = SpaceXCapsule.objects.update_or_create(
                    spacex_id=capsule_data.get('id'),
                    defaults={
                        'serial': capsule_data.get('serial', ''),
                        'status': capsule_data.get('status', ''),
                        'type': capsule_data.get('type', ''),
                        'dragon': capsule_data.get('dragon', ''),
                        'reuse_count': capsule_data.get('reuse_count', 0),
                        'water_landings': capsule_data.get('water_landings', 0),
                        'land_landings': capsule_data.get('land_landings', 0),
                        'last_update': capsule_data.get('last_update', ''),
                        'launches': capsule_data.get('launches', []),
                    }
                )
                synced_count += 1
                
            except Exception as e:
                logger.error(f"Error syncing capsule {capsule_data.get('id')}: {e}")
        
        logger.info(f"Synced {synced_count} capsules")
        return synced_count
    
    def sync_all(self, starlink_limit: int = 500) -> Dict[str, int]:
        """Sync all SpaceX data"""
        results = {}
        
        logger.info("Starting SpaceX data sync...")
        
        results['rockets'] = self.sync_rockets()
        results['launchpads'] = self.sync_launchpads()
        results['launches'] = self.sync_launches()
        results['historical_events'] = self.sync_historical_events()
        results['missions'] = self.sync_missions()
        results['starlink'] = self.sync_starlink(limit=starlink_limit)
        results['cores'] = self.sync_cores()
        results['capsules'] = self.sync_capsules()
        
        logger.info(f"SpaceX data sync completed: {results}")
        return results