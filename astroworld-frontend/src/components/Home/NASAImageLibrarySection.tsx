// src/components/Home/NASAImageLibrarySection.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Heart,
  Eye
} from 'lucide-react';
import SaveButton from '../../components/common/SaveButton';
import { useNASAImageSearch, useSaveFavoriteImage } from '../../hooks/useNASAImages';
import type { NASAMediaItem } from '../../services/nasa/nasaServices';

type ViewMode = 'grid' | 'list';

// Section Component Props
interface NASAImageLibrarySectionProps {
  searchQuery?: string;
  viewMode?: ViewMode;
  currentPage?: number;
  setCurrentPage?: (page: number) => void;
  selectedImage?: NASAMediaItem | null;
  setSelectedImage?: (image: NASAMediaItem | null) => void;
  showSearch?: boolean;
  className?: string;
}

// NASA Image Library Section Component
const NASAImageLibrarySection: React.FC<NASAImageLibrarySectionProps> = ({
  searchQuery = '',
  viewMode = 'grid',
  currentPage = 1,
  setCurrentPage = () => {},
  selectedImage = null,
  setSelectedImage = () => {},
  showSearch = true,
  className = ''
}) => {
  const [currentQuery] = useState('hubble space telescope');
  const effectiveQuery = searchQuery || currentQuery;

  const { data: searchResults, isLoading, error } = useNASAImageSearch({
    q: effectiveQuery,
    media_type: 'image',
    page: currentPage,
    page_size: 20
  });

  const saveFavorite = useSaveFavoriteImage();

  // Reset page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [effectiveQuery, setCurrentPage]);

  const handleFavorite = async (item: NASAMediaItem) => {
    const data = item.data[0];
    try {
      await saveFavorite.mutateAsync({
        nasa_id: data.nasa_id,
        title: data.title,
        notes: data.description || '',
        tags: data.keywords || []
      });
      // Show success message
      console.log('Image saved to favorites successfully!');
    } catch (error) {
      console.error('Failed to save image:', error);
      // You could show an error toast here
    }
  };

  if (isLoading) {
    return (
      <div className={`text-center py-20 ${className}`}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading NASA images...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-20 ${className}`}>
        <Camera className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <p className="text-red-400 text-lg">Failed to load NASA images</p>
        <p className="text-gray-400 text-sm mt-2">Please try again later</p>
      </div>
    );
  }

  const images = searchResults?.collection?.items || [];

  return (
    <div className={`space-y-6 ${className} px-12`}>
      {/* Search Summary */}
      {showSearch && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl  font-bold text-white">
              NASA Image Library Results
            </h3>
            <p className="text-gray-400">
              Found {images.length} images for "{effectiveQuery}"
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {searchResults?.collection?.metadata?.total_hits || 0} total available
          </div>
        </div>
      )}

      {/* Image Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {images.map((item: NASAMediaItem, index: number) => {
            const data = item.data[0];
            const imageUrl = item.links?.[0]?.href;

            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group cursor-pointer"
                onClick={() => setSelectedImage(item)}
              >
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
                  {/* Image */}
                  <div className="aspect-square relative overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={data.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                        <Camera className="h-12 w-12 text-gray-500" />
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Save Button */}
                    <div
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <SaveButton
                        contentType="nasa_image"
                        contentId={data.nasa_id}
                        contentTitle={data.title}
                        contentDescription={data.description}
                        thumbnailUrl={imageUrl}
                        sourceUrl={item.href}
                        metadata={{
                          media_type: data.media_type,
                          center: data.center,
                          date_created: data.date_created,
                          keywords: data.keywords,
                          nasa_id: data.nasa_id
                        }}
                        variant="heart"
                        size="sm"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h4 className="text-white font-bold line-clamp-2 mb-2">
                      {data.title}
                    </h4>
                    <p className="text-gray-400 text-sm line-clamp-3 mb-3">
                      {data.description}
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{data.center || 'NASA'}</span>
                      <span>
                        {data.date_created
                          ? new Date(data.date_created).getFullYear()
                          : 'Unknown'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {images.map((item: NASAMediaItem, index: number) => {
            const data = item.data[0];
            const imageUrl = item.links?.[0]?.href;

            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group cursor-pointer"
                onClick={() => setSelectedImage(item)}
              >
                <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:border-purple-500/50 transition-all">
                  <div className="flex items-start gap-6">
                    {/* Thumbnail */}
                    <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={data.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                          <Camera className="h-8 w-8 text-gray-500" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-xl font-bold text-white line-clamp-2">
                          {data.title}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFavorite(item);
                          }}
                          disabled={saveFavorite.isPending}
                          className="p-2 hover:bg-white/10 rounded-lg transition-all ml-4 disabled:opacity-50"
                        >
                          <Heart className={`h-5 w-5 ${saveFavorite.isPending ? 'text-yellow-400' : 'text-gray-400 hover:text-red-400'}`} />
                        </button>
                      </div>

                      <p className="text-gray-300 mb-4 line-clamp-4">
                        {data.description}
                      </p>

                      {/* Tags */}
                      {data.keywords && data.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {data.keywords.slice(0, 5).map((keyword, i) => (
                            <span key={i} className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-xs">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span>{data.center || 'NASA'}</span>
                          <span>
                            {data.date_created
                              ? new Date(data.date_created).toLocaleDateString()
                              : 'Unknown date'
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {images.length > 0 && showSearch && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
          >
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, Math.ceil((searchResults?.collection?.metadata?.total_hits || 0) / 24)) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    currentPage === pageNum
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={images.length < 24}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* No Results */}
      {images.length === 0 && !isLoading && (
        <div className="text-center py-20">
          <Camera className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No images found</p>
          <p className="text-gray-500 text-sm mt-2">Try a different search term</p>
        </div>
      )}

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-4xl max-h-[90vh] bg-gray-900 rounded-xl overflow-hidden my-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
                  <h3 className="text-xl font-bold text-white truncate">
                    {selectedImage.data[0].title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleFavorite(selectedImage)}
                      disabled={saveFavorite.isPending}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Heart className={`h-5 w-5 ${saveFavorite.isPending ? 'text-yellow-400' : 'text-white hover:text-red-400'}`} />
                    </button>
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                  <div className="max-h-[50vh] relative bg-black">
                    <img
                      src={selectedImage.links?.[0]?.href}
                      alt={selectedImage.data[0].title}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="p-6">
                    <p className="text-gray-300 mb-4 leading-relaxed">
                      {selectedImage.data[0].description}
                    </p>

                    {/* Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Center:</span>
                        <span className="text-white ml-2">{selectedImage.data[0].center || 'NASA'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Date:</span>
                        <span className="text-white ml-2">
                          {selectedImage.data[0].date_created
                            ? new Date(selectedImage.data[0].date_created).toLocaleDateString()
                            : 'Unknown'
                          }
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">NASA ID:</span>
                        <span className="text-white ml-2">{selectedImage.data[0].nasa_id}</span>
                      </div>
                      {selectedImage.data[0].photographer && (
                        <div>
                          <span className="text-gray-400">Photographer:</span>
                          <span className="text-white ml-2">{selectedImage.data[0].photographer}</span>
                        </div>
                      )}
                    </div>

                    {/* Keywords */}
                    {selectedImage.data[0].keywords && selectedImage.data[0].keywords.length > 0 && (
                      <div className="mt-4">
                        <span className="text-gray-400 text-sm">Keywords:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedImage.data[0].keywords.map((keyword, i) => (
                            <span key={i} className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-xs">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NASAImageLibrarySection;