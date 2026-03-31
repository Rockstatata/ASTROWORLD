const DEFAULT_BACKEND_ORIGIN = 'http://localhost:8000';

const rawApiUrl = (import.meta.env.VITE_API_URL || DEFAULT_BACKEND_ORIGIN)
  .trim()
  .replace(/\/+$/, '');

const backendOrigin = rawApiUrl.endsWith('/api')
  ? rawApiUrl.slice(0, -4)
  : rawApiUrl;

export const API_ORIGIN = backendOrigin || DEFAULT_BACKEND_ORIGIN;
export const API_BASE = `${API_ORIGIN}/api`;

export const buildApiUrl = (path: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
};
