'use client'

import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { GuidedProjectFormData } from '@/types/project'
import { useAIGeneration } from '@/hooks/use-ai-generation'
import { OptionCard } from '../components/option-card'
import { CardSkeleton } from '@/components/ui/skeletons/card-skeleton'
import { AdditionalNotesField } from '../components/additional-notes-field'
import { StepHeader } from '../components/step-header'
import { guidedFormStyles } from '../styles/common-styles'

export function UserFlowStep() {
  const form = useFormContext<GuidedProjectFormData>()
  
  const name = form.watch('name')
  const idea = form.watch('idea')
  const productDescriptionChoice = form.watch('productDescriptionChoice')
  const productDescriptionNotes = form.watch('productDescriptionNotes')
  const selectedChoice = form.watch('userFlowChoice')
  
  const { generate, isGenerating } = useAIGeneration({
    endpoint: '/api/guided-form/generate',
    onSuccess: (data) => {
      form.setValue('userFlowOptionA', data.optionA)
      form.setValue('userFlowOptionB', data.optionB)
    },
    enabled: true
  })
  
  const userFlowOptionA = form.watch('userFlowOptionA')
  const userFlowOptionB = form.watch('userFlowOptionB')
  
  useEffect(() => {
    // 이미 생성된 데이터가 있거나 생성 중이면 생성하지 않음
    if ((userFlowOptionA && userFlowOptionB) || isGenerating) {
      return
    }
    
    // 필요한 입력이 모두 있을 때만 생성
    if (name && idea && productDescriptionChoice) {
      console.log('Triggering AI generation for user flows')
      const selectedDescription = productDescriptionChoice === 'A' 
        ? form.getValues('productDescriptionOptionA')
        : form.getValues('productDescriptionOptionB')
      
      generate({ 
        type: 'user-flows',
        data: {
          name, 
          idea,
          productDescription: selectedDescription,
          productDescriptionNotes: productDescriptionNotes ? `Additional Notes: ${productDescriptionNotes}` : ''
        }
      })
    }
  }, [name, idea, productDescriptionChoice, isGenerating, generate, form, productDescriptionNotes])

  const parseUserFlow = (content: string) => {
    // Format numbered list with proper line breaks
    const formatted = content
      .replace(/(\d+\.\s)/g, '\n\n$1') // Add double line break before numbers for better spacing
      .trim()
    
    return (
      <p className={`${guidedFormStyles.mutedSmall} whitespace-pre-wrap leading-relaxed`}>
        {formatted}
      </p>
    )
  }

  return (
    <div className={guidedFormStyles.stepContainer}>
      <StepHeader
        title="사용자 경험을 디자인해볼까요?"
        description="사용자가 서비스를 어떻게 이용할지 두 가지 시나리오를 준비했어요."
      />

      <div className={guidedFormStyles.gridTwoColumn}>
        {isGenerating && !form.watch('userFlowOptionA') ? (
          <>
            <CardSkeleton showHeader={false} lines={5} />
            <CardSkeleton showHeader={false} lines={5} />
          </>
        ) : (
          <>
            <OptionCard
              option="A"
              content={form.watch('userFlowOptionA')}
              isSelected={selectedChoice === 'A'}
              onClick={() => form.setValue('userFlowChoice', 'A')}
              parseContent={parseUserFlow}
            />
            <OptionCard
              option="B"
              content={form.watch('userFlowOptionB')}
              isSelected={selectedChoice === 'B'}
              onClick={() => form.setValue('userFlowChoice', 'B')}
              parseContent={parseUserFlow}
            />
          </>
        )}
      </div>

      <AdditionalNotesField
        name="userFlowNotes"
        placeholder="특별히 고려했으면 하는 사용자 시나리오가 있나요?"
      />
    </div>
  )
}