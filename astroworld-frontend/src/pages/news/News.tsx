import { useState } from 'react';
import Layout from '../../components/Layout';
import StarryBackground from '../../components/Home/StarryBackground';
import NewsCard from '../../components/News/NewsCard';
import { useNews, useNewsSites, useFeaturedNews } from '../../hooks/useNewsData';
import { useFavoriteMutation } from '../../hooks/useNASAData';
import type { NewsFilters } from '../../services/spaceflightnews/newsServices';

const News = () => {
  const [filters, setFilters] = useState<NewsFilters>({});
  const [activeTab, setActiveTab] = useState<'all' | 'featured'>('all');

  const { data: newsData, isLoading, error } = useNews(filters);
  const { data: featuredData, isLoading: featuredLoading } = useFeaturedNews();
  const { data: newsSites } = useNewsSites();
  const favoriteMutation = useFavoriteMutation();

  const handleFilterChange = (newFilters: Partial<NewsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSaveNews = (newsId: string) => {
    favoriteMutation.mutate({
      itemType: 'news',
      itemId: newsId,
    });
  };

  const displayData = activeTab === 'featured' ? featuredData : newsData;
  const loading = activeTab === 'featured' ? featuredLoading : isLoading;

  return (
    <Layout>
      <div className="relative min-h-screen text-white overflow-hidden">
        {/* Animated Starry Background */}
        <StarryBackground />
        
        {/* Main Content - positioned above background */}
        <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-space-mono font-bold mb-4">
              <span className="bg-gradient-to-r from-space-blue-light to-space-violet bg-clip-text text-transparent">
                Spaceflight News
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Stay updated with the latest space news, missions, and discoveries from trusted sources
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-space-violet text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                All News
              </button>
              <button
                onClick={() => setActiveTab('featured')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'featured'
                    ? 'bg-space-violet text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Featured
              </button>
            </div>
          </div>

          {/* Filters */}
          {activeTab === 'all' && (
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Article Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={filters.type || ''}
                    onChange={(e) => handleFilterChange({ type: e.target.value as any || undefined })}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  >
                    <option value="">All Types</option>
                    <option value="article">Articles</option>
                    <option value="blog">Blogs</option>
                    <option value="report">Reports</option>
                  </select>
                </div>

                {/* News Site */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    News Site
                  </label>
                  <select
                    value={filters.news_site || ''}
                    onChange={(e) => handleFilterChange({ news_site: e.target.value || undefined })}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  >
                    <option value="">All Sites</option>
                    {newsSites?.data.map(site => (
                      <option key={site} value={site}>{site}</option>
                    ))}
                  </select>
                </div>

                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Search
                  </label>
                  <input
                    type="text"
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange({ search: e.target.value || undefined })}
                    placeholder="Search articles..."
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400"
                  />
                </div>

                {/* Featured Toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Featured Only
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.featured || false}
                      onChange={(e) => handleFilterChange({ featured: e.target.checked || undefined })}
                      className="sr-only"
                    />
                    <div className={`relative w-12 h-6 rounded-full transition-colors ${
                      filters.featured ? 'bg-space-violet' : 'bg-gray-600'
                    }`}>
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        filters.featured ? 'translate-x-6' : ''
                      }`} />
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-space-violet"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-400 text-lg">Error loading news</p>
            </div>
          ) : (Array.isArray(displayData?.data) ? displayData.data.length === 0 : displayData?.data.results?.length === 0) ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No news articles found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(Array.isArray(displayData?.data) ? displayData.data : displayData?.data.results || []).map(news => (
                <NewsCard
                  key={news.id}
                  news={news}
                  onSave={handleSaveNews}
                />
              ))}
            </div>
          )}

          {/* Load More (for paginated results) */}
          {activeTab === 'all' && newsData?.data.count && newsData.data.results.length < newsData.data.count && (
            <div className="text-center mt-8">
              <button
                onClick={() => handleFilterChange({ page: (filters.page || 1) + 1 })}
                className="px-6 py-3 bg-space-violet hover:bg-space-violet/80 text-white rounded-lg font-medium transition-colors"
              >
                Load More
              </button>
            </div>
          )}
        </div>
        </div>
      </div>
    </Layout>
  );
};

export default News;