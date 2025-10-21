import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Send, 
  Heart, 
  MoreVertical, 
  Reply,
  Trash2,
  X
} from 'lucide-react';
import type { Comment } from '../../types/explore';
import { 
  useComments, 
  useCreateComment, 
  useDeleteComment,
  useLikeItem 
} from '../../hooks/useExplore';

interface CommentThreadProps {
  targetType: 'journal' | 'paper' | 'event';
  targetId: number;
  className?: string;
}

interface CommentItemProps {
  comment: Comment;
  onReply: (parentId: number) => void;
  onDelete: (commentId: number) => void;
  onLike: (commentId: number) => void;
  level?: number;
}

const CommentThread: React.FC<CommentThreadProps> = ({
  targetType,
  targetId,
  className = ""
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  const { data: comments, isLoading } = useComments(targetType, targetId);
  const createCommentMutation = useCreateComment();
  const deleteCommentMutation = useDeleteComment();
  const likeCommentMutation = useLikeItem();

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await createCommentMutation.mutateAsync({
        target_type: targetType,
        target_id: targetId,
        text: newComment,
        parent: undefined
      });
      setNewComment('');
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent, parentId: number) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      await createCommentMutation.mutateAsync({
        target_type: targetType,
        target_id: targetId,
        text: replyText,
        parent: parentId
      });
      setReplyText('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to create reply:', error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await deleteCommentMutation.mutateAsync(commentId);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleLikeComment = async (commentId: number) => {
    try {
      await likeCommentMutation.mutateAsync({
        target_type: 'comment',
        target_id: commentId
      });
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const renderComments = (comments: Comment[], level = 0) => {
    return comments
            .filter(comment => level === 0 ? !comment.parent : comment.parent)
      .map(comment => (
        <CommentItem
          key={comment.id}
          comment={comment}
          level={level}
          onReply={(parentId) => setReplyingTo(parentId)}
          onDelete={handleDeleteComment}
          onLike={handleLikeComment}
        />
      ));
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Discussion ({comments?.length || 0})
        </h3>
      </div>

      {/* New Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts..."
          rows={3}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900 dark:text-white placeholder:text-gray-500"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!newComment.trim() || createCommentMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
            {createCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments && comments.length > 0 ? (
          renderComments(comments)
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No comments yet. Start the discussion!
            </p>
          </div>
        )}
      </div>

      {/* Reply Form */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Replying to comment
              </span>
              <button
                onClick={() => setReplyingTo(null)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={(e) => handleSubmitReply(e, replyingTo)} className="space-y-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your reply..."
                rows={2}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900 dark:text-white placeholder:text-gray-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!replyText.trim() || createCommentMutation.isPending}
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  <Reply className="w-3 h-3" />
                  Reply
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onReply,
  onDelete,
  onLike,
  level = 0
}) => {
  const [showActions, setShowActions] = useState(false);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${level > 0 ? 'ml-8 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''}`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
          {comment.user_username.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Comment Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-white text-sm">
                {comment.user_username}
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                {formatTimeAgo(comment.created_at)}
              </span>
            </div>
            
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Comment Text */}
          <p className="text-gray-900 dark:text-white text-sm leading-relaxed">
            {comment.text}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={() => onLike(comment.id)}
              className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors text-sm"
            >
              <Heart className="w-4 h-4" />
              <span>{comment.like_count || 0}</span>
            </button>
            
            <button
              onClick={() => onReply(comment.id)}
              className="flex items-center gap-1 text-gray-500 hover:text-indigo-500 transition-colors text-sm"
            >
              <Reply className="w-4 h-4" />
              Reply
            </button>

            {/* Delete for own comments */}
            {/* Only show delete for own comments - would need user context */}
            {/* TODO: Add user context to determine if user owns comment */}
            {comment.user === 1 && ( // placeholder - replace with actual user ID check
              <button
                onClick={() => onDelete(comment.id)}
                className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                level={level + 1}
                onReply={onReply}
                onDelete={onDelete}
                onLike={onLike}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CommentThread;