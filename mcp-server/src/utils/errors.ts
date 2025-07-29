/**
 * Custom error classes for better error handling
 */

export class TaskNotFoundError extends Error {
  constructor(taskId: string) {
    super(`Task ${taskId} not found`);
    this.name = 'TaskNotFoundError';
  }
}

export class ProjectNotFoundError extends Error {
  constructor(message: string = 'No projects found for this user') {
    super(message);
    this.name = 'ProjectNotFoundError';
  }
}

export class AccessDeniedError extends Error {
  constructor(message: string = 'Access denied') {
    super(message);
    this.name = 'AccessDeniedError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Error handler that returns appropriate error messages without exposing internals
 */
export function handleError(error: unknown): string {
  console.error('Error occurred:', error);

  if (error instanceof TaskNotFoundError || 
      error instanceof ProjectNotFoundError ||
      error instanceof AccessDeniedError ||
      error instanceof ValidationError) {
    return error.message;
  }

  if (error instanceof Error && error.message.includes('JWT')) {
    return 'Authentication error. Please check your credentials.';
  }

  if (error instanceof Error && error.message.includes('Network')) {
    return 'Network error. Please check your connection.';
  }

  // Generic error message for unknown errors
  return 'An unexpected error occurred. Please try again later.';
}