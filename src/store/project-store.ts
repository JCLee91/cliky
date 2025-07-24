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
      console.log('[ProjectStore] Fetching projects...')
      
      const { data: { user } } = await supabase.auth.getUser()
      console.log('[ProjectStore] Current user:', user?.email, user?.id)
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        
      if (error) {
        console.error('[ProjectStore] Supabase error:', error)
        throw error
      }
      
      console.log('[ProjectStore] Fetched projects:', data?.length || 0, 'projects')
      console.log('[ProjectStore] Project details:', data)
      
      set({ projects: data || [] })
    } catch (error) {
      console.error('[ProjectStore] Error fetching projects:', error)
    }
  },
  
  // Subscribe to realtime changes (disabled - using manual sync)
  subscribeToProjects: () => {
    // Realtime subscription disabled
    // Using manual fetchProjects() after each operation
    return () => {}
  }
}))
