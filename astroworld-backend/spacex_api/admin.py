from django.contrib import admin
from .models import (
    SpaceXRocket, SpaceXLaunchpad, SpaceXLaunch, SpaceXHistoricalEvent,
    SpaceXMission, SpaceXStarlink, SpaceXCore, SpaceXCapsule,
    UserSavedSpaceXItem, UserTrackedSpaceXLaunch
)

@admin.register(SpaceXRocket)
class SpaceXRocketAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'active', 'first_flight', 'stages', 'success_rate_pct')
    list_filter = ('active', 'stages', 'first_flight')
    search_fields = ('name', 'type', 'description')
    readonly_fields = ('spacex_id', 'created_at', 'updated_at')

@admin.register(SpaceXLaunchpad)
class SpaceXLaunchpadAdmin(admin.ModelAdmin):
    list_display = ('name', 'locality', 'region', 'status', 'launch_attempts', 'launch_successes')
    list_filter = ('status', 'region')
    search_fields = ('name', 'full_name', 'locality')
    readonly_fields = ('spacex_id', 'created_at', 'updated_at')

@admin.register(SpaceXLaunch)
class SpaceXLaunchAdmin(admin.ModelAdmin):
    list_display = ('mission_name', 'flight_number', 'launch_date_utc', 'rocket', 'launch_success', 'upcoming')
    list_filter = ('launch_success', 'upcoming', 'rocket', 'launchpad', 'launch_date_utc')
    search_fields = ('mission_name', 'details', 'spacex_id')
    readonly_fields = ('spacex_id', 'created_at', 'updated_at')
    date_hierarchy = 'launch_date_utc'

@admin.register(SpaceXHistoricalEvent)
class SpaceXHistoricalEventAdmin(admin.ModelAdmin):
    list_display = ('title', 'event_date_utc', 'flight_number')
    list_filter = ('event_date_utc',)
    search_fields = ('title', 'details')
    readonly_fields = ('spacex_id', 'created_at', 'updated_at')
    date_hierarchy = 'event_date_utc'

@admin.register(SpaceXMission)
class SpaceXMissionAdmin(admin.ModelAdmin):
    list_display = ('mission_name', 'mission_id')
    search_fields = ('mission_name', 'mission_id', 'description')
    readonly_fields = ('spacex_id', 'created_at', 'updated_at')

@admin.register(SpaceXStarlink)
class SpaceXStarlinkAdmin(admin.ModelAdmin):
    list_display = ('spacex_id', 'version', 'launch', 'latitude', 'longitude', 'height_km')
    list_filter = ('version', 'launch')
    search_fields = ('spacex_id', 'version', 'launch')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(SpaceXCore)
class SpaceXCoreAdmin(admin.ModelAdmin):
    list_display = ('serial', 'block', 'status', 'reuse_count', 'rtls_landings', 'asds_landings')
    list_filter = ('status', 'block')
    search_fields = ('serial', 'spacex_id')
    readonly_fields = ('spacex_id', 'created_at', 'updated_at')

@admin.register(SpaceXCapsule)
class SpaceXCapsuleAdmin(admin.ModelAdmin):
    list_display = ('serial', 'type', 'status', 'reuse_count', 'water_landings', 'land_landings')
    list_filter = ('type', 'status')
    search_fields = ('serial', 'spacex_id', 'type')
    readonly_fields = ('spacex_id', 'created_at', 'updated_at')

@admin.register(UserSavedSpaceXItem)
class UserSavedSpaceXItemAdmin(admin.ModelAdmin):
    list_display = ('user', 'item_type', 'item_id', 'saved_at')
    list_filter = ('item_type', 'saved_at')
    search_fields = ('user__username', 'item_id', 'notes')
    readonly_fields = ('saved_at',)

@admin.register(UserTrackedSpaceXLaunch)
class UserTrackedSpaceXLaunchAdmin(admin.ModelAdmin):
    list_display = ('user', 'launch', 'notification_enabled', 'notify_before_hours', 'created_at')
    list_filter = ('notification_enabled', 'notify_before_hours', 'created_at')
    search_fields = ('user__username', 'launch__mission_name')
    readonly_fields = ('created_at',)
