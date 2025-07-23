export interface Subtask {
  id: string  // "1.1", "1.2" 형식
  parentId: string
  title: string
  description: string
  details?: string
  testStrategy?: string
  dependencies: string[]
  status: 'todo' | 'in_progress' | 'completed'
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
  status?: 'todo' | 'in_progress' | 'completed'
  created_at: string
  // AI가 생성하는 추가 필드 (DB에는 저장 안됨)
  details?: string
  testStrategy?: string
  acceptanceCriteria?: string[]
  // 복잡한 태스크용 필드
  subtasks?: Subtask[]
  complexity?: number
}

export interface CreateTaskData {
  project_id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  estimated_time: string
  dependencies?: string[]
  order_index?: number
  details?: string
  test_strategy?: string
}

export interface MCPTaskResponse {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  estimatedTime: string
  dependencies: string[]
  acceptanceCriteria: string[]
}

export interface TaskBreakdownRequest {
  trdContent: string
  projectContext: {
    name: string
    idea: string
    features: string[]
    techPreferences: string[]
  }
}

export interface TaskBreakdownResponse {
  tasks: MCPTaskResponse[]
  summary: {
    totalTasks: number
    estimatedTotalTime: string
    complexityScore: number
  }
}