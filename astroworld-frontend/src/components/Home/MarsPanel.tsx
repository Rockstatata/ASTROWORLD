// src/components/Home/MarsPanel.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMars } from '../../hooks/nasa/useMars';
import { Mountain, Camera, Calendar, Maximize2, X } from 'lucide-react';

const MarsPanel: React.FC = () => {
  const { photos, loading } = useMars('curiosity', 6);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Mars — Latest from Curiosity
          </h2>
          <p className="text-gray-400 text-lg">Recent photos from the Red Planet</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-500/30 border-t-red-500" />
              <p className="text-gray-500">Downloading from Mars...</p>
            </div>
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Mountain className="h-16 w-16 mx-auto mb-4 text-red-500/50" />
            <p>No recent Mars photos available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo, i) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
                whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg hover:shadow-red-500/20 cursor-pointer perspective-1000"
                onClick={() => setSelectedPhoto(photo.img_src)}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-black">
                  <img 
                    src={photo.img_src} 
                    alt={`Mars - ${photo.camera.full_name}`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                    <div className="flex items-center gap-2 text-white">
                      <Maximize2 className="h-5 w-5" />
                      <span className="font-semibold">View Full Size</span>
                    </div>
                  </div>

                  {/* Mars Badge */}
                  <div className="absolute top-4 left-4 rounded-full bg-red-500/80 backdrop-blur-sm px-3 py-1 flex items-center gap-1.5">
                    <Mountain className="h-4 w-4 text-white" />
                    <span className="text-xs font-bold text-white">MARS</span>
                  </div>
                </div>

                {/* Info Panel */}
                <div className="p-4 bg-gradient-to-br from-red-950/40 to-black/60 backdrop-blur-sm space-y-2">
                  {/* Camera */}
                  <div className="flex items-center gap-2 text-sm">
                    <Camera className="h-4 w-4 text-red-400" />
                    <span className="text-gray-300 font-semibold">
                      {photo.camera.name}
                    </span>
                  </div>
                  
                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-orange-400" />
                    <span className="text-gray-400 font-mono text-xs">
                      {new Date(photo.earth_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Rover Status */}
                  <div className="pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{photo.rover.name}</span>
                      <span className="text-xs text-green-400 font-semibold">{photo.rover.status}</span>
                    </div>
                  </div>
                </div>

                {/* Scan Line Effect */}
                <motion.div
                  animate={{ y: ['0%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-red-400/50 to-transparent opacity-0 group-hover:opacity-100"
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedPhoto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
              onClick={() => setSelectedPhoto(null)}
            >
              <motion.div
                initial={{ scale: 0.8, rotateY: -20 }}
                animate={{ scale: 1, rotateY: 0 }}
                exit={{ scale: 0.8, rotateY: 20 }}
                className="relative max-w-5xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <img 
                  src={selectedPhoto} 
                  alt="Mars Full Size"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-colors"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Footer */}
        {!loading && photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-sm">
              <Mountain className="h-5 w-5 text-red-400" />
              <span className="text-sm text-gray-300">
                Photos by {photos[0]?.rover.name} Rover • Landed {new Date(photos[0]?.rover.landing_date).toLocaleDateString()}
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
};

export default MarsPanel;
