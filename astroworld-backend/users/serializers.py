from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

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

from .models import UserContent, UserJournal, UserCollection, UserSubscription, UserActivity


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