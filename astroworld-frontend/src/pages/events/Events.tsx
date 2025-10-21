import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Eye, 
  Star, 
  ExternalLink, 
  Filter, 
  Search,
  X,
  ChevronRight,
  Telescope,
  Globe,
  TrendingUp,
  AlertCircle,
  Timer
} from 'lucide-react';
import Layout from '../../components/Layout';
import StarryBackground from '../../components/Home/StarryBackground';
import { useSpaceEvents, useFeaturedSpaceEvents } from '../../hooks/nasa/useSpaceEvents';
import type { SpaceEvent } from '../../services/nasa/nasaServices';

const Events = () => {
  const [selectedEvent, setSelectedEvent] = useState<SpaceEvent | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch all events without time filter to get all events
  const { data: eventsData, isLoading, error } = useSpaceEvents({
    type: filterType === 'all' ? undefined : filterType,
    search: searchQuery || undefined,
  });

  const { data: featuredData } = useFeaturedSpaceEvents();

  const events = eventsData?.data?.results || [];
  const featuredEvents = featuredData?.data || [];

  const eventTypes = [
    { value: 'all', label: 'All Events', icon: Globe },
    { value: 'ECLIPSE_SOLAR', label: 'Solar Eclipse', icon: Star },
    { value: 'ECLIPSE_LUNAR', label: 'Lunar Eclipse', icon: Star },
    { value: 'SUPERMOON', label: 'Supermoon', icon: Star },
    { value: 'METEOR_SHOWER', label: 'Meteor Shower', icon: Star },
    { value: 'CONJUNCTION', label: 'Conjunction', icon: Star },
    { value: 'COMET', label: 'Comet', icon: Telescope },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventTypeColor = (eventType: string) => {
    const colors = {
      'ECLIPSE_SOLAR': 'from-orange-500 to-red-500',
      'ECLIPSE_LUNAR': 'from-purple-500 to-indigo-500',
      'SUPERMOON': 'from-yellow-400 to-orange-400',
      'METEOR_SHOWER': 'from-blue-500 to-purple-500',
      'CONJUNCTION': 'from-green-500 to-blue-500',
      'COMET': 'from-pink-500 to-purple-500',
      'TRANSIT': 'from-teal-500 to-cyan-500',
      'SOLSTICE': 'from-amber-500 to-orange-500',
      'EQUINOX': 'from-emerald-500 to-green-500',
      'LAUNCH': 'from-red-500 to-pink-500',
      'MISSION': 'from-indigo-500 to-purple-500',
      'OTHER': 'from-gray-500 to-slate-500'
    };
    return colors[eventType as keyof typeof colors] || colors.OTHER;
  };

  const EventCard = ({ event, featured = false, hero = false, newsStyle = false, urgent = false }: { 
    event: SpaceEvent; 
    featured?: boolean; 
    hero?: boolean;
    newsStyle?: boolean;
    urgent?: boolean;
  }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`
        ${hero ? 'col-span-full' : featured ? 'col-span-full md:col-span-2' : newsStyle ? '' : ''}
        ${hero ? 'bg-gradient-to-br from-red-900/30 to-orange-900/30 border-red-500/40' : 
          urgent ? 'bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-orange-500/30' :
          'bg-gray-900/80 border-space-violet/30'}
        backdrop-blur-xl rounded-xl overflow-hidden
        hover:border-space-violet/60 transition-all duration-300 group cursor-pointer
        relative ${hero ? 'transform hover:scale-[1.01]' : 'hover:scale-105'}
        ${newsStyle ? 'hover:shadow-2xl hover:shadow-space-violet/20' : ''}
      `}
      onClick={() => setSelectedEvent(event)}
    >
      {/* Event Image */}
      <div className={`relative overflow-hidden ${hero ? 'h-80' : newsStyle ? 'h-40' : 'h-48'}`}>
        {event.image_url ? (
          <img 
            src={event.image_url} 
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${getEventTypeColor(event.event_type)} opacity-80`} />
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Breaking/Urgent/Featured Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {hero && (
            <div className="px-3 py-1 bg-gradient-to-r from-red-600 to-red-500 rounded-full text-xs font-bold text-white flex items-center gap-1 animate-pulse">
              <AlertCircle className="h-3 w-3" />
              BREAKING
            </div>
          )}
          {urgent && !hero && (
            <div className="px-3 py-1 bg-gradient-to-r from-orange-600 to-yellow-500 rounded-full text-xs font-bold text-white flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              URGENT
            </div>
          )}
          {event.is_featured && !hero && !urgent && (
            <div className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs font-bold text-white flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" />
              Featured
            </div>
          )}
        </div>

        {/* Days Until Event */}
        <div className="absolute top-4 right-4">
          <div className="px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs font-medium text-white">
            {event.days_until_event > 0 ? `${event.days_until_event} days` : 'Today'}
          </div>
        </div>

        {/* Event Type */}
        <div className="absolute bottom-4 left-4">
          <div className={`px-3 py-1 bg-gradient-to-r ${getEventTypeColor(event.event_type)} rounded-full text-xs font-bold text-white`}>
            {event.event_type_display}
          </div>
        </div>
      </div>

      {/* Event Content */}
      <div className={`${hero ? 'p-8' : newsStyle ? 'p-4' : 'p-6'}`}>
        <h3 className={`font-bold text-white mb-2 group-hover:text-space-blue-light transition-colors ${
          hero ? 'text-2xl' : newsStyle ? 'text-lg' : 'text-xl'
        }`}>
          {event.title}
        </h3>
        
        <p className={`text-gray-300 mb-4 ${
          hero ? 'text-base line-clamp-4' : newsStyle ? 'text-xs line-clamp-2' : 'text-sm line-clamp-3'
        }`}>
          {event.description}
        </p>

        {/* Event Details */}
        <div className={`space-y-2 mb-4 ${newsStyle ? 'mb-2' : ''}`}>
          <div className={`flex items-center gap-2 text-gray-400 ${newsStyle ? 'text-xs' : 'text-sm'}`}>
            <Calendar className={`${newsStyle ? 'h-3 w-3' : 'h-4 w-4'}`} />
            <span>{formatDate(event.event_date)}</span>
          </div>
          
          {event.duration_minutes && !newsStyle && (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Clock className="h-4 w-4" />
              <span>{Math.floor(event.duration_minutes / 60)}h {event.duration_minutes % 60}m</span>
            </div>
          )}
          
          {!newsStyle && (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Eye className="h-4 w-4" />
              <span>{event.visibility_display}</span>
            </div>
          )}
          
          {event.location && !newsStyle && (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          )}
        </div>

        {/* Learn More */}
        <div className="flex items-center justify-between">
          <span className={`text-space-blue-light font-medium group-hover:text-space-blue-light/80 transition-colors ${
            newsStyle ? 'text-xs' : 'text-sm'
          }`}>
            {hero ? 'Read full story' : 'Click to learn more'}
          </span>
          <ChevronRight className={`text-space-blue-light group-hover:translate-x-1 transition-transform ${
            newsStyle ? 'h-3 w-3' : 'h-4 w-4'
          }`} />
        </div>
      </div>
    </motion.div>
  );

  const EventModal = ({ event, onClose }: { event: SpaceEvent; onClose: () => void }) => (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-gray-900/95 backdrop-blur-xl border border-space-violet/50 rounded-2xl"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          {/* Event Image */}
          <div className="relative h-80 overflow-hidden rounded-t-2xl">
            {event.image_url ? (
              <img 
                src={event.image_url} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${getEventTypeColor(event.event_type)}`} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Event Type Badge */}
            <div className="absolute bottom-6 left-6">
              <div className={`px-4 py-2 bg-gradient-to-r ${getEventTypeColor(event.event_type)} rounded-full font-bold text-white`}>
                {event.event_type_display}
              </div>
            </div>
          </div>

          {/* Event Content */}
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-white mb-4">{event.title}</h2>
              <p className="text-gray-300 text-lg leading-relaxed">{event.description}</p>
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-300">
                  <Calendar className="h-5 w-5 text-space-blue-light" />
                  <div>
                    <div className="font-medium">Event Date</div>
                    <div className="text-sm text-gray-400">{formatDate(event.event_date)}</div>
                  </div>
                </div>
                
                {event.duration_minutes && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Clock className="h-5 w-5 text-space-blue-light" />
                    <div>
                      <div className="font-medium">Duration</div>
                      <div className="text-sm text-gray-400">
                        {Math.floor(event.duration_minutes / 60)}h {event.duration_minutes % 60}m
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3 text-gray-300">
                  <Eye className="h-5 w-5 text-space-blue-light" />
                  <div>
                    <div className="font-medium">Visibility</div>
                    <div className="text-sm text-gray-400">{event.visibility_display}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {event.location && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <MapPin className="h-5 w-5 text-space-blue-light" />
                    <div>
                      <div className="font-medium">Best Viewing Location</div>
                      <div className="text-sm text-gray-400">{event.location}</div>
                    </div>
                  </div>
                )}
                
                {event.magnitude && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Star className="h-5 w-5 text-space-blue-light" />
                    <div>
                      <div className="font-medium">Magnitude</div>
                      <div className="text-sm text-gray-400">{event.magnitude}</div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3 text-gray-300">
                  <Telescope className="h-5 w-5 text-space-blue-light" />
                  <div>
                    <div className="font-medium">Source</div>
                    <div className="text-sm text-gray-400">{event.source_name}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Learn More Button */}
            {event.source_url && (
              <div className="flex justify-center">
                <a
                  href={event.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-space-blue to-space-violet rounded-lg font-medium text-white hover:from-space-blue/80 hover:to-space-violet/80 transition-all duration-200"
                >
                  <ExternalLink className="h-5 w-5" />
                  Learn More at {event.source_name}
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-space-dark to-gray-900">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-space-violet mx-auto mb-4"></div>
                <p className="text-gray-400">Loading cosmic events...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-space-dark to-gray-900">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <p className="text-red-400 mb-4">Failed to load space events</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-space-violet/20 hover:bg-space-violet/30 text-space-violet rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative min-h-screen text-white overflow-hidden">
        {/* Animated Starry Background */}
        <StarryBackground />
        
        {/* Main Content - positioned above background */}
        <div className="relative z-10">
        {/* Header */}
        <div className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-space-violet/20 to-space-blue/20" />
          <div className="relative max-w-7xl mx-auto px-4 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-space-blue-light to-space-violet bg-clip-text text-transparent mb-6"
            >
              Cosmic Events
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-300 max-w-3xl mx-auto"
            >
              Discover upcoming astronomical events, eclipses, supermoons, meteor showers, and celestial phenomena that will light up our skies.
            </motion.p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-12">
          {/* Filters */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search cosmic events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-900/80 border border-space-violet/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-space-violet focus:ring-1 focus:ring-space-violet"
              />
            </div>

            {/* Event Type Filter */}
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 bg-gray-900/80 border border-space-violet/30 rounded-lg text-white focus:outline-none focus:border-space-violet focus:ring-1 focus:ring-space-violet appearance-none cursor-pointer"
              >
                {eventTypes.map((type) => (
                  <option key={type.value} value={type.value} className="bg-gray-900">
                    {type.label}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </motion.div>

          {/* Breaking News Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider">
                  Breaking
                </div>
                <TrendingUp className="h-5 w-5" />
                <span className="font-bold text-lg">Cosmic Events Alert</span>
              </div>
            </div>
          </motion.div>

          {/* Featured/Breaking News Events */}
          {featuredEvents.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-red-500" />
                Featured Astronomical Events
                <div className="ml-auto text-sm bg-red-500/20 text-red-300 px-3 py-1 rounded-full">
                  LIVE
                </div>
              </h2>
              
              {/* Hero Featured Event */}
              {featuredEvents[0] && (
                <div className="mb-8">
                  <EventCard event={featuredEvents[0]} featured hero />
                </div>
              )}
              
              {/* Secondary Featured Events */}
              {featuredEvents.length > 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {featuredEvents.slice(1, 3).map((event) => (
                    <EventCard key={event.id} event={event} featured />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* All Events News Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <Globe className="h-8 w-8 text-blue-500" />
                Cosmic News Feed
                <span className="text-lg text-gray-400 font-normal">({events.length} events)</span>
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Timer className="h-4 w-4" />
                Live Updates
              </div>
            </div>
            
            {events.length > 0 ? (
              <div className="space-y-6">
                {/* Main News Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {events.map((event, index) => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      newsStyle 
                      urgent={index < 2}
                    />
                  ))}
                </div>
                
                {/* Load More Section */}
                {events.length > 9 && (
                  <div className="text-center pt-8">
                    <button className="px-8 py-3 bg-gradient-to-r from-space-blue to-space-violet rounded-lg font-medium text-white hover:from-space-blue/80 hover:to-space-violet/80 transition-all duration-200 transform hover:scale-105">
                      Load More Cosmic Events
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-900/50 rounded-xl border border-gray-700/50">
                <Telescope className="h-20 w-20 text-gray-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-300 mb-2">No Events Found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search filters or check back later</p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('all');
                  }}
                  className="px-6 py-2 bg-space-violet/20 hover:bg-space-violet/30 text-space-violet rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </motion.div>
        </div>

          {/* Event Detail Modal */}
          {selectedEvent && (
            <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Events;