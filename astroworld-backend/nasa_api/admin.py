from django.contrib import admin
from .models import (
    APOD, NearEarthObject, NEOCloseApproach, MarsRover, MarsRoverPhoto,
    EPICImage, Exoplanet, SpaceWeatherEvent, NaturalEvent, NaturalEventGeometry,
    UserSavedItem, UserTrackedObject, APIUsageLog
)


@admin.register(APOD)
class APODAdmin(admin.ModelAdmin):
    list_display = ['date', 'title', 'media_type', 'created_at']
    list_filter = ['media_type', 'date']
    search_fields = ['title', 'explanation']
    date_hierarchy = 'date'


@admin.register(NearEarthObject)
class NearEarthObjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'designation', 'is_potentially_hazardous', 'absolute_magnitude']
    list_filter = ['is_potentially_hazardous', 'is_sentry_object']
    search_fields = ['name', 'designation', 'nasa_id']


@admin.register(NEOCloseApproach)
class NEOCloseApproachAdmin(admin.ModelAdmin):
    list_display = ['neo', 'close_approach_date', 'miss_distance_km', 'orbiting_body']
    list_filter = ['orbiting_body', 'close_approach_date']
    date_hierarchy = 'close_approach_date'


@admin.register(MarsRover)
class MarsRoverAdmin(admin.ModelAdmin):
    list_display = ['name', 'status', 'landing_date', 'launch_date']
    list_filter = ['status']


@admin.register(MarsRoverPhoto)
class MarsRoverPhotoAdmin(admin.ModelAdmin):
    list_display = ['nasa_id', 'rover', 'camera_name', 'earth_date', 'sol']
    list_filter = ['rover', 'camera_name', 'earth_date']
    date_hierarchy = 'earth_date'


@admin.register(EPICImage)
class EPICImageAdmin(admin.ModelAdmin):
    list_display = ['nasa_id', 'identifier', 'date', 'caption']
    list_filter = ['date']
    search_fields = ['identifier', 'caption']
    date_hierarchy = 'date'


@admin.register(Exoplanet)
class ExoplanetAdmin(admin.ModelAdmin):
    list_display = ['name', 'host_star', 'discovery_year', 'discovery_method', 'is_habitable_zone']
    list_filter = ['discovery_method', 'discovery_year', 'is_habitable_zone']
    search_fields = ['name', 'host_star']


@admin.register(SpaceWeatherEvent)
class SpaceWeatherEventAdmin(admin.ModelAdmin):
    list_display = ['nasa_id', 'event_type', 'event_time', 'summary']
    list_filter = ['event_type', 'event_time']
    search_fields = ['nasa_id', 'summary']
    date_hierarchy = 'event_time'


@admin.register(NaturalEvent)
class NaturalEventAdmin(admin.ModelAdmin):
    list_display = ['title', 'category_title', 'closed', 'created_at']
    list_filter = ['category_title', 'closed', 'created_at']
    search_fields = ['title', 'description']
    date_hierarchy = 'created_at'


@admin.register(NaturalEventGeometry)
class NaturalEventGeometryAdmin(admin.ModelAdmin):
    list_display = ['event', 'date', 'magnitude_value', 'magnitude_unit']
    list_filter = ['date', 'magnitude_unit']
    date_hierarchy = 'date'


@admin.register(UserSavedItem)
class UserSavedItemAdmin(admin.ModelAdmin):
    list_display = ['user', 'item_type', 'item_id', 'saved_at']
    list_filter = ['item_type', 'saved_at']
    search_fields = ['user__username', 'item_id', 'notes']


@admin.register(UserTrackedObject)
class UserTrackedObjectAdmin(admin.ModelAdmin):
    list_display = ['user', 'object_type', 'object_id', 'notification_enabled', 'created_at']
    list_filter = ['object_type', 'notification_enabled', 'created_at']
    search_fields = ['user__username', 'object_id']


@admin.register(APIUsageLog)
class APIUsageLogAdmin(admin.ModelAdmin):
    list_display = ['endpoint', 'user', 'timestamp', 'status_code', 'response_time']
    list_filter = ['endpoint', 'status_code', 'timestamp']
    search_fields = ['endpoint', 'user__username']
    date_hierarchy = 'timestamp'