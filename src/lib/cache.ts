interface CacheItem<T> {
  data: T
  timestamp: number
  version: string
}

export class CacheManager {
  private static VERSION = '1.0.0' // Bump this to invalidate all caches
  
  static set<T>(key: string, data: T, ttlMinutes: number = 5): void {
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        version: this.VERSION
      }
      localStorage.setItem(key, JSON.stringify(item))
    } catch (error) {
      console.warn('[Cache] Failed to save:', key, error)
    }
  }
  
  static get<T>(key: string, ttlMinutes: number = 5): T | null {
    try {
      const cached = localStorage.getItem(key)
      if (!cached) return null
      
      const item: CacheItem<T> = JSON.parse(cached)
      
      // Version check
      if (item.version !== this.VERSION) {
        this.remove(key)
        return null
      }
      
      // TTL check
      const isExpired = Date.now() - item.timestamp > ttlMinutes * 60 * 1000
      if (isExpired) {
        this.remove(key)
        return null
      }
      
      return item.data
    } catch (error) {
      console.warn('[Cache] Failed to get:', key, error)
      this.remove(key)
      return null
    }
  }
  
  static remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('[Cache] Failed to remove:', key, error)
    }
  }
  
  static clear(): void {
    try {
      // Only clear our app's cache keys
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('cliky_')) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('[Cache] Failed to clear:', error)
    }
  }
}

// Cache keys
export const CACHE_KEYS = {
  PROJECTS: 'cliky_projects',
  USER_SESSION: 'cliky_user_session',
  TASKS: (projectId: string) => `cliky_tasks_${projectId}`,
} as const