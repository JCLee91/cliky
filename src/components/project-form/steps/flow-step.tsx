'use client'

import { useFormContext } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { ProjectFormData } from '@/types/project'

export function FlowStep() {
  const form = useFormContext<ProjectFormData>()
  const userFlow = form.watch('userFlow')

  const exampleFlow = `Example:
1. User visits the website
2. Sign up or log in
3. Browse product categories or search
4. View product detail page
5. Add to shopping cart
6. Go to checkout page
7. Enter shipping information
8. Complete payment
9. Receive order confirmation email`

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Describe the user flow</h3>
        <p className="text-muted-foreground">
          Explain step by step how users will use your app
        </p>
      </div>

      {/* Tips section */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">💡 Tips</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Include user goals and motivations</li>
          <li>• Describe specific actions users take at each step</li>
          <li>• Consider exception cases or alternative paths</li>
          <li>• Ensure core features are integrated into the flow</li>
        </ul>
      </div>

      <FormField
        control={form.control}
        name="userFlow"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">User Flow</FormLabel>
            <FormDescription>
              Write the complete flow of how users will interact with your project step by step
            </FormDescription>
            <FormControl>
              <Textarea
                placeholder={exampleFlow}
                className="min-h-40 text-base resize-none"
                autoComplete="off"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}