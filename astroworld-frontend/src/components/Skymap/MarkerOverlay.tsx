import React from 'react';
import { MapPin, Star, Eye, Edit, Trash2, Target } from 'lucide-react';
import type { SkyMarker } from '../../hooks/useSkymap';

interface MarkerOverlayProps {
  markers: SkyMarker[];
  onMarkerClick?: (marker: SkyMarker) => void;
  onEditMarker?: (marker: SkyMarker) => void;
  onDeleteMarker?: (markerId: number) => void;
  onToggleTracking?: (markerId: number) => void;
  selectedMarkerId?: number;
  className?: string;
  stellariumEngine?: unknown; // Stellarium engine instance
}

// Function to convert celestial coordinates to screen coordinates using Stellarium
const celestialToScreen = (
  marker: SkyMarker,
  stellariumEngine?: unknown
): { x: number; y: number } | null => {
  if (!stellariumEngine || typeof stellariumEngine !== 'object') {
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const engine = stellariumEngine as any;
    if (!engine.core?.projection?.project) {
      return null;
    }

    // Use Az/Alt coordinates if available, otherwise fall back to RA/Dec
    let ra: number, dec: number;
    if (marker.az !== undefined && marker.alt !== undefined) {
      // For Az/Alt coordinates, we need to convert them to RA/Dec for Stellarium's projection
      // This is a simplified conversion - in practice, you'd use proper astronomical libraries
      ra = marker.az; // Approximate: azimuth as RA
      dec = Math.max(-90, Math.min(90, marker.alt)); // Altitude as Dec, clamped
    } else {
      ra = marker.ra;
      dec = marker.dec;
    }

    // Convert RA/Dec to radians (Stellarium uses radians)
    const raRad = ra * Math.PI / 180;
    const decRad = dec * Math.PI / 180;

    // Create a position vector in ICRS coordinates
    const pos = [
      Math.cos(decRad) * Math.cos(raRad),
      Math.cos(decRad) * Math.sin(raRad),
      Math.sin(decRad)
    ];

    // Use Stellarium's projection to convert to screen coordinates
    const screenCoords = engine.core.projection.project(pos);

    if (screenCoords && screenCoords.length >= 2) {
      return {
        x: screenCoords[0],
        y: screenCoords[1]
      };
    }
  } catch (error) {
    console.warn('Failed to project coordinates:', error);
  }

  return null;
};

interface MarkerDotProps {
  marker: SkyMarker;
  position: { x: number; y: number };
  isSelected: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleTracking: () => void;
}

