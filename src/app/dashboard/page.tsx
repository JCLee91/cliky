'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { EmptyMessage } from '@/components/ui/empty-message'
import { ProjectForm } from '@/components/project-form'
import { GuidedProjectForm } from '@/components/guided-project-form'
import { PRDViewer } from '@/components/prd-viewer'
import { TaskCards } from '@/components/task-cards'
import { DeleteProjectDialog } from '@/components/delete-project-dialog'
import { ProjectMethodModal } from '@/components/project-method-modal'
import { useProject } from '@/hooks/use-project'
import { useAIStream } from '@/hooks/use-ai-stream'
import { useMCP } from '@/hooks/use-mcp'
import { useTaskStream } from '@/hooks/use-task-stream'
import { useProjectStore } from '@/store/project-store'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { ANIMATION_PRESETS } from '@/lib/animation-presets'

export default function DashboardPage() {
  const { createProject, updateProject, deleteProject } = useProject()
  const { selectedProject, setSelectedProject, isFormOpen, setIsFormOpen, fetchProjects, initializeProjects, setIsMethodModalOpen, creationMethod, setCreationMethod } = useProjectStore()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  const { 
    prdContent,
    isGenerating,
    generatePRD: generatePRDBase,
    reset
  } = useAIStream()

  const { 
    tasks, 
    fetchTasks, 
    updateTask, 
    deleteTask, 
    reorderTasks 
  } = useMCP()
  
  const {
    isGenerating: isGeneratingTasks,
    parsedTasks,
    isExpandingTasks,
    generateTasksStream,
    saveTasks: saveStreamedTasks
  } = useTaskStream({
    onSuccess: async (generatedTasks) => {
      if (selectedProject) {
        // Save tasks to database and use the returned data directly
        const savedTasks = await saveStreamedTasks(selectedProject.id, generatedTasks)
        // Update local state with saved tasks instead of fetching again
        setTasks(savedTasks)
      }
    }
  })

  const handleFormSuccess = async (formData: any) => {
    setIsFormOpen(false)
    setCreationMethod(null)
    
    try {
      // 1. Create project
      const project = await createProject(formData)
      if (!project) {
        throw new Error('Failed to create project')
      }
      
      // 2. Set as selected project
      setSelectedProject(project)
      
      // 2.5. Refresh project list in store
      await fetchProjects()
      
      // 3. Generate PRD with proper callback handling
      await new Promise<void>((resolve, reject) => {
        generatePRDBase(formData, {
          onSuccess: async (content: string) => {
            try {
              // 4. Update project with PRD content
              await updateProject(project.id, {
                trd_content: content,
                status: 'trd_generated'
              })
              // 5. Refresh project list to show updated status
              await fetchProjects()
              resolve()
            } catch (error) {
              reject(error)
            }
          },
          onError: (error: Error) => {
            reject(error)
          }
        })
      })
    } catch (error) {
      toast.error('프로젝트 설정을 완료하지 못했습니다')
    }
  }

  const handleGuidedFormSuccess = async (guidedData: any) => {
    setIsFormOpen(false)
    setCreationMethod(null)
    
    try {
      // Convert guided form data to standard project form data
      const productDescription = guidedData.productDescriptionChoice === 'A' 
        ? guidedData.productDescriptionOptionA 
        : guidedData.productDescriptionOptionB
      
      const userFlow = guidedData.userFlowChoice === 'A'
        ? guidedData.userFlowOptionA
        : guidedData.userFlowOptionB

      const formData = {
        name: guidedData.name,
        idea: `${guidedData.idea}\n\nProduct Description: ${productDescription}\n${guidedData.productDescriptionNotes ? `Additional Notes: ${guidedData.productDescriptionNotes}` : ''}`,
        features: guidedData.coreFeatures || [],
        userFlow: `${userFlow}\n${guidedData.userFlowNotes ? `Additional Notes: ${guidedData.userFlowNotes}` : ''}`,
        techPreferences: guidedData.techStack || []
      }
      
      // Add any additional notes to the idea
      if (guidedData.featuresNotes) {
        formData.idea += `\n\nFeature Notes: ${guidedData.featuresNotes}`
      }
      if (guidedData.techStackNotes) {
        formData.idea += `\n\nTech Stack Notes: ${guidedData.techStackNotes}`
      }
      
      // 1. Create project
      const project = await createProject(formData)
      if (!project) {
        throw new Error('Failed to create project')
      }
      
      // 2. Set as selected project
      setSelectedProject(project)
      
      // 2.5. Refresh project list in store
      await fetchProjects()
      
      // 3. Generate PRD with proper callback handling
      await new Promise<void>((resolve, reject) => {
        generatePRDBase(formData, {
          onSuccess: async (content: string) => {
            try {
              // 4. Update project with PRD content
              await updateProject(project.id, {
                trd_content: content,
                status: 'trd_generated'
              })
              // 5. Refresh project list to show updated status
              await fetchProjects()
              resolve()
            } catch (error) {
              reject(error)
            }
          },
          onError: (error: Error) => {
            reject(error)
          }
        })
      })
    } catch (error) {
      toast.error('프로젝트 설정을 완료하지 못했습니다')
    }
  }

  const handleNewProject = () => {
    setSelectedProject(null)
    reset()
    setIsMethodModalOpen(true)
  }

  const handleBreakdownToTasks = async () => {
    if (!selectedProject) return
    
    const prdContent = selectedProject.trd_content || ''
    if (!prdContent) {
      toast.error('분석할 PRD 내용이 없습니다')
      return
    }

    try {
      await generateTasksStream(selectedProject, prdContent)
    } catch (error) {
      // Error is already handled in generateTasksStream with toast notification
      // No need to show another toast here
    }
  }

  // Initialize projects on mount
  useEffect(() => {
    initializeProjects()
  }, [initializeProjects])

  // Fetch tasks when project is selected
  useEffect(() => {
    if (selectedProject?.id) {
      fetchTasks(selectedProject.id)
    }
  }, [selectedProject?.id, fetchTasks])

  const displayContent = selectedProject ? (selectedProject.trd_content || prdContent || '') : ''

  return (
    <div className="p-6 h-full">
      <AnimatePresence mode="wait">
        {selectedProject ? (
          <motion.div
            key={`project-${selectedProject.id}`} // 프로젝트 ID를 key로 사용
            {...ANIMATION_PRESETS.pageTransition}
            className="h-full"
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">{selectedProject.name}</h1>
                <p className="text-muted-foreground">
                  {selectedProject.status === 'trd_generated' ? 'PRD 생성됨' : 
                   selectedProject.status === 'generating' ? 'PRD 생성 중...' : 
                   '초안'}
                  {tasks.length > 0 && ` • 작업 ${tasks.length}개`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => setDeleteDialogOpen(true)} 
                  variant="outline" 
                  size="icon"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button onClick={handleNewProject} variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  새 프로젝트
                </Button>
              </div>
            </div>

            {/* Main Content - Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-[calc(100vh-180px)]">
              {/* PRD Viewer */}
              <PRDViewer
                content={displayContent}
                isGenerating={isGenerating}
                projectName={selectedProject.name}
              />

              {/* Task Cards */}
              <TaskCards
                tasks={isGeneratingTasks || isExpandingTasks 
                  ? (parsedTasks.length > 0 ? parsedTasks : tasks) 
                  : tasks}
                isLoading={isGeneratingTasks || isExpandingTasks}
                onTaskUpdate={updateTask}
                onTaskDelete={deleteTask}
                onTaskReorder={(taskIds) => reorderTasks(selectedProject.id, taskIds)}
                onBreakdownToTasks={handleBreakdownToTasks}
                showBreakdownButton={(!!displayContent || isGenerating) && !isGeneratingTasks && tasks.length === 0 && parsedTasks.length === 0}
                isPRDGenerating={isGenerating}
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
                    message="첫 프로젝트를 만들어보세요"
                    description="아이디어를 입력하면 AI가 PRD와 작업 목록을 생성합니다"
                    action={{
                      label: "새 프로젝트 만들기",
                      onClick: () => setIsMethodModalOpen(true)
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project Method Selection Modal */}
      <ProjectMethodModal />
      
      {/* Project Form Modal - Classic or Guided based on creationMethod */}
      {creationMethod === 'classic' ? (
        <ProjectForm
          open={isFormOpen}
          onOpenChange={(open) => {
            setIsFormOpen(open)
            if (!open) setCreationMethod(null)
          }}
          onSubmit={handleFormSuccess}
        />
      ) : (
        <GuidedProjectForm
          open={isFormOpen}
          onOpenChange={(open) => {
            setIsFormOpen(open)
            if (!open) setCreationMethod(null)
          }}
          onSubmit={handleGuidedFormSuccess}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      {selectedProject && (
        <DeleteProjectDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          projectName={selectedProject.name}
          onConfirm={async () => {
            await deleteProject(selectedProject.id)
            setDeleteDialogOpen(false)
          }}
        />
      )}
    </div>
  )
}