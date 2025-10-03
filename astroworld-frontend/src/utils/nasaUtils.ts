// src/utils/nasaUtils.ts
import type { APOD, NearEarthObject, MarsRoverPhoto, Exoplanet } from '../services/nasa/nasaServices';

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDistance = (km: number): string => {
  if (km < 1000) {
    return `${km.toFixed(1)} km`;
  } else if (km < 1000000) {
    return `${(km / 1000).toFixed(1)}K km`;
  } else {
    return `${(km / 1000000).toFixed(2)}M km`;
  }
};

export const formatVelocity = (kmh: number): string => {
  return `${kmh.toLocaleString()} km/h`;
};

export const formatDiameter = (minKm: number, maxKm: number): string => {
  return `${minKm.toFixed(2)} - ${maxKm.toFixed(2)} km`;
};

export const formatTemperature = (kelvin: number): string => {
  const celsius = kelvin - 273.15;
  const fahrenheit = (celsius * 9/5) + 32;
  return `${celsius.toFixed(0)}°C (${fahrenheit.toFixed(0)}°F)`;
};

export const getHazardLevel = (neo: NearEarthObject): 'low' | 'medium' | 'high' => {
  if (!neo.is_potentially_hazardous) return 'low';
  
  const minApproach = Math.min(
    ...neo.close_approaches.map(approach => approach.miss_distance_km)
  );
  
  if (minApproach < 7500000) return 'high'; // Less than 0.05 AU
  if (minApproach < 19500000) return 'medium'; // Less than 0.13 AU
  return 'low';
};

export const getHazardColor = (level: 'low' | 'medium' | 'high'): string => {
  switch (level) {
    case 'high': return 'text-red-500';
    case 'medium': return 'text-yellow-500';
    case 'low': return 'text-green-500';
    default: return 'text-gray-500';
  }
};

export const getRoverStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active': return 'text-green-500';
    case 'complete': return 'text-blue-500';
    case 'inactive': return 'text-gray-500';
    default: return 'text-yellow-500';
  }
};

export const getEventCategoryIcon = (category: string): string => {
  const categoryMap: Record<string, string> = {
    'wildfires': '🔥',
    'volcanoes': '🌋',
    'storms': '⛈️',
    'floods': '🌊',
    'earthquakes': '🌍',
    'landslides': '⛰️',
    'drought': '🏜️',
    'dust_and_haze': '🌪️',
    'snow': '❄️',
    'water_color': '💧',
  };
  return categoryMap[category.toLowerCase()] || '🌍';
};

export const getSpaceWeatherIcon = (eventType: string): string => {
  const typeMap: Record<string, string> = {
    'CME': '☄️',
    'FLR': '☀️',
    'SEP': '⚡',
    'MPC': '🛡️',
    'GST': '🌐',
    'IPS': '💥',
    'RBE': '🔋',
    'HSS': '💨',
  };
  return typeMap[eventType] || '🌌';
};

export const isAPODFavorite = (apod: APOD, favorites: any[]): boolean => {
  return favorites.some(fav => 
    fav.item_type === 'apod' && fav.item_id === apod.nasa_id
  );
};

export const isNEOTracked = (neo: NearEarthObject, tracking: any[]): boolean => {
  return tracking.some(track => 
    track.object_type === 'neo' && track.object_id === neo.nasa_id
  );
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getImagePlaceholder = (type: 'apod' | 'mars' | 'epic' | 'exoplanet'): string => {
  const placeholders = {
    apod: '/images/placeholder-space.jpg',
    mars: '/images/placeholder-mars.jpg', 
    epic: '/images/placeholder-earth.jpg',
    exoplanet: '/images/placeholder-exoplanet.jpg',
  };
  return placeholders[type];
};

export const downloadImage = async (url: string, filename: string): Promise<void> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Failed to download image:', error);
    throw new Error('Failed to download image');
  }
};

export const shareContent = async (title: string, text: string, url: string): Promise<void> => {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  } else {
    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(`${title}\n${text}\n${url}`);
      alert('Content copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }
};