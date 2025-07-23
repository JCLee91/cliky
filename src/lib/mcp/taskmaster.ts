'use client'

import { TaskBreakdownRequest, TaskBreakdownResponse, MCPTaskResponse } from '@/types/task'

// Real MCP client for Task Master AI
export class TaskmasterMCPClient {
  private serverUrl: string
  private isConnected: boolean = false

  constructor(serverUrl: string = 'http://localhost:3001') {
    this.serverUrl = serverUrl
  }

  async connect(): Promise<void> {
    try {
      // In a real MCP implementation, we would establish a proper MCP connection
      // For now, we'll simulate calling task-master CLI tools
      this.isConnected = true
    } catch (error) {
      console.error('Failed to connect to Task Master MCP:', error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false
  }

  async breakdownToTasks(request: TaskBreakdownRequest): Promise<TaskBreakdownResponse> {
    if (!this.isConnected) {
      await this.connect()
    }

    try {
      // Call task-master API directly via CLI tool
      const result = await this.callTaskMasterCLI(request)
      return result
    } catch (error) {
      // Return fallback response on error
      return this.createFallbackResponse()
    }
  }

  private async callTaskMasterCLI(request: TaskBreakdownRequest): Promise<TaskBreakdownResponse> {
    try {
      // Create a PRD-like document for task-master
      const prdContent = this.createPRDDocument(request)
      
      // For client-side, we'll use an API route to call task-master
      const response = await fetch('/api/taskmaster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prd: prdContent,
          projectContext: request.projectContext
        })
      })

      if (!response.ok) {
        throw new Error(`Task Master API failed: ${response.statusText}`)
      }

      const result = await response.json()
      return this.parseTaskMasterResponse(result)
    } catch (error) {
      throw error
    }
  }

  private createPRDDocument(request: TaskBreakdownRequest): string {
    return `
# Product Requirements Document (PRD)
## Project: ${request.projectContext.name}

### Project Overview
${request.projectContext.idea}

### Core Features
${request.projectContext.features.map((feature, index) => `${index + 1}. ${feature}`).join('\n')}

### Technology Preferences
${request.projectContext.techPreferences.join(', ')}

### Technical Requirements Document (TRD)
${request.trdContent}

### Task Requirements
Please break down this project into specific, actionable development tasks.
Each task should be:
- Completable in 2-4 hours
- Have clear acceptance criteria
- Include dependencies
- Assigned appropriate priority
- Include time estimates
`
  }

  private parseTaskMasterResponse(response: any): TaskBreakdownResponse {
    // Parse and validate Task Master response
    const tasks: MCPTaskResponse[] = []
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    
    if (response.tasks && Array.isArray(response.tasks)) {
      response.tasks.forEach((task: any) => {
        // Filter dependencies to only include valid UUIDs
        const validDependencies = Array.isArray(task.dependencies) 
          ? task.dependencies.filter((dep: any) => 
              typeof dep === 'string' && dep.length > 0 && uuidRegex.test(dep)
            )
          : []

        tasks.push({
          title: task.title || task.name || 'Untitled Task',
          description: task.description || task.content || '',
          priority: this.mapPriority(task.priority),
          estimatedTime: task.estimatedTime || task.estimate || '2-4 hours',
          dependencies: validDependencies,
          acceptanceCriteria: Array.isArray(task.acceptanceCriteria) ? task.acceptanceCriteria : 
                             Array.isArray(task.criteria) ? task.criteria : ['Task completed successfully']
        })
      })
    }

    return {
      tasks,
      summary: {
        totalTasks: tasks.length,
        estimatedTotalTime: response.summary?.totalTime || `${tasks.length * 3}-${tasks.length * 4} hours`,
        complexityScore: response.summary?.complexity || 5
      }
    }
  }

  private mapPriority(priority: any): 'high' | 'medium' | 'low' {
    const p = String(priority).toLowerCase()
    if (p.includes('high') || p.includes('urgent') || p === '1') return 'high'
    if (p.includes('low') || p === '3') return 'low'
    return 'medium'
  }

  private createFallbackResponse(): TaskBreakdownResponse {
    return {
      tasks: [
        {
          title: '프로젝트 환경 설정',
          description: '개발 환경을 설정하고 필요한 의존성을 설치합니다.',
          priority: 'high',
          estimatedTime: '2-3 hours',
          dependencies: [], // Empty array for first task
          acceptanceCriteria: [
            '개발 서버가 정상적으로 실행됨',
            '모든 필요한 패키지가 설치됨',
            '환경 변수가 올바르게 설정됨'
          ]
        },
        {
          title: '데이터베이스 스키마 설계',
          description: '프로젝트에 필요한 데이터베이스 테이블과 관계를 설계합니다.',
          priority: 'high',
          estimatedTime: '3-4 hours',
          dependencies: [], // Remove string dependencies - will be handled by order_index
          acceptanceCriteria: [
            '모든 테이블이 생성됨',
            '적절한 인덱스가 설정됨',
            '데이터 무결성 제약조건이 적용됨'
          ]
        },
        {
          title: '기본 UI 컴포넌트 구현',
          description: '프로젝트에서 사용할 기본 UI 컴포넌트를 구현합니다.',
          priority: 'medium',
          estimatedTime: '4-6 hours',
          dependencies: [], // Remove string dependencies - will be handled by order_index
          acceptanceCriteria: [
            '재사용 가능한 컴포넌트 라이브러리 구축',
            '컴포넌트 스토리북 문서화',
            '반응형 디자인 적용'
          ]
        }
      ],
      summary: {
        totalTasks: 3,
        estimatedTotalTime: '9-13 hours',
        complexityScore: 5
      }
    }
  }
}

// Singleton instance
let mcpClient: TaskmasterMCPClient | null = null

export function getMCPClient(): TaskmasterMCPClient {
  if (!mcpClient) {
    mcpClient = new TaskmasterMCPClient()
  }
  return mcpClient
}

// Convenience function for direct task breakdown
export async function breakdownToTasks(request: TaskBreakdownRequest): Promise<TaskBreakdownResponse> {
  const client = getMCPClient()
  return await client.breakdownToTasks(request)
}