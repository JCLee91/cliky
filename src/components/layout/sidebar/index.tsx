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
import Link from 'next/link'

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
                <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                  <Logo variant="full" width={100} height={28} />
                </Link>
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
      <div className="relative flex h-16 items-center justify-center px-4">
        {!isCollapsed ? (
          <>
            <Link href="/dashboard" className="flex items-center">
              <Logo variant="full" width={120} height={32} className="-ml-4 -mt-1" />
            </Link>
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