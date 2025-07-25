'use client'

import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download } from 'lucide-react'
import { ANIMATION_PRESETS, staggerDelay } from '@/lib/animation-presets'

interface MockTaskCardsProps {
  tasks: any[]
  projectName?: string
}

export function MockTaskCards({ tasks, projectName }: MockTaskCardsProps) {
  const router = useRouter()

  const handleInteraction = () => {
    router.push('/login')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-700 dark:text-green-400'
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
      case 'todo':
        return 'bg-muted text-muted-foreground'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return '완료'
      case 'in_progress':
        return '진행 중'
      case 'todo':
        return '할 일'
      default:
        return status
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              📋 작업 목록
            </CardTitle>
            <CardDescription>
              {tasks.length}개 작업 • 클릭하여 관리
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleInteraction}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            다운로드
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                {...ANIMATION_PRESETS.listItem}
                transition={{
                  ...ANIMATION_PRESETS.listItem.transition,
                  delay: staggerDelay(index)
                }}
                layout
                onClick={handleInteraction}
                className="cursor-pointer"
              >
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-base mb-1">{task.title}</h3>
                      <Badge className={getStatusColor(task.status)}>
                        {getStatusLabel(task.status)}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}