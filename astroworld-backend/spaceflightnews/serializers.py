from rest_framework import serializers
from .models import SpaceflightNews, NewsAuthor, UserNewsPreference
from nasa_api.models import UserSavedItem

class NewsAuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsAuthor
        fields = ['name', 'socials']

class SpaceflightNewsSerializer(serializers.ModelSerializer):
    is_saved = serializers.SerializerMethodField()
    author_objects = NewsAuthorSerializer(many=True, read_only=True, source='get_authors')
    
    class Meta:
        model = SpaceflightNews
        fields = [
            'id', 'nasa_id', 'title', 'authors', 'author_objects', 'url', 
            'image_url', 'news_site', 'summary', 'published_at', 'featured',
            'launches', 'events', 'article_type', 'created_at', 'updated_at',
            'is_saved'
        ]
    
    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserSavedItem.objects.filter(
                user=request.user,
                item_type='news',
                item_id=obj.nasa_id
            ).exists()
        return False

class UserNewsPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserNewsPreference
        fields = ['preferred_news_sites', 'keywords', 'enable_notifications']