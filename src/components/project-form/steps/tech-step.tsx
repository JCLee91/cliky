'use client'

import { useFormContext } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { ProjectFormData } from '@/types/project'
import { Check } from 'lucide-react'

export function TechStep() {
  const form = useFormContext<ProjectFormData>()
  const techPreferences = form.watch('techPreferences') || []

  // MVP에서 가장 인기 있는 순서로 정렬
  const techOptions = [
    { 
      category: 'Frontend', 
      items: ['Next.js', 'React', 'Vue.js', 'Svelte', 'Angular', 'Nuxt.js'] 
    },
    { 
      category: 'Backend', 
      items: ['Node.js', 'Python/FastAPI', 'Python/Django', 'Go', 'Java/Spring', 'C#/.NET', 'Rust'] 
    },
    { 
      category: 'Database', 
      items: ['Supabase', 'PostgreSQL', 'Firebase', 'MongoDB', 'MySQL', 'Redis'] 
    },
    { 
      category: 'Deployment', 
      items: ['Vercel', 'Netlify', 'Railway', 'AWS', 'Google Cloud', 'Azure'] 
    },
    { 
      category: 'Mobile', 
      items: ['React Native', 'Expo', 'Flutter', 'Swift', 'Kotlin'] 
    },
    { 
      category: 'AI/ML', 
      items: ['OpenAI API', 'Claude API', 'Vercel AI SDK', 'LangChain', 'Hugging Face', 'TensorFlow'] 
    }
  ]

  const toggleTech = (tech: string) => {
    const current = techPreferences || []
    const newPreferences = current.includes(tech)
      ? current.filter(t => t !== tech)
      : [...current, tech]
    form.setValue('techPreferences', newPreferences)
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Select your tech preferences</h3>
        <p className="text-muted-foreground">
          Select your preferred tech stack if you have any (optional)
        </p>
      </div>

      {/* Tips section */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">💡 Notes</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• AI will recommend an optimized tech stack even if you don&apos;t select any</li>
          <li>• Selecting too many technologies may increase complexity</li>
          <li>• Consider your team&apos;s experience and project scale when selecting</li>
        </ul>
      </div>

      <FormField
        control={form.control}
        name="techPreferences"
        render={() => (
          <FormItem>
            <FormLabel className="text-base">Preferred Tech Stack</FormLabel>
            <FormDescription>
              Select the technologies you&apos;d specifically like to use. If you don&apos;t select any, we&apos;ll recommend the best tech stack for your project.
            </FormDescription>
          </FormItem>
        )}
      />

      <div className="space-y-4">
        {techOptions.map((category) => (
          <div key={category.category} className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              {category.category}
            </h4>
            <div className="flex flex-wrap gap-2">
              {category.items.map((tech) => {
                const isSelected = techPreferences.includes(tech)
                return (
                  <button
                    key={tech}
                    type="button"
                    className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border transition-all duration-200 text-sm font-medium hover:scale-[1.02] active:scale-[0.98] ${
                      isSelected 
                        ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90' 
                        : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                    }`}
                    onClick={() => toggleTech(tech)}
                  >
                    {isSelected && <Check className="h-4 w-4" />}
                    {tech}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {techPreferences.length > 0 && (
        <div className="bg-primary/10 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Selected Tech Stack ({techPreferences.length})</h4>
          <div className="flex flex-wrap gap-2">
            {techPreferences.map((tech) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}