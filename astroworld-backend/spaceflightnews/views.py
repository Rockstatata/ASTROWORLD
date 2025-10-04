from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination as StandardPagination
from django.db.models import Q
from .models import SpaceflightNews, UserNewsPreference
from .serializers import SpaceflightNewsSerializer, UserNewsPreferenceSerializer
from .services import spaceflight_news_service



# Spaceflight News Views
class SpaceflightNewsListView(generics.ListAPIView):
    """List Spaceflight News"""
    serializer_class = SpaceflightNewsSerializer
    pagination_class = StandardPagination
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = SpaceflightNews.objects.all().order_by('-published_at')
        
        # Filters
        article_type = self.request.query_params.get('type')
        news_site = self.request.query_params.get('news_site')
        search = self.request.query_params.get('search')
        featured = self.request.query_params.get('featured')
        
        if article_type:
            queryset = queryset.filter(article_type=article_type)
        if news_site:
            queryset = queryset.filter(news_site__icontains=news_site)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(summary__icontains=search)
            )
        if featured:
            queryset = queryset.filter(featured=True)
            
        return queryset

class SpaceflightNewsDetailView(generics.RetrieveAPIView):
    """Get specific news article details"""
    queryset = SpaceflightNews.objects.all()
    serializer_class = SpaceflightNewsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'nasa_id'

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def get_latest_news(request):
    """Get latest spaceflight news"""
    limit = int(request.GET.get('limit', 10))
    article_type = request.GET.get('type')
    
    queryset = SpaceflightNews.objects.all()
    if article_type:
        queryset = queryset.filter(article_type=article_type)
    
    news = queryset.order_by('-published_at')[:limit]
    serializer = SpaceflightNewsSerializer(news, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def get_featured_news(request):
    """Get featured spaceflight news"""
    news = SpaceflightNews.objects.filter(featured=True).order_by('-published_at')[:20]
    serializer = SpaceflightNewsSerializer(news, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def get_news_sites(request):
    """Get available news sites"""
    sites = SpaceflightNews.objects.values_list('news_site', flat=True).distinct()
    return Response(list(sites))

@api_view(['GET', 'PUT'])
@permission_classes([permissions.IsAuthenticated])
def user_news_preferences(request):
    """Get or update user news preferences"""
    if request.method == 'GET':
        try:
            preferences = UserNewsPreference.objects.get(user=request.user)
            serializer = UserNewsPreferenceSerializer(preferences)
            return Response(serializer.data)
        except UserNewsPreference.DoesNotExist:
            return Response({
                'preferred_news_sites': [],
                'keywords': [],
                'enable_notifications': True
            })
    
    elif request.method == 'PUT':
        preferences, created = UserNewsPreference.objects.get_or_create(
            user=request.user
        )
        serializer = UserNewsPreferenceSerializer(preferences, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def sync_spaceflight_news(request):
    """Manually trigger spaceflight news sync"""
    if not request.user.is_staff:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    days_back = request.data.get('days_back', 7)
    article_types = request.data.get('types', ['articles', 'blogs', 'reports'])
    
    try:
        results = spaceflight_news_service.sync_news_data(days_back, article_types)
        return Response({
            'message': 'Sync completed',
            'results': results
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def search_all(request):
    """Search across all NASA data"""
    query = request.GET.get('q', '')
    types = request.GET.get('types', '').split(',') if request.GET.get('types') else []
    
    results = {}
    
    # ...existing search code...
    
    if not types or 'news' in types:
        news_results = SpaceflightNews.objects.filter(
            Q(title__icontains=query) | Q(summary__icontains=query)
        )[:10]
        results['news'] = SpaceflightNewsSerializer(news_results, many=True).data
    
    return Response(results)