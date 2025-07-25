'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { Loader2, Camera } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    checkAuthAndGetProfile()
  }, [])

  async function checkAuthAndGetProfile() {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      setUser(user)
      
      // Fetch profile from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        // Profile error - will be handled by toast below
      }

      if (profile) {
        setFullName(profile.full_name || '')
        setAvatarUrl(profile.avatar_url || '')
      } else {
        // Fallback to user metadata if profile doesn't exist
        setFullName(user.user_metadata?.full_name || '')
        setAvatarUrl(user.user_metadata?.avatar_url || '')
      }
    } catch (error) {
      toast.error('프로필 불러오기 실패')
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile() {
    try {
      setUpdating(true)

      if (!user) throw new Error('No user found')

      // Update profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          avatar_url: avatarUrl,
          email: user.email,
          updated_at: new Date().toISOString()
        })

      if (profileError) throw profileError

      // Also update auth metadata for consistency
      const { error: authError } = await supabase.auth.updateUser({
        data: { 
          full_name: fullName,
          avatar_url: avatarUrl
        }
      })

      if (authError) throw authError

      // Refresh the user data to trigger auth state change
      const { data: { user: updatedUser } } = await supabase.auth.getUser()
      if (updatedUser) {
        setUser(updatedUser)
        // Manually trigger auth state change event
        window.dispatchEvent(new Event('userProfileUpdated'))
      }

      // Success toast removed
    } catch (error: any) {
      toast.error(error.message || '프로필 업데이트 실패')
    } finally {
      setUpdating(false)
    }
  }

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return
      }

      const file = event.target.files[0]
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('파일 크기는 5MB 미만이어야 합니다')
        return
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!validTypes.includes(file.type)) {
        toast.error('유효한 이미지 파일을 업로드해주세요 (JPEG, PNG, GIF, 또는 WebP)')
        return
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      // Delete old avatar if exists
      if (avatarUrl && avatarUrl.includes('supabase.co/storage')) {
        const oldPath = avatarUrl.split('/').slice(-2).join('/')
        await supabase.storage.from('avatars').remove([oldPath])
      }

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setAvatarUrl(data.publicUrl)
      
      // Update profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: data.publicUrl,
          email: user.email,
          updated_at: new Date().toISOString()
        })

      if (profileError) throw profileError

      // Also update auth metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: data.publicUrl }
      })

      if (updateError) {
        throw updateError
      }
      
      // Refresh user data to trigger sidebar update
      const { data: { user: updatedUser } } = await supabase.auth.getUser()
      if (updatedUser) {
        setUser(updatedUser)
        window.dispatchEvent(new Event('userProfileUpdated'))
      }
      
      // Success toast removed
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to upload avatar'
      
      if (errorMessage.includes('not found')) {
        toast.error('스토리지 버킷이 구성되지 않았습니다. 지원팀에 문의해주세요.')
      } else if (errorMessage.includes('policy')) {
        toast.error('권한이 거부되었습니다. 다시 시도해주세요.')
      } else {
        toast.error(errorMessage)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>프로필</CardTitle>
          <CardDescription>
            계정 정보를 관리하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-lg">
                  {user?.email?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-1 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90">
                <Camera className="h-4 w-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>
            <div>
              <h3 className="font-medium">{fullName || user?.email}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">전체 이름</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="전체 이름을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label>사용자 ID</Label>
              <Input
                value={user?.id || ''}
                disabled
                className="bg-muted font-mono text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label>가입일</Label>
              <Input
                value={user?.created_at ? new Date(user.created_at).toLocaleString() : ''}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button 
              onClick={updateProfile} 
              disabled={updating}
            >
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              변경사항 저장
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
            >
              취소
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}