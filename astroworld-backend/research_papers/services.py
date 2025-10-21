"""
Research Paper API Integration Service
Fetches papers from NASA ADS, arXiv, and Crossref APIs
"""
import requests
from datetime import datetime, timedelta
from django.conf import settings
from django.utils import timezone
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)


class PaperFetchService:
    """Service for fetching astronomical research papers from multiple sources"""
    
    # NASA ADS API
    ADS_BASE_URL = "https://api.adsabs.harvard.edu/v1/search/query"
    ADS_API_KEY = settings.NASA_API_KEY  # Can use NASA key or get separate ADS key
    
    # arXiv API
    ARXIV_BASE_URL = "http://export.arxiv.org/api/query"
    
    # Crossref API (no key needed for basic use)
    CROSSREF_BASE_URL = "https://api.crossref.org/works"
    
    @classmethod
    def fetch_arxiv_papers(cls, query: str = "cat:astro-ph", max_results: int = 50) -> List[Dict]:
        """
        Fetch papers from arXiv
        
        Args:
            query: Search query (e.g., "cat:astro-ph" for astrophysics)
            max_results: Maximum number of results
            
        Returns:
            List of paper dictionaries
        """
        try:
            params = {
                'search_query': query,
                'start': 0,
                'max_results': max_results,
                'sortBy': 'submittedDate',
                'sortOrder': 'descending'
            }
            
            response = requests.get(cls.ARXIV_BASE_URL, params=params, timeout=30)
            response.raise_for_status()
            
            # Parse XML response
            import xml.etree.ElementTree as ET
            root = ET.fromstring(response.content)
            
            # Define namespaces
            ns = {
                'atom': 'http://www.w3.org/2005/Atom',
                'arxiv': 'http://arxiv.org/schemas/atom'
            }
            
            papers = []
            for entry in root.findall('atom:entry', ns):
                paper = cls._parse_arxiv_entry(entry, ns)
                if paper:
                    papers.append(paper)
            
            logger.info(f"Fetched {len(papers)} papers from arXiv")
            return papers
            
        except Exception as e:
            logger.error(f"Error fetching arXiv papers: {e}")
            return []
    
    @classmethod
    def _parse_arxiv_entry(cls, entry, ns) -> Optional[Dict]:
        """Parse a single arXiv entry"""
        try:
            # Extract paper ID from the link
            paper_link = entry.find('atom:id', ns).text
            paper_id = paper_link.split('/abs/')[-1]
            
            # Get title and clean it
            title = entry.find('atom:title', ns).text.strip().replace('\n', ' ')
            
            # Get authors
            authors = []
            for author in entry.findall('atom:author', ns):
                name = author.find('atom:name', ns)
                if name is not None:
                    authors.append(name.text)
            
            # Get abstract
            abstract = entry.find('atom:summary', ns).text.strip().replace('\n', ' ')
            
            # Get published date
            published = entry.find('atom:published', ns).text
            published_date = datetime.fromisoformat(published.replace('Z', '+00:00')).date()
            
            # Get categories
            categories = []
            for category in entry.findall('atom:category', ns):
                term = category.get('term')
                if term:
                    categories.append(term)
            
            # PDF link
            pdf_url = f"https://arxiv.org/pdf/{paper_id}.pdf"
            external_url = f"https://arxiv.org/abs/{paper_id}"
            
            return {
                'paper_id': paper_id,
                'source': 'arxiv',
                'title': title,
                'authors': ', '.join(authors),
                'abstract': abstract,
                'published_date': published_date,
                'categories': categories,
                'pdf_url': pdf_url,
                'external_url': external_url,
            }
        except Exception as e:
            logger.error(f"Error parsing arXiv entry: {e}")
            return None
    
    @classmethod
    def fetch_nasa_ads_papers(cls, query: str = "astro-ph", max_results: int = 50) -> List[Dict]:
        """
        Fetch papers from NASA ADS
        Requires ADS API key (can get from https://ui.adsabs.harvard.edu/help/api/)
        
        For now, returns empty list if no key is configured
        """
        # Check if ADS API key is available (separate from NASA key)
        ads_key = getattr(settings, 'ADS_API_KEY', None)
        if not ads_key:
            logger.info("NASA ADS API key not configured. Skipping ADS fetch.")
            return []
        
        try:
            headers = {'Authorization': f'Bearer {ads_key}'}
            params = {
                'q': query,
                'rows': max_results,
                'sort': 'date desc',
                'fl': 'bibcode,title,author,abstract,pubdate,doi,pub,citation_count'
            }
            
            response = requests.get(cls.ADS_BASE_URL, headers=headers, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            docs = data.get('response', {}).get('docs', [])
            
            papers = []
            for doc in docs:
                paper = cls._parse_ads_doc(doc)
                if paper:
                    papers.append(paper)
            
            logger.info(f"Fetched {len(papers)} papers from NASA ADS")
            return papers
            
        except Exception as e:
            logger.error(f"Error fetching NASA ADS papers: {e}")
            return []
    
    @classmethod
    def _parse_ads_doc(cls, doc: Dict) -> Optional[Dict]:
        """Parse a single NASA ADS document"""
        try:
            bibcode = doc.get('bibcode', '')
            title = doc.get('title', [''])[0] if doc.get('title') else ''
            authors = ', '.join(doc.get('author', [])[:10])  # Limit to first 10 authors
            abstract = doc.get('abstract', '')
            
            # Parse date
            pubdate = doc.get('pubdate', '')
            try:
                published_date = datetime.strptime(pubdate, '%Y-%m').date()
            except:
                published_date = timezone.now().date()
            
            doi = doc.get('doi', [''])[0] if doc.get('doi') else ''
            journal = doc.get('pub', '')
            citation_count = doc.get('citation_count', 0)
            
            return {
                'paper_id': bibcode,
                'source': 'nasa_ads',
                'title': title,
                'authors': authors,
                'abstract': abstract,
                'published_date': published_date,
                'journal': journal,
                'doi': doi,
                'citation_count': citation_count,
                'external_url': f"https://ui.adsabs.harvard.edu/abs/{bibcode}",
            }
        except Exception as e:
            logger.error(f"Error parsing ADS document: {e}")
            return None
    
    @classmethod
    def fetch_crossref_papers(cls, query: str = "astronomy", max_results: int = 50) -> List[Dict]:
        """
        Fetch papers from Crossref API
        Free to use, no API key required
        """
        try:
            params = {
                'query': query,
                'filter': 'type:journal-article',
                'rows': max_results,
                'sort': 'published',
                'order': 'desc'
            }
            
            response = requests.get(cls.CROSSREF_BASE_URL, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            items = data.get('message', {}).get('items', [])
            
            papers = []
            for item in items:
                paper = cls._parse_crossref_item(item)
                if paper:
                    papers.append(paper)
            
            logger.info(f"Fetched {len(papers)} papers from Crossref")
            return papers
            
        except Exception as e:
            logger.error(f"Error fetching Crossref papers: {e}")
            return []
    
    @classmethod
    def _parse_crossref_item(cls, item: Dict) -> Optional[Dict]:
        """Parse a single Crossref item"""
        try:
            doi = item.get('DOI', '')
            title = item.get('title', [''])[0] if item.get('title') else ''
            
            # Get authors
            authors = []
            for author in item.get('author', [])[:10]:
                given = author.get('given', '')
                family = author.get('family', '')
                authors.append(f"{given} {family}".strip())
            
            abstract = item.get('abstract', '')
            
            # Parse date
            published = item.get('published-print', item.get('published-online', {}))
            date_parts = published.get('date-parts', [[]])
            if date_parts and date_parts[0]:
                year = date_parts[0][0] if len(date_parts[0]) > 0 else timezone.now().year
                month = date_parts[0][1] if len(date_parts[0]) > 1 else 1
                day = date_parts[0][2] if len(date_parts[0]) > 2 else 1
                published_date = datetime(year, month, day).date()
            else:
                published_date = timezone.now().date()
            
            journal = item.get('container-title', [''])[0] if item.get('container-title') else ''
            
            return {
                'paper_id': doi,
                'source': 'crossref',
                'title': title,
                'authors': ', '.join(authors),
                'abstract': abstract,
                'published_date': published_date,
                'journal': journal,
                'doi': doi,
                'external_url': f"https://doi.org/{doi}",
            }
        except Exception as e:
            logger.error(f"Error parsing Crossref item: {e}")
            return None
    
    @classmethod
    def fetch_all_recent_papers(cls, days_back: int = 7) -> List[Dict]:
        """
        Fetch recent papers from all sources
        
        Args:
            days_back: Number of days to look back
            
        Returns:
            Combined list of papers from all sources
        """
        all_papers = []
        
        # Fetch from arXiv (astrophysics category)
        arxiv_papers = cls.fetch_arxiv_papers(query="cat:astro-ph", max_results=30)
        all_papers.extend(arxiv_papers)
        
        # Fetch from NASA ADS (if configured)
        ads_papers = cls.fetch_nasa_ads_papers(query="year:2024-2025 astro-ph", max_results=30)
        all_papers.extend(ads_papers)
        
        # Fetch from Crossref
        crossref_papers = cls.fetch_crossref_papers(query="astronomy OR astrophysics", max_results=20)
        all_papers.extend(crossref_papers)
        
        logger.info(f"Total papers fetched from all sources: {len(all_papers)}")
        return all_papers
