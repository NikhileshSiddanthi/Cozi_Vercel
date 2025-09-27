import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Image as ImageIcon, Link as LinkIcon, Send, Loader2 } from "lucide-react";
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
}

export const PostComposer = ({ groups, selectedGroupId, onSuccess, startExpanded = false }: PostComposerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(startExpanded);
  const [currentTab, setCurrentTab] = useState("text");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { previews: linkPreviews, loading: linkPreviewLoading, processText, removePreview, clearAllPreviews } = useAutoLinkPreview();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    groupId: selectedGroupId || "",
    mediaFiles: []
  });

  const resetForm = useCallback(() => {
    setFormData({ title: "", content: "", groupId: selectedGroupId || "", mediaFiles: [] });
    setIsExpanded(false);
    setCurrentTab("text");
    clearAllPreviews();
  }, [selectedGroupId, clearAllPreviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const hasTitle = formData.title.trim().length > 0;
    const hasContent = formData.content.trim().length > 0;

    if (!hasTitle && !hasContent) {
      toast({ title: "Content Required", description: "Please add a title or content to your post.", variant: "destructive" });
      return;
    }

    if (!formData.groupId) {
      toast({ title: "Group Required", description: "Please select a group for your post.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: postData, error } = await supabase.from('posts').insert({
        group_id: formData.groupId,
        user_id: user!.id,
        title: formData.title.trim(),
        content: formData.content.trim(),
        metadata: {
          link_preview: linkPreviews.length > 0 ? linkPreviews[0] : null
        }
      }).select().single();

      if (error) throw error;

      toast({ title: "Post Published!", description: "Your post is now live." });
      resetForm();
      onSuccess();
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit post.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  const userInitials = user.email?.charAt(0).toUpperCase() || "U";

  return (
    <Card>
      <CardContent className="p-4">
        {!isExpanded ? (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.user_metadata?.avatar_url} alt="Your avatar" />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div 
              className="flex-1 p-3 bg-secondary rounded-lg cursor-pointer hover:bg-border transition-colors"
              onClick={() => setIsExpanded(true)}
            >
              <p className="text-muted-foreground">What's on your mind?</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10 mt-1">
                <AvatarImage src={user.user_metadata?.avatar_url} alt="Your avatar" />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Title (optional)"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="font-semibold text-lg border-0 px-0 focus-visible:ring-0"
                />
                <Textarea
                  placeholder="Share your thoughts..."
                  value={formData.content}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, content: e.target.value }));
                    processText(e.target.value);
                  }}
                  className="min-h-[100px] border-0 px-0 focus-visible:ring-0"
                />
              </div>
            </div>

            {linkPreviews.length > 0 && (
              <div className="pl-12">
                <LinkPreviewCard
                  preview={linkPreviews[0]}
                  showRemove={true}
                  onRemove={() => removePreview(linkPreviews[0].url)}
                />
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <div className="pl-12">
                {/* Placeholder for future media buttons */}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={resetForm} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || (!formData.title.trim() && !formData.content.trim())}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Post
                </Button>
              </div>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};