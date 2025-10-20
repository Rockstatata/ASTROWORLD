// src/components/Home/GIBSImageryMap.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGIBSImagery } from '../../hooks/nasa/useGIBSImagery';
import { Map, Calendar, Eye, Download, Layers, Globe2, Satellite } from 'lucide-react';

interface GIBSImageryMapProps {
  className?: string;
}

const GIBSImageryMap: React.FC<GIBSImageryMapProps> = ({ className = '' }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedLayer, setSelectedLayer] = useState('MODIS_Terra_CorrectedReflectance_TrueColor');
  const [viewType, setViewType] = useState<'geographic' | 'arctic' | 'antarctic'>('geographic');

  const { data: imagery, isLoading, error } = useGIBSImagery({
    layer: selectedLayer,
    date: selectedDate,
    region: viewType
  });

  // Available GIBS layers
  const layers = [
    {
      id: 'MODIS_Terra_CorrectedReflectance_TrueColor',
      name: 'MODIS Terra True Color',
      description: 'Natural color satellite imagery from Terra satellite',
      satellite: 'Terra',
      icon: '🌍'
    },
    {
      id: 'MODIS_Aqua_CorrectedReflectance_TrueColor',
      name: 'MODIS Aqua True Color',
      description: 'Natural color satellite imagery from Aqua satellite',
      satellite: 'Aqua',
      icon: '🌊'
    },
    {
      id: 'VIIRS_SNPP_CorrectedReflectance_TrueColor',
      name: 'VIIRS True Color',
      description: 'High resolution true color from VIIRS instrument',
      satellite: 'Suomi NPP',
      icon: '🛰️'
    },
    {
      id: 'MODIS_Terra_CorrectedReflectance_Bands721',
      name: 'MODIS Terra False Color',
      description: 'False color imagery highlighting vegetation',
      satellite: 'Terra',
      icon: '🌱'
    },
    {
      id: 'MODIS_Terra_Aerosol',
      name: 'MODIS Terra Aerosol',
      description: 'Aerosol optical depth measurements',
      satellite: 'Terra',
      icon: '💨'
    },
    {
      id: 'OMI_SO2_PBL',
      name: 'OMI Sulfur Dioxide',
      description: 'Atmospheric sulfur dioxide concentrations',
      satellite: 'Aura',
      icon: '🌋'
    }
  ];

  const regions = [
    { id: 'geographic', name: 'Global View', icon: '🌍' },
    { id: 'arctic', name: 'Arctic View', icon: '🧊' },
    { id: 'antarctic', name: 'Antarctic View', icon: '🐧' }
  ];

  const getCurrentLayer = () => layers.find(layer => layer.id === selectedLayer) || layers[0];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMaxDate = () => {
    const today = new Date();
    today.setDate(today.getDate() - 1); // GIBS imagery is usually 1 day behind
    return today.toISOString().split('T')[0];
  };

  const getMinDate = () => {
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 2); // 2 years of data
    return minDate.toISOString().split('T')[0];
  };

  const downloadImage = () => {
    if (imagery?.image_url) {
      const link = document.createElement('a');
      link.href = imagery.image_url;
      link.download = `GIBS_${selectedLayer}_${selectedDate}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <Globe2 className="w-7 h-7 text-blue-400" />
            NASA GIBS Earth Imagery
          </h2>
          <p className="text-gray-400">Global Imagery Browse Services - Real Earth satellite data</p>
        </div>
        <div className="flex items-center gap-2">
          <Satellite className="w-5 h-5 text-blue-400" />
          <span className="text-sm text-gray-400">
            {getCurrentLayer().satellite}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Calendar className="inline w-4 h-4 mr-1" />
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={getMinDate()}
            max={getMaxDate()}
            className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">{formatDate(selectedDate)}</p>
        </div>

        {/* Layer Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Layers className="inline w-4 h-4 mr-1" />
            Imagery Layer
          </label>
          <select
            value={selectedLayer}
            onChange={(e) => setSelectedLayer(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            {layers.map((layer) => (
              <option key={layer.id} value={layer.id}>
                {layer.icon} {layer.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">{getCurrentLayer().description}</p>
        </div>

        {/* Region Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Map className="inline w-4 h-4 mr-1" />
            View Region
          </label>
          <select
            value={viewType}
            onChange={(e) => setViewType(e.target.value as 'geographic' | 'arctic' | 'antarctic')}
            className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.icon} {region.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            {viewType === 'geographic' && 'Global cylindrical projection'}
            {viewType === 'arctic' && 'Polar stereographic - North'}
            {viewType === 'antarctic' && 'Polar stereographic - South'}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-400">Loading satellite imagery...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
          <div className="text-red-400 font-medium mb-2">Failed to load imagery</div>
          <div className="text-red-300 text-sm">
            Unable to fetch GIBS imagery data. This might be due to:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Selected date may not have available imagery</li>
              <li>Network connectivity issues</li>
              <li>NASA GIBS service temporarily unavailable</li>
            </ul>
          </div>
        </div>
      )}

      {/* Imagery Display */}
      {!isLoading && !error && imagery && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Image */}
          <div className="relative bg-gray-800 rounded-lg overflow-hidden">
            {imagery.image_url ? (
              <img
                src={imagery.image_url}
                alt={`${getCurrentLayer().name} - ${selectedDate}`}
                className="w-full h-auto max-h-[600px] object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIFVuYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
                }}
              />
            ) : (
              <div className="flex items-center justify-center py-12 text-gray-400">
                <div className="text-center">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <div>No imagery available for selected parameters</div>
                  <div className="text-sm mt-2">Try a different date or layer</div>
                </div>
              </div>
            )}

            {/* Image Overlay Controls */}
            {imagery.image_url && (
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={downloadImage}
                  className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors"
                  title="Download Image"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Image Info */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-400">Layer:</div>
                <div className="text-white font-medium">{getCurrentLayer().name}</div>
              </div>
              <div>
                <div className="text-gray-400">Date:</div>
                <div className="text-white font-medium">{formatDate(selectedDate)}</div>
              </div>
              <div>
                <div className="text-gray-400">Satellite:</div>
                <div className="text-white font-medium">{getCurrentLayer().satellite}</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="text-gray-400 text-xs">
                <strong>About this layer:</strong> {getCurrentLayer().description}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Layer Information */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <h3 className="text-lg font-medium text-white mb-4">Available Layers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {layers.map((layer) => (
            <button
              key={layer.id}
              onClick={() => setSelectedLayer(layer.id)}
              className={`text-left p-3 rounded-lg border transition-all ${
                selectedLayer === layer.id
                  ? 'bg-blue-600/20 border-blue-500 text-white'
                  : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-800/70'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{layer.icon}</span>
                <span className="font-medium text-sm">{layer.name}</span>
              </div>
              <div className="text-xs text-gray-400">{layer.description}</div>
              <div className="text-xs text-gray-500 mt-1">{layer.satellite}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GIBSImageryMap;