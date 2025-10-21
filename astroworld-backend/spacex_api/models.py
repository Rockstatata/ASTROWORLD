from django.db import models
from django.contrib.auth import get_user_model
import json

User = get_user_model()

class SpaceXRocket(models.Model):
    """SpaceX Rocket information"""
    spacex_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=100, blank=True)
    active = models.BooleanField(default=True)
    stages = models.IntegerField(null=True, blank=True)
    boosters = models.IntegerField(null=True, blank=True)
    cost_per_launch = models.BigIntegerField(null=True, blank=True)
    success_rate_pct = models.FloatField(null=True, blank=True)
    first_flight = models.DateField(null=True, blank=True)
    country = models.CharField(max_length=100, blank=True)
    company = models.CharField(max_length=100, default='SpaceX')
    
    # Physical specifications
    height_meters = models.FloatField(null=True, blank=True)
    height_feet = models.FloatField(null=True, blank=True)
    diameter_meters = models.FloatField(null=True, blank=True)
    diameter_feet = models.FloatField(null=True, blank=True)
    mass_kg = models.IntegerField(null=True, blank=True)
    mass_lb = models.IntegerField(null=True, blank=True)
    
    # Payload capacities (JSON field for flexibility)
    payload_weights = models.JSONField(default=dict, blank=True)
    
    # Media and links
    description = models.TextField(blank=True)
    wikipedia = models.URLField(blank=True)
    flickr_images = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-first_flight']
    
    def __str__(self):
        return self.name

class SpaceXLaunchpad(models.Model):
    """SpaceX Launch pads"""
    spacex_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    full_name = models.CharField(max_length=500, blank=True)
    locality = models.CharField(max_length=200, blank=True)
    region = models.CharField(max_length=200, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    launch_attempts = models.IntegerField(default=0)
    launch_successes = models.IntegerField(default=0)
    status = models.CharField(max_length=50, blank=True)
    details = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class SpaceXLaunch(models.Model):
    """SpaceX Launch information"""
    LAUNCH_STATUS_CHOICES = [
        ('upcoming', 'Upcoming'),
        ('success', 'Success'),
        ('failure', 'Failure'),
        ('unknown', 'Unknown'),
    ]
    
    spacex_id = models.CharField(max_length=50, unique=True)
    flight_number = models.IntegerField(null=True, blank=True)
    mission_name = models.CharField(max_length=200)
    mission_id = models.JSONField(default=list, blank=True)
    
    # Dates
    launch_date_utc = models.DateTimeField(null=True, blank=True)
    launch_date_local = models.DateTimeField(null=True, blank=True)
    is_tentative = models.BooleanField(default=False)
    tentative_max_precision = models.CharField(max_length=50, blank=True)
    tbd = models.BooleanField(default=False)
    
    # Launch details
    rocket = models.ForeignKey(SpaceXRocket, on_delete=models.SET_NULL, null=True, blank=True)
    launchpad = models.ForeignKey(SpaceXLaunchpad, on_delete=models.SET_NULL, null=True, blank=True)
    launch_success = models.BooleanField(null=True, blank=True)
    launch_failure_details = models.JSONField(default=dict, blank=True)
    
    # Mission details
    details = models.TextField(null=True, blank=True)
    static_fire_date_utc = models.DateTimeField(null=True, blank=True)
    timeline = models.JSONField(default=dict, blank=True)
    crew = models.JSONField(default=list, blank=True)
    
    # Recovery and reusability
    ships = models.JSONField(default=list, blank=True)
    cores = models.JSONField(default=list, blank=True)
    fairings = models.JSONField(null=True, blank=True)
    
    # Payloads
    payloads = models.JSONField(default=list, blank=True)
    
    # Media links
    links = models.JSONField(default=dict, blank=True)
    
    # Auto-populate
    auto_update = models.BooleanField(default=True)
    upcoming = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-launch_date_utc']
    
    def __str__(self):
        return f"{self.mission_name} ({self.flight_number})"
    
    @property
    def status(self):
        if self.upcoming:
            return 'upcoming'
        elif self.launch_success is True:
            return 'success'
        elif self.launch_success is False:
            return 'failure'
        return 'unknown'

class SpaceXHistoricalEvent(models.Model):
    """SpaceX Historical Events and Milestones"""
    spacex_id = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=300)
    event_date_utc = models.DateTimeField()
    event_date_unix = models.BigIntegerField(null=True, blank=True)
    flight_number = models.IntegerField(null=True, blank=True)
    details = models.TextField()
    
    # Links and media
    links = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-event_date_utc']
    
    def __str__(self):
        return f"{self.title} ({self.event_date_utc.year})"

