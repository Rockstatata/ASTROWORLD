import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MessageSquare, 
  Calendar, 
  MapPin, 
  Tag,
  Eye,
  Star
} from 'lucide-react';
import type { PublicJournal } from '../../types/explore';

interface JournalCardProps {
  journal: PublicJournal;
  onLike?: (journalId: number) => void;
  onUnlike?: (journalId: number) => void;
  onComment?: (journalId: number, text: string) => void;
  showActions?: boolean;
  className?: string;
}

const JournalCard: React.FC<JournalCardProps> = ({
  journal,
  onLike,
  onUnlike,
  onComment,
  showActions = true,
  className = ''
}) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handleLikeClick = () => {
    if (journal.is_liked) {
      onUnlike?.(journal.id);
    } else {
      onLike?.(journal.id);
    }
  };

  const handleCommentSubmit = () => {
    if (commentText.trim()) {
      onComment?.(journal.id, commentText.trim());
      setCommentText('');
      setShowCommentBox(false);
    }
  };

  const observationDate = journal.observation_date 
    ? new Date(journal.observation_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

  const createdDate = new Date(journal.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Get journal type styling
  const getJournalTypeStyle = () => {
    const styles = {
      note: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Note', icon: Tag },
      observation: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Observation', icon: Eye },
      ai_conversation: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'AI Chat', icon: MessageSquare },
      discovery: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Discovery', icon: Star }
    };
    return styles[journal.journal_type] || styles.note;
  };

  const typeStyle = getJournalTypeStyle();
  const TypeIcon = typeStyle.icon;

  // Truncate content for card view
  const truncatedContent = journal.content.length > 400 
    ? journal.content.substring(0, 400) + '...'
    : journal.content;

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
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Author Avatar */}
          {journal.author_profile_picture ? (
            <img
              src={journal.author_profile_picture}
              alt={`${journal.author_username}'s avatar`}
              className="w-10 h-10 rounded-full object-cover border-2 border-space-violet/30"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-space-gradient flex items-center justify-center text-white font-bold text-sm">
              {journal.author_username.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium text-sm">
                @{journal.author_username}
              </span>
              <span className="text-gray-500 text-xs">•</span>
              <span className="text-gray-500 text-xs">{createdDate}</span>
            </div>
            
            {/* Journal Type Badge */}
            <div className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium mt-1 ${typeStyle.bg} ${typeStyle.text}`}>
              <TypeIcon className="h-3 w-3 mr-1" />
              {typeStyle.label}
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-white font-semibold text-lg mb-3 hover:text-space-blue-light transition-colors cursor-pointer">
        {journal.title}
      </h3>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
          {showFullContent ? journal.content : truncatedContent}
        </p>
        {journal.content.length > 400 && (
          <button
            onClick={() => setShowFullContent(!showFullContent)}
            className="text-space-blue-light text-sm mt-2 hover:text-space-blue transition-colors"
          >
            {showFullContent ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Observation Details */}
      {journal.journal_type === 'observation' && (
        <div className="mb-4 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            {observationDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{observationDate}</span>
              </div>
            )}
            {journal.coordinates && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>
                  RA: {journal.coordinates.ra?.toFixed(2)}° 
                  Dec: {journal.coordinates.dec?.toFixed(2)}°
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tags */}
      {journal.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {journal.tags.slice(0, 4).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-space-violet/20 text-space-violet border border-space-violet/30"
            >
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </span>
          ))}
          {journal.tags.length > 4 && (
            <span className="text-xs text-gray-500">
              +{journal.tags.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Stats and Actions */}
      {showActions && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>{journal.like_count} likes</span>
            <span>{journal.comment_count} comments</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Like Button */}
            <motion.button
              onClick={handleLikeClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`
                p-2 rounded-lg transition-all
                ${journal.is_liked
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300'
                }
              `}
            >
              <Heart className={`h-4 w-4 ${journal.is_liked ? 'fill-current' : ''}`} />
            </motion.button>

            {/* Comment Button */}
            <motion.button
              onClick={() => setShowCommentBox(!showCommentBox)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 transition-all"
            >
              <MessageSquare className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      )}

      {/* Comment Box */}
      {showCommentBox && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 pt-4 border-t border-gray-700/50"
        >
          <div className="flex gap-3">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500 text-sm resize-none focus:outline-none focus:border-space-violet/50"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setShowCommentBox(false)}
              className="px-3 py-1 text-sm text-gray-400 hover:text-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCommentSubmit}
              disabled={!commentText.trim()}
              className="px-4 py-1 bg-space-gradient text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              Comment
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default JournalCard;