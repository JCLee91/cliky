'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut, User, Settings } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

interface UserMenuProps {
  collapsed?: boolean
}

export function UserMenu({ collapsed = false }: UserMenuProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Simple direct fetch
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        // Try to get profile, but don't wait for it
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              setUser({
                ...user,
                user_metadata: {
                  ...user.user_metadata,
                  full_name: profile.full_name || user.user_metadata?.full_name,
                  avatar_url: profile.avatar_url || user.user_metadata?.avatar_url
                }
              })
            } else {
              setUser(user)
            }
          })
      }
    })

    // Listen for profile updates only
    const handleProfileUpdate = () => {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
            .then(({ data: profile }) => {
              if (profile) {
                setUser({
                  ...user,
                  user_metadata: {
                    ...user.user_metadata,
                    full_name: profile.full_name || user.user_metadata?.full_name,
                    avatar_url: profile.avatar_url || user.user_metadata?.avatar_url
                  }
                })
              }
            })
        }
      })
    }

    window.addEventListener('userProfileUpdated', handleProfileUpdate)
    return () => window.removeEventListener('userProfileUpdated', handleProfileUpdate)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    // Clear cache on logout
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cliky_projects')
    }
    router.push('/login')
  }

  const getUserInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase()
  }

  // Simply show nothing while loading - cleaner than skeleton
  if (!user) return null

  if (collapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback>
                {getUserInitials(user.email)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>내 계정</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
            <User className="mr-2 h-4 w-4" />
            프로필
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            설정
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            로그아웃
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full h-auto p-2 justify-start gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback>
              {getUserInitials(user.email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-sm overflow-hidden">
            <div className="font-medium truncate max-w-full">
              {user.user_metadata?.full_name || user.email.split('@')[0]}
            </div>
            <div className="text-xs text-muted-foreground truncate max-w-full">
              {user.email}
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>내 계정</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
          <User className="mr-2 h-4 w-4" />
          프로필
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}