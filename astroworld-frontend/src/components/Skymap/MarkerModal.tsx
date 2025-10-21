import React, { useState, useEffect } from 'react';
import { X, MapPin, Star, Eye, EyeOff, Tag, Palette } from 'lucide-react';
import type { SkyMarker, CreateMarkerData } from '../../hooks/useSkymap';

interface MarkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  marker?: SkyMarker | null;
  coordinates?: { ra: number; dec: number; alt?: number; az?: number };
  onSubmit: (data: CreateMarkerData) => void;
  isLoading?: boolean;
}

const OBJECT_TYPES = [
  { value: 'star', label: 'Star', icon: '⭐' },
  { value: 'planet', label: 'Planet', icon: '🪐' },
  { value: 'galaxy', label: 'Galaxy', icon: '🌌' },
  { value: 'nebula', label: 'Nebula', icon: '☁️' },
  { value: 'constellation', label: 'Constellation', icon: '✨' },
  { value: 'asteroid', label: 'Asteroid', icon: '🪨' },
  { value: 'comet', label: 'Comet', icon: '☄️' },
  { value: 'satellite', label: 'Satellite', icon: '🛰️' },
  { value: 'other', label: 'Other', icon: '🔭' },
];

const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
];

export const MarkerModal: React.FC<MarkerModalProps> = ({
  isOpen,
  onClose,
  marker,
  coordinates,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<CreateMarkerData>({
    name: '',
    object_type: 'star',
    ra: 0,
    dec: 0,
    notes: '',
    custom_name: '',
    tags: [],
    color: COLORS[0],
    is_public: false,
    magnitude: undefined,
    visibility_rating: undefined,
  });

  const [tagInput, setTagInput] = useState('');

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (marker) {
        // Edit mode
        setFormData({
          name: marker.name,
          object_type: marker.object_type,
          ra: marker.ra,
          dec: marker.dec,
          alt: marker.alt,
          az: marker.az,
          notes: marker.notes || '',
          custom_name: marker.custom_name || '',
          tags: marker.tags || [],
          color: marker.color,
          is_public: marker.is_public,
          magnitude: marker.magnitude,
          visibility_rating: marker.visibility_rating,
          object_id: marker.object_id,
        });
      } else if (coordinates) {
        // Create mode with coordinates
        setFormData(prev => ({
          ...prev,
          ra: coordinates.ra,
          dec: coordinates.dec,
          alt: coordinates.alt,
          az: coordinates.az,
        }));
      }
    }
    setTagInput('');
  }, [isOpen, marker, coordinates]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit(formData);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {marker ? 'Edit Marker' : 'Create New Marker'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <MapPin size={20} />
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Object Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Sirius, Andromeda Galaxy"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Name
                </label>
                <input
                  type="text"
                  value={formData.custom_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, custom_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your custom name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Object Type
              </label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {OBJECT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, object_type: type.value }))}
                    className={`p-2 text-sm rounded-md border transition-colors ${
                      formData.object_type === type.value
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-lg">{type.icon}</div>
                    <div className="text-xs">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Coordinates */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Coordinates</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RA (degrees)
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.ra}
                  onChange={(e) => setFormData(prev => ({ ...prev, ra: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dec (degrees)
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.dec}
                  onChange={(e) => setFormData(prev => ({ ...prev, dec: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alt (degrees)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.alt || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, alt: parseFloat(e.target.value) || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Az (degrees)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.az || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, az: parseFloat(e.target.value) || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Star size={20} />
              Additional Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Magnitude
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.magnitude || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, magnitude: parseFloat(e.target.value) || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., -1.46"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visibility Rating (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.visibility_rating || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, visibility_rating: parseInt(e.target.value) || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add your observations or notes..."
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Tag size={20} />
              Tags
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add tags (press Enter)"
              />
              <button
                type="button"
                onClick={addTag}
                disabled={!tagInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>

            {(formData.tags || []).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(formData.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Display Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Palette size={20} />
              Display Options
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marker Color
              </label>
              <div className="flex gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.color === color
                        ? 'border-gray-800 scale-110'
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

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
                {formData.is_public ? <Eye size={16} /> : <EyeOff size={16} />}
                {formData.is_public ? 'Public' : 'Private'}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : marker ? 'Update Marker' : 'Create Marker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};