// src/hooks/nasa/useDonki.ts
import { useEffect, useState } from 'react';
import { nasa } from '../../services/nasa/nasaAPI';
import type { DonkiEvent } from '../../services/nasa/nasaAPI';

const isoDaysAgo = (d: number) => new Date(Date.now() - d * 864e5).toISOString().slice(0, 10);

export function useDonki(daysBack = 7) {
  const [data, setData] = useState<DonkiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    (async () => {
      try { 
        setData(await nasa.donkiNotifications(isoDaysAgo(daysBack))); 
      } catch (e) { 
        setError(e as Error); 
      } finally { 
        setLoading(false); 
      }
    })();
  }, [daysBack]);

  return { data, loading, error };
}
