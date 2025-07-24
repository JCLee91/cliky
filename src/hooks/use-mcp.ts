'use client'

import { useState, useCallback } from 'react'
import { getMCPClient, breakdownToTasks } from '@/lib/mcp/taskmaster'
import { TaskBreakdownRequest, TaskBreakdownResponse, Task, CreateTaskData } from '@/types/task'
import { Project } from '@/types/project'
import { supabase } from '@/lib/supabase/client'
// import { toast } from 'sonner' - Removed for performance

interface UseMCPOptions {
  onTasksCreated?: (tasks: Task[]) => void
  onError?: (error: Error) => void
}

export function useMCP(options?: UseMCPOptions) {
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [error, setError] = useState<Error | null>(null)

  const generateTasks = useCallback(async (
    project: Project,
    trdContent: string
  ): Promise<TaskBreakdownResponse | null> => {
    setIsGeneratingTasks(true)
    setError(null)

    try {
      const request: TaskBreakdownRequest = {
        trdContent,
        projectContext: {
          name: project.name,
          idea: project.idea,
          features: project.features || [],
          techPreferences: project.tech_preferences || []
        }
      }

      // Silent - removed toast for performance

      // Call Task Master MCP to generate tasks
      const response = await breakdownToTasks(request)

      if (response.tasks.length === 0) {
        throw new Error('Failed to generate tasks.')
      }

      // Save tasks to Supabase
      const savedTasks = await saveTasks(project.id, response)
      setTasks(savedTasks)

      // Silent success - removed toast
      options?.onTasksCreated?.(savedTasks)

      return response
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred while generating tasks.')
      setError(error)
      // Silent error
      options?.onError?.(error)
      return null
    } finally {
      setIsGeneratingTasks(false)
    }
  }, [options])

  const saveTasks = async (
    projectId: string,
    response: TaskBreakdownResponse
  ): Promise<Task[]> => {
    if (!projectId || typeof projectId !== 'string') {
      throw new Error('Invalid project ID.')
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    
    if (!uuidRegex.test(projectId)) {
      throw new Error('Project ID is not in valid UUID format.')
    }

    // Filter out invalid dependencies (non-UUID values)
    const filterValidDependencies = (deps: string[]): string[] => {
      if (!Array.isArray(deps)) return []
      return deps.filter(dep => 
        typeof dep === 'string' && 
        dep.length > 0 && 
        uuidRegex.test(dep)
      )
    }

    const tasksToCreate: CreateTaskData[] = response.tasks.map((task, index) => ({
      project_id: projectId,
      title: task.title,
      description: task.description,
      priority: task.priority,
      estimated_time: task.estimatedTime,
      dependencies: filterValidDependencies(task.dependencies || []),
      order_index: index
    }))

    const { data, error } = await supabase
      .from('tasks')
      .insert(tasksToCreate)
      .select('*')

    if (error) {
      console.error('Error saving tasks:', error)
      throw new Error(`Failed to save tasks: ${error.message}`)
    }

    return data || []
  }

  const fetchTasks = useCallback(async (projectId: string): Promise<Task[]> => {
    try {
      // Validate projectId before making the request
      if (!projectId || typeof projectId !== 'string') {
        console.warn('fetchTasks called with invalid projectId:', projectId)
        setTasks([])
        return []
      }

      console.log('[fetchTasks] Fetching tasks for project:', projectId)

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true })

      if (error) {
        console.error('[fetchTasks] Supabase error:', error)
        throw error
      }

      const fetchedTasks = data || []
      console.log('[fetchTasks] Fetched tasks:', fetchedTasks.length, 'tasks')
      console.log('[fetchTasks] Task details:', fetchedTasks)
      
      setTasks(fetchedTasks)
      return fetchedTasks
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch tasks.')
      console.error('[fetchTasks] Error:', error)
      setError(error)
      // Silent error
      return []
    }
  }, [])

  const updateTask = useCallback(async (
    taskId: string,
    updates: Partial<Task>
  ): Promise<boolean> => {
    // Validate taskId
    if (!taskId || typeof taskId !== 'string') {
      console.error('updateTask called with invalid taskId:', taskId)
      return false
    }

    // Update local state immediately (optimistic update)
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ))

    try {
      // Update database in the background
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)

      if (error) {
        // Revert on error
        const currentTask = tasks.find(t => t.id === taskId)
        if (currentTask?.project_id) {
          await fetchTasks(currentTask.project_id)
        }
        throw error
      }

      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update task.')
      setError(error)
      return false
    }
  }, [tasks, fetchTasks])

  const deleteTask = useCallback(async (taskId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      // Update local state
      setTasks(prev => prev.filter(task => task.id !== taskId))

      // Silent success
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete task.')
      setError(error)
      // Silent error
      return false
    }
  }, [])

  const reorderTasks = useCallback(async (
    projectId: string,
    taskIds: string[]
  ): Promise<boolean> => {
    try {
      // Update order_index for each task
      const updates = taskIds.map((taskId, index) => ({
        id: taskId,
        order_index: index
      }))

      for (const update of updates) {
        const { error } = await supabase
          .from('tasks')
          .update({ order_index: update.order_index })
          .eq('id', update.id)

        if (error) throw error
      }

      // Refresh tasks
      await fetchTasks(projectId)
      // Silent success
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to change task order.')
      setError(error)
      // Silent error
      return false
    }
  }, [fetchTasks])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // State
    isGeneratingTasks,
    tasks,
    error,

    // Actions
    generateTasks,
    fetchTasks,
    updateTask,
    deleteTask,
    reorderTasks,
    clearError,
    setTasks
  }
}