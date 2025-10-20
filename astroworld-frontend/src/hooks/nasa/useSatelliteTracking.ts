// src/hooks/nasa/useSatelliteTracking.ts
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { nasa, type Satellite } from '../../services/nasa/nasaAPI';

export function usePopularSatellites(): UseQueryResult<Satellite[], Error> {
  return useQuery({
    queryKey: ['satellites-popular'],
    queryFn: () => nasa.tlePopular(),
    staleTime: 1000 * 60 * 60 * 6, // 6 hours
    refetchInterval: 1000 * 60 * 60, // Refresh every hour
    retry: 2,
  });
}

export function useSatelliteById(satelliteId: number): UseQueryResult<Satellite, Error> {
  return useQuery({
    queryKey: ['satellite', satelliteId],
    queryFn: () => nasa.tleById(satelliteId),
    enabled: !!satelliteId,
    staleTime: 1000 * 60 * 60 * 3, // 3 hours
    retry: 2,
  });
}

export function useSatelliteSearch(searchQuery?: string): UseQueryResult<Satellite[], Error> {
  return useQuery({
    queryKey: ['satellites-search', searchQuery],
    queryFn: () => nasa.tleSearch(searchQuery),
    enabled: !!searchQuery && searchQuery.length > 2,
    staleTime: 1000 * 60 * 60 * 3, // 3 hours
    retry: 2,
  });
}

// Helper function to parse TLE data and calculate orbital parameters
export function parseOrbitalData(_tle1: string, tle2: string) {
  try {
    // Extract basic orbital parameters from TLE
    const line2 = tle2.trim();
    
    // Extract inclination (degrees)
    const inclination = parseFloat(line2.substring(8, 16));
    
    // Extract right ascension of ascending node (degrees)
    const raan = parseFloat(line2.substring(17, 25));
    
    // Extract eccentricity (no decimal point in TLE)
    const eccentricityStr = '0.' + line2.substring(26, 33);
    const eccentricity = parseFloat(eccentricityStr);
    
    // Extract argument of perigee (degrees)
    const argOfPerigee = parseFloat(line2.substring(34, 42));
    
    // Extract mean anomaly (degrees)
    const meanAnomaly = parseFloat(line2.substring(43, 51));
    
    // Extract mean motion (revolutions per day)
    const meanMotion = parseFloat(line2.substring(52, 63));
    
    // Calculate orbital period in minutes
    const periodMinutes = (24 * 60) / meanMotion;
    
    // Estimate altitude (very rough approximation)
    // Using Kepler's third law: a³ = (T²GM)/(4π²)
    const earthGM = 398600.4418; // km³/s²
    const periodSeconds = periodMinutes * 60;
    const semiMajorAxis = Math.pow((periodSeconds * periodSeconds * earthGM) / (4 * Math.PI * Math.PI), 1/3);
    const altitudeKm = semiMajorAxis - 6371; // Earth radius
    
    return {
      inclination,
      raan,
      eccentricity,
      argOfPerigee,
      meanAnomaly,
      meanMotion,
      periodMinutes,
      altitudeKm,
      semiMajorAxis,
    };
  } catch (error) {
    console.error('Error parsing TLE data:', error);
    return null;
  }
}