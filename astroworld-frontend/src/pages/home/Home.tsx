import React from "react";
import Layout from "../../components/Layout";
import ApodHero from "../../components/Home/ApodHero";
import StarryBackground from "../../components/Home/StarryBackground";
import SectionGrid from "../../components/Home/SectionGrid";
import LiveSkyPreview from "../../components/Home/LiveSkyPreview";
import MurphPreview from "../../components/Home/MurphPreview";
import NewsCarousel from "../../components/Home/NewsCarousel";
import DonkiPanel from "../../components/Home/DonkiPanel";
import NeoWsPanel from "../../components/Home/NeoWsPanel";
import EpicPanel from "../../components/Home/EpicPanel";
import MarsPanel from "../../components/Home/MarsPanel";
import ExoplanetStat from "../../components/Home/ExoplanetStat";
import NASAImageGallery from "../../components/Home/NASAImageGallery";
import SatelliteTracker from "../../components/Home/SatelliteTracker";
import GIBSImageryMap from "../../components/Home/GIBSImageryMap";
import EventsShowcase from "../../components/Home/EventsShowcase";
import ProfileSummary from "../../components/Home/ProfileSummary";
import Footer from "../../components/Home/Footer";
import { SpaceXStatsCard } from "../../components/spacex";

const Home: React.FC = () => {
  return (
    <Layout>
      <div className="relative min-h-screen text-white overflow-hidden">
        {/* Animated Starry Background */}
        <StarryBackground />

        {/* Main Content - positioned above background */}
        <div className="relative z-10">
          {/* NASA APOD Hero Section */}
          <ApodHero />

          {/* Original Section Grid */}
          <SectionGrid />

          {/* Live Sky Preview */}
          <LiveSkyPreview />

          {/* Murph AI Preview */}
          <MurphPreview />

          {/* NASA Space Weather Alerts */}
          <DonkiPanel />

          {/* NASA Near-Earth Objects */}
          <NeoWsPanel />

          {/* News Carousel */}
          <NewsCarousel />

          {/* NASA Earth EPIC Images */}
          <EpicPanel />

          {/* NASA Mars Rover Photos */}
          <MarsPanel />

          {/* NASA Exoplanet Statistics */}
          <ExoplanetStat />

          {/* SpaceX Statistics */}
          <section className="py-20 px-6">
            <div className="max-w-4xl mx-auto">
              <SpaceXStatsCard />
            </div>
          </section>

          {/* NASA Image Gallery */}
          
            <NASAImageGallery />
          

          {/* Satellite Tracker */}
          
            <SatelliteTracker />
          

          {/* GIBS Earth Imagery */}
          
            <GIBSImageryMap />
          

          {/* Original Events Showcase */}
          <EventsShowcase />

          {/* Profile Summary */}
          <ProfileSummary />

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </Layout>
  );
};

export default Home;
