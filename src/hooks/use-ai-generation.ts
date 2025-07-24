import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface UseAIGenerationOptions {
  endpoint: string
  onSuccess?: (data: any) => void
  dependencies: any[]
  enabled?: boolean
}

export function useAIGeneration({
  endpoint,
  onSuccess,
  dependencies,
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
        throw new Error(errorData.error || 'Failed to generate')
      }
      
      const data = await response.json()
      setHasGenerated(true)
      onSuccess?.(data)
      return data
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generation failed'
      setError(message)
      toast.error(message)
      throw error
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    let mounted = true
    
    // Check if all dependencies are truthy and generation is enabled
    const shouldGenerate = enabled && !hasGenerated && dependencies.every(dep => dep) && mounted
    
    if (shouldGenerate) {
      // Auto-generation logic can be added here if needed
    }
    
    return () => {
      mounted = false
    }
  }, [...dependencies, hasGenerated, enabled])

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