import { Skeleton } from '@/components/ui/skeleton';

export const FeedItemSkeleton = () => {
  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 mb-4">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-6 w-6" />
      </div>
      
      {/* Title */}
      <Skeleton className="h-6 w-3/4 mb-3" />
      
      {/* Content */}
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      
      {/* Media placeholder */}
      <Skeleton className="h-48 w-full rounded-md mb-4" />
      
      {/* Actions */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-4 w-8" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-4 w-8" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-4 w-8" />
        </div>
      </div>
    </div>
  );
};