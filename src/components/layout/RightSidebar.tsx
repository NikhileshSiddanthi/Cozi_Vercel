import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useTrendingGroups } from '@/hooks/useTrendingGroups';
import { useTrendingTopics } from '@/hooks/useTrendingTopics';
import { useLatestGroups } from '@/hooks/useLatestGroups';
import { useRelatedNews } from '@/hooks/useRelatedNews';
import { formatDistanceToNow } from 'date-fns';
import {
  TrendingUp,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Hash,
  Users,
  Newspaper,
  Clock
} from 'lucide-react';

interface RightSidebarProps {
  content?: 'trending' | 'news' | 'both';
  contextData?: {
    postTitle?: string;
    categoryId?: string;
    groupId?: string;
  };
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ 
  content = 'both',
  contextData 
}) => {
  const navigate = useNavigate();
  const { trendingGroups, loading: trendingLoading } = useTrendingGroups(5);
  const { trendingTopics, loading: topicsLoading } = useTrendingTopics(5);
  const { latestGroups, loading: latestLoading } = useLatestGroups(5);
  const { articles: relatedNews, loading: newsLoading } = useRelatedNews(
    contextData?.postTitle || 'political news'
  );

  const shouldShowTrending = content === 'trending' || content === 'both';
  const shouldShowNews = content === 'news' || content === 'both';

  return (
    <div className="w-80 border-l border-border bg-muted/20 p-4 space-y-6">
      {/* Trending Section */}
      {shouldShowTrending && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Trending
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="trending" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mx-4 mb-4">
                <TabsTrigger value="trending" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="latest" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Latest
                </TabsTrigger>
                <TabsTrigger value="topics" className="text-xs">
                  <Hash className="h-3 w-3 mr-1" />
                  Topics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trending" className="px-4 pb-4 mt-0">
                <div className="space-y-3">
                  {trendingLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-muted rounded mb-1"></div>
                          <div className="h-3 bg-muted rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : trendingGroups.length > 0 ? (
                    trendingGroups.map((group) => (
                      <div
                        key={group.id}
                        className="cursor-pointer hover:bg-muted/50 p-2 rounded-lg -m-2 transition-colors"
                        onClick={() => navigate(`/group/${group.id}`)}
                      >
                        <p className="font-medium text-sm leading-tight">{group.name}</p>
                        <p className="text-xs text-muted-foreground mb-1">{group.category_name}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {group.member_count.toLocaleString()}
                          </Badge>
                          {group.trend_change !== 0 && (
                            <div className={`flex items-center gap-1 text-xs ${
                              group.trend_change > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {group.trend_change > 0 ? (
                                <ArrowUp className="h-3 w-3" />
                              ) : (
                                <ArrowDown className="h-3 w-3" />
                              )}
                              {Math.abs(group.trend_change)}%
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No trending groups
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="latest" className="px-4 pb-4 mt-0">
                <div className="space-y-3">
                  {latestLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-muted rounded mb-1"></div>
                          <div className="h-3 bg-muted rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : latestGroups.length > 0 ? (
                    latestGroups.map((group) => (
                      <div
                        key={group.id}
                        className="cursor-pointer hover:bg-muted/50 p-2 rounded-lg -m-2 transition-colors"
                        onClick={() => navigate(`/group/${group.id}`)}
                      >
                        <p className="font-medium text-sm leading-tight">{group.name}</p>
                        <p className="text-xs text-muted-foreground mb-1">{group.category_name}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {group.member_count.toLocaleString()} members
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {formatDistanceToNow(new Date(group.created_at), { addSuffix: true })}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No recent groups
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="topics" className="px-4 pb-4 mt-0">
                <div className="space-y-3">
                  {topicsLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-muted rounded mb-1"></div>
                          <div className="h-3 bg-muted rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : trendingTopics.length > 0 ? (
                    trendingTopics.map((topic) => (
                      <div
                        key={topic.topic}
                        className="cursor-pointer hover:bg-muted/50 p-2 rounded-lg -m-2 transition-colors"
                        onClick={() => navigate(`/category?search=${encodeURIComponent(topic.topic)}`)}
                      >
                        <p className="font-medium text-sm leading-tight">#{topic.topic}</p>
                        <p className="text-xs text-muted-foreground mb-1">
                          {topic.mentions} mentions · {topic.unique_users} users
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {topic.score.toFixed(1)}
                          </Badge>
                          {topic.trend_change !== 0 && (
                            <div className={`flex items-center gap-1 text-xs ${
                              topic.trend_change > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {topic.trend_change > 0 ? (
                                <ArrowUp className="h-3 w-3" />
                              ) : (
                                <ArrowDown className="h-3 w-3" />
                              )}
                              {Math.abs(topic.trend_change)}%
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No trending topics
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* News Section */}
      {shouldShowNews && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Newspaper className="h-5 w-5 text-secondary" />
              Related News
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-4">
              {newsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-12 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded mb-1"></div>
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : relatedNews.length > 0 ? (
                relatedNews.slice(0, 5).map((article, index) => (
                  <div key={index} className="group cursor-pointer">
                    <div className="flex gap-3">
                      {article.image_url && (
                        <img
                          src={article.image_url}
                          alt=""
                          className="w-12 h-12 object-cover rounded flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{article.source.name}</span>
                          {article.published_at && (
                             <span>
                               {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                             </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {article.url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2 justify-start text-xs h-auto py-1"
                        onClick={() => window.open(article.url, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Read full article
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No news articles found
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};