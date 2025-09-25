import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RelatedNewsSidebar } from '@/components/RelatedNewsSidebar';
import { PostCard } from '@/components/PostCard';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Post {
  id: string;
  title: string;
  content: string;
  media_type: string | null;
  media_url: string | null;
  media_thumbnail: string | null;
  poll_question: string | null;
  poll_options: string[] | null;
  like_count: number;
  dislike_count: number;
  comment_count: number;
  is_pinned: boolean;
  created_at: string;
  user_id: string;
  profiles: {
    display_name: string | null;
  } | null;
  metadata?: {
    link_preview?: any;
  };
}

const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const fetchPost = async () => {
    if (!postId) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          post_media (
            id,
            url,
            thumbnail_url,
            caption,
            alt,
            order_index
          )
        `)
        .eq('id', postId)
        .single();

      if (error) throw error;

      if (data) {
        // Get user profile for the post
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .eq('user_id', data.user_id)
          .single();

        const postWithProfile = {
          ...data,
          poll_options: Array.isArray(data.poll_options) ? data.poll_options : [],
          profiles: profile || null
        } as Post;

        setPost(postWithProfile);
      }
    } catch (error: any) {
      console.error('Error fetching post:', error);
      toast({
        title: "Error",
        description: "Failed to load post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!postId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Post not found</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Post not found</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <FloatingNavbar />
      
      <div className="container mx-auto px-4 py-20">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <PostCard post={post} onUpdate={fetchPost} />
          </div>

          {/* Related News Sidebar - Desktop Only */}
          <div className="hidden lg:block">
            <RelatedNewsSidebar postTitle={post.title} />
          </div>
        </div>

        {/* Related News for Mobile - Below post */}
        <div className="lg:hidden mt-6">
          <Card>
            <CardContent className="p-6">
              <RelatedNewsSidebar postTitle={post.title} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;