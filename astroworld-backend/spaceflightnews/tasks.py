import logging
from celery import shared_task
from .services import spaceflight_news_service

logger = logging.getLogger(__name__)

@shared_task
def sync_daily_spaceflight_news():
    """Daily task to sync spaceflight news data"""
    try:
        results = spaceflight_news_service.sync_news_data(days_back=1)
        total = sum(results.values())
        logger.info(f'Daily spaceflight news sync completed: {total} articles synced')
        return results
    except Exception as e:
        logger.error(f'Daily spaceflight news sync failed: {e}')
        raise

@shared_task  
def sync_weekly_spaceflight_news():
    """Weekly task to sync spaceflight news data"""
    try:
        results = spaceflight_news_service.sync_news_data(days_back=7)
        total = sum(results.values())
        logger.info(f'Weekly spaceflight news sync completed: {total} articles synced')
        return results
    except Exception as e:
        logger.error(f'Weekly spaceflight news sync failed: {e}')
        raise

@shared_task
def sync_spaceflight_news_by_type(article_types=None, days_back=7):
    """Sync specific types of spaceflight news"""
    if article_types is None:
        article_types = ['articles', 'blogs', 'reports']
        
    try:
        results = spaceflight_news_service.sync_news_data(
            days_back=days_back,
            article_types=article_types
        )
        total = sum(results.values())
        logger.info(f'Spaceflight news sync completed: {total} articles synced')
        return results
    except Exception as e:
        logger.error(f'Spaceflight news sync failed: {e}')
        raise