'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Task } from '@/types/task'
import { TaskCard } from './task-card'
import { TaskDownloadButton } from './task-download-button'
import { EmptyMessage } from '@/components/ui/empty-message'
import { Plus, FileText, Loader2 } from 'lucide-react'
import { CardSkeleton } from '@/components/ui/skeletons/card-skeleton'
import { ANIMATION_PRESETS, staggerDelay } from '@/lib/animation-presets'

interface TaskCardsProps {
  tasks: Task[]
  isLoading?: boolean
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void
  onTaskDelete?: (taskId: string) => void
  onTaskReorder?: (taskIds: string[]) => void
  onAddTask?: () => void
  onBreakdownToTasks?: () => void
  showBreakdownButton?: boolean
  isPRDGenerating?: boolean
  projectName?: string
}

export function TaskCards({
  tasks,
  isLoading = false,
  onTaskUpdate,
  onTaskDelete,
  onTaskReorder,
  onAddTask,
  onBreakdownToTasks,
  showBreakdownButton = false,
  isPRDGenerating = false,
  projectName
}: TaskCardsProps) {

  // 로딩 중 스켈레톤 표시
  if (isLoading && tasks.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                📋 작업 목록
                <Badge variant="secondary" className="p-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" />
                </Badge>
              </CardTitle>
              <CardDescription>
                AI가 PRD를 분석하여 작업을 생성하고 있습니다...
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <CardSkeleton key={i} showHeader={false} lines={3} />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Break down to tasks 버튼 표시
  if (showBreakdownButton) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                📋 작업 목록
                {isPRDGenerating && (
                  <Badge variant="secondary" className="text-xs">
                    PRD 대기 중...
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                PRD를 실행 가능한 작업으로 분해
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 relative">
          <div className="absolute inset-x-0 top-0 flex justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                {...ANIMATION_PRESETS.fade}
              >
                <EmptyMessage
                  icon={FileText}
                  message={isPRDGenerating ? "PRD 생성이 완료될 때까지 대기 중..." : "작업 생성 준비 완료"}
                  description={isPRDGenerating ? "PRD가 준비되면 작업을 사용할 수 있습니다" : "AI가 PRD를 분석하여 작업 목록을 생성합니다"}
                  action={!isPRDGenerating && onBreakdownToTasks ? {
                    label: "작업으로 분해",
                    onClick: onBreakdownToTasks
                  } : undefined}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 태스크가 없는 경우
  if (!isLoading && tasks.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📋 Task List
          </CardTitle>
          <CardDescription>
            아직 생성된 작업이 없습니다
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <EmptyMessage
            icon={Plus}
            message="아직 작업이 없습니다"
            description="PRD에서 작업을 생성하거나 수동으로 추가하세요"
            action={onAddTask ? {
              label: "작업 추가",
              onClick: onAddTask
            } : undefined}
          />
        </CardContent>
      </Card>
    )
  }

  // 태스크 목록 표시
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              📋 작업 목록
              {isLoading && (
                <Badge variant="secondary" className="p-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" />
                </Badge>
              )}
              {!isLoading && (
                <Badge variant="secondary">
                  {tasks.length}개 작업
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {isLoading 
                ? `현재까지 ${tasks.length}개 작업 생성됨...`
                : `${tasks.filter(t => t.status === 'completed').length}/${tasks.length} 완료`
              }
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {!isLoading && tasks.length > 0 && <TaskDownloadButton tasks={tasks} projectName={projectName} />}
            {onAddTask && (
              <Button onClick={onAddTask} size="sm" variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                작업 추가
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-auto pt-2">
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                layout
                {...ANIMATION_PRESETS.listItem}
                transition={{ 
                  ...ANIMATION_PRESETS.listItem.transition,
                  delay: isLoading && !task.isExpanded ? staggerDelay(index) : 0
                }}
              >
                <TaskCard
                  task={task}
                  taskNumber={index + 1}
                  onUpdate={onTaskUpdate}
                  onDelete={onTaskDelete}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* 로딩 중 추가 스켈레톤 */}
          {isLoading && (
            <motion.div
              {...ANIMATION_PRESETS.fade}
            >
              <CardSkeleton showHeader={false} lines={3} />
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}