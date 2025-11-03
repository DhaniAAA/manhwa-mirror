/**
 * Cache Manager Utility
 * Provides helper functions for managing IndexedDB cache
 */

import { indexedDBCache } from './indexedDBCache'

export class CacheManager {
  /**
   * Get cache statistics
   */
  static async getStats() {
    const indexedDBSize = await indexedDBCache.size()
    const indexedDBKeys = await indexedDBCache.getAllKeys()
    
    return {
      indexedDB: {
        size: indexedDBSize,
        keys: indexedDBKeys,
        type: 'IndexedDB Persistent Cache'
      }
    }
  }

  /**
   * Clear all caches
   */
  static async clearAll() {
    await indexedDBCache.clearAll()
    console.log('🗑️ All caches cleared (IndexedDB)')
  }

  /**
   * Clear IndexedDB cache (alias for clearAll)
   */
  static async clearIndexedDB() {
    await indexedDBCache.clearAll()
    console.log('🗑️ IndexedDB cache cleared')
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
