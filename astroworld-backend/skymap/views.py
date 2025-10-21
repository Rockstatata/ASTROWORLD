from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Avg, Sum, Count
from django.utils import timezone
from .models import SkyMarker, SkyView, MarkerObservation, MarkerShare
from .serializers import (
    SkyMarkerSerializer, SkyMarkerListSerializer,
    SkyViewSerializer, SkyViewListSerializer,
    MarkerObservationSerializer, MarkerObservationListSerializer,
    MarkerShareSerializer, MarkerShareCreateSerializer,
    AIDescriptionRequestSerializer, AIDescriptionResponseSerializer,
    PublicMarkerSerializer, PublicSkyViewSerializer
)


class SkyMarkerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user's sky markers
    
    Endpoints:
    - GET /api/skymap/markers/ - List all user's markers
    - POST /api/skymap/markers/ - Create new marker
    - GET /api/skymap/markers/{id}/ - Get specific marker
    - PUT/PATCH /api/skymap/markers/{id}/ - Update marker
    - DELETE /api/skymap/markers/{id}/ - Delete marker
    
    Filters:
    - object_type: star, planet, galaxy, etc.
    - is_tracking: true/false
    - is_public: true/false
    - tags: comma-separated tags
    """
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'custom_name', 'notes', 'tags']
    ordering_fields = ['created_at', 'updated_at', 'name', 'magnitude']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return SkyMarkerListSerializer
        return SkyMarkerSerializer
    
    def get_queryset(self):
        queryset = SkyMarker.objects.filter(user=self.request.user)
        
        # Filter by object type
        object_type = self.request.query_params.get('object_type')
        if object_type:
            queryset = queryset.filter(object_type=object_type)
        
        # Filter by tracking status
        is_tracking = self.request.query_params.get('is_tracking')
        if is_tracking is not None:
            queryset = queryset.filter(is_tracking=is_tracking.lower() == 'true')
        
        # Filter by public status
        is_public = self.request.query_params.get('is_public')
        if is_public is not None:
            queryset = queryset.filter(is_public=is_public.lower() == 'true')
        
        # Filter by tags
        tags = self.request.query_params.get('tags')
        if tags:
            tag_list = [tag.strip() for tag in tags.split(',')]
            for tag in tag_list:
                queryset = queryset.filter(tags__contains=[tag])
        
        return queryset.select_related('user').prefetch_related('observations')
    
    @action(detail=False, methods=['get'])
    def tracking(self, request):
        """Get all markers currently being tracked"""
        queryset = self.get_queryset().filter(is_tracking=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle_tracking(self, request, pk=None):
        """Toggle tracking status for a marker"""
        marker = self.get_object()
        marker.is_tracking = not marker.is_tracking
        marker.save()
        serializer = self.get_serializer(marker)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle_public(self, request, pk=None):
        """Toggle public visibility for a marker"""
        marker = self.get_object()
        marker.is_public = not marker.is_public
        marker.save()
        serializer = self.get_serializer(marker)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_ai_description(self, request, pk=None):
        """Request AI description update for a marker"""
        marker = self.get_object()
        
        # Import here to avoid circular imports
        from murphai.groq_service import get_groq_client, chat_with_groq
        
        try:
            # Create context for AI description
            context = f"""
            Celestial Object: {marker.display_name}
            Type: {marker.get_object_type_display()}
            Coordinates: RA {marker.ra}°, Dec {marker.dec}°
            Magnitude: {marker.magnitude or 'Unknown'}
            User Notes: {marker.notes or 'None'}
            """
            
            # Request AI description
            client = get_groq_client()
            prompt = f"""Provide a detailed astronomical description of this celestial object. Include scientific facts, observational characteristics, and interesting details that would help an amateur astronomer understand and locate this object.

            {context}
            
            Please provide a comprehensive but accessible description suitable for stargazers."""
            
            response = chat_with_groq(client, prompt)
            
            # Update marker with AI description
            marker.ai_description = response
            marker.ai_generated_at = timezone.now()
            marker.save()
            
            serializer = self.get_serializer(marker)
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to generate AI description: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def nearby(self, request):
        """Find markers near given coordinates"""
        try:
            ra = float(request.query_params.get('ra', 0))
            dec = float(request.query_params.get('dec', 0))
            radius = float(request.query_params.get('radius', 5))  # degrees
            
            # Simple box search (more efficient than spherical distance)
            queryset = self.get_queryset().filter(
                ra__gte=ra - radius,
                ra__lte=ra + radius,
                dec__gte=dec - radius,
                dec__lte=dec + radius
            )
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
            
        except (ValueError, TypeError):
            return Response(
                {'error': 'Invalid coordinates or radius'},
                status=status.HTTP_400_BAD_REQUEST
            )


class SkyViewViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user's sky views
    
    Endpoints:
    - GET /api/skymap/views/ - List all user's views
    - POST /api/skymap/views/ - Create new view
    - GET /api/skymap/views/{id}/ - Get specific view
    - PUT/PATCH /api/skymap/views/{id}/ - Update view
    - DELETE /api/skymap/views/{id}/ - Delete view
    """
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'tags']
    ordering_fields = ['created_at', 'updated_at', 'load_count']
    ordering = ['-updated_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return SkyViewListSerializer
        return SkyViewSerializer
    
    def get_queryset(self):
        queryset = SkyView.objects.filter(user=self.request.user)
        
        # Filter by preset type
        preset_type = self.request.query_params.get('preset_type')
        if preset_type:
            queryset = queryset.filter(preset_type=preset_type)
        
        # Filter by public status
        is_public = self.request.query_params.get('is_public')
        if is_public is not None:
            queryset = queryset.filter(is_public=is_public.lower() == 'true')
        
        return queryset.select_related('user').prefetch_related('featured_markers')
    
    @action(detail=True, methods=['post'])
    def load_view(self, request, pk=None):
        """Load a view and increment its usage count"""
        view = self.get_object()
        view.increment_load_count()
        serializer = self.get_serializer(view)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle_public(self, request, pk=None):
        """Toggle public visibility for a view"""
        view = self.get_object()
        view.is_public = not view.is_public
        view.save()
        serializer = self.get_serializer(view)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get most popular views (by load count)"""
        queryset = self.get_queryset().filter(
            load_count__gt=0
        ).order_by('-load_count')[:10]
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class MarkerObservationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing observation records
    """
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['notes', 'weather_notes']
    ordering_fields = ['observation_date', 'created_at']
    ordering = ['-observation_date']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return MarkerObservationListSerializer
        return MarkerObservationSerializer
    
    def get_queryset(self):
        queryset = MarkerObservation.objects.filter(user=self.request.user)
        
        # Filter by marker
        marker_id = self.request.query_params.get('marker_id')
        if marker_id:
            queryset = queryset.filter(marker_id=marker_id)
        
        # Filter by observation type
        observation_type = self.request.query_params.get('observation_type')
        if observation_type:
            queryset = queryset.filter(observation_type=observation_type)
        
        return queryset.select_related('user', 'marker')


class PublicDiscoveryView(APIView):
    """
    API for discovering public markers and views
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get public markers and views for discovery"""
        # Get featured public markers
        featured_markers = SkyMarker.objects.filter(
            is_public=True, is_featured=True
        ).select_related('user')[:10]
        
        # Get recently shared public markers
        recent_markers = SkyMarker.objects.filter(
            is_public=True
        ).exclude(
            user=request.user
        ).order_by('-created_at')[:10]
        
        # Get popular public views
        popular_views = SkyView.objects.filter(
            is_public=True
        ).exclude(
            user=request.user
        ).order_by('-load_count')[:10]
        
        return Response({
            'featured_markers': PublicMarkerSerializer(featured_markers, many=True).data,
            'recent_markers': PublicMarkerSerializer(recent_markers, many=True).data,
            'popular_views': PublicSkyViewSerializer(popular_views, many=True).data,
        })


class MarkerShareView(APIView):
    """
    API for sharing and discovering markers
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Share/discover a public marker"""
        serializer = MarkerShareCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            share = serializer.save()
            response_serializer = MarkerShareSerializer(share)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request):
        """Get user's shared marker discoveries"""
        shares = MarkerShare.objects.filter(
            discovered_by=request.user
        ).select_related('marker', 'shared_by').order_by('-viewed_at')
        
        serializer = MarkerShareSerializer(shares, many=True)
        return Response(serializer.data)


