import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { User, BookOpen, Heart, Bell, TrendingUp } from "lucide-react";

interface UserStats {
  id: number;
  username: string;
  full_name?: string;
  saved_content_count: number;
  journals_count: number;
  collections_count: number;
  subscriptions_count: number;
  recent_activities: unknown[];
}

const ProfileSummary: React.FC = () => {
  const { user: authUser } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authUser) {
      fetchUserStats();
    }
  }, [authUser]);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/users/profile/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't show the component if user is not logged in
  if (!authUser) {
    return null;
  }

  const displayName = userStats?.full_name || userStats?.username || authUser.username || "Explorer";

  return (
    <section className="py-20 text-center">
      <h2 className="text-4xl font-bold mb-4">Your Astro Profile</h2>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-lg shadow-lg"
      >
        <p className="text-xl font-medium mb-6 text-gray-200">
          Welcome back, {displayName}! 
        </p>
        
        {loading ? (
          <div className="flex justify-center gap-8 text-gray-400">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="w-12 h-8 bg-gray-700 rounded mb-2"></div>
                <div className="w-16 h-4 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-gray-400 mb-6">
            <div className="flex flex-col items-center">
              <Heart className="w-5 h-5 text-red-400 mb-2" />
              <span className="text-2xl font-semibold text-red-400">
                {userStats?.saved_content_count ?? 0}
              </span>
              <p className="text-sm">Favorites</p>
            </div>
            <div className="flex flex-col items-center">
              <BookOpen className="w-5 h-5 text-blue-400 mb-2" />
              <span className="text-2xl font-semibold text-blue-400">
                {userStats?.journals_count ?? 0}
              </span>
              <p className="text-sm">Journals</p>
            </div>
            <div className="flex flex-col items-center">
              <User className="w-5 h-5 text-green-400 mb-2" />
              <span className="text-2xl font-semibold text-green-400">
                {userStats?.collections_count ?? 0}
              </span>
              <p className="text-sm">Collections</p>
            </div>
            <div className="flex flex-col items-center">
              <Bell className="w-5 h-5 text-yellow-400 mb-2" />
              <span className="text-2xl font-semibold text-yellow-400">
                {userStats?.subscriptions_count ?? 0}
              </span>
              <p className="text-sm">Notifications</p>
            </div>
          </div>
        )}

        {/* Recent Activity Indicator */}
        {userStats?.recent_activities && userStats.recent_activities.length > 0 && (
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mb-6">
            <TrendingUp className="w-4 h-4" />
            <span>{userStats.recent_activities.length} recent activities</span>
          </div>
        )}
        
        <Link
          to="/profile"
          className="inline-block px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
        >
          View Full Profile
        </Link>
      </motion.div>
    </section>
  );
};

export default ProfileSummary;
