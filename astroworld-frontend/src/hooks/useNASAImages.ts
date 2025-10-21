import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nasaAPI } from '../services/nasa/nasaServices';
import type { NASAImageFilters, NASAImageSearchResult } from '../services/nasa/nasaServices';

// Hook for searching NASA images
export const useNASAImageSearch = (filters: NASAImageFilters) => {
  return useQuery({
    queryKey: ['nasa-images', 'search', filters],
    queryFn: async () => {
      const response = await nasaAPI.searchImages(filters);
      return response.data;
    },
    enabled: !!filters.q, // Only run if there's a search query
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for getting popular NASA images
export const usePopularNASAImages = (limit: number = 20) => {
  return useQuery({
    queryKey: ['nasa-images', 'popular', limit],
    queryFn: async () => {
      const response = await nasaAPI.getPopularImages(limit);
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for getting image asset details
export const useNASAImageAsset = (nasa_id: string | null) => {
  return useQuery({
    queryKey: ['nasa-images', 'asset', nasa_id],
    queryFn: async () => {
      if (!nasa_id) throw new Error('NASA ID is required');
      const response = await nasaAPI.getImageAsset(nasa_id);
      return response.data;
    },
    enabled: !!nasa_id,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook for getting image metadata
export const useNASAImageMetadata = (nasa_id: string | null) => {
  return useQuery({
    queryKey: ['nasa-images', 'metadata', nasa_id],
    queryFn: async () => {
      if (!nasa_id) throw new Error('NASA ID is required');
      const response = await nasaAPI.getImageMetadata(nasa_id);
      return response.data;
    },
    enabled: !!nasa_id,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook for GIBS capabilities
export const useGIBSCapabilities = () => {
  return useQuery({
    queryKey: ['gibs', 'capabilities'],
    queryFn: async () => {
      const response = await nasaAPI.getGIBSCapabilities();
      return response.data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

// Hook for GIBS imagery
export const useGIBSImagery = (date?: string, layer?: string, bbox?: string) => {
  return useQuery({
    queryKey: ['gibs', 'imagery', { date, layer, bbox }],
    queryFn: async () => {
      const response = await nasaAPI.getGIBSImagery(date, layer, bbox);
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook for saving favorite images
export const useSaveFavoriteImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nasa_id, title, notes, tags }: {
      nasa_id: string;
      title: string;
      notes?: string;
      tags?: string[];
    }) => {
      const response = await nasaAPI.addToFavorites('nasa_image', nasa_id, notes, tags);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate user favorites
      queryClient.invalidateQueries({ queryKey: ['user', 'favorites'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
};

// Hook for removing favorite images
export const useRemoveFavoriteImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (favoriteId: number) => {
      await nasaAPI.removeFromFavorites(favoriteId);
    },
    onSuccess: () => {
      // Invalidate user favorites
      queryClient.invalidateQueries({ queryKey: ['user', 'favorites'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
};

// Hook for toggling favorite status
export const useToggleFavoriteImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nasa_id }: { nasa_id: string }) => {
      const response = await nasaAPI.toggleFavorite('nasa_image', nasa_id);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate user favorites and current search results
      queryClient.invalidateQueries({ queryKey: ['user', 'favorites'] });
      queryClient.invalidateQueries({ queryKey: ['nasa-images'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
};