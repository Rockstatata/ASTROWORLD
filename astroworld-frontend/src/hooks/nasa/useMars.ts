// src/hooks/nasa/useMars.ts
import { useEffect, useState } from 'react';
import { nasa } from '../../services/nasa/nasaAPI';
import type { MarsPhoto } from '../../services/nasa/nasaAPI';

export function useMars(rover: string = 'curiosity', limit = 8) {
  const [photos, setPhotos] = useState<MarsPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    (async () => {
      try { 
        const res = await nasa.marsLatest(rover); 
        setPhotos(res.latest_photos.slice(0, limit)); 
      } catch (e) { 
        setError(e as Error); 
      } finally { 
        setLoading(false); 
      }
    })();
  }, [rover, limit]);

  return { photos, loading, error };
}
