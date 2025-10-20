from rest_framework import generics, permissions, status, viewsets, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from .serializers import (
    RegisterSerializer, UserSerializer, UserContentSerializer, UserContentListSerializer,
    UserJournalSerializer, UserJournalListSerializer, UserCollectionSerializer,
    UserCollectionListSerializer, UserSubscriptionSerializer, UserActivitySerializer,
    UserProfileSerializer
)
from .models import UserContent, UserJournal, UserCollection, UserSubscription, UserActivity
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        self.send_verification_email(user)

    def send_verification_email(self, user):
        try:
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            verify_url = f"{settings.FRONTEND_URL}/verify-email/?uid={uid}&token={token}"
            
            # Check if we're using console backend
            if settings.EMAIL_BACKEND == 'django.core.mail.backends.console.EmailBackend':
                print(f"\n{'='*60}")
                print(f"VERIFICATION EMAIL FOR: {user.email}")
                print(f"Verification URL: {verify_url}")
                print(f"{'='*60}\n")
                # Auto-verify in development when using console backend
                if settings.DEBUG:
                    user.is_active = True
                    user.email_verified = True
                    user.save()
                    print(f"Auto-verified user {user.email} (development mode)\n")
            else:
                send_mail(
                    "Verify your ASTROWORLD account", 
                    f"Click to verify: {verify_url}", 
                    settings.DEFAULT_FROM_EMAIL, 
                    [user.email],
                    fail_silently=False
                )
                print(f"Verification email sent to {user.email}")
        except Exception as e:
            print(f"Failed to send verification email to {user.email}: {str(e)}")
            # In development, we can continue without email verification
            if settings.DEBUG:
                user.is_active = True
                user.email_verified = True
                user.save()
                print(f"Auto-verified user {user.email} due to email configuration issues")

class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        try:
            uid = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=uid)
        except Exception:
            return Response({"detail": "Invalid UID"}, status=400)
        if default_token_generator.check_token(user, token):
            user.is_active = True
            user.email_verified = True
            user.save()
            return Response({"detail": "Email verified"})
        return Response({"detail": "Invalid token"}, status=400)

class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            reset_url = f"{settings.FRONTEND_URL}/reset-password/?uid={uid}&token={token}"
            try:
                send_mail(
                    "Password reset", 
                    f"Reset: {reset_url}", 
                    settings.DEFAULT_FROM_EMAIL, 
                    [user.email],
                    fail_silently=False
                )
                print(f"Password reset email sent to {user.email}")
            except Exception as e:
                print(f"Failed to send password reset email to {user.email}: {str(e)}")
        except User.DoesNotExist:
            pass
        return Response({"detail": "If the email exists, a reset link was sent."})

class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        new_password2 = request.data.get('new_password2')
        if new_password != new_password2:
            return Response({"detail": "Passwords do not match"}, status=400)
        try:
            uid = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=uid)
        except Exception:
            return Response({"detail": "Invalid uid"}, status=400)
        if default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response({"detail": "Password reset success"})
        return Response({"detail": "Invalid token"}, status=400)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Logged out"})
        except Exception:
            return Response({"detail": "Invalid token"}, status=400)

class UserRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# =====================================================
# USER CONTENT CRUD VIEWSETS
# =====================================================

class UserContentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user's saved NASA content (APOD, Mars photos, EPIC, NEO, etc.)
    
    Endpoints:
    - GET /api/users/content/ - List all saved content
    - POST /api/users/content/ - Save new content
    - GET /api/users/content/{id}/ - Get specific content
    - PUT/PATCH /api/users/content/{id}/ - Update notes/tags
    - DELETE /api/users/content/{id}/ - Remove saved content
    
    Filters:
    - content_type: apod, mars_photo, epic, neo, exoplanet, space_weather, news, celestial, event
    - is_favorite: true/false
    - tags: comma-separated tags
    """
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['notes', 'tags']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return UserContentListSerializer
        return UserContentSerializer
    
    def get_queryset(self):
        queryset = UserContent.objects.filter(user=self.request.user)
        
        # Filter by content type
        content_type = self.request.query_params.get('content_type')
        if content_type:
            queryset = queryset.filter(content_type=content_type)
        
        # Filter by favorite
        is_favorite = self.request.query_params.get('is_favorite')
        if is_favorite is not None:
            queryset = queryset.filter(is_favorite=is_favorite.lower() == 'true')
        
        # Filter by tags (comma-separated)
        tags = self.request.query_params.get('tags')
        if tags:
            tag_list = [tag.strip() for tag in tags.split(',')]
            for tag in tag_list:
                queryset = queryset.filter(tags__contains=[tag])
        
        return queryset.select_related('user')
    
    @action(detail=False, methods=['get'])
    def favorites(self, request):
        """Get all favorited content"""
        queryset = self.get_queryset().filter(is_favorite=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle_favorite(self, request, pk=None):
        """Toggle favorite status"""
        content = self.get_object()
        content.is_favorite = not content.is_favorite
        content.save()
        serializer = self.get_serializer(content)
        return Response(serializer.data)


class UserJournalViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user journals, notes, observations, and AI conversations
    
    Endpoints:
    - GET /api/users/journals/ - List all journals
    - POST /api/users/journals/ - Create new journal entry
    - GET /api/users/journals/{id}/ - Get specific journal
    - PUT/PATCH /api/users/journals/{id}/ - Update journal
    - DELETE /api/users/journals/{id}/ - Delete journal
    
    Filters:
    - journal_type: note, observation, ai_conversation, discovery
    - related_content: filter by related content ID
    """
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return UserJournalListSerializer
        return UserJournalSerializer
    
    def get_queryset(self):
        queryset = UserJournal.objects.filter(user=self.request.user)
        
        # Filter by journal type
        journal_type = self.request.query_params.get('journal_type')
        if journal_type:
            queryset = queryset.filter(journal_type=journal_type)
        
        # Filter by related content
        related_content_id = self.request.query_params.get('related_content')
        if related_content_id:
            queryset = queryset.filter(related_content_id=related_content_id)
        
        return queryset.select_related('user', 'related_content')
    
    @action(detail=False, methods=['get'])
    def observations(self, request):
        """Get all observation journals with coordinates"""
        queryset = self.get_queryset().filter(
            journal_type='observation'
        ).exclude(
            Q(coordinates__isnull=True) | Q(coordinates={})
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def ai_conversations(self, request):
        """Get all Murph AI conversation journals"""
        queryset = self.get_queryset().filter(journal_type='ai_conversation')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class UserCollectionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user collections (playlists of saved content)
    
    Endpoints:
    - GET /api/users/collections/ - List all collections
    - POST /api/users/collections/ - Create new collection
    - GET /api/users/collections/{id}/ - Get collection with items
    - PUT/PATCH /api/users/collections/{id}/ - Update collection
    - DELETE /api/users/collections/{id}/ - Delete collection
    """
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return UserCollectionListSerializer
        return UserCollectionSerializer
    
    def get_queryset(self):
        return UserCollection.objects.filter(user=self.request.user).prefetch_related('items')
    
    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        """Add item to collection"""
        collection = self.get_object()
        content_id = request.data.get('content_id')
        
        try:
            content = UserContent.objects.get(id=content_id, user=request.user)
            collection.items.add(content)
            serializer = self.get_serializer(collection)
            return Response(serializer.data)
        except UserContent.DoesNotExist:
            return Response(
                {'error': 'Content not found or does not belong to user'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def remove_item(self, request, pk=None):
        """Remove item from collection"""
        collection = self.get_object()
        content_id = request.data.get('content_id')
        
        try:
            content = UserContent.objects.get(id=content_id, user=request.user)
            collection.items.remove(content)
            serializer = self.get_serializer(collection)
            return Response(serializer.data)
        except UserContent.DoesNotExist:
            return Response(
                {'error': 'Content not found or does not belong to user'},
                status=status.HTTP_404_NOT_FOUND
            )


class UserSubscriptionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user subscriptions to events and notifications
    
    Endpoints:
    - GET /api/users/subscriptions/ - List all subscriptions
    - POST /api/users/subscriptions/ - Create new subscription
    - GET /api/users/subscriptions/{id}/ - Get specific subscription
    - PUT/PATCH /api/users/subscriptions/{id}/ - Update subscription settings
    - DELETE /api/users/subscriptions/{id}/ - Remove subscription
    """
    serializer_class = UserSubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'event_date']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = UserSubscription.objects.filter(user=self.request.user)
        
        # Filter by active subscriptions
        active_only = self.request.query_params.get('active_only')
        if active_only and active_only.lower() == 'true':
            queryset = queryset.filter(is_active=True)
        
        # Filter by notification type
        notify_email = self.request.query_params.get('notify_email')
        if notify_email is not None:
            queryset = queryset.filter(notify_email=notify_email.lower() == 'true')
        
        notify_in_app = self.request.query_params.get('notify_in_app')
        if notify_in_app is not None:
            queryset = queryset.filter(notify_in_app=notify_in_app.lower() == 'true')
        
        return queryset.select_related('user')
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle subscription active status"""
        subscription = self.get_object()
        subscription.is_active = not subscription.is_active
        subscription.save()
        serializer = self.get_serializer(subscription)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming active subscriptions"""
        from django.utils import timezone
        queryset = self.get_queryset().filter(
            is_active=True,
            event_date__gte=timezone.now()
        ).order_by('event_date')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class UserActivityViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing user activity log (read-only)
    
    Endpoints:
    - GET /api/users/activities/ - List all activities
    - GET /api/users/activities/{id}/ - Get specific activity
    """
    serializer_class = UserActivitySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['timestamp']
    ordering = ['-timestamp']
    
    def get_queryset(self):
        queryset = UserActivity.objects.filter(user=self.request.user)
        
        # Filter by activity type
        activity_type = self.request.query_params.get('activity_type')
        if activity_type:
            queryset = queryset.filter(activity_type=activity_type)
        
        # Limit results for performance
        limit = self.request.query_params.get('limit')
        if limit:
            try:
                queryset = queryset[:int(limit)]
            except ValueError:
                pass
        
        return queryset.select_related('user', 'content')
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent activities (last 50)"""
        queryset = self.get_queryset()[:50]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class UserProfileView(APIView):
    """
    Get comprehensive user profile with all aggregated stats
    
    Endpoint:
    - GET /api/users/profile/ - Get user profile with stats
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserProfileSerializer(request.user, context={'request': request})
        return Response(serializer.data)