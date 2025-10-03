# nasa_api/tasks.py
from celery import shared_task
from django.core.management import call_command
from django.utils import timezone
from datetime import timedelta
import logging

from .services import (
    apod_service, neo_service, mars_rover_service, 
    epic_service, exoplanet_service, space_weather_service, 
    natural_event_service
)
from .models import APOD, NearEarthObject, APIUsageLog

logger = logging.getLogger(__name__)

@shared_task
def sync_daily_nasa_data():
    """Daily task to sync NASA data"""
    try:
        results = {}
        
        # Sync APOD
        results['apod'] = apod_service.sync_apod_data(days_back=1)
        
        # Sync NEO data for next 7 days
        results['neo'] = neo_service.sync_neo_data(days_ahead=7)
        
        # Sync EPIC images
        results['epic'] = epic_service.sync_epic_data(days_back=1)
        
        # Sync space weather events
        results['space_weather'] = space_weather_service.sync_space_weather_data(days_back=7)
        
        # Sync natural events
        results['natural_events'] = natural_event_service.sync_natural_events_data(limit=100)
        
        logger.info(f'Daily NASA data sync completed: {results}')
        return results
    except Exception as e:
        logger.error(f'Daily NASA data sync failed: {e}')
        raise

@shared_task
def sync_weekly_nasa_data():
    """Weekly comprehensive sync"""
    try:
        results = {}
        
        # Comprehensive APOD sync
        results['apod'] = apod_service.sync_apod_data(days_back=30)
        
        # Extended NEO sync
        results['neo'] = neo_service.sync_neo_data(days_ahead=60)
        
        # Mars rover data sync
        results['mars_rovers'] = {}
        for rover in ['curiosity', 'perseverance', 'opportunity', 'spirit']:
            try:
                results['mars_rovers'][rover] = mars_rover_service.sync_rover_data(rover, latest_sols=20)
            except Exception as e:
                logger.error(f'Mars rover {rover} sync failed: {e}')
                results['mars_rovers'][rover] = 0
        
        # EPIC comprehensive sync
        results['epic'] = epic_service.sync_epic_data(days_back=7)
        
        # Exoplanet data sync
        results['exoplanets'] = exoplanet_service.sync_exoplanet_data(limit=1000)
        
        # Space weather comprehensive sync
        results['space_weather'] = space_weather_service.sync_space_weather_data(days_back=30)
        
        # Natural events comprehensive sync
        results['natural_events'] = natural_event_service.sync_natural_events_data(limit=1000)
        
        logger.info(f'Weekly NASA data sync completed: {results}')
        return results
    except Exception as e:
        logger.error(f'Weekly NASA data sync failed: {e}')
        raise

@shared_task
def send_neo_alerts():
    """Check and send NEO approach alerts"""
    try:
        from .notifications import NotificationService
        
        result = NotificationService.check_and_send_neo_alerts()
        logger.info(f'NEO alerts sent: {result}')
        return result
    except Exception as e:
        logger.error(f'NEO alert task failed: {e}')
        raise

@shared_task
def cleanup_old_data():
    """Clean up old data to manage database size"""
    try:
        from .models import APOD, NearEarthObject, EPICImage, APIUsageLog
        
        results = {}
        
        # Keep only last 2 years of APOD
        cutoff_date = timezone.now().date() - timedelta(days=730)
        deleted_apod = APOD.objects.filter(date__lt=cutoff_date).delete()
        results['apod_deleted'] = deleted_apod[0] if deleted_apod[0] > 0 else 0
        
        # Keep only future + 1 year past NEO data
        past_cutoff = timezone.now() - timedelta(days=365)
        deleted_neo_approaches = NearEarthObject.objects.filter(
            close_approaches__close_approach_date__lt=past_cutoff
        ).delete()
        results['neo_deleted'] = deleted_neo_approaches[0] if deleted_neo_approaches[0] > 0 else 0
        
        # Keep only last 6 months of EPIC images
        epic_cutoff = timezone.now() - timedelta(days=180)
        deleted_epic = EPICImage.objects.filter(date__lt=epic_cutoff).delete()
        results['epic_deleted'] = deleted_epic[0] if deleted_epic[0] > 0 else 0
        
        # Keep only last 3 months of API usage logs
        log_cutoff = timezone.now() - timedelta(days=90)
        deleted_logs = APIUsageLog.objects.filter(timestamp__lt=log_cutoff).delete()
        results['logs_deleted'] = deleted_logs[0] if deleted_logs[0] > 0 else 0
        
        logger.info(f'Data cleanup completed: {results}')
        return results
    except Exception as e:
        logger.error(f'Data cleanup failed: {e}')
        raise