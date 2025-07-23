import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({
  className,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Skeleton variants for common use cases
export function SkeletonText({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton
      className={cn("h-4 w-full rounded", className)}
      {...props}
    />
  )
}

export function SkeletonButton({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton
      className={cn("h-10 w-24 rounded-md", className)}
      {...props}
    />
  )
}

export function SkeletonAvatar({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton
      className={cn("h-10 w-10 rounded-full", className)}
      {...props}
    />
  )
}

export function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      <Skeleton className="h-32 w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  )
}