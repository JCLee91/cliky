'use client'

import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { GuidedProjectFormData } from '@/types/project'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Code2, Database, Layout, Settings } from 'lucide-react'
import { useAIGeneration } from '@/hooks/use-ai-generation'
import { AdditionalNotesField } from '../components/additional-notes-field'
import { StepHeader } from '../components/step-header'
import { guidedFormStyles } from '../styles/common-styles'

interface TechCategory {
  name: string
  icon: React.ReactNode
  items: string[]
}

export function TechStackStep() {
  const form = useFormContext<GuidedProjectFormData>()
  const [techCategories, setTechCategories] = useState<TechCategory[]>([])
  
  const name = form.watch('name')
  const idea = form.watch('idea')
  const productDescriptionChoice = form.watch('productDescriptionChoice')
  const userFlowChoice = form.watch('userFlowChoice')
  const coreFeatures = form.watch('coreFeatures') || []
  const featuresNotes = form.watch('featuresNotes')
  
  const selectedTech = form.watch('techStack') || []
  
  const { generate, hasGenerated, isGenerating } = useAIGeneration({
    endpoint: '/api/guided-form/generate',
    onSuccess: (data) => {
      // Organize tech stack into categories
      const categories: TechCategory[] = [
        {
          name: 'Frontend',
          icon: <Layout className={guidedFormStyles.iconSmall} />,
          items: data.frontend || []
        },
        {
          name: 'Backend',
          icon: <Code2 className={guidedFormStyles.iconSmall} />,
          items: data.backend || []
        },
        {
          name: 'Database',
          icon: <Database className={guidedFormStyles.iconSmall} />,
          items: data.database || []
        },
        {
          name: 'Infrastructure',
          icon: <Settings className={guidedFormStyles.iconSmall} />,
          items: data.infrastructure || []
        }
      ]
      
      setTechCategories(categories)
      
      // Pre-select all recommended tech
      const allTech = categories.flatMap(cat => cat.items)
      form.setValue('techStack', allTech)
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
        type: 'tech-stack',
        data: {
          name, 
          idea,
          productDescription: selectedDescription,
          userFlow: selectedFlow,
          coreFeatures,
          featuresNotes
        }
      })
    }
  }, [name, idea, productDescriptionChoice, userFlowChoice, hasGenerated, generate])

  const toggleTech = (tech: string) => {
    const current = form.getValues('techStack') || []
    if (current.includes(tech)) {
      form.setValue('techStack', current.filter(t => t !== tech))
    } else {
      form.setValue('techStack', [...current, tech])
    }
  }

  return (
    <div className={guidedFormStyles.stepContainer}>
      <StepHeader
        title="Recommended Tech Stack"
        description="Based on your project requirements, here's our recommended technology stack."
      />

      {isGenerating && !techCategories.length ? (
        <div className={guidedFormStyles.gridTwoColumn}>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className={guidedFormStyles.gridTwoColumn}>
          {techCategories.map((category, categoryIndex) => (
            <Card key={categoryIndex}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {category.icon}
                  {category.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {category.items.map((tech, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Checkbox
                        id={`tech-${categoryIndex}-${index}`}
                        checked={selectedTech.includes(tech)}
                        onCheckedChange={() => toggleTech(tech)}
                      />
                      <label
                        htmlFor={`tech-${categoryIndex}-${index}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {tech}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-center">
        <Badge variant="secondary">{selectedTech.length} technologies selected</Badge>
      </div>

      <AdditionalNotesField
        name="techStackNotes"
        placeholder="Any specific technology preferences or constraints..."
      />

      <div className={guidedFormStyles.infoBox}>
        <p className={guidedFormStyles.mutedSmall}>
          <strong>Note:</strong> These recommendations are based on current best practices and your project requirements. 
          You can modify the selection based on your team's expertise and preferences.
        </p>
      </div>
    </div>
  )
}