'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ProjectList } from './project-list'
import { UserMenu } from './user-menu'
import { PanelLeftClose, PanelLeftOpen, Menu } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-media-query'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Logo } from '@/components/ui/logo'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useIsMobile()

  // Mobile Sidebar
  if (isMobile) {
    return (
      <>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed left-4 top-4 z-40 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-56 p-0">
            <SheetHeader className="px-4 py-4">
              <SheetTitle className="flex items-center gap-2">
                <Logo variant="full" width={100} height={28} />
              </SheetTitle>
            </SheetHeader>
            <Separator />
            <div className="flex-1 overflow-auto p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                    Projects
                  </h3>
                  <ProjectList />
                </div>
              </div>
            </div>
            <div className="border-t p-4">
              <UserMenu collapsed={false} />
            </div>
          </SheetContent>
        </Sheet>
      </>
    )
  }

  // Desktop Sidebar
  return (
    <aside
      className={cn(
        'flex h-full w-56 flex-col',
        'bg-background border-r transition-all duration-300',
        isCollapsed && 'w-16',
        className
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center px-4">
        {!isCollapsed ? (
          <div className="flex items-center justify-between w-full">
            <Logo variant="full" width={120} height={32} />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 w-full">
            <Logo variant="symbol" width={32} height={32} />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          </div>
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
              <ProjectList />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t p-4">
        <UserMenu collapsed={isCollapsed} />
      </div>
    </aside>
  )
}