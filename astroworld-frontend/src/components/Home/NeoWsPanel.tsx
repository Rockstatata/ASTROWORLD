// src/components/Home/NeoWsPanel.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNeoWs } from '../../hooks/nasa/useNeoWs';
import { Orbit, AlertCircle, Gauge, Target, ChevronLeft, ChevronRight } from 'lucide-react';

const NeoWsPanel: React.FC = () => {
  const { objects, loading } = useNeoWs(1);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;
  
  const totalPages = Math.ceil(objects.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const currentObjects = objects.slice(startIndex, startIndex + itemsPerPage);
  
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(num);
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Near-Earth Objects
          </h2>
          <p className="text-gray-400 text-lg">Asteroids passing close to Earth today</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500/30 border-t-cyan-500" />
              <p className="text-gray-500">Scanning for asteroids...</p>
            </div>
          </div>
        ) : currentObjects.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Orbit className="h-16 w-16 mx-auto mb-4 text-cyan-500/50" />
            <p>No near-Earth objects detected today</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {currentObjects.map((obj, i) => {
              const ca = obj.close_approach_data?.[0];
              const diameter = obj.estimated_diameter?.kilometers;
              const avgDiameter = diameter 
                ? (diameter.estimated_diameter_min + diameter.estimated_diameter_max) / 2 
                : 0;

              return (
                <motion.div
                  key={obj.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  viewport={{ once: true }}
                  className="group relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 shadow-lg backdrop-blur-sm hover:border-cyan-500/50 hover:shadow-cyan-500/20 transition-all duration-300"
                >
                  {/* Glow Effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-300" />
                  
                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-white line-clamp-2 mb-1">
                          {obj.name}
                        </h3>
                        <div className="text-xs text-gray-500 font-mono">ID: {obj.id}</div>
                      </div>
                      {obj.is_potentially_hazardous_asteroid && (
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="flex items-center gap-1 rounded-full bg-red-500/20 px-3 py-1 ml-2"
                        >
                          <AlertCircle className="h-4 w-4 text-red-400" />
                          <span className="text-xs font-bold text-red-300">PHA</span>
                        </motion.div>
                      )}
                    </div>

                    {/* Details Grid */}
                    <div className="space-y-3">
                      {/* Diameter */}
                      {avgDiameter > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Target className="h-4 w-4 text-cyan-400" />
                          <span className="text-gray-400">Diameter:</span>
                          <span className="font-semibold text-white">
                            ~{avgDiameter.toFixed(2)} km
                          </span>
                        </div>
                      )}

                      {ca && (
                        <>
                          {/* Close Approach Date */}
                          <div className="flex items-center gap-2 text-sm">
                            <Orbit className="h-4 w-4 text-blue-400" />
                            <span className="text-gray-400">Closest:</span>
                            <span className="font-semibold text-white text-xs">
                              {new Date(ca.close_approach_date_full).toLocaleString()}
                            </span>
                          </div>

                          {/* Miss Distance */}
                          <div className="flex items-center gap-2 text-sm">
                            <Target className="h-4 w-4 text-purple-400" />
                            <span className="text-gray-400">Miss:</span>
                            <span className="font-semibold text-white">
                              {formatNumber(Number(ca.miss_distance.kilometers))} km
                            </span>
                          </div>

                          {/* Velocity */}
                          <div className="flex items-center gap-2 text-sm">
                            <Gauge className="h-4 w-4 text-green-400" />
                            <span className="text-gray-400">Speed:</span>
                            <span className="font-semibold text-white">
                              {Number(ca.relative_velocity.kilometers_per_second).toFixed(2)} km/s
                            </span>
                          </div>

                          {/* Lunar Distance */}
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <div className="text-xs text-gray-500">
                              {Number(ca.miss_distance.lunar).toFixed(2)} lunar distances
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && objects.length > itemsPerPage && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-8 flex items-center justify-center gap-4"
          >
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 0}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 disabled:bg-gray-700/20 disabled:text-gray-500 text-cyan-300 rounded-lg transition-all disabled:cursor-not-allowed group"
            >
              <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              Previous
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                    i === currentPage
                      ? 'bg-cyan-500 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages - 1}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 disabled:bg-gray-700/20 disabled:text-gray-500 text-cyan-300 rounded-lg transition-all disabled:cursor-not-allowed group"
            >
              Next
              <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </motion.div>
        )}

        {/* Info Footer */}
        {!loading && currentObjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-8 text-center text-sm text-gray-500"
          >
            <p>
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, objects.length)} of {objects.length} objects detected.
              {totalPages > 1 && (
                <span className="block mt-1">
                  Page {currentPage + 1} of {totalPages}
                </span>
              )}
            </p>
            <p className="mt-2">Data from NASA's Near Earth Object Web Service.</p>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
};

export default NeoWsPanel;
