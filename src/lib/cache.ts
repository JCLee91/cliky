interface CacheItem<T> {
  data: T
  timestamp: number
  version: string
}

export class CacheManager {
  private static VERSION = '1.0.0' // Bump this to invalidate all caches
  
  static set<T>(key: string, data: T, ttlMinutes: number = 5): void {
    // Check if we're in the browser
    if (typeof window === 'undefined') {
      return
    }
    
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        version: this.VERSION
      }
      localStorage.setItem(key, JSON.stringify(item))
    } catch (error) {
      // Silently fail on cache save errors
    }
  }
  
  static get<T>(key: string, ttlMinutes: number = 5): T | null {
    // Check if we're in the browser
    if (typeof window === 'undefined') {
      return null
    }
    
    try {
      const cached = localStorage.getItem(key)
      if (!cached) {
        return null
      }
      
      const item: CacheItem<T> = JSON.parse(cached)
      
      // Version check
      if (item.version !== this.VERSION) {
        this.remove(key)
        return null
      }
      
      // TTL check
      const age = Date.now() - item.timestamp
      const isExpired = age > ttlMinutes * 60 * 1000
      if (isExpired) {
        this.remove(key)
        return null
      }
      
      return item.data
    } catch (error) {
      this.remove(key)
      return null
    }
  }
  
  static remove(key: string): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem(key)
    } catch (error) {
      // Silently fail on cache remove errors
    }
  }
  
  static clear(): void {
    if (typeof window === 'undefined') return
    
    try {
      // Only clear our app's cache keys
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('cliky_')) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      // Silently fail on cache clear errors
    }
  }
}

// Cache keys
export const CACHE_KEYS = {
  PROJECTS: 'cliky_projects',  // Simple cache key - RLS handles user separation
  USER_SESSION: 'cliky_user_session',
  TASKS: (projectId: string) => `cliky_tasks_${projectId}`,
} as const