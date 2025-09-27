import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Image,
  Video,
  Send,
  Loader2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaUpload } from "./MediaUpload";
import { LinkPreviewCard } from "./LinkPreviewCard";
import { useAutoLinkPreview } from "@/hooks/useAutoLinkPreview";

interface Group {
  id: string;
  name: string;
  is_public: boolean;
}

interface PostComposerProps {
  groups: Group[];
  selectedGroupId?: string;
  onSuccess: () => void;
  startExpanded?: boolean;
  editPost?: {
    id: string;
    title: string;
    content: string;
    media_urls: string[];
  };
}

export const PostComposer = ({ groups, selectedGroupId, onSuccess, startExpanded = false, editPost }: PostComposerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(!!editPost || startExpanded);
  const [currentTab, setCurrentTab] = useState("text");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaUploading, setMediaUploading] = useState(false);

  const [draftId, setDraftId] = useState<string | null>(null);
  
  // Auto link preview functionality
  const { previews: linkPreviews, loading: linkPreviewLoading, processText, removePreview, clearAllPreviews } = useAutoLinkPreview();

  const [formData, setFormData] = useState({
    title: editPost?.title || "",
    content: editPost?.content || "",
    groupId: selectedGroupId || "",
    mediaFiles: editPost?.media_urls || []
  });

  const MAX_CHARACTERS = 5000;

  // Auto-process content for link previews
  useEffect(() => {
    if (formData.content) {
      processText(formData.content);
    } else {
      clearAllPreviews();
    }
  }, [formData.content]);
  const characterCount = formData.content.length;
  const isOverLimit = characterCount > MAX_CHARACTERS;

  // Create or get draft when expanding
  const createDraft = useCallback(async () => {
    if (draftId) return;

    try {
      if (editPost) {
        // For edit posts, create a temporary draft to handle media uploads
        const { data: draft, error } = await supabase
          .from('post_drafts')
          .insert({
            user_id: user!.id,
            group_id: formData.groupId || selectedGroupId || "",
            title: editPost.title,
            content: editPost.content,
            status: 'editing',
            metadata: { editPostId: editPost.id }
          })
          .select()
          .single();

        if (error) throw error;
        setDraftId(draft.id);
      } else {
        const { data: draft, error } = await supabase
          .from('post_drafts')
          .insert({
            user_id: user!.id,
            group_id: formData.groupId || selectedGroupId || null,
            title: "",
            content: "",
            status: 'editing'
          })
          .select()
          .single();

        if (error) throw error;
        setDraftId(draft.id);
      }
  // Deployment sync test - force fresh deployment
  console.log('PostComposer - latest version with Text/Media/Link tabs');
    } catch (error) {
      console.error('Failed to create draft:', error);
      toast({
        title: "Error",
        description: "Failed to initialize post. Please try again.",
        variant: "destructive"
      });
    }
  }, [editPost, draftId, user, formData.groupId, selectedGroupId, toast]);

  // Auto-create draft when starting expanded (like in modals)
  useEffect(() => {
    if ((startExpanded || editPost) && !draftId) {
      createDraft();
    }
  }, [startExpanded, editPost, draftId, createDraft]);

  const resetForm = useCallback(() => {
    setFormData({
      title: "",
      content: "",
      groupId: selectedGroupId || "",
      mediaFiles: []
    });
    setDraftId(null);
    setIsExpanded(false);
    setCurrentTab("text");
    clearAllPreviews();
  }, [selectedGroupId, clearAllPreviews]);

  // Save draft periodically
  const saveDraft = useCallback(async () => {
    if (!draftId || editPost) return;

    try {
      const { error } = await supabase
        .from('post_drafts')
        .update({
          title: formData.title.trim() || null,
          content: formData.content.trim() || null,
          group_id: formData.groupId || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', draftId);

      if (error) {
        console.error('Failed to save draft:', error);
      }
    } catch (error) {
      console.error('Draft save error:', error);
    }
  }, [draftId, formData, editPost]);

  // Auto-save draft when content changes
  useEffect(() => {
    if (!draftId || editPost) return;

    const timer = setTimeout(saveDraft, 2000);
    return () => clearTimeout(timer);
  }, [formData.title, formData.content, formData.groupId, saveDraft, draftId, editPost]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mediaUploading) {
      toast({
        title: "Please wait",
        description: "Media files are still uploading.",
        variant: "destructive"
      });
      return;
    }

    // Validate content (allow text-only posts)
    const hasTitle = formData.title.trim().length > 0;
    const hasContent = formData.content.trim().length > 0;
    const hasMedia = formData.mediaFiles.length > 0;

    if (!hasTitle && !hasContent && !hasMedia) {
      toast({
        title: "Content Required",
        description: "Please add a title, content, or media to your post.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.groupId) {
      toast({
        title: "Group Required",
        description: "Please select a group for your post.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (editPost) {
        // Handle edit mode
        console.log('Editing post:', editPost.id, 'with data:', {
          title: formData.title.trim(),
          content: formData.content.trim() || "",
          media_urls: formData.mediaFiles
        });

        const { error } = await supabase.functions.invoke('edit-post', {
          body: {
            postId: editPost.id,
            title: formData.title.trim(),
            content: formData.content.trim() || "",
            media_urls: formData.mediaFiles
          }
        });

        if (error) {
          console.error('Edit post error:', error);
          throw error;
        }

        console.log('Edit post successful');

        toast({
          title: "Post Updated",
          description: "Your post has been successfully updated!"
        });
      } else {
        // Save final draft state first
        if (draftId) {
          await saveDraft();
        }

        // Use publish-post function
        const currentDraftId = draftId;
        if (!currentDraftId) {
          throw new Error('No draft to publish');
        }

        console.log('Publishing draft:', currentDraftId);

        const { data, error } = await supabase.functions.invoke('publish-post', {
          body: {
            draftId: currentDraftId,
            visibility: 'public',
            linkPreview: linkPreviews.length > 0 ? linkPreviews[0] : null
          }
        });

        if (error) {
          console.error('Publish error:', error);
          throw error;
        }

        console.log('Publish response:', data);

        toast({
          title: "Post Published",
          description: "Your post has been successfully published!"
        });
      }

      resetForm();
      onSuccess();

    } catch (error) {
      console.error('Post submission error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit post.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Card className="border-border/50 bg-card">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Please sign in to create posts</p>
        </CardContent>
      </Card>
    );
  }

  const userInitials = user.email?.charAt(0).toUpperCase() || "U";

  return (
    <Card className="border-border/50 bg-card hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        {!isExpanded ? (
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.user_metadata?.avatar_url} alt="Your avatar" />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div 
              className="flex-1 p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => {
                setIsExpanded(true);
                createDraft();
              }}
              data-testid="create-post-button"
            >
              <p className="text-muted-foreground">What's on your mind?</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => {
                setIsExpanded(true);
                setCurrentTab("media");
                createDraft();
              }}>
                <Image className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="post-composer-expanded">
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.user_metadata?.avatar_url} alt="Your avatar" />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                   <span className="font-medium text-sm">
                     {user.user_metadata?.display_name || user.email?.split('@')[0] || 'You'}
                   </span>
                   {selectedGroupId ? (
                     <>
                       <span className="text-muted-foreground">•</span>
                       <span className="text-sm text-muted-foreground">
                         posting to {groups.find(g => g.id === selectedGroupId)?.name}
                       </span>
                     </>
                   ) : (
                     <>
                       <span className="text-muted-foreground">•</span>
                       <Select
                         value={formData.groupId}
                         onValueChange={(value) =>
                           setFormData(prev => ({ ...prev, groupId: value }))
                         }
                       >
                         <SelectTrigger className="w-48 h-8">
                           <SelectValue placeholder="Select group" />
                         </SelectTrigger>
                         <SelectContent>
                           {groups.map(group => (
                             <SelectItem key={group.id} value={group.id}>
                               {group.name}
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </>
                   )}
                 </div>
              </div>
            </div>

            <Input
              placeholder="Post title *"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="border-0 bg-transparent text-lg font-medium placeholder:text-muted-foreground focus-visible:ring-0 px-0"
              data-testid="title-input"
              required
            />

            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="mt-4 space-y-4">
                <Textarea
                  placeholder="Share your thoughts... (URLs will automatically show previews)"
                  value={formData.content}
                  onChange={(e) => {
                    const newContent = e.target.value;
                    setFormData(prev => ({ ...prev, content: newContent }));
                    processText(newContent);
                  }}
                  className="border-0 bg-transparent resize-none min-h-[120px] placeholder:text-muted-foreground focus-visible:ring-0 px-0"
                  data-testid="content-textarea"
                />

                {/* Auto-detected Link Previews */}
                {linkPreviews.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-muted-foreground">Link Previews</h4>
                      {linkPreviewLoading && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="h-3 w-3 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                          Fetching preview...
                        </div>
                      )}
                    </div>
                    {linkPreviews.map((preview) => (
                      <LinkPreviewCard
                        key={preview.url}
                        preview={preview}
                        showRemove={true}
                        onRemove={() => removePreview(preview.url)}
                        className="bg-muted/30"
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="media" className="mt-4">
                <MediaUpload
                  files={formData.mediaFiles}
                  onFilesChange={(files) => setFormData(prev => ({ ...prev, mediaFiles: files }))}
                  onUploadStatusChange={setMediaUploading}
                  maxFiles={10}
                  draftId={draftId}
                />
              </TabsContent>

            </Tabs>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Media: {formData.mediaFiles.length}/10 • Links: {linkPreviews.length}
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={resetForm} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || mediaUploading || isOverLimit}
                  data-testid="publish-button"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Publishing...
                    </>
                  ) : mediaUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Publish
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};