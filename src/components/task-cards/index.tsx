'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Task } from '@/types/task'
import { TaskCard } from './task-card'
import { TaskDownloadButton } from './task-download-button'
import { EmptyMessage } from '@/components/ui/empty-message'
import { Plus, FileText } from 'lucide-react'

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

  if (isLoading && tasks.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📋 Task List
            <Badge variant="secondary" className="p-1.5">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary" />
            </Badge>
          </CardTitle>
          <CardDescription>
            AI is analyzing PRD and creating tasks...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Breaking down requirements into actionable tasks
            </div>
            <div className="w-full bg-secondary rounded-full h-1 overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-pulse" />
            </div>
          </div>
          <div className="space-y-2 mt-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (showBreakdownButton) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📋 Task List
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-start justify-center pt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center space-y-6 max-w-sm"
          >
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Next Step</h3>
              <div className="text-sm text-muted-foreground">
                {isPRDGenerating ? (
                  <span className="inline-flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary" />
                  </span>
                ) : 'PRD has been generated. Now break it down into actionable tasks.'}
              </div>
            </div>
            <Button 
              onClick={onBreakdownToTasks} 
              className="gap-2"
              disabled={isPRDGenerating}
              size="lg"
            >
              📋 Break Down to Tasks
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    )
  }

  const tasksByStatus = {
    todo: tasks.filter(task => !task.status || task.status === 'todo'),
    in_progress: tasks.filter(task => task.status === 'in_progress'),
    completed: tasks.filter(task => task.status === 'completed')
  }

  const totalTasks = tasks.length
  const completedTasks = tasksByStatus.completed.length
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              📋 Task List
              {totalTasks > 0 && <Badge variant="secondary">{totalTasks}</Badge>}
              {isLoading && (
                <Badge variant="secondary" className="gap-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary" />
                  Streaming...
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {totalTasks > 0 
                ? `Progress: ${completedTasks}/${totalTasks} (${Math.round(progress)}%)`
                : isLoading ? 'AI is creating tasks...' : 'No tasks yet'
              }
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {!isLoading && tasks.length > 0 && <TaskDownloadButton tasks={tasks} projectName={projectName} />}
            {onAddTask && (
              <Button onClick={onAddTask} size="sm" variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            )}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>To Do: {tasksByStatus.todo.length}</span>
            <span>In Progress: {tasksByStatus.in_progress.length}</span>
            <span>Completed: {tasksByStatus.completed.length}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto space-y-4">
        {/* Status Summary Tags */}
        <div className="flex flex-wrap items-center gap-2 pb-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            <span className="text-xs font-medium">To Do {tasksByStatus.todo.length}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs font-medium">In Progress {tasksByStatus.in_progress.length}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900 rounded-full">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs font-medium">Completed {tasksByStatus.completed.length}</span>
          </div>
        </div>

        {/* Single Column Layout - All Tasks in Original Order */}
        <div className="space-y-2">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.05 // 각 카드가 순차적으로 나타나도록
              }}
            >
              <TaskCard
                task={task}
                onUpdate={onTaskUpdate}
                onDelete={onTaskDelete}
              />
            </motion.div>
          ))}
          {/* 스트리밍 중일 때 추가될 태스크를 위한 스켈레톤 */}
          {isLoading && (
            <div className="space-y-2">
              <div className="h-20 bg-muted rounded-lg animate-pulse" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}