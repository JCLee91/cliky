'use client'

import { useFormContext } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ProjectFormData } from '@/types/project'

export function IdeaStep() {
  const form = useFormContext<ProjectFormData>()
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Tell us about your project idea</h3>
        <p className="text-muted-foreground">
          What would you like to build? The more details you provide, the better PRD we can generate.
        </p>
      </div>

      {/* Tips section */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">💡 Tips</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Be specific about the problem you&apos;re solving</li>
          <li>• Mention your target users and their pain points</li>
          <li>• Include any unique value proposition or differentiators</li>
          <li>• Don&apos;t worry about technical details yet - focus on the &quot;what&quot; and &quot;why&quot;</li>
        </ul>
      </div>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Project Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Online Marketplace, Blog Platform, Task Management App"
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
              <FormLabel className="text-base">Project Idea</FormLabel>
              <FormDescription>
                Describe the purpose, problem to solve, and target users
              </FormDescription>
              <FormControl>
                <Textarea
                  placeholder="e.g., I want to create an e-commerce platform where users can easily shop online. It needs product search, cart, payment, and order management features. Admins should be able to manage products and orders..."
                  className="min-h-32 text-base resize-none"
                  autoComplete="off"
                  data-no-translate="true"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}