"""
Celery tasks for research papers
"""
from celery import shared_task
from django.core.management import call_command
import logging

logger = logging.getLogger(__name__)


@shared_task
def sync_daily_research_papers():
    """
    Daily task to sync new research papers
    """
    try:
        logger.info("Starting daily research paper sync...")
        call_command('sync_research_papers', days=7, max_papers=100)
        logger.info("Daily research paper sync completed successfully")
    except Exception as e:
        logger.error(f"Error in daily research paper sync: {e}")


@shared_task
def sync_weekly_research_papers():
    """
    Weekly task to do a more comprehensive sync
    """
    try:
        logger.info("Starting weekly research paper sync...")
        call_command('sync_research_papers', days=30, max_papers=500)
        logger.info("Weekly research paper sync completed successfully")
    except Exception as e:
        logger.error(f"Error in weekly research paper sync: {e}")
