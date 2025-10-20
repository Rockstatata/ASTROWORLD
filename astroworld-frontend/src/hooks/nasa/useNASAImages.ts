// src/hooks/nasa/useNASAImages.ts
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { nasa, type NASAMediaItem } from '../../services/nasa/nasaAPI';

interface ImageSearchParams {
  q: string;
  media_type?: "image" | "video" | "audio";
  year_start?: string;
  year_end?: string;
  page?: number;
}

interface ImageSearchResult {
  collection: {
    items: NASAMediaItem[];
  };
}

export function useNASAImageSearch(params: ImageSearchParams): UseQueryResult<ImageSearchResult, Error> {
  return useQuery({
    queryKey: ['nasa-images-search', params],
    queryFn: () => nasa.imageSearch(params),
    enabled: !!params.q && params.q.length > 2,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 2,
  });
}

export function usePopularNASAImages(): UseQueryResult<NASAMediaItem[], Error> {
  return useQuery({
    queryKey: ['nasa-images-popular'],
    queryFn: () => nasa.imagePopular(),
    staleTime: 1000 * 60 * 60 * 6, // 6 hours
    retry: 2,
  });
}

export function useNASAImageAsset(nasa_id: string): UseQueryResult<{ collection: { items: Array<{ href: string }> } }, Error> {
  return useQuery({
    queryKey: ['nasa-image-asset', nasa_id],
    queryFn: () => nasa.imageAsset(nasa_id),
    enabled: !!nasa_id,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours (assets don't change)
    retry: 2,
  });
}

export function useNASAImageMetadata(nasa_id: string): UseQueryResult<Record<string, unknown>, Error> {
  return useQuery({
    queryKey: ['nasa-image-metadata', nasa_id],
    queryFn: () => nasa.imageMetadata(nasa_id),
    enabled: !!nasa_id,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 2,
  });
}