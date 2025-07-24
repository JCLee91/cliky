/**
 * Task Master Core Service - 프로덕션 준비 완료
 * 오픈소스 claude-task-master 핵심 로직 완전 통합
 */

import { z } from 'zod'
import { generateText, generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'

// === 스키마 정의 (오픈소스 완전 복제) ===

export const TaskSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().min(1),
  details: z.string().nullable(),
  testStrategy: z.string().nullable(),
  priority: z.enum(['high', 'medium', 'low']),
  dependencies: z.array(z.number().int().positive()),
  status: z.enum(['pending', 'in-progress', 'done', 'completed', 'cancelled']),
  subtasks: z.array(z.object({
    id: z.string(), // "1.1", "1.2" 형식
    title: z.string(),
    description: z.string(),
    dependencies: z.array(z.string()),
    details: z.string(),
    status: z.enum(['pending', 'in-progress', 'done']),
    testStrategy: z.string().nullable()
  })).optional()
})

export const TasksResponseSchema = z.object({
  tasks: z.array(TaskSchema),
  metadata: z.object({
    projectName: z.string(),
    totalTasks: z.number(),
    sourceFile: z.string(),
    generatedAt: z.string()
  })
})

export type Task = z.infer<typeof TaskSchema>
export type TasksResponse = z.infer<typeof TasksResponseSchema>
export type Subtask = Task['subtasks'][0]

// === 프롬프트 템플릿 (오픈소스 완전 복제) ===

export interface PRDParseOptions {
  numTasks?: number
  research?: boolean
  defaultTaskPriority?: 'high' | 'medium' | 'low'
  projectContext?: string
}

export interface TaskExpandOptions {
  numSubtasks?: number
  research?: boolean
  projectContext?: string
  complexityReasoningContext?: string
  expansionPrompt?: 'default' | 'complexity-report' | 'research'
}

/**
 * PRD 파싱용 프롬프트 생성 (오픈소스 완전 복제)
 */
export function createPRDParsePrompt(
  prdContent: string, 
  options: PRDParseOptions = {}
): { systemPrompt: string; userPrompt: string } {
  const {
    numTasks = 12,
    research = false,
    defaultTaskPriority = 'medium',
    projectContext = ''
  } = options

  const systemPrompt = `You are an AI assistant specialized in analyzing Product Requirements Documents (PRDs) and generating a structured, logically ordered, dependency-aware and sequenced list of development tasks in JSON format.

Your role is to:
1. Carefully analyze the provided PRD
2. Break down the project into ${numTasks} actionable development tasks
3. Create logical dependencies between tasks
4. Assign appropriate priorities based on project needs
5. Provide detailed task descriptions and implementation guidance
6. Include testing strategies for each task
${research ? '7. Research and incorporate modern best practices and latest technology recommendations' : ''}

CRITICAL REQUIREMENTS:
- Output MUST be valid JSON only, no additional text
- Each task must have a unique sequential ID starting from 1
- Dependencies must reference valid task IDs within the same set
- All tasks must be completable within 2-8 hours of focused work
- Include specific implementation details in the "details" field
- Provide concrete testing strategies
${research ? '- Incorporate latest 2024-2025 technology trends and best practices' : ''}

Task Priority Guidelines:
- high: Critical path items, security, core functionality
- medium: Important features, integrations, optimizations  
- low: Nice-to-have features, documentation, cleanup tasks

Output Schema (JSON only):
{
  "tasks": [
    {
      "id": number,
      "title": "Concise task title",
      "description": "Clear description of what needs to be done",
      "priority": "${defaultTaskPriority}" | "high" | "medium" | "low",
      "dependencies": [1, 2, 3], // Array of task IDs this task depends on
      "details": "Detailed implementation guidance, including specific files to create/modify, libraries to use, configuration steps, etc.",
      "testStrategy": "Specific testing approach - unit tests, integration tests, manual testing steps, etc." | null,
      "status": "pending"
    }
  ],
  "metadata": {
    "projectName": "Extracted from PRD",
    "totalTasks": ${numTasks},
    "sourceFile": "PRD",
    "generatedAt": "${new Date().toISOString()}"
  }
}

IMPORTANT: 
- Ensure proper task sequencing (setup → core features → integrations → testing → deployment)
- Avoid circular dependencies
- Make dependencies realistic and necessary
- Each task should be specific enough to be actionable
- Balance task granularity (not too broad, not too narrow)`

  const userPrompt = `Please analyze the following Product Requirements Document and generate ${numTasks} structured development tasks:

${projectContext ? `Project Context: ${projectContext}\n\n` : ''}PRD Content:
${prdContent}

${research ? `
Research Requirements:
- Include modern development practices and tools (2024-2025)
- Recommend specific library versions and frameworks
- Consider performance, security, and scalability best practices
- Incorporate latest industry standards and patterns
` : ''}

Generate exactly ${numTasks} tasks with proper dependencies and sequencing. Start task IDs from 1.
Output valid JSON only, no additional text.`

  return { systemPrompt, userPrompt }
}

