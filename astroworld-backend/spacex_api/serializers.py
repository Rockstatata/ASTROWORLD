from rest_framework import serializers
from .models import (
    SpaceXRocket, SpaceXLaunchpad, SpaceXLaunch, SpaceXHistoricalEvent,
    SpaceXMission, SpaceXStarlink, SpaceXCore, SpaceXCapsule,
    UserSavedSpaceXItem, UserTrackedSpaceXLaunch
)

class SpaceXRocketSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpaceXRocket
        fields = '__all__'

class SpaceXLaunchpadSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpaceXLaunchpad
        fields = '__all__'

class SpaceXLaunchSerializer(serializers.ModelSerializer):
    rocket = SpaceXRocketSerializer(read_only=True)
    launchpad = SpaceXLaunchpadSerializer(read_only=True)
    status = serializers.ReadOnlyField()
    days_until_launch = serializers.SerializerMethodField()
    is_past = serializers.SerializerMethodField()
    
    class Meta:
        model = SpaceXLaunch
        fields = '__all__'
    
    def get_days_until_launch(self, obj):
        if obj.launch_date_utc:
            from django.utils import timezone
            now = timezone.now()
            if obj.launch_date_utc > now:
                return (obj.launch_date_utc - now).days
        return None
    
    def get_is_past(self, obj):
        if obj.launch_date_utc:
            from django.utils import timezone
            return obj.launch_date_utc < timezone.now()
        return False

class SpaceXHistoricalEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpaceXHistoricalEvent
        fields = '__all__'

class SpaceXMissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpaceXMission
        fields = '__all__'

class SpaceXStarlinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpaceXStarlink
        fields = '__all__'

class SpaceXCoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpaceXCore
        fields = '__all__'

class SpaceXCapsuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpaceXCapsule
        fields = '__all__'

class UserSavedSpaceXItemSerializer(serializers.ModelSerializer):
    item_data = serializers.SerializerMethodField()
    
    class Meta:
        model = UserSavedSpaceXItem
        fields = '__all__'
        read_only_fields = ('user',)
    
    def get_item_data(self, obj):
        """Get the actual SpaceX item data"""
        if obj.item_type == 'launch':
            try:
                launch = SpaceXLaunch.objects.get(spacex_id=obj.item_id)
                return SpaceXLaunchSerializer(launch).data
            except SpaceXLaunch.DoesNotExist:
                return None
        elif obj.item_type == 'rocket':
            try:
                rocket = SpaceXRocket.objects.get(spacex_id=obj.item_id)
                return SpaceXRocketSerializer(rocket).data
            except SpaceXRocket.DoesNotExist:
                return None
        elif obj.item_type == 'historical_event':
            try:
                event = SpaceXHistoricalEvent.objects.get(spacex_id=obj.item_id)
                return SpaceXHistoricalEventSerializer(event).data
            except SpaceXHistoricalEvent.DoesNotExist:
                return None
        elif obj.item_type == 'mission':
            try:
                mission = SpaceXMission.objects.get(spacex_id=obj.item_id)
                return SpaceXMissionSerializer(mission).data
            except SpaceXMission.DoesNotExist:
                return None
        return None

class UserTrackedSpaceXLaunchSerializer(serializers.ModelSerializer):
    launch = SpaceXLaunchSerializer(read_only=True)
    
    class Meta:
        model = UserTrackedSpaceXLaunch
        fields = '__all__'
        read_only_fields = ('user',)