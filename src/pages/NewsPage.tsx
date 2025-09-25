import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, ExternalLink, Search, TrendingUp, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NewsCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color_class: string;
}

interface NewsSource {
  id: string;
  name: string;
  domain: string;
  description: string;
  logo_url?: string;
  is_verified: boolean;
}

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  image_url?: string;
  published_at: string;
  author?: string;
  tags: string[];
  view_count: number;
  like_count: number;
  is_featured: boolean;
  source: NewsSource;
  category: NewsCategory;
}

const NewsPage = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchLatestNews();
  }, []);

  useEffect(() => {
    if (selectedCategory !== 'all') {
      fetchNewsByCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchLatestNews = async () => {
    try {
      setLoading(true);
      
      // First fetch fresh news from external API
      const { error: fetchError } = await supabase.functions.invoke('fetch-news', {
        body: { category: 'all' }
      });
      
      if (fetchError) {
        console.warn('Failed to fetch fresh news:', fetchError);
      }
      
      // Then load from database
      await fetchNewsData();
    } catch (error) {
      console.error('Error fetching latest news:', error);
      // Fallback to database data
      await fetchNewsData();
    }
  };

  const fetchNewsByCategory = async (category: string) => {
    try {
      // Fetch fresh news for specific category
      const { error: fetchError } = await supabase.functions.invoke('fetch-news', {
        body: { category }
      });
      
      if (fetchError) {
        console.warn('Failed to fetch fresh news for category:', fetchError);
      }
      
      // Reload data from database
      await fetchNewsData();
    } catch (error) {
      console.error('Error fetching news by category:', error);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchQuery('');
      return;
    }

    try {
      setLoading(true);
      setSearchQuery(query);
      
      // Fetch news based on search query
      const { error: fetchError } = await supabase.functions.invoke('fetch-news', {
        body: { query }
      });
      
      if (fetchError) {
        console.warn('Failed to fetch search results:', fetchError);
      }
      
      // Reload data from database
      await fetchNewsData();
    } catch (error) {
      console.error('Error searching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNewsData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('news_categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch articles with sources and categories
      const { data: articlesData, error: articlesError } = await supabase
        .from('news_articles')
        .select(`
          *,
          source:news_sources(*),
          category:news_categories(*)
        `)
        .order('published_at', { ascending: false })
        .limit(50);

      if (articlesError) throw articlesError;
      setArticles(articlesData || []);

    } catch (error) {
      console.error('Error fetching news data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = !searchQuery || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      article.category.id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const featuredArticles = filteredArticles.filter(article => article.is_featured);
  const regularArticles = filteredArticles.filter(article => !article.is_featured);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-lg">Loading news...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <FloatingNavbar />
      
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              COZI News
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stay informed with the latest news from trusted sources, categorized for your convenience.
            </p>
          </div>
          
          {/* Search */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search news articles... (Press Enter)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(searchQuery);
                  }
                }}
                className="pl-10"
              />
              {searchQuery && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => {
                    setSearchQuery('');
                    fetchLatestNews();
                  }}
                >
                  ×
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid grid-cols-7 w-full mb-8">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              All
            </TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="space-y-8">
            {/* Featured Articles */}
            {featuredArticles.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  Featured Stories
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {featuredArticles.slice(0, 4).map((article) => (
                    <FeaturedArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </div>
            )}

            {/* Latest Articles */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                Latest News
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>

            {filteredArticles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No articles found matching your criteria.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const FeaturedArticleCard: React.FC<{ article: NewsArticle }> = ({ article }) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {article.image_url && (
        <div className="aspect-video overflow-hidden">
          <img 
            src={article.image_url} 
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary">{article.category.name}</Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
          </div>
        </div>
        <CardTitle className="text-xl line-clamp-2">{article.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4 line-clamp-3">{article.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{article.source.name}</span>
            {article.source.is_verified && (
              <Badge variant="outline" className="text-xs">Verified</Badge>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open(article.url, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes')}
          >
            Read More <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ArticleCard: React.FC<{ article: NewsArticle }> = ({ article }) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {article.image_url && (
        <div className="aspect-video overflow-hidden">
          <img 
            src={article.image_url} 
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-xs">{article.category.name}</Badge>
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
          </div>
        </div>
        <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{article.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">{article.source.name}</span>
            {article.source.is_verified && (
              <Badge variant="outline" className="text-xs">✓</Badge>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open(article.url, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes')}
          >
            Read <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsPage;