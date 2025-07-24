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
  const [loading, setLoading] = useState(false)
  const [formData, setFormDataState] = useState<ProjectFormData>(initialFormData)
  const { toast } = useToast()
  const projectStore = useProjectStore()

  const setFormData = useCallback((data: Partial<ProjectFormData>) => {
    setFormDataState(prev => ({ ...prev, ...data }))
  }, [])

  const resetFormData = useCallback(() => {
    setFormDataState(initialFormData)
  }, [])

  const fetchProjects = useCallback(async () => {
    // Use store's fetchProjects which handles caching
    await projectStore.fetchProjects(true)
    return projectStore.projects
  }, [projectStore])

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

      // Refresh projects
      await projectStore.fetchProjects(true)
      // Success toast removed

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

      // Update the store optimistically
      projectStore.updateProjectInStore(id, data)
      
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
      // Soft delete - only set deleted_at timestamp
      const { error } = await supabase
        .from('projects')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      // Remove from cache and refresh
      await projectStore.fetchProjects(true)
      
      // Clear selected project if it was deleted
      if (projectStore.selectedProject?.id === id) {
        projectStore.setSelectedProject(null)
      }

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
    projects: projectStore.projects,
    loading: loading || projectStore.isLoading,
    formData,
    setFormData,
    resetFormData,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject
  }
}