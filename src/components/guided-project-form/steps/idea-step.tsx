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
        title="어떤 프로젝트를 만들고 싶으신가요?"
        description="떠오르는 아이디어를 편하게 적어주세요. AI가 구체화를 도와드릴게요."
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
                  placeholder="예: 투두매니저, 쇼핑몰, 블로그"
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
              <FormLabel className="text-base">프로젝트 설명</FormLabel>
              <FormDescription className="flex items-center justify-between">
                <span>핵심 기능과 목적을 간단히 적어주세요</span>
                <span className={lineCount > 3 || charCount > 300 ? 'text-destructive' : 'text-muted-foreground'}>
                  {lineCount}/3 줄 • {charCount}/300 글자
                </span>
              </FormDescription>
              <FormControl>
                <Textarea
                  placeholder="예: 팀원들이 함께 일정과 작업을 관리할 수 있는 협업 도구를 만들고 싶어요. 실시간으로 진행 상황을 공유하고, 슬랙 같은 메신저와 연동되면 좋겠어요."
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
        <h4 className="font-medium mb-2">💡 팁</h4>
        <p className={guidedFormStyles.mutedSmall}>
          완벽하지 않아도 괜찮아요. AI가 함께 아이디어를 다듬어 나갈 거예요.
        </p>
      </div>
    </div>
  )
}