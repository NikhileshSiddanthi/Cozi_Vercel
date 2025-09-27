import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { ThumbsUp, MessageCircle, Share2, MoreVertical } from "lucide-react";
import { TimestampDisplay } from '@/components/TimestampDisplay';
import { LinkPreviewCard } from '@/components/LinkPreviewCard';
import { CommentSection } from "./CommentSection";
import { PostActionsMenu } from "./PostActionsMenu";
import { EditPostModal } from "./EditPostModal";
import { MultiImageCarousel, CarouselImage } from "./MultiImageCarousel";
import { ImageLightbox } from "./ImageLightbox";
import { ClickableContent } from "./ClickableContent";
import { useUserRole } from "@/hooks/useUserRole";

// Simplified Post interface for the redesign
interface Post {
  id: string;
  title: string;
  content: string;
  media_type: string | null;
  media_url: string | null;
  like_count: number;
  comment_count: number;
  created_at: string;
  edited_at?: string;
  is_edited?: boolean;
  user_id: string;
  profiles: {
    display_name: string | null;
  } | null;
  metadata?: {
    link_preview?: any;
  };
  post_media?: Array<{
    id: string;
    url: string;
    thumbnail_url?: string;
  }>;
}

interface PostCardProps {
  post: Post;
  onUpdate?: () => void;
}

export const PostCard = ({ post, onUpdate }: PostCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { role: userRole } = useUserRole();

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [showComments, setShowComments] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (user) {
      checkIfLiked();
    }
  }, [user, post.id]);

  const checkIfLiked = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("post_likes")
      .select('post_id')
      .eq("post_id", post.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setIsLiked(true);
    }
  };

  const handleLike = async () => {
    if (!user) return;

    try {
      if (isLiked) {
        // Unlike
        await supabase.from("post_likes").delete().match({ post_id: post.id, user_id: user.id });
        setLikeCount(prev => prev - 1);
        setIsLiked(false);
      } else {
        // Like
        await supabase.from("post_likes").insert({ post_id: post.id, user_id: user.id });
        setLikeCount(prev => prev + 1);
        setIsLiked(true);
      }
      onUpdate?.();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update like.", variant: "destructive" });
    }
  };

  const renderMedia = () => {
    if (post.metadata?.link_preview) {
      return <LinkPreviewCard preview={post.metadata.link_preview} className="mt-3" />;
    }

    const mediaUrls = post.post_media?.map(m => m.url) || (post.media_url ? [post.media_url] : []);
    if (mediaUrls.length === 0) return null;

    const carouselImages: CarouselImage[] = (post.post_media || []).map((media, index) => ({
      id: media.id,
      url: media.url,
      thumbnailUrl: media.thumbnail_url,
      orderIndex: index,
    }));

    if (post.media_type === "image") {
      return (
        <div className="mt-3 rounded-lg overflow-hidden border">
          <MultiImageCarousel images={carouselImages} showThumbnails={carouselImages.length > 1} />
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{post.profiles?.display_name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">{post.profiles?.display_name || "Anonymous"}</p>
                <TimestampDisplay timestamp={post.created_at} editedAt={post.edited_at} showEdited={post.is_edited} />
              </div>
            </div>
            <PostActionsMenu
              postId={post.id}
              postTitle={post.title}
              isAuthor={user?.id === post.user_id}
              onEdit={() => setShowEditModal(true)}
              onDelete={onUpdate}
            />
          </div>
        </CardHeader>

        <CardContent>
          <ClickableContent
            content={post.content}
            className="text-foreground whitespace-pre-wrap"
          />
          {renderMedia()}
        </CardContent>

        <CardFooter className="flex justify-between items-center pt-3 border-t">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleLike} className="flex items-center gap-1">
              <ThumbsUp className={`h-4 w-4 ${isLiked ? 'text-primary' : ''}`} />
              <span>{likeCount}</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)} className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{post.comment_count}</span>
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { /* Share logic */ }}>
            <Share2 className="h-4 w-4" />
          </Button>
        </CardFooter>

        {showComments && (
          <div className="p-4 border-t">
            <CommentSection postId={post.id} onCommentAdded={onUpdate} />
          </div>
        )}
      </Card>

      <EditPostModal
        postId={post.id}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => {
          setShowEditModal(false);
          onUpdate?.();
        }}
      />
    </>
  );
};