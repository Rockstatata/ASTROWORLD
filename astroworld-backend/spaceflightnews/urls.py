from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'spaceflightnews'

urlpatterns = [
    path('news/', views.SpaceflightNewsListView.as_view(), name='news-list'),
    path('news/latest/', views.get_latest_news, name='news-latest'),
    path('news/featured/', views.get_featured_news, name='news-featured'),
    path('news/sites/', views.get_news_sites, name='news-sites'),
    path('news/preferences/', views.user_news_preferences, name='news-preferences'),
    path('news/sync/', views.sync_spaceflight_news, name='news-sync'),
    path('news/<str:nasa_id>/', views.SpaceflightNewsDetailView.as_view(), name='news-detail')
]