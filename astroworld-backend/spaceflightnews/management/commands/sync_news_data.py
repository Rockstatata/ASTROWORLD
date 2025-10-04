import logging
from django.core.management.base import BaseCommand
from ...services import spaceflight_news_service

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Sync spaceflight news data from the SNAPI'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days-back',
            type=int,
            default=7,
            help='Number of days back to sync news data (default: 7)'
        )
        parser.add_argument(
            '--article-types',
            nargs='+',
            default=['articles', 'blogs', 'reports'],
            help='Types of articles to sync (default: articles blogs reports)'
        )
        parser.add_argument(
            '--force-refresh',
            action='store_true',
            help='Force refresh of all data'
        )

    def handle(self, *args, **options):
        days_back = options['days_back']
        article_types = options['article_types']
        force_refresh = options['force_refresh']

        self.stdout.write(
            self.style.SUCCESS(f'Starting spaceflight news sync...')
        )
        self.stdout.write(f'Days back: {days_back}')
        self.stdout.write(f'Article types: {", ".join(article_types)}')
        
        try:
            results = spaceflight_news_service.sync_news_data(
                days_back=days_back, 
                article_types=article_types
            )
            total = sum(results.values())
            
            self.stdout.write(
                self.style.SUCCESS(f'Spaceflight News: Synced {total} articles')
            )
            
            for article_type, count in results.items():
                self.stdout.write(f'  - {article_type}: {count} articles')
                
        except Exception as e:
            error_msg = f'Spaceflight News sync failed: {e}'
            logger.error(error_msg)
            self.stdout.write(
                self.style.ERROR(error_msg)
            )
            raise