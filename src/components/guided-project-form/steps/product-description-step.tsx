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

interface ProductDescriptionStepProps {
  isGenerating: boolean
  setIsGenerating: (value: boolean) => void
}

export function ProductDescriptionStep({ isGenerating, setIsGenerating }: ProductDescriptionStepProps) {
  const form = useFormContext<GuidedProjectFormData>()
  
  const name = form.watch('name')
  const idea = form.watch('idea')
  const selectedChoice = form.watch('productDescriptionChoice')
  
  const { generate, hasGenerated } = useAIGeneration({
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
      setIsGenerating(true)
      generate({ 
        type: 'product-descriptions',
        data: { name, idea }
      }).finally(() => setIsGenerating(false))
    }
  }, [name, idea, hasGenerated, generate, setIsGenerating])

  const parseProductDescription = (content: string) => {
    return (
      <div className={`${guidedFormStyles.mutedSmall} whitespace-pre-wrap space-y-3`}>
        {content.split('\n').map((line, idx) => {
          if (line.startsWith('문제 정의:') || line.startsWith('Problem Definition:')) {
            const [label, ...content] = line.split(': ')
            return <div key={idx}><span className="font-semibold text-foreground">{label}:</span> {content.join(': ')}</div>
          } else if (line.startsWith('주요 사용자:') || line.startsWith('Target Users:')) {
            const [label, ...content] = line.split(': ')
            return <div key={idx}><span className="font-semibold text-foreground">{label}:</span> {content.join(': ')}</div>
          } else if (line.startsWith('사용 시나리오:') || line.startsWith('Usage Scenario:')) {
            const [label] = line.split(': ')
            return <div key={idx}><span className="font-semibold text-foreground">{label}:</span></div>
          } else if (line.startsWith('핵심 가치:') || line.startsWith('Core Value:')) {
            const [label, ...content] = line.split(': ')
            return <div key={idx}><span className="font-semibold text-foreground">{label}:</span> {content.join(': ')}</div>
          } else if (line.match(/^\d\./)) {
            return <div key={idx} className="ml-4">{line}</div>
          } else {
            return line ? <div key={idx}>{line}</div> : null
          }
        })}
      </div>
    )
  }

  return (
    <div className={guidedFormStyles.stepContainer}>
      <StepHeader
        title="Choose Your Product Direction"
        description="We've generated two product descriptions based on your idea. Choose the one that best matches your vision."
      />

      <div className={guidedFormStyles.gridTwoColumn}>
        {isGenerating ? (
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