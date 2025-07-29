import { useState } from 'react'
import { toast } from 'sonner'

interface UseAIGenerationOptions {
  endpoint: string
  onSuccess?: (data: any) => void
  enabled?: boolean
}

export function useAIGeneration({
  endpoint,
  onSuccess,
  enabled = true
}: UseAIGenerationOptions) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = async (body: any) => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Response Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        throw new Error(errorData.error || '생성 실패')
      }
      
      const data = await response.json()
      setHasGenerated(true)
      onSuccess?.(data)
      return data
    } catch (error) {
      const message = error instanceof Error ? error.message : '생성 실패'
      setError(message)
      toast.error(message)
      throw error
    } finally {
      setIsGenerating(false)
    }
  }

  // Dependencies 변경을 추적하지 않음 - 컴포넌트에서 데이터 존재 여부로 판단
  // hasGenerated는 generate 호출 성공 여부만 추적

  // 자동 생성 로직은 컴포넌트에서 필요에 따라 수동으로 호출
  // 중복 호출을 방지하기 위해 훅 내부에서는 자동 생성하지 않음

  return {
    generate,
    isGenerating,
    hasGenerated,
    error,
    reset: () => {
      setHasGenerated(false)
      setError(null)
    }
  }
}