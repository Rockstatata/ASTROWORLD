import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, Rocket, Clock } from "lucide-react";
import { spaceXService, type SpaceXLaunch } from "../../services/spaceXService";

const mockAstronomicalEvents = [
  { name: "Lyrid Meteor Shower", date: "April 22, 2025", type: "Meteor Shower" },
  { name: "Total Lunar Eclipse", date: "September 7, 2025", type: "Eclipse" },
  { name: "Mars Opposition", date: "December 10, 2025", type: "Planetary Event" },
];

const EventsShowcase: React.FC = () => {
  const [upcomingLaunches, setUpcomingLaunches] = useState<SpaceXLaunch[]>([]);

  useEffect(() => {
    fetchUpcomingLaunches();
  }, []);

  const fetchUpcomingLaunches = async () => {
    try {
      const launches = await spaceXService.getUpcomingLaunches();
      setUpcomingLaunches(launches.slice(0, 2)); // Get first 2 upcoming launches
    } catch (error) {
      console.error('Failed to fetch upcoming SpaceX launches:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Combine astronomical events and SpaceX launches
  const allEvents = [
    ...mockAstronomicalEvents.map(event => ({
      ...event,
      source: 'astronomical' as const,
      icon: Calendar
    })),
    ...upcomingLaunches.map(launch => ({
      name: launch.mission_name,
      date: formatDate(launch.launch_date_utc),
      type: "SpaceX Launch",
      source: 'spacex' as const,
      icon: Rocket,
      rocket: launch.rocket?.name
    }))
  ].slice(0, 6); // Show max 6 events

  return (
    <section className="py-20 px-6 text-center">
      <h2 className="text-4xl font-bold mb-6">Upcoming Events</h2>
      
      {allEvents.length === 0 ? (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl shadow-lg backdrop-blur-md">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Loading upcoming events...</p>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allEvents.map((event, i) => (
            <motion.div
              key={`${event.source}-${event.name}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-white/5 border border-white/10 p-6 rounded-2xl shadow-lg backdrop-blur-md transition-all duration-300 ${
                event.source === 'spacex' 
                  ? 'hover:shadow-orange-400/20 hover:border-orange-400/30' 
                  : 'hover:shadow-space-violet/40 hover:border-space-violet/30'
              }`}
            >
              <div className="flex items-center justify-center mb-3">
                <event.icon className={`w-6 h-6 ${
                  event.source === 'spacex' ? 'text-orange-400' : 'text-space-violet'
                }`} />
              </div>
              
              <h3 className="text-xl font-semibold mb-2 min-h-[3rem] flex items-center justify-center">
                {event.name}
              </h3>
              
              <p className="text-gray-400 text-sm mb-3">{event.date}</p>
              
              {event.source === 'spacex' && event.rocket && (
                <p className="text-gray-300 text-xs mb-3">
                  Rocket: {event.rocket}
                </p>
              )}
              
              <span className={`inline-block px-3 py-1 text-xs rounded-full uppercase font-medium ${
                event.source === 'spacex'
                  ? 'bg-orange-400/20 text-orange-400 border border-orange-400/30'
                  : 'bg-space-violet/30 text-space-violet'
              }`}>
                {event.type}
              </span>
            </motion.div>
          ))}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
        <Link
          to="/events"
          className="inline-block px-6 py-2 bg-space-violet rounded-xl font-semibold hover:scale-105 transition-all"
        >
          View All Events
        </Link>
        
        {upcomingLaunches.length > 0 && (
          <Link
            to="/events?tab=spacex"
            className="inline-block px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-xl font-semibold hover:scale-105 transition-all"
          >
            View SpaceX Launches
          </Link>
        )}
      </div>
    </section>
  );
};

export default EventsShowcase;
