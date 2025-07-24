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
    // Cache projects whenever they're updated
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
    console.log('[ProjectStore] fetchProjects called', { forceRefresh, isLoading: get().isLoading })
    
    // Prevent concurrent fetches
    if (get().isLoading) {
      console.log('[ProjectStore] Already fetching, skipping...')
      return
    }
    
    try {
      set({ isLoading: true })
      
      // Try cache first if not forcing refresh
      if (!forceRefresh) {
        const cached = CacheManager.get<Project[]>(CACHE_KEYS.PROJECTS, 5)
        console.log('[ProjectStore] Cache check:', { hasCached: !!cached, count: cached?.length })
        
        if (cached) {
          console.log('[ProjectStore] Using cached projects')
          set({ projects: cached, hasInitialized: true })
          return
        }
      }
      
      console.log('[ProjectStore] Fetching fresh projects from database')
      
      // Check session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('[ProjectStore] Session check:', { 
        hasSession: !!session, 
        userId: session?.user?.id,
        error: sessionError 
      })
      
      if (!session) {
        console.warn('[ProjectStore] No session, returning empty projects')
        set({ projects: [], hasInitialized: true })
        return
      }
      
      // Fetch projects
      console.log('[ProjectStore] Querying projects table...')
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        
      console.log('[ProjectStore] Query result:', { 
        success: !error, 
        count: data?.length, 
        error,
        data: data?.map(p => ({ id: p.id, name: p.name }))
      })
        
      if (error) throw error
      
      const projects = data || []
      
      // Update state and cache
      console.log('[ProjectStore] Updating state with', projects.length, 'projects')
      get().setProjects(projects)
      set({ hasInitialized: true })
      
    } catch (error) {
      console.error('[ProjectStore] Error fetching projects:', error)
      
      // On error, still use cache if available
      const cached = CacheManager.get<Project[]>(CACHE_KEYS.PROJECTS, 60)
      console.log('[ProjectStore] Error fallback - using cache:', { hasCached: !!cached, count: cached?.length })
      
      set({ projects: cached || [], hasInitialized: true })
    } finally {
      console.log('[ProjectStore] fetchProjects completed')
      set({ isLoading: false })
    }
  },
  
  // Initialize projects on app start
  initializeProjects: async () => {
    const state = get()
    console.log('[ProjectStore] initializeProjects called', { hasInitialized: state.hasInitialized })
    
    if (state.hasInitialized) {
      console.log('[ProjectStore] Already initialized, skipping')
      return
    }
    
    await state.fetchProjects()
  }
}))
