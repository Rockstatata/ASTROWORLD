from django.core.management.base import BaseCommand
from django.utils import timezone
from spacex_api.services import SpaceXDataSyncService
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Sync SpaceX API data including launches, rockets, and historical events'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--data-types',
            nargs='+',
            default=['all'],
            help='Specify which data to sync: launches, rockets, launchpads, history, missions, starlink, cores, capsules, or all'
        )
        parser.add_argument(
            '--upcoming-only',
            action='store_true',
            help='Sync only upcoming launches'
        )
        parser.add_argument(
            '--starlink-limit',
            type=int,
            default=500,
            help='Limit number of Starlink satellites to sync (default: 500)'
        )
        parser.add_argument(
            '--force-refresh',
            action='store_true',
            help='Force refresh of existing data'
        )
    
    def handle(self, *args, **options):
        data_types = options['data_types']
        upcoming_only = options['upcoming_only']
        starlink_limit = options['starlink_limit']
        force_refresh = options['force_refresh']
        
        self.stdout.write(
            self.style.SUCCESS(f'Starting SpaceX data sync for: {", ".join(data_types)}')
        )
        self.stdout.write(f'Upcoming only: {upcoming_only}')
        self.stdout.write(f'Force refresh: {force_refresh}')
        
        sync_service = SpaceXDataSyncService()
        results = {}
        total_synced = 0
        
        try:
            if 'all' in data_types:
                self.stdout.write('Syncing all SpaceX data...')
                results = sync_service.sync_all(starlink_limit=starlink_limit)
                total_synced = sum(results.values())
                
            else:
                if 'rockets' in data_types:
                    self.stdout.write('Syncing rockets...')
                    count = sync_service.sync_rockets()
                    results['rockets'] = count
                    total_synced += count
                    self.stdout.write(f'✓ Synced {count} rockets')
                
                if 'launchpads' in data_types:
                    self.stdout.write('Syncing launchpads...')
                    count = sync_service.sync_launchpads()
                    results['launchpads'] = count
                    total_synced += count
                    self.stdout.write(f'✓ Synced {count} launchpads')
                
                if 'launches' in data_types:
                    self.stdout.write('Syncing launches...')
                    count = sync_service.sync_launches(upcoming_only=upcoming_only)
                    results['launches'] = count
                    total_synced += count
                    self.stdout.write(f'✓ Synced {count} launches')
                
                if 'history' in data_types:
                    self.stdout.write('Syncing historical events...')
                    count = sync_service.sync_historical_events()
                    results['history'] = count
                    total_synced += count
                    self.stdout.write(f'✓ Synced {count} historical events')
                
                if 'missions' in data_types:
                    self.stdout.write('Syncing missions...')
                    count = sync_service.sync_missions()
                    results['missions'] = count
                    total_synced += count
                    self.stdout.write(f'✓ Synced {count} missions')
                
                if 'starlink' in data_types:
                    self.stdout.write(f'Syncing Starlink satellites (limit: {starlink_limit})...')
                    count = sync_service.sync_starlink(limit=starlink_limit)
                    results['starlink'] = count
                    total_synced += count
                    self.stdout.write(f'✓ Synced {count} Starlink satellites')
                
                if 'cores' in data_types:
                    self.stdout.write('Syncing cores...')
                    count = sync_service.sync_cores()
                    results['cores'] = count
                    total_synced += count
                    self.stdout.write(f'✓ Synced {count} cores')
                
                if 'capsules' in data_types:
                    self.stdout.write('Syncing capsules...')
                    count = sync_service.sync_capsules()
                    results['capsules'] = count
                    total_synced += count
                    self.stdout.write(f'✓ Synced {count} capsules')
            
            self.stdout.write(
                self.style.SUCCESS(f'\n🚀 SpaceX sync completed successfully!')
            )
            self.stdout.write(f'Total items synced: {total_synced}')
            self.stdout.write(f'Detailed results: {results}')
            self.stdout.write(f'Sync completed at: {timezone.now()}')
            
        except Exception as e:
            logger.error(f"SpaceX data sync failed: {e}")
            self.stdout.write(
                self.style.ERROR(f'❌ SpaceX sync failed: {str(e)}')
            )
            raise e