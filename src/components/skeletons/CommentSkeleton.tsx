import { Skeleton } from '@/components/ui/skeleton';

interface CommentSkeletonProps {
  isReply?: boolean;
}

export const CommentSkeleton = ({ isReply = false }: CommentSkeletonProps) => {
  return (
    <div className={`${isReply ? 'ml-8 pl-4 border-l-2 border-border' : ''} py-3`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-2">
        <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
        <Skeleton className="h-5 w-5" />
      </div>
      
      {/* Content */}
      <div className="ml-9 space-y-2 mb-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      
      {/* Actions */}
      <div className="ml-9 flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-3 w-6" />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-3 w-6" />
        </div>
        <Skeleton className="h-6 w-12 rounded" />
      </div>
    </div>
  );
};

export const CommentListSkeleton = () => {
  return (
    <div className="space-y-2">
      <CommentSkeleton />
      <CommentSkeleton isReply />
      <CommentSkeleton />
      <CommentSkeleton isReply />
      <CommentSkeleton isReply />
      <CommentSkeleton />
    </div>
  );
};