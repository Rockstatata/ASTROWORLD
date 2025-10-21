from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class SkyMarker(models.Model):
    """
    User-defined markers for celestial objects on the skymap.
    Stores user annotations, notes, and coordinates for specific celestial objects.
    """
    OBJECT_TYPES = [
        ('star', 'Star'),
        ('planet', 'Planet'),
        ('moon', 'Moon'),
        ('constellation', 'Constellation'),
        ('galaxy', 'Galaxy'),
        ('nebula', 'Nebula'),
        ('cluster', 'Star Cluster'),
        ('asteroid', 'Asteroid'),
        ('comet', 'Comet'),
        ('satellite', 'Satellite'),
        ('iss', 'International Space Station'),
        ('deep_sky', 'Deep Sky Object'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sky_markers')
    
    # Celestial object identification
    name = models.CharField(max_length=200, help_text="Name of the celestial object")
    object_type = models.CharField(max_length=50, choices=OBJECT_TYPES, default='other')
    object_id = models.CharField(max_length=200, blank=True, null=True, help_text="Stellarium object ID or designation")
    
    # Additional object identification metadata
    designation = models.CharField(max_length=200, blank=True, null=True, help_text="Official designation (e.g., HD 12345, NGC 1234)")
    catalog_number = models.CharField(max_length=200, blank=True, null=True, help_text="Catalog number (e.g., HIP 12345, M 31)")
    stellarium_type = models.CharField(max_length=100, blank=True, null=True, help_text="Raw Stellarium object type")
    object_metadata = models.JSONField(default=dict, blank=True, help_text="Additional Stellarium object properties")
    
    # Coordinates (J2000.0 epoch)
    ra = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(360)],
        help_text="Right Ascension in degrees (0-360)"
    )
    dec = models.FloatField(
        validators=[MinValueValidator(-90), MaxValueValidator(90)],
        help_text="Declination in degrees (-90 to +90)"
    )
    
    # Alternative coordinate systems for reference
    alt = models.FloatField(
        null=True, blank=True,
        validators=[MinValueValidator(-90), MaxValueValidator(90)],
        help_text="Altitude in degrees (horizon coordinates)"
    )
    az = models.FloatField(
        null=True, blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(360)],
        help_text="Azimuth in degrees (horizon coordinates)"
    )
    
    # User annotations
    notes = models.TextField(blank=True, null=True, help_text="User's personal notes about this object")
    custom_name = models.CharField(max_length=200, blank=True, null=True, help_text="User's custom name for this object")
    
    # Tracking and observation
    is_tracking = models.BooleanField(default=False, help_text="Whether user is actively tracking this object")
    tracking_start_date = models.DateTimeField(null=True, blank=True)
    next_observation_date = models.DateTimeField(null=True, blank=True)
    
    # Visibility and magnitude info
    magnitude = models.FloatField(null=True, blank=True, help_text="Visual magnitude of the object")
    visibility_rating = models.IntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="User's visibility rating (1-5 stars)"
    )
    
    # AI-generated content
    ai_description = models.TextField(blank=True, null=True, help_text="AI-generated description from Murph")
    ai_generated_at = models.DateTimeField(null=True, blank=True)
    
    # Tags and categorization
    tags = models.JSONField(default=list, blank=True, help_text="User-defined tags")
    color = models.CharField(max_length=7, default='#ffffff', help_text="Hex color for marker display")
    
    # Social features
    is_public = models.BooleanField(default=False, help_text="Whether other users can see this marker")
    is_featured = models.BooleanField(default=False, help_text="Featured by admins for discovery")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'sky_markers'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_tracking']),
            models.Index(fields=['user', 'is_public']),
            models.Index(fields=['object_type']),
            models.Index(fields=['ra', 'dec']),
            models.Index(fields=['is_public', 'is_featured']),
            models.Index(fields=['created_at']),
        ]
        unique_together = ['user', 'object_id']  # One marker per object per user
    
    def __str__(self):
        return f"{self.user.username} - {self.custom_name or self.name}"
    
    def save(self, *args, **kwargs):
        # Auto-set tracking start date when tracking is enabled
        if self.is_tracking and not self.tracking_start_date:
            self.tracking_start_date = timezone.now()
        elif not self.is_tracking:
            self.tracking_start_date = None
        
        super().save(*args, **kwargs)
    
    @property
    def display_name(self):
        """Return custom name if set, otherwise object name"""
        return self.custom_name or self.name
    
    @property
    def coordinate_string(self):
        """Return formatted coordinate string for display"""
        ra_hours = self.ra / 15.0  # Convert degrees to hours
        ra_h = int(ra_hours)
        ra_m = int((ra_hours - ra_h) * 60)
        ra_s = ((ra_hours - ra_h) * 60 - ra_m) * 60
        
        dec_d = int(abs(self.dec))
        dec_m = int((abs(self.dec) - dec_d) * 60)
        dec_s = ((abs(self.dec) - dec_d) * 60 - dec_m) * 60
        dec_sign = '+' if self.dec >= 0 else '-'
        
        return f"RA {ra_h:02d}h {ra_m:02d}m {ra_s:04.1f}s, Dec {dec_sign}{dec_d:02d}° {dec_m:02d}' {dec_s:04.1f}\""


