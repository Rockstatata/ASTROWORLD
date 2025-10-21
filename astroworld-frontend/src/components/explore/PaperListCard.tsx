import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Calendar, 
  Users,
  ExternalLink,
  Download
} from 'lucide-react';
import { 
  LikeButton, 
  SavePaperButton, 
  CommentButton 
} from './ExploreActions';
import type { ResearchPaperList } from '../../types/explore';

interface PaperListCardProps {
  paper: ResearchPaperList;
  onSave?: (paperId: number) => void;
  showActions?: boolean;
  className?: string;
}

const PaperListCard: React.FC<PaperListCardProps> = ({
  paper,
  onSave,

  showActions = true,
  className = ''
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateAuthors = (authors: string, maxLength: number = 100) => {
    if (authors.length <= maxLength) return authors;
    return authors.substring(0, maxLength) + '...';
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'nasa_ads':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'arxiv':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'crossref':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`
        bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6
        border border-gray-200/50 dark:border-gray-700/50
        hover:shadow-lg hover:shadow-indigo-500/10
        transition-all duration-200
        ${className}
      `}
    >
      {/* Header with source and date */}
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSourceColor(paper.source)}`}>
          {paper.source.toUpperCase().replace('_', ' ')}
        </span>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          {formatDate(paper.published_date)}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 leading-tight">
        {paper.title}
      </h3>

      {/* Authors */}
      <div className="flex items-start gap-2 mb-4">
        <Users className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          {truncateAuthors(paper.authors)}
        </p>
      </div>

      {/* Journal */}
      {paper.journal && (
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            {paper.journal}
          </span>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <SavePaperButton 
              paperId={paper.id}
              isSaved={paper.is_saved || false}
              userPaperId={paper.user_save_id}
              onSave={() => onSave?.(paper.id)}
              size="sm"
            />
            <LikeButton 
              targetType="paper"
              targetId={paper.id}
              size="sm"
            />
            <CommentButton 
              targetType="paper"
              targetId={paper.id}
              size="sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
              title="View Details"
            >
              <ExternalLink className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      )}

      {/* Save count indicator */}
      {paper.save_count > 0 && (
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Saved by {paper.save_count} {paper.save_count === 1 ? 'researcher' : 'researchers'}
        </div>
      )}
    </motion.div>
  );
};

export default PaperListCard;