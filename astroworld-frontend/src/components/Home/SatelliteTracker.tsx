// src/components/Home/SatelliteTracker.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePopularSatellites, useSatelliteSearch, parseOrbitalData } from '../../hooks/nasa/useSatelliteTracking';
import type { Satellite } from '../../services/nasa/nasaAPI';
import { Search, Globe, Clock, Orbit, Ruler } from 'lucide-react';

interface SatelliteTrackerProps {
  className?: string;
}

const SatelliteTracker: React.FC<SatelliteTrackerProps> = ({ className = '' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSatellite, setSelectedSatellite] = useState<Satellite | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const { data: popularSatellites, isLoading: popularLoading } = usePopularSatellites();
  const { data: searchResults, isLoading: searchLoading } = useSatelliteSearch(searchQuery);

  const satellites = searchQuery ? searchResults || [] : popularSatellites || [];
  const isLoading = searchQuery ? searchLoading : popularLoading;

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSatelliteIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('iss')) return 'ISS';
    if (lowerName.includes('hubble')) return 'HST';
    if (lowerName.includes('starlink')) return 'STAR';
    if (lowerName.includes('gps')) return 'GPS';
    if (lowerName.includes('tiangong')) return 'TSS';
    return 'SAT';
  };

  const getOrbitTypeColor = (type: string | undefined) => {
    switch (type?.toLowerCase()) {
      case 'leo': return 'bg-green-600';
      case 'meo': return 'bg-yellow-600';
      case 'geo': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getOrbitTypeName = (type: string | undefined) => {
    switch (type?.toLowerCase()) {
      case 'leo': return 'Low Earth Orbit';
      case 'meo': return 'Medium Earth Orbit';
      case 'geo': return 'Geostationary Orbit';
      default: return 'Unknown Orbit';
    }
  };

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 ${className} mx-auto max-w-7xl`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Satellite Tracker</h2>
          <p className="text-gray-400">Track satellites in real-time using TLE orbital data</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Current Time (UTC)</div>
          <div className="text-white font-mono">
            {currentTime.toISOString().slice(0, 19).replace('T', ' ')}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search satellites (e.g., ISS, Hubble, Starlink)..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="mt-2 text-gray-400 hover:text-white text-sm"
          >
            Clear search and show popular satellites
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-400">Loading satellite data...</span>
        </div>
      )}

      {/* Satellite Grid */}
      {!isLoading && satellites.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {satellites.map((satellite, index) => {
            const orbitalData = parseOrbitalData(satellite.tle_line1, satellite.tle_line2);
            
            return (
              <motion.div
                key={satellite.satellite_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-all duration-300 cursor-pointer border border-gray-700 hover:border-blue-500"
                onClick={() => setSelectedSatellite(satellite)}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-xs font-bold bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                    {getSatelliteIcon(satellite.name)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium text-sm line-clamp-1">
                      {satellite.name}
                    </h3>
                    <p className="text-gray-400 text-xs">ID: {satellite.satellite_id}</p>
                  </div>
                  {satellite.orbit_type && (
                    <span className={`px-2 py-1 rounded text-xs text-white ${getOrbitTypeColor(satellite.orbit_type)}`}>
                      {satellite.orbit_type.toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Orbital Info */}
                {orbitalData && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="w-3 h-3 text-blue-400" />
                      <span className="text-gray-400">Period:</span>
                      <span className="text-white">{orbitalData.periodMinutes.toFixed(1)} min</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Ruler className="w-3 h-3 text-green-400" />
                      <span className="text-gray-400">Altitude:</span>
                      <span className="text-white">{orbitalData.altitudeKm.toFixed(0)} km</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Orbit className="w-3 h-3 text-purple-400" />
                      <span className="text-gray-400">Inclination:</span>
                      <span className="text-white">{orbitalData.inclination.toFixed(1)}°</span>
                    </div>
                  </div>
                )}

                {/* TLE Date */}
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="text-xs">
                    <span className="text-gray-400">TLE Updated:</span>
                    <span className="text-white ml-1">{formatDate(satellite.tle_date)}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* No Results */}
      {!isLoading && satellites.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            {searchQuery ? 'No satellites found for your search.' : 'No satellite data available.'}
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-blue-400 hover:text-blue-300"
            >
              Show popular satellites instead
            </button>
          )}
        </div>
      )}

      {/* Popular Satellites Quick Access */}
      {!searchQuery && !isLoading && satellites.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            Featured Satellites
          </h3>
          <div className="flex flex-wrap gap-2">
            {satellites.slice(0, 6).map((satellite) => (
              <button
                key={satellite.satellite_id}
                onClick={() => setSelectedSatellite(satellite)}
                className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm transition-colors flex items-center gap-2"
              >
                <span className="text-xs font-bold bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                  {getSatelliteIcon(satellite.name)}
                </span>
                <span>{satellite.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Detailed View Modal */}
      {selectedSatellite && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedSatellite(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center gap-4">
                <div className="text-sm font-bold bg-blue-500/20 text-blue-300 px-3 py-2 rounded-lg">
                  {getSatelliteIcon(selectedSatellite.name)}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white">{selectedSatellite.name}</h2>
                  <p className="text-gray-400">NORAD ID: {selectedSatellite.satellite_id}</p>
                  {selectedSatellite.orbit_type && (
                    <div className="mt-2">
                      <span className={`px-3 py-1 rounded text-sm text-white ${getOrbitTypeColor(selectedSatellite.orbit_type)}`}>
                        {getOrbitTypeName(selectedSatellite.orbit_type)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Orbital Parameters */}
            <div className="p-6">
              {(() => {
                const orbitalData = parseOrbitalData(selectedSatellite.tle_line1, selectedSatellite.tle_line2);
                if (!orbitalData) return <div className="text-gray-400">Unable to parse orbital data</div>;

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">Orbital Parameters</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Orbital Period:</span>
                          <span className="text-white">{orbitalData.periodMinutes.toFixed(2)} minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Altitude:</span>
                          <span className="text-white">{orbitalData.altitudeKm.toFixed(0)} km</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Inclination:</span>
                          <span className="text-white">{orbitalData.inclination.toFixed(2)}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Eccentricity:</span>
                          <span className="text-white">{orbitalData.eccentricity.toFixed(6)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Mean Motion:</span>
                          <span className="text-white">{orbitalData.meanMotion.toFixed(8)} rev/day</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">Additional Data</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">RAAN:</span>
                          <span className="text-white">{orbitalData.raan.toFixed(2)}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Arg of Perigee:</span>
                          <span className="text-white">{orbitalData.argOfPerigee.toFixed(2)}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Mean Anomaly:</span>
                          <span className="text-white">{orbitalData.meanAnomaly.toFixed(2)}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Semi-Major Axis:</span>
                          <span className="text-white">{orbitalData.semiMajorAxis.toFixed(0)} km</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">TLE Updated:</span>
                          <span className="text-white">{formatDate(selectedSatellite.tle_date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* TLE Data */}
              <div className="mt-6">
                <h3 className="text-lg font-medium text-white mb-4">Two-Line Element Set (TLE)</h3>
                <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm">
                  <div className="text-gray-400 mb-2">{selectedSatellite.name}</div>
                  <div className="text-green-400">{selectedSatellite.tle_line1}</div>
                  <div className="text-green-400">{selectedSatellite.tle_line2}</div>
                </div>
                <p className="text-gray-400 text-xs mt-2">
                  TLE data can be used with orbital prediction software to calculate satellite positions.
                </p>
              </div>

              {/* Close Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedSatellite(null)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SatelliteTracker;