// src/components/Home/ExoplanetStat.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useExoplanetCount } from '../../hooks/nasa/useExoplanets';
import { Globe, TrendingUp, Sparkles, ArrowRight, Search, MapPin } from 'lucide-react';

const ExoplanetStat: React.FC = () => {
  const { data, loading } = useExoplanetCount();
  const [displayCount, setDisplayCount] = useState(0);
  const navigate = useNavigate();

  const handleExploreClick = () => {
    // Navigate to explore page with exoplanet focus
    navigate('/explore?category=planetary&search=exoplanet');
  };

  const handleSkymapClick = () => {
    // Navigate to skymap for exoplanet visualization
    navigate('/skymap?filter=exoplanets');
  };

  // Animated counter
  useEffect(() => {
    if (!data?.count) return;
    
    const targetCount = data.count;
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = targetCount / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetCount) {
        setDisplayCount(targetCount);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [data?.count]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20 p-12 shadow-2xl backdrop-blur-sm"
      >
        {/* Animated Background Gradient */}
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.15), transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.15), transparent 50%)',
              'radial-gradient(circle at 50% 80%, rgba(236, 72, 153, 0.15), transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.15), transparent 50%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
        />

        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Icon */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="mb-6 inline-block"
          >
            <div className="relative">
              <Globe className="h-16 w-16 text-purple-400" />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0"
              >
                <Globe className="h-16 w-16 text-blue-400" />
              </motion.div>
            </div>
          </motion.div>

          {/* Title */}
          <h2 className="mb-4 text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Confirmed Exoplanets
          </h2>

          {/* Count */}
          <div className="mb-6">
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500/30 border-t-purple-500" />
                <span className="text-2xl text-gray-400">Loading...</span>
              </div>
            ) : (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="relative inline-block"
              >
                <div className="text-7xl md:text-8xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {displayCount.toLocaleString()}
                </div>
                
                {/* Sparkle Effects */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4"
                >
                  <Sparkles className="h-8 w-8 text-yellow-400" />
                </motion.div>
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [360, 180, 0],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  className="absolute -bottom-4 -left-4"
                >
                  <Sparkles className="h-8 w-8 text-blue-400" />
                </motion.div>
              </motion.div>
            )}
          </div>

          {/* Description */}
          <p className="mx-auto max-w-2xl text-gray-300 text-lg mb-6">
            Planets discovered beyond our solar system, orbiting distant stars across the galaxy.
            Each one represents a world waiting to be explored.
          </p>

          {/* Interactive Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <motion.button
              onClick={handleExploreClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
            >
              <Search className="h-5 w-5" />
              Explore Research
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <motion.button
              onClick={handleSkymapClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
            >
              <MapPin className="h-5 w-5" />
              View in Sky
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-4xl mx-auto">
            <motion.button
              onClick={handleExploreClick}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-green-400/50 hover:bg-green-400/10 transition-all duration-300 cursor-pointer group"
            >
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-400 group-hover:scale-110 transition-transform" />
              <div className="text-2xl font-bold text-white mb-1">Growing</div>
              <div className="text-sm text-gray-400 group-hover:text-green-300">New discoveries weekly</div>
            </motion.button>

            <motion.button
              onClick={handleSkymapClick}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-blue-400/50 hover:bg-blue-400/10 transition-all duration-300 cursor-pointer group"
            >
              <Globe className="h-8 w-8 mx-auto mb-2 text-blue-400 group-hover:scale-110 transition-transform" />
              <div className="text-2xl font-bold text-white mb-1">Diverse</div>
              <div className="text-sm text-gray-400 group-hover:text-blue-300">From gas giants to super-Earths</div>
            </motion.button>

            <motion.button
              onClick={handleExploreClick}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-purple-400/50 hover:bg-purple-400/10 transition-all duration-300 cursor-pointer group"
            >
              <Sparkles className="h-8 w-8 mx-auto mb-2 text-purple-400 group-hover:scale-110 transition-transform" />
              <div className="text-2xl font-bold text-white mb-1">Exploration</div>
              <div className="text-sm text-gray-400 group-hover:text-purple-300">The search continues</div>
            </motion.button>
          </div>

          {/* Source */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-8 text-xs text-gray-500"
          >
            Data from NASA Exoplanet Archive • Caltech/IPAC
          </motion.div>
        </div>

        {/* Orbiting Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                x: [0, Math.random() * 100 - 50, 0],
                y: [0, Math.random() * 100 - 50, 0],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: i * 0.5,
              }}
              className="absolute rounded-full bg-purple-400/30 blur-xl"
              style={{
                width: `${20 + Math.random() * 40}px`,
                height: `${20 + Math.random() * 40}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default ExoplanetStat;
