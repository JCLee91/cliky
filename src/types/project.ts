export interface Project {
  id: string
  user_id: string
  name: string
  idea: string
  features?: string[]
  user_flow?: string
  tech_preferences?: string[]
  trd_content?: string | null
  status: 'draft' | 'generating' | 'completed' | 'trd_generated'
  created_at: string
  updated_at: string
}

export interface ProjectFormData {
  name: string
  idea: string
  features: string[]
  userFlow: string
  techPreferences?: string[]
}