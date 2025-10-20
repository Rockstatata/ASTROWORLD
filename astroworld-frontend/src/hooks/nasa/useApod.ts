// src/hooks/nasa/useApod.ts
import { useEffect, useState } from 'react';
import { nasa } from '../../services/nasa/nasaAPI';
import type { ApodItem } from '../../services/nasa/nasaAPI';

export function useApod() {
  const [data, setData] = useState<ApodItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    (async () => {
      try { 
        setData(await nasa.apod()); 
      } catch (e) { 
        setError(e as Error); 
      } finally { 
        setLoading(false); 
      }
    })();
  }, []);

  return { data, loading, error };
}
