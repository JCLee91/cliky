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
    const getUser = async () => {
      console.log('[UserMenu] Fetching user...')
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      console.log('[UserMenu] User fetch result:', { 
        hasUser: !!user, 
        userId: user?.id,
        email: user?.email,
        error: userError 
      })
      
      if (user) {
        // Fetch profile from profiles table
        console.log('[UserMenu] Fetching profile for user:', user.id)
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
          
        console.log('[UserMenu] Profile fetch result:', { 
          hasProfile: !!profile, 
          profileData: profile,
          error: profileError 
        })

        if (profile) {
          // Merge profile data with user data
          const mergedUser = {
            ...user,
            user_metadata: {
              ...user.user_metadata,
              full_name: profile.full_name || user.user_metadata?.full_name,
              avatar_url: profile.avatar_url || user.user_metadata?.avatar_url
            }
          }
          console.log('[UserMenu] Setting merged user data')
          setUser(mergedUser)
        } else {
          console.log('[UserMenu] No profile found, using auth user data')
          setUser(user)
        }
      } else {
        console.log('[UserMenu] No user found')
      }
    }
    getUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Fetch profile from profiles table on auth change
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profile) {
            setUser({
              ...session.user,
              user_metadata: {
                ...session.user.user_metadata,
                full_name: profile.full_name || session.user.user_metadata?.full_name,
                avatar_url: profile.avatar_url || session.user.user_metadata?.avatar_url
              }
            })
          } else {
            setUser(session.user)
          }
        }
      }
    )

    // Listen for profile updates
    const handleProfileUpdate = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

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
      }
    }

    window.addEventListener('userProfileUpdated', handleProfileUpdate)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('userProfileUpdated', handleProfileUpdate)
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const getUserInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase()
  }

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
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
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
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}