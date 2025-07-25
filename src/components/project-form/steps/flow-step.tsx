'use client'

import { useFormContext } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { ProjectFormData } from '@/types/project'

export function FlowStep() {
  const form = useFormContext<ProjectFormData>()
  const userFlow = form.watch('userFlow')

  const exampleFlow = `예시:
1. 사용자가 웹사이트를 방문합니다
2. 회원가입 또는 로그인을 합니다
3. 상품 카테고리를 탐색하거나 검색합니다
4. 상품 상세 페이지를 확인합니다
5. 장바구니에 추가합니다
6. 결제 페이지로 이동합니다
7. 배송 정보를 입력합니다
8. 결제를 완료합니다
9. 주문 확인 이메일을 받습니다`

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">사용자 플로우를 설명해주세요</h3>
        <p className="text-muted-foreground">
          사용자가 앱을 어떻게 사용할지 단계별로 설명해주세요
        </p>
      </div>

      {/* Tips section */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">💡 팁</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• 사용자의 목표와 동기를 포함하세요</li>
          <li>• 각 단계에서 사용자가 취하는 구체적인 행동을 설명하세요</li>
          <li>• 예외 상황이나 대체 경로를 고려하세요</li>
          <li>• 핵심 기능이 플로우에 통합되어 있는지 확인하세요</li>
        </ul>
      </div>

      <FormField
        control={form.control}
        name="userFlow"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">사용자 플로우</FormLabel>
            <FormDescription>
              사용자가 프로젝트와 상호작용하는 완전한 플로우를 단계별로 작성해주세요
            </FormDescription>
            <FormControl>
              <Textarea
                placeholder={exampleFlow}
                className="min-h-40 text-base resize-none"
                autoComplete="off"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}