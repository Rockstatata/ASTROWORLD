from django.core.management.base import BaseCommand
from django.utils import timezone
from django.core.management import call_command
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Sync all data sources: NASA, SpaceX, News, and Research Papers'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--sources',
            nargs='+',
            default=['all'],
            help='Specify which sources to sync: nasa, spacex, news, research, or all'
        )
        parser.add_argument(
            '--force-refresh',
            action='store_true',
            help='Force refresh of existing data'
        )
        parser.add_argument(
            '--days-back',
            type=int,
            default=7,
            help='Number of days back to sync for time-based APIs'
        )
        parser.add_argument(
            '--days-ahead',
            type=int,
            default=30,
            help='Number of days ahead to sync for future events'
        )
    
    def handle(self, *args, **options):
        sources = options['sources']
        force_refresh = options['force_refresh']
        days_back = options['days_back']
        days_ahead = options['days_ahead']
        
        self.stdout.write(
            self.style.SUCCESS(f'🌌 Starting comprehensive data sync for: {", ".join(sources)}')
        )
        self.stdout.write(f'📅 Days back: {days_back}, Days ahead: {days_ahead}')
        self.stdout.write(f'🔄 Force refresh: {force_refresh}')
        self.stdout.write('=' * 80)
        
        sync_results = {}
        
        try:
            if 'all' in sources or 'nasa' in sources:
                self.stdout.write('\n🛰️  SYNCING NASA & SPACE DATA...')
                self.stdout.write('-' * 40)
                try:
                    # Sync NASA APOD, NEO, Mars photos, etc.
                    self.stdout.write('🔭 Syncing NASA scientific data...')
                    call_command('sync_nasa_data', 
                               apis=['all'], 
                               days_back=days_back,
                               days_ahead=days_ahead,
                               verbosity=1)
                    
                    # Sync comprehensive NASA data
                    self.stdout.write('🌌 Syncing comprehensive NASA data...')
                    call_command('sync_all_nasa_data',
                               days_back=days_back,
                               force_refresh=force_refresh,
                               verbosity=1)
                    
                    # Sync space events with Launch Library 2 and astronomical events
                    self.stdout.write('🚀 Syncing space events from Launch Library 2...')
                    from nasa_api.services import space_event_service, launch_library_service
                    space_events_count = space_event_service.sync_space_events()
                    
                    # Sync additional Launch Library data
                    self.stdout.write('📡 Syncing Launch Library launches...')
                    launch_count = launch_library_service.sync_launches_to_space_events(100)
                    
                    self.stdout.write('👨‍🚀 Syncing Launch Library events...')
                    event_count = launch_library_service.sync_events_to_space_events(50)
                    
                    sync_results['nasa'] = {
                        'space_events': space_events_count,
                        'launch_library_launches': launch_count,
                        'launch_library_events': event_count,
                        'status': 'success'
                    }
                    self.stdout.write(f'✅ NASA & Space data sync completed:')
                    self.stdout.write(f'   📅 {space_events_count} space events')
                    self.stdout.write(f'   🚀 {launch_count} launches from Launch Library')
                    self.stdout.write(f'   🛰️  {event_count} space events from Launch Library')
                    
                except Exception as e:
                    sync_results['nasa'] = {'status': 'failed', 'error': str(e)}
                    self.stdout.write(self.style.ERROR(f'❌ NASA & Space data sync failed: {str(e)}'))
            
            if 'all' in sources or 'spacex' in sources:
                self.stdout.write('\n🚀 SYNCING SPACEX DATA...')
                self.stdout.write('-' * 40)
                try:
                    call_command('sync_spacex_data',
                               data_types=['all'],
                               starlink_limit=500,
                               force_refresh=force_refresh,
                               verbosity=1)
                    
                    sync_results['spacex'] = {'status': 'success'}
                    self.stdout.write('✅ SpaceX sync completed')
                    
                except Exception as e:
                    sync_results['spacex'] = {'status': 'failed', 'error': str(e)}
                    self.stdout.write(self.style.ERROR(f'❌ SpaceX sync failed: {str(e)}'))
            
            if 'all' in sources or 'news' in sources:
                self.stdout.write('\n📰 SYNCING NEWS DATA...')
                self.stdout.write('-' * 40)
                try:
                    # Sync using existing command
                    self.stdout.write('📄 Syncing existing news sources...')
                    call_command('sync_news_data',
                               limit=100,
                               force_refresh=force_refresh,
                               verbosity=1)
                    
                    # Sync enhanced Spaceflight News API
                    self.stdout.write('🚀 Syncing Spaceflight News API v4...')
                    from nasa_api.services import enhanced_spaceflight_news_service
                    news_results = enhanced_spaceflight_news_service.sync_news_content(150)
                    
                    sync_results['news'] = {
                        'spaceflight_articles': news_results['articles'],
                        'spaceflight_blogs': news_results['blogs'],
                        'spaceflight_reports': news_results['reports'],
                        'status': 'success'
                    }
                    self.stdout.write('✅ News sync completed:')
                    self.stdout.write(f'   📰 {news_results["articles"]} articles')
                    self.stdout.write(f'   📝 {news_results["blogs"]} blog posts')
                    self.stdout.write(f'   📊 {news_results["reports"]} reports')
                    
                except Exception as e:
                    sync_results['news'] = {'status': 'failed', 'error': str(e)}
                    self.stdout.write(self.style.ERROR(f'❌ News sync failed: {str(e)}'))
            
            if 'all' in sources or 'research' in sources:
                self.stdout.write('\n📚 SYNCING RESEARCH PAPERS...')
                self.stdout.write('-' * 40)
                try:
                    call_command('sync_research_papers',
                               limit=50,
                               force_refresh=force_refresh,
                               verbosity=1)
                    
                    sync_results['research'] = {'status': 'success'}
                    self.stdout.write('✅ Research papers sync completed')
                    
                except Exception as e:
                    sync_results['research'] = {'status': 'failed', 'error': str(e)}
                    self.stdout.write(self.style.ERROR(f'❌ Research papers sync failed: {str(e)}'))
            
            # Final summary
            self.stdout.write('\n' + '=' * 80)
            self.stdout.write(self.style.SUCCESS('🎉 COMPREHENSIVE SYNC COMPLETED!'))
            self.stdout.write(f'⏰ Completed at: {timezone.now()}')
            
            # Display results summary
            self.stdout.write('\n📊 SYNC SUMMARY:')
            for source, result in sync_results.items():
                status_emoji = '✅' if result['status'] == 'success' else '❌'
                self.stdout.write(f'  {status_emoji} {source.upper()}: {result["status"]}')
                if result['status'] == 'failed':
                    self.stdout.write(f'      Error: {result["error"]}')
            
        except Exception as e:
            logger.error(f"Comprehensive data sync failed: {e}")
            self.stdout.write(
                self.style.ERROR(f'💥 Comprehensive sync failed: {str(e)}')
            )
            raise e