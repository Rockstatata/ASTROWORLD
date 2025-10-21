from celery import shared_task
from django.utils import timezone
from datetime import timedelta
import logging

from .services import SpaceXDataSyncService
from .models import SpaceXLaunch, UserTrackedSpaceXLaunch

logger = logging.getLogger(__name__)

@shared_task(bind=True)
def sync_spacex_launches(self, upcoming_only=False):
    """Sync SpaceX launches data"""
    try:
        sync_service = SpaceXDataSyncService()
        count = sync_service.sync_launches(upcoming_only=upcoming_only)
        logger.info(f"Synced {count} SpaceX launches")
        return f"Successfully synced {count} launches"
    except Exception as exc:
        logger.error(f"SpaceX launches sync failed: {exc}")
        raise self.retry(exc=exc, countdown=300, max_retries=3)

@shared_task(bind=True)
def sync_spacex_rockets(self):
    """Sync SpaceX rockets data"""
    try:
        sync_service = SpaceXDataSyncService()
        count = sync_service.sync_rockets()
        logger.info(f"Synced {count} SpaceX rockets")
        return f"Successfully synced {count} rockets"
    except Exception as exc:
        logger.error(f"SpaceX rockets sync failed: {exc}")
        raise self.retry(exc=exc, countdown=300, max_retries=3)

@shared_task(bind=True)
def sync_spacex_launchpads(self):
    """Sync SpaceX launchpads data"""
    try:
        sync_service = SpaceXDataSyncService()
        count = sync_service.sync_launchpads()
        logger.info(f"Synced {count} SpaceX launchpads")
        return f"Successfully synced {count} launchpads"
    except Exception as exc:
        logger.error(f"SpaceX launchpads sync failed: {exc}")
        raise self.retry(exc=exc, countdown=300, max_retries=3)

@shared_task(bind=True)
def sync_spacex_historical_events(self):
    """Sync SpaceX historical events data"""
    try:
        sync_service = SpaceXDataSyncService()
        count = sync_service.sync_historical_events()
        logger.info(f"Synced {count} SpaceX historical events")
        return f"Successfully synced {count} historical events"
    except Exception as exc:
        logger.error(f"SpaceX historical events sync failed: {exc}")
        raise self.retry(exc=exc, countdown=300, max_retries=3)

@shared_task(bind=True)
def sync_spacex_missions(self):
    """Sync SpaceX missions data"""
    try:
        sync_service = SpaceXDataSyncService()
        count = sync_service.sync_missions()
        logger.info(f"Synced {count} SpaceX missions")
        return f"Successfully synced {count} missions"
    except Exception as exc:
        logger.error(f"SpaceX missions sync failed: {exc}")
        raise self.retry(exc=exc, countdown=300, max_retries=3)

@shared_task(bind=True)
def sync_spacex_starlink(self, limit=500):
    """Sync SpaceX Starlink data"""
    try:
        sync_service = SpaceXDataSyncService()
        count = sync_service.sync_starlink(limit=limit)
        logger.info(f"Synced {count} Starlink satellites")
        return f"Successfully synced {count} Starlink satellites"
    except Exception as exc:
        logger.error(f"Starlink sync failed: {exc}")
        raise self.retry(exc=exc, countdown=300, max_retries=3)

@shared_task(bind=True)
def sync_spacex_cores(self):
    """Sync SpaceX cores data"""
    try:
        sync_service = SpaceXDataSyncService()
        count = sync_service.sync_cores()
        logger.info(f"Synced {count} SpaceX cores")
        return f"Successfully synced {count} cores"
    except Exception as exc:
        logger.error(f"SpaceX cores sync failed: {exc}")
        raise self.retry(exc=exc, countdown=300, max_retries=3)

@shared_task(bind=True)
def sync_spacex_capsules(self):
    """Sync SpaceX capsules data"""
    try:
        sync_service = SpaceXDataSyncService()
        count = sync_service.sync_capsules()
        logger.info(f"Synced {count} SpaceX capsules")
        return f"Successfully synced {count} capsules"
    except Exception as exc:
        logger.error(f"SpaceX capsules sync failed: {exc}")
        raise self.retry(exc=exc, countdown=300, max_retries=3)

@shared_task(bind=True)
def sync_all_spacex_data(self, starlink_limit=500):
    """Sync all SpaceX data"""
    try:
        sync_service = SpaceXDataSyncService()
        results = sync_service.sync_all(starlink_limit=starlink_limit)
        
        total_synced = sum(results.values())
        logger.info(f"Synced all SpaceX data: {results}")
        return f"Successfully synced {total_synced} total items: {results}"
    except Exception as exc:
        logger.error(f"SpaceX full sync failed: {exc}")
        raise self.retry(exc=exc, countdown=600, max_retries=2)

@shared_task
def send_launch_notifications():
    """Send notifications for upcoming SpaceX launches"""
    try:
        now = timezone.now()
        
        # Get all tracked launches that are within notification window
        tracked_launches = UserTrackedSpaceXLaunch.objects.filter(
            notification_enabled=True,
            launch__upcoming=True,
            launch__launch_date_utc__isnull=False
        )
        
        notifications_sent = 0
        
        for tracked in tracked_launches:
            launch = tracked.launch
            notify_time = launch.launch_date_utc - timedelta(hours=tracked.notify_before_hours)
            
            # Check if it's time to send notification
            if now >= notify_time and now < launch.launch_date_utc:
                # Here you would integrate with your notification system
                # For now, we'll just log it
                logger.info(
                    f"Notification for user {tracked.user.username}: "
                    f"SpaceX launch '{launch.mission_name}' in {tracked.notify_before_hours} hours"
                )
                notifications_sent += 1
        
        return f"Sent {notifications_sent} launch notifications"
        
    except Exception as exc:
        logger.error(f"Launch notifications failed: {exc}")
        return f"Failed to send notifications: {exc}"

# Periodic task configurations
@shared_task
def hourly_spacex_sync():
    """Hourly sync of critical SpaceX data"""
    # Sync upcoming launches every hour
    sync_spacex_launches.delay(upcoming_only=True)

@shared_task
def daily_spacex_sync():
    """Daily sync of all SpaceX launches and events"""
    # Sync all launches daily
    sync_spacex_launches.delay()
    # Sync historical events daily
    sync_spacex_historical_events.delay()

@shared_task
def weekly_spacex_sync():
    """Weekly sync of less frequently changing data"""
    # Sync rockets weekly
    sync_spacex_rockets.delay()
    # Sync launchpads weekly
    sync_spacex_launchpads.delay()
    # Sync missions weekly
    sync_spacex_missions.delay()
    # Sync cores and capsules weekly
    sync_spacex_cores.delay()
    sync_spacex_capsules.delay()

@shared_task
def monthly_starlink_sync():
    """Monthly sync of Starlink data (large dataset)"""
    # Sync Starlink satellites monthly with limit
    sync_spacex_starlink.delay(limit=1000)