import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, Bell, User, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon: React.ReactNode;
}

const EmptyState = ({ title, description, actionLabel, onAction, icon }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4 p-3 rounded-full bg-muted">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="gap-2">
          <Plus className="h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export const NoPostsEmptyState = ({ onCreatePost }: { onCreatePost: () => void }) => (
  <EmptyState
    icon={<FileText className="h-8 w-8 text-muted-foreground" />}
    title="No Posts Yet"
    description="Be the first to share something with the community. Start a conversation, share news, or ask a question."
    actionLabel="Create Post"
    onAction={onCreatePost}
  />
);

export const NoNotificationsEmptyState = () => (
  <EmptyState
    icon={<Bell className="h-8 w-8 text-muted-foreground" />}
    title="No Notifications"
    description="You're all caught up! When you receive likes, comments, or other interactions, they'll appear here."
  />
);

export const NoCommentsEmptyState = () => (
  <EmptyState
    icon={<MessageSquare className="h-8 w-8 text-muted-foreground" />}
    title="No Comments Yet"
    description="Be the first to share your thoughts on this post. Start the conversation!"
  />
);

export const NoProfileContentEmptyState = () => {
  const navigate = useNavigate();
  
  return (
    <EmptyState
      icon={<User className="h-8 w-8 text-muted-foreground" />}
      title="Complete Your Profile"
      description="Add some information about yourself to help others get to know you better."
      actionLabel="Edit Profile"
      onAction={() => navigate('/settings')}
    />
  );
};

export const NoGroupsEmptyState = ({ onSuggestGroup }: { onSuggestGroup: () => void }) => (
  <EmptyState
    icon={<Plus className="h-8 w-8 text-muted-foreground" />}
    title="No Groups Available"
    description="There are no approved groups in this category yet. Suggest a new group to get the conversation started."
    actionLabel="Suggest Group"
    onAction={onSuggestGroup}
  />
);