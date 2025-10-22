import { useState, useEffect, useCallback } from 'react';
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
  Timer,
  Rocket,
  Target,
  BarChart3,
  PlayCircle,
  Heart,
  Bell,

  Activity
} from 'lucide-react';
import Layout from '../../components/Layout';
import StarryBackground from '../../components/Home/StarryBackground';
import SaveButton from '../../components/common/SaveButton';
import { useSpaceEvents, useFeaturedSpaceEvents } from '../../hooks/nasa/useSpaceEvents';
import type { SpaceEvent } from '../../services/nasa/nasaServices';
import { spaceXService, type SpaceXLaunch, type SpaceXRocket, type SpaceXStats as SpaceXStatsType, type SpaceXHistoricalEvent } from '../../services/spaceXService';
import { useAuth } from '../../context/authContext';

const Events = () => {
  const [activeTab, setActiveTab] = useState('astronomical' as 'astronomical' | 'spacex' | 'comparison');
  const [selectedEvent, setSelectedEvent] = useState<SpaceEvent | null>(null);
  const [selectedLaunch, setSelectedLaunch] = useState<SpaceXLaunch | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // SpaceX data
  const [spaceXLaunches, setSpaceXLaunches] = useState<SpaceXLaunch[]>([]);
  const [spaceXRockets, setSpaceXRockets] = useState<SpaceXRocket[]>([]);
  const [spaceXLoading, setSpaceXLoading] = useState(false);
  const [savedLaunches, setSavedLaunches] = useState<Set<number>>(new Set());
  const [trackedLaunches, setTrackedLaunches] = useState<Set<number>>(new Set());
  const [spaceXSearchQuery, setSpaceXSearchQuery] = useState<string>('');
  const [spaceXSearchResults, setSpaceXSearchResults] = useState<{
    launches: SpaceXLaunch[];
    rockets: SpaceXRocket[];
    historical_events: SpaceXHistoricalEvent[];
  } | null>(null);

  const { user } = useAuth();

  // Fetch all events without time filter to get all events
  const { data: eventsData, isLoading, error } = useSpaceEvents({
    type: filterType === 'all' ? undefined : filterType,
    search: searchQuery || undefined,
  });

  const { data: featuredData } = useFeaturedSpaceEvents();

  const events = eventsData?.data?.results || [];
  const featuredEvents = featuredData?.data || [];

  // Handle SpaceX search
  const handleSpaceXSearch = useCallback(async () => {
    try {
      const results = await spaceXService.search(spaceXSearchQuery);
      setSpaceXSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    }
  }, [spaceXSearchQuery]);

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (spaceXSearchQuery.trim()) {
        handleSpaceXSearch();
      } else {
        setSpaceXSearchResults(null);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [spaceXSearchQuery, handleSpaceXSearch]);

  // Filter SpaceX launches based on search
  const filteredSpaceXLaunches = spaceXSearchResults 
    ? spaceXSearchResults.launches 
    : spaceXLaunches;

  // Load SpaceX data when tab is selected
  useEffect(() => {
    if (activeTab === 'spacex' || activeTab === 'comparison') {
      fetchSpaceXData();
      if (user) {
        fetchUserInteractions();
      }
    }
  }, [activeTab, user]);

  const fetchSpaceXData = async () => {
    try {
      setSpaceXLoading(true);
      const [launchesResponse, rocketsResponse] = await Promise.all([
        spaceXService.getLaunches({ page_size: 20 }),
        spaceXService.getRockets()
      ]);
      setSpaceXLaunches(launchesResponse.results);
      setSpaceXRockets(rocketsResponse.results || []);
    } catch (error) {
      console.error('Failed to fetch SpaceX data:', error);
    } finally {
      setSpaceXLoading(false);
    }
  };

  const fetchUserInteractions = async () => {
    try {
      const [savedResponse, trackedResponse] = await Promise.all([
        spaceXService.getSavedLaunches(),
        spaceXService.getTrackedLaunches()
      ]);
      setSavedLaunches(new Set(savedResponse.results.map(item => parseInt(item.item_id))));
      setTrackedLaunches(new Set(trackedResponse.results.map(item => item.launch.id)));
    } catch (error) {
      console.error('Failed to fetch user interactions:', error);
    }
  };

  const handleSaveLaunch = async (launchId: number) => {
    if (!user) return;
    
    try {
      const response = await spaceXService.saveLaunch(launchId);
      if (response.favorited) {
        setSavedLaunches(prev => new Set(prev).add(launchId));
      } else {
        setSavedLaunches(prev => {
          const newSet = new Set(prev);
          newSet.delete(launchId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error toggling save status:', error);
    }
  };

  const handleTrackLaunch = async (launchId: number) => {
    if (!user) return;
    
    try {
      const response = await spaceXService.trackLaunch(launchId);
      if (response.tracking) {
        setTrackedLaunches(prev => new Set(prev).add(launchId));
      } else {
        setTrackedLaunches(prev => {
          const newSet = new Set(prev);
          newSet.delete(launchId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error toggling track status:', error);
    }
  };

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

  // SpaceX utility functions
  const formatSpaceXDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCountdown = (launchDate: string) => {
    const now = new Date().getTime();
    const launch = new Date(launchDate).getTime();
    const difference = launch - now;

    if (difference < 0) {
      return { text: 'Launched', expired: true };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    if (days > 0) {
      return { text: `${days}d ${hours}h ${minutes}m`, expired: false };
    } else if (hours > 0) {
      return { text: `${hours}h ${minutes}m ${seconds}s`, expired: false };
    } else {
      return { text: `${minutes}m ${seconds}s`, expired: false };
    }
  };

  const getLaunchStatus = (launch: SpaceXLaunch) => {
    if (launch.upcoming) {
      return { status: 'upcoming', color: 'text-blue-400 bg-blue-400/10', icon: Clock };
    }
    if (launch.launch_success === true) {
      return { status: 'success', color: 'text-green-400 bg-green-400/10', icon: Target };
    }
    if (launch.launch_success === false) {
      return { status: 'failed', color: 'text-red-400 bg-red-400/10', icon: X };
    }
    return { status: 'unknown', color: 'text-gray-400 bg-gray-400/10', icon: AlertCircle };
  };

  // SpaceX Launch Card Component
  const SpaceXLaunchCard = ({ launch }: { launch: SpaceXLaunch }) => {
    const [countdown, setCountdown] = useState(getCountdown(launch.launch_date_utc));
    const status = getLaunchStatus(launch);

    useEffect(() => {
      if (launch.upcoming) {
        const interval = setInterval(() => {
          setCountdown(getCountdown(launch.launch_date_utc));
        }, 1000);
        return () => clearInterval(interval);
      }
    }, [launch.launch_date_utc, launch.upcoming]);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/80 backdrop-blur-xl rounded-xl border border-orange-400/30 overflow-hidden hover:border-orange-400/60 transition-all duration-300 group cursor-pointer"
        onClick={() => setSelectedLaunch(launch)}
      >
        {/* Launch Image */}
        <div className="relative h-48 overflow-hidden">
          {launch.links?.patch?.large ? (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <img 
                src={launch.links.patch.large} 
                alt={`${launch.mission_name} patch`}
                className="w-24 h-24 rounded-full bg-gray-700 p-2"
              />
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
              <Rocket className="w-16 h-16 text-orange-400" />
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.color}`}>
              <status.icon className="w-3 h-3" />
              {status.status.toUpperCase()}
            </div>
          </div>

          {/* Flight Number */}
          <div className="absolute top-4 right-4">
            <div className="px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs font-medium text-white">
              Flight #{launch.flight_number}
            </div>
          </div>

          {/* Countdown Timer */}
          {launch.upcoming && (
            <div className="absolute bottom-4 left-4">
              <div className="px-3 py-1 bg-orange-500/90 backdrop-blur-sm rounded-full text-xs font-bold text-white">
                <Timer className="w-3 h-3 inline mr-1" />
                {countdown.text}
              </div>
            </div>
          )}
        </div>

        {/* Launch Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
            {launch.mission_name}
          </h3>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Calendar className="w-4 h-4" />
              <span>{formatSpaceXDate(launch.launch_date_utc)}</span>
            </div>
            
            {launch.rocket && (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Rocket className="w-4 h-4" />
                <span>{launch.rocket.name}</span>
              </div>
            )}
          </div>

          {launch.details && (
            <p className="text-gray-300 text-sm line-clamp-3 mb-4">
              {launch.details}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {user && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveLaunch(launch.id);
                    }}
                    className={`p-2 rounded-full transition-colors ${
                      savedLaunches.has(launch.id)
                        ? 'text-red-400 hover:text-red-300'
                        : 'text-gray-400 hover:text-red-400'
                    }`}
                    title={savedLaunches.has(launch.id) ? 'Unsave' : 'Save'}
                  >
                    <Heart 
                      className="w-4 h-4" 
                      fill={savedLaunches.has(launch.id) ? 'currentColor' : 'none'}
                    />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTrackLaunch(launch.id);
                    }}
                    className={`p-2 rounded-full transition-colors ${
                      trackedLaunches.has(launch.id)
                        ? 'text-blue-400 hover:text-blue-300'
                        : 'text-gray-400 hover:text-blue-400'
                    }`}
                    title={trackedLaunches.has(launch.id) ? 'Untrack' : 'Track'}
                  >
                    <Bell 
                      className="w-4 h-4" 
                      fill={trackedLaunches.has(launch.id) ? 'currentColor' : 'none'}
                    />
                  </button>
                </>
              )}

              {launch.links?.webcast && (
                <a
                  href={launch.links.webcast}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 text-gray-400 hover:text-orange-400 transition-colors rounded-full hover:bg-gray-700"
                  title="Watch launch"
                >
                  <PlayCircle className="w-4 h-4" />
                </a>
              )}
            </div>
            
            <span className="text-orange-400 text-sm font-medium">
              View Details
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  // SpaceX Statistics Component
  const SpaceXStats = () => {
    const [stats, setStats] = useState<SpaceXStatsType | null>(null);
    const [statsLoading, setStatsLoading] = useState(false);

    useEffect(() => {
      fetchStats();
    }, []);

    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const statsData = await spaceXService.getStats();
        setStats(statsData);
      } catch (error) {
        console.error('Failed to fetch SpaceX stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    if (statsLoading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading statistics...</p>
        </div>
      );
    }

    if (!stats) return null;

    const successRate = stats.total_launches > 0 
      ? ((stats.successful_launches / stats.total_launches) * 100).toFixed(1)
      : '0';

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Launches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-orange-500/20 to-red-500/20 p-6 rounded-xl border border-orange-400/30"
        >
          <div className="flex items-center justify-between mb-4">
            <Rocket className="w-8 h-8 text-orange-400" />
            <span className="text-2xl font-bold text-white">{stats.total_launches}</span>
          </div>
          <h3 className="text-orange-400 font-semibold mb-1">Total Launches</h3>
          <p className="text-gray-400 text-sm">SpaceX mission history</p>
        </motion.div>

        {/* Success Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-6 rounded-xl border border-green-400/30"
        >
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 text-green-400" />
            <span className="text-2xl font-bold text-white">{successRate}%</span>
          </div>
          <h3 className="text-green-400 font-semibold mb-1">Success Rate</h3>
          <p className="text-gray-400 text-sm">{stats.successful_launches} successful</p>
        </motion.div>

        {/* Upcoming Missions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-6 rounded-xl border border-blue-400/30"
        >
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">{stats.upcoming_launches}</span>
          </div>
          <h3 className="text-blue-400 font-semibold mb-1">Upcoming</h3>
          <p className="text-gray-400 text-sm">Scheduled launches</p>
        </motion.div>

        {/* Active Rockets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 p-6 rounded-xl border border-purple-400/30"
        >
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">{stats.active_rockets}</span>
          </div>
          <h3 className="text-purple-400 font-semibold mb-1">Active Rockets</h3>
          <p className="text-gray-400 text-sm">Currently operational</p>
        </motion.div>
      </div>
    );
  };

  // Recent SpaceX Activity Component
  const RecentSpaceXActivity = () => {
    const [recentLaunches, setRecentLaunches] = useState<SpaceXLaunch[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      fetchRecentActivity();
    }, []);

    const fetchRecentActivity = async () => {
      try {
        setLoading(true);
        const response = await spaceXService.getLaunches({ 
          page_size: 5, 
          status: 'success' 
        });
        setRecentLaunches(response.results || []);
      } catch (error) {
        console.error('Failed to fetch recent activity:', error);
      } finally {
        setLoading(false);
      }
    };

    if (loading) {
      return (
        <div className="text-center py-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50 mb-8">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-400" />
          Recent SpaceX Activity
        </h3>
        <div className="space-y-3">
          {recentLaunches.slice(0, 3).map((launch, index) => (
            <motion.div
              key={launch.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors cursor-pointer"
              onClick={() => setSelectedLaunch(launch)}
            >
              <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium truncate">{launch.mission_name}</div>
                <div className="text-gray-400 text-sm">
                  {formatSpaceXDate(launch.launch_date_utc)} • {launch.rocket?.name}
                </div>
              </div>
              <div className="text-green-400 text-xs bg-green-400/10 px-2 py-1 rounded">
                Success
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  // Enhanced Launch Countdown Component
  const LaunchCountdown = ({ launch }: { launch: SpaceXLaunch }) => {
    const [timeLeft, setTimeLeft] = useState(getCountdown(launch.launch_date_utc));

    useEffect(() => {
      if (!launch.upcoming) return;

      const interval = setInterval(() => {
        const countdown = getCountdown(launch.launch_date_utc);
        setTimeLeft(countdown);
      }, 1000);

      return () => clearInterval(interval);
    }, [launch.launch_date_utc, launch.upcoming]);

    if (!launch.upcoming) return null;

    return (
      <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 p-4 rounded-lg border border-orange-400/30 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-orange-400" />
            <span className="text-white font-medium">Launch Countdown</span>
          </div>
          <div className="text-orange-400 font-bold text-lg font-mono">
            {timeLeft.expired ? 'Launched!' : timeLeft.text}
          </div>
        </div>
        {!timeLeft.expired && (
          <div className="mt-2 text-sm text-gray-300">
            {launch.mission_name} • {formatSpaceXDate(launch.launch_date_utc)}
          </div>
        )}
      </div>
    );
  };

  // Rocket Comparison Component
  const RocketComparison = () => {
    const [selectedRockets, setSelectedRockets] = useState<SpaceXRocket[]>([]);

    const handleRocketToggle = (rocket: SpaceXRocket) => {
      setSelectedRockets(prev => {
        const exists = prev.find(r => r.id === rocket.id);
        if (exists) {
          return prev.filter(r => r.id !== rocket.id);
        } else if (prev.length < 3) {
          return [...prev, rocket];
        }
        return prev;
      });
    };

    return (
      <div>
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-4">Select Rockets to Compare (max 3)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {spaceXRockets.map(rocket => (
              <motion.button
                key={rocket.id}
                onClick={() => handleRocketToggle(rocket)}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  selectedRockets.find(r => r.id === rocket.id)
                    ? 'border-orange-400 bg-orange-400/10 text-orange-400'
                    : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Rocket className="w-8 h-8 mx-auto mb-2" />
                <div className="text-sm font-medium">{rocket.name}</div>
                <div className="text-xs text-gray-400">{rocket.type}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {selectedRockets.length > 0 && (
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
            <h4 className="text-xl font-bold text-white mb-6">Rocket Comparison</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="py-3 px-4 text-gray-300">Specification</th>
                    {selectedRockets.map(rocket => (
                      <th key={rocket.id} className="py-3 px-4 text-orange-400">{rocket.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4 font-medium">Status</td>
                    {selectedRockets.map(rocket => (
                      <td key={rocket.id} className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          rocket.active ? 'bg-green-400/20 text-green-400' : 'bg-gray-400/20 text-gray-400'
                        }`}>
                          {rocket.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4 font-medium">Stages</td>
                    {selectedRockets.map(rocket => (
                      <td key={rocket.id} className="py-3 px-4">{rocket.stages}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4 font-medium">Height</td>
                    {selectedRockets.map(rocket => (
                      <td key={rocket.id} className="py-3 px-4">
                        {rocket.height_meters ? `${rocket.height_meters}m (${rocket.height_feet}ft)` : 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4 font-medium">Diameter</td>
                    {selectedRockets.map(rocket => (
                      <td key={rocket.id} className="py-3 px-4">
                        {rocket.diameter_meters ? `${rocket.diameter_meters}m (${rocket.diameter_feet}ft)` : 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4 font-medium">Mass</td>
                    {selectedRockets.map(rocket => (
                      <td key={rocket.id} className="py-3 px-4">
                        {rocket.mass_kg ? `${rocket.mass_kg.toLocaleString()}kg (${rocket.mass_lb?.toLocaleString()}lb)` : 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4 font-medium">Cost per Launch</td>
                    {selectedRockets.map(rocket => (
                      <td key={rocket.id} className="py-3 px-4">
                        {rocket.cost_per_launch ? `$${(rocket.cost_per_launch / 1000000).toFixed(1)}M` : 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4 font-medium">Success Rate</td>
                    {selectedRockets.map(rocket => (
                      <td key={rocket.id} className="py-3 px-4">
                        {rocket.success_rate_pct ? `${rocket.success_rate_pct}%` : 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4 font-medium">Boosters</td>
                    {selectedRockets.map(rocket => (
                      <td key={rocket.id} className="py-3 px-4">{rocket.boosters || 0}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4 font-medium">Country</td>
                    {selectedRockets.map(rocket => (
                      <td key={rocket.id} className="py-3 px-4">{rocket.country}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">First Flight</td>
                    {selectedRockets.map(rocket => (
                      <td key={rocket.id} className="py-3 px-4">
                        {new Date(rocket.first_flight).getFullYear()}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // SpaceX Launch Modal Component
  const SpaceXLaunchModal = ({ launch, onClose }: { launch: SpaceXLaunch; onClose: () => void }) => (
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
          className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-gray-900/95 backdrop-blur-xl border border-orange-400/50 rounded-2xl"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          {/* Launch Image/Patch */}
          <div className="relative h-80 overflow-hidden rounded-t-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
            {launch.links?.patch?.large ? (
              <img 
                src={launch.links.patch.large} 
                alt={`${launch.mission_name} patch`}
                className="w-32 h-32 rounded-full bg-gray-700 p-4"
              />
            ) : (
              <Rocket className="w-24 h-24 text-orange-400" />
            )}
            
            {/* Mission Badge */}
            <div className="absolute bottom-6 left-6">
              <div className="px-4 py-2 bg-orange-500/90 backdrop-blur-sm rounded-full font-bold text-white">
                {launch.mission_name}
              </div>
            </div>

            {/* Flight Number */}
            <div className="absolute top-6 left-6">
              <div className="px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full text-white">
                Flight #{launch.flight_number}
              </div>
            </div>
          </div>

          {/* Launch Content */}
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-white mb-4">{launch.mission_name}</h2>
              {launch.details && (
                <p className="text-gray-300 text-lg leading-relaxed">{launch.details}</p>
              )}
            </div>

            {/* Launch Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-300">
                  <Calendar className="h-5 w-5 text-orange-400" />
                  <div>
                    <div className="font-medium">Launch Date</div>
                    <div className="text-sm text-gray-400">{formatSpaceXDate(launch.launch_date_utc)}</div>
                  </div>
                </div>
                
                {launch.rocket && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Rocket className="h-5 w-5 text-orange-400" />
                    <div>
                      <div className="font-medium">Rocket</div>
                      <div className="text-sm text-gray-400">{launch.rocket.name} ({launch.rocket.type})</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 text-gray-300">
                  <Target className="h-5 w-5 text-orange-400" />
                  <div>
                    <div className="font-medium">Mission Status</div>
                    <div className="text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${getLaunchStatus(launch).color}`}>
                        {getLaunchStatus(launch).status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {launch.launchpad && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <MapPin className="h-5 w-5 text-orange-400" />
                    <div>
                      <div className="font-medium">Launch Site</div>
                      <div className="text-sm text-gray-400">{launch.launchpad.name}</div>
                    </div>
                  </div>
                )}
                
                {launch.upcoming && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Timer className="h-5 w-5 text-orange-400" />
                    <div>
                      <div className="font-medium">Countdown</div>
                      <div className="text-sm text-orange-400 font-mono">
                        {getCountdown(launch.launch_date_utc).text}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              {launch.links?.webcast && (
                <a
                  href={launch.links.webcast}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 rounded-lg font-medium text-white hover:from-red-500 hover:to-red-400 transition-all duration-200"
                >
                  <PlayCircle className="h-5 w-5" />
                  Watch Launch
                </a>
              )}
              
              {launch.links?.article_link && (
                <a
                  href={launch.links.article_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg font-medium text-white hover:from-orange-500 hover:to-orange-400 transition-all duration-200"
                >
                  <ExternalLink className="h-5 w-5" />
                  Read Article
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

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

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`text-space-blue-light font-medium group-hover:text-space-blue-light/80 transition-colors ${
              newsStyle ? 'text-xs' : 'text-sm'
            }`}>
              {hero ? 'Read full story' : 'Click to learn more'}
            </span>
            <ChevronRight className={`text-space-blue-light group-hover:translate-x-1 transition-transform ${
              newsStyle ? 'h-3 w-3' : 'h-4 w-4'
            }`} />
          </div>
          
          {/* Save Button */}
          <SaveButton
            contentType="event"
            contentId={event.id.toString()}
            contentTitle={event.title}
            contentDescription={event.description}
            thumbnailUrl={event.image_url}
            metadata={{
              event_type: event.event_type,
              event_type_display: event.event_type_display,
              event_date: event.event_date,
              visibility_display: event.visibility_display,
              location: event.location,
              duration_minutes: event.duration_minutes,
              days_until_event: event.days_until_event,
              is_featured: event.is_featured
            }}
            variant="bookmark"
            size={newsStyle ? 'sm' : 'md'}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
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
              Space Events Hub
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-300 max-w-3xl mx-auto"
            >
              Explore astronomical events, SpaceX launches, rocket comparisons, and countdown timers all in one place.
            </motion.p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-lg p-2 border border-gray-700/50">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('astronomical')}
                  className={`px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'astronomical'
                      ? 'bg-space-violet text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Telescope className="w-4 h-4" />
                  Astronomical Events
                </button>
                <button
                  onClick={() => setActiveTab('spacex')}
                  className={`px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'spacex'
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Rocket className="w-4 h-4" />
                  SpaceX Launches
                </button>
                <button
                  onClick={() => setActiveTab('comparison')}
                  className={`px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'comparison'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Rocket Comparison
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-12">
          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'astronomical' && (
              <motion.div
                key="astronomical"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
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
              </motion.div>
            )}

            {activeTab === 'spacex' && (
              <motion.div
                key="spacex"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                      <Rocket className="h-8 w-8 text-orange-400" />
                      SpaceX Mission Control
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Activity className="h-4 w-4" />
                      Live Updates
                    </div>
                  </div>

                  {/* SpaceX Search Bar */}
                  <div className="mb-6">
                    <div className="relative max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search SpaceX missions, rockets..."
                        value={spaceXSearchQuery}
                        onChange={(e) => setSpaceXSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-900/80 border border-orange-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                      />
                    </div>
                  </div>

                  {/* SpaceX Statistics Dashboard */}
                  <SpaceXStats />

                  {/* Recent Activity */}
                  <RecentSpaceXActivity />

                  {/* Next Launch Countdown */}
                  {filteredSpaceXLaunches.length > 0 && filteredSpaceXLaunches.find(l => l.upcoming) && (
                    <div className="mb-8">
                      <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <Timer className="h-6 w-6 text-orange-400" />
                        Next Launch
                      </h3>
                      <LaunchCountdown launch={filteredSpaceXLaunches.find(l => l.upcoming)!} />
                    </div>
                  )}

                  {/* Launch Schedule */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <Calendar className="h-6 w-6 text-orange-400" />
                      Launch Schedule
                    </h3>
                    
                    {spaceXLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="bg-gray-800 rounded-xl p-4">
                              <div className="h-48 bg-gray-700 rounded mb-4"></div>
                              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSpaceXLaunches.length > 0 ? (
                          filteredSpaceXLaunches.map((launch) => (
                            <SpaceXLaunchCard key={launch.id} launch={launch} />
                          ))
                        ) : (
                          <div className="col-span-full text-center py-12 bg-gray-900/50 rounded-xl border border-gray-700/50">
                            <Rocket className="h-20 w-20 text-gray-600 mx-auto mb-6" />
                            <h3 className="text-2xl font-bold text-gray-300 mb-2">
                              {spaceXSearchQuery ? 'No Results Found' : 'No Launches Available'}
                            </h3>
                            <p className="text-gray-500 mb-6">
                              {spaceXSearchQuery 
                                ? `No SpaceX data found matching "${spaceXSearchQuery}"`
                                : 'Check back later for upcoming SpaceX missions'
                              }
                            </p>
                            {spaceXSearchQuery && (
                              <button 
                                onClick={() => setSpaceXSearchQuery('')}
                                className="px-6 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-colors"
                              >
                                Clear Search
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'comparison' && (
              <motion.div
                key="comparison"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-6">
                    <BarChart3 className="h-8 w-8 text-blue-400" />
                    SpaceX Rocket Analysis Center
                  </h2>
                  
                  {/* SpaceX Fleet Overview */}
                  <SpaceXStats />
                  
                  {spaceXLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-400 mx-auto mb-4"></div>
                      <p className="text-gray-400">Loading rocket data...</p>
                    </div>
                  ) : (
                    <RocketComparison />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Event Detail Modals */}
        {selectedEvent && (
          <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        )}
        
        {selectedLaunch && (
          <SpaceXLaunchModal launch={selectedLaunch} onClose={() => setSelectedLaunch(null)} />
        )}
      </div>
      </div>
    </Layout>
  );
};

export default Events;