import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const ProfileSummary: React.FC = () => {
  const user = { name: "Explorer", favorites: 8, journals: 3 };

  return (
    <section className="py-20 text-center">
      <h2 className="text-4xl font-bold mb-4">Your Astro Profile</h2>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-lg shadow-lg"
      >
        <p className="text-xl font-medium mb-4 text-gray-200">
          Welcome back, {user.name} 👋
        </p>
        <div className="flex justify-center gap-10 text-gray-400">
          <div>
            <span className="text-3xl font-semibold text-space-violet">
              {user.favorites}
            </span>
            <p>Favorites</p>
          </div>
          <div>
            <span className="text-3xl font-semibold text-space-violet">
              {user.journals}
            </span>
            <p>Journals</p>
          </div>
        </div>
        <Link
          to="/profile"
          className="mt-6 inline-block px-6 py-2 bg-space-violet rounded-xl text-white font-semibold hover:bg-space-violet/80 transition"
        >
          Go to Profile
        </Link>
      </motion.div>
    </section>
  );
};

export default ProfileSummary;
