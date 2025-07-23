'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Project, ProjectFormData } from '@/types/project'
import { useToast } from '@/hooks/use-toast'
import { useProjectStore } from '@/store/project-store'

interface UseProjectReturn {
  projects: Project[]
  loading: boolean
  formData: ProjectFormData
  setFormData: (data: Partial<ProjectFormData>) => void
  resetFormData: () => void
  fetchProjects: () => Promise<Project[]>
  createProject: (data: ProjectFormData) => Promise<Project | null>
  updateProject: (id: string, data: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
}

const initialFormData: ProjectFormData = {
  name: '',
  idea: '',
  features: [],
  userFlow: '',
  techPreferences: []
}

export function useProject(): UseProjectReturn {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormDataState] = useState<ProjectFormData>(initialFormData)
  const { toast } = useToast()

  const setFormData = useCallback((data: Partial<ProjectFormData>) => {
    setFormDataState(prev => ({ ...prev, ...data }))
  }, [])

  const resetFormData = useCallback(() => {
    setFormDataState(initialFormData)
  }, [])

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
      return data || []
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load projects.',
        variant: 'destructive'
      })
      return []
    } finally {
      setLoading(false)
    }
  }, [toast])

  const createProject = useCallback(async (data: ProjectFormData): Promise<Project | null> => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated. Please login and try again.')
      }

      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: data.name,
          idea: data.idea,
          features: data.features,
          user_flow: data.userFlow,
          tech_preferences: data.techPreferences,
          status: 'draft'
        })
        .select()
        .single()

      if (error) throw error

      await fetchProjects()
      toast({
        title: 'Success',
        description: 'Project created successfully.'
      })

      return project
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create project.',
        variant: 'destructive'
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchProjects, toast])

  const updateProject = useCallback(async (id: string, data: Partial<Project>) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('projects')
        .update(data)
        .eq('id', id)
        .select()

      if (error) throw error

      // Fetch updated projects
      await fetchProjects()
      
      // Update the store
      useProjectStore.getState().updateProjectInStore(id, data)

      toast({
        title: 'Success',
        description: 'Project updated successfully.'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update project.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [fetchProjects, toast])

  const deleteProject = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchProjects()

      toast({
        title: 'Success',
        description: 'Project deleted successfully.'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete project.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [fetchProjects, toast])

  return {
    projects,
    loading,
    formData,
    setFormData,
    resetFormData,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject
  }
}