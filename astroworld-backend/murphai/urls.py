from django.urls import path
from .views import MurphAIChatView, delete_conversation, clear_conversation, clear_all_conversations, rename_conversation, create_conversation

urlpatterns = [
    path("chat/", MurphAIChatView.as_view(), name="murph_chat"),
    path('conversations/', create_conversation, name='create-conversation'),
    path('conversations/<str:conversation_id>/', delete_conversation, name='delete-conversation'),
    path('conversations/<str:conversation_id>/clear/', clear_conversation, name='clear-conversation'),
    path('conversations/clear-all/', clear_all_conversations, name='clear-all-conversations'),
    path('conversations/<str:conversation_id>/rename/', rename_conversation, name='rename-conversation')
]
