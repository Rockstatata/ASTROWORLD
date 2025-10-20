import React, { useState } from 'react';
import { Heart, Bookmark, MessageSquare, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useSaveContent, 
  useToggleFavorite, 
  useIsContentSaved
} from '../../hooks/useUserContent';
import type { ContentType } from '../../services/userInteractions';

interface SaveContentButtonProps {
  contentType: ContentType;
  contentId: string;
  title: string;
  metadata?: Record<string, unknown>;
  className?: string;
}

/**
 * SaveContentButton - Save NASA content to user's collection
 */
export const SaveContentButton: React.FC<SaveContentButtonProps> = ({
  contentType,
  contentId,
  title,
  metadata,
  className = ''
}) => {
  const saveContent = useSaveContent();
  const savedItem = useIsContentSaved(contentType, contentId);
  const [showToast, setShowToast] = useState(false);

  const handleSave = async () => {
    if (savedItem) return; // Already saved
    
    try {
      await saveContent.mutateAsync({
        content_type: contentType,
        content_id: contentId,
        title,
        metadata,
        is_favorite: false,
      });
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (error) {
      console.error('Failed to save content:', error);
    }
  };

  return (
    <div className="relative">
      <motion.button
        onClick={handleSave}
        disabled={!!savedItem || saveContent.isPending}
        whileHover={{ scale: savedItem ? 1 : 1.1 }}
        whileTap={{ scale: savedItem ? 1 : 0.95 }}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
          ${savedItem 
            ? 'bg-green-500/20 text-green-400 cursor-default' 
            : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm'
          }
          ${saveContent.isPending ? 'opacity-50 cursor-wait' : ''}
          ${className}
        `}
      >
        {savedItem ? (
          <>
            <Check className="h-4 w-4" />
            <span className="text-sm">Saved</span>
          </>
        ) : (
          <>
            <Bookmark className="h-4 w-4" />
            <span className="text-sm">Save</span>
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
            Added to your collection!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface FavoriteButtonProps {
  contentType: ContentType;
  contentId: string;
  title: string;
  metadata?: Record<string, unknown>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * FavoriteButton - Toggle favorite status with heart animation
 */
export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  contentType,
  contentId,
  title,
  metadata,
  size = 'md',
  className = ''
}) => {
  const saveContent = useSaveContent();
  const toggleFavorite = useToggleFavorite();
  const savedItem = useIsContentSaved(contentType, contentId);
  const isFavorited = savedItem?.is_favorite || false;

  const handleToggleFavorite = async () => {
    if (!savedItem) {
      // Save first, then mark as favorite
      try {
        await saveContent.mutateAsync({
          content_type: contentType,
          content_id: contentId,
          title,
          metadata,
          is_favorite: true,
        });
      } catch (error) {
        console.error('Failed to favorite content:', error);
      }
    } else {
      // Toggle existing saved item
      try {
        await toggleFavorite.mutateAsync(savedItem.id);
      } catch (error) {
        console.error('Failed to toggle favorite:', error);
      }
    }
  };

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const isPending = saveContent.isPending || toggleFavorite.isPending;

  return (
    <motion.button
      onClick={handleToggleFavorite}
      disabled={isPending}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      className={`
        relative p-2 rounded-full transition-all
        ${isFavorited 
          ? 'bg-red-500/20 text-red-400' 
          : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm'
        }
        ${isPending ? 'opacity-50 cursor-wait' : ''}
        ${className}
      `}
    >
      <Heart 
        className={`${sizeClasses[size]} transition-all`}
        fill={isFavorited ? 'currentColor' : 'none'}
        strokeWidth={2}
      />
      
      {/* Pulse animation when favorited */}
      {isFavorited && (
        <motion.div
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 rounded-full bg-red-400"
        />
      )}
    </motion.button>
  );
};

interface AddNoteButtonProps {
  contentType: ContentType;
  contentId: string;
  title: string;
  onNoteAdded?: () => void;
  className?: string;
}

/**
 * AddNoteButton - Quick add note to saved content
 */
export const AddNoteButton: React.FC<AddNoteButtonProps> = ({
  contentType,
  contentId,
  title,
  onNoteAdded,
  className = ''
}) => {
  const handleClick = () => {
    // In a full implementation, this would open a modal/dialog
    // For now, we'll just show a prompt
    const note = prompt(`Add a note for "${title}":`);
    if (note) {
      // This would save the note using useUpdateContent hook
      console.log('Saving note:', { contentType, contentId, note });
      onNoteAdded?.();
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
        bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 backdrop-blur-sm
        ${className}
      `}
    >
      <MessageSquare className="h-4 w-4" />
      <span className="text-sm">Add Note</span>
    </motion.button>
  );
};

interface QuickSaveButtonProps {
  contentType: ContentType;
  contentId: string;
  title: string;
  metadata?: Record<string, unknown>;
  showLabel?: boolean;
}

/**
 * QuickSaveButton - Compact button with save + favorite in one
 */
export const QuickSaveButton: React.FC<QuickSaveButtonProps> = ({
  contentType,
  contentId,
  title,
  metadata,
  showLabel = true
}) => {
  const savedItem = useIsContentSaved(contentType, contentId);

  return (
    <div className="flex items-center gap-2">
      {!savedItem ? (
        <SaveContentButton
          contentType={contentType}
          contentId={contentId}
          title={title}
          metadata={metadata}
        />
      ) : (
        <div className="flex items-center gap-2">
          <FavoriteButton
            contentType={contentType}
            contentId={contentId}
            title={title}
            metadata={metadata}
            size="md"
          />
          {showLabel && (
            <span className="text-sm text-gray-400">
              {savedItem.is_favorite ? 'Favorited' : 'Saved'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
