from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from users.views import (
    RegisterView, 
    VerifyEmailView, 
    PasswordResetRequestView, 
    PasswordResetConfirmView, 
    LoginView,
    LogoutView, 
    ChangePasswordView,
    UserRetrieveUpdateView,
    UserContentViewSet,
    UserJournalViewSet,
    UserCollectionViewSet,
    UserSubscriptionViewSet,
    UserActivityViewSet,
    UserProfileView,
    PublicProfileView,
    # Messaging views
    MessageThreadListView,
    MessageThreadDetailView,
    SendMessageView,
    UserMessagesView
)
from users.explore_views import (
    ExploreUsersViewSet,
    ExplorePapersViewSet,
    ExploreJournalsViewSet,
    UserPaperViewSet,
    FollowViewSet,
    LikeViewSet,
    CommentViewSet
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

# Explore router
explore_router = DefaultRouter()
explore_router.register(r'users', ExploreUsersViewSet, basename='explore-users')
explore_router.register(r'papers', ExplorePapersViewSet, basename='explore-papers')
explore_router.register(r'journals', ExploreJournalsViewSet, basename='explore-journals')
explore_router.register(r'my-papers', UserPaperViewSet, basename='my-papers')
explore_router.register(r'follow', FollowViewSet, basename='follow')
explore_router.register(r'likes', LikeViewSet, basename='likes')
explore_router.register(r'comments', CommentViewSet, basename='comments')

urlpatterns = [
    # Authentication endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('email-verify/', VerifyEmailView.as_view(), name='email-verify'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('user/', UserRetrieveUpdateView.as_view(), name='user-profile'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    
    # User profile with stats
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('profile/<int:user_id>/', PublicProfileView.as_view(), name='public-profile'),
    
    # Messaging endpoints
    path('messages/threads/', MessageThreadListView.as_view(), name='message-threads'),
    path('messages/threads/<int:thread_id>/', MessageThreadDetailView.as_view(), name='message-thread-detail'),
    path('messages/send/', SendMessageView.as_view(), name='send-message'),
    path('messages/with/<int:user_id>/', UserMessagesView.as_view(), name='user-messages'),
    
    # User interaction endpoints (CRUD for content, journals, collections, etc.)
    path('', include(router.urls)),
    
    # Explore endpoints
    path('explore/', include(explore_router.urls)),
]