class SpaceXMission(models.Model):
    """SpaceX Mission information"""
    spacex_id = models.CharField(max_length=50, unique=True)
    mission_name = models.CharField(max_length=200)
    mission_id = models.CharField(max_length=100, blank=True)
    manufacturers = models.JSONField(default=list, blank=True)
    payload_ids = models.JSONField(default=list, blank=True)
    
    # Mission details
    description = models.TextField(blank=True)
    wikipedia = models.URLField(blank=True)
    website = models.URLField(blank=True)
    twitter = models.CharField(max_length=200, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.mission_name

class SpaceXStarlink(models.Model):
    """SpaceX Starlink Satellite information"""
    spacex_id = models.CharField(max_length=50, unique=True)
    version = models.CharField(max_length=50, blank=True)
    launch = models.CharField(max_length=100, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    height_km = models.FloatField(null=True, blank=True)
    velocity_kms = models.FloatField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Starlink {self.spacex_id}"

class SpaceXCore(models.Model):
    """SpaceX Core (booster) information"""
    spacex_id = models.CharField(max_length=50, unique=True)
    serial = models.CharField(max_length=100, blank=True)
    block = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=50, blank=True)
    reuse_count = models.IntegerField(default=0)
    rtls_attempts = models.IntegerField(default=0)
    rtls_landings = models.IntegerField(default=0)
    asds_attempts = models.IntegerField(default=0)
    asds_landings = models.IntegerField(default=0)
    last_update = models.CharField(max_length=500, blank=True)
    launches = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Core {self.serial or self.spacex_id}"

class SpaceXCapsule(models.Model):
    """SpaceX Capsule information"""
    spacex_id = models.CharField(max_length=50, unique=True)
    serial = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=50, blank=True)
    type = models.CharField(max_length=100, blank=True)
    dragon = models.CharField(max_length=100, blank=True)
    reuse_count = models.IntegerField(default=0)
    water_landings = models.IntegerField(default=0)
    land_landings = models.IntegerField(default=0)
    last_update = models.CharField(max_length=500, blank=True)
    launches = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Capsule {self.serial or self.spacex_id}"

# User interaction models
class UserSavedSpaceXItem(models.Model):
    """User saved SpaceX items (launches, missions, events, etc.)"""
    ITEM_TYPE_CHOICES = [
        ('launch', 'Launch'),
        ('rocket', 'Rocket'),
        ('mission', 'Mission'),
        ('historical_event', 'Historical Event'),
        ('core', 'Core'),
        ('capsule', 'Capsule'),
        ('starlink', 'Starlink'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    item_type = models.CharField(max_length=20, choices=ITEM_TYPE_CHOICES)
    item_id = models.CharField(max_length=50)  # SpaceX ID
    notes = models.TextField(blank=True)
    tags = models.JSONField(default=list, blank=True)
    saved_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'item_type', 'item_id')
    
    def __str__(self):
        return f"{self.user.username} - {self.item_type}: {self.item_id}"

class UserTrackedSpaceXLaunch(models.Model):
    """User tracked SpaceX launches for notifications"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    launch = models.ForeignKey(SpaceXLaunch, on_delete=models.CASCADE)
    notification_enabled = models.BooleanField(default=True)
    notify_before_hours = models.IntegerField(default=24)  # Notify X hours before launch
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'launch')
    
    def __str__(self):
        return f"{self.user.username} tracking {self.launch.mission_name}"
