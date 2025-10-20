// src/components/Home/EpicPanel.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEpic } from '../../hooks/nasa/useEpic';
import { nasa } from '../../services/nasa/nasaAPI';
import { Globe, Calendar, Maximize2, X } from 'lucide-react';

const EpicPanel: React.FC = () => {
  const { items, loading } = useEpic(6);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Earth from Space
          </h2>
          <p className="text-gray-400 text-lg">Latest imagery from NASA's EPIC camera</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500/30 border-t-green-500" />
              <p className="text-gray-500">Loading Earth imagery...</p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Globe className="h-16 w-16 mx-auto mb-4 text-green-500/50" />
            <p>No recent EPIC images available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => {
              const imageUrl = nasa.epicImageUrl(item.date, item.image, 'jpg');
              return (
                <motion.div
                  key={item.image}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  viewport={{ once: true }}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg hover:shadow-green-500/20 cursor-pointer"
                  onClick={() => setSelectedImage(imageUrl)}
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img 
                      src={imageUrl} 
                      alt={`Earth - ${new Date(item.date).toLocaleString()}`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                      <div className="flex items-center gap-2 text-white">
                        <Maximize2 className="h-5 w-5" />
                        <span className="font-semibold">View Full Size</span>
                      </div>
                    </div>
                  </div>

                  {/* Caption */}
                  <div className="p-4 bg-black/40 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Calendar className="h-4 w-4 text-green-400" />
                      <span className="font-mono">
                        {new Date(item.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
              onClick={() => setSelectedImage(null)}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="relative max-w-5xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <img 
                  src={selectedImage} 
                  alt="Earth Full Size"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-colors"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Footer */}
        {!loading && items.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-sm">
              <Globe className="h-5 w-5 text-green-400" />
              <span className="text-sm text-gray-300">
                Images captured by DSCOVR satellite • 1 million miles from Earth
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
};

export default EpicPanel;
