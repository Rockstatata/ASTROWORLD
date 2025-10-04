from django.contrib import admin
from .models import SpaceflightNews, NewsAuthor, UserNewsPreference

@admin.register(SpaceflightNews)
class SpaceflightNewsAdmin(admin.ModelAdmin):
    list_display = ['title', 'news_site', 'article_type', 'featured', 'published_at', 'created_at']
    list_filter = ['article_type', 'featured', 'news_site', 'published_at']
    search_fields = ['title', 'summary', 'news_site']
    readonly_fields = ['nasa_id', 'created_at', 'updated_at']
    ordering = ['-published_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'summary', 'url', 'image_url')
        }),
        ('Classification', {
            'fields': ('article_type', 'featured', 'news_site')
        }),
        ('Dates', {
            'fields': ('published_at', 'created_at', 'updated_at')
        }),
        ('Metadata', {
            'fields': ('nasa_id', 'authors', 'launches', 'events'),
            'classes': ('collapse',)
        }),
    )

@admin.register(NewsAuthor)
class NewsAuthorAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']
    readonly_fields = ['created_at']

@admin.register(UserNewsPreference)  
class UserNewsPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'enable_notifications', 'created_at', 'updated_at']
    list_filter = ['enable_notifications', 'created_at']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['created_at', 'updated_at']
