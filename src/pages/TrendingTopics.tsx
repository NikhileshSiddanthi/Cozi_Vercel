import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTrendingTopics } from '@/hooks/useTrendingTopics';
import { 
  TrendingUp, 
  TrendingDown, 
  Hash, 
  Users, 
  MessageSquare,
  ArrowLeft,
  RefreshCw,
  Calendar
} from 'lucide-react';

const TrendingTopics = () => {
  const navigate = useNavigate();
  const [daysRange, setDaysRange] = useState(7);
  const { trendingTopics, loading, error, refetch } = useTrendingTopics(daysRange);

  const handleViewDiscussions = (topic: string) => {
    // Navigate to a search or filter view - you can implement this based on your needs
    // For now, just navigate to home with the topic as a search parameter
    navigate(`/?search=${encodeURIComponent(topic)}`);
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (change < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <MessageSquare className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <FloatingNavbar />
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Loading trending topics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <FloatingNavbar />
      
      <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Hash className="h-8 w-8 text-primary" />
                Trending Topics
              </h1>
              <p className="text-muted-foreground mt-2">
                Discover the most discussed political topics and keywords
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Time Range Selector */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex gap-1">
                  {[7, 14, 30].map((days) => (
                    <Button
                      key={days}
                      variant={daysRange === days ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDaysRange(days)}
                    >
                      {days}d
                    </Button>
                  ))}
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5 mb-6">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Trending Topics Grid */}
        {trendingTopics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingTopics.map((topic, index) => (
              <Card key={topic.topic} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="text-2xl font-bold text-muted-foreground">
                          #{index + 1}
                        </span>
                        <span className="break-words">
                          {topic.topic.startsWith('#') ? topic.topic : `#${topic.topic}`}
                        </span>
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(topic.trend_change)}
                      <span className={`text-sm font-medium ${getTrendColor(topic.trend_change)}`}>
                        {topic.trend_change > 0 ? '+' : ''}{topic.trend_change}%
                      </span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span>{topic.mentions} mentions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{topic.unique_users} users</span>
                      </div>
                    </div>
                    
                    <Badge variant="secondary" className="text-xs">
                      Score: {topic.score.toFixed(1)}
                    </Badge>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleViewDiscussions(topic.topic)}
                    >
                      View Discussions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Trending Topics Found</h3>
                <p className="text-muted-foreground">
                  No significant trending topics found for the selected time period.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TrendingTopics;