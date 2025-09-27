import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  MessageCircle,
  Share2,
  Calendar,
  ExternalLink,
  Play,
  BarChart3,
  Eye,
  Edit3
} from "lucide-react";
import { ReactionPicker, ReactionType, REACTIONS } from "./ReactionPicker";
import { TimestampDisplay } from '@/components/TimestampDisplay';
import { LinkPreviewCard } from '@/components/LinkPreviewCard';
import { CommentSection } from "./CommentSection";
import { PostActionsMenu } from "./PostActionsMenu";
import { ViewCounter } from "./ViewCounter";
import { EditPostModal } from "./EditPostModal";
import { MultiImageCarousel, CarouselImage } from "./MultiImageCarousel";
import { ImageLightbox } from "./ImageLightbox";
import { ClickableContent } from "./ClickableContent";
import { useUserRole } from "@/hooks/useUserRole";

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
  is_edited?: boolean;
  created_at: string;
  updated_at?: string;
  edited_at?: string;
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
    caption?: string;
    alt?: string;
    order_index: number;
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
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [reactionCounts, setReactionCounts] = useState<Record<ReactionType, number>>({
    spark: 0,
    fire: 0,
    clap: 0,
    laugh: 0,
    bloom: 0,
  });
  const [pollVote, setPollVote] = useState<number | null>(null);
  const [pollResults, setPollResults] = useState<number[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<CarouselImage[]>([]);
  const [lightboxInitialIndex, setLightboxInitialIndex] = useState(0);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchUserReaction();
      fetchReactionCounts();
      if (post.poll_question) {
        fetchPollData();
      }
    }
  }, [user, post.id]);

  const fetchUserReaction = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("reactions")
      .select("reaction_type")
      .eq("post_id", post.id)
      .eq("user_id", user.id)
      .maybeSingle();

    setUserReaction(data?.reaction_type as ReactionType || null);
  };

  const fetchReactionCounts = async () => {
    const { data } = await supabase
      .from("reactions")
      .select("reaction_type")
      .eq("post_id", post.id);

    const counts: Record<ReactionType, number> = {
      spark: 0,
      fire: 0,
      clap: 0,
      laugh: 0,
      bloom: 0,
    };

    data?.forEach((reaction) => {
      const type = reaction.reaction_type as ReactionType;
      if (counts[type] !== undefined) {
        counts[type]++;
      }
    });

    setReactionCounts(counts);
  };

  const fetchPollData = async () => {
    if (!user || !post.poll_options) return;

    // Get user's vote
    const { data: userVote } = await supabase
      .from("poll_votes")
      .select("option_index")
      .eq("post_id", post.id)
      .eq("user_id", user.id)
      .maybeSingle();

    setPollVote(userVote?.option_index ?? null);

    // Get poll results
    const { data: votes } = await supabase
      .from("poll_votes")
      .select("option_index")
      .eq("post_id", post.id);

    if (votes) {
      const results = new Array(post.poll_options.length).fill(0);
      votes.forEach(vote => {
        if (vote.option_index < results.length) {
          results[vote.option_index]++;
        }
      });
      setPollResults(results);
    }
  };

  const handleReaction = async (type: ReactionType) => {
    if (!user) return;

    try {
      // Remove any existing reaction from this user
      await supabase
        .from("reactions")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", user.id);

      // Add new reaction
      await supabase
        .from("reactions")
        .insert({
          post_id: post.id,
          user_id: user.id,
          reaction_type: type,
        });

      setUserReaction(type);
      fetchReactionCounts();
      onUpdate?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "destructive",
      });
    }
  };

  const handleRemoveReaction = async () => {
    if (!user) return;

    try {
      await supabase
        .from("reactions")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", user.id);

      setUserReaction(null);
      fetchReactionCounts();
      onUpdate?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to remove reaction",
        variant: "destructive",
      });
    }
  };

  const handlePollVote = async (optionIndex: number) => {
    if (!user || pollVote !== null) return;

    try {
      await supabase
        .from("poll_votes")
        .insert({
          post_id: post.id,
          user_id: user.id,
          option_index: optionIndex
        });

      setPollVote(optionIndex);
      fetchPollData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to submit vote",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.content || "",
          url: url,
        });
      } catch (error) {
        // User cancelled sharing or sharing failed
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied!",
        description: "Post link copied to clipboard",
      });
    }
  };

  const renderMedia = () => {
    // Check for link preview in metadata first
    if (post.metadata?.link_preview) {
      return (
        <LinkPreviewCard
          preview={post.metadata.link_preview}
          className="mt-3"
        />
      );
    }

    if (!post.media_url || !post.media_type) return null;

    // Handle image media type (could be single or multiple)
    if (post.media_type === "image") {
      let mediaUrls: string[] = [];
      let postMediaData: any[] = [];

      try {
        const parsed = JSON.parse(post.media_url);
        if (Array.isArray(parsed)) {
          mediaUrls = parsed;
          // If we have post_media data, use it for richer carousel
          if (post.post_media && Array.isArray(post.post_media)) {
            postMediaData = post.post_media.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));
          } else {
            // Create basic carousel data from URLs
            postMediaData = parsed.map((url: string, index: number) => ({
              id: `${post.id}-${index}`,
              url,
              order_index: index
            }));
          }
        } else {
          mediaUrls = [post.media_url];
          postMediaData = [{
            id: `${post.id}-0`,
            url: post.media_url,
            order_index: 0
          }];
        }
      } catch {
        // Not JSON, treat as single URL
        mediaUrls = [post.media_url];
        postMediaData = [{
          id: `${post.id}-0`,
          url: post.media_url,
          order_index: 0
        }];
      }

      // Convert to carousel format
      const carouselImages = postMediaData.map((media: any) => ({
        id: media.id || `${post.id}-${media.order_index || 0}`,
        url: media.url,
        thumbnailUrl: media.thumbnail_url,
        caption: media.caption,
        alt: media.alt,
        orderIndex: media.order_index || 0
      }));

      // Set up lightbox data
      const handleImageClick = () => {
        setLightboxImages(carouselImages);
        setLightboxInitialIndex(0);
        setLightboxOpen(true);
      };

      // If single image, show simple display
      if (carouselImages.length === 1) {
        return (
          <div
            className="cursor-pointer"
            onClick={handleImageClick}
          >
            <img
              src={carouselImages[0].url}
              alt={carouselImages[0].alt || "Post image"}
              className="w-full max-h-96 object-cover rounded-lg"
            />
            {carouselImages[0].caption && (
              <p className="mt-2 text-sm text-muted-foreground">{carouselImages[0].caption}</p>
            )}
          </div>
        );
      }

      // Multiple images - show carousel
      return (
        <div onClick={handleImageClick}>
          <MultiImageCarousel
            images={carouselImages}
            editable={false}
            showThumbnails={true}
            showPageIndicator={true}
            className="cursor-pointer"
          />
        </div>
      );
    }

    // Handle other media types
    switch (post.media_type) {

      case "video":
        return (
          <video
            src={post.media_url}
            controls
            className="w-full max-h-96 rounded-lg"
          />
        );

      case "youtube":
        const videoId = post.media_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
        return videoId ? (
          <div className="relative">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video"
              className="w-full aspect-video rounded-lg"
              allowFullScreen
            />
          </div>
        ) : null;

      case "link":
        // Legacy link handling - should be replaced by metadata link_preview
        return (
          <div
            onClick={() => window.open(post.media_url, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes')}
            className="flex items-center gap-2 p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="text-sm font-medium truncate">{post.media_url}</span>
          </div>
        );

      default:
        return null;
    }
  };

  const renderPoll = () => {
    if (!post.poll_question || !post.poll_options) return null;

    const totalVotes = pollResults.reduce((sum, count) => sum + count, 0);

    return (
      <div className="space-y-3 p-4 bg-accent/30 rounded-lg">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          <h4 className="font-medium">{post.poll_question}</h4>
        </div>

        <div className="space-y-2">
          {post.poll_options.map((option, index) => {
            const votes = pollResults[index] || 0;
            const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
            const isSelected = pollVote === index;
            const hasVoted = pollVote !== null;

            return (
              <div
                key={index}
                className={`relative p-3 rounded border cursor-pointer transition-colors ${
                  hasVoted
                    ? isSelected
                      ? "bg-primary/20 border-primary"
                      : "bg-muted"
                    : "hover:bg-accent"
                }`}
                onClick={() => !hasVoted && handlePollVote(index)}
              >
                {hasVoted && (
                  <div
                    className="absolute inset-0 bg-primary/10 rounded transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                )}
                <div className="relative flex justify-between items-center">
                  <span className="font-medium">{option}</span>
                  {hasVoted && (
                    <span className="text-sm text-muted-foreground">
                      {votes} votes ({percentage.toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {totalVotes > 0 && (
          <p className="text-sm text-muted-foreground">
            {totalVotes} total vote{totalVotes !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full modern-card-hover group overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="ring-2 ring-primary/20 transition-all duration-300 hover:ring-primary/40">
              <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                {post.profiles?.display_name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium transition-colors hover:text-primary">
                {post.profiles?.display_name || "User"}
              </p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <TimestampDisplay
                  timestamp={post.created_at}
                  editedAt={post.edited_at}
                  showEdited={post.is_edited}
                />
              </div>
            </div>
          </div>
          {post.is_pinned && (
            <div className="bg-gradient-primary text-white px-3 py-1 rounded-full text-xs font-medium shadow-md animate-float">
              Pinned
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                {post.title}
                {post.is_edited && (
                  <span className="ml-2 text-xs text-muted-foreground bg-muted/50 backdrop-blur-sm px-2 py-1 rounded-full border">
                    Edited
                  </span>
                )}
              </h3>
              {post.content && (
                <ClickableContent
                  content={post.content}
                  className="text-muted-foreground whitespace-pre-wrap leading-relaxed"
                />
              )}
            </div>
            {user && (user.id === post.user_id || userRole === 'admin') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log('Edit button clicked for post:', post.id);
                  setShowEditModal(true);
                }}
                className="opacity-0 group-hover:opacity-100 transition-all duration-300 ml-2 hover:bg-primary/10 hover:text-primary"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {renderMedia()}
        {renderPoll()}

        {/* View Counter */}
        <ViewCounter postId={post.id} />

        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-3 flex-wrap">
            <ReactionPicker
              userReaction={userReaction}
              reactionCounts={reactionCounts}
              totalCount={Object.values(reactionCounts).reduce((sum: number, count: number) => sum + count, 0)}
              onReaction={handleReaction}
              onRemoveReaction={handleRemoveReaction}
            />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-xl"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {post.comment_count}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/post/${post.id}`)}
              className="text-primary hover:text-primary/80 hover:bg-primary/10 transition-all duration-300 rounded-xl"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-xl"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <PostActionsMenu
              postId={post.id}
              postTitle={post.title}
              isAuthor={user?.id === post.user_id}
              onEdit={() => {
                console.log('Edit from menu clicked for post:', post.id);
                setShowEditModal(true);
              }}
              onDelete={onUpdate}
            />
          </div>
        </div>

        {showComments && (
          <CommentSection
            postId={post.id}
            onCommentAdded={onUpdate}
          />
        )}
      </CardContent>

      <EditPostModal
        postId={post.id}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => {
          setShowEditModal(false);
          onUpdate?.();
        }}
      />

      <ImageLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={lightboxImages}
        initialIndex={lightboxInitialIndex}
        showDownloadButton={true}
        showShareButton={true}
      />
    </Card>
  );
};