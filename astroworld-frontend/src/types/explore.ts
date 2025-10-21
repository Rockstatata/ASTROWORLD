// Explore Page Types for AstroWorld
// Defines all types for the social research discovery system

export interface ResearchPaper {
  id: number;
  paper_id: string;
  source: 'nasa_ads' | 'arxiv' | 'crossref';
  title: string;
  authors: string;
  abstract: string;
  published_date: string;
  journal?: string;
  pdf_url?: string;
  external_url?: string;
  doi?: string;
  categories: string[];
  keywords: string[];
  citation_count: number;
  save_count: number;
  is_saved?: boolean;
  user_save_id?: number;
  created_at: string;
}

export interface ResearchPaperList {
  id: number;
  paper_id: string;
  source: 'nasa_ads' | 'arxiv' | 'crossref';
  title: string;
  authors: string;
  published_date: string;
  journal?: string;
  save_count: number;
  is_saved?: boolean;
  user_save_id?: number;
}

export interface UserPaper {
  id: number;
  paper: ResearchPaperList;
  notes?: string;
  tags: string[];
  is_favorite: boolean;
  read_status: 'unread' | 'reading' | 'read';
  created_at: string;
  updated_at: string;
}

export interface PublicUser {
  id: number;
  username: string;
  full_name?: string;
  bio?: string;
  profile_picture?: string;
  date_joined: string;
  is_following?: boolean;
  followers_count: number;
  following_count: number;
  public_journals_count: number;
  public_collections_count: number;
}

export interface UserFollower {
  id: number;
  follower: number;
  following: number;
  follower_username: string;
  following_username: string;
  follower_profile: PublicUser;
  following_profile: PublicUser;
  created_at: string;
}

export interface PublicJournal {
  id: number;
  author_username: string;
  author_profile_picture?: string;
  journal_type: 'note' | 'observation' | 'ai_conversation' | 'discovery';
  title: string;
  content: string;
  coordinates?: {
    ra?: number;
    dec?: number;
    alt?: number;
    az?: number;
  };
  observation_date?: string;
  tags: string[];
  like_count: number;
  comment_count: number;
  is_liked?: boolean;
  created_at: string;
}

export interface Like {
  id: number;
  user: number;
  user_username: string;
  target_type: 'journal' | 'paper' | 'comment';
  target_id: number;
  created_at: string;
}

export interface Comment {
  id: number;
  user: number;
  user_username: string;
  user_profile_picture?: string;
  target_type: 'journal' | 'paper' | 'event';
  target_id: number;
  text: string;
  parent?: number;
  replies: Comment[];
  like_count: number;
  is_liked?: boolean;
  created_at: string;
  updated_at: string;
}

// Feed types for mixed content
export type FeedItemType = 'user' | 'paper' | 'journal' | 'event';

export interface FeedItem {
  type: FeedItemType;
  id: string;
  data: PublicUser | ResearchPaper | PublicJournal | Record<string, unknown>;
  timestamp: string;
}

export interface ExploreFeed {
  items: FeedItem[];
  hasNextPage: boolean;
  nextCursor?: string;
}

// Filter and search types
export interface ExploreFilters {
  content_type?: 'users' | 'papers' | 'journals' | 'all';
  source?: 'nasa_ads' | 'arxiv' | 'crossref';
  journal_type?: 'note' | 'observation' | 'ai_conversation' | 'discovery';
  category?: string;
  date_range?: {
    start: string;
    end: string;
  };
  search?: string;
  sort?: 'recent' | 'popular' | 'trending' | 'most_saved' | 'most_liked';
}

// API request/response types
export interface SavePaperRequest {
  paper_id: number;
  notes?: string;
  tags?: string[];
  is_favorite?: boolean;
}

export interface FollowRequest {
  following_id: number;
}

export interface LikeRequest {
  target_type: 'journal' | 'paper' | 'comment';
  target_id: number;
}

export interface CommentRequest {
  target_type: 'journal' | 'paper' | 'event';
  target_id: number;
  text: string;
  parent?: number;
}

export interface UpdatePaperNotesRequest {
  notes?: string;
  tags?: string[];
  is_favorite?: boolean;
  read_status?: 'unread' | 'reading' | 'read';
}

// Component prop types
export interface UserCardProps {
  user: PublicUser;
  onFollow?: (userId: number) => void;
  onUnfollow?: (userId: number) => void;
  showFollowButton?: boolean;
  className?: string;
}

export interface PaperCardProps {
  paper: ResearchPaper;
  onSave?: (paperId: number) => void;
  onUnsave?: (userPaperId: number) => void;
  onAddNote?: (paperId: number) => void;
  showActions?: boolean;
  className?: string;
}

export interface JournalCardProps {
  journal: PublicJournal;
  onLike?: (journalId: number) => void;
  onUnlike?: (journalId: number) => void;
  onComment?: (journalId: number, text: string) => void;
  showActions?: boolean;
  className?: string;
}

export interface DiscussionCardProps {
  comments: Comment[];
  targetType: 'journal' | 'paper' | 'event';
  targetId: number;
  onAddComment?: (text: string, parentId?: number) => void;
  onLikeComment?: (commentId: number) => void;
  className?: string;
}

// AI Suggestion types (for Murph integration)
export interface AISuggestion {
  type: 'paper' | 'user' | 'topic' | 'journal';
  title: string;
  description: string;
  data: Record<string, unknown>;
  confidence: number;
  reason: string;
}

export interface AIRecommendations {
  suggestions: AISuggestion[];
  context: string;
  generated_at: string;
}

// Modal types
export interface PaperNotesModalProps {
  paper: ResearchPaper;
  userPaper?: UserPaper;
  isOpen: boolean;
  onClose: () => void;
  onSave: (notes: string, tags: string[]) => void;
}

export interface CommentModalProps {
  targetType: 'journal' | 'paper' | 'event';
  targetId: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
  has_next: boolean;
  has_previous: boolean;
}

// Error types
export interface ExploreError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Hook return types
export interface UseExploreResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: ExploreError | null;
  refetch: () => void;
}

export interface UseExploreMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  error: ExploreError | null;
}