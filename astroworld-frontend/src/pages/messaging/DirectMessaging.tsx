import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, User, Send } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import UserMessageBubble from '../../components/messaging/UserMessageBubble';
import MessageComposer from '../../components/messaging/MessageComposer';
import { useMessagesWithUser, useSendMessage } from '../../hooks/useMessaging';
import { useUserProfile, usePublicProfile } from '../../hooks/useUserInteractions';

const DirectMessaging: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [messageInput, setMessageInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const otherUserId = parseInt(searchParams.get('user') || '0');
  
  // Hooks
  const { data: currentUser } = useUserProfile();
  const { data: otherUser, isLoading: otherUserLoading } = usePublicProfile(otherUserId);
  const { data: messages, isLoading: messagesLoading } = useMessagesWithUser(otherUserId);
  const sendMessage = useSendMessage();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ 
        top: scrollRef.current.scrollHeight, 
        behavior: 'smooth' 
      });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !otherUserId) return;

    try {
      await sendMessage.mutateAsync({
        recipient_id: otherUserId,
        message: messageInput.trim()
      });
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleBackToMessages = () => {
    navigate('/messages');
  };

  if (otherUserLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </Layout>
    );
  }

  if (!otherUser) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-400 text-lg">User not found</p>
            <button
              onClick={handleBackToMessages}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Back to Messages
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-zinc-950 text-zinc-50">
        <div className="flex-1 flex flex-col">
          
          {/* Chat Header */}
          <div className="p-4 border-b border-zinc-800/60 bg-zinc-950/60 flex items-center gap-3">
            <button
              onClick={handleBackToMessages}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-400" />
            </button>
            
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
              {otherUser.profile_picture ? (
                <img 
                  src={otherUser.profile_picture} 
                  alt={otherUser.username} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <User className="h-5 w-5" />
              )}
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-white">
                {otherUser.full_name || otherUser.username}
              </h2>
              <p className="text-sm text-gray-400">
                @{otherUser.username}
              </p>
            </div>
          </div>

          {/* User Info Card (Messenger-like) */}
          <div className="p-6 border-b border-zinc-800/60 bg-zinc-900/40">
            <div className="flex flex-col items-center text-center max-w-md mx-auto">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden mb-4">
                {otherUser.profile_picture ? (
                  <img 
                    src={otherUser.profile_picture} 
                    alt={otherUser.username} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  otherUser.full_name?.charAt(0).toUpperCase() || 
                  otherUser.username.charAt(0).toUpperCase()
                )}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-1">
                {otherUser.full_name || otherUser.username}
              </h3>
              
              <p className="text-gray-400 text-sm mb-2">@{otherUser.username}</p>
              
              {otherUser.bio && (
                <p className="text-gray-300 text-sm max-w-xs">
                  {otherUser.bio}
                </p>
              )}
              
              <p className="text-xs text-gray-500 mt-2">
                You're now connected on AstroWorld! Send a message to start your cosmic conversation.
              </p>
            </div>
          </div>

          {/* Messages */}
          <main 
            ref={scrollRef} 
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {messagesLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : messages && messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((message) => (
                  <UserMessageBubble
                    key={message.id}
                    message={message}
                    currentUserId={currentUser?.id || 0}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <Send className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Start the conversation!</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Send your first message to {otherUser.full_name || otherUser.username}
                  </p>
                </div>
              </div>
            )}
          </main>

          {/* Message Input */}
          <div className="border-t border-zinc-800/60 bg-zinc-950/60 p-4">
            <MessageComposer
              value={messageInput}
              setValue={setMessageInput}
              onSend={handleSendMessage}
              disabled={sendMessage.isPending}
              placeholder={`Message ${otherUser.full_name || otherUser.username}...`}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DirectMessaging;