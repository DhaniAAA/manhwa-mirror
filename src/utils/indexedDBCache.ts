/**
 * IndexedDB Cache Service using idb-keyval
 * Provides persistent caching with TTL support for large data like comics-list.json
 */

import { get, set, del, clear, keys } from 'idb-keyval'

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number // milliseconds
}

class IndexedDBCacheService {
  /**
   * Set cache with TTL (default 1 hour)
   */
  async set<T>(key: string, data: T, ttl: number = 60 * 60 * 1000): Promise<void> {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl
    }
    
    try {
      await set(key, cacheItem)
      console.log(`💾 IndexedDB cached: ${key} (TTL: ${ttl / 1000}s)`)
    } catch (error) {
      console.error(`❌ Failed to cache in IndexedDB: ${key}`, error)
    }
  }

  /**
   * Get cached data if not expired
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const item = await get<CacheItem<T>>(key)
      
      if (!item) {
        console.log(`❌ IndexedDB cache miss: ${key}`)
        return null
      }

      const isExpired = Date.now() - item.timestamp > item.ttl
      
      if (isExpired) {
        console.log(`⏰ IndexedDB cache expired: ${key}`)
        await this.clear(key)
        return null
      }

      console.log(`✅ IndexedDB cache hit: ${key}`)
      return item.data
    } catch (error) {
      console.error(`❌ Failed to get from IndexedDB: ${key}`, error)
      return null
    }
  }

  /**
   * Check if cache exists and is valid
   */
  async has(key: string): Promise<boolean> {
    const data = await this.get(key)
    return data !== null
  }

  /**
   * Clear specific cache key
   */
  async clear(key: string): Promise<void> {
    try {
      await del(key)
      console.log(`🗑️ Cleared IndexedDB cache: ${key}`)
    } catch (error) {
      console.error(`❌ Failed to clear IndexedDB cache: ${key}`, error)
    }
  }

  /**
   * Clear all cache
   */
  async clearAll(): Promise<void> {
    try {
      await clear()
      console.log(`🗑️ Cleared all IndexedDB cache`)
    } catch (error) {
      console.error(`❌ Failed to clear all IndexedDB cache`, error)
    }
  }

  /**
   * Get all cache keys
   */
  async getAllKeys(): Promise<IDBValidKey[]> {
    try {
      return await keys()
    } catch (error) {
      console.error(`❌ Failed to get IndexedDB keys`, error)
      return []
    }
  }

  /**
   * Get cache size (number of items)
   */
  async size(): Promise<number> {
    try {
      const allKeys = await this.getAllKeys()
      return allKeys.length
    } catch (error) {
      console.error(`❌ Failed to get IndexedDB size`, error)
      return 0
    }
  }

  /**
   * Clean up expired cache entries
   */
  async cleanupExpired(): Promise<void> {
    try {
      const allKeys = await this.getAllKeys()
      
      for (const key of allKeys) {
        if (typeof key === 'string') {
          const item = await get<CacheItem<any>>(key)
          if (item) {
            const isExpired = Date.now() - item.timestamp > item.ttl
            if (isExpired) {
              await del(key)
              console.log(`🧹 Cleaned up expired cache: ${key}`)
            }
          }
        }
      }
    } catch (error) {
      console.error(`❌ Failed to cleanup expired cache`, error)
    }
  }
}

// Export singleton instance
export const indexedDBCache = new IndexedDBCacheService()
