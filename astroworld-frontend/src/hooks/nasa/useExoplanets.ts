// src/hooks/nasa/useExoplanets.ts
import { useEffect, useState } from 'react';
import { nasa } from '../../services/nasa/nasaAPI';
import type { ExoplanetCount } from '../../services/nasa/nasaAPI';

export function useExoplanetCount() {
  const [data, setData] = useState<ExoplanetCount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    (async () => {
      try { 
        setData(await nasa.exoplanetCount()); 
      } catch (e) { 
        setError(e as Error); 
      } finally { 
        setLoading(false); 
      }
    })();
  }, []);

  return { data, loading, error };
}
