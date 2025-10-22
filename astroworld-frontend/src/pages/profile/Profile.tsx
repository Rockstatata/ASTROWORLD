import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
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
  ExternalLink,
  Users,
  UserPlus,
  Camera,
  Save,
  X,
  MessageCircle,
  Image,
  Settings,
  Key,
  Shield,
  CheckCircle
} from 'lucide-react';
import Layout from '../../components/Layout';
import StarryBackground from '../../components/Home/StarryBackground';
import { useUserProfile, useUpdateProfile, usePublicProfile } from '../../hooks/useUserInteractions';

import { useUserJournals } from '../../hooks/useUserJournals';
import { useUserCollections } from '../../hooks/useUserCollections';
import { useUserSubscriptions, useRecentActivities } from '../../hooks/useUserInteractions';

import { useDeleteJournal } from '../../hooks/useUserJournals';
import { useDeleteCollection } from '../../hooks/useUserCollections';
import { useDeleteSubscription } from '../../hooks/useUserInteractions';
import { useFollowing, useFollowers, useMySavedPapers } from '../../hooks/useExplore';
import { useMessageThreads } from '../../hooks/useMessaging';
import { useUserContent, useDeleteContent, useUpdateContent } from '../../hooks/useUserContent';
import { useSkyMarkers, useDeleteMarker, type SkyMarker } from '../../hooks/useSkymap';
import type { ContentType } from '../../services/userInteractions';
import UserCard from '../../components/explore/UserCard';
import PaperListCard from '../../components/explore/PaperListCard';
import SavedContentCard from '../../components/common/SavedContentCard';
import ChangePassword from '../../components/profile/ChangePassword';

