 import React, { useState } from 'react';
import { Save, X, Globe, Lock, Tag } from 'lucide-react';
import type { CreateViewData } from '../../hooks/useSkymap';

interface SaveViewButtonProps {
  currentView: {
    ra_center: number;
    dec_center: number;
    zoom_level: number;
    stellarium_settings?: Record<string, unknown>;
    observation_time?: string;
    location?: Record<string, unknown>;
  };
  onSave: (data: CreateViewData) => void;
  isLoading?: boolean;
  featuredMarkerIds?: number[];
  className?: string;
}

const PRESET_TYPES = [
  { value: 'custom', label: 'Custom View', description: 'Your own saved view' },
  { value: 'constellation', label: 'Constellation', description: 'Focused on a constellation' },
  { value: 'planet_view', label: 'Planet View', description: 'Focused on planets' },
  { value: 'deep_sky', label: 'Deep Sky', description: 'Galaxies, nebulae, clusters' },
  { value: 'solar_system', label: 'Solar System', description: 'Sun, planets, moons' },
  { value: 'meteor_shower', label: 'Meteor Shower', description: 'Meteor shower radiant' },
  { value: 'eclipse', label: 'Eclipse', description: 'Solar or lunar eclipse' },
];

export const SaveViewButton: React.FC<SaveViewButtonProps> = ({
  currentView,
  onSave,
  isLoading = false,
  featuredMarkerIds = [],
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateViewData>({
    title: '',
    description: '',
    preset_type: 'custom',
    ra_center: currentView.ra_center,
    dec_center: currentView.dec_center,
    zoom_level: currentView.zoom_level,
    stellarium_settings: currentView.stellarium_settings,
    observation_time: currentView.observation_time,
    location: currentView.location,
    featured_marker_ids: featuredMarkerIds,
    is_public: false,
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');

  const openModal = () => {
    // Update form data with current view state
    setFormData(prev => ({
      ...prev,
      ra_center: currentView.ra_center,
      dec_center: currentView.dec_center,
      zoom_level: currentView.zoom_level,
      stellarium_settings: currentView.stellarium_settings,
      observation_time: currentView.observation_time,
      location: currentView.location,
      featured_marker_ids: featuredMarkerIds,
    }));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      title: '',
      description: '',
      preset_type: 'custom',
      ra_center: currentView.ra_center,
      dec_center: currentView.dec_center,
      zoom_level: currentView.zoom_level,
      stellarium_settings: currentView.stellarium_settings,
      observation_time: currentView.observation_time,
      location: currentView.location,
      featured_marker_ids: featuredMarkerIds,
      is_public: false,
      tags: [],
    });
    setTagInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSave(formData);
    closeModal();
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    const currentTags = formData.tags || [];
    if (tag && !currentTags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...currentTags, tag],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      >
        <Save size={16} />
        Save View
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Save Current View</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    View Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Orion Constellation View"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Describe what makes this view special..."
                  />
                </div>
              </div>

              {/* View Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  View Type
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {PRESET_TYPES.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, preset_type: preset.value }))}
                      className={`p-3 text-left rounded-md border transition-colors ${
                        formData.preset_type === preset.value
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium">{preset.label}</div>
                      <div className="text-sm text-gray-500">{preset.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Current View Details */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Current View Details</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Center: RA {formData.ra_center.toFixed(4)}°, Dec {formData.dec_center.toFixed(4)}°</div>
                  <div>Zoom Level: {formData.zoom_level.toFixed(2)}</div>
                  {featuredMarkerIds.length > 0 && (
                    <div>Featured Markers: {featuredMarkerIds.length} markers included</div>
                  )}
                  {formData.observation_time && (
                    <div>Time: {new Date(formData.observation_time).toLocaleString()}</div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Tag size={16} />
                  Tags
                </h3>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Add tags (press Enter)"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={!tagInput.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>

                {(formData.tags || []).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {(formData.tags || []).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-sm rounded-md"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Visibility */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, is_public: !prev.is_public }))}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
                    formData.is_public
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'bg-gray-50 border-gray-300 text-gray-700'
                  }`}
                >
                  {formData.is_public ? <Globe size={16} /> : <Lock size={16} />}
                  {formData.is_public ? 'Public View' : 'Private View'}
                </button>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isLoading}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !formData.title.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : 'Save View'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};