import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface TextSkeletonProps {
  lines?: number
  className?: string
  showTitle?: boolean
  titleWidth?: string
}

export function TextSkeleton({ 
  lines = 3, 
  className,
  showTitle = true,
  titleWidth = "50%"
}: TextSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {showTitle && (
        <Skeleton className="h-8 mb-4" style={{ width: titleWidth }} />
      )}
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className="h-4" 
          style={{ 
            width: i === lines - 1 ? "75%" : "100%" 
          }}
        />
      ))}
    </div>
  )
}