import { cn } from '@shared/utils/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-(--color-hover-surface) dark:bg-(--color-surface-secondary)/40 animate-pulse rounded-md',
        className,
      )}
      {...props}
    />
  );
}

export function HabitItemSkeleton() {
  return (
    <div className="flex flex-col items-center">
      <Skeleton className="mb-3 h-20 w-20 rounded-full sm:h-24 sm:w-24 md:h-28 md:w-28" />
      <Skeleton className="mb-1 h-4 w-20" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function HabitListSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <HabitItemSkeleton key={i} />
      ))}
    </div>
  );
}
