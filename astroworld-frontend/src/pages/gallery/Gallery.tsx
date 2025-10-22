import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera,
  Globe,
  Telescope,
  Rocket,
  Star,
  Heart,
  Download,
  Search,
  Filter,
  Grid,
  List,
  ChevronRight,
  BookOpen,
  Satellite,
  MapPin,
  Calendar,
  Eye,
  Bookmark
} from 'lucide-react';
import Layout from '../../components/Layout';
import StarryBackground from '../../components/Home/StarryBackground';
import SaveButton from '../../components/common/SaveButton';
import { useNASAImageSearch, usePopularNASAImages, useToggleFavoriteImage, useSaveFavoriteImage } from '../../hooks/useNASAImages';
import { useAPOD, useMarsPhotos, useLatestMarsPhotos } from '../../hooks/useNASAData';
import type { NASAMediaItem } from '../../services/nasa/nasaServices';

type GallerySection = 'overview' | 'nasa-library' | 'gibs-earth' | 'apod' | 'epic' | 'mars-rover';
type ViewMode = 'grid' | 'list';

// Section Component Props
interface SectionProps {
  searchQuery: string;
  viewMode: ViewMode;
}

// NASA Image Library Section Component
const NASAImageLibrarySection: React.FC<SectionProps & { 
  currentPage: number; 
  setCurrentPage: (page: number) => void;
  selectedImage: NASAMediaItem | null;
  setSelectedImage: (image: NASAMediaItem | null) => void;
}> = ({ searchQuery, viewMode, currentPage, setCurrentPage, selectedImage, setSelectedImage }) => {
  const [currentQuery, setCurrentQuery] = useState('hubble space telescope');
  const effectiveQuery = searchQuery || currentQuery;
  
  const { data: searchResults, isLoading, error } = useNASAImageSearch({
    q: effectiveQuery,
    media_type: 'image',
    page: currentPage,
    page_size: 24
  });

  const toggleFavorite = useToggleFavoriteImage();
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
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading NASA images...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <Camera className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <p className="text-red-400 text-lg">Failed to load NASA images</p>
        <p className="text-gray-400 text-sm mt-2">Please try again later</p>
      </div>
    );
  }

  const images = searchResults?.collection?.items || [];

  return (
    <div className="space-y-6">
      {/* Search Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">
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

      {/* Image Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
      {images.length > 0 && (
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

// Placeholder components for other sections
const APODSection: React.FC<SectionProps> = () => (
  <div className="text-center py-20">
    <Star className="h-20 w-20 text-yellow-500 mx-auto mb-6" />
    <h3 className="text-2xl font-bold text-white mb-4">APOD Gallery Coming Soon</h3>
    <p className="text-gray-400">Astronomy Picture of the Day collection</p>
  </div>
);

const MarsRoverSection: React.FC<SectionProps> = () => (
  <div className="text-center py-20">
    <Rocket className="h-20 w-20 text-red-500 mx-auto mb-6" />
    <h3 className="text-2xl font-bold text-white mb-4">Mars Rover Photos Coming Soon</h3>
    <p className="text-gray-400">Latest images from Curiosity and Perseverance</p>
  </div>
);

const EPICSection: React.FC<SectionProps> = () => (
  <div className="text-center py-20">
    <Satellite className="h-20 w-20 text-cyan-500 mx-auto mb-6" />
    <h3 className="text-2xl font-bold text-white mb-4">EPIC Earth Images Coming Soon</h3>
    <p className="text-gray-400">Earth from deep space perspective</p>
  </div>
);

const GIBSSection: React.FC<SectionProps> = () => (
  <div className="text-center py-20">
    <Globe className="h-20 w-20 text-green-500 mx-auto mb-6" />
    <h3 className="text-2xl font-bold text-white mb-4">GIBS Earth Imagery Coming Soon</h3>
    <p className="text-gray-400">Real-time satellite data visualization</p>
  </div>
);

const Gallery: React.FC = () => {
  const [activeSection, setActiveSection] = useState<GallerySection>('overview');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState<NASAMediaItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const sections = [
    {
      id: 'overview' as GallerySection,
      title: 'Gallery Overview',
      description: 'Explore all NASA image collections',
      icon: Camera,
      color: 'from-purple-500 to-blue-500'
    },
    {
      id: 'nasa-library' as GallerySection,
      title: 'NASA Image Library',
      description: 'Vast collection of images, videos, and audio',
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'gibs-earth' as GallerySection,
      title: 'GIBS Earth Imagery',
      description: 'Real Earth satellite data',
      icon: Globe,
      color: 'from-green-500 to-blue-500'
    },
    {
      id: 'apod' as GallerySection,
      title: 'Astronomy Picture of the Day',
      description: 'Daily stunning cosmic imagery',
      icon: Star,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'epic' as GallerySection,
      title: 'EPIC Earth Images',
      description: 'Earth from deep space perspective',
      icon: Satellite,
      color: 'from-cyan-500 to-teal-500'
    },
    {
      id: 'mars-rover' as GallerySection,
      title: 'Mars Rover Photos',
      description: 'Latest from Curiosity and Perseverance',
      icon: Rocket,
      color: 'from-red-500 to-orange-500'
    }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          NASA Image Gallery
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Explore the universe through NASA's incredible collection of images, from deep space observations 
          to Mars rover discoveries and real-time Earth imagery.
        </p>
      </motion.div>

      {/* Section Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.slice(1).map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setActiveSection(section.id)}
            className="group cursor-pointer"
          >
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl border border-white/10 p-8 hover:border-purple-500/50 transition-all duration-500 hover:scale-105">
              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${section.color} p-4 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <section.icon className="w-full h-full text-white" />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                {section.title}
              </h3>
              <p className="text-gray-400 mb-6 line-clamp-2">
                {section.description}
              </p>

              {/* Action */}
              <div className="flex items-center justify-between">
                <span className="text-purple-400 font-medium group-hover:text-purple-300 transition-colors">
                  Explore Collection
                </span>
                <ChevronRight className="h-5 w-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Stats placeholder */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Camera className="h-4 w-4" />
                  <span>1000+ Images</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Heart className="h-4 w-4" />
                  <span>Save Favorites</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Featured Showcase */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-sm rounded-2xl border border-white/10 p-8 mt-12"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Featured Today</h2>
            <p className="text-gray-400">Handpicked stunning imagery from across the cosmos</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm font-medium transition-all">
              View All
            </button>
          </div>
        </div>

        {/* Featured Images Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="group cursor-pointer">
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h4 className="text-white font-bold mb-1">Featured Image {item}</h4>
                  <p className="text-gray-300 text-sm">NASA Collection</p>
                </div>
                <div className="absolute top-4 right-4">
                  <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all">
                    <Heart className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const renderGalleryContent = () => {
    switch (activeSection) {
      case 'nasa-library':
        return <NASAImageLibrarySection 
          searchQuery={searchQuery} 
          viewMode={viewMode} 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
        />;
      case 'apod':
        return <APODSection searchQuery={searchQuery} viewMode={viewMode} />;
      case 'mars-rover':
        return <MarsRoverSection searchQuery={searchQuery} viewMode={viewMode} />;
      case 'epic':
        return <EPICSection searchQuery={searchQuery} viewMode={viewMode} />;
      case 'gibs-earth':
        return <GIBSSection searchQuery={searchQuery} viewMode={viewMode} />;
      default:
        return (
          <div className="text-center py-20">
            <Telescope className="h-20 w-20 text-gray-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">
              Coming Soon
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              We're working on integrating this NASA data source. 
              Check back soon for incredible imagery and interactive features!
            </p>
          </div>
        );
    }
  };

  const renderSectionContent = () => {
    const currentSection = sections.find(s => s.id === activeSection);
    
    return (
      <div className="space-y-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveSection('overview')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-400 rotate-180" />
            </button>
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${currentSection?.color} p-3`}>
              {currentSection?.icon && <currentSection.icon className="w-full h-full text-white" />}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{currentSection?.title}</h1>
              <p className="text-gray-400">{currentSection?.description}</p>
            </div>
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-900/80 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-purple-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'list' 
                    ? 'bg-purple-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-white/10 p-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
                >
                  <option value="all">All Types</option>
                  <option value="images">Images</option>
                  <option value="videos">Videos</option>
                  <option value="audio">Audio</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="min-h-[600px]"
        >
          {renderGalleryContent()}
        </motion.div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="relative min-h-screen text-white overflow-hidden">
        {/* Animated Starry Background */}
        <StarryBackground />
        
        {/* Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <AnimatePresence mode="wait">
            {activeSection === 'overview' ? (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {renderOverview()}
              </motion.div>
            ) : (
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderSectionContent()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default Gallery;