type TabType = 'saved' | 'journals' | 'collections' | 'subscriptions' | 'activity' | 'following' | 'followers' | 'papers' | 'messages' | 'images' | 'skymap' | 'settings';

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const [activeTab, setActiveTab] = useState<TabType>(userId ? 'journals' : 'saved');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ContentType | 'all'>('all');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    full_name: '',
    bio: '',
    profile_picture: ''
  });

  // Always call hooks (React rules)
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: publicProfile, isLoading: publicProfileLoading } = usePublicProfile(
    userId ? parseInt(userId) : 0
  );
  const { data: savedContent, isLoading: contentLoading } = useUserContent();
  const { data: journals, isLoading: journalsLoading } = useUserJournals();
  const { data: collections, isLoading: collectionsLoading } = useUserCollections();
  const { data: subscriptions, isLoading: subscriptionsLoading } = useUserSubscriptions();
  const { data: activities, isLoading: activitiesLoading } = useRecentActivities();
  const { data: following, isLoading: followingLoading } = useFollowing();
  const { data: followers, isLoading: followersLoading } = useFollowers();
  const { data: savedPapers, isLoading: papersLoading } = useMySavedPapers();
  const { data: messageThreads, isLoading: messagesLoading } = useMessageThreads();
  const { data: skyMarkers, isLoading: skyMarkersLoading } = useSkyMarkers();

  // Delete mutations
  const deleteContent = useDeleteContent();
  const deleteJournal = useDeleteJournal();
  const deleteCollection = useDeleteCollection();
  const deleteSubscription = useDeleteSubscription();
  const deleteMarker = useDeleteMarker();

  // Update profile mutation
  const updateProfile = useUpdateProfile();

  // Initialize edit form when profile loads
  React.useEffect(() => {
    if (profile) {
      setEditedProfile({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        profile_picture: profile.profile_picture || ''
      });
    }
  }, [profile]);

  // Determine if viewing own profile or another user's profile
  const isOwnProfile = !userId;
  
  // Use appropriate profile data
  const currentProfile = isOwnProfile ? profile : publicProfile;
  const currentProfileLoading = isOwnProfile ? profileLoading : publicProfileLoading;

  // For public profiles, only show limited tabs
  const getTabsForProfile = () => {
    if (isOwnProfile) {
      return [
        { id: 'saved' as TabType, label: 'Saved Content', icon: Bookmark, count: profile?.saved_content_count },
        { id: 'papers' as TabType, label: 'Research Papers', icon: BookOpen, count: savedPapers?.count || 0 },
        { id: 'skymap' as TabType, label: 'Sky Markers', icon: Star, count: skyMarkers?.length || 0 },
        { id: 'images' as TabType, label: 'Saved Images', icon: Image, count: undefined },
        { id: 'journals' as TabType, label: 'Journals', icon: BookOpen, count: profile?.journals_count },
        { id: 'collections' as TabType, label: 'Collections', icon: FolderOpen, count: profile?.collections_count },
        { id: 'messages' as TabType, label: 'Messages', icon: MessageCircle, count: undefined },
        { id: 'following' as TabType, label: 'Following', icon: UserPlus, count: following?.length || 0 },
        { id: 'followers' as TabType, label: 'Followers', icon: Users, count: followers?.length || 0 },
        { id: 'subscriptions' as TabType, label: 'Subscriptions', icon: Bell, count: profile?.subscriptions_count },
        { id: 'activity' as TabType, label: 'Activity', icon: Activity, count: activities?.length },
        { id: 'settings' as TabType, label: 'Account Settings', icon: Settings, count: undefined },
      ];
    } else {
      // Public profile - only show public information
      return [
        { id: 'journals' as TabType, label: 'Public Journals', icon: BookOpen, count: publicProfile?.public_journals_count },
        { id: 'collections' as TabType, label: 'Public Collections', icon: FolderOpen, count: publicProfile?.public_collections_count },
      ];
    }
  };

  if (currentProfileLoading) {
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

  if (!isOwnProfile && !currentProfile) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-400 text-lg">User not found</p>
            <p className="text-gray-500 text-sm mt-2">This user profile doesn't exist or is private.</p>
          </div>
        </div>
      </Layout>
    );
  }

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

  const tabs = getTabsForProfile();

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
      <div className="relative min-h-screen text-white overflow-hidden">
        {/* Animated Starry Background */}
        <StarryBackground />
        
        {/* Main Content - positioned above background */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                  {currentProfile?.profile_picture ? (
                    <img src={currentProfile.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    currentProfile?.username?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                  <Star className="h-4 w-4 text-white" fill="currentColor" />
                </div>
              </div>

              {/* User Info */}
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {currentProfile?.full_name || currentProfile?.username}
                </h1>
                <p className="text-gray-400 mb-1">@{currentProfile?.username}</p>
                {currentProfile?.bio && (
                  <p className="text-gray-300 max-w-2xl">{currentProfile.bio}</p>
                )}
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(currentProfile?.date_joined || '').toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}</span>
                </div>
              </div>
            </div>

            {/* Edit Button - only show for own profile */}
            {isOwnProfile && (
              <button 
                onClick={() => setIsEditingProfile(true)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </button>
            )}
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
                  <p className="text-2xl font-bold text-white">
                    {isOwnProfile ? (profile?.saved_content_count || 0) : '—'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {isOwnProfile ? 'Saved Items' : 'Private'}
                  </p>
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
                  <p className="text-2xl font-bold text-white">
                    {isOwnProfile ? (profile?.journals_count || 0) : (publicProfile?.public_journals_count || 0)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {isOwnProfile ? 'Journals' : 'Public Journals'}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-black/30 rounded-xl p-4 border border-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  {isOwnProfile ? (
                    <FolderOpen className="h-5 w-5 text-green-400" />
                  ) : (
                    <Users className="h-5 w-5 text-green-400" />
                  )}
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {isOwnProfile ? (profile?.collections_count || 0) : (publicProfile?.followers_count || 0)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {isOwnProfile ? 'Collections' : 'Followers'}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-black/30 rounded-xl p-4 border border-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  {isOwnProfile ? (
                    <TrendingUp className="h-5 w-5 text-orange-400" />
                  ) : (
                    <UserPlus className="h-5 w-5 text-orange-400" />
                  )}
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {isOwnProfile ? (activities?.length || 0) : (publicProfile?.following_count || 0)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {isOwnProfile ? 'Activities' : 'Following'}
                  </p>
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
        {(activeTab === 'saved' || activeTab === 'journals') && isOwnProfile && (
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
          {/* Saved Content Tab - only for own profile */}
          {activeTab === 'saved' && isOwnProfile && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contentLoading ? (
                <div className="col-span-full text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                </div>
              ) : filteredContent && filteredContent.length > 0 ? (
                filteredContent.map((item) => (
                  <SavedContentCard
                    key={item.id}
                    content={item}
                    onDeleted={() => {
                      // Refresh the content list if needed
                      // The useUserContent hook should automatically update
                    }}
                  />
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

          {/* Subscriptions Tab - only for own profile */}
          {activeTab === 'subscriptions' && isOwnProfile && (
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

          {/* Research Papers Tab - only for own profile */}
          {activeTab === 'papers' && isOwnProfile && (
            <div className="space-y-4">
              {papersLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                </div>
              ) : savedPapers && savedPapers.results && savedPapers.results.length > 0 ? (
                savedPapers.results.map((userPaper, index) => (
                  <motion.div
                    key={userPaper.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <PaperListCard paper={userPaper.paper} showActions={false} />
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No saved papers yet</p>
                  <p className="text-gray-500 text-sm mt-2">Save research papers from the Explore page!</p>
                </div>
              )}
            </div>
          )}

          {/* Following Tab */}
          {activeTab === 'following' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {followingLoading ? (
                <div className="col-span-full text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                </div>
              ) : following && following.length > 0 ? (
                following.map((follow, index) => (
                  <motion.div
                    key={follow.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <UserCard user={follow.following_profile} showFollowButton={true} />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <UserPlus className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Not following anyone yet</p>
                  <p className="text-gray-500 text-sm mt-2">Discover researchers in the Explore page!</p>
                </div>
              )}
            </div>
          )}

          {/* Followers Tab */}
          {activeTab === 'followers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {followersLoading ? (
                <div className="col-span-full text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                </div>
              ) : followers && followers.length > 0 ? (
                followers.map((follow, index) => (
                  <motion.div
                    key={follow.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <UserCard user={follow.follower_profile} showFollowButton={true} />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No followers yet</p>
                  <p className="text-gray-500 text-sm mt-2">Share your cosmic discoveries to attract followers!</p>
                </div>
              )}
            </div>
          )}

          {/* Saved Images Tab - only for own profile */}
          {activeTab === 'images' && isOwnProfile && (
            <div className="space-y-6">
              {contentLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                </div>
              ) : savedContent && savedContent.length > 0 ? (
                <div>
                  {/* Filter by image types */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-4">Your Saved NASA Images</h3>
                    <div className="flex flex-wrap gap-2">
                      {['all', 'apod', 'mars_photo', 'epic'].map((type) => (
                        <button
                          key={type}
                          className="px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm font-medium transition-all"
                        >
                          {type === 'all' ? 'All Images' : 
                           type === 'apod' ? 'APOD' :
                           type === 'mars_photo' ? 'Mars Photos' :
                           type === 'epic' ? 'EPIC Earth' : type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Images Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {savedContent
                      .filter((item) => ['apod', 'mars_photo', 'epic'].includes(item.content_type))
                      .map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group cursor-pointer"
                        >
                          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
                            {/* Image placeholder - we'll need to enhance this with actual image data */}
                            <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Camera className="h-12 w-12 text-gray-500" />
                              </div>
                              
                              {/* Type Badge */}
                              <div className="absolute top-3 left-3">
                                <span className="px-2 py-1 rounded bg-purple-500/80 text-white text-xs font-bold">
                                  {item.content_type === 'apod' ? 'APOD' :
                                   item.content_type === 'mars_photo' ? 'MARS' :
                                   item.content_type === 'epic' ? 'EPIC' : item.content_type}
                                </span>
                              </div>

                              {/* Remove Button */}
                              <button 
                                onClick={() => {
                                  if (confirm('Delete this saved image?')) {
                                    deleteContent.mutate(item.id);
                                  }
                                }}
                                className="absolute top-3 right-3 p-2 bg-red-500/80 hover:bg-red-500 rounded-full transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="h-4 w-4 text-white" />
                              </button>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-xs font-medium">
                                  {item.content_type.replace('_', ' ').toUpperCase()}
                                </span>
                                {item.is_favorite && (
                                  <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
                                )}
                              </div>
                              
                              <h4 className="text-white font-bold line-clamp-2 mb-2">
                                {item.title}
                              </h4>
                              
                              {item.notes && (
                                <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                                  {item.notes}
                                </p>
                              )}
                              
                              {item.tags && item.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {item.tags.slice(0, 3).map((tag, i) => (
                                    <span key={i} className="px-2 py-1 rounded bg-white/10 text-gray-300 text-xs">
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  {new Date(item.created_at).toLocaleDateString()}
                                </span>
                                <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Camera className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No saved images yet</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Visit the Gallery to save your favorite NASA images!
                  </p>
                  <button 
                    onClick={() => window.location.href = '/gallery'}
                    className="mt-4 px-6 py-3 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-medium transition-all flex items-center gap-2 mx-auto"
                  >
                    <Camera className="h-5 w-5" />
                    Explore Gallery
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Sky Markers Tab - only for own profile */}
          {activeTab === 'skymap' && isOwnProfile && (
            <div className="space-y-4">
              {skyMarkersLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                </div>
              ) : skyMarkers && skyMarkers.length > 0 ? (
                skyMarkers.map((marker: SkyMarker, index: number) => (
                  <motion.div
                    key={marker.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:border-purple-500/50 transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Star className={`h-5 w-5 ${marker.is_tracking ? 'text-yellow-400' : 'text-purple-400'}`} />
                          <h3 className="text-xl font-bold text-white">{marker.display_name}</h3>
                          <div className="flex gap-2">
                            {marker.is_tracking && (
                              <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-xs font-medium">
                                TRACKING
                              </span>
                            )}
                            {marker.is_public && (
                              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-medium">
                                PUBLIC
                              </span>
                            )}
                            {marker.is_featured && (
                              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium">
                                FEATURED
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-sm">
                            <span className="text-gray-500">Type:</span>
                            <span className="text-white ml-2">{marker.object_type}</span>
                          </div>
                          {marker.az !== undefined && marker.alt !== undefined ? (
                            <>
                              <div className="text-sm">
                                <span className="text-gray-500">Az:</span>
                                <span className="text-white ml-2">{marker.az.toFixed(2)}°</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-500">Alt:</span>
                                <span className="text-white ml-2">{marker.alt.toFixed(2)}°</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-sm">
                                <span className="text-gray-500">RA:</span>
                                <span className="text-white ml-2">{marker.ra.toFixed(4)}°</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-500">Dec:</span>
                                <span className="text-white ml-2">{marker.dec.toFixed(4)}°</span>
                              </div>
                            </>
                          )}
                          {marker.magnitude && (
                            <div className="text-sm">
                              <span className="text-gray-500">Mag:</span>
                              <span className="text-white ml-2">{marker.magnitude}</span>
                            </div>
                          )}
                        </div>
                        
                        {marker.notes && (
                          <p className="text-gray-300 text-sm mb-3 line-clamp-2">{marker.notes}</p>
                        )}
                        
                        {marker.ai_description && (
                          <div className="mt-3 p-3 bg-black/30 rounded-lg">
                            <p className="text-xs text-gray-400 mb-1">AI Description:</p>
                            <p className="text-gray-300 text-sm line-clamp-3">{marker.ai_description}</p>
                          </div>
                        )}
                        
                        {marker.tags && marker.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {marker.tags.map((tag: string, i: number) => (
                              <span key={i} className="px-2 py-1 rounded bg-white/10 text-gray-300 text-xs">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => {
                            // Navigate to skymap with this marker selected
                            const params = new URLSearchParams({
                              marker: marker.id.toString(),
                              ...(marker.az !== undefined && marker.alt !== undefined
                                ? { az: marker.az.toString(), alt: marker.alt.toString() }
                                : { ra: marker.ra.toString(), dec: marker.dec.toString() }
                              )
                            });
                            window.location.href = `/skymap?${params.toString()}`;
                          }}
                          className="px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm font-medium transition-all flex items-center gap-2"
                          title="View in Skymap"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this sky marker?')) {
                              deleteMarker.mutate(marker.id);
                            }
                          }}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-all"
                          title="Delete marker"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                      <span className="text-xs text-gray-500">
                        Created {new Date(marker.created_at).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {marker.observation_count && marker.observation_count > 0 && (
                          <span>{marker.observation_count} observations</span>
                        )}
                        {marker.visibility_rating && (
                          <span>★ {marker.visibility_rating}/10</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Star className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No sky markers yet</p>
                  <p className="text-gray-500 text-sm mt-2">Start marking celestial objects in the Skymap!</p>
                  <button 
                    onClick={() => window.location.href = '/skymap'}
                    className="mt-4 px-6 py-3 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-medium transition-all flex items-center gap-2 mx-auto"
                  >
                    <Star className="h-5 w-5" />
                    Explore Skymap
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Messages Tab - only for own profile */}
          {activeTab === 'messages' && isOwnProfile && (
            <div className="space-y-4">
              {messagesLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                </div>
              ) : messageThreads && messageThreads.length > 0 ? (
                messageThreads.map((thread, index) => (
                  <motion.div
                    key={thread.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:border-blue-500/50 transition-all group cursor-pointer"
                    onClick={() => window.location.href = `/messages?user=${thread.other_user.id}&username=${thread.other_user.username}&fullName=${encodeURIComponent(thread.other_user.full_name || '')}&bio=${encodeURIComponent(thread.other_user.bio || '')}&profilePicture=${encodeURIComponent(thread.other_user.profile_picture || '')}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                        {thread.other_user.profile_picture ? (
                          <img 
                            src={thread.other_user.profile_picture} 
                            alt={thread.other_user.username} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          thread.other_user.full_name?.charAt(0).toUpperCase() || thread.other_user.username.charAt(0).toUpperCase()
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-white truncate">
                            {thread.other_user.full_name || thread.other_user.username}
                          </h3>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {new Date(thread.last_activity).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        <p className="text-gray-400 text-sm mb-1">@{thread.other_user.username}</p>
                        
                        {thread.last_message && (
                          <p className="text-gray-300 text-sm line-clamp-2">
                            <span className="text-gray-500">
                              {thread.last_message.sender.id === profile?.id ? 'You: ' : ''}
                            </span>
                            {thread.last_message.message}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            {thread.unread_count > 0 && (
                              <span className="px-2 py-1 rounded-full bg-purple-500 text-white text-xs font-bold">
                                {thread.unread_count}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              Conversation
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No conversations yet</p>
                  <p className="text-gray-500 text-sm mt-2">Connect with fellow space explorers in the Explore page!</p>
                </div>
              )}
            </div>
          )}

          {/* Activity Tab - only for own profile */}
          {activeTab === 'activity' && isOwnProfile && (
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

          {/* Account Settings Tab - only for own profile */}
          {activeTab === 'settings' && isOwnProfile && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Change Password Section */}
                <div className="lg:col-span-2">
                  <ChangePassword />
                </div>

                {/* Account Security Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-sm rounded-2xl border border-white/10 p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-green-500/20 rounded-xl">
                      <Shield className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Account Security</h2>
                      <p className="text-gray-400">Security status and settings</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 px-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <div>
                          <p className="text-white font-medium">Email Verified</p>
                          <p className="text-gray-400 text-sm">{profile?.email}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-medium">
                        Verified
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-3 px-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Key className="h-5 w-5 text-blue-400" />
                        <div>
                          <p className="text-white font-medium">Password Security</p>
                          <p className="text-gray-400 text-sm">Last changed recently</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium">
                        Strong
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-3 px-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Settings className="h-5 w-5 text-purple-400" />
                        <div>
                          <p className="text-white font-medium">Account Active</p>
                          <p className="text-gray-400 text-sm">
                            Joined {new Date(currentProfile?.date_joined || '').toLocaleDateString('en-US', { 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium">
                        Active
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Data & Privacy Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-sm rounded-2xl border border-white/10 p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-orange-500/20 rounded-xl">
                      <Shield className="h-6 w-6 text-orange-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Data & Privacy</h2>
                      <p className="text-gray-400">Manage your data and privacy settings</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-lg">
                      <p className="text-white font-medium mb-2">Account Statistics</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Saved Content:</span>
                          <span className="text-white ml-2">{profile?.saved_content_count || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Journals:</span>
                          <span className="text-white ml-2">{profile?.journals_count || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Collections:</span>
                          <span className="text-white ml-2">{profile?.collections_count || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Activities:</span>
                          <span className="text-white ml-2">{activities?.length || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-yellow-300 font-medium mb-2">Data Management</p>
                      <p className="text-gray-400 text-sm mb-3">
                        Your cosmic journey data is stored securely. Contact support if you need to export or delete your data.
                      </p>
                      <button className="px-4 py-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 text-sm font-medium transition-all">
                        Contact Support
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <EditProfileModal
          profile={editedProfile}
          onClose={() => setIsEditingProfile(false)}
          onSave={(data) => {
            updateProfile.mutate(data);
            setIsEditingProfile(false);
          }}
          isLoading={updateProfile.isPending}
        />
      )}
      </div>
    </Layout>
  );
};

// Edit Profile Modal Component
const EditProfileModal: React.FC<{
  profile: { full_name: string; bio: string; profile_picture: string };
  onClose: () => void;
  onSave: (data: { full_name?: string; bio?: string; profile_picture?: string }) => void;
  isLoading?: boolean;
}> = ({ profile, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = React.useState(profile);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-white/10 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Edit className="h-6 w-6" />
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Profile Picture URL
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                  {formData.profile_picture ? (
                    <img src={formData.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    formData.full_name?.charAt(0).toUpperCase() || '?'
                  )}
                </div>
                <button 
                  type="button"
                  className="absolute bottom-0 right-0 p-1 bg-purple-500 rounded-full hover:bg-purple-600 transition-colors"
                >
                  <Camera className="h-3 w-3 text-white" />
                </button>
              </div>
              <input
                type="text"
                value={formData.profile_picture}
                onChange={(e) => setFormData({ ...formData, profile_picture: e.target.value })}
                placeholder="Enter image URL"
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Enter your full name"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows={4}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;
