/**
 * TaskMaster API - 프로덕션 준비 완료
 * 오픈소스 claude-task-master 완전 통합
 * TRD 생성 및 스트리밍 기능 포함
 */

import { NextRequest, NextResponse } from 'next/server'
import { taskMasterCore, TaskMasterCoreService } from '@/lib/taskmaster/core'
import { z } from 'zod'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { streamText, streamObject } from 'ai'
import { ProjectFormData } from '@/types/project'
import { PRD_SYSTEM_PROMPT, generatePRDPrompt } from '@/lib/prompts/prd-generation'
import { generateSearchQueriesWithAI } from '@/lib/prompts/search-queries'

const ParsePRDRequestSchema = z.object({
  action: z.literal('parse-prd'),
  prdContent: z.string().min(1),
  options: z.object({
    numTasks: z.number().min(1).max(20).optional(),
    research: z.boolean().optional(),
    defaultTaskPriority: z.enum(['high', 'medium', 'low']).optional(),
    projectContext: z.string().optional()
  }).optional()
})

const ExpandTaskRequestSchema = z.object({
  action: z.literal('expand-task'),
  task: z.object({
    id: z.number(),
    title: z.string(),
    description: z.string(),
    details: z.string().nullable(),
    priority: z.enum(['high', 'medium', 'low']),
    dependencies: z.array(z.number()),
    status: z.enum(['pending', 'in-progress', 'done', 'completed', 'cancelled']),
    testStrategy: z.string().nullable()
  }),
  options: z.object({
    numSubtasks: z.number().min(1).max(10).optional(),
    research: z.boolean().optional(),
    projectContext: z.string().optional(),
    complexityReasoningContext: z.string().optional(),
    expansionPrompt: z.enum(['default', 'complexity-report', 'research']).optional()
  }).optional()
})

const NextTaskRequestSchema = z.object({
  action: z.literal('next-task'),
  tasks: z.array(z.object({
    id: z.number(),
    title: z.string(),
    description: z.string(),
    details: z.string().nullable(),
    priority: z.enum(['high', 'medium', 'low']),
    dependencies: z.array(z.number()),
    status: z.enum(['pending', 'in-progress', 'done', 'completed', 'cancelled']),
    testStrategy: z.string().nullable(),
    subtasks: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      dependencies: z.array(z.string()),
      details: z.string(),
      status: z.enum(['pending', 'in-progress', 'done']),
      testStrategy: z.string().nullable()
    })).optional()
  }))
})

const UpdateTaskRequestSchema = z.object({
  action: z.literal('update-task'),
  tasks: z.array(z.any()),
  taskId: z.number(),
  status: z.enum(['pending', 'in-progress', 'done', 'completed', 'cancelled']),
  subtaskId: z.string().optional()
})

const ProgressRequestSchema = z.object({
  action: z.literal('calculate-progress'),
  tasks: z.array(z.any())
})

const GeneratePRDRequestSchema = z.object({
  action: z.literal('generate-prd'),
  projectData: z.object({
    name: z.string(),
    idea: z.string(),
    features: z.array(z.string()).optional(),
    userFlow: z.string().optional(),
    techPreferences: z.array(z.string()).optional()
  }),
  systemPrompt: z.string().optional()
})

const GenerateTasksStreamingRequestSchema = z.object({
  action: z.literal('generate-tasks-streaming'),
  prdContent: z.string().min(1),
  options: z.object({
    numTasks: z.number().min(1).max(20).optional(),
    research: z.boolean().optional(),
    defaultTaskPriority: z.enum(['high', 'medium', 'low']).optional(),
    projectContext: z.union([
      z.string(),
      z.object({
        name: z.string(),
        idea: z.string(),
        features: z.array(z.string()).optional(),
        techPreferences: z.array(z.string()).optional()
      })
    ]).optional()
  }).optional()
})

