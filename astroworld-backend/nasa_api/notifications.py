# nasa_api/notifications.py
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import logging

from .models import UserTrackedObject, NearEarthObject

logger = logging.getLogger(__name__)

class NotificationService:
    """Service for handling user notifications"""
    
    @staticmethod
    def check_and_send_neo_alerts():
        """Check for NEO close approaches and send alerts"""
        results = {
            'alerts_sent': 0,
            'errors': 0,
            'users_notified': []
        }
        
        # Get NEOs approaching in the next 24-48 hours
        tomorrow = timezone.now().date() + timedelta(days=1)
        day_after = timezone.now().date() + timedelta(days=2)
        
        # Find close approaches
        from .models import NEOCloseApproach
        approaching_neos = NEOCloseApproach.objects.filter(
            close_approach_date__date__gte=tomorrow,
            close_approach_date__date__lte=day_after
        ).select_related('neo')
        
        for approach in approaching_neos:
            # Find users tracking this NEO
            tracking_users = UserTrackedObject.objects.filter(
                object_type='neo',
                object_id=approach.neo.nasa_id,
                notification_enabled=True
            ).select_related('user')
            
            for tracking in tracking_users:
                try:
                    NotificationService.send_neo_alert(tracking.user, approach.neo, approach)
                    results['alerts_sent'] += 1
                    if tracking.user.username not in results['users_notified']:
                        results['users_notified'].append(tracking.user.username)
                except Exception as e:
                    logger.error(f'Failed to send NEO alert to {tracking.user.email}: {e}')
                    results['errors'] += 1
        
        return results
    
    @staticmethod
    def send_neo_alert(user, neo, approach):
        """Send NEO approach alert to user"""
        if not user.email:
            logger.warning(f'User {user.username} has no email address')
            return
            
        subject = f'🚀 ASTROWORLD Alert: {neo.name} approaching Earth!'
        
        message = f"""
Hi {user.first_name or user.username},

The Near Earth Object "{neo.name}" that you're tracking will make a close approach to Earth on {approach.close_approach_date.strftime('%Y-%m-%d %H:%M UTC')}.

Details:
- Miss Distance: {approach.miss_distance_km:,.0f} km
- Relative Velocity: {approach.relative_velocity_kmh:,.0f} km/h
- Potentially Hazardous: {'Yes' if neo.is_potentially_hazardous else 'No'}
- Diameter: {neo.estimated_diameter_min_km:.2f} - {neo.estimated_diameter_max_km:.2f} km

View more details: {settings.FRONTEND_URL}/nasa/neo/{neo.id}

To manage your tracking preferences: {settings.FRONTEND_URL}/dashboard

Happy stargazing!
The ASTROWORLD Team
        """
        
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            logger.info(f'NEO alert sent to {user.email} for {neo.name}')
        except Exception as e:
            logger.error(f'Failed to send NEO alert to {user.email}: {e}')
            raise
    
    @staticmethod
    def send_space_weather_alert(user, event):
        """Send space weather event alert"""
        if not user.email:
            return
            
        subject = f'⚡ ASTROWORLD: Space Weather Alert - {event.get_event_type_display()}'
        
        message = f"""
Hi {user.first_name or user.username},

A space weather event that you're tracking has been updated:

Event Type: {event.get_event_type_display()}
Event Time: {event.event_time.strftime('%Y-%m-%d %H:%M UTC')}
Summary: {event.summary}

View more details: {settings.FRONTEND_URL}/nasa/space-weather/{event.id}

Stay safe!
The ASTROWORLD Team
        """
        
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            logger.info(f'Space weather alert sent to {user.email}')
        except Exception as e:
            logger.error(f'Failed to send space weather alert to {user.email}: {e}')
    
    @staticmethod
    def send_welcome_email(user):
        """Send welcome email to new users"""
        if not user.email:
            return
            
        subject = 'Welcome to ASTROWORLD! 🌌'
        
        message = f"""
Hi {user.first_name or user.username},

Welcome to ASTROWORLD! We're excited to have you join our community of space enthusiasts.

Here's what you can do:
- Explore daily Astronomy Pictures (APOD)
- Track Near Earth Objects and get alerts
- Browse Mars rover photos
- Discover exoplanets
- Monitor space weather events

Get started: {settings.FRONTEND_URL}/nasa

Clear skies!
The ASTROWORLD Team
        """
        
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            logger.info(f'Welcome email sent to {user.email}')
        except Exception as e:
            logger.error(f'Failed to send welcome email to {user.email}: {e}')