class AIDescriptionView(APIView):
    """
    API for requesting AI descriptions of celestial objects
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Generate AI description for a celestial object"""
        serializer = AIDescriptionRequestSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Import here to avoid circular imports
            from murphai.groq_service import get_groq_client, chat_with_groq
            
            data = serializer.validated_data
            
            # Build context for AI
            context_parts = [f"Celestial Object: {data['object_name']}"]
            
            if data.get('object_type'):
                context_parts.append(f"Type: {data['object_type']}")
            
            if data.get('coordinates'):
                coords = data['coordinates']
                if 'ra' in coords and 'dec' in coords:
                    context_parts.append(f"Coordinates: RA {coords['ra']}°, Dec {coords['dec']}°")
            
            if data.get('additional_context'):
                context_parts.append(f"Additional Context: {data['additional_context']}")
            
            context = "\n".join(context_parts)
            
            # Generate AI description
            client = get_groq_client()
            prompt = f"""Provide a detailed astronomical description of this celestial object. Include scientific facts, observational characteristics, visibility information, and interesting details that would help an amateur astronomer understand and locate this object.

            {context}
            
            Please provide a comprehensive but accessible description suitable for stargazers."""
            
            description = chat_with_groq(client, prompt)
            
            response_data = {
                'description': description,
                'generated_at': timezone.now(),
                'confidence': 0.9  # Could be enhanced with actual confidence scoring
            }
            
            response_serializer = AIDescriptionResponseSerializer(response_data)
            return Response(response_serializer.data)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to generate AI description: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SkymapStatsView(APIView):
    """
    API for skymap statistics and analytics
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get user's skymap statistics"""
        user = request.user
        
        # Marker statistics
        total_markers = SkyMarker.objects.filter(user=user).count()
        tracking_markers = SkyMarker.objects.filter(user=user, is_tracking=True).count()
        public_markers = SkyMarker.objects.filter(user=user, is_public=True).count()
        
        # View statistics
        total_views = SkyView.objects.filter(user=user).count()
        total_view_loads = SkyView.objects.filter(user=user).aggregate(
            total_loads=Sum('load_count')
        )['total_loads'] or 0
        
        # Observation statistics
        total_observations = MarkerObservation.objects.filter(user=user).count()
        
        # Object type distribution
        object_type_stats = SkyMarker.objects.filter(user=user).values(
            'object_type'
        ).annotate(
            count=Count('object_type')
        ).order_by('-count')
        
        # Recent activity
        recent_markers = SkyMarker.objects.filter(user=user).order_by('-created_at')[:5]
        recent_observations = MarkerObservation.objects.filter(user=user).order_by('-observation_date')[:5]
        
        return Response({
            'summary': {
                'total_markers': total_markers,
                'tracking_markers': tracking_markers,
                'public_markers': public_markers,
                'total_views': total_views,
                'total_view_loads': total_view_loads,
                'total_observations': total_observations,
            },
            'object_type_distribution': object_type_stats,
            'recent_activity': {
                'markers': SkyMarkerListSerializer(recent_markers, many=True).data,
                'observations': MarkerObservationListSerializer(recent_observations, many=True).data,
            }
        })
