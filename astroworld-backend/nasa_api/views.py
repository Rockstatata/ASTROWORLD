from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from django.conf import settings
from datetime import datetime, timedelta

from .models import (
    APOD, NearEarthObject, NEOCloseApproach, MarsRoverPhoto, EPICImage, Exoplanet,
    SpaceWeatherEvent, NaturalEvent, SpaceEvent, UserSavedItem, UserTrackedObject
)
from .serializers import (
    APODSerializer, NEOSerializer, MarsRoverPhotoSerializer, EPICImageSerializer,
    ExoplanetSerializer, SpaceWeatherEventSerializer, NaturalEventSerializer,
    SpaceEventSerializer, UserSavedItemSerializer, UserTrackedObjectSerializer
)
from .services import (
    apod_service, neo_service, mars_rover_service, epic_service, exoplanet_service,
    space_weather_service, natural_event_service, space_event_service
)

class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

# APOD Views
class APODListView(generics.ListAPIView):
    """List Astronomy Pictures of the Day"""
    serializer_class = APODSerializer
    pagination_class = StandardPagination
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = APOD.objects.all().order_by('-date')
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
            
        return queryset

class APODDetailView(generics.RetrieveAPIView):
    """Get specific APOD by date"""
    serializer_class = APODSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_object(self):
        date_str = self.kwargs.get('date')
        try:
            date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
            return get_object_or_404(APOD, date=date_obj)
        except ValueError:
            return get_object_or_404(APOD, pk=date_str)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def get_latest_apod(request):
    """Get the latest APOD"""
    try:
        latest_apod = APOD.objects.latest('date')
        serializer = APODSerializer(latest_apod)
        return Response(serializer.data)
    except APOD.DoesNotExist:
        # Fetch from API if not in database
        data = apod_service.fetch_apod()
        if data:
            return Response(data)
        return Response({'error': 'No APOD available'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def get_random_apod(request):
    """Get random APOD images"""
    count = int(request.query_params.get('count', 1))
    count = min(count, 10)  # Limit to 10
    
    # Try to get from database first
    random_apods = APOD.objects.order_by('?')[:count]
    
    if len(random_apods) >= count:
        serializer = APODSerializer(random_apods, many=True)
        return Response(serializer.data)
    else:
        # Fetch from API
        data = apod_service.fetch_apod(count=count)
        if data:
            return Response(data)
        return Response({'error': 'No random APODs available'}, status=status.HTTP_404_NOT_FOUND)

# NEO Views
class NEOListView(generics.ListAPIView):
    """List Near Earth Objects"""
    serializer_class = NEOSerializer
    pagination_class = StandardPagination
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = NearEarthObject.objects.all().order_by('-created_at')
        
        # Filters
        is_hazardous = self.request.query_params.get('is_hazardous')
        min_diameter = self.request.query_params.get('min_diameter')
        max_diameter = self.request.query_params.get('max_diameter')
        
        if is_hazardous is not None:
            queryset = queryset.filter(is_potentially_hazardous=is_hazardous.lower() == 'true')
        if min_diameter:
            queryset = queryset.filter(estimated_diameter_min_km__gte=float(min_diameter))
        if max_diameter:
            queryset = queryset.filter(estimated_diameter_max_km__lte=float(max_diameter))
            
        return queryset

class NEODetailView(generics.RetrieveAPIView):
    """Get specific NEO details"""
    queryset = NearEarthObject.objects.all()
    serializer_class = NEOSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'nasa_id'

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def get_upcoming_neo_approaches(request):
    """Get upcoming NEO close approaches"""
    days_ahead = int(request.query_params.get('days', 30))
    end_date = timezone.now() + timedelta(days=days_ahead)
    
    approaches = NEOCloseApproach.objects.filter(
        close_approach_date__gte=timezone.now(),
        close_approach_date__lte=end_date
    ).select_related('neo').order_by('close_approach_date')[:50]
    
    data = []
    for approach in approaches:
        data.append({
            'neo': NEOSerializer(approach.neo).data,
            'close_approach_date': approach.close_approach_date,
            'relative_velocity_kmh': approach.relative_velocity_kmh,
            'miss_distance_km': approach.miss_distance_km,
            'orbiting_body': approach.orbiting_body
        })
    
    return Response(data)

# Mars Rover Views
class MarsRoverPhotoListView(generics.ListAPIView):
    """List Mars Rover Photos"""
    serializer_class = MarsRoverPhotoSerializer
    pagination_class = StandardPagination
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = MarsRoverPhoto.objects.all().order_by('-earth_date', '-sol')
        
        # Filters
        rover = self.request.query_params.get('rover')
        sol = self.request.query_params.get('sol')
        earth_date = self.request.query_params.get('earth_date')
        camera = self.request.query_params.get('camera')
        
        if rover:
            queryset = queryset.filter(rover__name=rover)
        if sol:
            queryset = queryset.filter(sol=int(sol))
        if earth_date:
            queryset = queryset.filter(earth_date=earth_date)
        if camera:
            queryset = queryset.filter(camera_name__icontains=camera)
            
        return queryset

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def get_rovers_status(request):
    """Get status of all Mars rovers"""
    from .models import MarsRover
    rovers = MarsRover.objects.all()
    
    data = []
    for rover in rovers:
        recent_photos = rover.photos.order_by('-earth_date')[:5]
        data.append({
            'name': rover.name,
            'status': rover.status,
            'landing_date': rover.landing_date,
            'max_sol': rover.max_sol,
            'max_date': rover.max_date,
            'total_photos': rover.total_photos,
            'recent_photos': MarsRoverPhotoSerializer(recent_photos, many=True).data
        })
    
    return Response(data)

# EPIC Views
class EPICImageListView(generics.ListAPIView):
    """List EPIC Images"""
    serializer_class = EPICImageSerializer
    pagination_class = StandardPagination
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = EPICImage.objects.all().order_by('-date')
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
            
        return queryset

# Exoplanet Views
class ExoplanetListView(generics.ListAPIView):
    """List Exoplanets"""
    serializer_class = ExoplanetSerializer
    pagination_class = StandardPagination
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = Exoplanet.objects.all().order_by('-discovery_year', 'name')
        
        # Filters
        discovery_year = self.request.query_params.get('discovery_year')
        habitable = self.request.query_params.get('habitable')
        discovery_method = self.request.query_params.get('discovery_method')
        min_radius = self.request.query_params.get('min_radius')
        max_radius = self.request.query_params.get('max_radius')
        
        if discovery_year:
            queryset = queryset.filter(discovery_year=int(discovery_year))
        if habitable is not None:
            queryset = queryset.filter(is_habitable_zone=habitable.lower() == 'true')
        if discovery_method:
            queryset = queryset.filter(discovery_method__icontains=discovery_method)
        if min_radius:
            queryset = queryset.filter(planet_radius__gte=float(min_radius))
        if max_radius:
            queryset = queryset.filter(planet_radius__lte=float(max_radius))
            
        return queryset

class ExoplanetDetailView(generics.RetrieveAPIView):
    """Get specific exoplanet details"""
    queryset = Exoplanet.objects.all()
    serializer_class = ExoplanetSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'nasa_id'

# Space Weather Views
class SpaceWeatherEventListView(generics.ListAPIView):
    """List Space Weather Events"""
    serializer_class = SpaceWeatherEventSerializer
    pagination_class = StandardPagination
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = SpaceWeatherEvent.objects.all().order_by('-event_time')
        
        # Filters
        event_type = self.request.query_params.get('event_type')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        if start_date:
            queryset = queryset.filter(event_time__gte=start_date)
        if end_date:
            queryset = queryset.filter(event_time__lte=end_date)
            
        return queryset

class SpaceWeatherEventDetailView(generics.RetrieveAPIView):
    """Get specific space weather event details"""
    queryset = SpaceWeatherEvent.objects.all()
    serializer_class = SpaceWeatherEventSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'nasa_id'

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def get_recent_space_weather(request):
    """Get recent space weather events"""
    days = int(request.query_params.get('days', 30))
    end_date = timezone.now()
    start_date = end_date - timedelta(days=days)
    
    events = SpaceWeatherEvent.objects.filter(
        event_time__gte=start_date,
        event_time__lte=end_date
    ).order_by('-event_time')[:50]
    
    serializer = SpaceWeatherEventSerializer(events, many=True)
    return Response(serializer.data)

# Natural Events Views
class NaturalEventListView(generics.ListAPIView):
    """List Natural Events"""
    serializer_class = NaturalEventSerializer
    pagination_class = StandardPagination
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = NaturalEvent.objects.all().order_by('-created_at')
        
        # Filters
        category = self.request.query_params.get('category')
        status = self.request.query_params.get('status')
        
        if category:
            queryset = queryset.filter(category_id=category)
        if status == 'open':
            queryset = queryset.filter(closed=False)
        elif status == 'closed':
            queryset = queryset.filter(closed=True)
            
        return queryset

class NaturalEventDetailView(generics.RetrieveAPIView):
    """Get specific natural event details"""
    queryset = NaturalEvent.objects.all()
    serializer_class = NaturalEventSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'nasa_id'

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def get_active_natural_events(request):
    """Get active natural events"""
    events = NaturalEvent.objects.filter(closed=False).order_by('-created_at')[:20]
    serializer = NaturalEventSerializer(events, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def get_events_by_category(request, category):
    """Get events by category"""
    events = NaturalEvent.objects.filter(category_id=category).order_by('-created_at')[:50]
    serializer = NaturalEventSerializer(events, many=True)
    return Response(serializer.data)


# Space Events Views
class SpaceEventListView(generics.ListAPIView):
    """List space events with filtering options"""
    serializer_class = SpaceEventSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardPagination
    
    def get_queryset(self):
        queryset = SpaceEvent.objects.all().order_by('event_date')
        
        # Filter by event type
        event_type = self.request.query_params.get('type')
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        
        # Filter by visibility
        visibility = self.request.query_params.get('visibility')
        if visibility:
            queryset = queryset.filter(visibility=visibility)
        
        # Filter by upcoming/past events
        time_filter = self.request.query_params.get('time_filter')
        if time_filter == 'upcoming':
            queryset = queryset.filter(event_date__gte=timezone.now())
        elif time_filter == 'past':
            queryset = queryset.filter(event_date__lt=timezone.now())
        
        # Filter by featured events
        featured = self.request.query_params.get('featured')
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)
        
        # Search by title or description
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        
        return queryset


class SpaceEventDetailView(generics.RetrieveAPIView):
    """Get specific space event details"""
    queryset = SpaceEvent.objects.all()
    serializer_class = SpaceEventSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'nasa_id'


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def get_featured_space_events(request):
    """Get featured space events"""
    events = SpaceEvent.objects.filter(is_featured=True).order_by('event_date')[:10]
    serializer = SpaceEventSerializer(events, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def get_upcoming_space_events(request):
    """Get upcoming space events"""
    events = SpaceEvent.objects.filter(
        event_date__gte=timezone.now()
    ).order_by('event_date')[:20]
    serializer = SpaceEventSerializer(events, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def get_space_events_by_type(request, event_type):
    """Get space events by type"""
    events = SpaceEvent.objects.filter(event_type=event_type).order_by('event_date')[:50]
    serializer = SpaceEventSerializer(events, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def sync_space_events(request):
    """Sync space events data (Admin only)"""
    try:
        synced_count = space_event_service.sync_space_events()
        return Response({
            'message': f'Successfully synced {synced_count} space events',
            'synced_count': synced_count
        })
    except Exception as e:
        return Response({
            'error': f'Failed to sync space events: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserSavedItemListView(generics.ListCreateAPIView):
    """List and create user saved items"""
    serializer_class = UserSavedItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardPagination
    
    def get_queryset(self):
        return UserSavedItem.objects.filter(user=self.request.user).order_by('-saved_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserSavedItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete saved item"""
    serializer_class = UserSavedItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserSavedItem.objects.filter(user=self.request.user)

class UserTrackedObjectListView(generics.ListCreateAPIView):
    """List and create user tracked objects"""
    serializer_class = UserTrackedObjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardPagination
    
    def get_queryset(self):
        return UserTrackedObject.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_favorite(request):
    """Toggle favorite status for an item"""
    item_type = request.data.get('item_type')
    item_id = request.data.get('item_id')
    
    if not item_type or not item_id:
        return Response(
            {'error': 'item_type and item_id are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    favorite, created = UserSavedItem.objects.get_or_create(
        user=request.user,
        item_type=item_type,
        item_id=item_id,
        defaults={'notes': request.data.get('notes', ''), 'tags': request.data.get('tags', [])}
    )
    
    if not created:
        favorite.delete()
        return Response({'favorited': False, 'message': 'Removed from favorites'})
    
    serializer = UserSavedItemSerializer(favorite)
    return Response({'favorited': True, 'favorite': serializer.data, 'message': 'Added to favorites'})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_tracking(request):
    """Toggle tracking status for an object"""
    object_type = request.data.get('object_type')
    object_id = request.data.get('object_id')
    
    if not object_type or not object_id:
        return Response(
            {'error': 'object_type and object_id are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    tracking, created = UserTrackedObject.objects.get_or_create(
        user=request.user,
        object_type=object_type,
        object_id=object_id,
        defaults={'notification_enabled': request.data.get('notification_enabled', True)}
    )
    
    if not created:
        tracking.delete()
        return Response({'tracking': False, 'message': 'Removed from tracking'})
    
    serializer = UserTrackedObjectSerializer(tracking)
    return Response({'tracking': True, 'tracking_obj': serializer.data, 'message': 'Added to tracking'})

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def search_all_nasa_data(request):
    """Search across all NASA data"""
    query = request.query_params.get('q', '')
    types = request.query_params.get('types', '').split(',') if request.query_params.get('types') else []
    
    if len(query) < 3:
        return Response({'error': 'Query must be at least 3 characters'}, status=status.HTTP_400_BAD_REQUEST)
    
    results = {'apod': [], 'neo': [], 'exoplanets': [], 'mars_photos': [], 'space_weather': [], 'natural_events': [], 'space_events': []}
    
    if not types or 'apod' in types:
        apods = APOD.objects.filter(
            Q(title__icontains=query) | Q(explanation__icontains=query)
        )[:5]
        results['apod'] = APODSerializer(apods, many=True).data
    
    if not types or 'neo' in types:
        neos = NearEarthObject.objects.filter(
            Q(name__icontains=query) | Q(designation__icontains=query)
        )[:5]
        results['neo'] = NEOSerializer(neos, many=True).data
    
    if not types or 'exoplanets' in types:
        exoplanets = Exoplanet.objects.filter(
            Q(name__icontains=query) | Q(host_star__icontains=query)
        )[:5]
        results['exoplanets'] = ExoplanetSerializer(exoplanets, many=True).data
    
    if not types or 'mars_photos' in types:
        photos = MarsRoverPhoto.objects.filter(
            Q(rover__name__icontains=query) | Q(camera_name__icontains=query)
        )[:5]
        results['mars_photos'] = MarsRoverPhotoSerializer(photos, many=True).data
    
    if not types or 'space_weather' in types:
        events = SpaceWeatherEvent.objects.filter(
            Q(summary__icontains=query) | Q(event_type__icontains=query)
        )[:5]
        results['space_weather'] = SpaceWeatherEventSerializer(events, many=True).data
    
    if not types or 'natural_events' in types:
        events = NaturalEvent.objects.filter(
            Q(title__icontains=query) | Q(description__icontains=query)
        )[:5]
        results['natural_events'] = NaturalEventSerializer(events, many=True).data
    
    if not types or 'space_events' in types:
        events = SpaceEvent.objects.filter(
            Q(title__icontains=query) | Q(description__icontains=query)
        )[:5]
        results['space_events'] = SpaceEventSerializer(events, many=True, context={'request': request}).data
    
    return Response(results)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def get_popular_content(request):
    """Get popular content based on user saves"""
    content_type = request.query_params.get('type')
    
    if content_type:
        # Get most saved items of specific type
        popular_items = UserSavedItem.objects.filter(
            item_type=content_type
        ).values('item_id').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        return Response(popular_items)
    else:
        # Get overall popular content
        popular = UserSavedItem.objects.values('item_type').annotate(
            count=Count('id')
        ).order_by('-count')
        
        return Response(popular)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_stats(request):
    """Get user statistics"""
    user = request.user
    
    stats = {
        'favorites_count': UserSavedItem.objects.filter(user=user).count(),
        'tracking_count': UserTrackedObject.objects.filter(user=user).count(),
        'favorites_by_type': UserSavedItem.objects.filter(user=user).values('item_type').annotate(count=Count('id')),
        'tracking_by_type': UserTrackedObject.objects.filter(user=user).values('object_type').annotate(count=Count('id')),
        'member_since': user.date_joined,
        'last_activity': user.last_login,
    }
    
    return Response(stats)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def get_apod_range(request):
    """Get APOD for date range"""
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    
    if not start_date or not end_date:
        return Response(
            {'error': 'start_date and end_date are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    apods = APOD.objects.filter(
        date__gte=start_date,
        date__lte=end_date
    ).order_by('-date')
    
    serializer = APODSerializer(apods, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def get_hazardous_neos(request):
    """Get potentially hazardous NEOs"""
    hazardous_neos = NearEarthObject.objects.filter(
        is_potentially_hazardous=True
    ).order_by('-created_at')[:20]
    
    serializer = NEOSerializer(hazardous_neos, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def get_latest_epic(request):
    """Get latest EPIC images"""
    latest_epic = EPICImage.objects.order_by('-date')[:10]
    serializer = EPICImageSerializer(latest_epic, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def get_habitable_exoplanets(request):
    """Get potentially habitable exoplanets"""
    habitable = Exoplanet.objects.filter(
        is_habitable_zone=True
    ).order_by('-discovery_year')[:20]
    
    serializer = ExoplanetSerializer(habitable, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def search_exoplanets(request):
    """Search exoplanets"""
    query = request.query_params.get('q', '')
    
    if len(query) < 2:
        return Response({'error': 'Query must be at least 2 characters'}, status=status.HTTP_400_BAD_REQUEST)
    
    exoplanets = Exoplanet.objects.filter(
        Q(name__icontains=query) | Q(host_star__icontains=query) | Q(discovery_method__icontains=query)
    )[:20]
    
    serializer = ExoplanetSerializer(exoplanets, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def sync_nasa_data(request):
    """Manually trigger NASA data sync"""
    if not request.user.is_staff:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    data_type = request.data.get('type', 'all')
    results = {}
    
    try:
        if data_type == 'all' or data_type == 'apod':
            results['apod'] = apod_service.sync_apod_data(days_back=7)
        
        if data_type == 'all' or data_type == 'neo':
            results['neo'] = neo_service.sync_neo_data(days_ahead=30)
        
        if data_type == 'all' or data_type == 'mars':
            results['mars_rovers'] = {}
            for rover in ['curiosity', 'perseverance', 'opportunity']:
                results['mars_rovers'][rover] = mars_rover_service.sync_rover_data(rover, latest_sols=5)
        
        if data_type == 'all' or data_type == 'epic':
            results['epic'] = epic_service.sync_epic_data(days_back=3)
        
        if data_type == 'all' or data_type == 'exoplanets':
            results['exoplanets'] = exoplanet_service.sync_exoplanet_data(limit=100)
        
        if data_type == 'all' or data_type == 'space_weather':
            results['space_weather'] = space_weather_service.sync_space_weather_data(days_back=30)
        
        if data_type == 'all' or data_type == 'natural_events':
            results['natural_events'] = natural_event_service.sync_natural_events_data(limit=500)
        
        if data_type == 'all' or data_type == 'space_events':
            results['space_events'] = space_event_service.sync_space_events()
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response({
        'message': 'Sync completed',
        'results': results
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def get_api_status(request):
    """Get API status and limits"""
    from .models import APIUsageLog
    
    # Get recent API usage stats
    recent_logs = APIUsageLog.objects.filter(
        timestamp__gte=timezone.now() - timedelta(hours=24)
    )
    
    stats = {
        'api_calls_24h': recent_logs.count(),
        'avg_response_time': recent_logs.aggregate(avg_time=Count('response_time'))['avg_time'] or 0,
        'error_rate': recent_logs.filter(status_code__gte=400).count() / max(recent_logs.count(), 1),
        'nasa_api_key_configured': bool(settings.NASA_API_KEY),
        'celery_enabled': settings.USE_CELERY,
        'last_sync': {
            'apod': APOD.objects.aggregate(latest=Count('created_at'))['latest'],
            'neo': NearEarthObject.objects.aggregate(latest=Count('created_at'))['latest'],
        }
    }
    
    return Response(stats)

# Additional user endpoints
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_favorites(request):
    """Get user's favorites"""
    favorites = UserSavedItem.objects.filter(user=request.user)
    serializer = UserSavedItemSerializer(favorites, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_to_favorites(request):
    """Add item to user's favorites"""
    serializer = UserSavedItemSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_favorite(request):
    """Toggle item favorite status"""
    item_type = request.data.get('item_type')
    item_id = request.data.get('item_id')
    
    existing = UserSavedItem.objects.filter(
        user=request.user,
        item_type=item_type,
        item_id=item_id
    ).first()
    
    if existing:
        existing.delete()
        return Response({'favorited': False})
    else:
        UserSavedItem.objects.create(
            user=request.user,
            item_type=item_type,
            item_id=item_id
        )
        return Response({'favorited': True})

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_tracking(request):
    """Get user's tracked objects"""
    tracking = UserTrackedObject.objects.filter(user=request.user)
    serializer = UserTrackedObjectSerializer(tracking, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_to_tracking(request):
    """Add object to user's tracking"""
    serializer = UserTrackedObjectSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_tracking(request):
    """Toggle object tracking status"""
    object_type = request.data.get('object_type')
    object_id = request.data.get('object_id')
    
    existing = UserTrackedObject.objects.filter(
        user=request.user,
        object_type=object_type,
        object_id=object_id
    ).first()
    
    if existing:
        existing.delete()
        return Response({'tracking': False})
    else:
        UserTrackedObject.objects.create(
            user=request.user,
            object_type=object_type,
            object_id=object_id
        )
        return Response({'tracking': True})

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def get_upcoming_neos(request):
    """Get upcoming NEO approaches"""
    days = int(request.GET.get('days', 7))
    end_date = timezone.now().date() + timedelta(days=days)
    
    neos = NearEarthObject.objects.filter(
        next_close_approach_date__lte=end_date,
        next_close_approach_date__gte=timezone.now().date()
    ).order_by('next_close_approach_date')[:50]
    
    serializer = NEOSerializer(neos, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def get_latest_mars_photos(request):
    """Get latest Mars rover photos"""
    rover = request.GET.get('rover')
    queryset = MarsRoverPhoto.objects.all()
    
    if rover:
        queryset = queryset.filter(rover__name__icontains=rover)
    
    photos = queryset.order_by('-earth_date')[:20]
    serializer = MarsRoverPhotoSerializer(photos, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def get_recent_space_weather(request):
    """Get recent space weather events"""
    days = int(request.GET.get('days', 30))
    start_date = timezone.now() - timedelta(days=days)
    
    events = SpaceWeatherEvent.objects.filter(
        event_time__gte=start_date
    ).order_by('-event_time')[:50]
    
    serializer = SpaceWeatherEventSerializer(events, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def get_active_natural_events(request):
    """Get active natural events"""
    events = NaturalEvent.objects.filter(closed=False).order_by('-created_at')[:50]
    serializer = NaturalEventSerializer(events, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def get_events_by_category(request, category):
    """Get natural events by category"""
    events = NaturalEvent.objects.filter(category_id=category).order_by('-created_at')[:50]
    serializer = NaturalEventSerializer(events, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def search_all(request):
    """Search across all NASA data"""
    query = request.GET.get('q', '')
    types = request.GET.get('types', '').split(',') if request.GET.get('types') else []
    
    results = {}
    
    if not types or 'apod' in types:
        apod_results = APOD.objects.filter(
            Q(title__icontains=query) | Q(explanation__icontains=query)
        )[:10]
        results['apod'] = APODSerializer(apod_results, many=True).data
    
    if not types or 'neo' in types:
        neo_results = NearEarthObject.objects.filter(
            Q(name__icontains=query) | Q(designation__icontains=query)
        )[:10]
        results['neo'] = NEOSerializer(neo_results, many=True).data
    
    if not types or 'exoplanets' in types:
        exo_results = Exoplanet.objects.filter(
            Q(name__icontains=query) | Q(host_star__icontains=query)
        )[:10]
        results['exoplanets'] = ExoplanetSerializer(exo_results, many=True).data
    
    return Response(results)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_stats(request):
    """Get user statistics"""
    user = request.user
    
    stats = {
        'favorites_count': UserSavedItem.objects.filter(user=user).count(),
        'tracking_count': UserTrackedObject.objects.filter(user=user).count(),
        'favorite_types': UserSavedItem.objects.filter(user=user).values('item_type').annotate(count=Count('item_type')),
        'join_date': user.date_joined,
        'last_login': user.last_login,
    }
    
    return Response(stats)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def get_popular_content(request):
    """Get popular content"""
    content_type = request.GET.get('type')
    results = {}
    
    if not content_type or content_type == 'apod':
        # Most saved APODs
        popular_apods = UserSavedItem.objects.filter(
            item_type='apod'
        ).values('item_id').annotate(
            count=Count('item_id')
        ).order_by('-count')[:10]
        
        apod_ids = [item['item_id'] for item in popular_apods]
        apods = APOD.objects.filter(nasa_id__in=apod_ids)
        results['apod'] = APODSerializer(apods, many=True).data
    
    if not content_type or content_type == 'neo':
        # Most tracked NEOs
        popular_neos = UserTrackedObject.objects.filter(
            object_type='neo'
        ).values('object_id').annotate(
            count=Count('object_id')
        ).order_by('-count')[:10]
        
        neo_ids = [item['object_id'] for item in popular_neos]
        neos = NearEarthObject.objects.filter(nasa_id__in=neo_ids)
        results['neo'] = NEOSerializer(neos, many=True).data
    
    return Response(results)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_dashboard_data(request):
    """Get dashboard data for user"""
    user = request.user
    
    # Get recent user activity
    recent_saves = UserSavedItem.objects.filter(user=user).order_by('-saved_at')[:5]
    recent_tracking = UserTrackedObject.objects.filter(user=user).order_by('-created_at')[:5]
    
    # Get latest NASA data
    latest_apod = APOD.objects.first()
    upcoming_neos = NearEarthObject.objects.filter(
        next_close_approach_date__gte=timezone.now().date()
    ).order_by('next_close_approach_date')[:3]
    
    recent_mars_photos = MarsRoverPhoto.objects.order_by('-earth_date')[:5]
    
    dashboard_data = {
        'user_stats': {
            'favorites_count': recent_saves.count(),
            'tracking_count': recent_tracking.count(),
        },
        'recent_activity': {
            'saves': UserSavedItemSerializer(recent_saves, many=True).data,
            'tracking': UserTrackedObjectSerializer(recent_tracking, many=True).data,
        },
        'latest_content': {
            'apod': APODSerializer(latest_apod).data if latest_apod else None,
            'upcoming_neos': NEOSerializer(upcoming_neos, many=True).data,
            'mars_photos': MarsRoverPhotoSerializer(recent_mars_photos, many=True).data,
        }
    }
    
    return Response(dashboard_data)

