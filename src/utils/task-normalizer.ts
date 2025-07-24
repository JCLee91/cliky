/**
 * Normalize task properties from various formats to consistent camelCase
 */
export function normalizeTaskForClient(task: any) {
  return {
    ...task,
    estimatedTime: task.estimated_time || task.estimatedTime,
    testStrategy: task.test_strategy || task.testStrategy,
    acceptanceCriteria: task.acceptance_criteria || task.acceptanceCriteria,
    // Remove snake_case versions
    estimated_time: undefined,
    test_strategy: undefined,
    acceptance_criteria: undefined
  }
}

/**
 * Convert task properties to snake_case for database storage
 */
export function normalizeTaskForDatabase(task: any) {
  const normalized = {
    ...task,
    estimated_time: task.estimatedTime || task.estimated_time,
    test_strategy: task.testStrategy || task.test_strategy,
    acceptance_criteria: task.acceptanceCriteria || task.acceptance_criteria
  }
  
  // Remove camelCase versions for database
  delete normalized.estimatedTime
  delete normalized.testStrategy
  delete normalized.acceptanceCriteria
  
  return normalized
}