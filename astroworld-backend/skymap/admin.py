from django.contrib import admin
from .models import SkyMarker, SkyView, MarkerObservation, MarkerShare


@admin.register(SkyMarker)
class SkyMarkerAdmin(admin.ModelAdmin):
    list_display = ['display_name', 'user', 'object_type', 'is_tracking', 'is_public', 'created_at']
    list_filter = ['object_type', 'is_tracking', 'is_public', 'is_featured', 'created_at']
    search_fields = ['name', 'custom_name', 'notes', 'user__username']
    readonly_fields = ['created_at', 'updated_at', 'ai_generated_at', 'tracking_start_date']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'name', 'custom_name', 'object_type', 'object_id')
        }),
        ('Coordinates', {
            'fields': ('ra', 'dec', 'alt', 'az')
        }),
        ('User Content', {
            'fields': ('notes', 'tags', 'color')
        }),
        ('Tracking', {
            'fields': ('is_tracking', 'tracking_start_date', 'next_observation_date')
        }),
        ('Visibility Info', {
            'fields': ('magnitude', 'visibility_rating')
        }),
        ('AI Content', {
            'fields': ('ai_description', 'ai_generated_at')
        }),
        ('Social Features', {
            'fields': ('is_public', 'is_featured')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at')
        })
    )


@admin.register(SkyView)
class SkyViewAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'preset_type', 'is_public', 'load_count', 'created_at']
    list_filter = ['preset_type', 'is_public', 'is_featured', 'created_at']
    search_fields = ['title', 'description', 'user__username']
    readonly_fields = ['created_at', 'updated_at', 'load_count']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'title', 'description', 'preset_type')
        }),
        ('View Parameters', {
            'fields': ('ra_center', 'dec_center', 'zoom_level')
        }),
        ('Advanced Settings', {
            'fields': ('stellarium_settings', 'observation_time', 'location')
        }),
        ('Markers', {
            'fields': ('featured_markers',)
        }),
        ('Social Features', {
            'fields': ('is_public', 'is_featured')
        }),
        ('Usage Stats', {
            'fields': ('load_count',)
        }),
        ('Metadata', {
            'fields': ('tags', 'created_at', 'updated_at')
        })
    )


@admin.register(MarkerObservation)
class MarkerObservationAdmin(admin.ModelAdmin):
    list_display = ['marker', 'user', 'observation_type', 'observation_date', 'seeing_conditions', 'is_public']
    list_filter = ['observation_type', 'seeing_conditions', 'is_public', 'observation_date']
    search_fields = ['marker__name', 'marker__custom_name', 'user__username', 'notes']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'observation_date'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('marker', 'user', 'observation_type', 'observation_date', 'duration_minutes')
        }),
        ('Conditions', {
            'fields': ('seeing_conditions', 'weather_notes')
        }),
        ('Equipment', {
            'fields': ('equipment',)
        }),
        ('Observation Content', {
            'fields': ('notes', 'sketch_image', 'photo_image')
        }),
        ('Location', {
            'fields': ('location',)
        }),
        ('Social', {
            'fields': ('is_public',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at')
        })
    )


@admin.register(MarkerShare)
class MarkerShareAdmin(admin.ModelAdmin):
    list_display = ['marker', 'shared_by', 'discovered_by', 'discovery_source', 'viewed_at', 'copied_to_own']
    list_filter = ['discovery_source', 'copied_to_own', 'viewed_at']
    search_fields = ['marker__name', 'shared_by__username', 'discovered_by__username']
    readonly_fields = ['viewed_at', 'copied_at']
    date_hierarchy = 'viewed_at'
    
    fieldsets = (
        ('Sharing Information', {
            'fields': ('marker', 'shared_by', 'discovered_by', 'discovery_source')
        }),
        ('Interaction', {
            'fields': ('viewed_at', 'copied_to_own', 'copied_at')
        }),
        ('Feedback', {
            'fields': ('rating',)
        })
    )
