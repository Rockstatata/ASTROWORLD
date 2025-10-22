from django.contrib import admin
from django.utils.html import format_html
from .models import Conversation, Message, MurphChat


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'title', 'message_count', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('id', 'user__username', 'title')
    readonly_fields = ('created_at', 'updated_at', 'message_count')
    
    fieldsets = (
        ('Conversation Information', {
            'fields': ('id', 'user', 'title')
        }),
        ('Statistics', {
            'fields': ('message_count',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at')
        })
    )
    
    def message_count(self, obj):
        return obj.messages.count()
    message_count.short_description = 'Messages'


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'conversation_title', 'user', 'role', 'content_preview', 'timestamp')
    list_filter = ('role', 'timestamp')
    search_fields = ('id', 'conversation__user__username', 'content')
    readonly_fields = ('timestamp',)
    
    fieldsets = (
        ('Message Information', {
            'fields': ('id', 'conversation', 'role', 'content')
        }),
        ('Metadata', {
            'fields': ('timestamp',)
        })
    )
    
    def conversation_title(self, obj):
        return obj.conversation.title
    conversation_title.short_description = 'Conversation'
    
    def user(self, obj):
        return obj.conversation.user.username
    user.short_description = 'User'
    
    def content_preview(self, obj):
        return obj.content[:100] + ('...' if len(obj.content) > 100 else '')
    content_preview.short_description = 'Content Preview'


@admin.register(MurphChat)
class MurphChatAdmin(admin.ModelAdmin):
    list_display = ('user', 'prompt_preview', 'response_preview', 'timestamp')
    list_filter = ('timestamp',)
    search_fields = ('user__username', 'prompt', 'response')
    readonly_fields = ('timestamp',)
    date_hierarchy = 'timestamp'
    
    fieldsets = (
        ('Chat Information', {
            'fields': ('user', 'prompt', 'response')
        }),
        ('Metadata', {
            'fields': ('timestamp',)
        })
    )
    
    def prompt_preview(self, obj):
        return obj.prompt[:50] + ('...' if len(obj.prompt) > 50 else '')
    prompt_preview.short_description = 'Prompt Preview'
    
    def response_preview(self, obj):
        return obj.response[:50] + ('...' if len(obj.response) > 50 else '')
    response_preview.short_description = 'Response Preview'
