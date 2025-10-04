import type { SpaceflightNews } from '../../services/spaceflightnews/newsServices';

interface NewsCardProps {
  news: SpaceflightNews;
  onSave?: (newsId: string) => void;
  className?: string;
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const NewsCard = ({ news, onSave, className = '' }: NewsCardProps) => {
  const handleSave = () => {
    if (onSave) {
      onSave(news.nasa_id);
    }
  };

  return (
    <div className={`bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`}>
      {/* Image */}
      {news.image_url && (
        <div className="aspect-video overflow-hidden">
          <img
            src={news.image_url}
            alt={news.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              news.article_type === 'article' ? 'bg-blue-600 text-blue-100' :
              news.article_type === 'blog' ? 'bg-green-600 text-green-100' :
              'bg-purple-600 text-purple-100'
            }`}>
              {news.article_type.toUpperCase()}
            </span>
            {news.featured && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-600 text-yellow-100">
                FEATURED
              </span>
            )}
          </div>
          
          {onSave && (
            <button
              onClick={handleSave}
              className={`p-2 rounded-full transition-colors ${
                news.is_saved 
                  ? 'text-yellow-400 hover:text-yellow-300' 
                  : 'text-gray-400 hover:text-yellow-400'
              }`}
              title={news.is_saved ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg className="w-5 h-5" fill={news.is_saved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">
          {news.title}
        </h3>

        {/* Summary */}
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
          {news.summary}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <span className="font-medium">{news.news_site}</span>
            {news.authors.length > 0 && (
              <>
                <span>•</span>
                <span>{news.authors[0].name}</span>
                {news.authors.length > 1 && (
                  <span>+{news.authors.length - 1} more</span>
                )}
              </>
            )}
          </div>
          <time dateTime={news.published_at}>
            {formatDateTime(news.published_at)}
          </time>
        </div>

        {/* Read More Button */}
        <div className="mt-4">
          <a
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-space-violet hover:bg-space-violet/80 text-white rounded-lg transition-colors duration-200"
          >
            Read Full Article
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;