'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { ProgressBar } from './progress-bar'
import { IdeaStep } from './steps/idea-step'
import { FeaturesStep } from './steps/features-step'
import { FlowStep } from './steps/flow-step'
import { TechStep } from './steps/tech-step'
import { ProjectFormData } from '@/types/project'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ANIMATION_PRESETS } from '@/lib/animation-presets'

type FormData = z.infer<typeof projectFormSchema>

const projectFormSchema = z.object({
  name: z.string(),
  idea: z.string(),
  features: z.array(z.string()),
  userFlow: z.string(),
  techPreferences: z.array(z.string()).optional()
})

interface ProjectFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ProjectFormData) => Promise<void>
  loading?: boolean
}

const TOTAL_STEPS = 4

export function ProjectForm({ open, onOpenChange, onSubmit, loading = false }: ProjectFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formKey, setFormKey] = useState(0)
  
  const form = useForm<FormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: '',
      idea: '',
      features: [],
      userFlow: '',
      techPreferences: []
    }
  })

  const { watch, trigger } = form

  const handleNext = async () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
      setFormKey(prev => prev + 1) // Force re-render to prevent DOM conflicts
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setFormKey(prev => prev + 1) // Force re-render to prevent DOM conflicts
    }
  }

  const handleSubmit = async (data: FormData) => {
    const projectData: ProjectFormData = {
      name: data.name,
      idea: data.idea,
      features: data.features,
      userFlow: data.userFlow,
      techPreferences: data.techPreferences
    }
    await onSubmit(projectData)
    handleClose()
  }

  const handleClose = () => {
    // 부드러운 전환을 위해 약간의 지연 후 초기화
    onOpenChange(false)
    setTimeout(() => {
      setCurrentStep(1)
      form.reset()
    }, 300)
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <IdeaStep />
      case 2:
        return <FeaturesStep />
      case 3:
        return <FlowStep />
      case 4:
        return <TechStep />
      default:
        return null
    }
  }

  const canProceed = () => {
    const values = watch()
    
    switch (currentStep) {
      case 1:
        // Step 1: name과 idea가 모두 필요
        return values.name?.trim().length > 0 && values.idea?.trim().length > 0
      case 2:
        // Step 2: 최소 1개 이상의 feature 필요
        return values.features?.length > 0 && values.features.every(f => f.trim().length > 0)
      case 3:
        // Step 3: userFlow 필요
        return values.userFlow?.trim().length > 0
      case 4:
        // Step 4: 선택사항이므로 항상 진행 가능
        return true
      default:
        return false
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[95vh] p-0" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogTitle className="sr-only">새 프로젝트 만들기</DialogTitle>
        <DialogDescription className="sr-only">4단계 프로젝트 생성 마법사</DialogDescription>
        <Form {...form}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-lg font-semibold">새 프로젝트 만들기</h2>
              <p className="text-sm text-muted-foreground">
                단계 {currentStep} / {TOTAL_STEPS}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} className="mx-6" />

          {/* Content */}
          <div className="flex-1 overflow-auto p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentStep}-${formKey}`}
                {...ANIMATION_PRESETS.pageTransition}
                className="h-full"
                data-no-translate="true"
              >
                {renderCurrentStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                이전
              </Button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              {currentStep === TOTAL_STEPS ? (
                <Button
                  onClick={form.handleSubmit(handleSubmit)}
                  disabled={!canProceed() || loading}
                  className="gap-2"
                >
                  {loading ? '생성 중...' : '프로젝트 생성'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="gap-2"
                >
                  다음
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  )
}