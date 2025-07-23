export interface PRDContent {
  content: string
  sections: PRDSection[]
  metadata: PRDMetadata
}

export interface PRDSection {
  title: string
  content: string
  level: number
}

export interface PRDMetadata {
  project_id: string
  generated_at: string
  tech_stack: string[]
  search_context?: string
}