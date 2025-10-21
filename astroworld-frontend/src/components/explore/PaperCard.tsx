import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  BookOpen, 
  Calendar, 
  Users,
  Heart,
  MessageSquare,
  Tag,
  Eye
} from 'lucide-react';
import type { ResearchPaper } from '../../types/explore';

interface PaperCardProps {
  paper: ResearchPaper;
  onSave?: (paperId: number) => void;
  onUnsave?: (userPaperId: number) => void;
  onAddNote?: (paperId: number) => void;
  showActions?: boolean;
  className?: string;
}

const PaperCard: React.FC<PaperCardProps> = ({
  paper,
  onSave,
  onUnsave,
  onAddNote,
  showActions = true,
  className = ''
}) => {
  const [showFullAbstract, setShowFullAbstract] = useState(false);

  const publishedDate = new Date(paper.published_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const handleSaveClick = () => {
    if (paper.is_saved && paper.user_save_id) {
      onUnsave?.(paper.user_save_id);
    } else {
      onSave?.(paper.id);
    }
  };

  const handleAddNoteClick = () => {
    onAddNote?.(paper.id);
  };

  // Source badge styling
  const getSourceBadge = () => {
    const badges = {
      arxiv: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'arXiv' },
      nasa_ads: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'NASA ADS' },
      crossref: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Crossref' }
    };
    return badges[paper.source] || badges.arxiv;
  };

  const sourceBadge = getSourceBadge();

  // Truncate abstract for card view
  const truncatedAbstract = paper.abstract.length > 300 
    ? paper.abstract.substring(0, 300) + '...'
    : paper.abstract;

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
        <div className="flex-1">
          {/* Source Badge */}
          <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium mb-2 ${sourceBadge.bg} ${sourceBadge.text}`}>
            {sourceBadge.label}
          </div>
          
          {/* Title */}
          <h3 className="text-white font-semibold text-lg leading-tight mb-2 hover:text-space-blue-light transition-colors cursor-pointer">
            {paper.title}
          </h3>
          
          {/* Authors */}
          <p className="text-gray-400 text-sm mb-2 line-clamp-2">
            {paper.authors}
          </p>
          
          {/* Journal and Date */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {paper.journal && (
              <div className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                <span>{paper.journal}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{publishedDate}</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        {showActions && (
          <motion.button
            onClick={handleSaveClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              p-2 rounded-lg transition-all
              ${paper.is_saved
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300'
              }
            `}
          >
            <Heart className={`h-5 w-5 ${paper.is_saved ? 'fill-current' : ''}`} />
          </motion.button>
        )}
      </div>

      {/* Categories/Tags */}
      {paper.categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {paper.categories.slice(0, 3).map((category, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-space-violet/20 text-space-violet border border-space-violet/30"
            >
              <Tag className="h-3 w-3 mr-1" />
              {category}
            </span>
          ))}
          {paper.categories.length > 3 && (
            <span className="text-xs text-gray-500">
              +{paper.categories.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Abstract */}
      <div className="mb-4">
        <p className="text-gray-300 text-sm leading-relaxed">
          {showFullAbstract ? paper.abstract : truncatedAbstract}
        </p>
        {paper.abstract.length > 300 && (
          <button
            onClick={() => setShowFullAbstract(!showFullAbstract)}
            className="text-space-blue-light text-sm mt-2 hover:text-space-blue transition-colors"
          >
            {showFullAbstract ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{paper.save_count} saves</span>
          </div>
          {paper.citation_count > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{paper.citation_count} citations</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex gap-2">
          {/* View Paper */}
          {paper.external_url && (
            <motion.a
              href={paper.external_url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-space-gradient hover:opacity-90 text-white text-sm font-medium transition-all"
            >
              <Eye className="h-4 w-4" />
              View Paper
            </motion.a>
          )}

          {/* Download PDF */}
          {paper.pdf_url && (
            <motion.a
              href={paper.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 text-sm transition-all"
            >
              <Download className="h-4 w-4" />
              PDF
            </motion.a>
          )}

          {/* Add Note */}
          <motion.button
            onClick={handleAddNoteClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm transition-all"
          >
            <MessageSquare className="h-4 w-4" />
            Note
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

export default PaperCard;