/**
 * 태스크 확장용 프롬프트 생성 (오픈소스 완전 복제)
 */
export function createTaskExpandPrompt(
  task: Task,
  options: TaskExpandOptions = {}
): { systemPrompt: string; userPrompt: string } {
  const {
    numSubtasks = 5,
    research = false,
    projectContext = '',
    complexityReasoningContext = '',
    expansionPrompt = 'default'
  } = options

  const systemPrompt = `You are an expert software architect specializing in breaking down complex development tasks into manageable, well-sequenced subtasks.

Your role is to:
1. Analyze the provided task and break it down into ${numSubtasks} actionable subtasks
2. Create logical dependencies between subtasks within the same parent task
3. Ensure each subtask is completable in 1-4 hours of focused work
4. Provide specific implementation guidance for each subtask
5. Include appropriate testing strategies
${research ? '6. Research and incorporate modern best practices and latest technology recommendations' : ''}

CRITICAL REQUIREMENTS:
- Output MUST be valid JSON only, no additional text
- Subtask IDs must follow the format: "${task.id}.1", "${task.id}.2", etc.
- Dependencies must reference valid subtask IDs within the same parent task only
- Each subtask must be atomic and focused on a single concern
- Include specific file names, functions, and implementation details
- Provide concrete testing approaches

Subtask Sequencing Guidelines:
- Setup and configuration tasks first
- Core implementation in logical order
- Integration and connection tasks
- Testing and validation tasks last

Output Schema (JSON only):
{
  "subtasks": [
    {
      "id": "${task.id}.1",
      "title": "Specific subtask title",
      "description": "Clear description of the subtask",
      "dependencies": ["${task.id}.1"], // Array of subtask IDs this depends on
      "details": "Detailed implementation steps, including specific files, functions, configurations",
      "testStrategy": "Specific testing approach for this subtask" | null,
      "status": "pending"
    }
  ]
}

IMPORTANT:
- Maintain focus on the parent task scope
- Ensure proper subtask sequencing
- Avoid circular dependencies
- Make each subtask independently testable when possible`

  const userPrompt = `Break down the following task into ${numSubtasks} detailed, actionable subtasks:

PARENT TASK:
ID: ${task.id}
Title: ${task.title}
Description: ${task.description}
${task.details ? `Details: ${task.details}` : ''}

${projectContext ? `PROJECT CONTEXT:\n${projectContext}\n` : ''}
${complexityReasoningContext ? `COMPLEXITY ANALYSIS:\n${complexityReasoningContext}\n` : ''}

${research ? `RESEARCH REQUIREMENTS:
- Use latest stable versions (2024-2025)
- Incorporate modern best practices
- Include performance and security considerations
- Suggest contemporary tools and patterns
` : ''}

Create exactly ${numSubtasks} subtasks with IDs starting from "${task.id}.1".
Each subtask should be completable in 1-4 hours.
Output valid JSON only, no additional text.`

  return { systemPrompt, userPrompt }
}

// === 의존성 관리 유틸리티 (오픈소스 완전 복제) ===

