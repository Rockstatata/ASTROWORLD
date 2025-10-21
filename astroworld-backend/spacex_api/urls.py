from django.urls import path
from . import views

app_name = 'spacex_api'

urlpatterns = [
    # Rocket endpoints
    path('rockets/', views.SpaceXRocketListView.as_view(), name='rockets-list'),
    path('rockets/<str:spacex_id>/', views.SpaceXRocketDetailView.as_view(), name='rocket-detail'),
    
    # Launchpad endpoints
    path('launchpads/', views.SpaceXLaunchpadListView.as_view(), name='launchpads-list'),
    path('launchpads/<str:spacex_id>/', views.SpaceXLaunchpadDetailView.as_view(), name='launchpad-detail'),
    
    # Launch endpoints
    path('launches/', views.SpaceXLaunchListView.as_view(), name='launches-list'),
    path('launches/upcoming/', views.get_upcoming_launches, name='launches-upcoming'),
    path('launches/latest/', views.get_latest_launch, name='launches-latest'),
    path('launches/next/', views.get_next_launch, name='launches-next'),
    path('launches/<str:spacex_id>/', views.SpaceXLaunchDetailView.as_view(), name='launch-detail'),
    
    # Historical events endpoints
    path('history/', views.SpaceXHistoricalEventListView.as_view(), name='history-list'),
    path('history/<str:spacex_id>/', views.SpaceXHistoricalEventDetailView.as_view(), name='history-detail'),
    
    # Mission endpoints
    path('missions/', views.SpaceXMissionListView.as_view(), name='missions-list'),
    path('missions/<str:spacex_id>/', views.SpaceXMissionDetailView.as_view(), name='mission-detail'),
    
    # Starlink endpoints
    path('starlink/', views.SpaceXStarlinkListView.as_view(), name='starlink-list'),
    path('starlink/stats/', views.get_starlink_stats, name='starlink-stats'),
    
    # Core and Capsule endpoints
    path('cores/', views.SpaceXCoreListView.as_view(), name='cores-list'),
    path('capsules/', views.SpaceXCapsuleListView.as_view(), name='capsules-list'),
    
    # User interaction endpoints
    path('user/favorites/', views.UserSavedSpaceXItemListView.as_view(), name='user-favorites-list'),
    path('user/favorites/<int:pk>/', views.UserSavedSpaceXItemDetailView.as_view(), name='user-favorites-detail'),
    path('user/favorites/toggle/', views.toggle_spacex_favorite, name='toggle-favorite'),
    
    path('user/tracking/', views.UserTrackedSpaceXLaunchListView.as_view(), name='user-tracking-list'),
    path('user/tracking/toggle/', views.toggle_launch_tracking, name='toggle-tracking'),
    
    # Utility endpoints
    path('sync/', views.sync_spacex_data, name='sync-data'),
    path('stats/', views.get_spacex_stats, name='stats'),
    path('search/', views.search_spacex, name='search'),
]