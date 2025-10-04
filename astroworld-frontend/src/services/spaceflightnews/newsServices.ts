import axios from 'axios';

export interface NewsAuthor {
  name: string;
  socials: {
    x?: string;
    youtube?: string;
    instagram?: string;
    linkedin?: string;
    mastodon?: string;
    bluesky?: string;
  };
}

export interface SpaceflightNews {
  id: number;
  nasa_id: string;
  title: string;
  authors: NewsAuthor[];
  author_objects: NewsAuthor[];
  url: string;
  image_url: string;
  news_site: string;
  summary: string;
  published_at: string;
  featured: boolean;
  launches: any[];
  events: any[];
  article_type: 'article' | 'blog' | 'report';
  created_at: string;
  updated_at: string;
  is_saved?: boolean;
}

export interface UserNewsPreference {
  preferred_news_sites: string[];
  keywords: string[];
  enable_notifications: boolean;
}

export interface NewsFilters {
  type?: 'article' | 'blog' | 'report';
  news_site?: string;
  search?: string;
  featured?: boolean;
  page?: number;
}

// Add to newsAPI object
export const newsAPI = {
  // ...existing methods...

  // Spaceflight News endpoints
  getNews: (filters: NewsFilters = {}): Promise<{ data: { results: SpaceflightNews[], count: number } }> =>
    axios.get('/api/spaceflight/news/', { params: filters }),

  getNewsById: (nasa_id: string): Promise<{ data: SpaceflightNews }> =>
    axios.get(`/api/spaceflight/news/${nasa_id}/`),

  getLatestNews: (limit: number = 10, type?: string): Promise<{ data: SpaceflightNews[] }> =>
    axios.get('/api/spaceflight/news/latest/', { params: { limit, type } }),

  getFeaturedNews: (): Promise<{ data: SpaceflightNews[] }> =>
    axios.get('/api/spaceflight/news/featured/'),

  getNewsSites: (): Promise<{ data: string[] }> =>
    axios.get('/api/spaceflight/news/sites/'),

  getUserNewsPreferences: (): Promise<{ data: UserNewsPreference }> =>
    axios.get('/api/spaceflight/news/preferences/'),

  updateNewsPreferences: (preferences: Partial<UserNewsPreference>): Promise<{ data: UserNewsPreference }> =>
    axios.put('/api/spaceflight/news/preferences/', preferences),

  syncSpaceflightNews: (daysBack?: number, types?: string[]): Promise<{ data: { message: string, results: any } }> =>
    axios.post('/api/spaceflight/news/sync/', { days_back: daysBack, types }),
};