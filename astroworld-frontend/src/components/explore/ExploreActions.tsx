/**
 * Interactive action buttons for Explore page
 * Reuses patterns from shared ContentActions but customized for social features
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  UserCheck, 
  Heart, 
  MessageSquare, 
  Bookmark,
  BookmarkCheck,
  StickyNote
} from 'lucide-react';
import {
  useFollowUser,
  useUnfollowUser,
  useLikeItem,
  useUnlikeItem,
  useSavePaper,
  useUnsavePaper,
  useIsFollowing
} from '../../hooks/useExplore';

interface FollowButtonProps {
  userId: number;
  username: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  username,
  size = 'md',
  className = ''
}) => {
  const isFollowing = useIsFollowing(userId);
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  const [showToast, setShowToast] = useState(false);

  const handleClick = async () => {
    try {
      if (isFollowing) {
        await unfollowMutation.mutateAsync(userId);
      } else {
        await followMutation.mutateAsync({ following_id: userId });
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      }
    } catch (error) {
      console.error('Follow action failed:', error);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const isLoading = followMutation.isPending || unfollowMutation.isPending;

  return (
    <div className="relative">
      <motion.button
        onClick={handleClick}
        disabled={isLoading}
        whileHover={{ scale: isFollowing ? 1 : 1.05 }}
        whileTap={{ scale: isFollowing ? 1 : 0.95 }}
        className={`
          flex items-center gap-2 rounded-lg font-medium transition-all
          ${sizeClasses[size]}
          ${isFollowing
            ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
            : 'bg-space-gradient hover:opacity-90 text-white'
          }
          ${isLoading ? 'opacity-50 cursor-wait' : ''}
          ${className}
        `}
      >
        {isFollowing ? (
          <>
            <UserCheck className={iconSizes[size]} />
            <span>Following</span>
          </>
        ) : (
          <>
            <UserPlus className={iconSizes[size]} />
            <span>Follow</span>
          </>
        )}
      </motion.button>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 
                       bg-green-500 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap z-50"
          >
            Now following @{username}!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface LikeButtonProps {
  targetType: 'journal' | 'paper' | 'comment';
  targetId: number;
  isLiked?: boolean;
  likeCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  targetType,
  targetId,
  isLiked = false,
  likeCount = 0,
  size = 'md',
  showCount = true,
  className = ''
}) => {
  const likeMutation = useLikeItem();
  const unlikeMutation = useUnlikeItem();

  const handleClick = async () => {
    try {
      if (isLiked) {
        await unlikeMutation.mutateAsync({ targetType, targetId });
      } else {
        await likeMutation.mutateAsync({ target_type: targetType, target_id: targetId });
      }
    } catch (error) {
      console.error('Like action failed:', error);
    }
  };

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const isLoading = likeMutation.isPending || unlikeMutation.isPending;

  return (
    <div className="flex items-center gap-2">
      <motion.button
        onClick={handleClick}
        disabled={isLoading}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`
          relative rounded-full transition-all
          ${sizeClasses[size]}
          ${isLiked 
            ? 'bg-red-500/20 text-red-400' 
            : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300'
          }
          ${isLoading ? 'opacity-50 cursor-wait' : ''}
          ${className}
        `}
      >
        <Heart 
          className={`${iconSizes[size]} transition-all`}
          fill={isLiked ? 'currentColor' : 'none'}
          strokeWidth={2}
        />
        
        {/* Pulse animation when liked */}
        {isLiked && (
          <motion.div
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 rounded-full bg-red-400"
          />
        )}
      </motion.button>

      {showCount && likeCount > 0 && (
        <span className={`text-gray-400 ${textSizes[size]}`}>
          {likeCount}
        </span>
      )}
    </div>
  );
};

interface SavePaperButtonProps {
  paperId: number;
  isSaved?: boolean;
  userPaperId?: number;
  onSave?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SavePaperButton: React.FC<SavePaperButtonProps> = ({
  paperId,
  isSaved = false,
  userPaperId,
  onSave,
  size = 'md',
  className = ''
}) => {
  const saveMutation = useSavePaper();
  const unsaveMutation = useUnsavePaper();
  const [showToast, setShowToast] = useState(false);

  const handleClick = async () => {
    try {
      if (isSaved && userPaperId) {
        await unsaveMutation.mutateAsync(userPaperId);
      } else {
        await saveMutation.mutateAsync({ paper_id: paperId });
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      }
      onSave?.();
    } catch (error) {
      console.error('Save paper action failed:', error);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const isLoading = saveMutation.isPending || unsaveMutation.isPending;

  return (
    <div className="relative">
      <motion.button
        onClick={handleClick}
        disabled={isLoading}
        whileHover={{ scale: isSaved ? 1 : 1.05 }}
        whileTap={{ scale: isSaved ? 1 : 0.95 }}
        className={`
          flex items-center gap-2 rounded-lg font-medium transition-all
          ${sizeClasses[size]}
          ${isSaved
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 backdrop-blur-sm'
          }
          ${isLoading ? 'opacity-50 cursor-wait' : ''}
          ${className}
        `}
      >
        {isSaved ? (
          <>
            <BookmarkCheck className={iconSizes[size]} />
            <span>Saved</span>
          </>
        ) : (
          <>
            <Bookmark className={iconSizes[size]} />
            <span>Save</span>
          </>
        )}
      </motion.button>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 
                       bg-green-500 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap z-50"
          >
            Paper saved to your collection!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface CommentButtonProps {
  targetType: 'journal' | 'paper' | 'event';
  targetId: number;
  commentCount?: number;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

const CommentButton: React.FC<CommentButtonProps> = ({
  commentCount = 0,
  onClick,
  size = 'md',
  showCount = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="flex items-center gap-2">
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`
          rounded-full transition-all
          ${sizeClasses[size]}
          bg-gray-800/50 hover:bg-gray-700/50 text-gray-300
          ${className}
        `}
      >
        <MessageSquare className={iconSizes[size]} />
      </motion.button>

      {showCount && commentCount > 0 && (
        <span className={`text-gray-400 ${textSizes[size]}`}>
          {commentCount}
        </span>
      )}
    </div>
  );
};

interface AddNoteButtonProps {
  paperId: number;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AddNoteButton: React.FC<AddNoteButtonProps> = ({
  onClick,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        flex items-center gap-2 rounded-lg font-medium transition-all
        bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 backdrop-blur-sm
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <StickyNote className={iconSizes[size]} />
      <span>Add Note</span>
    </motion.button>
  );
};

// Export components individually (better for fast refresh)
export {
  FollowButton,
  LikeButton,
  SavePaperButton,
  CommentButton,
  AddNoteButton
};