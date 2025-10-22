from django.contrib import admin
from django.utils.html import format_html

# Note: Since research_papers app doesn't have models.py yet, 
# this admin file is prepared for when models are created.
# The models are currently in users/models.py as ResearchPaper and UserPaper

# If you move the models to this app later, uncomment and update:

# from .models import ResearchPaper, UserPaper


# @admin.register(ResearchPaper)
# class ResearchPaperAdmin(admin.ModelAdmin):
#     list_display = ('title', 'source', 'published_date', 'citation_count', 'save_count', 'view_paper')
#     list_filter = ('source', 'published_date', 'categories')
#     search_fields = ('title', 'authors', 'abstract', 'paper_id')
#     readonly_fields = ('created_at', 'updated_at', 'save_count')
#     date_hierarchy = 'published_date'
    
#     fieldsets = (
#         ('Paper Information', {
#             'fields': ('paper_id', 'source', 'title', 'authors', 'abstract')
#         }),
#         ('Publication Details', {
#             'fields': ('published_date', 'journal', 'doi')
#         }),
#         ('URLs', {
#             'fields': ('pdf_url', 'external_url')
#         }),
#         ('Classification', {
#             'fields': ('categories', 'keywords')
#         }),
#         ('Statistics', {
#             'fields': ('citation_count', 'save_count')
#         }),
#         ('Metadata', {
#             'fields': ('created_at', 'updated_at')
#         })
#     )
    
#     def view_paper(self, obj):
#         if obj.external_url:
#             return format_html('<a href="{}" target="_blank">View Paper</a>', obj.external_url)
#         return '-'
#     view_paper.short_description = 'External Link'


# @admin.register(UserPaper)
# class UserPaperAdmin(admin.ModelAdmin):
#     list_display = ('paper_title', 'user', 'is_favorite', 'read_status', 'created_at')
#     list_filter = ('is_favorite', 'read_status', 'created_at')
#     search_fields = ('paper__title', 'user__username', 'notes')
#     readonly_fields = ('created_at', 'updated_at')
    
#     fieldsets = (
#         ('Basic Information', {
#             'fields': ('user', 'paper')
#         }),
#         ('User Data', {
#             'fields': ('notes', 'tags', 'is_favorite', 'read_status')
#         }),
#         ('Metadata', {
#             'fields': ('created_at', 'updated_at')
#         })
#     )
    
#     def paper_title(self, obj):
#         return obj.paper.title[:50] + ('...' if len(obj.paper.title) > 50 else '')
#     paper_title.short_description = 'Paper Title'

# Admin configurations are currently in users/admin.py since the models are there.