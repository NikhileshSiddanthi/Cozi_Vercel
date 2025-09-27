import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTrendingTopics } from '@/hooks/useTrendingTopics';
import { useRelatedNews } from '@/hooks/useRelatedNews';
import { formatDistanceToNow } from 'date-fns';
import { TrendingUp, Newspaper, ExternalLink } from 'lucide-react';

interface RightSidebarProps {
  content?: 'trending' | 'news' | 'both';
  contextData?: {
    postTitle?: string;
  };
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ 
  content = 'both',
  contextData 
}) => {
  const navigate = useNavigate();
  const { trendingTopics, loading: topicsLoading } = useTrendingTopics(5);
  const { articles: relatedNews, loading: newsLoading } = useRelatedNews(
    contextData?.postTitle || 'political news'
  );

  const shouldShowTrending = content === 'trending' || content === 'both';
  const shouldShowNews = content === 'news' || content === 'both';

  return (
    <aside className="w-80 border-l border-border bg-background p-4 space-y-6">
      {/* Trending Topics Section */}
      {shouldShowTrending && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <TrendingUp className="h-5 w-5 text-primary" />
              Trending Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topicsLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                ))
              ) : trendingTopics.length > 0 ? (
                trendingTopics.map((topic) => (
                  <div
                    key={topic.topic}
                    className="cursor-pointer hover:bg-secondary p-2 rounded-lg -m-2 transition-colors"
                    onClick={() => navigate(`/search?q=${encodeURIComponent(topic.topic)}`)}
                  >
                    <p className="font-medium text-sm">#{topic.topic}</p>
                    <p className="text-xs text-muted-foreground">
                      {topic.mentions} mentions
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No trending topics right now.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Latest News Section */}
      {shouldShowNews && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Newspaper className="h-5 w-5 text-primary" />
              Latest News
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {newsLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-full mb-1"></div>
                    <div className="h-3 bg-muted rounded w-1/3"></div>
                  </div>
                ))
              ) : relatedNews.length > 0 ? (
                relatedNews.slice(0, 5).map((article, index) => (
                  <div key={index} className="group">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2"
                    >
                      {article.title}
                    </a>
                    <div className="text-xs text-muted-foreground mt-1">
                      <span>{article.source.name}</span>
                      {article.published_at && (
                         <span className="mx-1">·</span>
                      )}
                      {article.published_at && (
                         <span>{formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No news to display.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </aside>
  );
};