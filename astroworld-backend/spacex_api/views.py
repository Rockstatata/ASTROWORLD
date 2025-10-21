from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.db.models import Q
from datetime import timedelta
import logging

from .models import (
    SpaceXRocket, SpaceXLaunchpad, SpaceXLaunch, SpaceXHistoricalEvent,
    SpaceXMission, SpaceXStarlink, SpaceXCore, SpaceXCapsule,
    UserSavedSpaceXItem, UserTrackedSpaceXLaunch
)
from .serializers import (
    SpaceXRocketSerializer, SpaceXLaunchpadSerializer, SpaceXLaunchSerializer,
    SpaceXHistoricalEventSerializer, SpaceXMissionSerializer, SpaceXStarlinkSerializer,
    SpaceXCoreSerializer, SpaceXCapsuleSerializer, UserSavedSpaceXItemSerializer,
    UserTrackedSpaceXLaunchSerializer
)
from .services import SpaceXDataSyncService

logger = logging.getLogger(__name__)

class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

# Rocket Views
class SpaceXRocketListView(generics.ListAPIView):
    """List all SpaceX rockets"""
    queryset = SpaceXRocket.objects.all()
    serializer_class = SpaceXRocketSerializer
    pagination_class = StandardPagination

class SpaceXRocketDetailView(generics.RetrieveAPIView):
    """Get SpaceX rocket details"""
    queryset = SpaceXRocket.objects.all()
    serializer_class = SpaceXRocketSerializer
    lookup_field = 'spacex_id'

# Launchpad Views
class SpaceXLaunchpadListView(generics.ListAPIView):
    """List all SpaceX launchpads"""
    queryset = SpaceXLaunchpad.objects.all()
    serializer_class = SpaceXLaunchpadSerializer
    pagination_class = StandardPagination

class SpaceXLaunchpadDetailView(generics.RetrieveAPIView):
    """Get SpaceX launchpad details"""
    queryset = SpaceXLaunchpad.objects.all()
    serializer_class = SpaceXLaunchpadSerializer
    lookup_field = 'spacex_id'

# Launch Views
class SpaceXLaunchListView(generics.ListAPIView):
    """List SpaceX launches with filtering"""
    serializer_class = SpaceXLaunchSerializer
    pagination_class = StandardPagination
    
    def get_queryset(self):
        queryset = SpaceXLaunch.objects.all()
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter == 'upcoming':
            queryset = queryset.filter(upcoming=True)
        elif status_filter == 'success':
            queryset = queryset.filter(launch_success=True)
        elif status_filter == 'failure':
            queryset = queryset.filter(launch_success=False)
        
        # Filter by rocket
        rocket = self.request.query_params.get('rocket')
        if rocket:
            queryset = queryset.filter(rocket__spacex_id=rocket)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(launch_date_utc__gte=start_date)
        if end_date:
            queryset = queryset.filter(launch_date_utc__lte=end_date)
        
        # Search by mission name
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(mission_name__icontains=search) |
                Q(details__icontains=search)
            )
        
        return queryset

class SpaceXLaunchDetailView(generics.RetrieveAPIView):
    """Get SpaceX launch details"""
    queryset = SpaceXLaunch.objects.all()
    serializer_class = SpaceXLaunchSerializer
    lookup_field = 'spacex_id'

