import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { newsAPI } from '../services/spaceflightnews/newsServices';
import type { NewsFilters } from '../services/spaceflightnews/newsServices';

// News Hooks
export const useNews = (filters: NewsFilters = {}) => {
  return useQuery({
    queryKey: ['news', filters],
    queryFn: () => newsAPI.getNews(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useNewsById = (nasa_id: string) => {
  return useQuery({
    queryKey: ['news', nasa_id],
    queryFn: () => newsAPI.getNewsById(nasa_id),
    enabled: !!nasa_id,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useLatestNews = (limit: number = 10, type?: string) => {
  return useQuery({
    queryKey: ['news-latest', limit, type],
    queryFn: () => newsAPI.getLatestNews(limit, type),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useFeaturedNews = () => {
  return useQuery({
    queryKey: ['news-featured'],
    queryFn: newsAPI.getFeaturedNews,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useNewsSites = () => {
  return useQuery({
    queryKey: ['news-sites'],
    queryFn: newsAPI.getNewsSites,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

export const useUserNewsPreferences = () => {
  return useQuery({
    queryKey: ['user-news-preferences'],
    queryFn: newsAPI.getUserNewsPreferences,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Mutation Hooks
export const useUpdateNewsPreferences = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: newsAPI.updateNewsPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-news-preferences'] });
    },
  });
};

export const useSyncNewsData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ daysBack, types }: { daysBack?: number; types?: string[] }) =>
      newsAPI.syncSpaceflightNews(daysBack, types),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
};