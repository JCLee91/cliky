/**
 * Parse PRD Prompts - 원본 claude-task-master 프롬프트 완전 복제
 */

export interface TaskMasterPromptParams {
  prdContent: string
  numTasks: number
  nextId: number
  defaultTaskPriority: 'high' | 'medium' | 'low'
  research: boolean
  projectContext?: string
}

export interface PromptResult {
  systemPrompt: string
  userPrompt: string
}

/**
 * 원본 claude-task-master parse-prd 프롬프트 (완전 복제)
 */
export function getTaskMasterPrompt(params: TaskMasterPromptParams): PromptResult {
  const {
    prdContent,
    numTasks,
    nextId,
    defaultTaskPriority,
    research,
    projectContext = ''
  } = params

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
- Each task must have a unique sequential ID starting from ${nextId}
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
    "generatedAt": "2024-current-date"
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

Generate exactly ${numTasks} tasks with proper dependencies and sequencing. Start task IDs from ${nextId}.
Output valid JSON only, no additional text.`

  return {
    systemPrompt,
    userPrompt
  }
}