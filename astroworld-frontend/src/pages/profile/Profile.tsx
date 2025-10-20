import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bookmark,
  BookOpen,
  FolderOpen,
  Bell,
  Activity,
  Star,
  Calendar,
  TrendingUp,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  ExternalLink
} from 'lucide-react';
import Layout from '../../components/Layout';
import { useUserProfile } from '../../hooks/useUserInteractions';
import { useUserContent } from '../../hooks/useUserContent';
import { useUserJournals } from '../../hooks/useUserJournals';
import { useUserCollections } from '../../hooks/useUserCollections';
import { useUserSubscriptions, useRecentActivities } from '../../hooks/useUserInteractions';
import { useDeleteContent } from '../../hooks/useUserContent';
import { useDeleteJournal } from '../../hooks/useUserJournals';
import { useDeleteCollection } from '../../hooks/useUserCollections';
import { useDeleteSubscription } from '../../hooks/useUserInteractions';
import type { ContentType } from '../../services/userInteractions';

type TabType = 'saved' | 'journals' | 'collections' | 'subscriptions' | 'activity';

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('saved');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ContentType | 'all'>('all');

  // Fetch data
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: savedContent, isLoading: contentLoading } = useUserContent();
  const { data: journals, isLoading: journalsLoading } = useUserJournals();
  const { data: collections, isLoading: collectionsLoading } = useUserCollections();
  const { data: subscriptions, isLoading: subscriptionsLoading } = useUserSubscriptions();
  const { data: activities, isLoading: activitiesLoading } = useRecentActivities();

  // Delete mutations
  const deleteContent = useDeleteContent();
  const deleteJournal = useDeleteJournal();
  const deleteCollection = useDeleteCollection();
  const deleteSubscription = useDeleteSubscription();

  // Filter content based on search and type
  const filteredContent = savedContent?.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.content_type === filterType;
    return matchesSearch && matchesType;
  });

  const filteredJournals = journals?.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { id: 'saved' as TabType, label: 'Saved Content', icon: Bookmark, count: profile?.saved_content_count },
    { id: 'journals' as TabType, label: 'Journals', icon: BookOpen, count: profile?.journals_count },
    { id: 'collections' as TabType, label: 'Collections', icon: FolderOpen, count: profile?.collections_count },
    { id: 'subscriptions' as TabType, label: 'Subscriptions', icon: Bell, count: profile?.subscriptions_count },
    { id: 'activity' as TabType, label: 'Activity', icon: Activity, count: activities?.length },
  ];

  const contentTypes: { value: ContentType | 'all'; label: string }[] = [
    { value: 'all', label: 'All Types' },
    { value: 'apod', label: 'APOD' },
    { value: 'mars_photo', label: 'Mars Photos' },
    { value: 'epic', label: 'EPIC' },
    { value: 'neo', label: 'NEO' },
    { value: 'exoplanet', label: 'Exoplanets' },
    { value: 'space_weather', label: 'Space Weather' },
    { value: 'news', label: 'News' },
    { value: 'celestial', label: 'Celestial' },
    { value: 'event', label: 'Events' },
  ];

  if (profileLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-sm rounded-2xl border border-white/10 p-8 mb-8"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                  {profile?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                  <Star className="h-4 w-4 text-white" fill="currentColor" />
                </div>
              </div>

              {/* User Info */}
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {profile?.full_name || profile?.username}
                </h1>
                <p className="text-gray-400 mb-1">@{profile?.username}</p>
                {profile?.bio && (
                  <p className="text-gray-300 max-w-2xl">{profile.bio}</p>
                )}
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(profile?.date_joined || '').toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}</span>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-black/30 rounded-xl p-4 border border-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Bookmark className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{profile?.saved_content_count || 0}</p>
                  <p className="text-xs text-gray-400">Saved Items</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-black/30 rounded-xl p-4 border border-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{profile?.journals_count || 0}</p>
                  <p className="text-xs text-gray-400">Journals</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-black/30 rounded-xl p-4 border border-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <FolderOpen className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{profile?.collections_count || 0}</p>
                  <p className="text-xs text-gray-400">Collections</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-black/30 rounded-xl p-4 border border-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{activities?.length || 0}</p>
                  <p className="text-xs text-gray-400">Activities</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-t-lg transition-all font-medium
                ${activeTab === tab.id
                  ? 'bg-purple-600 text-white border-b-2 border-purple-400'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search and Filter Bar */}
        {(activeTab === 'saved' || activeTab === 'journals') && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 mb-6"
          >
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Filter (only for saved content) */}
              {activeTab === 'saved' && (
                <div className="relative min-w-[200px]">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as ContentType | 'all')}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
                  >
                    {contentTypes.map((type) => (
                      <option key={type.value} value={type.value} className="bg-gray-900">
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {/* Saved Content Tab */}
          {activeTab === 'saved' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contentLoading ? (
                <div className="col-span-full text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                </div>
              ) : filteredContent && filteredContent.length > 0 ? (
                filteredContent.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:border-purple-500/50 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium">
                        {item.content_type.replace('_', ' ').toUpperCase()}
                      </span>
                      {item.is_favorite && (
                        <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
                      )}
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    
                    {item.notes && (
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.notes}</p>
                    )}
                    
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="px-2 py-1 rounded bg-white/10 text-gray-300 text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                      <span className="text-xs text-gray-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this item?')) {
                              deleteContent.mutate(item.id);
                            }
                          }}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-all"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Bookmark className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No saved content yet</p>
                  <p className="text-gray-500 text-sm mt-2">Start exploring and save your favorite discoveries!</p>
                </div>
              )}
            </div>
          )}

          {/* Journals Tab */}
          {activeTab === 'journals' && (
            <div className="space-y-4">
              {journalsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                </div>
              ) : filteredJournals && filteredJournals.length > 0 ? (
                filteredJournals.map((journal, index) => (
                  <motion.div
                    key={journal.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:border-blue-500/50 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium">
                            {journal.journal_type.replace('_', ' ').toUpperCase()}
                          </span>
                          {journal.is_public && (
                            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-medium">
                              PUBLIC
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{journal.title}</h3>
                        <p className="text-gray-300 line-clamp-3">{journal.content}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                          <Edit className="h-4 w-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this journal entry?')) {
                              deleteJournal.mutate(journal.id);
                            }
                          }}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                    
                    {journal.coordinates && (
                      <div className="mt-4 p-3 bg-black/30 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Observation Coordinates:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          {journal.coordinates.ra && (
                            <div>
                              <span className="text-gray-500">RA:</span>
                              <span className="text-white ml-1">{journal.coordinates.ra}</span>
                            </div>
                          )}
                          {journal.coordinates.dec && (
                            <div>
                              <span className="text-gray-500">Dec:</span>
                              <span className="text-white ml-1">{journal.coordinates.dec}</span>
                            </div>
                          )}
                          {journal.coordinates.alt && (
                            <div>
                              <span className="text-gray-500">Alt:</span>
                              <span className="text-white ml-1">{journal.coordinates.alt}°</span>
                            </div>
                          )}
                          {journal.coordinates.az && (
                            <div>
                              <span className="text-gray-500">Az:</span>
                              <span className="text-white ml-1">{journal.coordinates.az}°</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                      <span className="text-xs text-gray-500">
                        {new Date(journal.created_at).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                      {journal.related_content && (
                        <span className="text-xs text-purple-400">
                          Related: {journal.related_content.title}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No journal entries yet</p>
                  <p className="text-gray-500 text-sm mt-2">Start documenting your cosmic observations!</p>
                </div>
              )}
            </div>
          )}

          {/* Collections Tab */}
          {activeTab === 'collections' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {collectionsLoading ? (
                <div className="col-span-full text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                </div>
              ) : collections && collections.length > 0 ? (
                collections.map((collection, index) => (
                  <motion.div
                    key={collection.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gradient-to-br from-green-900/20 to-teal-900/20 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:border-green-500/50 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <FolderOpen className="h-6 w-6 text-green-400" />
                          <h3 className="text-xl font-bold text-white">{collection.name}</h3>
                        </div>
                        {collection.description && (
                          <p className="text-gray-400 text-sm mb-3">{collection.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">
                            {collection.item_count} {collection.item_count === 1 ? 'item' : 'items'}
                          </span>
                          {collection.is_public && (
                            <span className="px-2 py-1 rounded bg-green-500/20 text-green-300 text-xs">
                              PUBLIC
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                          <Edit className="h-4 w-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this collection?')) {
                              deleteCollection.mutate(collection.id);
                            }
                          }}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                    
                    {collection.items && collection.items.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-xs text-gray-500 mb-2">Recent items:</p>
                        <div className="space-y-1">
                          {collection.items.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex items-center gap-2 text-sm">
                              <div className="h-1.5 w-1.5 rounded-full bg-green-400"></div>
                              <span className="text-gray-400">{item.title}</span>
                            </div>
                          ))}
                          {collection.items.length > 3 && (
                            <p className="text-xs text-gray-500 ml-3.5">
                              +{collection.items.length - 3} more
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-gray-500">
                        Created {new Date(collection.created_at).toLocaleDateString()}
                      </span>
                      <button className="px-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-300 text-sm font-medium transition-all flex items-center gap-2">
                        <ExternalLink className="h-3 w-3" />
                        View
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <FolderOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No collections yet</p>
                  <p className="text-gray-500 text-sm mt-2">Create collections to organize your discoveries!</p>
                  <button className="mt-4 px-6 py-3 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-300 font-medium transition-all flex items-center gap-2 mx-auto">
                    <Plus className="h-5 w-5" />
                    Create Collection
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Subscriptions Tab */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-4">
              {subscriptionsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                </div>
              ) : subscriptions && subscriptions.length > 0 ? (
                subscriptions.map((sub, index) => (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gradient-to-r from-orange-900/20 to-red-900/20 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:border-orange-500/50 transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Bell className={`h-5 w-5 ${sub.is_active ? 'text-orange-400' : 'text-gray-500'}`} />
                          <h3 className="text-lg font-bold text-white">{sub.event_name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            sub.is_active 
                              ? 'bg-green-500/20 text-green-300' 
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {sub.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(sub.event_date).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          {sub.notify_email && (
                            <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-xs">
                              📧 Email
                            </span>
                          )}
                          {sub.notify_in_app && (
                            <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-xs">
                              🔔 In-App
                            </span>
                          )}
                          <span className="text-gray-500 text-xs">
                            Notify {sub.notify_before_hours}h before
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          if (confirm('Unsubscribe from this event?')) {
                            deleteSubscription.mutate(sub.id);
                          }
                        }}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Bell className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No active subscriptions</p>
                  <p className="text-gray-500 text-sm mt-2">Subscribe to events to get notified!</p>
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-3">
              {activitiesLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                </div>
              ) : activities && activities.length > 0 ? (
                activities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Activity className="h-4 w-4 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">{activity.description}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {activity.content && (
                        <span className="px-3 py-1 rounded bg-purple-500/20 text-purple-300 text-xs">
                          {activity.content.content_type}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Activity className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No activity yet</p>
                  <p className="text-gray-500 text-sm mt-2">Your cosmic journey starts here!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
