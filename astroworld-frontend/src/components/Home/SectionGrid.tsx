import React from "react";
import QuickPreviewCard from "./QuickPreviewCard";
import Skymap from '../../assets/images/skymap.png'
import Murphai from '../../assets/images/murphai.png'
import News from '../../assets/images/News.png'
import Events from '../../assets/images/Events.png'
import Explore from '../../assets/images/Explore.png'
import Profile from '../../assets/images/Profile.png'

const SectionGrid: React.FC = () => {
  const cards = [
    {
      title: "Skymap",
      description: "View stars, planets, and satellites live above you.",
      image: Skymap,
      link: "/skymap",
    },
    {
      title: "Murph AI",
      description: "Ask Murph anything about the cosmos.",
      image: Murphai,
      link: "/murph-ai",
    },
    {
      title: "Space News",
      description: "Stay updated on missions, discoveries, and cosmic events.",
      image: News,
      link: "/news",
    },
    {
      title: "Events",
      description: "Never miss meteor showers, eclipses, and conjunctions.",
      image: Events,
      link: "/events",
    },
    {
      title: "Explore",
      description: "Discover celestial objects and expand your knowledge.",
      image: Explore,
      link: "/explore",
    },
    {
      title: "Profile",
      description: "Manage your favorites, journals, and settings.",
      image: Profile,
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
