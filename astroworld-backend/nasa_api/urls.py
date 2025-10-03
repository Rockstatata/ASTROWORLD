from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'nasa_api'

urlpatterns = [
    # APOD endpoints
    path('apod/', views.APODListView.as_view(), name='apod-list'),
    path('apod/latest/', views.get_latest_apod, name='apod-latest'),
    path('apod/random/', views.get_random_apod, name='apod-random'),
    path('apod/range/', views.get_apod_range, name='apod-range'),
    path('apod/<str:date>/', views.APODDetailView.as_view(), name='apod-detail'),
    
    # NEO endpoints
    path('neo/', views.NEOListView.as_view(), name='neo-list'),
    path('neo/hazardous/', views.get_hazardous_neos, name='neo-hazardous'),
    path('neo/upcoming/', views.get_upcoming_neos, name='neo-upcoming'),
    path('neo/<str:nasa_id>/', views.NEODetailView.as_view(), name='neo-detail'),
    path('neo/approaches/upcoming/', views.get_upcoming_neo_approaches, name='neo-upcoming-approaches'),
    
    # Mars Rover endpoints
    path('mars-photos/', views.MarsRoverPhotoListView.as_view(), name='mars-photos-list'),
    path('mars-photos/latest/', views.get_latest_mars_photos, name='mars-photos-latest'),
    path('mars-rovers/status/', views.get_rovers_status, name='mars-rovers-status'),
    
    # EPIC endpoints
    path('epic/', views.EPICImageListView.as_view(), name='epic-list'),
    path('epic/latest/', views.get_latest_epic, name='epic-latest'),
    
    # Exoplanet endpoints
    path('exoplanets/', views.ExoplanetListView.as_view(), name='exoplanets-list'),
    path('exoplanets/habitable/', views.get_habitable_exoplanets, name='exoplanets-habitable'),
    path('exoplanets/search/', views.search_exoplanets, name='exoplanets-search'),
    path('exoplanets/<str:nasa_id>/', views.ExoplanetDetailView.as_view(), name='exoplanet-detail'),
    
    # Space Weather endpoints
    path('space-weather/', views.SpaceWeatherEventListView.as_view(), name='space-weather-list'),
    path('space-weather/recent/', views.get_recent_space_weather, name='space-weather-recent'),
    
    # Natural Events endpoints
    path('natural-events/', views.NaturalEventListView.as_view(), name='natural-events-list'),
    path('natural-events/active/', views.get_active_natural_events, name='natural-events-active'),
    path('natural-events/category/<str:category>/', views.get_events_by_category, name='natural-events-category'),
    
    # User interaction endpoints
    path('saved/', views.UserSavedItemListView.as_view(), name='user-saved-list'),
    path('saved/<int:pk>/', views.UserSavedItemDetailView.as_view(), name='user-saved-detail'),
    path('tracked/', views.UserTrackedObjectListView.as_view(), name='user-tracked-list'),
    
    # User favorites (frontend expects these paths)
    path('user/favorites/', views.get_user_favorites, name='user-favorites'),
    path('user/favorites/toggle/', views.toggle_favorite, name='toggle-favorite'),
    
    # User tracking (frontend expects these paths)  
    path('user/tracking/', views.get_user_tracking, name='user-tracking'),
    path('user/tracking/toggle/', views.toggle_tracking, name='toggle-tracking'),
    
    # User stats
    path('user/stats/', views.get_user_stats, name='user-stats'),
    
    # Search and popular content
    path('search/', views.search_all, name='search-all'),
    path('popular/', views.get_popular_content, name='popular-content'),
    
    # Admin/sync endpoints
    path('sync/', views.sync_nasa_data, name='sync-nasa-data'),
    path('dashboard/', views.get_dashboard_data, name='dashboard-data'),
    path('status/', views.get_api_status, name='api-status'),
]