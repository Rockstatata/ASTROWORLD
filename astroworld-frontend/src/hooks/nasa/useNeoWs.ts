// src/hooks/nasa/useNeoWs.ts
import { useEffect, useState } from 'react';
import { nasa } from '../../services/nasa/nasaAPI';
import type { NeoObject } from '../../services/nasa/nasaAPI';

export function useNeoWs(rangeDays = 1) {
  const [objects, setObjects] = useState<NeoObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const today = new Date();
        const start = new Date(today.getTime() - rangeDays * 864e5).toISOString().slice(0, 10);
        const end = new Date(today.getTime() + rangeDays * 864e5).toISOString().slice(0, 10);
        const feed = await nasa.neowsFeed(start, end);
        const merged = Object.values(feed.near_earth_objects).flat();
        setObjects(merged);
      } catch (e) { 
        setError(e as Error); 
      } finally { 
        setLoading(false); 
      }
    })();
  }, [rangeDays]);

  return { objects, loading, error };
}
