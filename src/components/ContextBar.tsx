import { useLocation, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChevronRight, Home, Users, Newspaper, TrendingUp } from 'lucide-react';

interface ContextData {
  title: string;
  icon: React.ReactNode;
  breadcrumbs?: { label: string; path?: string }[];
}

export const ContextBar = () => {
  const location = useLocation();
  const params = useParams();
  const [contextData, setContextData] = useState<ContextData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getContextData = async () => {
      setLoading(true);
      const { categoryId, groupId, postId } = params;

      try {
        if (location.pathname === '/') {
          setContextData({
            title: 'Home',
            icon: <Home className="h-4 w-4" />,
            breadcrumbs: [{ label: 'Home' }]
          });
        } else if (location.pathname.startsWith('/category/') && categoryId) {
          const { data } = await supabase.from('categories').select('name').eq('id', categoryId).single();
          setContextData({
            title: data?.name || 'Category',
            icon: <Users className="h-4 w-4" />,
            breadcrumbs: [{ label: 'Home', path: '/' }, { label: data?.name || 'Category' }]
          });
        } else if (location.pathname.startsWith('/group/') && groupId) {
          const { data } = await supabase.from('groups').select('name, categories(id, name)').eq('id', groupId).single();
          setContextData({
            title: `Group: ${data?.name || 'Unknown'}`,
            icon: <Users className="h-4 w-4" />,
            breadcrumbs: [
              { label: 'Home', path: '/' },
              { label: data?.categories?.name || 'Category', path: `/category/${data?.categories?.id}` },
              { label: data?.name || 'Group' }
            ]
          });
        } else if (location.pathname === '/news') {
          setContextData({
            title: 'News',
            icon: <Newspaper className="h-4 w-4" />,
            breadcrumbs: [{ label: 'Home', path: '/' }, { label: 'News' }]
          });
        } else if (location.pathname === '/trending-topics') {
          setContextData({
            title: 'Trending Topics',
            icon: <TrendingUp className="h-4 w-4" />,
            breadcrumbs: [{ label: 'Home', path: '/' }, { label: 'Trending Topics' }]
          });
        } else if (location.pathname.startsWith('/post/') && postId) {
          const { data } = await supabase.from('posts').select('title, groups(id, name, categories(id, name))').eq('id', postId).single();
          setContextData({
            title: data?.title || 'Post',
            icon: <Users className="h-4 w-4" />,
            breadcrumbs: [
              { label: 'Home', path: '/' },
              { label: data?.groups?.categories?.name || 'Category', path: `/category/${data?.groups?.categories?.id}` },
              { label: data?.groups?.name || 'Group', path: `/group/${data?.groups?.id}` },
              { label: data?.title || 'Post' }
            ]
          });
        } else {
          setContextData({
            title: 'COZI',
            icon: <Home className="h-4 w-4" />,
            breadcrumbs: [{ label: 'Home' }]
          });
        }
      } catch (error) {
        console.error('Error loading context data:', error);
        setContextData({
          title: 'COZI',
          icon: <Home className="h-4 w-4" />,
          breadcrumbs: [{ label: 'Home' }]
        });
      } finally {
        setLoading(false);
      }
    };

    getContextData();
  }, [location.pathname, params.categoryId, params.groupId, params.postId]);

  if (loading || !contextData) {
    return (
      <div className="h-10 bg-muted/30 border-b border-border animate-pulse" />
    );
  }

  return (
    <div 
      className="h-10 bg-muted/30 border-b border-border flex items-center px-3 md:px-6 text-sm text-muted-foreground"
      data-testid="context-bar"
    >
      <div className="flex items-center gap-2 max-w-full overflow-hidden">
        {contextData.icon}
        <div className="flex items-center gap-1 min-w-0">
          {contextData.breadcrumbs?.map((crumb, index) => (
            <div key={index} className="flex items-center gap-1 min-w-0">
              {index > 0 && <ChevronRight className="h-3 w-3 flex-shrink-0" />}
              <span className="truncate">{crumb.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};