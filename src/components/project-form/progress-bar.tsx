interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  className?: string
}

export function ProgressBar({ currentStep, totalSteps, className }: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className={`h-1 bg-secondary rounded-full overflow-hidden ${className}`}>
      <div 
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}