import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { PostComposer } from "./PostComposer";
import { Loader2 } from "lucide-react";

interface EditPostModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Post {
  id: string;
  title: string;
  content: string;
  group_id: string;
  media_type: string | null;
  media_url: string | null;
}

interface Group {
  id: string;
  name: string;
  is_public: boolean;
}

export const EditPostModal = ({ postId, isOpen, onClose, onSuccess }: EditPostModalProps) => {
  const { toast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && postId) {
      loadPostData();
    }
  }, [isOpen, postId]);

  const loadPostData = async () => {
    console.log('Loading post data for postId:', postId);
    setLoading(true);
    try {
      // Load post data
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          group_id,
          media_type,
          media_url,
          groups (
            id,
            name,
            is_public
          )
        `)
        .eq('id', postId)
        .single();

      if (postError) throw postError;

      setPost(postData);

      // Load post media
      const { data: mediaData } = await supabase
        .from('post_media')
        .select('url')
        .eq('post_id', postId)
        .order('order_index');

      const urls: string[] = [];
      if (mediaData && mediaData.length > 0) {
        urls.push(...mediaData.map(m => m.url));
      } else if (postData.media_url) {
        // Handle legacy single media URL
        if (postData.media_type === 'multiple') {
          try {
            const parsed = JSON.parse(postData.media_url);
            if (Array.isArray(parsed)) {
              urls.push(...parsed);
            } else {
              urls.push(postData.media_url);
            }
          } catch {
            urls.push(postData.media_url);
          }
        } else {
          urls.push(postData.media_url);
        }
      }
      setMediaUrls(urls);

      // Load available groups (user's groups)
      const { data: groupsData } = await supabase
        .from('groups')
        .select('id, name, is_public')
        .eq('is_approved', true)
        .order('name');

      setGroups(groupsData || []);

    } catch (error) {
      console.error('Failed to load post data:', error);
      toast({
        title: "Error",
        description: "Failed to load post data. Please try again.",
        variant: "destructive"
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    toast({
      title: "Post Updated",
      description: "Your post has been successfully updated."
    });
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading post data...
          </div>
        ) : post ? (
          <PostComposer
            groups={groups}
            selectedGroupId={post.group_id}
            onSuccess={handleSuccess}
            editPost={{
              id: post.id,
              title: post.title,
              content: post.content,
              media_urls: mediaUrls
            }}
          />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Failed to load post data
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};