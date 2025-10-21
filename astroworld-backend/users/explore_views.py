"""
Explore Page Views
Handles API endpoints for discovering users, papers, journals, and social interactions
"""
from rest_framework import viewsets, filters, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Count
from django.contrib.auth import get_user_model
from rest_framework.pagination import PageNumberPagination

from users.models import (
    ResearchPaper, UserPaper, UserFollower, Like, Comment, UserJournal
)
from users.serializers import (
    ResearchPaperSerializer, ResearchPaperListSerializer,
    UserPaperSerializer, UserFollowerSerializer, PublicUserSerializer,
    LikeSerializer, CommentSerializer, PublicJournalSerializer
)

User = get_user_model()


class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class ExploreUsersViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for discovering public user profiles
    
    Endpoints:
    - GET /api/explore/users/ - List all public users
    - GET /api/explore/users/{id}/ - Get specific user profile
    
    Filters:
    - search: Search by username or full_name
    - ordering: Sort by date_joined, followers_count
    """
    serializer_class = PublicUserSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'full_name', 'bio']
    ordering_fields = ['date_joined']
    ordering = ['-date_joined']
    pagination_class = StandardPagination
    
    def get_queryset(self):
        # Exclude current user from list
        queryset = User.objects.filter(is_active=True)
        if self.request.user.is_authenticated:
            queryset = queryset.exclude(id=self.request.user.id)
        return queryset.annotate(
            followers_count=Count('followers')
        )


class ExplorePapersViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for discovering research papers
    
    Endpoints:
    - GET /api/explore/papers/ - List all papers
    - GET /api/explore/papers/{id}/ - Get specific paper
    
    Filters:
    - source: arxiv, nasa_ads, crossref
    - search: Search by title, authors, abstract
    - ordering: Sort by published_date, save_count, citation_count
    """
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'authors', 'abstract', 'categories']
    ordering_fields = ['published_date', 'save_count', 'citation_count']
    ordering = ['-published_date']
    pagination_class = StandardPagination
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ResearchPaperListSerializer
        return ResearchPaperSerializer
    
    def get_queryset(self):
        queryset = ResearchPaper.objects.all()
        
        # Filter by source
        source = self.request.query_params.get('source')
        if source:
            queryset = queryset.filter(source=source)
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(categories__contains=[category])
        
        return queryset


class ExploreJournalsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for discovering public journals and observations
    
    Endpoints:
    - GET /api/explore/journals/ - List all public journals
    - GET /api/explore/journals/{id}/ - Get specific journal
    
    Filters:
    - journal_type: note, observation, ai_conversation, discovery
    - search: Search by title, content, tags
    """
    serializer_class = PublicJournalSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content', 'tags']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    pagination_class = StandardPagination
    
    def get_queryset(self):
        queryset = UserJournal.objects.filter(is_public=True)
        
        # Filter by journal type
        journal_type = self.request.query_params.get('journal_type')
        if journal_type:
            queryset = queryset.filter(journal_type=journal_type)
        
        return queryset.select_related('user').annotate(
            like_count=Count('id')  # Will be computed properly in serializer
        )


class UserPaperViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user's saved research papers
    
    Endpoints:
    - GET /api/explore/my-papers/ - List user's saved papers
    - POST /api/explore/my-papers/ - Save a paper
    - GET /api/explore/my-papers/{id}/ - Get saved paper with notes
    - PATCH /api/explore/my-papers/{id}/ - Update notes/tags
    - DELETE /api/explore/my-papers/{id}/ - Remove saved paper
    """
    serializer_class = UserPaperSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = UserPaper.objects.filter(user=self.request.user)
        
        # Filter by favorite
        is_favorite = self.request.query_params.get('is_favorite')
        if is_favorite is not None:
            queryset = queryset.filter(is_favorite=is_favorite.lower() == 'true')
        
        # Filter by read status
        read_status = self.request.query_params.get('read_status')
        if read_status:
            queryset = queryset.filter(read_status=read_status)
        
        return queryset.select_related('paper', 'user')
    
    def perform_destroy(self, instance):
        # Decrement save count when unsaving
        paper = instance.paper
        if paper.save_count > 0:
            paper.save_count -= 1
            paper.save()
        instance.delete()
    
    @action(detail=True, methods=['post'])
    def toggle_favorite(self, request, pk=None):
        """Toggle favorite status for saved paper"""
        user_paper = self.get_object()
        user_paper.is_favorite = not user_paper.is_favorite
        user_paper.save()
        serializer = self.get_serializer(user_paper)
        return Response(serializer.data)


class FollowViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user follow relationships
    
    Endpoints:
    - GET /api/explore/following/ - List users I'm following
    - GET /api/explore/followers/ - List my followers
    - POST /api/explore/follow/ - Follow a user
    - DELETE /api/explore/follow/{id}/ - Unfollow a user
    """
    serializer_class = UserFollowerSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Default: show who current user is following
        return UserFollower.objects.filter(follower=self.request.user)
    
    def create(self, request):
        """Follow a user"""
        following_id = request.data.get('following_id')
        
        if not following_id:
            return Response(
                {'error': 'following_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Can't follow yourself
        if int(following_id) == request.user.id:
            return Response(
                {'error': 'Cannot follow yourself'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            following_user = User.objects.get(id=following_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if already following
        existing = UserFollower.objects.filter(
            follower=request.user,
            following=following_user
        ).first()
        
        if existing:
            return Response(
                {'message': 'Already following this user'},
                status=status.HTTP_200_OK
            )
        
        # Create follow relationship
        follow = UserFollower.objects.create(
            follower=request.user,
            following=following_user
        )
        
        serializer = self.get_serializer(follow)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def followers(self, request):
        """Get list of users following me"""
        followers = UserFollower.objects.filter(following=request.user)
        serializer = self.get_serializer(followers, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def unfollow(self, request):
        """Unfollow a user"""
        following_id = request.data.get('following_id')
        
        if not following_id:
            return Response(
                {'error': 'following_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        deleted = UserFollower.objects.filter(
            follower=request.user,
            following_id=following_id
        ).delete()
        
        if deleted[0] > 0:
            return Response({'message': 'Unfollowed successfully'})
        else:
            return Response(
                {'error': 'Not following this user'},
                status=status.HTTP_404_NOT_FOUND
            )


class LikeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing likes on journals, papers, and comments
    
    Endpoints:
    - POST /api/explore/like/ - Like an item
    - DELETE /api/explore/like/{id}/ - Unlike an item
    - GET /api/explore/likes/?target_type=journal&target_id=123 - Get likes for an item
    """
    serializer_class = LikeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Like.objects.filter(user=self.request.user)
        
        # Filter by target
        target_type = self.request.query_params.get('target_type')
        target_id = self.request.query_params.get('target_id')
        
        if target_type and target_id:
            queryset = queryset.filter(target_type=target_type, target_id=target_id)
        
        return queryset.select_related('user')
    
    def create(self, request):
        """Like an item"""
        target_type = request.data.get('target_type')
        target_id = request.data.get('target_id')
        
        if not target_type or not target_id:
            return Response(
                {'error': 'target_type and target_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if already liked
        existing = Like.objects.filter(
            user=request.user,
            target_type=target_type,
            target_id=target_id
        ).first()
        
        if existing:
            return Response(
                {'message': 'Already liked'},
                status=status.HTTP_200_OK
            )
        
        # Create like
        like = Like.objects.create(
            user=request.user,
            target_type=target_type,
            target_id=target_id
        )
        
        serializer = self.get_serializer(like)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def unlike(self, request):
        """Unlike an item"""
        target_type = request.data.get('target_type')
        target_id = request.data.get('target_id')
        
        if not target_type or not target_id:
            return Response(
                {'error': 'target_type and target_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        deleted = Like.objects.filter(
            user=request.user,
            target_type=target_type,
            target_id=target_id
        ).delete()
        
        if deleted[0] > 0:
            return Response({'message': 'Unliked successfully'})
        else:
            return Response(
                {'error': 'Not liked'},
                status=status.HTTP_404_NOT_FOUND
            )


class CommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing comments and discussions
    
    Endpoints:
    - GET /api/explore/comments/?target_type=journal&target_id=123 - Get comments
    - POST /api/explore/comments/ - Create comment
    - PATCH /api/explore/comments/{id}/ - Update comment
    - DELETE /api/explore/comments/{id}/ - Delete comment
    """
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.OrderingFilter]
    ordering = ['created_at']
    
    def get_queryset(self):
        queryset = Comment.objects.all()
        
        # Filter by target
        target_type = self.request.query_params.get('target_type')
        target_id = self.request.query_params.get('target_id')
        
        if target_type and target_id:
            # Only get top-level comments (no parent)
            queryset = queryset.filter(
                target_type=target_type,
                target_id=target_id,
                parent__isnull=True
            )
        
        return queryset.select_related('user').prefetch_related('replies')
    
    def perform_update(self, serializer):
        # Only allow user to update their own comments
        if serializer.instance.user != self.request.user:
            raise permissions.PermissionDenied("You can only edit your own comments")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only allow user to delete their own comments
        if instance.user != self.request.user:
            raise permissions.PermissionDenied("You can only delete your own comments")
        instance.delete()
