import { Task } from '@/types/task'

// 복잡도를 나타내는 키워드들
const COMPLEXITY_KEYWORDS = [
  'integration',
  'authentication',
  'authorization',
  'deployment',
  'migration',
  'refactor',
  'optimization',
  'architecture',
  'security',
  'performance',
  'database',
  'api',
  'third-party',
  'payment',
  'real-time',
  'websocket',
  'microservice'
]

/**
 * 태스크의 복잡도를 계산합니다 (0-10 점수)
 */
export function calculateTaskComplexity(task: Task): number {
  let complexity = 0

  // 1. 예상 시간 기준 (6시간 이상: +3점)
  const estimatedHours = parseEstimatedHours(task.estimated_time)
  if (estimatedHours >= 6) {
    complexity += 3
  } else if (estimatedHours >= 4) {
    complexity += 2
  } else if (estimatedHours >= 2) {
    complexity += 1
  }

  // 2. 설명 길이 (200자 이상: +2점)
  const totalLength = (task.description?.length || 0) + (task.details?.length || 0)
  if (totalLength >= 200) {
    complexity += 2
  } else if (totalLength >= 100) {
    complexity += 1
  }

  // 3. 의존성 개수 (2개 이상: +2점)
  if (task.dependencies && task.dependencies.length >= 2) {
    complexity += 2
  } else if (task.dependencies && task.dependencies.length >= 1) {
    complexity += 1
  }

  // 4. 우선순위 (high: +2점)
  if (task.priority === 'high') {
    complexity += 2
  } else if (task.priority === 'medium') {
    complexity += 1
  }

  // 5. 복잡도 키워드 포함 (최대 +1점)
  const content = `${task.title} ${task.description} ${task.details || ''}`.toLowerCase()
  const hasComplexityKeyword = COMPLEXITY_KEYWORDS.some(keyword => 
    content.includes(keyword)
  )
  if (hasComplexityKeyword) {
    complexity += 1
  }

  return Math.min(complexity, 10) // 최대 10점
}

/**
 * 예상 시간 문자열을 시간 단위로 파싱
 */
function parseEstimatedHours(timeStr: string): number {
  if (!timeStr) return 0
  
  const match = timeStr.match(/(\d+)\s*(hour|hr|시간)/i)
  if (match) {
    return parseInt(match[1])
  }
  
  return 0
}

/**
 * 태스크가 복잡한지 여부를 판단
 */
export function isComplexTask(task: Task): boolean {
  return calculateTaskComplexity(task) >= 7
}

/**
 * 태스크 목록에서 복잡한 태스크들을 필터링
 */
export function filterComplexTasks(tasks: Task[]): Task[] {
  return tasks.filter(isComplexTask)
}