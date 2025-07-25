'use client'

import { useProjectStore } from '@/store/project-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Plus, FileText } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface ProjectListProps {
  className?: string
  onNewProject?: () => void
}

export function ProjectList({ className, onNewProject }: ProjectListProps) {
  const { 
    projects, 
    selectedProject, 
    setSelectedProject, 
    setIsFormOpen,
    isLoading,
    hasInitialized
  } = useProjectStore()

  // Show skeleton during initial load
  if (!hasInitialized && projects.length === 0) {
    return (
      <div className={cn('space-y-2', className)}>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 h-auto p-3"
          disabled
        >
          <Plus className="h-4 w-4" />
          새 프로젝트
        </Button>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Button
        variant="outline"
        className="w-full justify-start gap-2 h-auto p-3"
        onClick={() => {
          setSelectedProject(null)
          setIsFormOpen(true)
        }}
      >
        <Plus className="h-4 w-4" />
        새 프로젝트
      </Button>

      {projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <FileText className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              아직 프로젝트가 없습니다
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-1">
          {projects.map((project) => (
            <Button
              key={project.id}
              variant={selectedProject?.id === project.id ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-2 h-auto p-3"
              onClick={() => setSelectedProject(project)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FileText className="h-4 w-4 shrink-0" />
                <span className="truncate font-medium text-sm">
                  {project.name}
                </span>
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}