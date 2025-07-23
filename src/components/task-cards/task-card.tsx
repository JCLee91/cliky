'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Task, Subtask } from '@/types/task'
import {
  MoreVertical,
  Clock,
  CheckCircle2,
  Circle,
  PlayCircle,
  Trash2,
  Edit3,
  Eye,
  FileText,
  TestTube,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface TaskCardProps {
  task: Task
  taskNumber?: number
  onUpdate?: (taskId: string, updates: Partial<Task>) => void
  onDelete?: (taskId: string) => void
}

export function TaskCard({ task, taskNumber, onUpdate, onDelete }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedDescription, setEditedDescription] = useState(task.description)
  const [showDetails, setShowDetails] = useState(false)
  const [showSubtasks, setShowSubtasks] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'in_progress':
        return <PlayCircle className="h-4 w-4 text-blue-600" />
      case 'todo':
      default:
        return <Circle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'in_progress':
        return 'In Progress'
      case 'todo':
      default:
        return 'To Do'
    }
  }

  const handleStatusChange = (newStatus: 'todo' | 'in_progress' | 'completed') => {
    onUpdate?.(task.id, { status: newStatus })
  }

  const handleCardClick = () => {
    // Cycle through status: todo -> in_progress -> completed -> todo
    const currentStatus = task.status || 'todo'
    const nextStatus = {
      'todo': 'in_progress',
      'in_progress': 'completed',
      'completed': 'todo'
    }[currentStatus] as 'todo' | 'in_progress' | 'completed'
    
    handleStatusChange(nextStatus)
  }

  const handleSaveDescription = () => {
    onUpdate?.(task.id, { description: editedDescription })
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditedDescription(task.description)
    setIsEditing(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`group cursor-pointer transition-colors w-full ${
          task.status === 'completed' ? 'bg-green-50 dark:bg-green-950/20' : 
          task.status === 'in_progress' ? 'bg-blue-50 dark:bg-blue-950/20' : ''
        }`}
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3 px-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              {getStatusIcon(task.status)}
              <div className="flex-1 min-w-0">
                <CardTitle className={`text-sm font-medium leading-5 ${
                  task.status === 'completed' ? 'line-through text-muted-foreground' : ''
                }`}>
                  {taskNumber && (
                    <span className="font-bold mr-1">
                      {taskNumber}.
                    </span>
                  )}
                  {task.title}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={getPriorityColor(task.priority)} className="text-xs px-2 py-0.5">
                    {task.priority}
                  </Badge>
                  {task.complexity && task.complexity >= 7 && (
                    <Badge variant="destructive" className="text-xs px-2 py-0.5">
                      Complex
                    </Badge>
                  )}
                  {task.estimated_time && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span className="truncate">{task.estimated_time}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleStatusChange('todo')}>
                  <Circle className="h-4 w-4 mr-2" />
                  Mark as To Do
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('in_progress')}>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Mark as In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark as Completed
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Description
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDetails(true)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete?.(task.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0 px-4 space-y-3">
          {/* Description */}
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Enter task description..."
                className="min-h-16 text-sm resize-none"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveDescription}
                  size="sm"
                  className="text-xs h-7"
                >
                  Save
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  size="sm"
                  variant="outline"
                  className="text-xs h-7"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <CardDescription className="text-xs leading-relaxed">
                {task.description || 'No description available.'}
              </CardDescription>
            </div>
          )}

          {/* Implementation Details */}
          {task.details && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <FileText className="h-3 w-3" />
                Implementation Details
              </div>
              <div className="bg-muted/50 p-2 rounded text-xs leading-relaxed">
                {task.details}
              </div>
            </div>
          )}

          {/* Test Strategy */}
          {task.testStrategy && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <TestTube className="h-3 w-3" />
                Test Strategy
              </div>
              <div className="bg-muted/50 p-2 rounded text-xs leading-relaxed">
                {task.testStrategy}
              </div>
            </div>
          )}

          {/* Acceptance Criteria */}
          {task.acceptanceCriteria && task.acceptanceCriteria.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <CheckCircle2 className="h-3 w-3" />
                Acceptance Criteria
              </div>
              <div className="bg-muted/50 p-2 rounded">
                <ul className="space-y-1">
                  {task.acceptanceCriteria.map((criteria, index) => (
                    <li key={index} className="flex items-start gap-1.5 text-xs leading-relaxed">
                      <Circle className="h-2 w-2 mt-1 flex-shrink-0" />
                      <span>{criteria}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Dependencies */}
          {task.dependencies && task.dependencies.length > 0 && (
            <div className="pt-2 border-t">
              <div className="text-xs text-muted-foreground mb-1">Dependencies:</div>
              <div className="flex flex-wrap gap-1">
                {task.dependencies.map((dep, index) => (
                  <Badge key={index} variant="outline" className="text-xs px-1.5 py-0">
                    Task #{dep}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Subtasks Section */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="pt-2 border-t">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowSubtasks(!showSubtasks)
                }}
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
              >
                {showSubtasks ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                Subtasks ({task.subtasks.length})
              </button>
              
              <motion.div
                initial={false}
                animate={{ 
                  height: showSubtasks ? 'auto' : 0,
                  opacity: showSubtasks ? 1 : 0 
                }}
                transition={{ 
                  duration: 0.3,
                  ease: 'easeInOut'
                }}
                className="overflow-hidden"
              >
                <div className="mt-2 space-y-2 ml-2">
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-start gap-2 p-2 bg-muted/30 rounded text-xs">
                      <Circle className="h-3 w-3 mt-0.5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">{subtask.title}</div>
                        <div className="text-muted-foreground mt-1">{subtask.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getStatusIcon(task.status)}
              {task.title}
            </DialogTitle>
            <DialogDescription>
              Task Details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1">Priority</h4>
                <Badge variant={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              </div>
              <div>
                <h4 className="font-medium mb-1">Status</h4>
                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  <span className="text-sm">{getStatusLabel(task.status)}</span>
                </div>
              </div>
              {task.estimated_time && (
                <div>
                  <h4 className="font-medium mb-1">Estimated Time</h4>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-4 w-4" />
                    {task.estimated_time}
                  </div>
                </div>
              )}
              <div>
                <h4 className="font-medium mb-1">Created Date</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(task.created_at).toLocaleDateString('en-US')}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {task.description || 'No description available.'}
              </p>
            </div>

            {task.dependencies && task.dependencies.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Dependencies</h4>
                <div className="flex flex-wrap gap-2">
                  {task.dependencies.map((dep, index) => (
                    <Badge key={index} variant="outline">
                      {dep}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {task.details && (
              <div>
                <h4 className="font-medium mb-2">Implementation Details</h4>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm whitespace-pre-wrap">
                    {task.details}
                  </p>
                </div>
              </div>
            )}

            {task.testStrategy && (
              <div>
                <h4 className="font-medium mb-2">Test Strategy</h4>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm whitespace-pre-wrap">
                    {task.testStrategy}
                  </p>
                </div>
              </div>
            )}

            {task.acceptanceCriteria && task.acceptanceCriteria.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Acceptance Criteria</h4>
                <div className="bg-muted p-3 rounded-md">
                  <ul className="space-y-1">
                    {task.acceptanceCriteria.map((criteria, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                        <span>{criteria}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}