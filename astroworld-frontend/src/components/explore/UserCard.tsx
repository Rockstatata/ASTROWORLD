import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, BookOpen, MessageCircle, UserPlus, UserCheck } from 'lucide-react';
import type { PublicUser } from '../../types/explore';
import { useIsFollowing, useFollowUser, useUnfollowUser } from '../../hooks/useExplore';
import { useNavigate } from 'react-router-dom';

interface UserCardProps {
  user: PublicUser;
  onFollow?: (userId: number) => void;
  onUnfollow?: (userId: number) => void;
  showFollowButton?: boolean;
  className?: string;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  onFollow,
  onUnfollow,
  showFollowButton = true,
  className = ''
}) => {
  const navigate = useNavigate();
  const isFollowing = useIsFollowing(user.id);
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  const [showToast, setShowToast] = React.useState(false);

  const handleFollowClick = async () => {
    try {
      if (isFollowing) {
        await unfollowMutation.mutateAsync(user.id);
        onUnfollow?.(user.id);
      } else {
        await followMutation.mutateAsync({ following_id: user.id });
        onFollow?.(user.id);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      }
    } catch (error) {
      console.error('Follow action failed:', error);
    }
  };

  const handleViewProfile = () => {
    navigate(`/profile/${user.id}`);
  };

  const handleMessage = () => {
    const params = new URLSearchParams({
      user: user.id.toString(),
    });
    
    navigate(`/messages/chat?${params.toString()}`);
  };

  const joinedDate = new Date(user.date_joined).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`
        bg-gray-900/80 backdrop-blur-xl border border-space-violet/30 rounded-xl p-6
        hover:border-space-violet/50 transition-all duration-300
        ${className}
      `}
    >
      {/* Header with Avatar and Follow Button */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={`${user.username}'s avatar`}
                className="w-12 h-12 rounded-full object-cover border-2 border-space-violet/30"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-space-gradient flex items-center justify-center text-white font-bold text-lg">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
            {/* Online indicator could go here */}
          </div>

          {/* User Info */}
          <div>
            <h3 className="text-white font-semibold text-lg hover:text-space-blue-light transition-colors cursor-pointer">
              {user.full_name || user.username}
            </h3>
            <p className="text-gray-400 text-sm">@{user.username}</p>
          </div>
        </div>

        {/* Follow Button */}
        {showFollowButton && (
          <motion.button
            onClick={handleFollowClick}
            disabled={followMutation.isPending || unfollowMutation.isPending}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm transition-all
              ${isFollowing
                ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 text-white'
              }
              ${(followMutation.isPending || unfollowMutation.isPending) ? 'opacity-50 cursor-wait' : ''}
            `}
          >
            {isFollowing ? (
              <>
                <UserCheck className="w-4 h-4 inline mr-2" />
                Following
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 inline mr-2" />
                Follow
              </>
            )}
          </motion.button>
        )}

        {/* Toast Notification */}
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 
                       bg-green-500 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap z-50"
          >
            Now following @{user.username}!
          </motion.div>
        )}
      </div>

      {/* Bio */}
      {user.bio && (
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {user.bio}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-4">
          {/* Followers */}
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{user.followers_count} followers</span>
          </div>

          {/* Public Journals */}
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{user.public_journals_count} journals</span>
          </div>
        </div>

        {/* Join Date */}
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>Joined {joinedDate}</span>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="mt-4 pt-4 border-t border-gray-700/50 flex gap-2">
        <motion.button
          onClick={handleViewProfile}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 py-2 px-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 text-sm transition-colors"
        >
          View Profile
        </motion.button>
        <motion.button
          onClick={handleMessage}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="py-2 px-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 text-sm transition-colors"
          title="Send Message"
        >
          <MessageCircle className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default UserCard;