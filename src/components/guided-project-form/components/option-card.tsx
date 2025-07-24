'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

interface OptionCardProps {
  option: 'A' | 'B'
  title?: string
  content: string | null
  isSelected: boolean
  onClick: () => void
  parseContent?: (content: string) => React.ReactNode
}

export function OptionCard({ 
  option, 
  title, 
  content, 
  isSelected, 
  onClick,
  parseContent
}: OptionCardProps) {
  const defaultTitle = `Option ${option}`
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={`cursor-pointer h-full transition-all duration-200 ${
          isSelected 
            ? 'border-primary shadow-lg ring-2 ring-primary ring-opacity-50' 
            : 'hover:shadow-md'
        }`}
        onClick={onClick}
      >
        {isSelected && (
          <CardHeader className="pb-2">
            <div className="flex justify-end">
              <Badge variant="default">Selected</Badge>
            </div>
          </CardHeader>
        )}
        <CardContent className={!isSelected ? 'pt-6' : ''}>
          {content ? (
            parseContent ? (
              parseContent(content)
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {content}
              </p>
            )
          ) : (
            <p className="text-sm text-muted-foreground">Generating...</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}