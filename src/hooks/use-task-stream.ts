'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { useCompletion } from 'ai/react'
import { Project } from '@/types/project'
import { Task } from '@/types/task'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { calculateTaskComplexity, filterComplexTasks } from '@/utils/task-complexity'
import { parseTaskLine, parseTaskLines } from '@/utils/task-parser'

interface UseTaskStreamOptions {
  onSuccess?: (tasks: Task[]) => void
  onError?: (error: Error) => void
}

export function useTaskStream(options?: UseTaskStreamOptions) {
  const { onSuccess, onError } = options || {}
  const [parsedTasks, setParsedTasks] = useState<Task[]>([])
  const [isParsingComplete, setIsParsingComplete] = useState(false)
  const [isExpandingTasks, setIsExpandingTasks] = useState(false)
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
    streamProtocol: 'text', // Use text protocol to match API's toTextStreamResponse()
    onResponse: async (response) => {
      if (!response.ok) {
        // Don't try to read the body here - it will be read by the SDK
        const errorCallback = callbacksRef.current.onError || onError
        errorCallback?.(new Error(`HTTP ${response.status}: ${response.statusText}`))
      }
    },
    onFinish: async (prompt, completion) => {
      try {
        // JSON Lines 형식 파싱: 각 줄을 개별 태스크로 처리
        const lines = completion.trim().split('\n')
        const tasks = parseTaskLines(lines)
        
        if (tasks.length > 0) {
          // parseTaskLines already includes complexity calculation
          const tasksWithComplexity = tasks
          
          // 먼저 태스크를 설정하고 완료 상태로 표시
          setParsedTasks(tasksWithComplexity)
          setIsParsingComplete(true)
          
          // Success 콜백 먼저 호출하여 UI가 업데이트되도록 함
          const successCallback = callbacksRef.current.onSuccess || onSuccess
          successCallback?.(tasksWithComplexity)
          
          // Success toast removed
          
          // 복잡한 태스크 확장은 비동기로 별도 처리 (UI 블로킹 방지)
          const complexTasks = filterComplexTasks(tasksWithComplexity)
          if (complexTasks.length > 0) {
            // requestIdleCallback을 사용하여 브라우저가 유휴 상태일 때 실행
            if ('requestIdleCallback' in window) {
              requestIdleCallback(() => {
                expandComplexTasks(complexTasks)
              }, { timeout: 100 })
            } else {
              // 폴백: requestIdleCallback이 없는 경우 setTimeout 사용
              setTimeout(() => {
                expandComplexTasks(complexTasks)
              }, 100)
            }
          }
        } else {
          throw new Error('No valid tasks were parsed')
        }
      } catch (error) {
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
      toast.error('Error generating tasks: ' + error.message)
      const errorCallback = callbacksRef.current.onError || onError
      errorCallback?.(error)
      // Clear dynamic callbacks
      callbacksRef.current = {}
    }
  })

  // 실시간으로 스트리밍 중인 completion을 파싱하여 태스크 추가
  useEffect(() => {
    if (!completion || !isLoading || isParsingComplete) return

    // 디바운싱을 위한 타이머
    const debounceTimer = setTimeout(() => {
      const lines = completion.trim().split('\n')
      const newTasks: Task[] = []
      
      // 이미 처리한 라인 수 이후의 라인들만 처리
      for (let i = processedLinesRef.current; i < lines.length; i++) {
        const task = parseTaskLine(lines[i])
        if (task) {
          newTasks.push(task)
        }
      }
      
      // 마지막 처리된 인덱스 업데이트
      if (lines.length > processedLinesRef.current) {
        processedLinesRef.current = lines.length
      }
      
      if (newTasks.length > 0) {
        // 배치 업데이트로 렌더링 최적화
        setParsedTasks(prev => {
          const updated = [...prev]
          newTasks.forEach(newTask => {
            // 중복 체크
            if (!updated.find(t => t.id === newTask.id)) {
              updated.push(newTask)
            }
          })
          return updated
        })
      }
    }, 300) // 300ms 디바운스로 증가하여 렌더링 빈도 감소

    return () => {
      clearTimeout(debounceTimer)
    }
  }, [completion, isLoading, isParsingComplete])

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
      processedLinesRef.current = 0 // Reset processed lines counter
      
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
      test_strategy: task.testStrategy || null,
      acceptance_criteria: task.acceptanceCriteria || []
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
      setIsExpandingTasks(true)
      
      
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
        
        // 서브태스크를 점진적으로 추가 (기존 태스크 유지)
        setParsedTasks(prev => {
          // 먼저 현재 상태를 복사
          const updatedTasks = [...prev]
          
          // 각 확장된 태스크에 대해 업데이트
          data.expandedTasks.forEach((expansion: any) => {
            const taskIndex = updatedTasks.findIndex(t => t.id === expansion.taskId)
            if (taskIndex !== -1 && expansion.subtasks && expansion.subtasks.length > 0) {
              // 기존 태스크 객체를 유지하면서 서브태스크만 추가
              updatedTasks[taskIndex] = {
                ...updatedTasks[taskIndex],
                subtasks: expansion.subtasks
              }
            }
          })
          
          return updatedTasks
        })
        
        // Success toast removed
      }
    } catch (error) {
      toast.error('Failed to expand complex tasks')
    } finally {
      setIsExpandingTasks(false)
    }
  }

  const reset = () => {
    setParsedTasks([])
    setIsParsingComplete(false)
    setIsExpandingTasks(false)
    processedLinesRef.current = 0
  }

  return {
    // Streaming state
    isGenerating: isLoading,
    error,
    
    // Parsed tasks
    parsedTasks,
    isParsingComplete,
    
    // Expansion state
    isExpandingTasks,
    
    // Actions
    generateTasksStream,
    saveTasks,
    stopGeneration: stop,
    reset
  }
}