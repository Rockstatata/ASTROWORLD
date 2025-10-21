// src/hooks/nasa/useSpaceEvents.ts
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { nasaAPI } from '../../services/nasa/nasaServices';
import type { SpaceEvent, SpaceEventFilters } from '../../services/nasa/nasaServices';

// Hook for getting all space events with filtering
export const useSpaceEvents = (filters: SpaceEventFilters = {}) => {
  return useQuery({
    queryKey: ['spaceEvents', filters],
    queryFn: () => nasaAPI.getSpaceEvents(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
  });
};

// Hook for getting featured space events
export const useFeaturedSpaceEvents = () => {
  return useQuery({
    queryKey: ['spaceEvents', 'featured'],
    queryFn: () => nasaAPI.getFeaturedSpaceEvents(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook for getting upcoming space events
export const useUpcomingSpaceEvents = () => {
  return useQuery({
    queryKey: ['spaceEvents', 'upcoming'],
    queryFn: () => nasaAPI.getUpcomingSpaceEvents(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Hook for getting space events by type
export const useSpaceEventsByType = (eventType: string) => {
  return useQuery({
    queryKey: ['spaceEvents', 'type', eventType],
    queryFn: () => nasaAPI.getSpaceEventsByType(eventType),
    enabled: !!eventType,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
};

// Hook for getting a specific space event
export const useSpaceEvent = (nasa_id: string) => {
  return useQuery({
    queryKey: ['spaceEvent', nasa_id],
    queryFn: () => nasaAPI.getSpaceEventById(nasa_id),
    enabled: !!nasa_id,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Custom hook for space events with local state management (alternative approach)
export const useSpaceEventsState = () => {
  const [events, setEvents] = useState<SpaceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<SpaceEventFilters>({});

  const fetchEvents = async (newFilters: SpaceEventFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await nasaAPI.getSpaceEvents(newFilters);
      setEvents(response.data.results);
      setFilters(newFilters);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const refetch = () => fetchEvents(filters);
  const updateFilters = (newFilters: SpaceEventFilters) => fetchEvents(newFilters);

  return {
    events,
    loading,
    error,
    filters,
    refetch,
    updateFilters,
  };
};