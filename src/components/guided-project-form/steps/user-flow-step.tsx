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
  
  const { generate, hasGenerated, isGenerating } = useAIGeneration({
    endpoint: '/api/guided-form/generate',
    onSuccess: (data) => {
      form.setValue('userFlowOptionA', data.optionA)
      form.setValue('userFlowOptionB', data.optionB)
    },
    dependencies: [name, idea, productDescriptionChoice],
    enabled: true
  })
  
  useEffect(() => {
    if (!hasGenerated && name && idea && productDescriptionChoice) {
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
  }, [name, idea, productDescriptionChoice, hasGenerated, generate])

  const parseUserFlow = (content: string) => {
    // Format numbered list with proper line breaks
    const formatted = content
      .replace(/(\d+\.\s)/g, '\n$1') // Add line break before numbers
      .trim()
    
    return (
      <p className={`${guidedFormStyles.mutedSmall} whitespace-pre-wrap`}>
        {formatted}
      </p>
    )
  }

  return (
    <div className={guidedFormStyles.stepContainer}>
      <StepHeader
        title="사용자 플로우를 선택하세요"
        description="제품 설명을 바탕으로 두 가지 사용자 플로우 접근 방식을 제공합니다. 비전에 가장 잘 맞는 것을 선택하세요."
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
        placeholder="강조하고 싶은 특정 사용자 여정이나 플로우 수정 사항..."
      />
    </div>
  )
}