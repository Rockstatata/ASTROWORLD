from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    User, UserContent, UserJournal, UserCollection, UserSubscription, 
    UserActivity, UserFollower, ResearchPaper, UserPaper, Like, Comment,
    UserMessage, MessageThread, PasswordResetToken
)


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'full_name', 'email', 'date_joined', 'last_login', 'is_active', 'email_verified', 'is_superuser', 'content_count', 'journals_count')
    list_filter = ('is_active', 'is_superuser', 'email_verified', 'date_joined')
    search_fields = ('username', 'email', 'full_name')
    readonly_fields = ('date_joined', 'last_login')
    
    fieldsets = UserAdmin.fieldsets + (
        ('AstroWorld Profile', {'fields': ('full_name', 'bio', 'profile_picture', 'email_verified')}),
    )
    
    def content_count(self, obj):
        return obj.saved_content.count()
    content_count.short_description = 'Saved Content'
    
    def journals_count(self, obj):
        return obj.journals.count()
    journals_count.short_description = 'Journals'


@admin.register(UserContent)
class UserContentAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'content_type', 'is_favorite', 'created_at', 'view_content')
    list_filter = ('content_type', 'is_favorite', 'created_at')
    search_fields = ('title', 'description', 'user__username', 'notes')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'content_type', 'content_id', 'title', 'description')
        }),
        ('URLs', {
            'fields': ('thumbnail_url', 'source_url')
        }),
        ('User Annotations', {
            'fields': ('notes', 'tags', 'is_favorite')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at')
        })
    )
    
    def view_content(self, obj):
        if obj.source_url:
            return format_html('<a href="{}" target="_blank">View</a>', obj.source_url)
        return '-'
    view_content.short_description = 'External Link'


@admin.register(UserJournal)
class UserJournalAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'journal_type', 'is_public', 'created_at', 'has_coordinates')
    list_filter = ('journal_type', 'is_public', 'created_at', 'mood')
    search_fields = ('title', 'content', 'user__username')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'journal_type', 'title', 'content')
        }),
        ('Related Content', {
            'fields': ('related_content',)
        }),
        ('Observation Data', {
            'fields': ('coordinates', 'observation_date', 'location')
        }),
        ('AI Data', {
            'fields': ('ai_conversation_data',)
        }),
        ('Metadata', {
            'fields': ('tags', 'mood', 'is_public', 'created_at', 'updated_at')
        })
    )
    
    def has_coordinates(self, obj):
        return bool(obj.coordinates)
    has_coordinates.boolean = True
    has_coordinates.short_description = 'Has Coordinates'


@admin.register(UserCollection)
class UserCollectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'item_count', 'is_public', 'created_at')
    list_filter = ('is_public', 'created_at')
    search_fields = ('name', 'description', 'user__username')
    readonly_fields = ('created_at', 'updated_at', 'item_count')
    filter_horizontal = ('items',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'name', 'description', 'cover_image')
        }),
        ('Content', {
            'fields': ('items',)
        }),
        ('Settings', {
            'fields': ('is_public',)
        }),
        ('Statistics', {
            'fields': ('item_count',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at')
        })
    )


@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('event_name', 'user', 'subscription_type', 'event_date', 'is_active', 'notify_email', 'notify_in_app')
    list_filter = ('subscription_type', 'is_active', 'notify_email', 'notify_in_app', 'event_date')
    search_fields = ('event_name', 'user__username', 'event_id')
    readonly_fields = ('created_at', 'last_notified')
    date_hierarchy = 'event_date'
    
    fieldsets = (
        ('Event Information', {
            'fields': ('user', 'subscription_type', 'event_id', 'event_name', 'event_date')
        }),
        ('Notification Settings', {
            'fields': ('notify_email', 'notify_in_app', 'notify_before')
        }),
        ('Status', {
            'fields': ('is_active', 'notes')
        }),
        ('Tracking', {
            'fields': ('created_at', 'last_notified')
        })
    )


@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    list_display = ('user', 'activity_type', 'description', 'created_at')
    list_filter = ('activity_type', 'created_at')
    search_fields = ('user__username', 'description')
    readonly_fields = ('created_at',)
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Activity Information', {
            'fields': ('user', 'activity_type', 'description')
        }),
        ('Additional Data', {
            'fields': ('metadata',)
        }),
        ('Timestamp', {
            'fields': ('created_at',)
        })
    )


