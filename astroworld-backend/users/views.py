from rest_framework import generics, permissions, status, viewsets, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .serializers import (
    RegisterSerializer, UserSerializer, UserContentSerializer, UserContentListSerializer,
    UserJournalSerializer, UserJournalListSerializer, UserCollectionSerializer,
    UserCollectionListSerializer, UserSubscriptionSerializer, UserActivitySerializer,
    UserProfileSerializer, PublicUserSerializer
)
from .models import (
    UserContent, UserJournal, UserCollection, UserSubscription, UserActivity, 
    PasswordResetToken
)
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q
from datetime import timedelta
from django.utils import timezone

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
        
        if not email:
            return Response({"detail": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email, is_active=True)
            
            # Create password reset token
            reset_token = PasswordResetToken.objects.create(
                user=user,
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            # Create reset URL with our custom token
            reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token.token}"
            
            # Email content
            subject = "Reset Your ASTROWORLD Password"
            message = f"""
Hello {user.full_name or user.username},

You requested a password reset for your ASTROWORLD account. Click the link below to reset your password:

{reset_url}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email.

Best regards,
The ASTROWORLD Team
            """.strip()
            
            try:
                # Check if we're using console backend
                if settings.EMAIL_BACKEND == 'django.core.mail.backends.console.EmailBackend':
                    print(f"\n{'='*60}")
                    print(f"PASSWORD RESET EMAIL FOR: {user.email}")
                    print(f"Reset URL: {reset_url}")
                    print(f"Token: {reset_token.token}")
                    print(f"{'='*60}\n")
                else:
                    send_mail(
                        subject,
                        message,
                        settings.DEFAULT_FROM_EMAIL,
                        [user.email],
                        fail_silently=False
                    )
                    print(f"Password reset email sent to {user.email}")
            
            except Exception as e:
                print(f"Failed to send password reset email to {user.email}: {str(e)}")
                # Don't reveal that the email failed to send for security
        
        except User.DoesNotExist:
            # Don't reveal whether the email exists or not for security
            pass
        
        return Response({
            "detail": "If the email exists and is verified, a password reset link has been sent."
        })
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        new_password2 = request.data.get('new_password2')
        
        if not all([token, new_password, new_password2]):
            return Response({
                "detail": "Token, new password, and password confirmation are required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if new_password != new_password2:
            return Response({
                "detail": "Passwords do not match"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Validate password strength
            validate_password(new_password)
        except DjangoValidationError as e:
            return Response({
                "detail": list(e.messages)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            reset_token = PasswordResetToken.objects.get(token=token)
            
            if not reset_token.is_valid():
                return Response({
                    "detail": "Token has expired or has already been used"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Reset the password
            user = reset_token.user
            user.set_password(new_password)
            user.save()
            
            # Mark token as used
            reset_token.mark_as_used()
            
            # Clean up old tokens for this user
            PasswordResetToken.objects.filter(
                user=user,
                is_used=True
            ).delete()
            
            return Response({
                "detail": "Password has been reset successfully. You can now log in with your new password."
            })
        
        except PasswordResetToken.DoesNotExist:
            return Response({
                "detail": "Invalid token"
            }, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        remember_me = request.data.get('remember_me', False)
        
        if not all([username, password]):
            return Response({
                "detail": "Username and password are required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(username=username, password=password)
        
        if user is None:
            return Response({
                "detail": "Invalid credentials"
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        if not user.is_active:
            return Response({
                "detail": "Account is not active. Please verify your email."
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token
        
        # Extend token lifetime if remember me is checked
        if remember_me:
            # Extend refresh token to 30 days
            refresh.set_exp(lifetime=timedelta(days=30))
            # Extend access token to 1 day
            access.set_exp(lifetime=timedelta(days=1))
        
        # Update last login
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        
        return Response({
            'access': str(access),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'full_name': user.full_name,
                'profile_picture': user.profile_picture,
                'email_verified': user.email_verified,
            }
        })


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Logged out successfully"})
        except Exception:
            return Response({"detail": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        new_password2 = request.data.get('new_password2')
        
        if not all([current_password, new_password, new_password2]):
            return Response({
                "detail": "Current password, new password, and password confirmation are required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        
        # Verify current password
        if not user.check_password(current_password):
            return Response({
                "detail": "Current password is incorrect"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if new passwords match
        if new_password != new_password2:
            return Response({
                "detail": "New passwords do not match"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if new password is different from current
        if user.check_password(new_password):
            return Response({
                "detail": "New password must be different from current password"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Validate password strength
            validate_password(new_password, user)
        except DjangoValidationError as e:
            return Response({
                "detail": list(e.messages)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Set new password
        user.set_password(new_password)
        user.save()
        
        return Response({
            "detail": "Password changed successfully"
        })

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
        
        return queryset.select_related('user')
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent activities (last 50)"""
        queryset = self.get_queryset()[:50]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class UserProfileView(APIView):
    """
    Get and update comprehensive user profile with all aggregated stats
    
    Endpoints:
    - GET /api/users/profile/ - Get user profile with stats
    - PATCH /api/users/profile/ - Update user profile
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserProfileSerializer(request.user, context={'request': request})
        return Response(serializer.data)
    
    def patch(self, request):
        """Update user profile"""
        user = request.user
        allowed_fields = ['full_name', 'bio', 'profile_picture']
        
        # Update only allowed fields
        for field in allowed_fields:
            if field in request.data:
                setattr(user, field, request.data[field])
        
        user.save()
        serializer = UserProfileSerializer(user, context={'request': request})
        return Response(serializer.data)


class PublicProfileView(APIView):
    """
    Get public profile information for any user
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, user_id):
        """Get public profile for a specific user"""
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = PublicUserSerializer(user, context={'request': request})
        return Response(serializer.data)


# =====================================================
# MESSAGING VIEWS
# =====================================================

class MessageThreadListView(APIView):
    """
    List all message threads for the current user
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        from .models import MessageThread
        from .serializers import MessageThreadSerializer
        
        user = request.user
        threads = MessageThread.objects.filter(
            Q(user1=user) | Q(user2=user)
        ).select_related('user1', 'user2', 'last_message').order_by('-last_activity')
        
        serializer = MessageThreadSerializer(threads, many=True, context={'request': request})
        return Response(serializer.data)


class MessageThreadDetailView(APIView):
    """
    Get messages in a specific thread
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, thread_id):
        from .models import MessageThread, UserMessage
        from .serializers import UserMessageSerializer, MessageThreadSerializer
        
        user = request.user
        
        try:
            thread = MessageThread.objects.get(
                id=thread_id
            )
            # Check if user is part of this thread
            if thread.user1 != user and thread.user2 != user:
                return Response({'error': 'Thread not found'}, status=status.HTTP_404_NOT_FOUND)
        except MessageThread.DoesNotExist:
            return Response({'error': 'Thread not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get messages in this thread
        messages = UserMessage.objects.filter(
            Q(sender=thread.user1, recipient=thread.user2) |
            Q(sender=thread.user2, recipient=thread.user1)
        ).order_by('created_at')
        
        # Mark messages as read for current user
        unread_messages = messages.filter(recipient=user, is_read=False)
        for message in unread_messages:
            message.mark_as_read()
        
        # Reset unread count for current user
        thread.reset_unread_count(user)
        
        message_serializer = UserMessageSerializer(messages, many=True)
        thread_serializer = MessageThreadSerializer(thread, context={'request': request})
        
        return Response({
            'thread': thread_serializer.data,
            'messages': message_serializer.data
        })


class SendMessageView(APIView):
    """
    Send a message to another user
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        from .models import MessageThread, UserMessage
        from .serializers import UserMessageSerializer
        
        sender = request.user
        recipient_id = request.data.get('recipient_id')
        message_content = request.data.get('message', '').strip()
        
        if not recipient_id or not message_content:
            return Response(
                {'error': 'recipient_id and message are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            recipient = User.objects.get(id=recipient_id)
        except User.DoesNotExist:
            return Response({'error': 'Recipient not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if sender == recipient:
            return Response({'error': 'Cannot send message to yourself'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get or create thread
        thread, created = MessageThread.get_or_create_thread(sender, recipient)
        
        # Create message
        message = UserMessage.objects.create(
            sender=sender,
            recipient=recipient,
            message=message_content
        )
        
        # Update thread
        thread.last_message = message
        thread.increment_unread_count(recipient)
        thread.save()
        
        serializer = UserMessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UserMessagesView(APIView):
    """
    Get messages between current user and another user
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, user_id):
        from .models import UserMessage
        from .serializers import UserMessageSerializer
        
        current_user = request.user
        
        try:
            other_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get messages between these two users
        messages = UserMessage.objects.filter(
            Q(sender=current_user, recipient=other_user) |
            Q(sender=other_user, recipient=current_user)
        ).order_by('created_at')
        
        # Mark messages from other user as read
        unread_messages = messages.filter(sender=other_user, recipient=current_user, is_read=False)
        for message in unread_messages:
            message.mark_as_read()
        
        serializer = UserMessageSerializer(messages, many=True)
        return Response(serializer.data)