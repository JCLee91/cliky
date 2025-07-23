/**
 * Task Master Utilities
 * Utility functions ported from claude-task-master
 */

import { z } from 'zod'

// Task and Subtask Schemas
export const subtaskSchema = z
  .object({
    id: z
      .number()
      .int()
      .positive()
      .describe('Sequential subtask ID starting from 1'),
    title: z.string().min(5).describe('Clear, specific title for the subtask'),
    description: z
      .string()
      .min(10)
      .describe('Detailed description of the subtask'),
    dependencies: z
      .array(z.string())
      .describe(
        'Array of subtask dependencies within the same parent task. Use format ["parentTaskId.1", "parentTaskId.2"]. Subtasks can only depend on siblings, not external tasks.'
      ),
    details: z.string().min(20).describe('Implementation details and guidance'),
    status: z
      .string()
      .describe(
        'The current status of the subtask (should be pending initially)'
      ),
    testStrategy: z
      .string()
      .nullable()
      .describe('Approach for testing this subtask')
      .default('')
  })
  .strict()

export const subtaskArraySchema = z.array(subtaskSchema)

export const subtaskWrapperSchema = z.object({
  subtasks: subtaskArraySchema.describe('The array of generated subtasks.')
})

// Task schema for main task parsing
export const taskSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(5).max(100),
  description: z.string().min(10),
  priority: z.enum(['high', 'medium', 'low']),
  dependencies: z.array(z.number().int().positive()),
  details: z.string(),
  testStrategy: z.string().nullable().default(''),
  subtasks: z.array(subtaskSchema).optional()
})

export const taskArraySchema = z.array(taskSchema)

export const taskWrapperSchema = z.object({
  tasks: taskArraySchema.describe('The array of generated tasks.')
})

/**
 * Parse subtasks from AI's text response with cleanup and validation
 */
export function parseSubtasksFromText(
  text: string,
  startId: number,
  expectedCount: number,
  parentTaskId: number,
  logger: { debug: (msg: string) => void; warn: (msg: string) => void; error: (msg: string) => void }
): any[] {
  if (typeof text !== 'string') {
    logger.error(
      `AI response text is not a string. Received type: ${typeof text}, Value: ${text}`
    )
    throw new Error('AI response text is not a string.')
  }

  if (!text || text.trim() === '') {
    throw new Error('AI response text is empty after trimming.')
  }

  const originalTrimmedResponse = text.trim()
  let jsonToParse = originalTrimmedResponse

  logger.debug(
    `Original AI Response for parsing (full length: ${jsonToParse.length}): ${jsonToParse.substring(0, 1000)}...`
  )

  // Pre-emptive cleanup for known AI JSON issues
  // Fix for "dependencies": , or "dependencies":,
  if (jsonToParse.includes('"dependencies":')) {
    const malformedPattern = /"dependencies":\s*,/g
    if (malformedPattern.test(jsonToParse)) {
      logger.warn('Attempting to fix malformed "dependencies": , issue.')
      jsonToParse = jsonToParse.replace(
        malformedPattern,
        '"dependencies": [],'
      )
      logger.debug(
        `JSON after fixing "dependencies": ${jsonToParse.substring(0, 500)}...`
      )
    }
  }

  let parsedObject: any
  let primaryParseAttemptFailed = false

  // Attempt 1: Simple Parse (with optional Markdown cleanup)
  logger.debug('Attempting simple parse...')
  try {
    // Check for markdown code block
    const codeBlockMatch = jsonToParse.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    let contentToParseDirectly = jsonToParse
    if (codeBlockMatch && codeBlockMatch[1]) {
      logger.debug('Detected markdown code block. Extracting content...')
      contentToParseDirectly = codeBlockMatch[1].trim()
    }
    parsedObject = JSON.parse(contentToParseDirectly)
    logger.debug('Simple parse successful.')
  } catch (parseError: any) {
    logger.warn(`Simple parse failed: ${parseError.message}`)
    primaryParseAttemptFailed = true
  }

  // Attempt 2: Extract JSON from mixed content
  if (primaryParseAttemptFailed) {
    logger.debug('Attempting to extract JSON from mixed content...')
    const jsonMatch = jsonToParse.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        parsedObject = JSON.parse(jsonMatch[0])
        logger.debug('JSON extraction successful.')
      } catch (extractError: any) {
        logger.error(`JSON extraction failed: ${extractError.message}`)
        throw new Error(
          `Failed to parse AI response as JSON: ${extractError.message}`
        )
      }
    } else {
      throw new Error('No JSON object found in AI response.')
    }
  }

  // Validate and extract subtasks
  let subtasks: any[]
  if (parsedObject.subtasks && Array.isArray(parsedObject.subtasks)) {
    subtasks = parsedObject.subtasks
  } else if (Array.isArray(parsedObject)) {
    subtasks = parsedObject
  } else {
    throw new Error(
      'Parsed object does not contain a "subtasks" array or is not an array itself.'
    )
  }

  // Validate with Zod
  try {
    const validatedWrapper = subtaskWrapperSchema.parse({ subtasks })
    subtasks = validatedWrapper.subtasks
  } catch (zodError: any) {
    logger.error(`Zod validation failed: ${zodError.message}`)
    throw new Error(`Invalid subtask structure: ${zodError.message}`)
  }

  // Fix IDs if needed
  subtasks.forEach((subtask, index) => {
    const expectedId = startId + index
    if (subtask.id !== expectedId) {
      logger.warn(
        `Correcting subtask ID from ${subtask.id} to ${expectedId}`
      )
      subtask.id = expectedId
    }
  })

  return subtasks
}

