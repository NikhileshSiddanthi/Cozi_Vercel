import { Skeleton } from '@/components/ui/skeleton';

export const PostSkeleton = () => {
  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-8" />
      </div>
      
      {/* Title */}
      <Skeleton className="h-8 w-full mb-4" />
      <Skeleton className="h-8 w-3/4 mb-6" />
      
      {/* Content */}
      <div className="space-y-3 mb-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      
      {/* Media placeholder */}
      <Skeleton className="h-64 w-full rounded-md mb-6" />
      
      {/* Poll placeholder */}
      <div className="space-y-2 mb-6">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      
      {/* Engagement stats */}
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-14" />
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-6 pb-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded" />
          <Skeleton className="h-4 w-8" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded" />
          <Skeleton className="h-4 w-10" />
        </div>
      </div>
    </div>
  );
};