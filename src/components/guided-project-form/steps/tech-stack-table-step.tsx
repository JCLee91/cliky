'use client'

import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { GuidedProjectFormData } from '@/types/project'
import { useAIGeneration } from '@/hooks/use-ai-generation'
import { AdditionalNotesField } from '../components/additional-notes-field'
import { StepHeader } from '../components/step-header'
import { guidedFormStyles } from '../styles/common-styles'

interface TechStackItem {
  category: string
  technology: string
  reasoning: string
}

export function TechStackTableStep() {
  const form = useFormContext<GuidedProjectFormData>()
  const [techStackItems, setTechStackItems] = useState<TechStackItem[]>([])
  
  const name = form.watch('name')
  const idea = form.watch('idea')
  const productDescriptionChoice = form.watch('productDescriptionChoice')
  const userFlowChoice = form.watch('userFlowChoice')
  
  const { generate, isGenerating } = useAIGeneration({
    endpoint: '/api/guided-form/generate',
    onSuccess: (data) => {
      // Transform the tech stack data into table format
      const items: TechStackItem[] = []
      
      if (data.frontend?.length) {
        data.frontend.forEach((tech: string) => {
          items.push({
            category: '프론트엔드',
            technology: tech,
            reasoning: '모던 웹 개발에 최적화'
          })
        })
      }
      
      if (data.backend?.length) {
        data.backend.forEach((tech: string) => {
          items.push({
            category: '백엔드',
            technology: tech,
            reasoning: '안정적이고 확장 가능한 서버 구축'
          })
        })
      }
      
      if (data.database?.length) {
        data.database.forEach((tech: string) => {
          items.push({
            category: '데이터베이스',
            technology: tech,
            reasoning: '효율적인 데이터 관리'
          })
        })
      }
      
      if (data.infrastructure?.length) {
        data.infrastructure.forEach((tech: string) => {
          items.push({
            category: '인프라',
            technology: tech,
            reasoning: '배포 및 운영 최적화'
          })
        })
      }
      
      setTechStackItems(items)
      
      // Also save all tech items for form submission
      const allTech = items.map(item => item.technology)
      form.setValue('techStack', allTech)
    },
    enabled: true
  })
  
  const existingTechStack = form.watch('techStack')
  
  useEffect(() => {
    // 이미 생성된 데이터가 있거나 생성 중이면 생성하지 않음
    if ((existingTechStack && existingTechStack.length > 0) || isGenerating || techStackItems.length > 0) {
      return
    }
    
    if (name && idea && productDescriptionChoice && userFlowChoice && !isGenerating) {
      console.log('Triggering AI generation for tech stack')
      const selectedDescription = productDescriptionChoice === 'A' 
        ? form.getValues('productDescriptionOptionA')
        : form.getValues('productDescriptionOptionB')
      
      const selectedFlow = userFlowChoice === 'A'
        ? form.getValues('userFlowOptionA')
        : form.getValues('userFlowOptionB')
      
      generate({ 
        type: 'tech-stack',
        data: {
          name, 
          idea,
          productDescription: selectedDescription,
          userFlow: selectedFlow
        }
      })
    }
  }, [name, idea, productDescriptionChoice, userFlowChoice, isGenerating, generate, techStackItems.length])

  return (
    <div className={guidedFormStyles.stepContainer}>
      <StepHeader
        title="기술 스택 확인"
        description="프로젝트 구현에 필요한 기술들을 정리했어요."
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">카테고리</TableHead>
              <TableHead>기술 / 라이브러리</TableHead>
              <TableHead className="w-[300px]">선택 이유</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isGenerating && !techStackItems.length ? (
              // Loading skeleton
              <>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : (
              techStackItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.category}</TableCell>
                  <TableCell>
                    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                      {item.technology}
                    </code>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.reasoning}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center">
        <Badge variant="secondary">{techStackItems.length}개 기술 추천됨</Badge>
      </div>

      <AdditionalNotesField
        name="techStackNotes"
        placeholder="선호하는 기술이나 피하고 싶은 기술이 있나요?"
      />

      <div className={guidedFormStyles.infoBox}>
        <p className={guidedFormStyles.mutedSmall}>
          <strong>참고:</strong> 이 추천은 현재 베스트 프랙티스와 프로젝트 요구 사항을 기반으로 합니다. 
          팀의 전문 지식과 선호도에 따라 조정할 수 있습니다.
        </p>
      </div>
    </div>
  )
}