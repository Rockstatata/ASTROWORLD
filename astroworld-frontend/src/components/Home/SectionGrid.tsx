import React from "react";
import QuickPreviewCard from "./QuickPreviewCard";

const SectionGrid: React.FC = () => {
  const cards = [
    {
      title: "Skymap",
      description: "View stars, planets, and satellites live above you.",
      image: "/static/imgs/skymap-preview.jpg",
      link: "/skymap",
    },
    {
      title: "Murph AI",
      description: "Ask Murph anything about the cosmos.",
      image: "/static/imgs/murphai-preview.jpg",
      link: "/murph-ai",
    },
    {
      title: "Space News",
      description: "Stay updated on missions, discoveries, and cosmic events.",
      image: "/static/imgs/news-preview.jpg",
      link: "/news",
    },
    {
      title: "Events",
      description: "Never miss meteor showers, eclipses, and conjunctions.",
      image: "/static/imgs/events-preview.jpg",
      link: "/events",
    },
    {
      title: "Explore",
      description: "Discover celestial objects and expand your knowledge.",
      image: "/static/imgs/explore-preview.jpg",
      link: "/explore",
    },
    {
      title: "Profile",
      description: "Manage your favorites, journals, and settings.",
      image: "/static/imgs/profile-preview.jpg",
      link: "/profile",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {cards.map((card) => (
        <QuickPreviewCard key={card.title} {...card} />
      ))}
    </section>
  );
};

export default SectionGrid;
