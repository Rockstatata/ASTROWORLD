import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Target, TrendingUp, Clock } from 'lucide-react';
import { spaceXService, type SpaceXStats } from '../../services/spaceXService';

const SpaceXStatsCard: React.FC = () => {
  const [stats, setStats] = useState<SpaceXStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await spaceXService.getStats();
      setStats(data);
    } catch (err) {
      setError('Failed to fetch SpaceX stats');
      console.error('Error fetching stats:', err);
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700"
    >
      <div className="flex items-center gap-2 mb-6">
        <Rocket className="w-6 h-6 text-orange-400" />
        <h3 className="text-xl font-bold text-white">SpaceX Stats</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {statItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <item.icon className={`w-4 h-4 ${item.color}`} />
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

      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 text-center">
          Data updated automatically from SpaceX API
        </p>
      </div>
    </motion.div>
  );
};

export default SpaceXStatsCard;