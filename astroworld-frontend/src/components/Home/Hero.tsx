import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Hero: React.FC = () => (
  <section className="relative py-32 text-center overflow-hidden">
    <motion.h1
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-space-blue-light via-space-violet to-space-pink bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(128,0,255,0.4)]"
    >
      Welcome to AstroWorld
    </motion.h1>
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 1 }}
      className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto mb-10"
    >
      Your interactive universe — explore stars, talk to Murph, and stay updated on cosmic events.
    </motion.p>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="flex justify-center gap-4"
    >
      <Link
        to="/skymap"
        className="px-8 py-3 bg-space-violet rounded-xl font-semibold hover:scale-105 transition-all"
      >
        Launch Skymap
      </Link>
      <Link
        to="/murph-ai"
        className="px-8 py-3 border border-space-violet rounded-xl hover:bg-space-violet/10 transition-all"
      >
        Talk to Murph
      </Link>
    </motion.div>
  </section>
);

export default Hero;
