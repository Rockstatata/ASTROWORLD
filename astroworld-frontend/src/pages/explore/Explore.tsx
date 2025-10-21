import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  SortAsc, 
  Users, 
  FileText, 
  BookOpen,
  Sparkles,
  TrendingUp,
  Calendar
} from 'lucide-react';
import Layout from '../../components/Layout';
import StarryBackground from '../../components/Home/StarryBackground';
import UserCard from '../../components/explore/UserCard';
import PaperListCard from '../../components/explore/PaperListCard';
import JournalCard from '../../components/explore/JournalCard';
import AIRecommendations from '../../components/explore/AIRecommendations';

import { 
  useExplorePapers, 
  useExploreUsers, 
  usePublicJournals 
} from '../../hooks/useExplore';
import type { ResearchPaperList } from '../../types/explore';

type TabType = 'users' | 'papers' | 'journals';
type SortType = 'recent' | 'popular' | 'trending' | 'alphabetical';

interface FilterState {
  search: string;
  category: string;
  dateRange: string;
  sortBy: SortType;
}

const Explore: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('papers');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    dateRange: 'all',
    sortBy: 'recent'
  });

  // Convert filter state to API parameters
  const paperParams = {
    search: filters.search || undefined,
    ordering: filters.sortBy === 'recent' ? '-published_date' : 
              filters.sortBy === 'popular' ? '-save_count' :
              filters.sortBy === 'alphabetical' ? 'title' : 
              '-published_date'
  };

  const userParams = {
    search: filters.search || undefined,
    ordering: filters.sortBy === 'recent' ? '-date_joined' :
              filters.sortBy === 'alphabetical' ? 'username' :
              '-date_joined'
  };

  const journalParams = {
    search: filters.search || undefined,
    ordering: filters.sortBy === 'recent' ? '-created_at' :
              filters.sortBy === 'popular' ? '-like_count' :
              filters.sortBy === 'alphabetical' ? 'title' :
              '-created_at'
  };

  // Data fetching hooks
  const { 
    data: papers, 
    isLoading: papersLoading, 
    error: papersError 
  } = useExplorePapers(paperParams);
  
  const { 
    data: users, 
    isLoading: usersLoading, 
    error: usersError 
  } = useExploreUsers(userParams);
  
  const { 
    data: journals, 
    isLoading: journalsLoading, 
    error: journalsError 
  } = usePublicJournals(journalParams);

  const tabs = [
    { 
      id: 'papers' as TabType, 
      label: 'Research Papers', 
      icon: FileText, 
      count: papers?.count || 0 
    },
    { 
      id: 'users' as TabType, 
      label: 'Researchers', 
      icon: Users, 
      count: users?.count || 0 
    },
    { 
      id: 'journals' as TabType, 
      label: 'Journals', 
      icon: BookOpen, 
      count: journals?.count || 0 
    }
  ];

  const sortOptions = [
    { value: 'recent', label: 'Most Recent', icon: Calendar },
    { value: 'popular', label: 'Most Popular', icon: TrendingUp },
    { value: 'trending', label: 'Trending', icon: Sparkles },
    { value: 'alphabetical', label: 'A-Z', icon: SortAsc }
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleSortChange = (sortBy: SortType) => {
    setFilters(prev => ({ ...prev, sortBy }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        if (usersLoading) return <LoadingGrid />;
        if (usersError) return <ErrorMessage message="Failed to load users" />;
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users?.results?.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <UserCard user={user} />
              </motion.div>
            ))}
          </div>
        );

      case 'papers': {
        if (papersLoading) {
          console.log('Papers loading...');
          return <LoadingGrid />;
        }
        if (papersError) {
          console.error('Papers Error:', papersError);
          return <ErrorMessage message={`Failed to load papers: ${papersError.message}`} />;
        }
        
        console.log('Papers data received:', papers);
        console.log('Papers type:', typeof papers);
        
        // Handle both paginated response and direct array response
        let papersArray: ResearchPaperList[] = [];
        let totalCount = 0;
        
        if (Array.isArray(papers)) {
          // Direct array response
          papersArray = papers;
          totalCount = papers.length;
          console.log('Direct array response detected, papers:', papersArray.length);
        } else if (papers?.results) {
          // Paginated response
          papersArray = papers.results;
          totalCount = papers.count || 0;
          console.log('Paginated response detected, results:', papersArray.length);
        } else {
          console.log('Unknown response format');
        }
        
        console.log('Final papers array length:', papersArray.length);
        
        if (papersArray.length === 0) {
          console.log('No papers found - showing empty state');
          return (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No research papers found</p>
              <p className="text-sm text-gray-400 mt-2">
                Total papers in API: {totalCount}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Debug: Array={Array.isArray(papers)}, HasResults={!!papers?.results}, Length={papersArray.length}
              </p>
            </div>
          );
        }
        
        console.log('Rendering papers:', papersArray.length);
        return (
          <div className="space-y-6">
            {papersArray.map((paper, index) => (
              <motion.div
                key={paper.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PaperListCard paper={paper} />
              </motion.div>
            ))}
          </div>
        );
      }

      case 'journals':
        if (journalsLoading) return <LoadingGrid />;
        if (journalsError) return <ErrorMessage message="Failed to load journals" />;
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {journals?.results?.map((journal, index) => (
              <motion.div
                key={journal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <JournalCard journal={journal} />
              </motion.div>
            ))}
          </div>
        );

      default:
        return <div>Select a tab to explore content</div>;
    }
  };

  return (
    <Layout>
      <div className="relative min-h-screen text-white overflow-hidden">
        {/* Animated Starry Background */}
        <StarryBackground />
        
        {/* Main Content - positioned above background */}
        <div className="relative z-10">
        <div className="max-w-8xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Explore AstroWorld
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover cutting-edge research, connect with fellow astronomers, and explore the cosmos through scientific journals
            </p>
          </motion.div>



          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar - Filters */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 sticky top-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filters
                  </h3>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                </div>

                <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Search
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={filters.search}
                        onChange={handleSearch}
                        placeholder={`Search ${activeTab}...`}
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-500"
                      />
                    </div>
                  </div>

                  {/* Sort Options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sort By
                    </label>
                    <div className="space-y-2">
                      {sortOptions.map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => handleSortChange(value as SortType)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                            filters.sortBy === value
                              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                              : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Categories - Dynamic based on active tab */}
                  {activeTab === 'papers' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category
                      </label>
                      <select
                        value={filters.category}
                        onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white"
                      >
                        <option value="all">All Categories</option>
                        <option value="astrophysics">Astrophysics</option>
                        <option value="cosmology">Cosmology</option>
                        <option value="planetary">Planetary Science</option>
                        <option value="stellar">Stellar Physics</option>
                        <option value="galactic">Galactic Astronomy</option>
                      </select>
                    </div>
                  )}

                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date Range
                    </label>
                    <select
                      value={filters.dateRange}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                      className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Center Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2"
            >
              {/* Tabs */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 mb-6">
                <div className="flex flex-wrap gap-4">
                  {tabs.map(({ id, label, icon: Icon, count }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all ${
                        activeTab === id
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{label}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        activeTab === id
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                      }`}>
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-6">
                {renderContent()}
              </div>
            </motion.div>

            {/* Right Sidebar - AI Suggestions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 sticky top-8">
                <AIRecommendations />
              </div>
            </motion.div>
          </div>
        </div>
        </div>
      </div>
    </Layout>
  );
};

// Loading component
const LoadingGrid: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    ))}
  </div>
);

// Error component
const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center py-12">
    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
      <p className="text-red-600 dark:text-red-400 font-medium">{message}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

export default Explore;