/**
 * Parse tasks from AI's text response
 */
export function parseTasksFromText(
  text: string,
  startId: number,
  expectedCount: number,
  logger: { debug: (msg: string) => void; warn: (msg: string) => void; error: (msg: string) => void }
): any[] {
  if (typeof text !== 'string') {
    logger.error(
      `AI response text is not a string. Received type: ${typeof text}, Value: ${text}`
    )
    throw new Error('AI response text is not a string.')
  }

  if (!text || text.trim() === '') {
    throw new Error('AI response text is empty after trimming.')
  }

  const originalTrimmedResponse = text.trim()
  const jsonToParse = originalTrimmedResponse

  logger.debug(
    `Original AI Response for parsing (full length: ${jsonToParse.length}): ${jsonToParse.substring(0, 1000)}...`
  )

  let parsedObject: any

  // Attempt to parse JSON
  try {
    // Check for markdown code block
    const codeBlockMatch = jsonToParse.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    let contentToParseDirectly = jsonToParse
    if (codeBlockMatch && codeBlockMatch[1]) {
      logger.debug('Detected markdown code block. Extracting content...')
      contentToParseDirectly = codeBlockMatch[1].trim()
    }
    parsedObject = JSON.parse(contentToParseDirectly)
    logger.debug('Simple parse successful.')
  } catch (parseError: any) {
    logger.warn(`Simple parse failed: ${parseError.message}`)
    
    // Try to extract JSON from mixed content
    const jsonMatch = jsonToParse.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        parsedObject = JSON.parse(jsonMatch[0])
        logger.debug('JSON extraction successful.')
      } catch (extractError: any) {
        logger.error(`JSON extraction failed: ${extractError.message}`)
        throw new Error(
          `Failed to parse AI response as JSON: ${extractError.message}`
        )
      }
    } else {
      throw new Error('No JSON object found in AI response.')
    }
  }

  // Validate and extract tasks
  let tasks: any[]
  if (parsedObject.tasks && Array.isArray(parsedObject.tasks)) {
    tasks = parsedObject.tasks
  } else if (Array.isArray(parsedObject)) {
    tasks = parsedObject
  } else {
    throw new Error(
      'Parsed object does not contain a "tasks" array or is not an array itself.'
    )
  }

  // Validate with Zod
  try {
    const validatedWrapper = taskWrapperSchema.parse({ tasks })
    tasks = validatedWrapper.tasks
  } catch (zodError: any) {
    logger.error(`Zod validation failed: ${zodError.message}`)
    throw new Error(`Invalid task structure: ${zodError.message}`)
  }

  // Fix IDs if needed
  tasks.forEach((task, index) => {
    const expectedId = startId + index
    if (task.id !== expectedId) {
      logger.warn(
        `Correcting task ID from ${task.id} to ${expectedId}`
      )
      task.id = expectedId
    }
  })

  return tasks
}

/**
 * Simple logger implementation
 */
export const createLogger = (prefix: string = 'TaskMaster') => ({
  debug: (msg: string) => console.log(`[${prefix}] DEBUG:`, msg),
  info: (msg: string) => console.log(`[${prefix}] INFO:`, msg),
  warn: (msg: string) => console.warn(`[${prefix}] WARN:`, msg),
  error: (msg: string) => console.error(`[${prefix}] ERROR:`, msg)
})
