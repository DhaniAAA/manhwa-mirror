/**
 * Vue Composable for Cache Management
 * Provides reactive cache management functions
 */

import { ref } from 'vue'
import { CacheManager } from '../utils/cacheManager'

export function useCache() {
  const isClearing = ref(false)
  const stats = ref<any>(null)

  /**
   * Clear all caches
   */
  const clearAllCache = async () => {
    isClearing.value = true
    try {
      await CacheManager.clearAll()
      await refreshStats()
    } finally {
      isClearing.value = false
    }
  }

  /**
   * Clear only IndexedDB cache
   */
  const clearIndexedDB = async () => {
    isClearing.value = true
    try {
      await CacheManager.clearIndexedDB()
      await refreshStats()
    } finally {
      isClearing.value = false
    }
  }

  /**
   * Clear only memory cache
   */
  const clearMemory = () => {
    isClearing.value = true
    try {
      CacheManager.clearMemory()
      refreshStats()
    } finally {
      isClearing.value = false
    }
  }

  /**
   * Cleanup expired cache entries
   */
  const cleanupExpired = async () => {
    await CacheManager.cleanupExpired()
    await refreshStats()
  }

  /**
   * Refresh cache statistics
   */
  const refreshStats = async () => {
    stats.value = await CacheManager.getStats()
  }

  /**
   * Log cache status to console
   */
  const logStatus = async () => {
    await CacheManager.logStatus()
  }

  return {
    isClearing,
    stats,
    clearAllCache,
    clearIndexedDB,
    clearMemory,
    cleanupExpired,
    refreshStats,
    logStatus
  }
}
