from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

# Import models for serializers
from .models import (
    UserContent, UserJournal, UserCollection, UserSubscription, 
    UserActivity, UserFollower, ResearchPaper, UserPaper, 
    Like, Comment, UserMessage, MessageThread
)

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'password', 'password2')

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        # Email uniqueness check
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "Email already registered."})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        
        # Create full_name from first_name + last_name
        first_name = validated_data.get('first_name', '').strip()
        last_name = validated_data.get('last_name', '').strip()
        full_name = f"{first_name} {last_name}".strip()
        
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=first_name,
            last_name=last_name,
            full_name=full_name,
            is_active=False  # Email verification required
        )
        user.set_password(password)
        user.save()
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'full_name', 
                  'bio', 'profile_picture', 'email_verified', 'date_joined')
        read_only_fields = ('email_verified', 'id', 'date_joined')


# ========== User Interaction Serializers ==========

class UserContentSerializer(serializers.ModelSerializer):
    """Serializer for saved NASA content"""
    
    class Meta:
        model = UserContent
        fields = [
            'id', 'content_type', 'content_id', 'title', 'description',
            'thumbnail_url', 'source_url', 'notes', 'tags', 'is_favorite',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Automatically set user from request context
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class UserContentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing content"""
    
    class Meta:
        model = UserContent
        fields = [
            'id', 'content_type', 'content_id', 'title', 
            'thumbnail_url', 'is_favorite', 'created_at'
        ]


class UserJournalSerializer(serializers.ModelSerializer):
    """Serializer for user journals and notes"""
    related_content = UserContentListSerializer(read_only=True)
    related_content_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = UserJournal
        fields = [
            'id', 'journal_type', 'title', 'content', 'related_content',
            'related_content_id', 'coordinates', 'observation_date',
            'location', 'ai_conversation_data', 'tags', 'mood', 'is_public',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        related_content_id = validated_data.pop('related_content_id', None)
        
        if related_content_id:
            try:
                related_content = UserContent.objects.get(
                    id=related_content_id,
                    user=self.context['request'].user
                )
                validated_data['related_content'] = related_content
            except UserContent.DoesNotExist:
                pass
        
        return super().create(validated_data)


class UserJournalListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing journals"""
    
    class Meta:
        model = UserJournal
        fields = [
            'id', 'journal_type', 'title', 'tags', 
            'observation_date', 'created_at'
        ]


class UserCollectionSerializer(serializers.ModelSerializer):
    """Serializer for user collections"""
    items = UserContentListSerializer(many=True, read_only=True)
    item_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    item_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = UserCollection
        fields = [
            'id', 'name', 'description', 'cover_image', 'items', 'item_ids',
            'item_count', 'is_public', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'item_count']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        item_ids = validated_data.pop('item_ids', [])
        
        collection = super().create(validated_data)
        
        if item_ids:
            items = UserContent.objects.filter(
                id__in=item_ids,
                user=self.context['request'].user
            )
            collection.items.set(items)
        
        return collection
    
    def update(self, instance, validated_data):
        item_ids = validated_data.pop('item_ids', None)
        
        collection = super().update(instance, validated_data)
        
        if item_ids is not None:
            items = UserContent.objects.filter(
                id__in=item_ids,
                user=self.context['request'].user
            )
            collection.items.set(items)
        
        return collection


class UserCollectionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing collections"""
    item_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = UserCollection
        fields = ['id', 'name', 'cover_image', 'item_count', 'is_public', 'updated_at']


class UserSubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for event subscriptions"""
    
    class Meta:
        model = UserSubscription
        fields = [
            'id', 'subscription_type', 'event_id', 'event_name', 'event_date',
            'notify_email', 'notify_in_app', 'notify_before', 'notes',
            'is_active', 'created_at', 'last_notified'
        ]
        read_only_fields = ['id', 'created_at', 'last_notified']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class UserActivitySerializer(serializers.ModelSerializer):
    """Serializer for user activity log"""
    
    class Meta:
        model = UserActivity
        fields = ['id', 'activity_type', 'description', 'metadata', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserProfileSerializer(serializers.ModelSerializer):
    """Complete user profile with stats"""
    saved_content_count = serializers.SerializerMethodField()
    journals_count = serializers.SerializerMethodField()
    collections_count = serializers.SerializerMethodField()
    subscriptions_count = serializers.SerializerMethodField()
    recent_activities = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'full_name', 'bio', 'profile_picture',
            'date_joined', 'saved_content_count', 'journals_count',
            'collections_count', 'subscriptions_count', 'recent_activities'
        ]
        read_only_fields = ['id', 'date_joined']
    
    def get_saved_content_count(self, obj):
        return obj.saved_content.count()
    
    def get_journals_count(self, obj):
        return obj.journals.count()
    
    def get_collections_count(self, obj):
        return obj.collections.count()
    
    def get_subscriptions_count(self, obj):
        return obj.subscriptions.filter(is_active=True).count()
    
    def get_recent_activities(self, obj):
        activities = obj.activities.all()[:10]
        return UserActivitySerializer(activities, many=True).data


# =====================================================
# EXPLORE PAGE SERIALIZERS
# =====================================================

class ResearchPaperSerializer(serializers.ModelSerializer):
    """Serializer for research papers"""
    is_saved = serializers.SerializerMethodField()
    user_save_id = serializers.SerializerMethodField()
    
    class Meta:
        model = ResearchPaper
        fields = [
            'id', 'paper_id', 'source', 'title', 'authors', 'abstract',
            'published_date', 'journal', 'pdf_url', 'external_url', 'doi',
            'categories', 'keywords', 'citation_count', 'save_count',
            'is_saved', 'user_save_id', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'save_count']
    
    def get_is_saved(self, obj):
        """Check if current user has saved this paper"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserPaper.objects.filter(user=request.user, paper=obj).exists()
        return False
    
    def get_user_save_id(self, obj):
        """Get the UserPaper ID if saved"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            user_paper = UserPaper.objects.filter(user=request.user, paper=obj).first()
            return user_paper.id if user_paper else None
        return None


class ResearchPaperListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing papers"""
    is_saved = serializers.SerializerMethodField()
    user_save_id = serializers.SerializerMethodField()
    
    class Meta:
        model = ResearchPaper
        fields = [
            'id', 'paper_id', 'source', 'title', 'authors',
            'published_date', 'journal', 'save_count', 'is_saved', 'user_save_id'
        ]
    
    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserPaper.objects.filter(user=request.user, paper=obj).exists()
        return False
    
    def get_user_save_id(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            user_paper = UserPaper.objects.filter(user=request.user, paper=obj).first()
            return user_paper.id if user_paper else None
        return None


class UserPaperSerializer(serializers.ModelSerializer):
    """Serializer for user's saved papers with notes"""
    paper = ResearchPaperListSerializer(read_only=True)
    paper_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = UserPaper
        fields = [
            'id', 'paper', 'paper_id', 'notes', 'tags', 'is_favorite',
            'read_status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        paper_id = validated_data.pop('paper_id')
        
        try:
            paper = ResearchPaper.objects.get(id=paper_id)
            validated_data['paper'] = paper
            
            # Check if already saved
            existing = UserPaper.objects.filter(user=self.context['request'].user, paper=paper).first()
            if existing:
                # Return existing record instead of creating duplicate
                return existing
            
            # Increment save count
            paper.save_count += 1
            paper.save()
            
            return super().create(validated_data)
        except ResearchPaper.DoesNotExist:
            raise serializers.ValidationError({'paper_id': 'Research paper not found'})


class UserFollowerSerializer(serializers.ModelSerializer):
    """Serializer for follower relationships"""
    follower_username = serializers.CharField(source='follower.username', read_only=True)
    following_username = serializers.CharField(source='following.username', read_only=True)
    follower_profile = serializers.SerializerMethodField()
    following_profile = serializers.SerializerMethodField()
    
    class Meta:
        model = UserFollower
        fields = [
            'id', 'follower', 'following', 'follower_username', 'following_username',
            'follower_profile', 'following_profile', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_follower_profile(self, obj):
        return {
            'id': obj.follower.id,
            'username': obj.follower.username,
            'full_name': obj.follower.full_name,
            'profile_picture': obj.follower.profile_picture,
            'bio': obj.follower.bio,
        }
    
    def get_following_profile(self, obj):
        return {
            'id': obj.following.id,
            'username': obj.following.username,
            'full_name': obj.following.full_name,
            'profile_picture': obj.following.profile_picture,
            'bio': obj.following.bio,
        }


class PublicUserSerializer(serializers.ModelSerializer):
    """Serializer for public user profiles in Explore"""
    is_following = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    public_journals_count = serializers.SerializerMethodField()
    public_collections_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'full_name', 'bio', 'profile_picture',
            'date_joined', 'is_following', 'followers_count', 'following_count',
            'public_journals_count', 'public_collections_count'
        ]
    
    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserFollower.objects.filter(
                follower=request.user,
                following=obj
            ).exists()
        return False
    
    def get_followers_count(self, obj):
        return obj.followers.count()
    
    def get_following_count(self, obj):
        return obj.following.count()
    
    def get_public_journals_count(self, obj):
        return obj.journals.filter(is_public=True).count()
    
    def get_public_collections_count(self, obj):
        return obj.collections.filter(is_public=True).count()


class LikeSerializer(serializers.ModelSerializer):
    """Serializer for likes"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Like
        fields = ['id', 'user', 'user_username', 'target_type', 'target_id', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for comments and discussions"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_profile_picture = serializers.CharField(source='user.profile_picture', read_only=True)
    replies = serializers.SerializerMethodField()
    like_count = serializers.IntegerField(read_only=True)
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = [
            'id', 'user', 'user_username', 'user_profile_picture',
            'target_type', 'target_id', 'text', 'parent',
            'replies', 'like_count', 'is_liked', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(obj.replies.all(), many=True, context=self.context).data
        return []
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(
                user=request.user,
                target_type='comment',
                target_id=obj.id
            ).exists()
        return False
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class PublicJournalSerializer(serializers.ModelSerializer):
    """Serializer for public journals in Explore"""
    author_username = serializers.CharField(source='user.username', read_only=True)
    author_profile_picture = serializers.CharField(source='user.profile_picture', read_only=True)
    like_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = UserJournal
        fields = [
            'id', 'author_username', 'author_profile_picture', 'journal_type',
            'title', 'content', 'coordinates', 'observation_date', 'tags',
            'like_count', 'comment_count', 'is_liked', 'created_at'
        ]
    
    def get_like_count(self, obj):
        return Like.objects.filter(target_type='journal', target_id=obj.id).count()
    
    def get_comment_count(self, obj):
        return Comment.objects.filter(target_type='journal', target_id=obj.id).count()
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(
                user=request.user,
                target_type='journal',
                target_id=obj.id
            ).exists()
        return False


# =====================================================
# MESSAGING SERIALIZERS
# =====================================================

class UserMessageSerializer(serializers.ModelSerializer):
    """Serializer for user messages"""
    sender = UserSerializer(read_only=True)
    recipient = UserSerializer(read_only=True)
    
    class Meta:
        model = UserMessage
        fields = [
            'id', 'sender', 'recipient', 'message', 'is_read', 
            'read_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class UserMessageListSerializer(serializers.ModelSerializer):
    """Simplified serializer for message lists"""
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    recipient_username = serializers.CharField(source='recipient.username', read_only=True)
    
    class Meta:
        model = UserMessage
        fields = [
            'id', 'sender_username', 'recipient_username', 'message', 
            'is_read', 'created_at'
        ]

class MessageThreadSerializer(serializers.ModelSerializer):
    """Serializer for message threads"""
    user1 = UserSerializer(read_only=True)
    user2 = UserSerializer(read_only=True)
    last_message = UserMessageListSerializer(read_only=True)
    other_user = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = MessageThread
        fields = [
            'id', 'user1', 'user2', 'other_user', 'last_message', 
            'last_activity', 'unread_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_other_user(self, obj):
        """Get the other user in the thread (not the current user)"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            other_user = obj.get_other_user(request.user)
            return UserSerializer(other_user).data
        return None
    
    def get_unread_count(self, obj):
        """Get unread count for current user"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.get_unread_count(request.user)
        return 0