import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface QuickPreviewCardProps {
  title: string;
  description: string;
  image: string;
  link: string;
}

const QuickPreviewCard: React.FC<QuickPreviewCardProps> = ({
  title,
  description,
  image,
  link,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-lg hover:shadow-space-violet/40 transition-all backdrop-blur-lg"
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      </div>

      <div className="p-6 flex flex-col justify-between h-48">
        <div>
          <h3 className="text-2xl font-semibold mb-2 text-space-blue-light">
            {title}
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
        </div>

        <Link
          to={link}
          className="mt-4 inline-block w-full text-center py-2 bg-space-violet rounded-xl text-white font-medium hover:bg-space-violet/80 transition"
        >
          Open
        </Link>
      </div>
    </motion.div>
  );
};

export default QuickPreviewCard;
