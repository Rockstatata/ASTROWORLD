from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions, status
from .models import MurphChat, Conversation, Message
from .groq_service import murph_query
import json

class MurphAIChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        prompt = request.data.get('prompt', '')
        conversation_id = request.data.get('conversation_id')
        
        if not prompt:
            return Response({'error': 'Prompt is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get AI response
            response = murph_query(prompt)
            
            # Always save to old table for backward compatibility
            MurphChat.objects.create(
                user=request.user,
                prompt=prompt,
                response=response
            )
            
            # Save to new conversation structure if conversation_id provided
            if conversation_id:
                conversation, created = Conversation.objects.get_or_create(
                    id=conversation_id,
                    defaults={
                        'user': request.user,
                        'title': prompt[:50] + '...' if len(prompt) > 50 else prompt
                    }
                )
                
                # Update conversation timestamp
                conversation.save()
                
                # Save user message
                user_msg_id = f"{conversation_id}_user_{conversation.messages.filter(role='user').count()}"
                Message.objects.create(
                    id=user_msg_id,
                    conversation=conversation,
                    role='user',
                    content=prompt
                )
                
                # Save assistant message
                ai_msg_id = f"{conversation_id}_assistant_{conversation.messages.filter(role='assistant').count()}"
                Message.objects.create(
                    id=ai_msg_id,
                    conversation=conversation,
                    role='assistant',
                    content=response
                )
            
            return Response({'response': response})
        except Exception as e:
            return Response({'error': 'AI service unavailable'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# NEW: Create conversation endpoint
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_conversation(request):
    """Create a new conversation"""
    conversation_id = request.data.get('conversation_id')
    title = request.data.get('title', 'New Chat')
    
    if not conversation_id:
        return Response({'error': 'conversation_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        conversation, created = Conversation.objects.get_or_create(
            id=conversation_id,
            defaults={
                'user': request.user,
                'title': title
            }
        )
        
        return Response({
            'conversation_id': conversation.id,
            'title': conversation.title,
            'created': created
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_conversation(request, conversation_id):
    """Delete a specific conversation and all its messages"""
    try:
        conversation = Conversation.objects.get(id=conversation_id, user=request.user)
        conversation.delete()
        return Response({'message': 'Conversation deleted successfully'})
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def clear_conversation(request, conversation_id):
    """Clear all messages from a specific conversation but keep the conversation"""
    try:
        conversation = Conversation.objects.get(id=conversation_id, user=request.user)
        deleted_count = conversation.messages.all().delete()
        return Response({
            'message': 'Conversation messages cleared successfully',
            'deleted_messages': deleted_count[0]
        })
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def clear_all_conversations(request):
    """Clear all conversations and messages for the user"""
    try:
        deleted_count = Conversation.objects.filter(user=request.user).delete()
        return Response({
            'message': f'All conversations cleared ({deleted_count[0]} conversations)',
            'deleted_conversations': deleted_count[0]
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def rename_conversation(request, conversation_id):
    """Rename a conversation"""
    try:
        # Get or create conversation if it doesn't exist
        conversation, created = Conversation.objects.get_or_create(
            id=conversation_id,
            defaults={
                'user': request.user,
                'title': 'New Chat'
            }
        )
        
        new_title = request.data.get('title', '').strip()
        if not new_title:
            return Response({'error': 'Title is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        conversation.title = new_title
        conversation.save()
        return Response({'message': 'Conversation renamed successfully', 'title': new_title})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)