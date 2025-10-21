import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Rocket, ExternalLink, Heart, Bell, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { spaceXService, type SpaceXLaunch } from '../../services/spaceXService';
import { useAuth } from '../../context/authContext';

interface SpaceXLaunchesProps {
  maxItems?: number;
  showUpcomingOnly?: boolean;
  compact?: boolean;
}

const SpaceXLaunches: React.FC<SpaceXLaunchesProps> = ({ 
  maxItems = 6, 
  showUpcomingOnly = false,
  compact = false 
}) => {
  const [launches, setLaunches] = useState<SpaceXLaunch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedLaunches, setSavedLaunches] = useState<Set<number>>(new Set());
  const [trackedLaunches, setTrackedLaunches] = useState<Set<number>>(new Set());
  const { user } = useAuth();

  const fetchLaunches = useCallback(async () => {
    try {
      setLoading(true);
      let data;
      
      if (showUpcomingOnly) {
        data = await spaceXService.getUpcomingLaunches();
        setLaunches(data.slice(0, maxItems));
      } else {
        const response = await spaceXService.getLaunches({ 
          page_size: maxItems
        });
        setLaunches(response.results);
      }
    } catch (err) {
      setError('Failed to fetch SpaceX launches');
      console.error('Error fetching launches:', err);
    } finally {
      setLoading(false);
    }
  }, [showUpcomingOnly, maxItems]);

  useEffect(() => {
    fetchLaunches();
    if (user) {
      fetchUserInteractions();
    }
  }, [fetchLaunches, user]);

  const fetchUserInteractions = async () => {
    try {
      const [saved, tracked] = await Promise.all([
        spaceXService.getSavedLaunches(),
        spaceXService.getTrackedLaunches()
      ]);
      setSavedLaunches(new Set(saved.results.map(l => parseInt(l.item_id))));
      setTrackedLaunches(new Set(tracked.results.map(l => l.launch.id)));
    } catch (err) {
      console.error('Error fetching user interactions:', err);
    }
  };

  const handleSaveLaunch = async (launchId: number) => {
    if (!user) return;
    
    try {
      if (savedLaunches.has(launchId)) {
        await spaceXService.unsaveLaunch(launchId);
        setSavedLaunches(prev => {
          const newSet = new Set(prev);
          newSet.delete(launchId);
          return newSet;
        });
      } else {
        await spaceXService.saveLaunch(launchId);
        setSavedLaunches(prev => new Set(prev).add(launchId));
      }
    } catch (err) {
      console.error('Error toggling save status:', err);
    }
  };

  const handleTrackLaunch = async (launchId: number) => {
    if (!user) return;
    
    try {
      if (trackedLaunches.has(launchId)) {
        await spaceXService.untrackLaunch(launchId);
        setTrackedLaunches(prev => {
          const newSet = new Set(prev);
          newSet.delete(launchId);
          return newSet;
        });
      } else {
        await spaceXService.trackLaunch(launchId);
        setTrackedLaunches(prev => new Set(prev).add(launchId));
      }
    } catch (err) {
      console.error('Error toggling track status:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const getStatusIcon = (launch: SpaceXLaunch) => {
    if (launch.upcoming) {
      return <Clock className="w-4 h-4 text-blue-400" />;
    }
    if (launch.launch_success === true) {
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
    if (launch.launch_success === false) {
      return <XCircle className="w-4 h-4 text-red-400" />;
    }
    return <AlertTriangle className="w-4 h-4 text-amber-400" />;
  };

  const getStatusText = (launch: SpaceXLaunch) => {
    if (launch.upcoming) return 'Upcoming';
    if (launch.launch_success === true) return 'Success';
    if (launch.launch_success === false) return 'Failed';
    return 'Unknown';
  };

  const getStatusColor = (launch: SpaceXLaunch) => {
    if (launch.upcoming) return 'text-blue-400 bg-blue-400/10';
    if (launch.launch_success === true) return 'text-green-400 bg-green-400/10';
    if (launch.launch_success === false) return 'text-red-400 bg-red-400/10';
    return 'text-amber-400 bg-amber-400/10';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || launches.length === 0) {
    return (
      <div className="text-center py-8">
        <Rocket className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">
          {error || 'No SpaceX launches available'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {launches.map((launch, index) => (
          <motion.div
            key={launch.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 ${
              compact ? 'p-3' : 'p-4'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Rocket className="w-4 h-4 text-orange-400" />
                  <h3 className={`font-semibold text-white ${compact ? 'text-sm' : 'text-base'}`}>
                    {launch.mission_name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(launch)}`}>
                    {getStatusIcon(launch)}
                    {getStatusText(launch)}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(launch.launch_date_utc)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(launch.launch_date_utc)}
                  </div>
                  {launch.flight_number && (
                    <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                      Flight #{launch.flight_number}
                    </span>
                  )}
                </div>

                {launch.rocket && (
                  <div className="mt-2 text-sm text-gray-300">
                    <span className="text-gray-500">Rocket:</span> {launch.rocket.name}
                  </div>
                )}

                {launch.details && !compact && (
                  <p className="mt-2 text-sm text-gray-300 line-clamp-2">
                    {launch.details}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                {user && (
                  <>
                    <button
                      onClick={() => handleSaveLaunch(launch.id)}
                      className={`p-2 rounded-full transition-colors ${
                        savedLaunches.has(launch.id)
                          ? 'text-red-400 hover:text-red-300'
                          : 'text-gray-400 hover:text-red-400'
                      }`}
                      title={savedLaunches.has(launch.id) ? 'Unsave launch' : 'Save launch'}
                    >
                      <Heart 
                        className="w-4 h-4" 
                        fill={savedLaunches.has(launch.id) ? 'currentColor' : 'none'}
                      />
                    </button>
                    
                    <button
                      onClick={() => handleTrackLaunch(launch.id)}
                      className={`p-2 rounded-full transition-colors ${
                        trackedLaunches.has(launch.id)
                          ? 'text-blue-400 hover:text-blue-300'
                          : 'text-gray-400 hover:text-blue-400'
                      }`}
                      title={trackedLaunches.has(launch.id) ? 'Untrack launch' : 'Track launch'}
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
                    className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-700"
                    title="Watch launch"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {launch.links?.patch?.small && (
              <div className="flex justify-center mt-3">
                <img 
                  src={launch.links.patch.small} 
                  alt={`${launch.mission_name} patch`}
                  className="w-12 h-12 rounded-full bg-gray-700 p-1"
                />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default SpaceXLaunches;