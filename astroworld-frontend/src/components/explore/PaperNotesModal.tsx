import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Save, 
  BookOpen, 
  Users, 
  Calendar,
  ExternalLink,
  Download,
  Hash
} from 'lucide-react';
import type { ResearchPaper } from '../../types/explore';
import { useUpdateSavedPaper } from '../../hooks/useExplore';

interface PaperNotesModalProps {
  paper: ResearchPaper | null;
  isOpen: boolean;
  onClose: () => void;
  initialNotes?: string;
  userPaperId?: number;
}

const PaperNotesModal: React.FC<PaperNotesModalProps> = ({
  paper,
  isOpen,
  onClose,
  initialNotes = '',
  userPaperId
}) => {
  const [notes, setNotes] = useState(initialNotes);
  const [isPreview, setIsPreview] = useState(false);
  
  const updateNotesMutation = useUpdateSavedPaper();

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes, paper]);

  const handleSave = async () => {
    if (!paper || !userPaperId) return;
    
    try {
      await updateNotesMutation.mutateAsync({
        userPaperId,
        data: {
          notes,
          is_favorite: false, // Optional: could add favorite toggle
          read_status: 'reading' // Optional: could add read status
        }
      });
      onClose();
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  const handleClose = () => {
    setNotes(initialNotes); // Reset notes if not saved
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering - in production, use a proper markdown library
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">$1</code>')
      .replace(/\n/g, '<br>');
  };

  if (!paper) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-indigo-500" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Paper Notes
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col lg:flex-row h-[calc(90vh-100px)]">
              {/* Paper Info Sidebar */}
              <div className="lg:w-1/3 p-6 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight">
                      {paper.title}
                    </h3>
                  </div>

                  {/* Authors */}
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {paper.authors}
                    </p>
                  </div>

                  {/* Publication Date */}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {formatDate(paper.published_date)}
                    </span>
                  </div>

                  {/* Journal */}
                  {paper.journal && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                        {paper.journal}
                      </span>
                    </div>
                  )}

                  {/* Keywords */}
                  {paper.keywords.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Hash className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          Keywords
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {paper.keywords.slice(0, 8).map((keyword, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Abstract */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Abstract</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {paper.abstract}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    {paper.pdf_url && (
                      <a
                        href={paper.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors text-sm"
                      >
                        <Download className="w-4 h-4" />
                        PDF
                      </a>
                    )}
                    
                    {paper.external_url && (
                      <a
                        href={paper.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Source
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes Editor */}
              <div className="lg:w-2/3 p-6 flex flex-col">
                {/* Editor Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Your Notes</h4>
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                      <button
                        onClick={() => setIsPreview(false)}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                          !isPreview
                            ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setIsPreview(true)}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                          isPreview
                            ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSave}
                    disabled={updateNotesMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {updateNotesMutation.isPending ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>

                {/* Editor Content */}
                <div className="flex-1 min-h-0">
                  {isPreview ? (
                    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      {notes ? (
                        <div
                          className="prose dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(notes) }}
                        />
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">No notes yet. Switch to Edit mode to add your thoughts.</p>
                      )}
                    </div>
                  ) : (
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add your notes, thoughts, and annotations here...

You can use basic markdown:
**bold text**
*italic text*
`code snippets`

Organize your research with sections like:
- Key findings
- Questions to explore
- Connections to other papers
- Personal insights"
                      className="w-full h-full resize-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-500"
                    />
                  )}
                </div>

                {/* Markdown Help */}
                {!isPreview && (
                  <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                    Supports basic markdown: **bold**, *italic*, `code`
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaperNotesModal;