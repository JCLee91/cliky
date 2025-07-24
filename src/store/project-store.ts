import { create } from 'zustand'
import { Project } from '@/types/project'
import { supabase } from '@/lib/supabase/client'
import { CacheManager, CACHE_KEYS } from '@/lib/cache'

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
  
  // Loading state
  isLoading: boolean
  hasInitialized: boolean
  
  // Actions
  updateProjectInStore: (id: string, updates: Partial<Project>) => void
  fetchProjects: (forceRefresh?: boolean) => Promise<void>
  initializeProjects: () => Promise<void>
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  // State
  projects: [],
  selectedProject: null,
  isFormOpen: false,
  isLoading: false,
  hasInitialized: false,
  
  // Setters
  setProjects: (projects) => {
    set({ projects })
    // Simple cache - RLS already handles user separation
    CacheManager.set(CACHE_KEYS.PROJECTS, projects)
  },
  setSelectedProject: (project) => set({ selectedProject: project }),
  setIsFormOpen: (isOpen) => set({ isFormOpen: isOpen }),
  
  // Update project in both list and selected (if matched) - with optimistic update
  updateProjectInStore: (id, updates) => {
    set((state) => {
      const updatedProjects = state.projects.map(p => 
        p.id === id ? { ...p, ...updates } : p
      )
      
      const updatedSelected = state.selectedProject?.id === id 
        ? { ...state.selectedProject, ...updates }
        : state.selectedProject
      
      // Cache the updated projects
      CacheManager.set(CACHE_KEYS.PROJECTS, updatedProjects)
      
      return {
        projects: updatedProjects,
        selectedProject: updatedSelected
      }
    })
  },
  
  // Fetch projects with caching
  fetchProjects: async (forceRefresh = false) => {
    // Prevent concurrent fetches
    if (get().isLoading) {
      return
    }
    
    try {
      set({ isLoading: true })
      
      // Try cache first if not forcing refresh
      if (!forceRefresh) {
        const cached = CacheManager.get<Project[]>(CACHE_KEYS.PROJECTS, 5)
        
        if (cached) {
          set({ projects: cached, hasInitialized: true })
          return
        }
      }
      
      // Check session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (!session) {
        set({ projects: [], hasInitialized: true })
        return
      }
      
      // Fetch projects
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })  // RLS handles user filtering
        
      if (error) throw error
      
      const projects = data || []
      
      // Update state and cache
      get().setProjects(projects)
      set({ hasInitialized: true })
      
    } catch (error) {
      // On error, still use cache if available
      const cached = CacheManager.get<Project[]>(CACHE_KEYS.PROJECTS, 60)
      
      set({ projects: cached || [], hasInitialized: true })
    } finally {
      set({ isLoading: false })
    }
  },
  
  // Initialize projects on app start
  initializeProjects: async () => {
    const state = get()
    
    // Simple initialization - RLS handles user filtering
    await state.fetchProjects()
  }
}))
