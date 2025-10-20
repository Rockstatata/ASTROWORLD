from django.db import models
from django.utils import timezone
import json
from users.models import User


class BaseNASAModel(models.Model):
    """Base model for all NASA API data"""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    nasa_id = models.CharField(max_length=255, unique=True)
    
    class Meta:
        abstract = True

# APOD - Astronomy Picture of the Day
class APOD(BaseNASAModel):
    date = models.DateField(unique=True)
    title = models.CharField(max_length=255)
    explanation = models.TextField()
    url = models.URLField()
    hdurl = models.URLField(null=True, blank=True)
    media_type = models.CharField(max_length=20, default='image')
    copyright = models.CharField(max_length=255, null=True, blank=True)
    
    class Meta:
        ordering = ['-date']
        verbose_name = "Astronomy Picture of the Day"
        verbose_name_plural = "Astronomy Pictures of the Day"

# Near Earth Objects
class NearEarthObject(BaseNASAModel):
    name = models.CharField(max_length=255)
    designation = models.CharField(max_length=100)
    is_potentially_hazardous = models.BooleanField(default=False)
    estimated_diameter_min_km = models.FloatField()
    estimated_diameter_max_km = models.FloatField()
    absolute_magnitude = models.FloatField()
    is_sentry_object = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = "Near Earth Object"
        verbose_name_plural = "Near Earth Objects"

class NEOCloseApproach(models.Model):
    neo = models.ForeignKey(NearEarthObject, on_delete=models.CASCADE, related_name='close_approaches')
    close_approach_date = models.DateTimeField()
    relative_velocity_kmh = models.FloatField()
    miss_distance_km = models.FloatField()
    orbiting_body = models.CharField(max_length=50, default='Earth')

# Mars Rover Photos
class MarsRover(models.Model):
    ROVER_CHOICES = [
        ('curiosity', 'Curiosity'),
        ('opportunity', 'Opportunity'),
        ('spirit', 'Spirit'),
        ('perseverance', 'Perseverance'),
        ('ingenuity', 'Ingenuity'),
    ]
    
    name = models.CharField(max_length=50, choices=ROVER_CHOICES, unique=True)
    landing_date = models.DateField()
    launch_date = models.DateField()
    status = models.CharField(max_length=20, default='active')
    max_sol = models.IntegerField(default=0)
    max_date = models.DateField(null=True, blank=True)
    total_photos = models.IntegerField(default=0)

class MarsRoverPhoto(BaseNASAModel):
    rover = models.ForeignKey(MarsRover, on_delete=models.CASCADE, related_name='photos')
    sol = models.IntegerField()  # Martian day
    img_src = models.URLField()
    earth_date = models.DateField()
    camera_name = models.CharField(max_length=50)
    camera_full_name = models.CharField(max_length=255)

# EPIC - Earth Polychromatic Imaging Camera
class EPICImage(BaseNASAModel):
    identifier = models.CharField(max_length=100)
    caption = models.TextField()
    image_url = models.URLField()
    date = models.DateTimeField()
    centroid_coordinates = models.JSONField(default=dict)
    dscovr_j2000_position = models.JSONField(default=dict)
    lunar_j2000_position = models.JSONField(default=dict)
    sun_j2000_position = models.JSONField(default=dict)
    attitude_quaternions = models.JSONField(default=dict)

# Exoplanets
class Exoplanet(BaseNASAModel):
    name = models.CharField(max_length=255)
    host_star = models.CharField(max_length=255)
    discovery_method = models.CharField(max_length=100)
    discovery_year = models.IntegerField(null=True, blank=True)
    orbital_period = models.FloatField(null=True, blank=True)  # days
    planet_radius = models.FloatField(null=True, blank=True)  # Earth radii
    planet_mass = models.FloatField(null=True, blank=True)  # Earth masses
    distance_from_earth = models.FloatField(null=True, blank=True)  # parsecs
    equilibrium_temperature = models.FloatField(null=True, blank=True)  # Kelvin
    is_habitable_zone = models.BooleanField(default=False)

# Space Weather Events (DONKI)
class SpaceWeatherEvent(BaseNASAModel):
    EVENT_TYPE_CHOICES = [
        ('CME', 'Coronal Mass Ejection'),
        ('FLR', 'Solar Flare'),
        ('SEP', 'Solar Energetic Particle'),
        ('MPC', 'Magnetopause Crossing'),
        ('GST', 'Geomagnetic Storm'),
        ('IPS', 'Interplanetary Shock'),
        ('RBE', 'Radiation Belt Enhancement'),
        ('HSS', 'High Speed Stream'),
        ('WSA', 'WSA+EnlilSimulation'),
    ]
    
    event_type = models.CharField(max_length=3, choices=EVENT_TYPE_CHOICES)
    event_time = models.DateTimeField()
    link = models.URLField()
    summary = models.TextField(blank=True)
    instruments = models.JSONField(default=list)
    linked_events = models.JSONField(default=list)

