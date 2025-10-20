// src/components/Home/NASAImageGallery.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePopularNASAImages, useNASAImageSearch } from '../../hooks/nasa/useNASAImages';
import { Search, Calendar, Camera, Video, Mic, X, Download } from 'lucide-react';
import type { NASAMediaItem } from '../../services/nasa/nasaAPI';

interface ImageGalleryProps {
  className?: string;
}

const NASAImageGallery: React.FC<ImageGalleryProps> = ({ className = '' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | undefined>('image');
  const [yearRange, setYearRange] = useState({ start: '', end: '' });
  const [selectedImage, setSelectedImage] = useState<NASAMediaItem | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  // Use popular images by default, search when query is provided
  const { data: popularImages, isLoading: popularLoading } = usePopularNASAImages();
  const { data: searchResults, isLoading: searchLoading } = useNASAImageSearch({
    q: searchQuery,
    media_type: mediaType,
    year_start: yearRange.start,
    year_end: yearRange.end,
  });

  const images = searchQuery ? searchResults?.collection?.items || [] : popularImages || [];
  const isLoading = searchQuery ? searchLoading : popularLoading;

  // Ensure images is always an array
  const safeImages = Array.isArray(images) ? images : [];

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Mic className="w-4 h-4" />;
      default: return <Camera className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownload = async (imageUrl: string, title: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nasa_${title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">NASA Image Library</h2>
          <p className="text-gray-400">Explore NASA's vast collection of images, videos, and audio</p>
        </div>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Search className="w-4 h-4" />
          {showSearch ? 'Hide Search' : 'Search'}
        </button>
      </div>

      {/* Search Panel */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-800/50 rounded-lg p-4 mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Query */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., Mars, Galaxy, ISS..."
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Media Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Media Type</label>
                <select
                  value={mediaType || ''}
                  onChange={(e) => setMediaType(e.target.value as 'image' | 'video' | 'audio' | undefined)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">All Types</option>
                  <option value="image">Images</option>
                  <option value="video">Videos</option>
                  <option value="audio">Audio</option>
                </select>
              </div>

              {/* Year Start */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">From Year</label>
                <input
                  type="number"
                  value={yearRange.start}
                  onChange={(e) => setYearRange(prev => ({ ...prev, start: e.target.value }))}
                  placeholder="2000"
                  min="1958"
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Year End */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">To Year</label>
                <input
                  type="number"
                  value={yearRange.end}
                  onChange={(e) => setYearRange(prev => ({ ...prev, end: e.target.value }))}
                  placeholder="2024"
                  min="1958"
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Clear Search */}
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setYearRange({ start: '', end: '' });
                  setMediaType('image');
                }}
                className="mt-4 text-gray-400 hover:text-white text-sm"
              >
                Clear search and show popular images
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-400">Loading NASA images...</span>
        </div>
      )}

      {/* Image Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {safeImages.map((item, index) => (
            <motion.div
              key={item.nasa_id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 rounded-lg overflow-hidden hover:bg-gray-800/70 transition-all duration-300 cursor-pointer group"
              onClick={() => setSelectedImage(item)}
            >
              {/* Image/Thumbnail */}
              <div className="aspect-square relative overflow-hidden">
                {item.preview_url || item.thumbnail_url ? (
                  <img
                    src={item.preview_url || item.thumbnail_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    {getMediaIcon(item.media_type)}
                  </div>
                )}
                
                {/* Media Type Badge */}
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                  {getMediaIcon(item.media_type)}
                  <span className="text-xs text-white capitalize">{item.media_type}</span>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-white text-sm">Click to view</div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-white font-medium text-sm line-clamp-2 mb-2">
                  {item.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(item.date_created)}
                  </span>
                  {item.center && (
                    <span className="bg-gray-700 px-2 py-1 rounded text-xs">
                      {item.center}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!isLoading && safeImages.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            {searchQuery ? 'No images found for your search.' : 'No images available.'}
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-blue-400 hover:text-blue-300"
            >
              Show popular images instead
            </button>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900 rounded-xl max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  {getMediaIcon(selectedImage.media_type)}
                  <span className="text-white font-medium">NASA {selectedImage.media_type}</span>
                </div>
                <div className="flex items-center gap-2">
                  {selectedImage.original_url && (
                    <button
                      onClick={() => handleDownload(selectedImage.original_url!, selectedImage.title)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-5 h-5 text-gray-400" />
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 max-h-[70vh]">
                {/* Image/Media */}
                <div className="relative bg-black flex items-center justify-center">
                  {selectedImage.original_url || selectedImage.preview_url ? (
                    <img
                      src={selectedImage.original_url || selectedImage.preview_url}
                      alt={selectedImage.title}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-gray-400 text-center p-8">
                      {getMediaIcon(selectedImage.media_type)}
                      <div className="mt-2">Media preview not available</div>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-6 overflow-y-auto">
                  <h2 className="text-xl font-bold text-white mb-4">{selectedImage.title}</h2>
                  
                  {selectedImage.description && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-300 mb-2">Description</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {selectedImage.description}
                      </p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-300">Date Created:</span>
                      <span className="text-gray-400 text-sm ml-2">{formatDate(selectedImage.date_created)}</span>
                    </div>
                    
                    {selectedImage.center && (
                      <div>
                        <span className="text-sm font-medium text-gray-300">NASA Center:</span>
                        <span className="text-gray-400 text-sm ml-2">{selectedImage.center}</span>
                      </div>
                    )}

                    {selectedImage.photographer && (
                      <div>
                        <span className="text-sm font-medium text-gray-300">Photographer:</span>
                        <span className="text-gray-400 text-sm ml-2">{selectedImage.photographer}</span>
                      </div>
                    )}

                    {selectedImage.keywords && selectedImage.keywords.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-300 block mb-2">Keywords:</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedImage.keywords.slice(0, 10).map((keyword: string, index: number) => (
                            <span
                              key={index}
                              className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
                            >
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

export default NASAImageGallery;