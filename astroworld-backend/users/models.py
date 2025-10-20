from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    # Matches schema.sql users table
    full_name = models.CharField(max_length=100, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.TextField(blank=True, null=True)  # URL as TEXT
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)

    class Meta:
        db_table = 'users'  # Match your schema table name

    def __str__(self):
        return self.username


class UserContent(models.Model):
    """
    Unified model for all user-saved NASA content.
    Handles APOD, Mars, EPIC, NEO, News, Events, etc.
    """
    CONTENT_TYPES = [
        ('apod', 'Astronomy Picture of the Day'),
        ('mars_photo', 'Mars Rover Photo'),
        ('epic', 'Earth EPIC Image'),
        ('neo', 'Near-Earth Object'),
        ('exoplanet', 'Exoplanet'),
        ('space_weather', 'Space Weather Event'),
        ('news', 'Space News Article'),
        ('celestial', 'Celestial Object (Skymap)'),
        ('event', 'Cosmic Event'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_content')
    content_type = models.CharField(max_length=50, choices=CONTENT_TYPES)
    content_id = models.CharField(max_length=255)  # NASA ID, article ID, etc.
    title = models.CharField(max_length=500)
    description = models.TextField(blank=True, null=True)
    thumbnail_url = models.TextField(blank=True, null=True)
    source_url = models.TextField(blank=True, null=True)
    
    # User annotations
    notes = models.TextField(blank=True, null=True)
    tags = models.JSONField(default=list, blank=True)  # User-defined tags
    is_favorite = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_content'
        unique_together = ['user', 'content_type', 'content_id']
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'content_type']),
            models.Index(fields=['user', 'is_favorite']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.content_type}: {self.title}"


class UserJournal(models.Model):
    """
    Personal cosmic journals and notes.
    Includes saved Murph AI conversations.
    """
    JOURNAL_TYPES = [
        ('note', 'Personal Note'),
        ('observation', 'Sky Observation'),
        ('ai_conversation', 'Murph AI Chat'),
        ('discovery', 'Personal Discovery'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='journals')
    journal_type = models.CharField(max_length=50, choices=JOURNAL_TYPES, default='note')
    title = models.CharField(max_length=500)
    content = models.TextField()
    
    # Optional links to NASA content
    related_content = models.ForeignKey(
        UserContent, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='journals'
    )
    
    # For sky observations
    coordinates = models.JSONField(null=True, blank=True)  # {ra, dec, alt, az}
    observation_date = models.DateTimeField(null=True, blank=True)
    location = models.JSONField(null=True, blank=True)  # {lat, lon, city}
    
    # For AI conversations
    ai_conversation_data = models.JSONField(null=True, blank=True)  # Full chat history
    
    # Metadata
    tags = models.JSONField(default=list, blank=True)
    mood = models.CharField(max_length=50, blank=True, null=True)  # excited, curious, etc.
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_journals'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'journal_type']),
            models.Index(fields=['user', 'is_public']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"


class UserCollection(models.Model):
    """
    User-created collections/playlists of content.
    E.g., "My Favorite Moons", "Mars Mission Photos", etc.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='collections')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    cover_image = models.TextField(blank=True, null=True)
    
    # Collection items (many-to-many)
    items = models.ManyToManyField(UserContent, related_name='collections', blank=True)
    
    # Metadata
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_collections'
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['user', 'is_public']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.name}"
    
    @property
    def item_count(self):
        return self.items.count()


class UserSubscription(models.Model):
    """
    Event subscriptions and notifications.
    For DONKI events, meteor showers, eclipses, etc.
    """
    SUBSCRIPTION_TYPES = [
        ('space_weather', 'Space Weather Alert'),
        ('neo', 'Near-Earth Object Alert'),
        ('meteor_shower', 'Meteor Shower'),
        ('eclipse', 'Eclipse'),
        ('launch', 'Rocket Launch'),
        ('iss_pass', 'ISS Pass'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    subscription_type = models.CharField(max_length=50, choices=SUBSCRIPTION_TYPES)
    event_id = models.CharField(max_length=255)  # External event ID
    event_name = models.CharField(max_length=500)
    event_date = models.DateTimeField()
    
    # Notification settings
    notify_email = models.BooleanField(default=False)
    notify_in_app = models.BooleanField(default=True)
    notify_before = models.IntegerField(default=24)  # Hours before event
    
    # Metadata
    notes = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_notified = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'user_subscriptions'
        unique_together = ['user', 'subscription_type', 'event_id']
        ordering = ['event_date']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['event_date']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.event_name}"


class UserActivity(models.Model):
    """
    Activity log for gamification and analytics.
    Tracks user engagement across the platform.
    """
    ACTIVITY_TYPES = [
        ('saved_content', 'Saved Content'),
        ('created_journal', 'Created Journal'),
        ('created_collection', 'Created Collection'),
        ('subscribed_event', 'Subscribed to Event'),
        ('chat_with_murph', 'Chatted with Murph AI'),
        ('explored_skymap', 'Explored Skymap'),
        ('achievement_earned', 'Earned Achievement'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPES)
    description = models.CharField(max_length=500)
    metadata = models.JSONField(null=True, blank=True)  # Additional context
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_activities'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'activity_type']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.activity_type}"