# Natural Events (EONET)
class NaturalEvent(BaseNASAModel):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    link = models.URLField(blank=True)
    closed = models.BooleanField(default=False)
    category_id = models.CharField(max_length=50)
    category_title = models.CharField(max_length=100)
    
    class Meta:
        verbose_name = "Natural Event"
        verbose_name_plural = "Natural Events"

class NaturalEventGeometry(models.Model):
    event = models.ForeignKey(NaturalEvent, on_delete=models.CASCADE, related_name='geometries')
    date = models.DateTimeField()
    coordinates = models.JSONField()  # [longitude, latitude]
    magnitude_value = models.FloatField(null=True, blank=True)
    magnitude_unit = models.CharField(max_length=50, blank=True)

# User Interactions and Saves
class UserSavedItem(models.Model):
    ITEM_TYPE_CHOICES = [
        ('apod', 'APOD'),
        ('neo', 'Near Earth Object'),
        ('mars_photo', 'Mars Rover Photo'),
        ('epic', 'EPIC Image'),
        ('exoplanet', 'Exoplanet'),
        ('space_weather', 'Space Weather Event'),
        ('natural_event', 'Natural Event'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_nasa_items')
    item_type = models.CharField(max_length=20, choices=ITEM_TYPE_CHOICES)
    item_id = models.CharField(max_length=255)  # nasa_id of the saved item
    saved_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    tags = models.JSONField(default=list)
    
    class Meta:
        unique_together = ['user', 'item_type', 'item_id']

class UserTrackedObject(models.Model):
    """For tracking objects like NEOs, events that users want notifications for"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tracked_objects')
    object_type = models.CharField(max_length=20, choices=UserSavedItem.ITEM_TYPE_CHOICES)
    object_id = models.CharField(max_length=255)
    notification_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'object_type', 'object_id']

class APIUsageLog(models.Model):
    """Track API usage for rate limiting and analytics"""
    endpoint = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    response_time = models.FloatField()
    status_code = models.IntegerField()
    error_message = models.TextField(blank=True)

# NASA Image and Video Library
class NASAMediaItem(BaseNASAModel):
    MEDIA_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
        ('audio', 'Audio'),
    ]
    
    title = models.CharField(max_length=500)
    description = models.TextField(blank=True)
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES)
    center = models.CharField(max_length=100, blank=True)  # NASA center (e.g., JPL, GSFC)
    date_created = models.DateTimeField(null=True, blank=True)
    keywords = models.JSONField(default=list)
    photographer = models.CharField(max_length=255, blank=True)
    location = models.CharField(max_length=255, blank=True)
    
    # Asset URLs
    preview_url = models.URLField(blank=True)
    thumbnail_url = models.URLField(blank=True)
    original_url = models.URLField(blank=True)
    
    # Additional metadata
    description_508 = models.TextField(blank=True)  # Accessibility description
    secondary_creator = models.CharField(max_length=255, blank=True)
    album = models.JSONField(default=list)
    
    class Meta:
        verbose_name = "NASA Media Item"
        verbose_name_plural = "NASA Media Items"
        ordering = ['-date_created']

# Satellite TLE (Two-Line Element) Data
class Satellite(models.Model):
    SATELLITE_TYPE_CHOICES = [
        ('LEO', 'Low Earth Orbit'),
        ('MEO', 'Medium Earth Orbit'),
        ('GEO', 'Geostationary Orbit'),
        ('HEO', 'Highly Elliptical Orbit'),
        ('DEEP', 'Deep Space'),
    ]
    
    satellite_id = models.IntegerField(unique=True)  # NORAD Catalog Number
    name = models.CharField(max_length=255)
    int_designator = models.CharField(max_length=20, blank=True)  # International designator
    orbit_type = models.CharField(max_length=10, choices=SATELLITE_TYPE_CHOICES, blank=True)
    launch_date = models.DateField(null=True, blank=True)
    decay_date = models.DateField(null=True, blank=True)
    
    # Latest TLE data
    tle_line1 = models.CharField(max_length=100)
    tle_line2 = models.CharField(max_length=100)
    tle_date = models.DateTimeField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Satellite"
        verbose_name_plural = "Satellites"
        ordering = ['name']