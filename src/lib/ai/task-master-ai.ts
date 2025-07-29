/**
 * Task Master AI Service - 원본 claude-task-master 로직 완전 복제
 * Direct AI API integration for task generation
 */

import { openai } from '@ai-sdk/openai'
import { generateText, generateObject } from 'ai'
import { z } from 'zod'
import { getTaskMasterPrompt } from '../prompts/taskmaster-prompts'
import { getExpandTaskPrompt } from '../prompts/subtask-prompts'
import {
  parseTasksFromText,
  parseSubtasksFromText,
  createLogger,
  taskSchema,
  subtaskSchema
} from './task-master-utils'

export interface TaskMasterOptions {
  model?: 'gpt-4-turbo' | 'gpt-4o' | 'claude-3-5-sonnet-20241022' | 'claude-3-opus-20240229'
  apiKey?: string
  research?: boolean
}

export interface ParsePRDOptions {
  numTasks?: number
  projectContext?: string
  defaultPriority?: 'high' | 'medium' | 'low'
  research?: boolean
}

export interface ExpandTaskOptions {
  numSubtasks?: number
  projectContext?: string
  additionalContext?: string
  complexityReasoningContext?: string
  expansionPrompt?: 'default' | 'complexity-report' | 'research'
  force?: boolean
}

export interface Task {
  id: number
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  dependencies: number[]
  details: string
  testStrategy: string | null
  status?: 'pending' | 'in-progress' | 'done' | 'cancelled' | 'deferred' | 'review'
  subtasks?: Subtask[]
}

export interface Subtask {
  id: string // 1.1, 1.2 형식 (원본 오픈소스 방식)
  title: string
  description: string
  dependencies: string[]
  details: string
  status: 'pending' | 'in-progress' | 'done'
  testStrategy: string | null
}

export interface TaskMasterResponse {
  tasks: Task[]
  metadata: {
    projectName: string
    totalTasks: number
    sourceFile: string
    generatedAt: string
  }
}

// 원본 오픈소스 스키마 정의
const taskMasterResponseSchema = z.object({
  tasks: z.array(z.object({
    id: z.number(),
    title: z.string(),
    description: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
    dependencies: z.array(z.number()),
    details: z.string(),
    testStrategy: z.string().nullable(),
    status: z.enum(['pending', 'in-progress', 'done', 'cancelled', 'deferred', 'review']).optional()
  })),
  metadata: z.object({
    projectName: z.string().optional(),
    totalTasks: z.number(),
    sourceFile: z.string().optional(),
    generatedAt: z.string()
  }).optional()
})

const subtaskResponseSchema = z.object({
  subtasks: z.array(z.object({
    id: z.string(), // "1.1", "1.2" 형식
    title: z.string(),
    description: z.string(),
    dependencies: z.array(z.string()),
    details: z.string(),
    testStrategy: z.string().nullable(),
    status: z.enum(['pending', 'in-progress', 'done']).optional()
  }))
})

export class TaskMasterAI {
  private model: any
  private researchMode: boolean
  private logger: ReturnType<typeof createLogger>

  constructor(options: TaskMasterOptions = {}) {
    const modelName = options.model || 'gpt-4-turbo'
    this.researchMode = options.research || false
    this.logger = createLogger('TaskMasterAI')

    // OpenAI 모델 사용 (프로덕션 준비)
    this.model = openai(modelName)
  }

  /**
   * Parse PRD into structured tasks - 원본 claude-task-master 로직 완전 복제
   */
  async parsePRD(prdContent: string, options: ParsePRDOptions = {}): Promise<TaskMasterResponse> {
    const numTasks = options.numTasks || 12 // 원본 기본값
    const projectContext = options.projectContext || ''
    const defaultPriority = options.defaultPriority || 'medium'
    const research = options.research || this.researchMode

    // Get prompts from Task Master template (원본 프롬프트 사용)
    const { systemPrompt, userPrompt } = getTaskMasterPrompt({
      prdContent,
      numTasks,
      projectContext,
      defaultTaskPriority: defaultPriority,
      research,
      nextId: 1
    })

    try {
      this.logger.info(`Generating ${numTasks} tasks from PRD using ${this.model._model || 'unknown'} model...`)

      // Call AI to generate tasks (원본 방식)
      const response = await generateObject({
        model: this.model,
        schema: taskMasterResponseSchema,
        system: systemPrompt,
        prompt: userPrompt,
        temperature: 0.7,
        maxTokens: 4000
      })

      // 원본 오픈소스의 의존성 검증 로직 적용
      const validatedTasks = this.validateAndFixDependencies(response.object.tasks as Task[])
      
      const result: TaskMasterResponse = {
        tasks: validatedTasks.map(task => ({
          ...task,
          status: task.status || 'pending'
        })),
        metadata: {
          projectName: response.object.metadata?.projectName || 'Unknown Project',
          totalTasks: validatedTasks.length,
          sourceFile: response.object.metadata?.sourceFile || 'PRD',
          generatedAt: new Date().toISOString()
        }
      }

      this.logger.info(`Successfully generated ${result.tasks.length} validated tasks`)
      return result

    } catch (error) {
      this.logger.error(`Task Master AI error: ${error}`)
      throw error
    }
  }

