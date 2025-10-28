/**
 * Cache Manager Utility
 * Provides helper functions for managing both in-memory and IndexedDB cache
 */

import { cacheService } from '../services/cacheService'
import { indexedDBCache } from '../services/indexedDBCache'

export class CacheManager {
  /**
   * Get cache statistics
   */
  static async getStats() {
    const memorySize = cacheService.size()
    const indexedDBSize = await indexedDBCache.size()
    const indexedDBKeys = await indexedDBCache.getAllKeys()
    
    return {
      memory: {
        size: memorySize,
        type: 'In-Memory Cache'
      },
      indexedDB: {
        size: indexedDBSize,
        keys: indexedDBKeys,
        type: 'IndexedDB Cache'
      }
    }
  }

  /**
   * Clear all caches
   */
  static async clearAll() {
    cacheService.clearAll()
    await indexedDBCache.clearAll()
    console.log('🗑️ All caches cleared')
  }

  /**
   * Clear only IndexedDB cache
   */
  static async clearIndexedDB() {
    await indexedDBCache.clearAll()
    console.log('🗑️ IndexedDB cache cleared')
  }

  /**
   * Clear only in-memory cache
   */
  static clearMemory() {
    cacheService.clearAll()
    console.log('🗑️ Memory cache cleared')
  }

  /**
   * Cleanup expired cache entries in IndexedDB
   */
  static async cleanupExpired() {
    await indexedDBCache.cleanupExpired()
    console.log('🧹 Expired cache entries cleaned up')
  }

  /**
   * Log cache status to console
   */
  static async logStatus() {
    const stats = await this.getStats()
    console.group('📊 Cache Status')
    console.log('Memory Cache:', stats.memory.size, 'items')
    console.log('IndexedDB Cache:', stats.indexedDB.size, 'items')
    console.log('IndexedDB Keys:', stats.indexedDB.keys)
    console.groupEnd()
  }
}

// Auto-cleanup expired cache on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    CacheManager.cleanupExpired().catch(console.error)
  })
}
