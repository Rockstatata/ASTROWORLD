from rest_framework import serializers
from .models import SkyMarker, SkyView, MarkerObservation, MarkerShare
from users.serializers import PublicUserSerializer


class SkyMarkerSerializer(serializers.ModelSerializer):
    """
    Serializer for SkyMarker model with full details
    """
    display_name = serializers.ReadOnlyField()
    coordinate_string = serializers.ReadOnlyField()
    user = PublicUserSerializer(read_only=True)
    observation_count = serializers.SerializerMethodField()
    
    class Meta:
        model = SkyMarker
        fields = [
            'id', 'user', 'name', 'custom_name', 'display_name', 'object_type', 'object_id',
            'designation', 'catalog_number', 'stellarium_type', 'object_metadata',
            'ra', 'dec', 'alt', 'az', 'coordinate_string', 'notes', 'is_tracking',
            'tracking_start_date', 'next_observation_date', 'magnitude', 'visibility_rating',
            'ai_description', 'ai_generated_at', 'tags', 'color', 'is_public', 'is_featured',
            'created_at', 'updated_at', 'observation_count'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at', 'ai_generated_at', 'tracking_start_date']
    
    def get_observation_count(self, obj):
        """Get the number of observations for this marker"""
        return obj.observations.count()
    
    def create(self, validated_data):
        """Set the user from the request context"""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class SkyMarkerListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for listing SkyMarkers
    """
    display_name = serializers.ReadOnlyField()
    user = PublicUserSerializer(read_only=True)
    
    class Meta:
        model = SkyMarker
        fields = [
            'id', 'user', 'display_name', 'object_type', 'ra', 'dec', 'alt', 'az',
            'is_tracking', 'is_public', 'color', 'created_at'
        ]


class SkyViewSerializer(serializers.ModelSerializer):
    """
    Serializer for SkyView model with full details
    """
    user = PublicUserSerializer(read_only=True)
    center_coordinate_string = serializers.ReadOnlyField()
    featured_markers = SkyMarkerListSerializer(many=True, read_only=True)
    featured_marker_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = SkyView
        fields = [
            'id', 'user', 'title', 'description', 'preset_type', 'ra_center', 'dec_center',
            'zoom_level', 'center_coordinate_string', 'stellarium_settings', 'observation_time',
            'location', 'featured_markers', 'featured_marker_ids', 'is_public', 'is_featured',
            'load_count', 'tags', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at', 'load_count']
    
    def create(self, validated_data):
        """Set the user and handle featured markers"""
        featured_marker_ids = validated_data.pop('featured_marker_ids', [])
        validated_data['user'] = self.context['request'].user
        
        view = super().create(validated_data)
        
        # Add featured markers (only user's own markers)
        if featured_marker_ids:
            user_markers = SkyMarker.objects.filter(
                id__in=featured_marker_ids,
                user=self.context['request'].user
            )
            view.featured_markers.set(user_markers)
        
        return view
    
    def update(self, instance, validated_data):
        """Handle featured markers updates"""
        featured_marker_ids = validated_data.pop('featured_marker_ids', None)
        
        instance = super().update(instance, validated_data)
        
        # Update featured markers if provided
        if featured_marker_ids is not None:
            user_markers = SkyMarker.objects.filter(
                id__in=featured_marker_ids,
                user=self.context['request'].user
            )
            instance.featured_markers.set(user_markers)
        
        return instance


class SkyViewListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for listing SkyViews
    """
    user = PublicUserSerializer(read_only=True)
    featured_marker_count = serializers.SerializerMethodField()
    
    class Meta:
        model = SkyView
        fields = [
            'id', 'user', 'title', 'preset_type', 'ra_center', 'dec_center',
            'is_public', 'load_count', 'featured_marker_count', 'created_at'
        ]
    
    def get_featured_marker_count(self, obj):
        """Get the number of featured markers in this view"""
        return obj.featured_markers.count()


class MarkerObservationSerializer(serializers.ModelSerializer):
    """
    Serializer for MarkerObservation model
    """
    marker = SkyMarkerListSerializer(read_only=True)
    marker_id = serializers.IntegerField(write_only=True)
    user = PublicUserSerializer(read_only=True)
    
    class Meta:
        model = MarkerObservation
        fields = [
            'id', 'marker', 'marker_id', 'user', 'observation_type', 'observation_date',
            'duration_minutes', 'seeing_conditions', 'weather_notes', 'equipment',
            'notes', 'sketch_image', 'photo_image', 'location', 'is_public',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """Set the user and validate marker ownership"""
        marker_id = validated_data.pop('marker_id')
        user = self.context['request'].user
        
        # Ensure the marker belongs to the user
        try:
            marker = SkyMarker.objects.get(id=marker_id, user=user)
        except SkyMarker.DoesNotExist:
            raise serializers.ValidationError("Marker not found or does not belong to user")
        
        validated_data['marker'] = marker
        validated_data['user'] = user
        return super().create(validated_data)


class MarkerObservationListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for listing MarkerObservations
    """
    marker = SkyMarkerListSerializer(read_only=True)
    user = PublicUserSerializer(read_only=True)
    
    class Meta:
        model = MarkerObservation
        fields = [
            'id', 'marker', 'user', 'observation_type', 'observation_date',
            'seeing_conditions', 'is_public', 'created_at'
        ]


class MarkerShareSerializer(serializers.ModelSerializer):
    """
    Serializer for MarkerShare model
    """
    marker = SkyMarkerListSerializer(read_only=True)
    shared_by = PublicUserSerializer(read_only=True)
    discovered_by = PublicUserSerializer(read_only=True)
    
    class Meta:
        model = MarkerShare
        fields = [
            'id', 'marker', 'shared_by', 'discovered_by', 'discovery_source',
            'viewed_at', 'copied_to_own', 'copied_at', 'rating'
        ]
        read_only_fields = ['viewed_at', 'copied_at']


class MarkerShareCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating MarkerShare records
    """
    marker_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = MarkerShare
        fields = ['marker_id', 'discovery_source', 'rating']
    
    def create(self, validated_data):
        """Create a marker share record"""
        marker_id = validated_data.pop('marker_id')
        user = self.context['request'].user
        
        # Get the marker and its owner
        try:
            marker = SkyMarker.objects.get(id=marker_id, is_public=True)
        except SkyMarker.DoesNotExist:
            raise serializers.ValidationError("Public marker not found")
        
        if marker.user == user:
            raise serializers.ValidationError("Cannot share your own marker")
        
        validated_data['marker'] = marker
        validated_data['shared_by'] = marker.user
        validated_data['discovered_by'] = user
        
        # Get or create the share record
        share, created = MarkerShare.objects.get_or_create(
            marker=marker,
            discovered_by=user,
            defaults=validated_data
        )
        
        if not created:
            # Update existing share record
            for key, value in validated_data.items():
                if key not in ['marker', 'shared_by', 'discovered_by']:
                    setattr(share, key, value)
            share.save()
        
        return share


# Serializers for AI-enhanced descriptions
class AIDescriptionRequestSerializer(serializers.Serializer):
    """
    Serializer for requesting AI descriptions of celestial objects
    """
    object_name = serializers.CharField(max_length=200)
    object_type = serializers.CharField(max_length=50, required=False)
    coordinates = serializers.DictField(required=False)
    additional_context = serializers.CharField(max_length=1000, required=False)


class AIDescriptionResponseSerializer(serializers.Serializer):
    """
    Serializer for AI description responses
    """
    description = serializers.CharField()
    generated_at = serializers.DateTimeField()
    confidence = serializers.FloatField(required=False)
    sources = serializers.ListField(child=serializers.CharField(), required=False)


# Serializers for public discovery
class PublicMarkerSerializer(serializers.ModelSerializer):
    """
    Serializer for public markers in discovery/explore features
    """
    display_name = serializers.ReadOnlyField()
    user = PublicUserSerializer(read_only=True)
    share_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = SkyMarker
        fields = [
            'id', 'user', 'display_name', 'object_type', 'ra', 'dec',
            'magnitude', 'ai_description', 'tags', 'color', 'is_featured',
            'created_at', 'share_count', 'average_rating'
        ]
    
    def get_share_count(self, obj):
        """Get the number of times this marker has been shared"""
        return obj.shares.count()
    
    def get_average_rating(self, obj):
        """Get the average rating of this marker"""
        shares_with_rating = obj.shares.exclude(rating__isnull=True)
        if shares_with_rating.exists():
            return shares_with_rating.aggregate(
                avg_rating=serializers.models.Avg('rating')
            )['avg_rating']
        return None


class PublicSkyViewSerializer(serializers.ModelSerializer):
    """
    Serializer for public sky views in discovery/explore features
    """
    user = PublicUserSerializer(read_only=True)
    featured_marker_count = serializers.SerializerMethodField()
    
    class Meta:
        model = SkyView
        fields = [
            'id', 'user', 'title', 'description', 'preset_type',
            'ra_center', 'dec_center', 'zoom_level', 'is_featured',
            'load_count', 'tags', 'created_at', 'featured_marker_count'
        ]
    
    def get_featured_marker_count(self, obj):
        """Get the number of featured markers in this view"""
        return obj.featured_markers.filter(is_public=True).count()