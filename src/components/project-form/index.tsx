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
    setCurrentStep(1)
    form.reset()
    onOpenChange(false)
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
    return true // 모든 단계에서 자유롭게 진행 가능
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[95vh] p-0" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogTitle className="sr-only">Create New Project</DialogTitle>
        <DialogDescription className="sr-only">4-step project creation wizard</DialogDescription>
        <Form {...form}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-lg font-semibold">Create New Project</h2>
              <p className="text-sm text-muted-foreground">
                Step {currentStep} of {TOTAL_STEPS}
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
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
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {currentStep === TOTAL_STEPS ? (
                <Button
                  onClick={form.handleSubmit(handleSubmit)}
                  disabled={!canProceed() || loading}
                  className="gap-2"
                >
                  {loading ? 'Creating...' : 'Create Project'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="gap-2"
                >
                  Next
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