'use client'

import { useState, useCallback } from 'react'
import { getMCPClient } from '@/lib/mcp/taskmaster'
import { Task } from '@/types/task'
import { supabase } from '@/lib/supabase/client'
import { CacheManager, CACHE_KEYS } from '@/lib/cache'

interface UseMCPOptions {
  onTasksCreated?: (tasks: Task[]) => void
  onError?: (error: Error) => void
}

export function useMCP(options?: UseMCPOptions) {
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [error, setError] = useState<Error | null>(null)



  const fetchTasks = useCallback(async (projectId: string, forceRefresh = false): Promise<Task[]> => {
    try {
      // Validate projectId
      if (!projectId || typeof projectId !== 'string') {
        setTasks([])
        return []
      }

      // Try cache first
      if (!forceRefresh) {
        const cached = CacheManager.get<Task[]>(CACHE_KEYS.TASKS(projectId), 5)
        
        if (cached) {
          setTasks(cached)
          return cached
        }
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true })

      if (error) throw error

      const fetchedTasks = data || []
      
      // Update state and cache
      setTasks(fetchedTasks)
      CacheManager.set(CACHE_KEYS.TASKS(projectId), fetchedTasks)
      
      return fetchedTasks
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch tasks.')
      setError(error)
      
      // Try cache on error
      const cached = CacheManager.get<Task[]>(CACHE_KEYS.TASKS(projectId), 60)
      
      const tasks = cached || []
      setTasks(tasks)
      return tasks
    }
  }, [])

  const updateTask = useCallback(async (
    taskId: string,
    updates: Partial<Task>
  ): Promise<boolean> => {
    // Validate taskId
    if (!taskId || typeof taskId !== 'string') {
      return false
    }

    // Find the current task to get project_id
    const currentTask = tasks.find(t => t.id === taskId)
    if (!currentTask) return false

    // Update local state immediately (optimistic update)
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    )
    setTasks(updatedTasks)
    
    // Update cache optimistically
    CacheManager.set(CACHE_KEYS.TASKS(currentTask.project_id), updatedTasks)

    try {
      // Update database in the background
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)

      if (error) {
        // Revert on error
        await fetchTasks(currentTask.project_id, true)
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


  return {
    // State
    isGeneratingTasks,
    tasks,
    error,

    // Actions
    fetchTasks,
    updateTask,
    deleteTask,
    reorderTasks,
    setTasks
  }
}