import React from 'react';
import { Heart, Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSaveContent, useToggleFavorite, useIsContentSaved } from '../../hooks/useUserContent';
import type { ContentType } from '../../services/userInteractions';

interface SaveButtonProps {
  contentType: ContentType;
  contentId: string;
  contentTitle: string;
  contentDescription?: string;
  thumbnailUrl?: string;
  sourceUrl?: string;
  metadata?: Record<string, unknown>;
  variant?: 'bookmark' | 'heart';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
  onSaved?: () => void;
}

const SaveButton: React.FC<SaveButtonProps> = ({
  contentType,
  contentId,
  contentTitle,
  contentDescription,
  thumbnailUrl,
  sourceUrl,
  metadata,
  variant = 'bookmark',
  size = 'md',
  className = '',
  showText = false,
  onSaved
}) => {
  const saveContent = useSaveContent();
  const toggleFavorite = useToggleFavorite();
  const savedItem = useIsContentSaved(contentType, contentId);

  const isSaved = !!savedItem;
  const isFavorited = savedItem?.is_favorite || false;
  const isLoading = saveContent.isPending || toggleFavorite.isPending;

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    try {
      if (isSaved) {
        // Toggle favorite status if already saved
        await toggleFavorite.mutateAsync(savedItem.id);
      } else {
        // Save new content
        await saveContent.mutateAsync({
          content_type: contentType,
          content_id: contentId,
          title: contentTitle,
          description: contentDescription,
          thumbnail_url: thumbnailUrl,
          source_url: sourceUrl,
          notes: metadata ? JSON.stringify(metadata) : undefined,
          is_favorite: true,
        });
      }
      onSaved?.();
    } catch (error) {
      console.error('Failed to save content:', error);
    }
  };

  const getIcon = () => {
    if (isLoading) {
      return <Loader2 className="animate-spin" />;
    }

    if (variant === 'heart') {
      return (
        <Heart 
          className={`transition-colors ${
            isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'
          }`} 
        />
      );
    }

    return isSaved ? (
      <BookmarkCheck 
        className={`transition-colors ${
          isFavorited ? 'text-yellow-500' : 'text-blue-500'
        }`} 
      />
    ) : (
      <Bookmark className="text-gray-400 hover:text-blue-400 transition-colors" />
    );
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-6 w-6';
      default:
        return 'h-5 w-5';
    }
  };

  const getButtonClasses = () => {
    const baseClasses = `
      flex items-center gap-2 rounded-lg transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-blue-500/50
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    if (showText) {
      return `${baseClasses} px-3 py-2 bg-white/10 hover:bg-white/20 text-white`;
    } else {
      return `${baseClasses} p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm`;
    }
  };

  const getText = () => {
    if (!showText) return null;

    if (isLoading) {
      return 'Saving...';
    }

    if (isSaved) {
      return isFavorited ? 'Favorited' : 'Saved';
    }

    return variant === 'heart' ? 'Like' : 'Save';
  };

  return (
    <motion.button
      onClick={handleSave}
      disabled={isLoading}
      className={`${getButtonClasses()} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={
        isSaved 
          ? (isFavorited ? 'Remove from favorites' : 'Add to favorites')
          : 'Save to your collection'
      }
    >
      <div className={getSizeClasses()}>
        {getIcon()}
      </div>
      {getText() && (
        <span className="text-sm font-medium">
          {getText()}
        </span>
      )}
    </motion.button>
  );
};

export default SaveButton;