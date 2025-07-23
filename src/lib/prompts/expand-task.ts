/**
 * Expand Task Prompts - 원본 claude-task-master 프롬프트 완전 복제
 */

interface Task {
  id: number
  title: string
  description: string
  details?: string
}

export interface ExpandTaskPromptParams {
  task: Task
  numSubtasks: number
  projectContext: string
  additionalContext: string
  complexityReasoningContext: string
  expansionPrompt: 'default' | 'complexity-report' | 'research'
}

export interface PromptResult {
  systemPrompt: string
  userPrompt: string
}

/**
 * 원본 claude-task-master expand-task 프롬프트 (완전 복제)
 */
export function getExpandTaskPrompt(params: ExpandTaskPromptParams): PromptResult {
  const {
    task,
    numSubtasks,
    projectContext,
    additionalContext,
    complexityReasoningContext,
    expansionPrompt
  } = params

  // 3가지 프롬프트 변형 (원본 오픈소스 방식)
  const prompts = {
    'default': getDefaultExpandPrompt,
    'complexity-report': getComplexityReportPrompt,
    'research': getResearchPrompt
  }

  return prompts[expansionPrompt](params)
}

/**
 * 기본 확장 프롬프트
 */
function getDefaultExpandPrompt(params: ExpandTaskPromptParams): PromptResult {
  const { task, numSubtasks, projectContext, additionalContext } = params

  const systemPrompt = `You are an expert software architect specializing in breaking down complex development tasks into manageable, well-sequenced subtasks.

Your role is to:
1. Analyze the provided task and break it down into ${numSubtasks} actionable subtasks
2. Create logical dependencies between subtasks within the same parent task
3. Ensure each subtask is completable in 1-4 hours of focused work
4. Provide specific implementation guidance for each subtask
5. Include appropriate testing strategies

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
${additionalContext ? `ADDITIONAL CONTEXT:\n${additionalContext}\n` : ''}

Create exactly ${numSubtasks} subtasks with IDs starting from "${task.id}.1".
Each subtask should be completable in 1-4 hours.
Output valid JSON only, no additional text.`

  return { systemPrompt, userPrompt }
}

/**
 * 복잡성 보고서 기반 확장 프롬프트
 */
function getComplexityReportPrompt(params: ExpandTaskPromptParams): PromptResult {
  const { task, numSubtasks, projectContext, complexityReasoningContext } = params

  const systemPrompt = `You are a senior technical architect with expertise in complexity analysis and task decomposition.

Your role is to:
1. Analyze the complexity factors of the provided task
2. Break it down into ${numSubtasks} subtasks based on complexity boundaries
3. Address each complexity dimension with appropriate subtasks
4. Ensure proper risk mitigation through subtask design
5. Account for technical debt and maintainability concerns

COMPLEXITY FACTORS TO CONSIDER:
- Technical complexity and implementation challenges
- Integration points and external dependencies
- Performance and scalability requirements
- Security and compliance considerations
- Testing and validation complexity
- Maintenance and operational concerns

CRITICAL REQUIREMENTS:
- Output MUST be valid JSON only, no additional text
- Subtask IDs: "${task.id}.1", "${task.id}.2", etc.
- Address high-complexity areas with focused subtasks
- Include risk mitigation strategies in details
- Provide comprehensive testing approaches

Output Schema (JSON only):
{
  "subtasks": [
    {
      "id": "${task.id}.1",
      "title": "Complexity-focused subtask title",
      "description": "Description addressing specific complexity aspects",
      "dependencies": ["${task.id}.1"],
      "details": "Implementation details with complexity mitigation strategies",
      "testStrategy": "Testing strategy addressing complexity risks" | null,
      "status": "pending"
    }
  ]
}`

  const userPrompt = `Analyze and break down this complex task into ${numSubtasks} subtasks based on complexity factors:

PARENT TASK:
ID: ${task.id}
Title: ${task.title}
Description: ${task.description}
${task.details ? `Details: ${task.details}` : ''}

COMPLEXITY ANALYSIS:
${complexityReasoningContext}

${projectContext ? `PROJECT CONTEXT:\n${projectContext}\n` : ''}

Focus on complexity boundaries and risk mitigation.
Create exactly ${numSubtasks} subtasks with proper complexity handling.
Output valid JSON only, no additional text.`

  return { systemPrompt, userPrompt }
}

/**
 * 연구 모드 확장 프롬프트
 */
function getResearchPrompt(params: ExpandTaskPromptParams): PromptResult {
  const { task, numSubtasks, projectContext, additionalContext } = params

  const systemPrompt = `You are a research-focused software architect specializing in modern development practices and cutting-edge technologies.

Your role is to:
1. Research and incorporate latest 2024-2025 best practices
2. Break down the task into ${numSubtasks} research-informed subtasks
3. Recommend modern tools, libraries, and patterns
4. Include performance and security best practices
5. Suggest contemporary testing and deployment strategies

RESEARCH FOCUS AREAS:
- Latest stable versions of relevant technologies
- Modern architectural patterns and practices
- Performance optimization techniques
- Security best practices and threat mitigation
- Testing strategies and tools
- CI/CD and deployment best practices

CRITICAL REQUIREMENTS:
- Output MUST be valid JSON only, no additional text
- Subtask IDs: "${task.id}.1", "${task.id}.2", etc.
- Incorporate 2024-2025 technology trends
- Include specific library/framework versions
- Provide modern testing and validation approaches

Output Schema (JSON only):
{
  "subtasks": [
    {
      "id": "${task.id}.1",
      "title": "Research-informed subtask title",
      "description": "Description incorporating modern practices",
      "dependencies": ["${task.id}.1"],
      "details": "Implementation with latest tools, patterns, and best practices",
      "testStrategy": "Modern testing approach with current tools" | null,
      "status": "pending"
    }
  ]
}`

  const userPrompt = `Break down this task using modern development practices and latest technology recommendations:

PARENT TASK:
ID: ${task.id}
Title: ${task.title}
Description: ${task.description}
${task.details ? `Details: ${task.details}` : ''}

${projectContext ? `PROJECT CONTEXT:\n${projectContext}\n` : ''}
${additionalContext ? `ADDITIONAL CONTEXT:\n${additionalContext}\n` : ''}

RESEARCH REQUIREMENTS:
- Use latest stable versions (2024-2025)
- Incorporate modern best practices
- Include performance and security considerations
- Suggest contemporary tools and patterns

Create exactly ${numSubtasks} research-informed subtasks.
Output valid JSON only, no additional text.`

  return { systemPrompt, userPrompt }
}