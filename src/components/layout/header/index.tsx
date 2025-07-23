'use client'

import { Button } from '@/components/ui/button'
import { Menu, Search } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onMenuClick?: () => void
  className?: string
}

export function Header({ onMenuClick, className }: HeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      <div className="container flex h-16 items-center gap-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 px-0 lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Search */}
        <div className="flex-1 flex items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search projects..."
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 pl-9 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}