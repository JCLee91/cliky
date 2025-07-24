'use client'

import { useFormContext } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'

interface AdditionalNotesFieldProps {
  name: string
  label?: string
  placeholder: string
}

export function AdditionalNotesField({ 
  name, 
  label = 'Additional Notes (Optional)', 
  placeholder 
}: AdditionalNotesFieldProps) {
  const form = useFormContext()
  
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              placeholder={placeholder}
              className="min-h-20 resize-none"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}