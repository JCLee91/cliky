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

export function ProductDescriptionStep() {
  const form = useFormContext<GuidedProjectFormData>()
  
  const name = form.watch('name')
  const idea = form.watch('idea')
  const selectedChoice = form.watch('productDescriptionChoice')
  
  const { generate, hasGenerated, isGenerating } = useAIGeneration({
    endpoint: '/api/guided-form/generate',
    onSuccess: (data) => {
      form.setValue('productDescriptionOptionA', data.optionA)
      form.setValue('productDescriptionOptionB', data.optionB)
    },
    dependencies: [name, idea],
    enabled: true
  })
  
  useEffect(() => {
    if (!hasGenerated && name && idea) {
      generate({ 
        type: 'product-descriptions',
        data: { name, idea }
      })
    }
  }, [name, idea, hasGenerated, generate])

  const parseProductDescription = (content: string) => {
    // Simple regex to add line breaks before each section
    const formatted = content
      .replace(/Target Users:/g, '\n\nTarget Users:')
      .replace(/주요 사용자:/g, '\n\n주요 사용자:')
      .replace(/Usage Scenario:/g, '\n\nUsage Scenario:')
      .replace(/사용 시나리오:/g, '\n\n사용 시나리오:')
      .replace(/Core Value:/g, '\n\nCore Value:')
      .replace(/핵심 가치:/g, '\n\n핵심 가치:')
      .replace(/(\d+\.\s)/g, '\n  $1') // Add line break and indent before numbers
    
    return (
      <p className={`${guidedFormStyles.mutedSmall} whitespace-pre-wrap`}>
        {formatted}
      </p>
    )
  }

  return (
    <div className={guidedFormStyles.stepContainer}>
      <StepHeader
        title="Choose Your Product Direction"
        description="We've generated two product descriptions based on your idea. Choose the one that best matches your vision."
      />

      <div className={guidedFormStyles.gridTwoColumn}>
        {isGenerating && !form.watch('productDescriptionOptionA') ? (
          <>
            <CardSkeleton showHeader={false} lines={4} />
            <CardSkeleton showHeader={false} lines={4} />
          </>
        ) : (
          <>
            <OptionCard
              option="A"
              content={form.watch('productDescriptionOptionA')}
              isSelected={selectedChoice === 'A'}
              onClick={() => form.setValue('productDescriptionChoice', 'A')}
              parseContent={parseProductDescription}
            />
            <OptionCard
              option="B"
              content={form.watch('productDescriptionOptionB')}
              isSelected={selectedChoice === 'B'}
              onClick={() => form.setValue('productDescriptionChoice', 'B')}
              parseContent={parseProductDescription}
            />
          </>
        )}
      </div>

      <AdditionalNotesField
        name="productDescriptionNotes"
        placeholder="Any additional details or modifications you'd like to add to the selected description..."
      />
    </div>
  )
}