'use client'

import { useFormContext } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { GuidedProjectFormData } from '@/types/project'
import { StepHeader } from '../components/step-header'
import { guidedFormStyles } from '../styles/common-styles'

export function IdeaStep() {
  const form = useFormContext<GuidedProjectFormData>()
  const watchIdea = form.watch('idea')
  
  // Count lines (newlines + 1)
  const lineCount = watchIdea ? watchIdea.split('\n').length : 0
  const charCount = watchIdea ? watchIdea.length : 0
  
  return (
    <div className={guidedFormStyles.stepContainer}>
      <StepHeader
        title="What's your project idea?"
        description="Start with a simple overview. AI will help you expand on it in the next steps."
      />

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Project Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., TaskFlow, ShopEasy, BlogHub"
                  className="text-base"
                  autoComplete="off"
                  data-no-translate="true"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="idea"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Brief Description</FormLabel>
              <FormDescription className="flex items-center justify-between">
                <span>Describe your project in 3 lines or less</span>
                <span className={lineCount > 3 || charCount > 300 ? 'text-destructive' : 'text-muted-foreground'}>
                  {lineCount}/3 lines • {charCount}/300 chars
                </span>
              </FormDescription>
              <FormControl>
                <Textarea
                  placeholder="e.g., A task management app for remote teams that helps track projects and deadlines. It should have real-time collaboration features and integrate with popular tools like Slack."
                  className={guidedFormStyles.textareaLarge}
                  autoComplete="off"
                  data-no-translate="true"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value
                    const lines = value.split('\n')
                    
                    // Limit to 3 lines and 300 characters
                    if (lines.length <= 3 && value.length <= 300) {
                      field.onChange(value)
                    } else if (lines.length > 3) {
                      // Keep only first 3 lines
                      const truncated = lines.slice(0, 3).join('\n')
                      field.onChange(truncated.substring(0, 300))
                    } else if (value.length > 300) {
                      // Keep only first 300 chars
                      field.onChange(value.substring(0, 300))
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Tips section */}
      <div className={guidedFormStyles.infoBox}>
        <h4 className="font-medium mb-2">💡 Keep it simple</h4>
        <p className={guidedFormStyles.mutedSmall}>
          Just give us the basic idea. AI will help you develop detailed product descriptions, 
          user flows, and features in the following steps.
        </p>
      </div>
    </div>
  )
}