class SkyView(models.Model):
    """
    User-saved skymap views and presets.
    Allows users to save and restore specific sky positions and zoom levels.
    """
    PRESET_TYPES = [
        ('custom', 'Custom View'),
        ('constellation', 'Constellation View'),
        ('planet', 'Planet View'),
        ('deep_sky', 'Deep Sky View'),
        ('solar_system', 'Solar System View'),
        ('milky_way', 'Milky Way View'),
        ('meteor_shower', 'Meteor Shower View'),
        ('eclipse', 'Eclipse View'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sky_views')
    
    # View identification
    title = models.CharField(max_length=200, help_text="Name for this saved view")
    description = models.TextField(blank=True, null=True, help_text="Description of what's visible in this view")
    preset_type = models.CharField(max_length=50, choices=PRESET_TYPES, default='custom')
    
    # Camera/view parameters
    ra_center = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(360)],
        help_text="Center Right Ascension in degrees"
    )
    dec_center = models.FloatField(
        validators=[MinValueValidator(-90), MaxValueValidator(90)],
        help_text="Center Declination in degrees"
    )
    zoom_level = models.FloatField(
        default=1.0,
        validators=[MinValueValidator(0.1), MaxValueValidator(100.0)],
        help_text="Zoom level (field of view)"
    )
    
    # Optional: Store specific Stellarium settings
    stellarium_settings = models.JSONField(
        default=dict, blank=True,
        help_text="Specific Stellarium view settings (atmosphere, grids, etc.)"
    )
    
    # Timing and location
    observation_time = models.DateTimeField(
        null=True, blank=True,
        help_text="Specific time for this view (optional)"
    )
    location = models.JSONField(
        null=True, blank=True,
        help_text="Geographic location for this view {lat, lon, city, timezone}"
    )
    
    # Associated markers
    featured_markers = models.ManyToManyField(
        SkyMarker,
        blank=True,
        related_name='featured_in_views',
        help_text="Markers that are highlighted in this view"
    )
    
    # Social features
    is_public = models.BooleanField(default=False, help_text="Whether other users can load this view")
    is_featured = models.BooleanField(default=False, help_text="Featured view for discovery")
    
    # Usage stats
    load_count = models.IntegerField(default=0, help_text="How many times this view has been loaded")
    
    # Metadata
    tags = models.JSONField(default=list, blank=True, help_text="Tags for categorization")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'sky_views'
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['user', 'preset_type']),
            models.Index(fields=['user', 'is_public']),
            models.Index(fields=['is_public', 'is_featured']),
            models.Index(fields=['preset_type']),
            models.Index(fields=['load_count']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"
    
    def increment_load_count(self):
        """Increment the load count when view is used"""
        self.load_count += 1
        self.save(update_fields=['load_count'])
    
    @property
    def center_coordinate_string(self):
        """Return formatted center coordinates"""
        ra_hours = self.ra_center / 15.0
        ra_h = int(ra_hours)
        ra_m = int((ra_hours - ra_h) * 60)
        ra_s = ((ra_hours - ra_h) * 60 - ra_m) * 60
        
        dec_d = int(abs(self.dec_center))
        dec_m = int((abs(self.dec_center) - dec_d) * 60)
        dec_s = ((abs(self.dec_center) - dec_d) * 60 - dec_m) * 60
        dec_sign = '+' if self.dec_center >= 0 else '-'
        
        return f"RA {ra_h:02d}h {ra_m:02d}m {ra_s:04.1f}s, Dec {dec_sign}{dec_d:02d}° {dec_m:02d}' {dec_s:04.1f}\""


class MarkerObservation(models.Model):
    """
    Individual observation records for tracked celestial objects.
    Allows users to log multiple observations of the same marker over time.
    """
    OBSERVATION_TYPES = [
        ('visual', 'Visual Observation'),
        ('photo', 'Photographic'),
        ('sketch', 'Sketch/Drawing'),
        ('note', 'Notes Only'),
    ]
    
    SEEING_CONDITIONS = [
        (1, 'Poor (1/5)'),
        (2, 'Fair (2/5)'),
        (3, 'Good (3/5)'),
        (4, 'Very Good (4/5)'),
        (5, 'Excellent (5/5)'),
    ]
    
    marker = models.ForeignKey(SkyMarker, on_delete=models.CASCADE, related_name='observations')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sky_observations')
    
    # Observation details
    observation_type = models.CharField(max_length=20, choices=OBSERVATION_TYPES, default='visual')
    observation_date = models.DateTimeField(default=timezone.now)
    duration_minutes = models.IntegerField(null=True, blank=True, help_text="Observation duration in minutes")
    
    # Conditions
    seeing_conditions = models.IntegerField(choices=SEEING_CONDITIONS, null=True, blank=True)
    weather_notes = models.TextField(blank=True, null=True, help_text="Weather and atmospheric conditions")
    
    # Equipment used
    equipment = models.JSONField(
        default=dict, blank=True,
        help_text="Telescope, binoculars, camera, etc. {type, model, magnification, aperture}"
    )
    
    # Observation content
    notes = models.TextField(help_text="Detailed observation notes")
    sketch_image = models.TextField(blank=True, null=True, help_text="URL to sketch or drawing")
    photo_image = models.TextField(blank=True, null=True, help_text="URL to photograph")
    
    # Location
    location = models.JSONField(
        null=True, blank=True,
        help_text="Observation location {lat, lon, elevation, city, light_pollution}"
    )
    
    # Social features
    is_public = models.BooleanField(default=False, help_text="Share this observation publicly")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'marker_observations'
        ordering = ['-observation_date']
        indexes = [
            models.Index(fields=['marker', 'observation_date']),
            models.Index(fields=['user', 'observation_date']),
            models.Index(fields=['observation_date']),
            models.Index(fields=['is_public']),
        ]
    
    def __str__(self):
        return f"{self.user.username} observed {self.marker.display_name} on {self.observation_date.strftime('%Y-%m-%d')}"


class MarkerShare(models.Model):
    """
    Sharing and discovery of markers between users.
    Tracks when users share markers and who discovers them.
    """
    marker = models.ForeignKey(SkyMarker, on_delete=models.CASCADE, related_name='shares')
    shared_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shared_markers')
    discovered_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='discovered_markers')
    
    # Discovery context
    discovery_source = models.CharField(
        max_length=50,
        choices=[
            ('explore', 'Explore Page'),
            ('search', 'Search Results'),
            ('profile', 'User Profile'),
            ('recommendation', 'AI Recommendation'),
            ('social', 'Social Feed'),
        ],
        default='explore'
    )
    
    # Interaction tracking
    viewed_at = models.DateTimeField(auto_now_add=True)
    copied_to_own = models.BooleanField(default=False, help_text="User copied this marker to their own collection")
    copied_at = models.DateTimeField(null=True, blank=True)
    
    # Feedback
    rating = models.IntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="User's rating of this shared marker"
    )
    
    class Meta:
        db_table = 'marker_shares'
        unique_together = ['marker', 'discovered_by']
        ordering = ['-viewed_at']
        indexes = [
            models.Index(fields=['shared_by', 'viewed_at']),
            models.Index(fields=['discovered_by', 'viewed_at']),
            models.Index(fields=['marker', 'discovery_source']),
        ]
    
    def __str__(self):
        return f"{self.discovered_by.username} discovered {self.shared_by.username}'s {self.marker.display_name}"
    
    def mark_as_copied(self):
        """Mark that the user copied this marker to their own collection"""
        if not self.copied_to_own:
            self.copied_to_own = True
            self.copied_at = timezone.now()
            self.save(update_fields=['copied_to_own', 'copied_at'])
