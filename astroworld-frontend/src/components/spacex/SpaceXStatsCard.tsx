import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Target, TrendingUp, Clock, Calendar, ExternalLink, Play } from 'lucide-react';
import { spaceXService, type SpaceXStats, type SpaceXLaunch } from '../../services/spaceXService';

const SpaceXStatsCard: React.FC = () => {
  const [stats, setStats] = useState<SpaceXStats | null>(null);
  const [recentLaunches, setRecentLaunches] = useState<SpaceXLaunch[]>([]);
  const [upcomingLaunches, setUpcomingLaunches] = useState<SpaceXLaunch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [statsData, upcomingData, recentData] = await Promise.all([
        spaceXService.getStats(),
        spaceXService.getUpcomingLaunches(3), // Get next 3 upcoming launches
        spaceXService.getLaunches({ page_size: 3, status: 'success' }) // Get 3 recent successful launches
      ]);
      
      setStats(statsData);
      setUpcomingLaunches(upcomingData);
      setRecentLaunches(recentData.results);
    } catch (err) {
      setError('Failed to fetch SpaceX data');
      console.error('Error fetching SpaceX data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-8 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 text-center">
        <Rocket className="w-8 h-8 text-gray-600 mx-auto mb-2" />
        <p className="text-gray-400 text-sm">
          {error || 'No SpaceX stats available'}
        </p>
      </div>
    );
  }

  const successRate = stats.total_launches > 0 
    ? ((stats.successful_launches / stats.total_launches) * 100)
    : 0;

  const statItems = [
    {
      icon: Rocket,
      label: 'Total Launches',
      value: stats.total_launches,
      color: 'text-blue-400'
    },
    {
      icon: Target,
      label: 'Success Rate',
      value: `${successRate.toFixed(1)}%`,
      color: 'text-green-400'
    },
    {
      icon: TrendingUp,
      label: 'Successful',
      value: stats.successful_launches,
      color: 'text-emerald-400'
    },
    {
      icon: Clock,
      label: 'Upcoming',
      value: stats.upcoming_launches,
      color: 'text-amber-400'
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const timeUntilLaunch = (dateString: string) => {
    const now = new Date();
    const launchDate = new Date(dateString);
    const diffTime = launchDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Launched';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
    >
      <div className="flex items-center gap-2 mb-6">
        <Rocket className="w-6 h-6 text-orange-400" />
        <h3 className="text-2xl font-bold text-white">SpaceX Mission Control</h3>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/60 rounded-xl p-4 backdrop-blur-sm border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-2">
              <item.icon className={`w-5 h-5 ${item.color}`} />
              <span className="text-gray-300 text-sm font-medium">
                {item.label}
              </span>
            </div>
            <p className={`text-2xl font-bold ${item.color}`}>
              {item.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Success Rate Visualization */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-green-400" />
          Mission Success Rate
        </h4>
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Success Rate</span>
            <span className="text-green-400 font-bold">{successRate.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${successRate}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full relative"
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
            </motion.div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Recent Launches */}
      {recentLaunches.length > 0 && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Recent Launches
          </h4>
          <div className="space-y-3">
            {recentLaunches.map((launch, index) => (
              <motion.div
                key={launch.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30 hover:border-blue-400/50 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h5 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                      {launch.mission_name}
                    </h5>
                    <p className="text-sm text-gray-400">
                      Flight #{launch.flight_number} • {formatDate(launch.launch_date_utc)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {launch.launch_success && (
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    )}
                    {launch.links.webcast && (
                      <a
                        href={launch.links.webcast}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <Play className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Launches */}
      {upcomingLaunches.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Upcoming Missions
          </h4>
          <div className="space-y-3">
            {upcomingLaunches.map((launch, index) => (
              <motion.div
                key={launch.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30 hover:border-amber-400/50 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h5 className="font-semibold text-white group-hover:text-amber-300 transition-colors">
                      {launch.mission_name}
                    </h5>
                    <p className="text-sm text-gray-400">
                      {formatDate(launch.launch_date_utc)} • {timeUntilLaunch(launch.launch_date_utc)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    {launch.links.webcast && (
                      <a
                        href={launch.links.webcast}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-gray-700/50">
        <p className="text-xs text-gray-400 text-center">
          Live data from SpaceX API • Updates every 15 minutes
        </p>
      </div>
    </motion.div>
  );
};

export default SpaceXStatsCard;