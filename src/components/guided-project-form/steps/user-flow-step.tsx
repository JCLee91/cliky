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

interface UserFlowStepProps {
  isGenerating: boolean
  setIsGenerating: (value: boolean) => void
}

export function UserFlowStep({ isGenerating, setIsGenerating }: UserFlowStepProps) {
  const form = useFormContext<GuidedProjectFormData>()
  
  const name = form.watch('name')
  const idea = form.watch('idea')
  const productDescriptionChoice = form.watch('productDescriptionChoice')
  const productDescriptionNotes = form.watch('productDescriptionNotes')
  const selectedChoice = form.watch('userFlowChoice')
  
  const { generate, hasGenerated } = useAIGeneration({
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
      
      setIsGenerating(true)
      generate({ 
        type: 'user-flows',
        data: {
          name, 
          idea,
          productDescription: selectedDescription,
          productDescriptionNotes: productDescriptionNotes ? `Additional Notes: ${productDescriptionNotes}` : ''
        }
      }).finally(() => setIsGenerating(false))
    }
  }, [name, idea, productDescriptionChoice, hasGenerated, generate, setIsGenerating])


  return (
    <div className={guidedFormStyles.stepContainer}>
      <StepHeader
        title="Select Your User Flow"
        description="Based on your product description, here are two user flow approaches. Choose the one that best fits your vision."
      />

      <div className={guidedFormStyles.gridTwoColumn}>
        {isGenerating ? (
          <>
            <CardSkeleton showHeader={false} lines={5} />
            <CardSkeleton showHeader={false} lines={5} />
          </>
        ) : (
          <>
            <OptionCard
              option="A"
              title="Flow A"
              content={form.watch('userFlowOptionA')}
              isSelected={selectedChoice === 'A'}
              onClick={() => form.setValue('userFlowChoice', 'A')}
            />
            <OptionCard
              option="B"
              title="Flow B"
              content={form.watch('userFlowOptionB')}
              isSelected={selectedChoice === 'B'}
              onClick={() => form.setValue('userFlowChoice', 'B')}
            />
          </>
        )}
      </div>

      <AdditionalNotesField
        name="userFlowNotes"
        placeholder="Any specific user journeys or flow modifications you'd like to emphasize..."
      />
    </div>
  )
}