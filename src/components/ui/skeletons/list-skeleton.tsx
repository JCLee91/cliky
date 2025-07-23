import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface ListSkeletonProps {
  items?: number
  className?: string
  showAvatar?: boolean
  showActions?: boolean
}

export function ListSkeleton({ 
  items = 5, 
  className,
  showAvatar = false,
  showActions = false
}: ListSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          {showAvatar && (
            <Skeleton className="h-10 w-10 rounded-full" />
          )}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          {showActions && (
            <Skeleton className="h-8 w-20" />
          )}
        </div>
      ))}
    </div>
  )
}