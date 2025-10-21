from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SkyMarkerViewSet, SkyViewViewSet, MarkerObservationViewSet,
    PublicDiscoveryView, MarkerShareView, AIDescriptionView, SkymapStatsView
)

# Create a router and register viewsets
router = DefaultRouter()
router.register(r'markers', SkyMarkerViewSet, basename='skymarker')
router.register(r'views', SkyViewViewSet, basename='skyview')
router.register(r'observations', MarkerObservationViewSet, basename='markerobservation')

app_name = 'skymap'

urlpatterns = [
    # ViewSet URLs
    path('', include(router.urls)),
    
    # Additional API endpoints
    path('discover/', PublicDiscoveryView.as_view(), name='public-discovery'),
    path('share/', MarkerShareView.as_view(), name='marker-share'),
    path('ai-description/', AIDescriptionView.as_view(), name='ai-description'),
    path('stats/', SkymapStatsView.as_view(), name='skymap-stats'),
]