const ExpandComplexTasksRequestSchema = z.object({
  action: z.literal('expand-complex-tasks'),
  tasks: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    details: z.string().optional(),
    priority: z.enum(['high', 'medium', 'low']),
    estimated_time: z.string()
  })),
  projectContext: z.string().optional()
})

// Task Master 응답 스키마 (스트리밍용)
const TaskMasterResponseSchema = z.object({
  tasks: z.array(z.object({
    id: z.number(),
    title: z.string(),
    description: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
    dependencies: z.array(z.number()),
    details: z.string().optional(),
    testStrategy: z.string().nullable().optional(),
    estimatedTime: z.string().optional(),
    status: z.enum(['pending', 'in-progress', 'done', 'cancelled', 'deferred', 'review']).optional()
  })),
  metadata: z.object({
    projectName: z.string(),
    totalTasks: z.number(),
    sourceFile: z.string(),
    generatedAt: z.string()
  }).optional()
})

export async function POST(request: NextRequest) {
  try {
    let body = await request.json()
    
    // Debug logging
    console.log('=== TASKMASTER API DEBUG ===')
    console.log('Received body:', JSON.stringify(body, null, 2))
    console.log('Body keys:', Object.keys(body))
    console.log('Has prompt?', 'prompt' in body)
    console.log('Has action?', 'action' in body)
    console.log('Body.body exists?', body.body !== undefined)
    
    // Handle useCompletion hook format
    // The hook sends: { prompt: '', ...actualBodyParams }
    // We need to extract the actual body parameters
    if ('prompt' in body && !body.action) {
      console.log('useCompletion format detected')
      console.log('Original body structure:', JSON.stringify(body, null, 2))
      
      // If body.body exists, use it (old format)
      if (body.body && typeof body.body === 'object') {
        console.log('Found body.body - using nested body')
        body = body.body
      } else {
        // Otherwise, the actual parameters are merged at the top level
        // Remove the prompt field and use the rest
        const { prompt, ...actualBody } = body
        console.log('No body.body - extracting from top level')
        console.log('Extracted body:', JSON.stringify(actualBody, null, 2))
        body = actualBody
      }
    }
    
    // 액션별 스키마 검증
    let validatedBody
    try {
      switch (body.action) {
        case 'parse-prd':
          validatedBody = ParsePRDRequestSchema.parse(body)
          break
        case 'expand-task':
          validatedBody = ExpandTaskRequestSchema.parse(body)
          break
        case 'next-task':
          validatedBody = NextTaskRequestSchema.parse(body)
          break
        case 'update-task':
          validatedBody = UpdateTaskRequestSchema.parse(body)
          break
        case 'calculate-progress':
          validatedBody = ProgressRequestSchema.parse(body)
          break
        case 'generate-prd':
          validatedBody = GeneratePRDRequestSchema.parse(body)
          break
        case 'generate-tasks-streaming':
          validatedBody = GenerateTasksStreamingRequestSchema.parse(body)
          break
        case 'expand-complex-tasks':
          validatedBody = ExpandComplexTasksRequestSchema.parse(body)
          break
        default:
          return NextResponse.json(
            { error: 'Invalid action. Supported: parse-prd, expand-task, next-task, update-task, calculate-progress, generate-tasks-streaming, expand-complex-tasks' }, 
            { status: 400 }
          )
      }
    } catch (error) {
      console.error('=== VALIDATION ERROR ===')
      console.error('Error:', error)
      console.error('Body:', JSON.stringify(body, null, 2))
      console.error('Body type:', typeof body)
      console.error('Body keys:', Object.keys(body))
      console.error('======================')
      
      return NextResponse.json(
        { 
          error: 'Invalid request format', 
          details: error instanceof Error ? error.message : 'Validation failed',
          receivedBody: body,
          receivedAction: body?.action,
          expectedActions: ['parse-prd', 'expand-task', 'next-task', 'update-task', 'calculate-progress', 'generate-prd', 'generate-tasks-streaming', 'expand-complex-tasks']
        },
        { status: 400 }
      )
    }

    const { action } = validatedBody

    switch (action) {
      case 'parse-prd': {
        const { prdContent, options = {} } = validatedBody
        
        const result = await taskMasterCore.parsePRD(prdContent, options)

        return NextResponse.json({
          success: true,
          data: result,
          message: `Successfully generated ${result.tasks.length} tasks from PRD`
        })
      }

      case 'expand-task': {
        const { task, options = {} } = validatedBody
        
        const result = await taskMasterCore.expandTask(task, options)

        return NextResponse.json({
          success: true,
          data: result,
          message: `Successfully expanded task ${task.id} into ${result.subtasks.length} subtasks`
        })
      }

      case 'next-task': {
        const { tasks } = validatedBody
        
        const nextTask = taskMasterCore.getNextTask(tasks)

        return NextResponse.json({
          success: true,
          data: { nextTask },
          message: nextTask 
            ? `Next recommended task: ${nextTask.title}`
            : 'No tasks available to work on'
        })
      }

      case 'update-task': {
        const { tasks, taskId, status, subtaskId } = validatedBody
        
        let updatedTasks
        if (subtaskId) {
          // 서브태스크 상태 업데이트
          updatedTasks = taskMasterCore.updateSubtaskStatus(tasks, taskId, subtaskId, status as any)
        } else {
          // 메인 태스크 상태 업데이트
          updatedTasks = taskMasterCore.updateTaskStatus(tasks, taskId, status)
        }

        return NextResponse.json({
          success: true,
          data: { tasks: updatedTasks },
          message: `Task ${taskId}${subtaskId ? `.${subtaskId}` : ''} status updated to ${status}`
        })
      }

      case 'calculate-progress': {
        const { tasks } = validatedBody
        
        const progress = taskMasterCore.calculateProgress(tasks)

        return NextResponse.json({
          success: true,
          data: progress,
          message: `Project is ${progress.percentage}% complete`
        })
      }

      case 'generate-prd': {
        const { projectData, systemPrompt } = validatedBody as z.infer<typeof GeneratePRDRequestSchema>
        
        // Brave Search로 최신 기술 트렌드 검색
        let searchResultsText = ''
        try {
          // AI를 사용하여 검색 쿼리 생성
          const searchQueries = await generateSearchQueriesWithAI(projectData as ProjectFormData)
          
          // 검색 실행 (최대 3개 쿼리, 1초 간격)
          const allSearchResults = []
          for (const query of searchQueries.slice(0, 3)) {
            try {
              const searchResponse = await fetch(`${request.nextUrl.origin}/api/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  query, 
                  count: 3, 
                  freshness: 'pm' // past month
                })
              })
              
              if (searchResponse.ok) {
                const searchData = await searchResponse.json()
                const results = searchData.data?.results || []
                allSearchResults.push(...results)
              }
              
              // Rate limit 대응: 1초 대기 (마지막 쿼리 제외)
              if (searchQueries.indexOf(query) < searchQueries.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000))
              }
            } catch (error) {
              // Silent fail for individual search queries
            }
          }
          
          if (allSearchResults.length > 0) {
            searchResultsText = allSearchResults
              .map((result: any) => `- ${result.title}: ${result.description} (${result.url})`)
              .join('\n')
          }
        } catch (searchError) {
          // 검색 실패해도 TRD 생성은 계속 진행
        }
        
        const prompt = generatePRDPrompt(projectData as ProjectFormData, searchResultsText)
        const aiModel = process.env.AI_MODEL || 'gpt-4o'
        
        const result = streamText({
          model: openai(aiModel),
          system: systemPrompt || PRD_SYSTEM_PROMPT,
          prompt: prompt,
          temperature: 0.7,
          maxTokens: 6000,
        })

        return result.toDataStreamResponse()
      }

      case 'generate-tasks-streaming': {
        const { prdContent, options = {} } = validatedBody as z.infer<typeof GenerateTasksStreamingRequestSchema>
        
        const { getTaskMasterPrompt } = await import('@/lib/prompts/parse-prd')
        
        // Convert projectContext object to string if needed
        let projectContextStr = ''
        if (options.projectContext) {
          if (typeof options.projectContext === 'string') {
            projectContextStr = options.projectContext
          } else {
            projectContextStr = `Project: ${options.projectContext.name}
Idea: ${options.projectContext.idea}
Features: ${options.projectContext.features?.join(', ') || 'N/A'}
Tech Stack: ${options.projectContext.techPreferences?.join(', ') || 'N/A'}`
          }
        }
        
        const { systemPrompt: tmSystemPrompt, userPrompt: tmUserPrompt } = getTaskMasterPrompt({
          prdContent,
          numTasks: options.numTasks || 12,
          nextId: 1,
          defaultTaskPriority: options.defaultTaskPriority || 'medium',
          research: options.research || false,
          projectContext: projectContextStr
        })

        const aiModel = process.env.AI_MODEL || 'gpt-4o'
        
        // JSON Lines 형식으로 각 태스크를 개별적으로 스트리밍하도록 수정된 프롬프트
        const numTasks = options.numTasks || 12
        const nextId = 1
        
        const jsonLinesPrompt = `${tmUserPrompt}

CRITICAL: Output each task as a separate JSON object on its own line (JSON Lines format).
Each task MUST include ALL required fields with DETAILED content.

Required fields for EACH task:
- id: Sequential number starting from ${nextId}
- title: Clear, actionable task title
- description: Comprehensive description of the task objectives
- priority: "high" | "medium" | "low"
- dependencies: Array of task IDs this depends on
- estimatedTime: Realistic time estimate (e.g., "3-4 hours")
- acceptanceCriteria: Array of specific, measurable criteria that must be met
- details: DETAILED implementation steps including:
  - Specific files to create/modify with paths
  - Key functions/components to implement
  - Required libraries/packages to install
  - Configuration changes needed
  - Code structure and patterns to follow
  - At least 3-5 numbered implementation steps
- testStrategy: SPECIFIC testing approach including:
  - Types of tests to write (unit, integration, e2e)
  - Key test scenarios to cover
  - Testing tools/frameworks to use
  - Expected test outcomes
  - At least 2-3 specific test cases

Example of PROPERLY DETAILED output:
{"id":1,"title":"Initialize Next.js 15 Project with TypeScript","description":"Set up a new Next.js 15 project with TypeScript, ESLint, and Tailwind CSS for the foundation of the application","priority":"high","dependencies":[],"estimatedTime":"2-3 hours","acceptanceCriteria":["Next.js 15 project created with TypeScript support","ESLint configured with recommended rules","Tailwind CSS integrated and working","Path aliases configured in tsconfig.json","Development server runs without errors"],"details":"1. Run 'npx create-next-app@latest' with TypeScript and Tailwind options\\n2. Configure ESLint with recommended rules in .eslintrc.json\\n3. Set up path aliases in tsconfig.json (@/components, @/lib, @/hooks)\\n4. Create initial folder structure: /components, /lib, /hooks, /types, /utils\\n5. Install additional dependencies: clsx, tailwind-merge, lucide-react\\n6. Configure Tailwind with custom theme colors and fonts\\n7. Create base layout component with responsive design","testStrategy":"1. Verify build process completes without errors\\n2. Run 'npm run lint' to ensure ESLint configuration works\\n3. Create a sample component and verify TypeScript types work correctly\\n4. Test hot reload functionality in development mode\\n5. Verify Tailwind classes apply correctly to components"}
{"id":2,"title":"Set Up Supabase Authentication System","description":"Implement complete authentication flow with Supabase including signup, login, logout, and protected routes","priority":"high","dependencies":[1],"estimatedTime":"4-5 hours","acceptanceCriteria":["Users can sign up with email/password","Users can log in and maintain sessions","Logout functionality clears all session data","Protected routes redirect unauthenticated users","Authentication state persists across page refreshes","Error messages display for invalid credentials"],"details":"1. Install @supabase/supabase-js and @supabase/auth-helpers-nextjs\\n2. Create /lib/supabase/client.ts with Supabase client configuration\\n3. Implement /app/(auth)/login/page.tsx with email/password form\\n4. Implement /app/(auth)/signup/page.tsx with validation\\n5. Create AuthContext in /contexts/auth-context.tsx for user state\\n6. Add middleware.ts for protected route handling\\n7. Implement useAuth hook in /hooks/use-auth.ts\\n8. Create /components/auth/auth-guard.tsx wrapper component\\n9. Set up Supabase RLS policies for users table","testStrategy":"1. Test signup flow with valid and invalid email formats\\n2. Verify login persists across page refreshes using cookies\\n3. Test protected route redirect when unauthenticated\\n4. Verify logout clears session and redirects to login\\n5. Test error handling for network failures\\n6. Create Cypress e2e test for complete auth flow"}

Start generating ${numTasks} tasks now:`

        try {
          const result = streamText({
            model: openai(aiModel),
            system: tmSystemPrompt,
            prompt: jsonLinesPrompt,
            temperature: 0.7,
            maxTokens: 4000
          })

          return result.toTextStreamResponse()
        } catch (streamError) {
          console.error('❌ Stream generation error:', streamError)
          throw streamError
        }
      }

      case 'expand-complex-tasks': {
        const { tasks, projectContext } = validatedBody as z.infer<typeof ExpandComplexTasksRequestSchema>
        
        const { getExpandTaskPrompt } = await import('@/lib/prompts/expand-task')
        
        // 각 복잡한 태스크에 대해 서브태스크 생성
        const expandedTasks = await Promise.all(
          tasks.map(async (task) => {
            const { systemPrompt, userPrompt } = getExpandTaskPrompt({
              task: {
                id: parseInt(task.id),
                title: task.title,
                description: task.description,
                details: task.details
              },
              numSubtasks: 4, // 각 태스크당 4개 서브태스크
              projectContext: projectContext || '',
              additionalContext: '',
              complexityReasoningContext: `This is a complex task requiring ${task.estimated_time} of work with ${task.priority} priority.`,
              expansionPrompt: 'default'
            })
            
            const { text } = await generateText({
              model: openai(process.env.AI_MODEL || 'gpt-4o'),
              system: systemPrompt,
              prompt: userPrompt,
              temperature: 0.7,
              maxTokens: 1500
            })
            
            try {
              const result = JSON.parse(text)
              return {
                taskId: task.id,
                subtasks: result.subtasks || []
              }
            } catch {
              return { taskId: task.id, subtasks: [] }
            }
          })
        )
        
        return NextResponse.json({
          success: true,
          data: { expandedTasks },
          message: `Expanded ${tasks.length} complex tasks`
        })
      }

      default:
        return NextResponse.json(
          { error: 'Action not implemented' }, 
          { status: 501 }
        )
    }

  } catch (error) {
    console.error('TaskMaster API Error:', error)
    
    // Check if it's a Zod validation error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation error',
          details: error.errors,
          timestamp: new Date().toISOString()
        }, 
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const action = searchParams.get('action')

  if (action === 'health') {
    return NextResponse.json({
      success: true,
      service: 'TaskMaster API',
      version: '1.0.0',
      status: 'healthy',
      capabilities: [
        'parse-prd',
        'expand-task', 
        'next-task',
        'update-task',
        'calculate-progress',
        'generate-prd',
        'generate-tasks-streaming'
      ],
      timestamp: new Date().toISOString()
    })
  }

  return NextResponse.json({
    success: true,
    message: 'TaskMaster API - 프로덕션 준비 완료',
    endpoints: {
      'POST /api/taskmaster': 'Main TaskMaster operations',
      'GET /api/taskmaster?action=health': 'Health check'
    },
    documentation: 'https://github.com/eyaltoledano/claude-task-master'
  })
}