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
      category: '프론트엔드', 
      items: ['Next.js', 'React', 'Vue.js', 'Svelte', 'Angular', 'Nuxt.js'] 
    },
    { 
      category: '백엔드', 
      items: ['Node.js', 'Python/FastAPI', 'Python/Django', 'Go', 'Java/Spring', 'C#/.NET', 'Rust'] 
    },
    { 
      category: '데이터베이스', 
      items: ['Supabase', 'PostgreSQL', 'Firebase', 'MongoDB', 'MySQL', 'Redis'] 
    },
    { 
      category: '배포', 
      items: ['Vercel', 'Netlify', 'Railway', 'AWS', 'Google Cloud', 'Azure'] 
    },
    { 
      category: '모바일', 
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
        <h3 className="text-xl font-semibold">기술 스택을 선택해주세요</h3>
        <p className="text-muted-foreground">
          선호하는 기술 스택이 있다면 선택해주세요 (선택사항)
        </p>
      </div>

      {/* Tips section */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">💡 참고사항</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• 아무것도 선택하지 않아도 AI가 최적화된 기술 스택을 추천해드립니다</li>
          <li>• 너무 많은 기술을 선택하면 복잡도가 높아질 수 있습니다</li>
          <li>• 팀의 경험과 프로젝트 규모를 고려하여 선택하세요</li>
        </ul>
      </div>

      <FormField
        control={form.control}
        name="techPreferences"
        render={() => (
          <FormItem>
            <FormLabel className="text-base">선호 기술 스택</FormLabel>
            <FormDescription>
              특별히 사용하고 싶은 기술을 선택해주세요. 선택하지 않으면 프로젝트에 가장 적합한 기술 스택을 추천해드립니다.
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
          <h4 className="font-medium mb-2">선택한 기술 스택 ({techPreferences.length})</h4>
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