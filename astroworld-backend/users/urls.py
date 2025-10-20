from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from users.views import (
    RegisterView, 
    VerifyEmailView, 
    PasswordResetRequestView, 
    PasswordResetConfirmView, 
    LogoutView, 
    UserRetrieveUpdateView,
    UserContentViewSet,
    UserJournalViewSet,
    UserCollectionViewSet,
    UserSubscriptionViewSet,
    UserActivityViewSet,
    UserProfileView
)
from . import views

app_name = 'users'

# Router for ViewSets
router = DefaultRouter()
router.register(r'content', UserContentViewSet, basename='content')
router.register(r'journals', UserJournalViewSet, basename='journal')
router.register(r'collections', UserCollectionViewSet, basename='collection')
router.register(r'subscriptions', UserSubscriptionViewSet, basename='subscription')
router.register(r'activities', UserActivityViewSet, basename='activity')

urlpatterns = [
    # Authentication endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('email-verify/', VerifyEmailView.as_view(), name='email-verify'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('user/', UserRetrieveUpdateView.as_view(), name='user-profile'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    
    # User profile with stats
    path('profile/', UserProfileView.as_view(), name='profile'),
    
    # User interaction endpoints (CRUD for content, journals, collections, etc.)
    path('', include(router.urls)),
]