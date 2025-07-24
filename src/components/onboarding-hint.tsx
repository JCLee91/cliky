'use client'

import { motion } from 'framer-motion'
import { ArrowBigLeft, ArrowBigRight } from 'lucide-react'

interface OnboardingHintProps {
  direction?: 'left' | 'right'
  message: string
  targetPosition?: { top?: string; left?: string; right?: string; bottom?: string }
}

export function OnboardingHint({ 
  direction = 'left', 
  message,
  targetPosition = { top: '50%', left: '50%' }
}: OnboardingHintProps) {
  const Arrow = direction === 'left' ? ArrowBigLeft : ArrowBigRight

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        x: direction === 'left' ? [0, -10, 0] : [0, 10, 0]
      }}
      transition={{
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 },
        x: {
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
      className="absolute z-50 pointer-events-none"
      style={{
        ...targetPosition,
        transform: targetPosition.top === '50%' || targetPosition.left === '50%' 
          ? 'translate(-50%, -50%)' 
          : undefined
      }}
    >
      <div className="flex items-center gap-3">
        {direction === 'right' && (
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg font-medium text-sm whitespace-nowrap">
            {message}
          </div>
        )}
        <Arrow className="h-12 w-12 text-primary drop-shadow-lg" />
        {direction === 'left' && (
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg font-medium text-sm whitespace-nowrap">
            {message}
          </div>
        )}
      </div>
    </motion.div>
  )
}