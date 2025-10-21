import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, ArrowLeft, User } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../../components/Layout';
import MessageThreadList from '../../components/messaging/MessageThreadList';
import UserMessageBubble from '../../components/messaging/UserMessageBubble';
import MessageComposer from '../../components/messaging/MessageComposer';
import { useMessageThreads, useThreadMessages, useSendMessage, useMessagesWithUser } from '../../hooks/useMessaging';
import { useUserProfile } from '../../hooks/useUserInteractions';
import type { MessageThread } from '../../types/messaging';

interface ChatWithUserProps {
  userId: number;
  userName: string;
  userFullName?: string;
  userBio?: string;
  userProfilePicture?: string;
  onBack: () => void;
}

const ChatWithUser: React.FC<ChatWithUserProps> = ({
  userId,
  userName,
  userFullName,
  userBio,
  userProfilePicture,
  onBack
}) => {
  const [messageInput, setMessageInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: currentUser } = useUserProfile();
  const { data: messages, isLoading: messagesLoading } = useMessagesWithUser(userId);
  const sendMessage = useSendMessage();

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ 
        top: scrollRef.current.scrollHeight, 
        behavior: 'smooth' 
      });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    try {
      await sendMessage.mutateAsync({
        recipient_id: userId,
        message: messageInput.trim()
      });
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-zinc-800/60 bg-zinc-950/60 flex items-center gap-3">
        <button
          onClick={onBack}
          className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-400" />
        </button>
        
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
          {userProfilePicture ? (
            <img 
              src={userProfilePicture} 
              alt={userName} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <User className="h-5 w-5" />
          )}
        </div>
        
        <div>
          <h2 className="text-lg font-semibold text-white">
            {userFullName || userName}
          </h2>
          <p className="text-sm text-gray-400">
            @{userName}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <main 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-4"
      >
        {/* User Profile Card in Middle */}
        <div className="flex justify-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/80 rounded-2xl p-6 max-w-sm w-full text-center border border-zinc-700/50"
          >
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden mx-auto mb-4">
              {userProfilePicture ? (
                <img 
                  src={userProfilePicture} 
                  alt={userName} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                userFullName?.charAt(0).toUpperCase() || userName.charAt(0).toUpperCase()
              )}
            </div>
            <h3 className="text-xl font-bold text-white mb-1">
              {userFullName || userName}
            </h3>
            <p className="text-gray-400 mb-3">@{userName}</p>
            {userBio && (
              <p className="text-gray-300 text-sm">{userBio}</p>
            )}
          </motion.div>
        </div>

        {/* Messages */}
        {messagesLoading ? (
          <div className="flex items-center justify-center">
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
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              Start your conversation with {userFullName || userName}!
            </p>
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
          placeholder={`Message ${userFullName || userName}...`}
        />
      </div>
    </div>
  );
};

const MessagingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Hooks
  const { data: threads, isLoading: threadsLoading } = useMessageThreads();
  const { data: threadData, isLoading: messagesLoading } = useThreadMessages(selectedThread?.id || null);
  const { data: currentUser } = useUserProfile();
  const sendMessage = useSendMessage();

  // Handle direct user messaging from URL params
  const userIdParam = searchParams.get('user');
  const userNameParam = searchParams.get('username');
  const userFullNameParam = searchParams.get('fullName');
  const userBioParam = searchParams.get('bio');
  const userProfilePictureParam = searchParams.get('profilePicture');
  
  const isDirectMessage = !!userIdParam;

  useEffect(() => {
    if (userIdParam && threads) {
      const userId = parseInt(userIdParam);
      const existingThread = threads.find(thread => 
        thread.other_user.id === userId
      );
      if (existingThread) {
        setSelectedThread(existingThread);
        // Clear URL params since we found an existing thread
        setSearchParams({});
      }
    }
  }, [userIdParam, threads, setSearchParams]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ 
        top: scrollRef.current.scrollHeight, 
        behavior: 'smooth' 
      });
    }
  }, [threadData?.messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedThread || !threadData) return;

    const recipientId = selectedThread.other_user.id;
    
    try {
      await sendMessage.mutateAsync({
        recipient_id: recipientId,
        message: messageInput.trim()
      });
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleSelectThread = (thread: MessageThread) => {
    setSelectedThread(thread);
    setSearchParams({}); // Clear any URL params
  };

  const handleBackToThreads = () => {
    setSelectedThread(null);
    setSearchParams({}); // Clear URL params
  };

  // If there's a direct message request, show the chat with user component
  if (isDirectMessage && userIdParam) {
    return (
      <Layout>
        <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
          
          {/* Threads Sidebar */}
          <div className="hidden md:block w-96 border-r border-zinc-800/60 bg-zinc-950/60">
            <div className="p-4 border-b border-zinc-800/60">
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <MessageCircle className="h-6 w-6" />
                Messages
              </h1>
            </div>
            
            <MessageThreadList
              threads={threads || []}
              activeThreadId={selectedThread?.id}
              onSelectThread={handleSelectThread}
              loading={threadsLoading}
            />
          </div>

          {/* Chat with specific user */}
          <ChatWithUser
            userId={parseInt(userIdParam)}
            userName={userNameParam || `User${userIdParam}`}
            userFullName={userFullNameParam || undefined}
            userBio={userBioParam || undefined}
            userProfilePicture={userProfilePictureParam || undefined}
            onBack={handleBackToThreads}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        
        {/* Threads Sidebar */}
        <div className={[
          'w-full md:w-96 border-r border-zinc-800/60 bg-zinc-950/60',
          selectedThread ? 'hidden md:block' : 'block'
        ].join(' ')}>
          <div className="p-4 border-b border-zinc-800/60">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageCircle className="h-6 w-6" />
              Messages
            </h1>
          </div>
          
          <MessageThreadList
            threads={threads || []}
            activeThreadId={selectedThread?.id}
            onSelectThread={handleSelectThread}
            loading={threadsLoading}
          />
        </div>

        {/* Chat Area */}
        <div className={[
          'flex-1 flex flex-col',
          !selectedThread ? 'hidden md:flex' : 'flex'
        ].join(' ')}>
          
          {selectedThread ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-zinc-800/60 bg-zinc-950/60 flex items-center gap-3">
                <button
                  onClick={handleBackToThreads}
                  className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-400" />
                </button>
                
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                  {selectedThread.other_user.profile_picture ? (
                    <img 
                      src={selectedThread.other_user.profile_picture} 
                      alt={selectedThread.other_user.username} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {selectedThread.other_user.full_name || selectedThread.other_user.username}
                  </h2>
                  <p className="text-sm text-gray-400">
                    @{selectedThread.other_user.username}
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
                ) : threadData?.messages && threadData.messages.length > 0 ? (
                  <div className="space-y-4">
                    {threadData.messages.map((message) => (
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
                      <MessageCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg">No messages yet</p>
                      <p className="text-gray-500 text-sm mt-2">
                        Start the conversation with {selectedThread.other_user.full_name || selectedThread.other_user.username}!
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
                  placeholder={`Message ${selectedThread.other_user.full_name || selectedThread.other_user.username}...`}
                />
              </div>
            </>
          ) : (
            /* No Thread Selected */
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <MessageCircle className="h-24 w-24 text-gray-600 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white mb-2">Your Messages</h2>
                <p className="text-gray-400 text-lg">Select a conversation to start messaging</p>
                <p className="text-gray-500 text-sm mt-2">
                  Connect with fellow space explorers and share your cosmic discoveries!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MessagingPage;