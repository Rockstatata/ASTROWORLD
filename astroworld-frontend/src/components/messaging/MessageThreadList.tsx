import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, User } from 'lucide-react';
import type { MessageThread } from '../../types/messaging';

interface MessageThreadListProps {
  threads: MessageThread[];
  activeThreadId?: number;
  onSelectThread: (thread: MessageThread) => void;
  loading?: boolean;
}

const MessageThreadList: React.FC<MessageThreadListProps> = ({
  threads,
  activeThreadId,
  onSelectThread,
  loading
}) => {
  if (loading) {
    return (
      <div className="p-4">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/60 animate-pulse">
              <div className="h-10 w-10 bg-zinc-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-zinc-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-zinc-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="p-8 text-center">
        <MessageCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 text-lg">No conversations yet</p>
        <p className="text-gray-500 text-sm mt-2">Start a conversation with someone!</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      {threads.map((thread) => (
        <motion.div
          key={thread.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => onSelectThread(thread)}
          className={[
            'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all',
            activeThreadId === thread.id
              ? 'bg-indigo-500/20 border border-indigo-500/40'
              : 'bg-zinc-900/60 hover:bg-zinc-800/60 border border-transparent'
          ].join(' ')}
        >
          {/* Profile Picture */}
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
              {thread.other_user.profile_picture ? (
                <img 
                  src={thread.other_user.profile_picture} 
                  alt={thread.other_user.username} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <User className="h-5 w-5" />
              )}
            </div>
            {thread.unread_count > 0 && (
              <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                {thread.unread_count > 9 ? '9+' : thread.unread_count}
              </div>
            )}
          </div>

          {/* Thread Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-white font-medium truncate">
                {thread.other_user.full_name || thread.other_user.username}
              </h3>
              <span className="text-xs text-gray-500">
                {new Date(thread.last_activity).toLocaleDateString()}
              </span>
            </div>
            {thread.last_message && (
              <p className="text-gray-400 text-sm truncate">
                {thread.last_message.message}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default MessageThreadList;