import { create } from 'zustand'
import { Project } from '@/types/project'
import { supabase } from '@/lib/supabase/client'

interface ProjectStore {
  // Projects list
  projects: Project[]
  setProjects: (projects: Project[]) => void
  
  // Selected project
  selectedProject: Project | null
  setSelectedProject: (project: Project | null) => void
  
  // Form state
  isFormOpen: boolean
  setIsFormOpen: (isOpen: boolean) => void
  
  // Actions
  updateProjectInStore: (id: string, updates: Partial<Project>) => void
  fetchProjects: () => Promise<void>
  subscribeToProjects: () => () => void
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  // State
  projects: [],
  selectedProject: null,
  isFormOpen: false,
  
  // Setters
  setProjects: (projects) => set({ projects }),
  setSelectedProject: (project) => set({ selectedProject: project }),
  setIsFormOpen: (isOpen) => set({ isFormOpen: isOpen }),
  
  // Update project in both list and selected (if matched)
  updateProjectInStore: (id, updates) => {
    set((state) => {
      const updatedProjects = state.projects.map(p => 
        p.id === id ? { ...p, ...updates } : p
      )
      
      const updatedSelected = state.selectedProject?.id === id 
        ? { ...state.selectedProject, ...updates }
        : state.selectedProject
      
      return {
        projects: updatedProjects,
        selectedProject: updatedSelected
      }
    })
  },
  
  // Fetch projects from database
  fetchProjects: async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        
      if (error) throw error
      
      set({ projects: data || [] })
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  },
  
  // Subscribe to realtime changes (disabled - using manual sync)
  subscribeToProjects: () => {
    // Realtime subscription disabled
    // Using manual fetchProjects() after each operation
    return () => {}
  }
}))
