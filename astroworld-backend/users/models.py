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
        ('nasa_image', 'NASA Image Library'),
        ('space_launch', 'Space Launch'),
        ('gallery_image', 'Gallery Image'),
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


# =====================================================
# EXPLORE PAGE MODELS (Social + Research Papers)
# =====================================================

class UserFollower(models.Model):
    """
    Social connections between users.
    Allows users to follow each other and see their public content.
    """
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_followers'
        unique_together = ['follower', 'following']
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['follower']),
            models.Index(fields=['following']),
        ]
    
    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"


class ResearchPaper(models.Model):
    """
    Astronomical research papers from NASA ADS, arXiv, and Crossref.
    Cached for performance and offline access.
    """
    SOURCE_CHOICES = [
        ('nasa_ads', 'NASA ADS'),
        ('arxiv', 'arXiv'),
        ('crossref', 'Crossref'),
    ]
    
    # External identifiers
    paper_id = models.CharField(max_length=200, unique=True)  # arXiv ID, ADS bibcode, DOI
    source = models.CharField(max_length=50, choices=SOURCE_CHOICES)
    
    # Paper metadata
    title = models.CharField(max_length=1000)
    authors = models.TextField()  # Comma-separated or JSON
    abstract = models.TextField()
    published_date = models.DateField()
    journal = models.CharField(max_length=500, blank=True, null=True)
    
    # Links
    pdf_url = models.URLField(blank=True, null=True)
    external_url = models.URLField(blank=True, null=True)
    doi = models.CharField(max_length=200, blank=True, null=True)
    
    # Categories and keywords
    categories = models.JSONField(default=list, blank=True)  # ['astro-ph', 'planetary-science']
    keywords = models.JSONField(default=list, blank=True)
    
    # Stats
    citation_count = models.IntegerField(default=0)
    save_count = models.IntegerField(default=0)  # How many users saved this
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)  # When we cached it
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'research_papers'
        ordering = ['-published_date']
        indexes = [
            models.Index(fields=['source', 'published_date']),
            models.Index(fields=['paper_id']),
            models.Index(fields=['published_date']),
            models.Index(fields=['save_count']),
        ]
    
    def __str__(self):
        return f"{self.title[:100]} ({self.source})"


class UserPaper(models.Model):
    """
    User's saved research papers with personal notes and annotations.
    Links users to research papers they've bookmarked.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_papers')
    paper = models.ForeignKey(ResearchPaper, on_delete=models.CASCADE, related_name='saved_by')
    
    # User annotations
    notes = models.TextField(blank=True, null=True)
    tags = models.JSONField(default=list, blank=True)  # Personal tags
    is_favorite = models.BooleanField(default=False)
    read_status = models.CharField(
        max_length=20,
        choices=[
            ('unread', 'Unread'),
            ('reading', 'Reading'),
            ('read', 'Read'),
        ],
        default='unread'
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_papers'
        unique_together = ['user', 'paper']
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_favorite']),
            models.Index(fields=['user', 'read_status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} saved {self.paper.title[:50]}"


class Like(models.Model):
    """
    Generic like model for journals, papers, and other content.
    """
    LIKEABLE_TYPES = [
        ('journal', 'Journal Entry'),
        ('paper', 'Research Paper'),
        ('comment', 'Comment'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    target_type = models.CharField(max_length=30, choices=LIKEABLE_TYPES)
    target_id = models.IntegerField()  # ID of the journal, paper, or comment
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'likes'
        unique_together = ['user', 'target_type', 'target_id']
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['target_type', 'target_id']),
            models.Index(fields=['user']),
        ]
    
    def __str__(self):
        return f"{self.user.username} liked {self.target_type} #{self.target_id}"


class Comment(models.Model):
    """
    Comments and discussions on journals, papers, and other content.
    Supports nested replies.
    """
    COMMENTABLE_TYPES = [
        ('journal', 'Journal Entry'),
        ('paper', 'Research Paper'),
        ('event', 'Event'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    target_type = models.CharField(max_length=30, choices=COMMENTABLE_TYPES)
    target_id = models.IntegerField()  # ID of the journal, paper, or event
    
    # Comment content
    text = models.TextField()
    
    # Nested replies
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies'
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'comments'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['target_type', 'target_id']),
            models.Index(fields=['user']),
            models.Index(fields=['parent']),
        ]
    
    def __str__(self):
        return f"{self.user.username} on {self.target_type} #{self.target_id}"
    
    @property
    def like_count(self):
        """Count likes for this comment"""
        return Like.objects.filter(target_type='comment', target_id=self.id).count()


# =====================================================
# USER-TO-USER MESSAGING SYSTEM
# =====================================================

class UserMessage(models.Model):
    """
    Direct messages between users.
    """
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    
    # Message content
    message = models.TextField()
    
    # Message status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_messages'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['sender', 'recipient']),
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.sender.username} to {self.recipient.username}: {self.message[:50]}"
    
    def mark_as_read(self):
        """Mark message as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])


class MessageThread(models.Model):
    """
    Conversation thread between two users.
    Helps organize messages into conversations.
    """
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='message_threads_1')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='message_threads_2')
    
    # Thread metadata
    last_message = models.ForeignKey(
        UserMessage, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='last_message_of_thread'
    )
    last_activity = models.DateTimeField(auto_now=True)
    
    # Unread counts for each user
    unread_count_user1 = models.IntegerField(default=0)
    unread_count_user2 = models.IntegerField(default=0)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'message_threads'
        unique_together = ['user1', 'user2']
        ordering = ['-last_activity']
        indexes = [
            models.Index(fields=['user1', 'last_activity']),
            models.Index(fields=['user2', 'last_activity']),
        ]
    
    def __str__(self):
        return f"Thread: {self.user1.username} & {self.user2.username}"
    
    @classmethod
    def get_or_create_thread(cls, user1, user2):
        """
        Get or create a thread between two users.
        Ensures consistent ordering (user1 ID < user2 ID).
        """
        if user1.id > user2.id:
            user1, user2 = user2, user1
        
        thread, created = cls.objects.get_or_create(
            user1=user1,
            user2=user2
        )
        return thread, created
    
    def get_other_user(self, current_user):
        """Get the other user in this thread"""
        return self.user2 if self.user1 == current_user else self.user1
    
    def get_unread_count(self, user):
        """Get unread count for a specific user"""
        return self.unread_count_user1 if self.user1 == user else self.unread_count_user2
    
    def increment_unread_count(self, user):
        """Increment unread count for a user"""
        if self.user1 == user:
            self.unread_count_user1 += 1
        else:
            self.unread_count_user2 += 1
        self.save(update_fields=['unread_count_user1', 'unread_count_user2'])
    
    def reset_unread_count(self, user):
        """Reset unread count for a user"""
        if self.user1 == user:
            self.unread_count_user1 = 0
        else:
            self.unread_count_user2 = 0
        self.save(update_fields=['unread_count_user1', 'unread_count_user2'])