const MarkerDot: React.FC<MarkerDotProps> = ({
  marker,
  position,
  isSelected,
  onClick,
  onEdit,
  onDelete,
  onToggleTracking,
}) => {
  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: position.x - 12,
        top: position.y - 12,
        transform: 'translate(-50%, -50%)',
      }}
      data-marker-id={marker.id}
    >
      {/* Pulsing ring around marked celestial object */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div 
          className="w-16 h-16 rounded-full border-2 border-purple-400/50 animate-pulse"
          style={{ 
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        />
      </div>
      
      {/* Glow effect for marked object */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          filter: 'blur(8px)',
          opacity: 0.6
        }}
      >
        <div 
          className="w-12 h-12 rounded-full"
          style={{ 
            backgroundColor: marker.color || '#a855f7',
            boxShadow: `0 0 30px ${marker.color || '#a855f7'}`
          }}
        />
      </div>

      {/* Marker Dot */}
      <div
        className={`relative pointer-events-auto cursor-pointer transition-all duration-200 z-10 ${
          isSelected ? 'scale-125' : 'hover:scale-110'
        }`}
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div
          className={`w-6 h-6 rounded-full border-2 shadow-lg ${
            marker.is_tracking
              ? 'border-white shadow-2xl animate-pulse'
              : 'border-white/80'
          } ${isSelected ? 'ring-2 ring-white ring-opacity-50' : ''}`}
          style={{ backgroundColor: marker.color }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin size={12} className="text-white drop-shadow" />
          </div>
        </div>

        {/* Tracking Indicator */}
        {marker.is_tracking && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white animate-ping" />
        )}

        {/* Featured Indicator */}
        {marker.is_featured && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border border-white">
            <Star size={8} className="text-white absolute inset-0.5" />
          </div>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-auto z-10">
          <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl min-w-48 max-w-xs">
            <div className="font-medium text-sm mb-1">
              {marker.display_name}
            </div>
            <div className="text-xs text-gray-300 space-y-1">
              <div>Type: {marker.object_type}</div>
              {marker.az !== undefined && marker.alt !== undefined ? (
                <>
                  <div>Az: {marker.az.toFixed(2)}°, Alt: {marker.alt.toFixed(2)}°</div>
                  <div>RA: {marker.ra.toFixed(4)}°, Dec: {marker.dec.toFixed(4)}°</div>
                </>
              ) : (
                <div>RA: {marker.ra.toFixed(4)}°, Dec: {marker.dec.toFixed(4)}°</div>
              )}
              {marker.magnitude && (
                <div>Magnitude: {marker.magnitude}</div>
              )}
              {marker.visibility_rating && (
                <div>Visibility: {marker.visibility_rating}/10</div>
              )}
              {marker.notes && (
                <div className="mt-1 text-gray-400 text-xs">
                  {marker.notes.length > 50 
                    ? `${marker.notes.substring(0, 50)}...` 
                    : marker.notes
                  }
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-1 mt-2 pt-2 border-t border-gray-700">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                title="Edit marker"
              >
                <Edit size={12} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onToggleTracking(); }}
                className={`p-1 transition-colors ${
                  marker.is_tracking 
                    ? 'text-yellow-400 hover:text-yellow-300' 
                    : 'text-gray-400 hover:text-yellow-400'
                }`}
                title={marker.is_tracking ? 'Stop tracking' : 'Start tracking'}
              >
                <Target size={12} />
              </button>
              {marker.is_public && (
                <button
                  onClick={(e) => { e.stopPropagation(); /* Navigate to public view */ }}
                  className="p-1 text-green-400 hover:text-green-300 transition-colors"
                  title="View public page"
                >
                  <Eye size={12} />
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-1 text-red-400 hover:text-red-300 transition-colors ml-auto"
                title="Delete marker"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
};

export const MarkerOverlay: React.FC<MarkerOverlayProps> = ({
  markers,
  onMarkerClick,
  onEditMarker,
  onDeleteMarker,
  onToggleTracking,
  selectedMarkerId,
  className = '',
  stellariumEngine,
}) => {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {markers.map((marker) => {
        const screenPosition = celestialToScreen(
          marker,
          stellariumEngine
        );

        // Skip if we can't project the coordinates
        if (!screenPosition) return null;

        // Only render markers that are within the viewport
        const isVisible = 
          screenPosition.x >= -50 && 
          screenPosition.x <= 850 && // Assuming 800px wide viewport + margin
          screenPosition.y >= -50 && 
          screenPosition.y <= 650;   // Assuming 600px high viewport + margin

        if (!isVisible) return null;

        return (
          <MarkerDot
            key={marker.id}
            marker={marker}
            position={screenPosition}
            isSelected={selectedMarkerId === marker.id}
            onClick={() => onMarkerClick?.(marker)}
            onEdit={() => onEditMarker?.(marker)}
            onDelete={() => onDeleteMarker?.(marker.id)}
            onToggleTracking={() => onToggleTracking?.(marker.id)}
          />
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-80 text-white p-3 rounded-lg pointer-events-auto">
        <div className="text-xs font-medium mb-2">Marker Legend</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full border border-white" />
            <span>Marker</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-3 h-3 bg-blue-500 rounded-full border border-white" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-400 rounded-full" />
            </div>
            <span>Tracking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-3 h-3 bg-blue-500 rounded-full border border-white" />
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-purple-500 rounded-full" />
            </div>
            <span>Featured</span>
          </div>
        </div>
      </div>
    </div>
  );
};