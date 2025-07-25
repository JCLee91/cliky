'use client'

import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { GuidedProjectFormData } from '@/types/project'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Users, Sparkles } from 'lucide-react'
import { useAIGeneration } from '@/hooks/use-ai-generation'
import { AdditionalNotesField } from '../components/additional-notes-field'
import { StepHeader } from '../components/step-header'
import { guidedFormStyles } from '../styles/common-styles'

export function FeaturesRolesStep() {
  const form = useFormContext<GuidedProjectFormData>()
  
  const name = form.watch('name')
  const idea = form.watch('idea')
  const productDescriptionChoice = form.watch('productDescriptionChoice')
  const userFlowChoice = form.watch('userFlowChoice')
  const userFlowNotes = form.watch('userFlowNotes')
  
  const selectedFeatures = form.watch('coreFeatures') || []
  const selectedRoles = form.watch('roles') || []
  const suggestedFeatures = form.watch('suggestedFeatures') || []
  const suggestedRoles = form.watch('suggestedRoles') || []
  
  const { generate, hasGenerated, isGenerating } = useAIGeneration({
    endpoint: '/api/guided-form/generate',
    onSuccess: (data) => {
      form.setValue('suggestedFeatures', data.features)
      form.setValue('suggestedRoles', data.roles)
      // Pre-select all suggested items
      form.setValue('coreFeatures', data.features)
      form.setValue('roles', data.roles)
    },
    dependencies: [name, idea, productDescriptionChoice, userFlowChoice],
    enabled: true
  })
  
  useEffect(() => {
    if (!hasGenerated && name && idea && productDescriptionChoice && userFlowChoice) {
      const selectedDescription = productDescriptionChoice === 'A' 
        ? form.getValues('productDescriptionOptionA')
        : form.getValues('productDescriptionOptionB')
      
      const selectedFlow = userFlowChoice === 'A'
        ? form.getValues('userFlowOptionA')
        : form.getValues('userFlowOptionB')
      
      generate({ 
        type: 'features-roles',
        data: {
          name, 
          idea,
          productDescription: selectedDescription,
          userFlow: selectedFlow,
          userFlowNotes
        }
      })
    }
  }, [name, idea, productDescriptionChoice, userFlowChoice, hasGenerated, generate])

  const toggleFeature = (feature: string) => {
    const current = form.getValues('coreFeatures') || []
    if (current.includes(feature)) {
      form.setValue('coreFeatures', current.filter(f => f !== feature))
    } else {
      form.setValue('coreFeatures', [...current, feature])
    }
  }

  const toggleRole = (role: string) => {
    const current = form.getValues('roles') || []
    if (current.includes(role)) {
      form.setValue('roles', current.filter(r => r !== role))
    } else {
      form.setValue('roles', [...current, role])
    }
  }

  return (
    <div className={guidedFormStyles.stepContainer}>
      <StepHeader
        title="핵심 기능 및 사용자 역할"
        description="프로젝트에 필요한 핵심 기능과 사용자 역할을 식별했습니다. 필요에 따라 사용자 정의하세요."
      />

      <div className={guidedFormStyles.gridTwoColumnLarge}>
        {/* Core Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className={guidedFormStyles.iconMedium} />
              핵심 기능
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isGenerating && !form.watch('suggestedFeatures')?.length ? (
              <>
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {suggestedFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Checkbox
                      id={`feature-${index}`}
                      checked={selectedFeatures.includes(feature)}
                      onCheckedChange={() => toggleFeature(feature)}
                    />
                    <label
                      htmlFor={`feature-${index}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {feature}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Roles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className={guidedFormStyles.iconMedium} />
              사용자 역할
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isGenerating && !form.watch('suggestedRoles')?.length ? (
              <>
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {suggestedRoles.map((role, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Checkbox
                      id={`role-${index}`}
                      checked={selectedRoles.includes(role)}
                      onCheckedChange={() => toggleRole(role)}
                    />
                    <label
                      htmlFor={`role-${index}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {role}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center gap-2 text-sm text-muted-foreground">
        <Badge variant="secondary">{selectedFeatures.length}개 기능 선택됨</Badge>
        <Badge variant="secondary">{selectedRoles.length}개 역할 선택됨</Badge>
      </div>

      <AdditionalNotesField
        name="featuresNotes"
        placeholder="추가하거나 수정하고 싶은 특정 기능이나 역할..."
      />
    </div>
  )
}