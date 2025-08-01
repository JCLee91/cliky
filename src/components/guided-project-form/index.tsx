'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { ProgressBar } from '../project-form/progress-bar'
import { IdeaStep } from './steps/idea-step'
import { ProductDescriptionStep } from './steps/product-description-step'
import { UserFlowStep } from './steps/user-flow-step'
import { TechStackTableStep } from './steps/tech-stack-table-step'
import { GuidedProjectFormData } from '@/types/project'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ANIMATION_PRESETS } from '@/lib/animation-presets'
import { guidedFormStyles } from './styles/common-styles'
import { useProjectStore } from '@/store/project-store'

type FormData = z.infer<typeof guidedProjectFormSchema>

const guidedProjectFormSchema = z.object({
  name: z.string().min(1, '프로젝트 이름을 입력해주세요'),
  idea: z.string().min(1, '프로젝트 아이디어를 입력해주세요').max(300, '3줄 이내로 작성해주세요'),
  productDescriptionChoice: z.enum(['A', 'B']).optional(),
  productDescriptionOptionA: z.string().optional(),
  productDescriptionOptionB: z.string().optional(),
  productDescriptionNotes: z.string().optional(),
  userFlowChoice: z.enum(['A', 'B']).optional(),
  userFlowOptionA: z.string().optional(),
  userFlowOptionB: z.string().optional(),
  userFlowNotes: z.string().optional(),
  techStack: z.array(z.string()).optional(),
  techStackNotes: z.string().optional()
})

interface GuidedProjectFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: GuidedProjectFormData) => Promise<void>
  loading?: boolean
}

const TOTAL_STEPS = 4

export function GuidedProjectForm({ open, onOpenChange, onSubmit, loading = false }: GuidedProjectFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const { setIsFormOpen, setIsMethodModalOpen } = useProjectStore()
  
  const form = useForm<FormData>({
    resolver: zodResolver(guidedProjectFormSchema),
    defaultValues: {
      name: '',
      idea: '',
      productDescriptionChoice: undefined,
      productDescriptionOptionA: '',
      productDescriptionOptionB: '',
      productDescriptionNotes: '',
      userFlowChoice: undefined,
      userFlowOptionA: '',
      userFlowOptionB: '',
      userFlowNotes: '',
      techStack: [],
      techStackNotes: ''
    }
  })

  const { watch } = form

  const handleNext = async () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep === 1) {
      // Go back to project method selection
      onOpenChange(false)
      setIsFormOpen(false)
      setIsMethodModalOpen(true)
    } else {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (data: FormData) => {
    // 필수 선택 항목 검증
    if (!data.productDescriptionChoice || !data.userFlowChoice) {
      console.error('필수 선택 항목이 누락되었습니다')
      return
    }
    
    const guidedData: GuidedProjectFormData = {
      name: data.name,
      idea: data.idea,
      productDescriptionChoice: data.productDescriptionChoice,
      productDescriptionOptionA: data.productDescriptionOptionA,
      productDescriptionOptionB: data.productDescriptionOptionB,
      productDescriptionNotes: data.productDescriptionNotes,
      userFlowChoice: data.userFlowChoice,
      userFlowOptionA: data.userFlowOptionA,
      userFlowOptionB: data.userFlowOptionB,
      userFlowNotes: data.userFlowNotes,
      coreFeatures: data.coreFeatures,
      roles: data.roles,
      featuresNotes: data.featuresNotes,
      techStack: data.techStack,
      techStackNotes: data.techStackNotes
    }
    await onSubmit(guidedData)
    handleClose()
  }

  const handleClose = () => {
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
        return <ProductDescriptionStep />
      case 3:
        return <UserFlowStep />
      case 4:
        return <TechStackTableStep />
      default:
        return null
    }
  }

  const canProceed = () => {
    const values = watch()
    
    switch (currentStep) {
      case 1:
        return values.name?.trim().length > 0 && values.idea?.trim().length > 0
      case 2:
        // Check if AI options are generated and a choice is made
        return values.productDescriptionOptionA && values.productDescriptionOptionB && !!values.productDescriptionChoice
      case 3:
        // Check if AI options are generated and a choice is made
        return values.userFlowOptionA && values.userFlowOptionB && !!values.userFlowChoice
      case 4:
        return true // Tech stack is auto-generated
      default:
        return false
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[95vh] p-0" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogTitle className="sr-only">새 프로젝트 만들기 - 가이드 모드</DialogTitle>
        <DialogDescription className="sr-only">5단계 AI 가이드 프로젝트 생성 마법사</DialogDescription>
        <Form {...form}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-lg font-semibold">새 프로젝트 만들기</h2>
              <p className="text-sm text-muted-foreground">
                AI 가이드 모드 • 단계 {currentStep} / {TOTAL_STEPS}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} className="mx-6" />

          {/* Content */}
          <div className="flex-1 overflow-auto p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
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
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={false}
              className="gap-2"
            >
              <ChevronLeft className={guidedFormStyles.iconSmall} />
              이전
            </Button>

            <div className="flex gap-2">
              {currentStep === TOTAL_STEPS ? (
                <Button
                  onClick={form.handleSubmit(handleSubmit)}
                  disabled={!canProceed() || loading}
                  className="gap-2"
                >
                  {loading ? '생성 중...' : '프로젝트 시작하기'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="gap-2"
                >
                  다음
                  <ChevronRight className={guidedFormStyles.iconSmall} />
                </Button>
              )}
            </div>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  )
}