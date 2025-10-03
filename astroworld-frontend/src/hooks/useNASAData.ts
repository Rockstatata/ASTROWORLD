// src/hooks/useNASAData.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nasaAPI } from '../services/nasa/nasaServices';
import type { 
  APODFilters, 
  NEOFilters, 
  MarsPhotosFilters, 
  ExoplanetFilters,
  SpaceWeatherFilters,
  NaturalEventFilters 
} from '../services/nasa/nasaServices';

// APOD Hooks
export const useAPOD = (date?: string) => {
  return useQuery({
    queryKey: ['apod', date],
    queryFn: () => nasaAPI.getAPOD(date),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useAPODRange = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['apod-range', startDate, endDate],
    queryFn: () => nasaAPI.getAPODRange(startDate, endDate),
    enabled: !!(startDate && endDate),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useRandomAPOD = (count: number = 1) => {
  return useQuery({
    queryKey: ['apod-random', count],
    queryFn: () => nasaAPI.getRandomAPOD(count),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// NEO Hooks
export const useNearEarthObjects = (filters: NEOFilters = {}) => {
  return useQuery({
    queryKey: ['neo', filters],
    queryFn: () => nasaAPI.getNearEarthObjects(filters),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

export const useNEO = (nasa_id: string) => {
  return useQuery({
    queryKey: ['neo', nasa_id],
    queryFn: () => nasaAPI.getNEOById(nasa_id),
    enabled: !!nasa_id,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useUpcomingNEOs = (days: number = 7) => {
  return useQuery({
    queryKey: ['neo-upcoming', days],
    queryFn: () => nasaAPI.getUpcomingNEOs(days),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Mars Photos Hooks
export const useMarsPhotos = (filters: MarsPhotosFilters = {}) => {
  return useQuery({
    queryKey: ['mars-photos', filters],
    queryFn: () => nasaAPI.getMarsPhotos(filters),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useMarsPhoto = (nasa_id: string) => {
  return useQuery({
    queryKey: ['mars-photo', nasa_id],
    queryFn: () => nasaAPI.getMarsPhotoById(nasa_id),
    enabled: !!nasa_id,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useLatestMarsPhotos = (rover?: string) => {
  return useQuery({
    queryKey: ['mars-photos-latest', rover],
    queryFn: () => nasaAPI.getLatestMarsPhotos(rover),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

// Exoplanets Hooks
export const useExoplanets = (filters: ExoplanetFilters = {}) => {
  return useQuery({
    queryKey: ['exoplanets', filters],
    queryFn: () => nasaAPI.getExoplanets(filters),
    staleTime: 1000 * 60 * 60, // 1 hour - exoplanets don't change often
  });
};

export const useExoplanet = (nasa_id: string) => {
  return useQuery({
    queryKey: ['exoplanet', nasa_id],
    queryFn: () => nasaAPI.getExoplanetById(nasa_id),
    enabled: !!nasa_id,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

export const useHabitableExoplanets = () => {
  return useQuery({
    queryKey: ['exoplanets-habitable'],
    queryFn: nasaAPI.getHabitableExoplanets,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

// Space Weather Hooks
export const useSpaceWeatherEvents = (filters: SpaceWeatherFilters = {}) => {
  return useQuery({
    queryKey: ['space-weather', filters],
    queryFn: () => nasaAPI.getSpaceWeatherEvents(filters),
    staleTime: 1000 * 60 * 10, // 10 minutes - space weather changes frequently
  });
};

export const useRecentSpaceWeather = (days: number = 30) => {
  return useQuery({
    queryKey: ['space-weather-recent', days],
    queryFn: () => nasaAPI.getRecentSpaceWeather(days),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Natural Events Hooks
export const useNaturalEvents = (filters: NaturalEventFilters = {}) => {
  return useQuery({
    queryKey: ['natural-events', filters],
    queryFn: () => nasaAPI.getNaturalEvents(filters),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

export const useActiveEvents = () => {
  return useQuery({
    queryKey: ['natural-events-active'],
    queryFn: nasaAPI.getActiveEvents,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// User Interaction Hooks
export const useUserFavorites = () => {
  return useQuery({
    queryKey: ['user-favorites'],
    queryFn: nasaAPI.getUserFavorites,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUserTracking = () => {
  return useQuery({
    queryKey: ['user-tracking'],
    queryFn: nasaAPI.getUserTracking,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUserStats = () => {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: nasaAPI.getUserStats,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Mutation Hooks
export const useFavoriteMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ itemType, itemId, notes, tags }: { 
      itemType: string; 
      itemId: string; 
      notes?: string; 
      tags?: string[] 
    }) => nasaAPI.addToFavorites(itemType, itemId, notes, tags),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-favorites'] });
    },
  });
};

export const useRemoveFavoriteMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => nasaAPI.removeFromFavorites(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-favorites'] });
    },
  });
};

export const useToggleFavoriteMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ itemType, itemId }: { itemType: string; itemId: string }) => 
      nasaAPI.toggleFavorite(itemType, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-favorites'] });
    },
  });
};

export const useTrackingMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ objectType, objectId }: { objectType: string; objectId: string }) => 
      nasaAPI.addToTracking(objectType, objectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-tracking'] });
    },
  });
};

export const useToggleTrackingMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ objectType, objectId }: { objectType: string; objectId: string }) => 
      nasaAPI.toggleTracking(objectType, objectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-tracking'] });
    },
  });
};

// Search Hook
export const useNASASearch = (query: string, types?: string[]) => {
  return useQuery({
    queryKey: ['nasa-search', query, types],
    queryFn: () => nasaAPI.searchAll(query, types),
    enabled: query.length > 2, // Only search if query is at least 3 characters
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};