@admin.register(UserFollower)
class UserFollowerAdmin(admin.ModelAdmin):
    list_display = ('follower', 'following', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('follower__username', 'following__username')
    readonly_fields = ('created_at',)
    
    fieldsets = (
        ('Follow Relationship', {
            'fields': ('follower', 'following')
        }),
        ('Metadata', {
            'fields': ('created_at',)
        })
    )


@admin.register(ResearchPaper)
class ResearchPaperAdmin(admin.ModelAdmin):
    list_display = ('title', 'source', 'published_date', 'citation_count', 'save_count', 'view_paper')
    list_filter = ('source', 'published_date', 'categories')
    search_fields = ('title', 'authors', 'abstract', 'paper_id')
    readonly_fields = ('created_at', 'updated_at', 'save_count')
    date_hierarchy = 'published_date'
    
    fieldsets = (
        ('Paper Information', {
            'fields': ('paper_id', 'source', 'title', 'authors', 'abstract')
        }),
        ('Publication Details', {
            'fields': ('published_date', 'journal', 'doi')
        }),
        ('URLs', {
            'fields': ('pdf_url', 'external_url')
        }),
        ('Classification', {
            'fields': ('categories', 'keywords')
        }),
        ('Statistics', {
            'fields': ('citation_count', 'save_count')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at')
        })
    )
    
    def view_paper(self, obj):
        if obj.external_url:
            return format_html('<a href="{}" target="_blank">View Paper</a>', obj.external_url)
        return '-'
    view_paper.short_description = 'External Link'


@admin.register(UserPaper)
class UserPaperAdmin(admin.ModelAdmin):
    list_display = ('paper_title', 'user', 'is_favorite', 'read_status', 'created_at')
    list_filter = ('is_favorite', 'read_status', 'created_at')
    search_fields = ('paper__title', 'user__username', 'notes')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'paper')
        }),
        ('User Data', {
            'fields': ('notes', 'tags', 'is_favorite', 'read_status')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at')
        })
    )
    
    def paper_title(self, obj):
        return obj.paper.title[:50] + ('...' if len(obj.paper.title) > 50 else '')
    paper_title.short_description = 'Paper Title'


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ('user', 'target_type', 'target_id', 'created_at')
    list_filter = ('target_type', 'created_at')
    search_fields = ('user__username',)
    readonly_fields = ('created_at',)
    
    fieldsets = (
        ('Like Information', {
            'fields': ('user', 'target_type', 'target_id')
        }),
        ('Metadata', {
            'fields': ('created_at',)
        })
    )


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'target_type', 'target_id', 'text_preview', 'has_parent', 'created_at')
    list_filter = ('target_type', 'created_at')
    search_fields = ('user__username', 'text')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Comment Information', {
            'fields': ('user', 'target_type', 'target_id', 'text')
        }),
        ('Reply Structure', {
            'fields': ('parent',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at')
        })
    )
    
    def text_preview(self, obj):
        return obj.text[:50] + ('...' if len(obj.text) > 50 else '')
    text_preview.short_description = 'Text Preview'
    
    def has_parent(self, obj):
        return bool(obj.parent)
    has_parent.boolean = True
    has_parent.short_description = 'Is Reply'


@admin.register(UserMessage)
class UserMessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'recipient', 'message_preview', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('sender__username', 'recipient__username', 'message')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Message Information', {
            'fields': ('sender', 'recipient', 'message')
        }),
        ('Status', {
            'fields': ('is_read', 'read_at')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at')
        })
    )
    
    def message_preview(self, obj):
        return obj.message[:50] + ('...' if len(obj.message) > 50 else '')
    message_preview.short_description = 'Message Preview'


@admin.register(MessageThread)
class MessageThreadAdmin(admin.ModelAdmin):
    list_display = ('thread_participants', 'last_message_preview', 'last_activity', 'unread_count_user1', 'unread_count_user2')
    list_filter = ('last_activity', 'created_at')
    search_fields = ('user1__username', 'user2__username')
    readonly_fields = ('created_at', 'last_activity')
    
    fieldsets = (
        ('Thread Information', {
            'fields': ('user1', 'user2', 'last_message')
        }),
        ('Unread Counts', {
            'fields': ('unread_count_user1', 'unread_count_user2')
        }),
        ('Metadata', {
            'fields': ('created_at', 'last_activity')
        })
    )
    
    def thread_participants(self, obj):
        return f"{obj.user1.username} & {obj.user2.username}"
    thread_participants.short_description = 'Participants'
    
    def last_message_preview(self, obj):
        if obj.last_message:
            return obj.last_message.message[:30] + ('...' if len(obj.last_message.message) > 30 else '')
        return '-'
    last_message_preview.short_description = 'Last Message'


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'token', 'created_at', 'expires_at', 'is_used', 'is_valid_now')
    list_filter = ('is_used', 'created_at', 'expires_at')
    search_fields = ('user__username', 'user__email', 'ip_address')
    readonly_fields = ('created_at', 'expires_at')
    
    fieldsets = (
        ('Token Information', {
            'fields': ('user', 'token', 'is_used')
        }),
        ('Security', {
            'fields': ('ip_address', 'user_agent')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'expires_at')
        })
    )
    
    def is_valid_now(self, obj):
        return obj.is_valid()
    is_valid_now.boolean = True
    is_valid_now.short_description = 'Currently Valid'