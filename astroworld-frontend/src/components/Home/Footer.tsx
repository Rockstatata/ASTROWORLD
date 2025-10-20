import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => (
  <footer className="text-center py-8 text-gray-400 border-t border-gray-800">
    <div className="flex flex-wrap justify-center gap-4 mb-4 text-sm">
      <Link to="/skymap" className="hover:text-white transition">Skymap</Link>
      <Link to="/murph-ai" className="hover:text-white transition">Murph AI</Link>
      <Link to="/news" className="hover:text-white transition">News</Link>
      <Link to="/events" className="hover:text-white transition">Events</Link>
      <Link to="/explore" className="hover:text-white transition">Explore</Link>
      <Link to="/profile" className="hover:text-white transition">Profile</Link>
    </div>
    <p className="text-xs">
      © {new Date().getFullYear()} AstroWorld. Crafted with 🌌 by the Cosmos.
    </p>
  </footer>
);

export default Footer;
