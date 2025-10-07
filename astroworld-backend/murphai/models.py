from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Conversation(models.Model):
    id = models.CharField(max_length=50, primary_key=True)  # Use string ID to match frontend
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='murph_conversations')
    title = models.CharField(max_length=255, default='New Chat')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'murphai_conversation'

class Message(models.Model):
    id = models.CharField(max_length=50, primary_key=True)  # Use string ID to match frontend
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=20, choices=[('user', 'User'), ('assistant', 'Assistant')])
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'murphai_message'
        ordering = ['timestamp']

# Keep your existing MurphChat model for backward compatibility
class MurphChat(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    prompt = models.TextField()
    response = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'murphai_murphchat'
