import requests
import json
import logging
from datetime import datetime, timedelta
from django.conf import settings
from django.utils import timezone
from django.core.cache import cache
from typing import Optional, Dict, List, Any
import time 
from spaceflightnews.models import SpaceflightNews, NewsAuthor

logger = logging.getLogger(__name__)

class SpaceflightNewsService:
    """Spaceflight News API service"""
    
    def __init__(self):
        self.base_url = "https://api.spaceflightnewsapi.net/v4"
        self.session = requests.Session()
    
    def fetch_articles(self, limit: int = 100, offset: int = 0, 
                      news_site: str = None, search: str = None,
                      published_at_gte: str = None, published_at_lte: str = None) -> Optional[Dict]:
        """Fetch articles from Spaceflight News API"""
        params = {
            'limit': min(limit, 100),  # API limit is 100
            'offset': offset
        }
        
        if news_site:
            params['news_site'] = news_site
        if search:
            params['search'] = search
        if published_at_gte:
            params['published_at_gte'] = published_at_gte
        if published_at_lte:
            params['published_at_lte'] = published_at_lte
            
        return self._make_request('articles', params)
    
    def fetch_blogs(self, limit: int = 100, offset: int = 0) -> Optional[Dict]:
        """Fetch blogs from Spaceflight News API"""
        params = {'limit': min(limit, 100), 'offset': offset}
        return self._make_request('blogs', params)
    
    def fetch_reports(self, limit: int = 100, offset: int = 0) -> Optional[Dict]:
        """Fetch reports from Spaceflight News API"""
        params = {'limit': min(limit, 100), 'offset': offset}
        return self._make_request('reports', params)
    
    def fetch_article_by_id(self, article_id: int) -> Optional[Dict]:
        """Fetch specific article by ID"""
        return self._make_request(f'articles/{article_id}')
    
    def fetch_info(self) -> Optional[Dict]:
        """Fetch API info including available news sites"""
        return self._make_request('info')
    
    def _make_request(self, endpoint: str, params: Dict = None) -> Optional[Dict]:
        """Make request to Spaceflight News API"""
        if params is None:
            params = {}
            
        url = f"{self.base_url}/{endpoint}/"
        
        try:
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Spaceflight News API request failed for {endpoint}: {str(e)}")
            return None
    
    def sync_news_data(self, days_back: int = 7, article_types: List[str] = None) -> Dict:
        """Sync spaceflight news data"""
        if article_types is None:
            article_types = ['articles', 'blogs', 'reports']
            
        synced_counts = {}
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days_back)
        
        start_date_str = start_date.strftime('%Y-%m-%dT%H:%M:%S')
        end_date_str = end_date.strftime('%Y-%m-%dT%H:%M:%S')
        
        for article_type in article_types:
            synced_counts[article_type] = 0
            
            if article_type == 'articles':
                data = self.fetch_articles(
                    limit=100, 
                    published_at_gte=start_date_str,
                    published_at_lte=end_date_str
                )
            elif article_type == 'blogs':
                data = self.fetch_blogs(limit=100)
            elif article_type == 'reports':
                data = self.fetch_reports(limit=100)
            else:
                continue
                
            if data and 'results' in data:
                for item in data['results']:
                    # Filter by date for blogs and reports
                    if article_type in ['blogs', 'reports']:
                        pub_date = datetime.fromisoformat(item['published_at'].replace('Z', '+00:00'))
                        if pub_date < start_date or pub_date > end_date:
                            continue
                    
                    try:
                        # Save authors
                        author_names = []
                        for author_data in item.get('authors', []):
                            # Handle both string and dict formats for authors
                            if isinstance(author_data, str):
                                author_name = author_data
                                author_socials = {}
                            else:
                                author_name = author_data.get('name', '')
                                author_socials = author_data.get('socials', {}) or {}
                            
                            if author_name:  # Only create if we have a name
                                author, created = NewsAuthor.objects.get_or_create(
                                    name=author_name,
                                    defaults={'socials': author_socials}
                                )
                                author_names.append(author.name)
                        
                        # Save news article
                        news_item, created = SpaceflightNews.objects.get_or_create(
                            nasa_id=f"snapi_{item['id']}",  # Simplified ID
                            defaults={
                                'title': item['title'],
                                'authors': item.get('authors', []),
                                'url': item['url'],
                                'image_url': item.get('image_url', ''),
                                'news_site': item['news_site'],
                                'summary': item.get('summary', ''),
                                'published_at': item['published_at'],
                                'featured': item.get('featured', False),
                                'launches': item.get('launches', []),
                                'events': item.get('events', []),
                                'article_type': article_type.rstrip('s')  # Remove 's' from plural
                            }
                        )
                        
                        if created:
                            synced_counts[article_type] += 1
                            
                    except Exception as e:
                        logger.error(f"Error saving {article_type} item {item.get('id', 'unknown')}: {str(e)}")
        
        return synced_counts

# Add to service instances at the bottom
spaceflight_news_service = SpaceflightNewsService()