/**
 * 다음 실행 가능한 태스크 찾기 (오픈소스 알고리즘)
 */
export function findNextTask(tasks: Task[]): Task | null {
  const priorityValues = { high: 3, medium: 2, low: 1 }
  
  // 1. 진행 중인 태스크의 서브태스크부터 확인
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress')
  
  for (const task of inProgressTasks) {
    if (task.subtasks && task.subtasks.length > 0) {
      const availableSubtasks = task.subtasks.filter(st => 
        st.status === 'pending' && 
        (st.dependencies?.length === 0 || 
         st.dependencies.every(dep => {
           const depSubtask = task.subtasks!.find(s => s.id === dep)
           return depSubtask?.status === 'done'
         }))
      )
      
      if (availableSubtasks.length > 0) {
        // 서브태스크를 태스크 형태로 변환하여 반환
        const nextSubtask = availableSubtasks[0]
        return {
          ...task,
          id: parseInt(nextSubtask.id.replace('.', '')), // 1.1 -> 11
          title: nextSubtask.title,
          description: nextSubtask.description,
          details: nextSubtask.details,
          subtasks: undefined
        }
      }
    }
  }

  // 2. 대기 중인 태스크 중에서 의존성이 해결된 것 찾기
  const completedTaskIds = new Set(
    tasks.filter(t => t.status === 'done' || t.status === 'completed')
         .map(t => t.id)
  )

  const availableTasks = tasks.filter(task => 
    task.status === 'pending' && 
    task.dependencies.every(depId => completedTaskIds.has(depId))
  )

  if (availableTasks.length === 0) return null

  // 3. 우선순위 기반 정렬 (오픈소스 알고리즘)
  return availableTasks.sort((a, b) => {
    // 우선순위 높은 순
    const priorityDiff = priorityValues[b.priority] - priorityValues[a.priority]
    if (priorityDiff !== 0) return priorityDiff
    
    // 의존성 적은 순
    const depDiff = a.dependencies.length - b.dependencies.length
    if (depDiff !== 0) return depDiff
    
    // ID 작은 순
    return a.id - b.id
  })[0]
}

/**
 * 의존성 검증 및 자동 수정 (오픈소스 로직)
 */
export function validateAndFixDependencies(tasks: Task[]): Task[] {
  const taskIds = new Set(tasks.map(t => t.id))
  
  return tasks.map(task => ({
    ...task,
    dependencies: task.dependencies.filter(dep => {
      // 자기 참조 제거
      if (dep === task.id) return false
      // 존재하지 않는 태스크 참조 제거
      if (!taskIds.has(dep)) return false
      return true
    })
  })).filter(task => {
    // 순환 의존성 확인
    return !hasCircularDependency(task, tasks)
  })
}

/**
 * 순환 의존성 탐지 (DFS 알고리즘)
 */
export function hasCircularDependency(task: Task, allTasks: Task[]): boolean {
  const visited = new Set<number>()
  const recursionStack = new Set<number>()

  const dfs = (currentId: number): boolean => {
    if (recursionStack.has(currentId)) return true
    if (visited.has(currentId)) return false

    visited.add(currentId)
    recursionStack.add(currentId)

    const currentTask = allTasks.find(t => t.id === currentId)
    if (currentTask) {
      for (const depId of currentTask.dependencies) {
        if (dfs(depId)) return true
      }
    }

    recursionStack.delete(currentId)
    return false
  }

  return dfs(task.id)
}

// === 태스크 마스터 코어 서비스 ===

export class TaskMasterCoreService {
  private model: any

  constructor(options: { model?: string; apiKey?: string } = {}) {
    const modelName = options.model || process.env.AI_MODEL || 'gpt-4o'
    this.model = openai(modelName)
  }

