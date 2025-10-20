// src/hooks/nasa/useGIBSImagery.ts
import { useQuery } from '@tanstack/react-query';
import { nasa } from '../../services/nasa/nasaAPI';

interface GIBSImageryParams {
  layer: string;
  date: string;
  region: 'geographic' | 'arctic' | 'antarctic';
  format?: string;
  width?: number;
  height?: number;
}

interface GIBSImageryResponse {
  image_url: string;
  metadata?: Record<string, unknown>;
}

export const useGIBSImagery = (params: GIBSImageryParams) => {
  return useQuery<GIBSImageryResponse, Error>({
    queryKey: ['gibs-imagery', params.layer, params.date, params.region, params.format, params.width, params.height],
    queryFn: () => nasa.gibsImagery(params),
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    enabled: !!(params.layer && params.date && params.region),
    retry: 2,
    retryDelay: 1000,
  });
};

export const useGIBSCapabilities = () => {
  return useQuery<Record<string, unknown>, Error>({
    queryKey: ['gibs-capabilities'],
    queryFn: () => nasa.gibsCapabilities(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - capabilities don't change often
    gcTime: 1000 * 60 * 60 * 24 * 7, // 1 week
  });
};

export const useGIBSLayers = () => {
  return useQuery<unknown[], Error>({
    queryKey: ['gibs-layers'],
    queryFn: () => nasa.gibsLayers(),
    staleTime: 1000 * 60 * 60 * 12, // 12 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};