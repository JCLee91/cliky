/**
 * Common style patterns for guided project form components
 * Only includes patterns used multiple times to avoid redundancy
 */

export const guidedFormStyles = {
  // Consistent spacing for all step containers
  stepContainer: 'space-y-6',
  
  // Two-column grid layouts
  gridTwoColumn: 'grid grid-cols-2 gap-4',
  gridTwoColumnLarge: 'grid grid-cols-2 gap-6',
  
  // Icon sizes used across components
  iconSmall: 'h-4 w-4',
  iconMedium: 'h-5 w-5',
  
  // Info/tip box pattern
  infoBox: 'bg-muted/50 p-4 rounded-lg',
  
  // Common text combinations
  mutedSmall: 'text-sm text-muted-foreground',
  
  // Form textarea preset
  textarea: 'min-h-20 resize-none',
  textareaLarge: 'min-h-24 text-base resize-none'
} as const