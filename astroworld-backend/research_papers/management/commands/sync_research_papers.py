"""
Management command to sync research papers from external APIs
Usage: python manage.py sync_research_papers
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from research_papers.services import PaperFetchService
from users.models import ResearchPaper


class Command(BaseCommand):
    help = 'Sync research papers from NASA ADS, arXiv, and Crossref'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=7,
            help='Number of days to look back for papers (default: 7)'
        )
        parser.add_argument(
            '--max-papers',
            type=int,
            default=100,
            help='Maximum number of papers to fetch (default: 100)'
        )

    def handle(self, *args, **options):
        days_back = options['days']
        max_papers = options['max_papers']
        
        self.stdout.write(self.style.SUCCESS(f'Fetching papers from last {days_back} days...'))
        
        # Fetch papers from all sources
        papers_data = PaperFetchService.fetch_all_recent_papers(days_back=days_back)
        
        if not papers_data:
            self.stdout.write(self.style.WARNING('No papers fetched. Check API configurations.'))
            return
        
        self.stdout.write(f'Found {len(papers_data)} papers. Saving to database...')
        
        created_count = 0
        updated_count = 0
        error_count = 0
        
        for paper_data in papers_data[:max_papers]:
            try:
                with transaction.atomic():
                    paper, created = ResearchPaper.objects.update_or_create(
                        paper_id=paper_data['paper_id'],
                        defaults={
                            'source': paper_data['source'],
                            'title': paper_data['title'],
                            'authors': paper_data['authors'],
                            'abstract': paper_data.get('abstract', ''),
                            'published_date': paper_data['published_date'],
                            'journal': paper_data.get('journal', ''),
                            'pdf_url': paper_data.get('pdf_url', ''),
                            'external_url': paper_data.get('external_url', ''),
                            'doi': paper_data.get('doi', ''),
                            'categories': paper_data.get('categories', []),
                            'citation_count': paper_data.get('citation_count', 0),
                        }
                    )
                    if created:
                        created_count += 1
                    else:
                        updated_count += 1
            except Exception as e:
                error_count += 1
                self.stdout.write(self.style.ERROR(f'Error saving paper {paper_data.get("paper_id")}: {e}'))
        
        self.stdout.write(self.style.SUCCESS(
            f'\nSync complete!\n'
            f'Created: {created_count}\n'
            f'Updated: {updated_count}\n'
            f'Errors: {error_count}'
        ))