@api_view(['GET'])
def get_upcoming_launches(request):
    """Get upcoming SpaceX launches"""
    limit = int(request.query_params.get('limit', 10))
    launches = SpaceXLaunch.objects.filter(upcoming=True)[:limit]
    serializer = SpaceXLaunchSerializer(launches, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_latest_launch(request):
    """Get latest SpaceX launch"""
    try:
        launch = SpaceXLaunch.objects.filter(upcoming=False).order_by('-launch_date_utc').first()
        if launch:
            serializer = SpaceXLaunchSerializer(launch)
            return Response(serializer.data)
        return Response({'message': 'No launches found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def get_next_launch(request):
    """Get next SpaceX launch"""
    try:
        now = timezone.now()
        launch = SpaceXLaunch.objects.filter(
            launch_date_utc__gt=now
        ).order_by('launch_date_utc').first()
        if launch:
            serializer = SpaceXLaunchSerializer(launch)
            return Response(serializer.data)
        return Response({'message': 'No upcoming launches found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# Historical Events Views
class SpaceXHistoricalEventListView(generics.ListAPIView):
    """List SpaceX historical events"""
    queryset = SpaceXHistoricalEvent.objects.all()
    serializer_class = SpaceXHistoricalEventSerializer
    pagination_class = StandardPagination
    
    def get_queryset(self):
        queryset = SpaceXHistoricalEvent.objects.all()
        
        # Search by title or details
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(details__icontains=search)
            )
        
        # Filter by year
        year = self.request.query_params.get('year')
        if year:
            queryset = queryset.filter(event_date_utc__year=year)
        
        return queryset

class SpaceXHistoricalEventDetailView(generics.RetrieveAPIView):
    """Get SpaceX historical event details"""
    queryset = SpaceXHistoricalEvent.objects.all()
    serializer_class = SpaceXHistoricalEventSerializer
    lookup_field = 'spacex_id'

# Mission Views
class SpaceXMissionListView(generics.ListAPIView):
    """List SpaceX missions"""
    queryset = SpaceXMission.objects.all()
    serializer_class = SpaceXMissionSerializer
    pagination_class = StandardPagination

class SpaceXMissionDetailView(generics.RetrieveAPIView):
    """Get SpaceX mission details"""
    queryset = SpaceXMission.objects.all()
    serializer_class = SpaceXMissionSerializer
    lookup_field = 'spacex_id'

# Starlink Views
class SpaceXStarlinkListView(generics.ListAPIView):
    """List Starlink satellites"""
    queryset = SpaceXStarlink.objects.all()
    serializer_class = SpaceXStarlinkSerializer
    pagination_class = StandardPagination

@api_view(['GET'])
def get_starlink_stats(request):
    """Get Starlink statistics"""
    total_count = SpaceXStarlink.objects.count()
    active_count = SpaceXStarlink.objects.exclude(latitude__isnull=True).count()
    
    return Response({
        'total_satellites': total_count,
        'active_satellites': active_count,
        'inactive_satellites': total_count - active_count
    })

# Core and Capsule Views
class SpaceXCoreListView(generics.ListAPIView):
    """List SpaceX cores"""
    queryset = SpaceXCore.objects.all()
    serializer_class = SpaceXCoreSerializer
    pagination_class = StandardPagination

class SpaceXCapsuleListView(generics.ListAPIView):
    """List SpaceX capsules"""
    queryset = SpaceXCapsule.objects.all()
    serializer_class = SpaceXCapsuleSerializer
    pagination_class = StandardPagination

# User Interaction Views
class UserSavedSpaceXItemListView(generics.ListCreateAPIView):
    """List and create user saved SpaceX items"""
    serializer_class = UserSavedSpaceXItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardPagination
    
    def get_queryset(self):
        return UserSavedSpaceXItem.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserSavedSpaceXItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete user saved SpaceX item"""
    serializer_class = UserSavedSpaceXItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserSavedSpaceXItem.objects.filter(user=self.request.user)

class UserTrackedSpaceXLaunchListView(generics.ListCreateAPIView):
    """List and create user tracked SpaceX launches"""
    serializer_class = UserTrackedSpaceXLaunchSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserTrackedSpaceXLaunch.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_spacex_favorite(request):
    """Toggle SpaceX item favorite status"""
    item_type = request.data.get('item_type')
    item_id = request.data.get('item_id')
    
    if not item_type or not item_id:
        return Response(
            {'error': 'item_type and item_id are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    existing = UserSavedSpaceXItem.objects.filter(
        user=request.user,
        item_type=item_type,
        item_id=item_id
    ).first()
    
    if existing:
        existing.delete()
        return Response({'favorited': False})
    else:
        UserSavedSpaceXItem.objects.create(
            user=request.user,
            item_type=item_type,
            item_id=item_id,
            notes=request.data.get('notes', ''),
            tags=request.data.get('tags', [])
        )
        return Response({'favorited': True})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_launch_tracking(request):
    """Toggle SpaceX launch tracking"""
    launch_id = request.data.get('launch_id')
    
    if not launch_id:
        return Response(
            {'error': 'launch_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        launch = SpaceXLaunch.objects.get(spacex_id=launch_id)
    except SpaceXLaunch.DoesNotExist:
        return Response(
            {'error': 'Launch not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    existing = UserTrackedSpaceXLaunch.objects.filter(
        user=request.user,
        launch=launch
    ).first()
    
    if existing:
        existing.delete()
        return Response({'tracking': False})
    else:
        UserTrackedSpaceXLaunch.objects.create(
            user=request.user,
            launch=launch,
            notify_before_hours=request.data.get('notify_before_hours', 24)
        )
        return Response({'tracking': True})

# Data Sync Views
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def sync_spacex_data(request):
    """Manually sync SpaceX data (admin only)"""
    if not request.user.is_staff:
        return Response(
            {'error': 'Permission denied'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    sync_service = SpaceXDataSyncService()
    data_type = request.data.get('type', 'all')
    
    try:
        if data_type == 'launches':
            results = {'launches': sync_service.sync_launches()}
        elif data_type == 'upcoming':
            results = {'launches': sync_service.sync_launches(upcoming_only=True)}
        elif data_type == 'rockets':
            results = {'rockets': sync_service.sync_rockets()}
        elif data_type == 'launchpads':
            results = {'launchpads': sync_service.sync_launchpads()}
        elif data_type == 'historical_events':
            results = {'historical_events': sync_service.sync_historical_events()}
        elif data_type == 'missions':
            results = {'missions': sync_service.sync_missions()}
        elif data_type == 'starlink':
            limit = request.data.get('starlink_limit', 500)
            results = {'starlink': sync_service.sync_starlink(limit=limit)}
        elif data_type == 'cores':
            results = {'cores': sync_service.sync_cores()}
        elif data_type == 'capsules':
            results = {'capsules': sync_service.sync_capsules()}
        else:
            # Sync all data
            starlink_limit = request.data.get('starlink_limit', 500)
            results = sync_service.sync_all(starlink_limit=starlink_limit)
        
        return Response({
            'message': 'SpaceX data sync completed',
            'results': results
        })
        
    except Exception as e:
        logger.error(f"SpaceX data sync failed: {e}")
        return Response(
            {'error': f'Sync failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def get_spacex_stats(request):
    """Get SpaceX statistics"""
    stats = {
        'total_launches': SpaceXLaunch.objects.count(),
        'successful_launches': SpaceXLaunch.objects.filter(launch_success=True).count(),
        'upcoming_launches': SpaceXLaunch.objects.filter(upcoming=True).count(),
        'total_rockets': SpaceXRocket.objects.count(),
        'active_rockets': SpaceXRocket.objects.filter(active=True).count(),
        'total_missions': SpaceXMission.objects.count(),
        'historical_events': SpaceXHistoricalEvent.objects.count(),
        'starlink_satellites': SpaceXStarlink.objects.count(),
        'cores': SpaceXCore.objects.count(),
        'capsules': SpaceXCapsule.objects.count(),
    }
    
    return Response(stats)

@api_view(['GET'])
def search_spacex(request):
    """Search across all SpaceX data"""
    query = request.query_params.get('q', '')
    if not query:
        return Response({'error': 'Search query is required'}, status=400)
    
    results = {
        'launches': SpaceXLaunchSerializer(
            SpaceXLaunch.objects.filter(
                Q(mission_name__icontains=query) |
                Q(details__icontains=query)
            )[:5], many=True
        ).data,
        'rockets': SpaceXRocketSerializer(
            SpaceXRocket.objects.filter(
                Q(name__icontains=query) |
                Q(description__icontains=query)
            )[:5], many=True
        ).data,
        'historical_events': SpaceXHistoricalEventSerializer(
            SpaceXHistoricalEvent.objects.filter(
                Q(title__icontains=query) |
                Q(details__icontains=query)
            )[:5], many=True
        ).data,
        'missions': SpaceXMissionSerializer(
            SpaceXMission.objects.filter(
                Q(mission_name__icontains=query) |
                Q(description__icontains=query)
            )[:5], many=True
        ).data,
    }
    
    return Response(results)
