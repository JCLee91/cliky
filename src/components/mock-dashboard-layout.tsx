'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Logo } from '@/components/ui/logo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PanelLeftClose, PanelLeftOpen, Check, Plus } from 'lucide-react'
import { mockProjects, mockUser } from '@/lib/mock-data'

interface MockDashboardLayoutProps {
  children: React.ReactNode
  selectedProject: any
  onProjectSelect: (project: any) => void
}

export function MockDashboardLayout({ children, selectedProject, onProjectSelect }: MockDashboardLayoutProps) {
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const handleInteraction = () => {
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex h-full w-56 flex-col',
          'bg-background border-r transition-all duration-300',
          isCollapsed && 'w-16'
        )}
      >
        {/* Header */}
        <div className="relative flex h-16 items-center justify-center px-4">
          {!isCollapsed ? (
            <>
              <div onClick={handleInteraction} className="flex items-center cursor-pointer">
                <Logo variant="full" width={120} height={32} className="-ml-4 -mt-1" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 absolute right-4"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Separator />

        {/* Navigation */}
        <div className="flex-1 overflow-auto p-4">
          {!isCollapsed && (
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  Projects
                </h3>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 h-auto p-3 mb-2"
                  onClick={handleInteraction}
                >
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
                <div className="space-y-1">
                  {mockProjects.map((project) => (
                    <Button
                      key={project.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-left h-auto py-2 px-2",
                        selectedProject?.id === project.id && "bg-accent"
                      )}
                      onClick={() => onProjectSelect(project)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        {selectedProject?.id === project.id && (
                          <Check className="h-3 w-3 shrink-0" />
                        )}
                        <span className="truncate text-sm">{project.name}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full h-auto p-2 justify-start gap-2",
              isCollapsed && "justify-center"
            )}
            onClick={handleInteraction}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={mockUser.avatar_url} />
              <AvatarFallback>
                {mockUser.email.split('@')[0].substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex flex-col items-start text-sm overflow-hidden">
                <div className="font-medium truncate max-w-full">
                  {mockUser.full_name}
                </div>
                <div className="text-xs text-muted-foreground truncate max-w-full">
                  {mockUser.email}
                </div>
              </div>
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  )
}