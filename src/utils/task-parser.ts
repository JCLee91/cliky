import { Task } from '@/types/task'
import { calculateTaskComplexity } from '@/utils/task-complexity'

/**
 * Parse a single line of JSON into a Task object
 * @param line - The raw line to parse
 * @param projectId - The project ID (optional, can be set later)
 * @returns Task object or null if parsing fails
 */
export function parseTaskLine(line: string, projectId: string = ''): Task | null {
  const trimmedLine = line.trim()
  if (!trimmedLine) return null

  try {
    // Remove markdown code blocks if present
    const cleanLine = trimmedLine.replace(/^```(json)?|```$/g, '').trim()
    if (!cleanLine) return null
    
    const task = JSON.parse(cleanLine)
    
    // Validate required fields
    if (!task.id || !task.title || !task.description) {
      return null
    }
    
    // Create task object with normalized properties
    return {
      id: task.id.toString(), // Ensure string ID
      project_id: projectId,
      title: task.title,
      description: task.description,
      priority: task.priority || 'medium',
      estimated_time: task.estimatedTime || task.estimated_time || '',
      dependencies: task.dependencies || [],
      order_index: task.id,
      status: task.status || 'todo',
      created_at: new Date().toISOString(),
      details: task.details,
      testStrategy: task.testStrategy,
      acceptanceCriteria: task.acceptanceCriteria,
      complexity: calculateTaskComplexity({
        title: task.title,
        description: task.description,
        details: task.details
      })
    }
  } catch {
    // Invalid JSON or other parsing error
    return null
  }
}

/**
 * Parse multiple lines of JSON into Task objects
 * @param lines - Array of lines to parse
 * @param projectId - The project ID (optional, can be set later)
 * @returns Array of successfully parsed Task objects
 */
export function parseTaskLines(lines: string[], projectId: string = ''): Task[] {
  const tasks: Task[] = []
  
  for (const line of lines) {
    const task = parseTaskLine(line, projectId)
    if (task) {
      tasks.push(task)
    }
  }
  
  return tasks
}