// src/hooks/nasa/useEpic.ts
import { useEffect, useState } from 'react';
import { nasa } from '../../services/nasa/nasaAPI';
import type { EpicItem } from '../../services/nasa/nasaAPI';

export function useEpic(limit = 6) {
  const [items, setItems] = useState<EpicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    (async () => {
      try { 
        const list = await nasa.epicMostRecent(); 
        setItems(list.slice(0, limit)); 
      } catch (e) { 
        setError(e as Error); 
      } finally { 
        setLoading(false); 
      }
    })();
  }, [limit]);

  return { items, loading, error };
}
