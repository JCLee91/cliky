'use client'

import { useRef } from 'react'
import { useCompletion } from 'ai/react'
import { ProjectFormData } from '@/types/project'
import { toast } from 'sonner'

interface UseAIStreamOptions {
  onSuccess?: (prdContent: string) => void
  onError?: (error: Error) => void
}

export function useAIStream(options?: UseAIStreamOptions) {
  const { onSuccess, onError } = options || {}
  
  // Store dynamic callbacks
  const callbacksRef = useRef<{
    onSuccess?: (content: string) => void
    onError?: (error: Error) => void
  }>({})

  const {
    completion,
    isLoading,
    error,
    complete,
    stop,
    setCompletion
  } = useCompletion({
    api: '/api/taskmaster',
    onFinish: (prompt, completion) => {
      // Success toast removed
      // Use dynamic callback if available, otherwise use hook option
      const successCallback = callbacksRef.current.onSuccess || onSuccess
      successCallback?.(completion)
      // Clear dynamic callbacks
      callbacksRef.current = {}
    },
    onError: (error) => {
      toast.error('PRD 생성 중 오류가 발생했습니다.')
      // Use dynamic callback if available, otherwise use hook option
      const errorCallback = callbacksRef.current.onError || onError
      errorCallback?.(error)
      // Clear dynamic callbacks
      callbacksRef.current = {}
    }
  })

  const generatePRD = async (
    projectData: ProjectFormData,
    dynamicCallbacks?: {
      onSuccess?: (content: string) => void
      onError?: (error: Error) => void
    }
  ) => {
    try {
      // Store dynamic callbacks if provided
      if (dynamicCallbacks) {
        callbacksRef.current = dynamicCallbacks
      }
      
      await complete('', {
        body: { 
          action: 'generate-prd',
          projectData 
        }
      })
    } catch (err) {
      const error = err instanceof Error ? err : new Error('PRD 생성 실패')
      toast.error(error.message)
      const errorCallback = callbacksRef.current.onError || onError
      errorCallback?.(error)
      // Clear dynamic callbacks
      callbacksRef.current = {}
    }
  }

  const reset = () => {
    setCompletion('')
  }

  return {
    prdContent: completion,
    isGenerating: isLoading,
    error,
    generatePRD,
    stopGeneration: stop,
    reset
  }
}