  /**
   * Expand task into subtasks - 원본 claude-task-master 로직 완전 복제
   */
  async expandTask(
    task: Task,
    options: ExpandTaskOptions = {}
  ): Promise<{ task: Task; subtasks: Subtask[] }> {
    const numSubtasks = options.numSubtasks || 5
    const force = options.force || false

    // Check if task already has subtasks and force is not set (원본 로직)
    if (task.subtasks && task.subtasks.length > 0 && !force) {
      this.logger.warn(`Task ${task.id} already has ${task.subtasks.length} subtasks. Use force=true to replace.`)
      return { task, subtasks: task.subtasks }
    }

    // Get prompts from expand task template (원본 프롬프트 사용)
    const { systemPrompt, userPrompt } = getExpandTaskPrompt({
      task,
      numSubtasks,
      projectContext: options.projectContext || '',
      additionalContext: options.additionalContext || '',
      complexityReasoningContext: options.complexityReasoningContext || '',
      expansionPrompt: options.expansionPrompt || 'default'
    })

    try {
      this.logger.info(`Expanding task ${task.id} into ${numSubtasks} subtasks...`)

      // Call AI to generate subtasks (원본 방식)
      const response = await generateObject({
        model: this.model,
        schema: subtaskResponseSchema,
        system: systemPrompt,
        prompt: userPrompt,
        temperature: 0.7,
        maxTokens: 2000
      })

      // 원본 오픈소스의 서브태스크 검증 로직
      const validatedSubtasks = this.validateSubtaskDependencies(response.object.subtasks as Subtask[], task.id)

      // Update task with subtasks (원본 방식)
      const expandedTask: Task = {
        ...task,
        subtasks: validatedSubtasks,
        status: task.status || 'pending'
      }

      this.logger.info(`Successfully generated ${validatedSubtasks.length} subtasks for task ${task.id}`)

      return { task: expandedTask, subtasks: validatedSubtasks }
      
    } catch (error) {
      this.logger.error(`Task expansion error: ${error}`)
      throw error
    }
  }

  /**
   * Get next task to work on - 원본 claude-task-master 알고리즘
   */
  getNextTask(tasks: Task[]): Task | null {
    // 1. 진행 중인 태스크의 서브태스크부터 확인
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress')
    for (const task of inProgressTasks) {
      if (task.subtasks) {
        const nextSubtask = this.getNextSubtask(task.subtasks)
        if (nextSubtask) {
          // 서브태스크를 태스크 형태로 반환
          return {
            ...task,
            id: parseInt(nextSubtask.id.replace('.', '')), // 1.1 -> 11
            title: nextSubtask.title,
            description: nextSubtask.description,
            details: nextSubtask.details
          }
        }
      }
    }

    // 2. 대기 중인 태스크 중에서 의존성이 해결된 것 찾기
    const availableTasks = tasks.filter(task => 
      task.status === 'pending' && 
      this.areDependenciesSatisfied(task, tasks)
    )

    if (availableTasks.length === 0) return null

    // 3. 우선순위 기반 정렬 (원본 알고리즘)
    const priorityValues = { high: 3, medium: 2, low: 1 }
    
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
   * Research functionality - 원본 claude-task-master 로직
   */
  async research(topic: string, context?: string): Promise<string> {
    const systemPrompt = `You are a senior software architect and researcher specializing in modern development practices.
Your role is to research and provide comprehensive, actionable recommendations based on current industry standards.

Focus on:
1. Current best practices and industry standards
2. Latest stable versions of tools/frameworks
3. Real-world implementation guidance
4. Security and performance considerations
5. Common pitfalls and how to avoid them

Provide specific, practical advice that developers can immediately apply.`

    const userPrompt = `Research the following topic and provide detailed implementation recommendations:

Topic: ${topic}
${context ? `Context: ${context}` : ''}

Please include:
1. Current best practices (2024-2025)
2. Recommended libraries/frameworks with specific versions
3. Architecture patterns and implementation strategies
4. Security considerations and common vulnerabilities
5. Performance optimization techniques
6. Testing strategies
7. Common pitfalls and how to avoid them
8. Code examples where applicable`

    try {
      this.logger.info(`Researching topic: ${topic}`)
      
      const response = await generateText({
        model: this.model,
        system: systemPrompt,
        prompt: userPrompt,
        temperature: 0.7,
        maxTokens: 3000
      })

      return response.text
      
    } catch (error) {
      this.logger.error(`Research error: ${error}`)
      throw error
    }
  }

  /**
   * 원본 오픈소스의 의존성 검증 로직
   */
  private validateAndFixDependencies(tasks: Task[]): Task[] {
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
      // 순환 의존성 확인 (간단한 버전)
      return !this.hasCircularDependency(task, tasks)
    })
  }

  /**
   * 서브태스크 의존성 검증 (원본 로직)
   */
  private validateSubtaskDependencies(subtasks: Subtask[], parentTaskId: number): Subtask[] {
    const subtaskIds = new Set(subtasks.map(s => s.id))
    
    return subtasks.map(subtask => ({
      ...subtask,
      status: subtask.status || 'pending',
      dependencies: subtask.dependencies.filter(dep => {
        // 자기 참조 제거
        if (dep === subtask.id) return false
        // 존재하지 않는 서브태스크 참조 제거
        if (!subtaskIds.has(dep)) return false
        return true
      })
    }))
  }

  /**
   * 의존성 만족 여부 확인
   */
  private areDependenciesSatisfied(task: Task, allTasks: Task[]): boolean {
    return task.dependencies.every(depId => {
      const depTask = allTasks.find(t => t.id === depId)
      return depTask?.status === 'done'
    })
  }

  /**
   * 다음 서브태스크 찾기
   */
  private getNextSubtask(subtasks: Subtask[]): Subtask | null {
    const available = subtasks.filter(st => 
      st.status === 'pending' && 
      st.dependencies.every(dep => {
        const depSubtask = subtasks.find(s => s.id === dep)
        return depSubtask?.status === 'done'
      })
    )

    return available[0] || null
  }

  /**
   * 순환 의존성 확인 (간단한 버전)
   */
  private hasCircularDependency(task: Task, allTasks: Task[]): boolean {
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
}

// Export singleton instance
export const taskMasterAI = new TaskMasterAI()