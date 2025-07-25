'use client'

import { useFormContext } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ProjectFormData } from '@/types/project'

export function IdeaStep() {
  const form = useFormContext<ProjectFormData>()
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">프로젝트 아이디어를 알려주세요</h3>
        <p className="text-muted-foreground">
          무엇을 만들고 싶으신가요? 더 자세히 설명해주실수록 더 좋은 PRD를 생성할 수 있습니다.
        </p>
      </div>

      {/* Tips section */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">💡 팁</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• 해결하려는 문제를 구체적으로 설명해주세요</li>
          <li>• 타겟 사용자와 그들의 고민을 언급해주세요</li>
          <li>• 고유한 가치 제안이나 차별점을 포함해주세요</li>
          <li>• 아직 기술적인 세부사항은 걱정하지 마세요 - &quot;무엇을&quot;, &quot;왜&quot;에 집중하세요</li>
        </ul>
      </div>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">프로젝트 이름</FormLabel>
              <FormControl>
                <Input
                  placeholder="예: 온라인 마켓플레이스, 블로그 플랫폼, 작업 관리 앱"
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
              <FormLabel className="text-base">프로젝트 아이디어</FormLabel>
              <FormDescription>
                목적, 해결하려는 문제, 타겟 사용자를 설명해주세요
              </FormDescription>
              <FormControl>
                <Textarea
                  placeholder="예: 사용자가 온라인에서 쉽게 쇼핑할 수 있는 이커머스 플랫폼을 만들고 싶습니다. 상품 검색, 장바구니, 결제, 주문 관리 기능이 필요합니다. 관리자는 상품과 주문을 관리할 수 있어야 합니다..."
                  className="min-h-32 text-base resize-none"
                  autoComplete="off"
                  data-no-translate="true"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}