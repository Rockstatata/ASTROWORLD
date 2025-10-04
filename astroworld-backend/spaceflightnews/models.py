from django.db import models
from nasa_api.models import BaseNASAModel
from users.models import User

class SpaceflightNews(BaseNASAModel):
    """Spaceflight News Articles from SNAPI"""
    title = models.CharField(max_length=500)
    authors = models.JSONField(default=list)  # List of author objects
    url = models.URLField()
    image_url = models.URLField(max_length=500, blank=True)
    news_site = models.CharField(max_length=100)
    summary = models.TextField()
    published_at = models.DateTimeField()
    featured = models.BooleanField(default=False)
    launches = models.JSONField(default=list)  # Related launches
    events = models.JSONField(default=list)  # Related events
    article_type = models.CharField(max_length=20, choices=[
        ('article', 'Article'),
        ('blog', 'Blog'),
        ('report', 'Report')
    ], default='article')
    
    class Meta:
        verbose_name = "Spaceflight News"
        verbose_name_plural = "Spaceflight News"
        ordering = ['-published_at']

    def get_authors(self):
        """Get NewsAuthor objects for this article"""
        author_names = [author.get('name') for author in self.authors if isinstance(author, dict) and 'name' in author]
        return NewsAuthor.objects.filter(name__in=author_names)

class NewsAuthor(models.Model):
    """Authors of spaceflight news"""
    name = models.CharField(max_length=500, unique=True)
    socials = models.JSONField(default=dict, blank=True, null=True)  # Social media links - allow null
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class UserNewsPreference(models.Model):
    """User preferences for news filtering"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='news_preferences')
    preferred_news_sites = models.JSONField(default=list)  # List of preferred news sites
    keywords = models.JSONField(default=list)  # Keywords for filtering
    enable_notifications = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
