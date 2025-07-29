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
  deleted_at?: string | null
}

export interface ProjectFormData {
  name: string
  idea: string
  features: string[]
  userFlow: string
  techPreferences?: string[]
}

export interface GuidedProjectFormData {
  name: string
  idea: string
  productDescriptionChoice: 'A' | 'B'
  productDescriptionOptionA?: string
  productDescriptionOptionB?: string
  productDescriptionNotes?: string
  userFlowChoice: 'A' | 'B'
  userFlowOptionA?: string
  userFlowOptionB?: string
  userFlowNotes?: string
  coreFeatures?: string[]
  roles?: string[]
  suggestedFeatures?: string[]
  suggestedRoles?: string[]
  featuresNotes?: string
  techStack?: string[]
  techStackNotes?: string
}