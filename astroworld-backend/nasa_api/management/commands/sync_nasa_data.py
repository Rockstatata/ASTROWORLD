from django.core.management.base import BaseCommand
from django.utils import timezone
from nasa_api.services import (
    apod_service, neo_service, mars_rover_service, 
    epic_service, exoplanet_service
)

class Command(BaseCommand):
    help = 'Sync NASA API data'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--apis',
            nargs='+',
            default=['all'],
            help='Specify which APIs to sync: apod, neo, mars, epic, exoplanets, or all'
        )
        parser.add_argument(
            '--days-back',
            type=int,
            default=7,
            help='Number of days back to sync for date-based APIs'
        )
        parser.add_argument(
            '--days-ahead',
            type=int,
            default=30,
            help='Number of days ahead to sync for future events'
        )
    
    def handle(self, *args, **options):
        apis = options['apis']
        days_back = options['days_back']
        days_ahead = options['days_ahead']
        
        if 'all' in apis:
            apis = ['apod', 'neo', 'mars', 'epic', 'exoplanets']
        
        self.stdout.write(
            self.style.SUCCESS(f'Starting NASA data sync for: {", ".join(apis)}')
        )
        
        results = {}
        
        if 'apod' in apis:
            self.stdout.write('Syncing APOD data...')
            try:
                count = apod_service.sync_apod_data(days_back=days_back)
                results['apod'] = count
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Synced {count} APOD entries')
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'✗ APOD sync failed: {str(e)}')
                )
        
        if 'neo' in apis:
            self.stdout.write('Syncing NEO data...')
            try:
                count = neo_service.sync_neo_data(days_ahead=days_ahead)
                results['neo'] = count
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Synced {count} NEO entries')
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'✗ NEO sync failed: {str(e)}')
                )
        
        if 'mars' in apis:
            self.stdout.write('Syncing Mars rover data...')
            try:
                rovers = ['curiosity', 'perseverance', 'opportunity']
                rover_results = {}
                for rover in rovers:
                    count = mars_rover_service.sync_rover_data(rover, latest_sols=10)
                    rover_results[rover] = count
                    self.stdout.write(f'  ✓ {rover}: {count} photos')
                results['mars'] = rover_results
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'✗ Mars rover sync failed: {str(e)}')
                )
        
        if 'epic' in apis:
            self.stdout.write('Syncing EPIC data...')
            try:
                count = epic_service.sync_epic_data(days_back=days_back)
                results['epic'] = count
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Synced {count} EPIC images')
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'✗ EPIC sync failed: {str(e)}')
                )
        
        if 'exoplanets' in apis:
            self.stdout.write('Syncing exoplanet data...')
            try:
                count = exoplanet_service.sync_exoplanet_data(limit=500)
                results['exoplanets'] = count
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Synced {count} exoplanets')
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'✗ Exoplanet sync failed: {str(e)}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'\nSync completed! Results: {results}')
        )