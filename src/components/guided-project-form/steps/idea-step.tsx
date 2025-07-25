'use client'

import { useFormContext } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { GuidedProjectFormData } from '@/types/project'
import { StepHeader } from '../components/step-header'
import { guidedFormStyles } from '../styles/common-styles'

export function IdeaStep() {
  const form = useFormContext<GuidedProjectFormData>()
  const watchIdea = form.watch('idea')
  
  // Count lines (newlines + 1)
  const lineCount = watchIdea ? watchIdea.split('\n').length : 0
  const charCount = watchIdea ? watchIdea.length : 0
  
  return (
    <div className={guidedFormStyles.stepContainer}>
      <StepHeader
        title="프로젝트 아이디어가 무엇인가요?"
        description="간단한 개요로 시작하세요. AI가 다음 단계에서 확장하는 것을 도와드릴 것입니다."
      />

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">프로젝트 이름</FormLabel>
              <FormControl>
                <Input
                  placeholder="예: TaskFlow, ShopEasy, BlogHub"
                  className="text-base"
                  autoComplete="off"
                  data-no-translate="true"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="idea"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">간단한 설명</FormLabel>
              <FormDescription className="flex items-center justify-between">
                <span>프로젝트를 3줄 이내로 설명해주세요</span>
                <span className={lineCount > 3 || charCount > 300 ? 'text-destructive' : 'text-muted-foreground'}>
                  {lineCount}/3 줄 • {charCount}/300 글자
                </span>
              </FormDescription>
              <FormControl>
                <Textarea
                  placeholder="예: 원격 팀을 위한 작업 관리 앱으로 프로젝트와 마감일을 추적하는 데 도움을 줍니다. 실시간 협업 기능이 있고 Slack과 같은 인기 도구와 통합되어야 합니다."
                  className={guidedFormStyles.textareaLarge}
                  autoComplete="off"
                  data-no-translate="true"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value
                    const lines = value.split('\n')
                    
                    // Limit to 3 lines and 300 characters
                    if (lines.length <= 3 && value.length <= 300) {
                      field.onChange(value)
                    } else if (lines.length > 3) {
                      // Keep only first 3 lines
                      const truncated = lines.slice(0, 3).join('\n')
                      field.onChange(truncated.substring(0, 300))
                    } else if (value.length > 300) {
                      // Keep only first 300 chars
                      field.onChange(value.substring(0, 300))
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Tips section */}
      <div className={guidedFormStyles.infoBox}>
        <h4 className="font-medium mb-2">💡 간단하게 유지하세요</h4>
        <p className={guidedFormStyles.mutedSmall}>
          기본적인 아이디어만 주세요. AI가 다음 단계에서 상세한 제품 설명, 
          사용자 플로우, 기능을 개발하는 것을 도와드립니다.
        </p>
      </div>
    </div>
  )
}