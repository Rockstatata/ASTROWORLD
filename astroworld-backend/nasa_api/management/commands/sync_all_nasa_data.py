# nasa_api/management/commands/sync_all_nasa_data.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from nasa_api.services import (
    APODService, NeoWsService, ExoplanetService, 
    MarsRoverService, SpaceWeatherService
)
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Sync all NASA API data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days-back',
            type=int,
            default=7,
            help='Number of days to sync back for time-based APIs'
        )
        parser.add_argument(
            '--force-refresh',
            action='store_true',
            help='Force refresh of existing data'
        )
        parser.add_argument(
            '--apis',
            nargs='+',
            default=['apod', 'neo', 'exoplanets', 'mars', 'space-weather'],
            help='Specific APIs to sync'
        )

    def handle(self, *args, **options):
        days_back = options['days_back']
        force_refresh = options['force_refresh']
        apis = options['apis']

        self.stdout.write(f'Starting NASA API sync for: {", ".join(apis)}')

        if 'apod' in apis:
            self.sync_apod(days_back, force_refresh)
        
        if 'neo' in apis:
            self.sync_neo(days_back, force_refresh)
            
        if 'exoplanets' in apis:
            self.sync_exoplanets(force_refresh)
            
        if 'mars' in apis:
            self.sync_mars_photos(days_back, force_refresh)
            
        if 'space-weather' in apis:
            self.sync_space_weather(days_back, force_refresh)

        self.stdout.write(
            self.style.SUCCESS('Successfully synced all NASA data')
        )

    def sync_apod(self, days_back, force_refresh):
        try:
            service = APODService()
            end_date = timezone.now().date()
            start_date = end_date - timezone.timedelta(days=days_back)
            
            synced_count = service.sync_date_range(
                start_date, end_date, force_refresh
            )
            self.stdout.write(f'APOD: Synced {synced_count} entries')
        except Exception as e:
            logger.error(f'APOD sync failed: {e}')

    def sync_neo(self, days_back, force_refresh):
        try:
            service = NeoWsService()
            synced_count = service.sync_upcoming_objects(days_back, force_refresh)
            self.stdout.write(f'NEO: Synced {synced_count} objects')
        except Exception as e:
            logger.error(f'NEO sync failed: {e}')

    def sync_exoplanets(self, force_refresh):
        try:
            service = ExoplanetService()
            synced_count = service.sync_all(force_refresh)
            self.stdout.write(f'Exoplanets: Synced {synced_count} entries')
        except Exception as e:
            logger.error(f'Exoplanet sync failed: {e}')
            
    