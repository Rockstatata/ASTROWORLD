// src/components/Home/ApodHero.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useApod } from '../../hooks/nasa/useApod';
import { Link } from 'react-router-dom';
import { Telescope, Sparkles } from 'lucide-react';
import { FavoriteButton, SaveContentButton } from '../shared/ContentActions';

const ApodHero: React.FC = () => {
  const { data, loading } = useApod();

  return (
    <section className="relative h-[70vh] min-h-[600px] w-full overflow-hidden">
      {/* Background Image with Parallax Effect */}
      {data?.media_type === 'image' && (
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <img 
            src={data.hdurl || data.url} 
            alt={data.title} 
            className="absolute inset-0 h-full w-full object-cover opacity-60" 
          />
        </motion.div>
      )}
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black" />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-blue-900/20" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-6 text-center">
        {/* Logo/Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <h1 className="mb-4 text-6xl md:text-7xl lg:text-8xl font-extrabold">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              ASTROWORLD
            </span>
          </h1>
          <div className="flex items-center justify-center gap-2 text-xl md:text-2xl text-gray-300">
            <Telescope className="h-6 w-6 text-purple-400" />
            <span>Explore the Cosmos</span>
            <Sparkles className="h-6 w-6 text-blue-400" />
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-4 max-w-3xl text-lg md:text-xl text-gray-200 leading-relaxed"
        >
          Discover the universe through NASA's eyes — live sky maps, AI-powered exploration,
          space weather alerts, asteroid tracking, stunning Earth & Mars imagery, and the latest exoplanet discoveries.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex flex-wrap justify-center gap-4"
        >
          <Link 
            to="/skymap" 
            className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all duration-300 shadow-lg hover:shadow-purple-500/50 font-semibold text-lg"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Telescope className="h-5 w-5" />
              Launch Skymap
            </span>
          </Link>
          <Link 
            to="/murph-ai" 
            className="group relative px-8 py-4 rounded-2xl border-2 border-purple-400/50 hover:border-purple-400 bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all duration-300 font-semibold text-lg"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Ask Murph AI
            </span>
          </Link>
        </motion.div>

        {/* APOD Credit with Actions */}
        {loading && data && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 max-w-2xl"
          >
            <div className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-xs text-purple-300 font-semibold mb-1">NASA APOD — {data.date}</div>
                  <div className="text-sm font-bold text-white mb-1">{data.title}</div>
                  {data.copyright && (
                    <div className="text-xs text-gray-400">© {data.copyright}</div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <FavoriteButton
                    contentType="apod"
                    contentId={data.date}
                    title={data.title}
                    metadata={{
                      url: data.url,
                      hdurl: data.hdurl,
                      explanation: data.explanation,
                      copyright: data.copyright,
                    }}
                    size="md"
                  />
                  <SaveContentButton
                    contentType="apod"
                    contentId={data.date}
                    title={data.title}
                    metadata={{
                      url: data.url,
                      hdurl: data.hdurl,
                      explanation: data.explanation,
                      copyright: data.copyright,
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

    
    </section>
  );
};

export default ApodHero;
