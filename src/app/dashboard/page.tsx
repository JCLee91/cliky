'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Sparkles, Trash2 } from 'lucide-react'
import { EmptyMessage } from '@/components/ui/empty-message'
import { ProjectForm } from '@/components/project-form'
import { PRDViewer } from '@/components/prd-viewer'
import { TaskCards } from '@/components/task-cards'
import { DeleteProjectDialog } from '@/components/delete-project-dialog'
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
  const { selectedProject, setSelectedProject, isFormOpen, setIsFormOpen, fetchProjects, initializeProjects } = useProjectStore()
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
    expandingTaskIds,
    generateTasksStream,
    saveTasks: saveStreamedTasks
  } = useTaskStream({
    onSuccess: async (generatedTasks) => {
      if (selectedProject) {
        // Save tasks to database
        const savedTasks = await saveStreamedTasks(selectedProject.id, generatedTasks)
        // Fetch to update local state
        await fetchTasks(selectedProject.id)
      }
    }
  })

  const handleFormSuccess = async (formData: any) => {
    setIsFormOpen(false)
    
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
      toast.error('Failed to complete project setup')
    }
  }

  const handleNewProject = () => {
    setSelectedProject(null)
    reset()
    setIsFormOpen(true)
  }

  const handleBreakdownToTasks = async () => {
    if (!selectedProject) return
    
    const prdContent = selectedProject.trd_content || ''
    if (!prdContent) {
      toast.error('No PRD content to analyze')
      return
    }

    try {
      await generateTasksStream(selectedProject, prdContent)
    } catch (error) {
      console.error('handleBreakdownToTasks error:', error)
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
                  {selectedProject.status === 'trd_generated' ? 'PRD generated' : 
                   selectedProject.status === 'generating' ? 'Generating PRD...' : 
                   'Draft'}
                  {tasks.length > 0 && ` • ${tasks.length} tasks`}
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
                  New Project
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
              <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">
                Transform your project ideas into PRDs and task lists with AI
              </p>
            </div>

            {/* Empty State */}
            <div className="flex items-center justify-center min-h-[60vh]">
              <Card className="max-w-md w-full">
                <CardContent className="pt-6">
                  <EmptyMessage
                    icon={Sparkles}
                    message="Create your first project"
                    description="Enter your idea and AI will generate a PRD and task list"
                    action={{
                      label: "Create New Project",
                      onClick: () => setIsFormOpen(true)
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project Form Modal */}
      <ProjectForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSuccess}
      />
      
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