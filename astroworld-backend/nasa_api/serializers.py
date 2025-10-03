from rest_framework import serializers
from .models import (
    APOD, NearEarthObject, NEOCloseApproach, MarsRover, MarsRoverPhoto,
    EPICImage, Exoplanet, SpaceWeatherEvent, NaturalEvent, NaturalEventGeometry,
    UserSavedItem, UserTrackedObject
)

class APODSerializer(serializers.ModelSerializer):
    is_saved = serializers.SerializerMethodField()
    
    class Meta:
        model = APOD
        fields = '__all__'
    
    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserSavedItem.objects.filter(
                user=request.user,
                item_type='apod',
                item_id=obj.nasa_id
            ).exists()
        return False

class NEOCloseApproachSerializer(serializers.ModelSerializer):
    class Meta:
        model = NEOCloseApproach
        fields = ['close_approach_date', 'relative_velocity_kmh', 'miss_distance_km', 'orbiting_body']

class NEOSerializer(serializers.ModelSerializer):
    close_approaches = NEOCloseApproachSerializer(many=True, read_only=True)
    next_approach = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    is_tracked = serializers.SerializerMethodField()
    
    class Meta:
        model = NearEarthObject
        fields = '__all__'
    
    def get_next_approach(self, obj):
        from django.utils import timezone
        next_approach = obj.close_approaches.filter(
            close_approach_date__gte=timezone.now()
        ).first()
        if next_approach:
            return NEOCloseApproachSerializer(next_approach).data
        return None
    
    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserSavedItem.objects.filter(
                user=request.user,
                item_type='neo',
                item_id=obj.nasa_id
            ).exists()
        return False
    
    def get_is_tracked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserTrackedObject.objects.filter(
                user=request.user,
                object_type='neo',
                object_id=obj.nasa_id
            ).exists()
        return False

class MarsRoverSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarsRover
        fields = '__all__'

class MarsRoverPhotoSerializer(serializers.ModelSerializer):
    rover = MarsRoverSerializer(read_only=True)
    is_saved = serializers.SerializerMethodField()
    
    class Meta:
        model = MarsRoverPhoto
        fields = '__all__'
    
    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserSavedItem.objects.filter(
                user=request.user,
                item_type='mars_photo',
                item_id=obj.nasa_id
            ).exists()
        return False

class EPICImageSerializer(serializers.ModelSerializer):
    is_saved = serializers.SerializerMethodField()
    
    class Meta:
        model = EPICImage
        fields = '__all__'
    
    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserSavedItem.objects.filter(
                user=request.user,
                item_type='epic',
                item_id=obj.nasa_id
            ).exists()
        return False

class ExoplanetSerializer(serializers.ModelSerializer):
    is_saved = serializers.SerializerMethodField()
    is_tracked = serializers.SerializerMethodField()
    distance_light_years = serializers.SerializerMethodField()
    
    class Meta:
        model = Exoplanet
        fields = '__all__'
    
    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserSavedItem.objects.filter(
                user=request.user,
                item_type='exoplanet',
                item_id=obj.nasa_id
            ).exists()
        return False
    
    def get_is_tracked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserTrackedObject.objects.filter(
                user=request.user,
                object_type='exoplanet',
                object_id=obj.nasa_id
            ).exists()
        return False
    
    def get_distance_light_years(self, obj):
        if obj.distance_from_earth:
            return round(obj.distance_from_earth * 3.26156, 2)  # Convert parsecs to light years
        return None

class SpaceWeatherEventSerializer(serializers.ModelSerializer):
    is_saved = serializers.SerializerMethodField()
    is_tracked = serializers.SerializerMethodField()
    
    class Meta:
        model = SpaceWeatherEvent
        fields = '__all__'
    
    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserSavedItem.objects.filter(
                user=request.user,
                item_type='space_weather',
                item_id=obj.nasa_id
            ).exists()
        return False
    
    def get_is_tracked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserTrackedObject.objects.filter(
                user=request.user,
                object_type='space_weather',
                object_id=obj.nasa_id
            ).exists()
        return False

class NaturalEventGeometrySerializer(serializers.ModelSerializer):
    class Meta:
        model = NaturalEventGeometry
        fields = ['date', 'coordinates', 'magnitude_value', 'magnitude_unit']

class NaturalEventSerializer(serializers.ModelSerializer):
    geometries = NaturalEventGeometrySerializer(many=True, read_only=True)
    latest_geometry = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    is_tracked = serializers.SerializerMethodField()
    
    class Meta:
        model = NaturalEvent
        fields = '__all__'
    
    def get_latest_geometry(self, obj):
        latest = obj.geometries.order_by('-date').first()
        if latest:
            return NaturalEventGeometrySerializer(latest).data
        return None
    
    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserSavedItem.objects.filter(
                user=request.user,
                item_type='natural_event',
                item_id=obj.nasa_id
            ).exists()
        return False
    
    def get_is_tracked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserTrackedObject.objects.filter(
                user=request.user,
                object_type='natural_event',
                object_id=obj.nasa_id
            ).exists()
        return False

class UserSavedItemSerializer(serializers.ModelSerializer):
    item_data = serializers.SerializerMethodField()
    
    class Meta:
        model = UserSavedItem
        fields = ['id', 'item_type', 'item_id', 'saved_at', 'notes', 'tags', 'item_data']
        read_only_fields = ['saved_at']
    
    def get_item_data(self, obj):
        """Get the actual saved item data"""
        if obj.item_type == 'apod':
            try:
                item = APOD.objects.get(nasa_id=obj.item_id)
                return APODSerializer(item, context=self.context).data
            except APOD.DoesNotExist:
                return None
        elif obj.item_type == 'neo':
            try:
                item = NearEarthObject.objects.get(nasa_id=obj.item_id)
                return NEOSerializer(item, context=self.context).data
            except NearEarthObject.DoesNotExist:
                return None
        elif obj.item_type == 'mars_photo':
            try:
                item = MarsRoverPhoto.objects.get(nasa_id=obj.item_id)
                return MarsRoverPhotoSerializer(item, context=self.context).data
            except MarsRoverPhoto.DoesNotExist:
                return None
        # Add more item types as needed
        return None

class UserTrackedObjectSerializer(serializers.ModelSerializer):
    object_data = serializers.SerializerMethodField()
    
    class Meta:
        model = UserTrackedObject
        fields = ['id', 'object_type', 'object_id', 'notification_enabled', 'created_at', 'object_data']
        read_only_fields = ['created_at']
    
    def get_object_data(self, obj):
        """Get the actual tracked object data"""
        if obj.object_type == 'neo':
            try:
                item = NearEarthObject.objects.get(nasa_id=obj.object_id)
                return {
                    'name': item.name,
                    'is_potentially_hazardous': item.is_potentially_hazardous,
                    'next_approach': NEOSerializer(item, context=self.context).data.get('next_approach')
                }
            except NearEarthObject.DoesNotExist:
                return None
        elif obj.object_type == 'exoplanet':
            try:
                item = Exoplanet.objects.get(nasa_id=obj.object_id)
                return {
                    'name': item.name,
                    'host_star': item.host_star,
                    'discovery_year': item.discovery_year
                }
            except Exoplanet.DoesNotExist:
                return None
        # Add more object types as needed
        return None