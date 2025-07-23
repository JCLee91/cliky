'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { useCompletion } from 'ai/react'
import { Project } from '@/types/project'
import { Task } from '@/types/task'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { calculateTaskComplexity, filterComplexTasks } from '@/utils/task-complexity'

interface UseTaskStreamOptions {
  onSuccess?: (tasks: Task[]) => void
  onError?: (error: Error) => void
}

export function useTaskStream(options?: UseTaskStreamOptions) {
  const { onSuccess, onError } = options || {}
  const [parsedTasks, setParsedTasks] = useState<Task[]>([])
  const [isParsingComplete, setIsParsingComplete] = useState(false)
  const processedLinesRef = useRef<number>(0)
  
  // Store dynamic callbacks
  const callbacksRef = useRef<{
    onSuccess?: (tasks: Task[]) => void
    onError?: (error: Error) => void
  }>({})

  const {
    completion,
    isLoading,
    error,
    complete,
    stop
  } = useCompletion({
    api: '/api/taskmaster',
    onResponse: async (response) => {
      if (!response.ok) {
        try {
          const errorData = await response.json()
          const errorMessage = errorData.error || errorData.details || 'Failed to generate tasks'
          console.error('Task generation error:', errorMessage)
          const errorCallback = callbacksRef.current.onError || onError
          errorCallback?.(new Error(errorMessage))
        } catch {
          const errorCallback = callbacksRef.current.onError || onError
          errorCallback?.(new Error(`HTTP ${response.status}: Failed to generate tasks`))
        }
      }
    },
    onFinish: async (prompt, completion) => {
      try {
        // JSON Lines 형식 파싱: 각 줄을 개별 태스크로 처리
        const lines = completion.trim().split('\n')
        const tasks: Task[] = []
        
        for (const line of lines) {
          const trimmedLine = line.trim()
          if (trimmedLine) {
            try {
              const task = JSON.parse(trimmedLine)
              // 태스크 검증
              if (task.id && task.title && task.description) {
                tasks.push({
                  id: task.id.toString(), // Ensure string ID
                  project_id: '', // Will be set when saving
                  title: task.title,
                  description: task.description,
                  priority: task.priority || 'medium',
                  estimated_time: task.estimatedTime || task.estimated_time || '',
                  dependencies: task.dependencies || [],
                  order_index: task.id,
                  status: task.status || 'todo',
                  created_at: new Date().toISOString(),
                  details: task.details,
                  testStrategy: task.testStrategy
                })
              }
            } catch (lineError) {
              console.warn('Failed to parse line:', trimmedLine, lineError)
            }
          }
        }
        
        if (tasks.length > 0) {
          // 복잡도 계산 추가
          const tasksWithComplexity = tasks.map(task => ({
            ...task,
            complexity: calculateTaskComplexity(task)
          }))
          
          setParsedTasks(tasksWithComplexity)
          setIsParsingComplete(true)
          
          // 복잡한 태스크 자동 확장
          const complexTasks = filterComplexTasks(tasksWithComplexity)
          if (complexTasks.length > 0) {
            await expandComplexTasks(complexTasks)
          }
          
          // Use dynamic callback if available, otherwise use hook option
          const successCallback = callbacksRef.current.onSuccess || onSuccess
          successCallback?.(tasksWithComplexity)
          
          toast.success(`${tasks.length} tasks generated successfully!`)
        } else {
          throw new Error('No valid tasks were parsed')
        }
      } catch (error) {
        console.error('❌ Task parsing error:', error)
        console.error('Raw completion that failed to parse:', completion.substring(0, 500))
        
        const errorMsg = error instanceof Error ? error : new Error('Failed to parse tasks')
        toast.error('Error parsing tasks: ' + errorMsg.message)
        const errorCallback = callbacksRef.current.onError || onError
        errorCallback?.(errorMsg)
      } finally {
        // Clear dynamic callbacks
        callbacksRef.current = {}
      }
    },
    onError: (error) => {
      console.error('Task generation error:', error)
      toast.error('Error generating tasks: ' + error.message)
      const errorCallback = callbacksRef.current.onError || onError
      errorCallback?.(error)
      // Clear dynamic callbacks
      callbacksRef.current = {}
    }
  })

  // 실시간으로 스트리밍 중인 completion을 파싱하여 태스크 추가
  useEffect(() => {
    if (!completion || !isLoading) return

    const lines = completion.trim().split('\n')
    const newTasks: Task[] = []
    
    // 이미 처리한 라인 수 이후의 라인들만 처리
    for (let i = processedLinesRef.current; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line) {
        try {
          const task = JSON.parse(line)
          // 태스크 검증
          if (task.id && task.title && task.description) {
            newTasks.push({
              id: task.id.toString(), // Ensure string ID
              project_id: '', // Will be set when saving
              title: task.title,
              description: task.description,
              priority: task.priority || 'medium',
              estimated_time: task.estimatedTime || task.estimated_time || '',
              dependencies: task.dependencies || [],
              order_index: task.id,
              status: task.status || 'todo',
              created_at: new Date().toISOString(),
              details: task.details,
              testStrategy: task.testStrategy
            })
            processedLinesRef.current = i + 1
          }
        } catch {
          // 아직 완성되지 않은 JSON 라인은 무시
        }
      }
    }
    
    if (newTasks.length > 0) {
      setParsedTasks(prev => [...prev, ...newTasks])
    }
  }, [completion, isLoading])

  const generateTasksStream = async (
    project: Project,
    prdContent: string,
    dynamicCallbacks?: {
      onSuccess?: (tasks: Task[]) => void
      onError?: (error: Error) => void
    }
  ) => {
    try {
      // Reset state
      setParsedTasks([])
      setIsParsingComplete(false)
      
      // Store dynamic callbacks if provided
      if (dynamicCallbacks) {
        callbacksRef.current = dynamicCallbacks
      }
      
      await complete('', {
        body: { 
          action: 'generate-tasks-streaming',
          prdContent,
          options: {
            numTasks: 12, // 원본 기본값
            projectContext: {
              name: project.name,
              idea: project.idea,
              features: project.features || [],
              techPreferences: project.tech_preferences || []
            }
          }
        }
      })
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Task generation failed')
      toast.error(error.message)
      const errorCallback = callbacksRef.current.onError || onError
      errorCallback?.(error)
      // Clear dynamic callbacks
      callbacksRef.current = {}
    }
  }

  const saveTasks = async (projectId: string, tasks: any[]): Promise<Task[]> => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    
    if (!uuidRegex.test(projectId)) {
      throw new Error('Invalid project ID format')
    }

    const tasksToCreate = tasks.map((task, index) => ({
      project_id: projectId,
      title: task.title,
      description: task.description,
      priority: task.priority || 'medium',
      estimated_time: task.estimatedTime || task.estimated_time,
      dependencies: [],
      order_index: index,
      details: task.details || null,
      test_strategy: task.testStrategy || null
    }))

    const { data, error } = await supabase
      .from('tasks')
      .insert(tasksToCreate)
      .select('*')

    if (error) {
      throw new Error(`Failed to save tasks: ${error.message}`)
    }

    return data || []
  }

  const expandComplexTasks = async (complexTasks: Task[]) => {
    try {
      toast.info(`Expanding ${complexTasks.length} complex tasks...`)
      
      const response = await fetch('/api/taskmaster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'expand-complex-tasks',
          tasks: complexTasks.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            details: task.details,
            priority: task.priority,
            estimated_time: task.estimated_time
          }))
        })
      })
      
      if (response.ok) {
        const { data } = await response.json()
        
        // 서브태스크를 기존 태스크에 추가
        setParsedTasks(prev => prev.map(task => {
          const expansion = data.expandedTasks.find((e: any) => e.taskId === task.id)
          if (expansion && expansion.subtasks.length > 0) {
            return {
              ...task,
              subtasks: expansion.subtasks
            }
          }
          return task
        }))
        
        toast.success('Complex tasks expanded successfully!')
      }
    } catch (error) {
      console.error('Failed to expand complex tasks:', error)
    }
  }

  const reset = () => {
    setParsedTasks([])
    setIsParsingComplete(false)
    processedLinesRef.current = 0
  }

  return {
    // Raw streaming data
    streamingContent: completion,
    isGenerating: isLoading,
    error,
    
    // Parsed tasks
    parsedTasks,
    isParsingComplete,
    
    // Actions
    generateTasksStream,
    saveTasks,
    stopGeneration: stop,
    reset
  }
}