import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyMessageProps {
  icon?: LucideIcon
  message: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyMessage({ 
  icon: Icon, 
  message,
  description,
  action,
  className
}: EmptyMessageProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center",
      className
    )}>
      {Icon && (
        <Icon className="h-8 w-8 text-muted-foreground mb-3" />
      )}
      <h3 className="font-medium text-sm mb-1">{message}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      )}
      {action && (
        <Button 
          size="sm" 
          variant="outline"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}