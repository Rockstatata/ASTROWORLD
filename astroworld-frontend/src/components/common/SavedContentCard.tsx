import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  ExternalLink, 
  Eye, 
  Heart, 
  Rocket, 
  Star, 
  Telescope,
  Image as ImageIcon,
  Bookmark,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDeleteContent, useToggleFavorite } from '../../hooks/useUserContent';
import type { UserContent } from '../../services/userInteractions';

interface SavedContentCardProps {
  content: UserContent;
  onDeleted?: () => void;
}

const SavedContentCard: React.FC<SavedContentCardProps> = ({ content, onDeleted }) => {
  const deleteContent = useDeleteContent();
  const toggleFavorite = useToggleFavorite();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirm('Are you sure you want to remove this from your saved content?')) {
      try {
        await deleteContent.mutateAsync(content.id);
        onDeleted?.();
      } catch (error) {
        console.error('Failed to delete content:', error);
      }
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await toggleFavorite.mutateAsync(content.id);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const getContentTypeIcon = () => {
    switch (content.content_type) {
      case 'event':
      case 'space_launch':
        return <Rocket className="h-4 w-4" />;
      case 'news':
        return <Eye className="h-4 w-4" />;
      case 'apod':
      case 'nasa_image':
      case 'gallery_image':
        return <ImageIcon className="h-4 w-4" />;
      case 'celestial':
        return <Star className="h-4 w-4" />;
      case 'mars_photo':
        return <Telescope className="h-4 w-4" />;
      default:
        return <Bookmark className="h-4 w-4" />;
    }
  };

  const getContentTypeColor = () => {
    switch (content.content_type) {
      case 'event':
      case 'space_launch':
        return 'from-red-500 to-orange-500';
      case 'news':
        return 'from-blue-500 to-purple-500';
      case 'apod':
      case 'nasa_image':
      case 'gallery_image':
        return 'from-purple-500 to-pink-500';
      case 'celestial':
        return 'from-yellow-500 to-orange-500';
      case 'mars_photo':
        return 'from-red-600 to-red-400';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getContentTypeLabel = () => {
    switch (content.content_type) {
      case 'apod': return 'Astronomy Picture';
      case 'mars_photo': return 'Mars Photo';
      case 'epic': return 'Earth Image';
      case 'neo': return 'Near-Earth Object';
      case 'exoplanet': return 'Exoplanet';
      case 'space_weather': return 'Space Weather';
      case 'news': return 'Space News';
      case 'celestial': return 'Celestial Object';
      case 'event': return 'Space Event';
      case 'nasa_image': return 'NASA Image';
      case 'space_launch': return 'Space Launch';
      case 'gallery_image': return 'Gallery Image';
      default: return 'Saved Content';
    }
  };

  const getNavigationPath = () => {
    // Try to navigate to specific content if possible, otherwise fallback to section
    switch (content.content_type) {
      case 'event':
      case 'space_launch':
        return content.source_url || '/events';
      case 'news':
        // For news, try to navigate to specific article first
        return content.source_url || `/news`;
      case 'apod':
      case 'nasa_image':
      case 'gallery_image':
      case 'mars_photo':
      case 'epic':
        return content.source_url || '/gallery';
      case 'celestial':
        return '/skymap';
      default:
        return content.source_url || '/profile';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getThumbnail = () => {
    // Use the thumbnail_url field directly
    return content.thumbnail_url;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:border-white/30 transition-all duration-300"
    >
      {/* Thumbnail/Header */}
      <div className="relative h-48 overflow-hidden">
        {getThumbnail() ? (
          <img
            src={getThumbnail()}
            alt={content.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${getContentTypeColor()} opacity-80 flex items-center justify-center`}>
            <div className="text-white text-6xl opacity-50">
              {getContentTypeIcon()}
            </div>
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Content Type Badge */}
        <div className="absolute top-3 left-3">
          <div className={`px-3 py-1 bg-gradient-to-r ${getContentTypeColor()} rounded-full text-xs font-bold text-white flex items-center gap-1`}>
            {getContentTypeIcon()}
            {getContentTypeLabel()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleToggleFavorite}
            disabled={toggleFavorite.isPending}
            className={`p-2 rounded-full backdrop-blur-sm transition-all ${
              content.is_favorite 
                ? 'bg-red-500/80 text-white' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            title={content.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`h-4 w-4 ${content.is_favorite ? 'fill-current' : ''}`} />
          </button>
          
          <button
            onClick={handleDelete}
            disabled={deleteContent.isPending}
            className="p-2 bg-red-500/80 hover:bg-red-600/80 text-white rounded-full backdrop-blur-sm transition-all"
            title="Remove from saved content"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Favorite Indicator */}
        {content.is_favorite && (
          <div className="absolute bottom-3 right-3">
            <Heart className="h-5 w-5 text-red-500 fill-current" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors">
          {content.title}
        </h3>
        
        {(content.description || content.notes) && (
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {content.description || content.notes}
          </p>
        )}

        {/* Tags */}
        {content.tags && content.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {content.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-white/10 text-xs text-gray-300 rounded-full"
              >
                #{tag}
              </span>
            ))}
            {content.tags.length > 3 && (
              <span className="px-2 py-1 bg-white/10 text-xs text-gray-400 rounded-full">
                +{content.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Saved {formatDate(content.created_at)}</span>
          </div>
          
          {content.updated_at !== content.created_at && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Updated {formatDate(content.updated_at)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          {getNavigationPath().startsWith('http') ? (
            <a
              href={getNavigationPath()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors flex items-center gap-1"
            >
              View Original
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <Link
              to={getNavigationPath()}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors flex items-center gap-1"
            >
              View in {getContentTypeLabel()}
              <ExternalLink className="h-3 w-3" />
            </Link>
          )}

          {/* Source Link if available */}
          {content.source_url && (
            <a
              href={content.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-300 text-sm transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SavedContentCard;