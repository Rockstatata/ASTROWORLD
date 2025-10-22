import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, Rocket, Clock, Star, Eye, MapPin } from "lucide-react";
import { spaceXService, type SpaceXLaunch } from "../../services/spaceXService";
import { spaceEventsService, type SpaceEvent } from "../../services/spaceEventsService";

const EventsShowcase: React.FC = () => {
  const [upcomingLaunches, setUpcomingLaunches] = useState<SpaceXLaunch[]>([]);
  const [spaceEvents, setSpaceEvents] = useState<SpaceEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const fetchAllEvents = async () => {
    try {
      setLoading(true);
      const [launches, events] = await Promise.all([
        spaceXService.getUpcomingLaunches(3), // Get first 3 upcoming launches
        spaceEventsService.getUpcomingEvents() // Get upcoming astronomical events
      ]);
      
      setUpcomingLaunches(launches);
      setSpaceEvents(events.slice(0, 4)); // Get first 4 space events
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
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

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'ECLIPSE_SOLAR':
      case 'ECLIPSE_LUNAR':
        return Star;
      case 'METEOR_SHOWER':
        return Star;
      case 'CONJUNCTION':
      case 'PLANETARY_ALIGNMENT':
        return Eye;
      case 'SUPERMOON':
        return Calendar;
      default:
        return Calendar;
    }
  };

  const getEventTypeDisplayName = (eventType: string) => {
    const typeMap: Record<string, string> = {
      'ECLIPSE_SOLAR': 'Solar Eclipse',
      'ECLIPSE_LUNAR': 'Lunar Eclipse',
      'METEOR_SHOWER': 'Meteor Shower',
      'SUPERMOON': 'Supermoon',
      'PLANETARY_ALIGNMENT': 'Planetary Alignment',
      'CONJUNCTION': 'Conjunction',
      'COMET': 'Comet',
      'TRANSIT': 'Planet Transit',
      'OCCULTATION': 'Occultation',
      'EQUINOX': 'Equinox',
      'SOLSTICE': 'Solstice',
    };
    return typeMap[eventType] || eventType;
  };

  // Combine astronomical events and SpaceX launches
  const allEvents = [
    ...spaceEvents.map(event => ({
      id: `space-${event.id}`,
      name: event.title,
      date: formatDate(event.event_date),
      type: getEventTypeDisplayName(event.event_type),
      source: 'astronomical' as const,
      icon: getEventIcon(event.event_type),
      description: event.description,
      location: event.location,
      visibility: event.visibility,
      sourceUrl: event.source_url
    })),
    ...upcomingLaunches.map(launch => ({
      id: `spacex-${launch.id}`,
      name: launch.mission_name,
      date: formatDate(launch.launch_date_utc),
      type: "SpaceX Launch",
      source: 'spacex' as const,
      icon: Rocket,
      rocket: launch.rocket?.name,
      webcast: launch.links.webcast
    }))
  ].slice(0, 6); // Show max 6 events

  return (
    <section className="py-20 px-6 text-center">
      <h2 className="text-4xl font-bold mb-6">Upcoming Events</h2>
      
      {loading || allEvents.length === 0 ? (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl shadow-lg backdrop-blur-md">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">
              {loading ? 'Loading upcoming events...' : 'No upcoming events found.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allEvents.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-white/5 border border-white/10 p-6 rounded-2xl shadow-lg backdrop-blur-md transition-all duration-300 group cursor-pointer ${
                event.source === 'spacex' 
                  ? 'hover:shadow-orange-400/20 hover:border-orange-400/30' 
                  : 'hover:shadow-space-violet/40 hover:border-space-violet/30'
              }`}
              onClick={() => {
                if (event.source === 'spacex' && event.webcast) {
                  window.open(event.webcast, '_blank');
                } else if (event.source === 'astronomical' && event.sourceUrl) {
                  window.open(event.sourceUrl, '_blank');
                }
              }}
            >
              <div className="flex items-center justify-center mb-3">
                <event.icon className={`w-6 h-6 ${
                  event.source === 'spacex' ? 'text-orange-400' : 'text-space-violet'
                }`} />
              </div>
              
              <h3 className="text-xl font-semibold mb-2 min-h-[3rem] flex items-center justify-center group-hover:text-white transition-colors">
                {event.name}
              </h3>
              
              <p className="text-gray-400 text-sm mb-3">{event.date}</p>
              
              {/* Event-specific details */}
              {event.source === 'spacex' && event.rocket && (
                <p className="text-gray-300 text-xs mb-3">
                  Rocket: {event.rocket}
                </p>
              )}
              
              {event.source === 'astronomical' && event.location && (
                <div className="flex items-center justify-center gap-1 text-gray-300 text-xs mb-3">
                  <MapPin className="w-3 h-3" />
                  <span>{event.location}</span>
                </div>
              )}
              
              {event.source === 'astronomical' && event.visibility && (
                <p className="text-gray-400 text-xs mb-3">
                  Visibility: {event.visibility.replace('_', ' ')}
                </p>
              )}
              
              <span className={`inline-block px-3 py-1 text-xs rounded-full uppercase font-medium ${
                event.source === 'spacex'
                  ? 'bg-orange-400/20 text-orange-400 border border-orange-400/30'
                  : 'bg-space-violet/30 text-space-violet'
              }`}>
                {event.type}
              </span>
              
              {/* Click hint */}
              {((event.source === 'spacex' && event.webcast) || (event.source === 'astronomical' && event.sourceUrl)) && (
                <p className="text-xs text-gray-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click for more details
                </p>
              )}
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
