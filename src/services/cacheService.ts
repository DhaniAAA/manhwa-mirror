/**
 * Simple in-memory cache service with TTL (Time To Live)
 */

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number // milliseconds
}

class CacheService {
  private cache: Map<string, CacheItem<any>> = new Map()

  /**
   * Set cache with TTL (default 5 minutes)
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
    console.log(`💾 Cached: ${key} (TTL: ${ttl / 1000}s)`)
  }

  /**
   * Get cached data if not expired
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      console.log(`❌ Cache miss: ${key}`)
      return null
    }

    const isExpired = Date.now() - item.timestamp > item.ttl
    
    if (isExpired) {
      console.log(`⏰ Cache expired: ${key}`)
      this.cache.delete(key)
      return null
    }

    console.log(`✅ Cache hit: ${key}`)
    return item.data as T
  }

  /**
   * Check if cache exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Clear specific cache key
   */
  clear(key: string): void {
    this.cache.delete(key)
    console.log(`🗑️ Cleared cache: ${key}`)
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    this.cache.clear()
    console.log(`🗑️ Cleared all cache`)
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }
}

// Export singleton instance
export const cacheService = new CacheService()
