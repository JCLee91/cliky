'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Sparkles } from 'lucide-react'
import { EmptyMessage } from '@/components/ui/empty-message'
import { MockPRDViewer } from '@/components/mock-prd-viewer'
import { MockTaskCards } from '@/components/mock-task-cards'
import { MockDashboardLayout } from '@/components/mock-dashboard-layout'
import { motion, AnimatePresence } from 'framer-motion'
import { ANIMATION_PRESETS } from '@/lib/animation-presets'
import { mockProjects, mockTasks } from '@/lib/mock-data'
import { OnboardingHint } from '@/components/onboarding-hint'

export default function MockDashboard() {
  const router = useRouter()
  const [selectedProject, setSelectedProject] = useState<any>(null)
  
  const handleInteraction = () => {
    router.push('/login')
  }

  const currentTasks = selectedProject ? mockTasks[selectedProject.id] || [] : []

  return (
    <MockDashboardLayout 
      selectedProject={selectedProject}
      onProjectSelect={setSelectedProject}
    >
      <div className="p-6 h-full relative">
        <AnimatePresence mode="wait">
          {selectedProject ? (
            <motion.div
              key={`project-${selectedProject.id}`}
              {...ANIMATION_PRESETS.pageTransition}
              className="h-full"
            >
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{selectedProject.name}</h1>
                  <p className="text-muted-foreground">
                    PRD 생성됨 • 작업 {currentTasks.length}개
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={handleInteraction} 
                    variant="outline" 
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    새 프로젝트
                  </Button>
                </div>
              </div>

              {/* Main Content - Split View */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-[calc(100vh-180px)]">
                {/* PRD Viewer */}
                <MockPRDViewer
                  content={selectedProject.trd_content}
                  projectName={selectedProject.name}
                />

                {/* Task Cards */}
                <MockTaskCards
                  tasks={currentTasks}
                  projectName={selectedProject.name}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              {...ANIMATION_PRESETS.pageTransition}
            >
              {/* Welcome Section */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">대시보드</h1>
                <p className="text-muted-foreground">
                  AI로 프로젝트 아이디어를 PRD와 작업 목록으로 변환하세요
                </p>
              </div>

              {/* Empty State */}
              <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md w-full">
                  <CardContent className="pt-6">
                    <EmptyMessage
                      icon={Sparkles}
                      message="첫 프로젝트를 만들어보세요"
                      description="아이디어를 입력하면 AI가 PRD와 작업 목록을 생성합니다"
                      action={{
                        label: "프로젝트 시작하기",
                        onClick: handleInteraction
                      }}
                    />
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Onboarding Hint for New Project button */}
        {selectedProject && (
          <OnboardingHint
            direction="right"
            message="당신의 아이디어로 시도해보세요!"
            targetPosition={{ 
              top: '35px', 
              right: '200px' 
            }}
          />
        )}
      </div>
    </MockDashboardLayout>
  )
}
