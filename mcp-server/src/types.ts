// Import and extend existing types from main project
// This ensures consistency between MCP server and main application

export interface Project {
  id: string
  user_id: string
  name: string
  idea: string
  features: any[]
  user_flow: string
  tech_preferences: string[]
  trd_content: string
  status: 'draft' | 'generating' | 'trd_generated' | 'completed'
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  project_id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  estimated_time: string
  dependencies: string[]
  order_index: number
  created_at: string
  // Optional fields from SQL migrations
  details?: string
  test_strategy?: string
  acceptance_criteria?: any[]
  // Extended for MCP usage - these will be added to task response
  project?: Partial<Project>
}

// MCP-specific types
export interface MCPTaskWithStatus extends Task {
  // Virtual fields for MCP usage (not in DB)
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  started_at?: string
  completed_at?: string
  completion_notes?: string
}

export interface TaskFilter {
  status?: 'all' | 'pending' | 'in_progress' | 'completed' | 'blocked'
  projectId?: string
  limit?: number
}