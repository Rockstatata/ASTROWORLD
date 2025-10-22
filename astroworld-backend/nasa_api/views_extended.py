# nasa_api/views_extended.py
"""
Extended NASA API views for Image Library, TLE, and GIBS
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta
import logging

from .services import nasa_image_service, tle_service, gibs_service
from .models import NASAMediaItem, Satellite
from .serializers import NASAMediaItemSerializer, SatelliteSerializer

logger = logging.getLogger(__name__)

# NASA Image and Video Library Views

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def nasa_image_search(request):
    """
    Search NASA Image and Video Library
    Query params:
    - q: search query (required)
    - media_type: image, video, audio
    - year_start: start year
    - year_end: end year
    - page: page number (default: 1)
    - page_size: results per page (default: 20, max: 100)
    """
    query = request.GET.get('q', '')
    if not query:
        return Response(
            {'error': 'Search query (q) is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Build cache key
    cache_key = f"nasa_image_search_{query}_{request.GET.get('media_type', 'all')}_{request.GET.get('page', 1)}"
    
    # Check cache
    cached_data = cache.get(cache_key)
    if cached_data:
        return Response(cached_data)
    
    # Make API call
    result = nasa_image_service.search_media(
        query=query,
        media_type=request.GET.get('media_type'),
        year_start=request.GET.get('year_start'),
        year_end=request.GET.get('year_end'),
        page=int(request.GET.get('page', 1)),
        page_size=min(int(request.GET.get('page_size', 20)), 100)
    )
    
    if not result:
        return Response(
            {'error': 'Failed to fetch data from NASA Image Library'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    
    # Cache for 1 hour
    cache.set(cache_key, result, 3600)
    
    return Response(result)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def nasa_image_popular(request):
    """Get popular/featured NASA images"""
    limit = min(int(request.GET.get('limit', 20)), 100)
    
    cache_key = f"nasa_image_popular_{limit}"
    cached_data = cache.get(cache_key)
    
    if cached_data:
        return Response(cached_data)
    
    result = nasa_image_service.get_popular_images(limit=limit)
    
    if not result:
        return Response(
            {'error': 'Failed to fetch popular images'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    
    # Return just the items array, not wrapped in collection
    items = result.get('collection', {}).get('items', [])
    
    # Cache for 6 hours
    cache.set(cache_key, items, 21600)
    
    return Response(items)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def nasa_image_asset(request, nasa_id):
    """Get asset manifest for a specific media item"""
    cache_key = f"nasa_asset_{nasa_id}"
    cached_data = cache.get(cache_key)
    
    if cached_data:
        return Response(cached_data)
    
    result = nasa_image_service.get_asset_manifest(nasa_id)
    
    if not result:
        return Response(
            {'error': f'Asset not found for ID: {nasa_id}'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Cache for 24 hours
    cache.set(cache_key, result, 86400)
    
    return Response(result)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def nasa_image_metadata(request, nasa_id):
    """Get metadata for a specific media item"""
    cache_key = f"nasa_metadata_{nasa_id}"
    cached_data = cache.get(cache_key)
    
    if cached_data:
        return Response(cached_data)
    
    result = nasa_image_service.get_metadata(nasa_id)
    
    if not result:
        return Response(
            {'error': f'Metadata not found for ID: {nasa_id}'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Cache for 24 hours
    cache.set(cache_key, result, 86400)
    
    return Response(result)


# TLE Satellite Tracking Views

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def tle_search(request):
    """
    Search for satellites by name
    Query params:
    - q: search query (required)
    """
    query = request.GET.get('q', '')
    if not query:
        return Response(
            {'error': 'Search query (q) is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    cache_key = f"tle_search_{query}"
    cached_data = cache.get(cache_key)
    
    if cached_data:
        return Response(cached_data)
    
    result = tle_service.search_satellite(query)
    
    if result is None:
        return Response(
            {'error': 'Failed to fetch TLE data'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    
    # Cache for 6 hours (TLE updates daily)
    cache.set(cache_key, result, 21600)
    
    return Response(result)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def tle_by_id(request, satellite_id):
    """Get TLE data for a specific satellite by NORAD ID"""
    cache_key = f"tle_id_{satellite_id}"
    cached_data = cache.get(cache_key)
    
    if cached_data:
        return Response(cached_data)
    
    result = tle_service.get_satellite_by_id(satellite_id)
    
    if not result:
        return Response(
            {'error': f'Satellite not found for ID: {satellite_id}'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Cache for 6 hours
    cache.set(cache_key, result, 21600)
    
    return Response(result)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def tle_popular(request):
    """Get TLE data for popular satellites (ISS, Hubble, etc.)"""
    cache_key = "tle_popular"
    cached_data = cache.get(cache_key)
    
    if cached_data:
        return Response(cached_data)
    
    result = tle_service.get_popular_satellites()
    
    if not result:
        return Response(
            {'error': 'Failed to fetch popular satellites'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    
    # Cache for 6 hours
    cache.set(cache_key, result, 21600)
    
    return Response(result)


# GIBS (Global Imagery Browse Services) Views

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def gibs_layers(request):
    """Get available GIBS layers"""
    cache_key = "gibs_layers"
    cached_data = cache.get(cache_key)
    
    if cached_data:
        return Response(cached_data)
    
    result = gibs_service.get_available_layers()
    
    # Cache for 24 hours (layers don't change often)
    cache.set(cache_key, result, 86400)
    
    return Response(result)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def gibs_latest(request, layer_id):
    """Get latest imagery for a specific layer"""
    cache_key = f"gibs_latest_{layer_id}"
    cached_data = cache.get(cache_key)
    
    if cached_data:
        # Check if cache is from today
        cache_date = cached_data.get('cached_at', '')
        if cache_date == timezone.now().strftime('%Y-%m-%d'):
            return Response(cached_data)
    
    result = gibs_service.get_latest_imagery(layer_id)
    result['cached_at'] = timezone.now().strftime('%Y-%m-%d')
    
    # Cache for 12 hours
    cache.set(cache_key, result, 43200)
    
    return Response(result)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def gibs_tile_url(request):
    """
    Generate WMTS tile URL
    Query params:
    - layer: layer ID (required)
    - date: YYYY-MM-DD format (default: yesterday)
    - z: zoom level (required)
    - x: tile x coordinate (required)
    - y: tile y coordinate (required)
    - format: jpeg or png (default: jpeg)
    """
    layer = request.GET.get('layer')
    z = request.GET.get('z')
    x = request.GET.get('x')
    y = request.GET.get('y')
    
    if not all([layer, z, x, y]):
        return Response(
            {'error': 'layer, z, x, y parameters are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    date = request.GET.get('date', (timezone.now() - timedelta(days=1)).strftime('%Y-%m-%d'))
    format_type = request.GET.get('format', 'jpeg')
    
    tile_url = gibs_service.generate_tile_url(
        layer=layer,
        date=date,
        z=int(z),
        x=int(x),
        y=int(y),
        format=format_type
    )
    
    return Response({'tile_url': tile_url})


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def gibs_wms_url(request):
    """
    Generate WMS GetMap URL
    Query params:
    - layers: layer IDs (comma-separated, required)
    - bbox: bounding box (required, format: minlon,minlat,maxlon,maxlat)
    - width: image width (default: 512)
    - height: image height (default: 512)
    - date: YYYY-MM-DD format (optional)
    - format: image/jpeg or image/png (default: image/jpeg)
    """
    layers = request.GET.get('layers')
    bbox = request.GET.get('bbox')
    
    if not all([layers, bbox]):
        return Response(
            {'error': 'layers and bbox parameters are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    width = int(request.GET.get('width', 512))
    height = int(request.GET.get('height', 512))
    date = request.GET.get('date')
    format_type = request.GET.get('format', 'image/jpeg')
    
    wms_url = gibs_service.generate_wms_url(
        layers=layers,
        bbox=bbox,
        width=width,
        height=height,
        date=date,
        format=format_type
    )
    
    return Response({'wms_url': wms_url})


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def gibs_imagery(request):
    """
    Get GIBS imagery data for a specific layer, date, and region
    Query params:
    - layer: layer ID (required)
    - date: YYYY-MM-DD format (required)
    - region: geographic, arctic, or antarctic (required)
    - format: image format (optional, default: image/png)
    - width: image width (optional, default: 512)
    - height: image height (optional, default: 512)
    """
    layer = request.GET.get('layer')
    date = request.GET.get('date')
    region = request.GET.get('region')
    
    if not all([layer, date, region]):
        return Response(
            {'error': 'layer, date, and region parameters are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    format_type = request.GET.get('format', 'image/png')
    width = int(request.GET.get('width', 512))
    height = int(request.GET.get('height', 512))
    
    cache_key = f"gibs_imagery_{layer}_{date}_{region}_{format_type}_{width}_{height}"
    cached_data = cache.get(cache_key)
    
    if cached_data:
        return Response(cached_data)
    
    try:
        # Generate imagery URL using GIBS service
        result = gibs_service.get_imagery(
            layer=layer,
            date=date,
            region=region,
            format=format_type,
            width=width,
            height=height
        )
        
        if not result:
            return Response(
                {'error': 'Failed to generate GIBS imagery'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        # Cache for 1 hour (imagery data doesn't change often)
        cache.set(cache_key, result, 3600)
        
        return Response(result)
        
    except Exception as e:
        return Response(
            {'error': f'GIBS imagery error: {str(e)}'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )


# Consolidated NASA API endpoints (proxying to NASA with backend key)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def nasa_apod(request):
    """Get Astronomy Picture of the Day"""
    date_param = request.GET.get('date')
    count = request.GET.get('count')
    
    cache_key = f"nasa_apod_{date_param or 'today'}_{count or '1'}"
    cached_data = cache.get(cache_key)
    
    if cached_data:
        return Response(cached_data)
    
    from .services import apod_service
    from datetime import datetime
    
    if date_param:
        try:
            date_obj = datetime.strptime(date_param, '%Y-%m-%d')
            result = apod_service.fetch_apod(date=date_obj)
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )
    elif count:
        result = apod_service.fetch_apod(count=int(count))
    else:
        result = apod_service.fetch_apod()
    
    if not result:
        return Response(
            {'error': 'Failed to fetch APOD'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    
    # Cache for 12 hours
    cache.set(cache_key, result, 43200)
    
    return Response(result)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def nasa_neo_feed(request):
    """Get Near-Earth Objects feed"""
    from datetime import datetime
    from .services import neo_service
    
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    
    cache_key = f"nasa_neo_{start_date or 'today'}_{end_date or 'week'}"
    cached_data = cache.get(cache_key)
    
    if cached_data:
        return Response(cached_data)
    
    try:
        start = datetime.strptime(start_date, '%Y-%m-%d') if start_date else None
        end = datetime.strptime(end_date, '%Y-%m-%d') if end_date else None
        result = neo_service.fetch_neo_feed(start, end)
    except ValueError:
        return Response(
            {'error': 'Invalid date format. Use YYYY-MM-DD'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not result:
        return Response(
            {'error': 'Failed to fetch NEO data'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    
    # Cache for 6 hours
    cache.set(cache_key, result, 21600)
    
    return Response(result)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def nasa_mars_photos(request):
    """Get Mars Rover photos"""
    from .services import mars_rover_service
    
    rover = request.GET.get('rover', 'curiosity')
    sol = request.GET.get('sol')
    earth_date = request.GET.get('earth_date')
    camera = request.GET.get('camera')
    page = int(request.GET.get('page', 1))
    
    cache_key = f"nasa_mars_{rover}_{sol or earth_date or 'latest'}_{camera or 'all'}_{page}"
    cached_data = cache.get(cache_key)
    
    if cached_data:
        return Response(cached_data)
    
    result = mars_rover_service.fetch_rover_photos(
        rover=rover,
        sol=int(sol) if sol else None,
        earth_date=earth_date,
        camera=camera,
        page=page
    )
    
    if not result:
        return Response(
            {'error': 'Failed to fetch Mars photos'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    
    # Cache for 12 hours
    cache.set(cache_key, result, 43200)
    
    return Response(result)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def nasa_epic(request):
    """Get EPIC Earth images"""
    from .services import epic_service
    from datetime import datetime
    
    date_param = request.GET.get('date')
    available_dates = request.GET.get('available_dates', 'false').lower() == 'true'
    
    cache_key = f"nasa_epic_{date_param or 'recent'}_{available_dates}"
    cached_data = cache.get(cache_key)
    
    if cached_data:
        return Response(cached_data)
    
    if available_dates:
        result = epic_service.fetch_epic_images(available_dates=True)
    else:
        try:
            date_obj = datetime.strptime(date_param, '%Y-%m-%d') if date_param else None
            result = epic_service.fetch_epic_images(date=date_obj)
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    if not result:
        return Response(
            {'error': 'Failed to fetch EPIC data'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    
    # Cache for 12 hours
    cache.set(cache_key, result, 43200)
    
    return Response(result)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def nasa_donki(request):
    """Get space weather events from DONKI"""
    from .services import space_weather_service
    from datetime import datetime
    
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    event_type = request.GET.get('type')
    
    cache_key = f"nasa_donki_{start_date or 'month'}_{event_type or 'all'}"
    cached_data = cache.get(cache_key)
    
    if cached_data:
        return Response(cached_data)
    
    try:
        start = datetime.strptime(start_date, '%Y-%m-%d') if start_date else None
        end = datetime.strptime(end_date, '%Y-%m-%d') if end_date else None
        result = space_weather_service.fetch_space_weather_events(start, end, event_type)
    except ValueError:
        return Response(
            {'error': 'Invalid date format. Use YYYY-MM-DD'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not result:
        return Response(
            {'error': 'Failed to fetch DONKI data'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    
    # Transform DONKI data to match frontend expectations
    transformed_events = []
    if isinstance(result, list):
        for event in result:
            # Transform each event to match DonkiEvent interface
            transformed_event = {
                'activityID': event.get('activityID'),
                'messageType': event.get('messageType') or event.get('event_type', 'Space Weather'),
                'messageIssueTime': event.get('messageIssueTime') or event.get('eventTime') or event.get('startTime'),
                'messageBody': event.get('messageBody') or event.get('note') or event.get('summary') or 'No details available',
                'messageID': event.get('messageID') or event.get('activityID'),
                'messageURL': event.get('messageURL') or event.get('link')
            }
            transformed_events.append(transformed_event)
    else:
        # Single event
        transformed_events = [{
            'activityID': result.get('activityID'),
            'messageType': result.get('messageType') or result.get('event_type', 'Space Weather'),
            'messageIssueTime': result.get('messageIssueTime') or result.get('eventTime') or result.get('startTime'),
            'messageBody': result.get('messageBody') or result.get('note') or result.get('summary') or 'No details available',
            'messageID': result.get('messageID') or result.get('activityID'),
            'messageURL': result.get('messageURL') or result.get('link')
        }]
    
    # Cache for 6 hours
    cache.set(cache_key, transformed_events, 21600)
    
    return Response(transformed_events)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def nasa_exoplanets_count(request):
    """Get count of confirmed exoplanets"""
    from .services import exoplanet_service
    
    cache_key = "nasa_exoplanets_count"
    cached_data = cache.get(cache_key)
    
    if cached_data:
        return Response(cached_data)
    
    # Simple count query
    query = "SELECT count(*) as count FROM ps"
    import requests
    
    try:
        response = requests.get(
            "https://exoplanetarchive.ipac.caltech.edu/TAP/sync",
            params={'query': query, 'format': 'json'},
            timeout=30
        )
        response.raise_for_status()
        json_data = response.json()
        result = {'count': int(json_data[0]['count']) if json_data else 0}
    except Exception as e:
        logger.error(f"Exoplanet count error: {str(e)}")
        return Response(
            {'error': 'Failed to fetch exoplanet count'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    
    # Cache for 24 hours
    cache.set(cache_key, result, 86400)
    
    return Response(result)