  /**
   * PRD를 구조화된 태스크로 파싱 (오픈소스 완전 복제)
   */
  async parsePRD(
    prdContent: string, 
    options: PRDParseOptions = {}
  ): Promise<TasksResponse> {
    const { systemPrompt, userPrompt } = createPRDParsePrompt(prdContent, options)

    try {
      const response = await generateObject({
        model: this.model,
        schema: TasksResponseSchema,
        system: systemPrompt,
        prompt: userPrompt,
        temperature: 0.7,
        maxTokens: 4000
      })

      // 의존성 검증 및 자동 수정
      const validatedTasks = validateAndFixDependencies(response.object.tasks)

      return {
        tasks: validatedTasks,
        metadata: response.object.metadata
      }
    } catch (error) {
      throw new Error(`PRD 파싱 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    }
  }

  /**
   * 태스크를 서브태스크로 확장 (오픈소스 완전 복제)
   */
  async expandTask(
    task: Task,
    options: TaskExpandOptions = {}
  ): Promise<{ task: Task; subtasks: Subtask[] }> {
    // 이미 서브태스크가 있는 경우 건너뛰기
    if (task.subtasks && task.subtasks.length > 0) {
      return { task, subtasks: task.subtasks }
    }

    const { systemPrompt, userPrompt } = createTaskExpandPrompt(task, options)

    try {
      const SubtasksSchema = z.object({
        subtasks: z.array(z.object({
          id: z.string(),
          title: z.string(),
          description: z.string(),
          dependencies: z.array(z.string()),
          details: z.string(),
          testStrategy: z.string().nullable(),
          status: z.enum(['pending', 'in-progress', 'done']).optional()
        }))
      })

      const response = await generateObject({
        model: this.model,
        schema: SubtasksSchema,
        system: systemPrompt,
        prompt: userPrompt,
        temperature: 0.7,
        maxTokens: 2000
      })

      const subtasks = response.object.subtasks.map(st => ({
        ...st,
        status: st.status || 'pending' as const
      }))

      // 태스크에 서브태스크 추가
      const expandedTask: Task = {
        ...task,
        subtasks: subtasks
      }

      return { task: expandedTask, subtasks }
    } catch (error) {
      throw new Error(`태스크 확장 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    }
  }

  /**
   * 다음 실행할 태스크 추천 (오픈소스 알고리즘)
   */
  getNextTask(tasks: Task[]): Task | null {
    return findNextTask(tasks)
  }

  /**
   * 태스크 상태 업데이트
   */
  updateTaskStatus(
    tasks: Task[], 
    taskId: number, 
    status: Task['status']
  ): Task[] {
    return tasks.map(task => 
      task.id === taskId 
        ? { ...task, status }
        : task
    )
  }

  /**
   * 서브태스크 상태 업데이트
   */
  updateSubtaskStatus(
    tasks: Task[], 
    taskId: number, 
    subtaskId: string, 
    status: Subtask['status']
  ): Task[] {
    return tasks.map(task => 
      task.id === taskId && task.subtasks
        ? {
            ...task,
            subtasks: task.subtasks.map(subtask =>
              subtask.id === subtaskId
                ? { ...subtask, status }
                : subtask
            )
          }
        : task
    )
  }

  /**
   * 프로젝트 진행률 계산
   */
  calculateProgress(tasks: Task[]): {
    total: number
    completed: number
    inProgress: number
    pending: number
    percentage: number
  } {
    let total = 0
    let completed = 0
    let inProgress = 0
    let pending = 0

    tasks.forEach(task => {
      if (task.subtasks && task.subtasks.length > 0) {
        // 서브태스크가 있는 경우 서브태스크 기준으로 계산
        task.subtasks.forEach(subtask => {
          total++
          switch (subtask.status) {
            case 'done': completed++; break
            case 'in-progress': inProgress++; break
            default: pending++
          }
        })
      } else {
        // 서브태스크가 없는 경우 메인 태스크 기준
        total++
        switch (task.status) {
          case 'done':
          case 'completed': completed++; break
          case 'in-progress': inProgress++; break
          default: pending++
        }
      }
    })

    return {
      total,
      completed,
      inProgress,
      pending,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }
}

// 싱글톤 인스턴스 export
export const taskMasterCore = new TaskMasterCoreService()