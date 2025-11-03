/**
 * Reading History Service
 * Tracks user's reading history with localStorage + Supabase sync
 */

import { supabase } from '../lib/supabase'

export interface ReadingHistoryItem {
  slug: string
  title: string
  coverUrl: string
  lastChapterSlug: string
  lastChapterTitle: string
  lastReadAt: string
  progress: number // percentage (0-100)
  totalChapters: number
  currentChapter: number
}

interface ReadingHistoryDB {
  id: string
  user_id: string
  manhwa_slug: string
  manhwa_title: string
  cover_url: string | null
  last_chapter_slug: string
  last_chapter_title: string
  progress: number
  total_chapters: number
  current_chapter: number
  last_read_at: string
  created_at: string
  updated_at: string
}

const HISTORY_KEY = 'manhwa-reading-history'
const MAX_HISTORY_ITEMS = 100
const SYNC_ENABLED_KEY = 'reading-history-sync-enabled'

export class ReadingHistoryService {
  /**
   * Add or update reading history
   */
  static addToHistory(item: ReadingHistoryItem): void {
    try {
      const history = this.getHistory()
      
      // Remove existing entry if present
      const filtered = history.filter(h => h.slug !== item.slug)
      
      // Add new entry at the beginning
      const newItem = {
        ...item,
        lastReadAt: new Date().toISOString()
      }
      filtered.unshift(newItem)
      
      // Keep only MAX_HISTORY_ITEMS
      const trimmed = filtered.slice(0, MAX_HISTORY_ITEMS)
      
      localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed))
      
      console.log('✅ History saved:', {
        slug: item.slug,
        title: item.title,
        chapter: item.currentChapter,
        total: trimmed.length
      })

      // Auto-sync to Supabase (non-blocking)
      this.syncToSupabase(newItem).catch(err => {
        console.warn('⚠️ Failed to sync to Supabase (non-critical):', err)
      })
    } catch (error) {
      console.error('❌ Error saving reading history:', error)
    }
  }

  /**
   * Get all reading history
   */
  static getHistory(): ReadingHistoryItem[] {
    try {
      const data = localStorage.getItem(HISTORY_KEY)
      if (!data) return []
      
      return JSON.parse(data)
    } catch (error) {
      console.error('Error loading reading history:', error)
      return []
    }
  }

  /**
   * Get history for specific manhwa
   */
  static getHistoryItem(slug: string): ReadingHistoryItem | null {
    const history = this.getHistory()
    return history.find(h => h.slug === slug) || null
  }

  /**
   * Remove item from history
   */
  static removeFromHistory(slug: string): void {
    const history = this.getHistory()
    const filtered = history.filter(h => h.slug !== slug)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered))
    
    // Sync delete to Supabase (non-blocking)
    this.deleteFromSupabase(slug).catch(err => {
      console.warn('⚠️ Failed to delete from Supabase (non-critical):', err)
    })
  }

  /**
   * Clear all history
   */
  static clearHistory(): void {
    localStorage.removeItem(HISTORY_KEY)
    
    // Sync clear to Supabase (non-blocking)
    this.clearSupabaseHistory().catch(err => {
      console.warn('⚠️ Failed to clear Supabase history (non-critical):', err)
    })
  }

  /**
   * Get recent history (last N items)
   */
  static getRecentHistory(limit: number = 10): ReadingHistoryItem[] {
    return this.getHistory().slice(0, limit)
  }

  /**
   * Get continue reading list (items with progress < 100%)
   */
  static getContinueReading(): ReadingHistoryItem[] {
    return this.getHistory().filter(h => h.progress < 100)
  }

  /**
   * Update reading progress
   */
  static updateProgress(slug: string, currentChapter: number, totalChapters: number): void {
    const item = this.getHistoryItem(slug)
    if (!item) return

    const progress = Math.round((currentChapter / totalChapters) * 100)
    
    this.addToHistory({
      ...item,
      currentChapter,
      totalChapters,
      progress
    })
  }

  // ==================== SUPABASE SYNC METHODS ====================

  /**
   * Check if user is authenticated
   */
  private static async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession()
    return session !== null
  }

  /**
   * Get current user ID
   */
  private static async getUserId(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.user?.id || null
  }

  /**
   * Check if sync is enabled
   */
  static isSyncEnabled(): boolean {
    return localStorage.getItem(SYNC_ENABLED_KEY) === 'true'
  }

  /**
   * Enable/disable sync
   */
  static setSyncEnabled(enabled: boolean): void {
    localStorage.setItem(SYNC_ENABLED_KEY, enabled.toString())
    console.log(`🔄 Sync ${enabled ? 'enabled' : 'disabled'}`)
  }

  /**
   * Sync local history to Supabase
   */
  static async syncToSupabase(item: ReadingHistoryItem): Promise<void> {
    if (!this.isSyncEnabled()) return
    if (!await this.isAuthenticated()) return

    try {
      const userId = await this.getUserId()
      if (!userId) return

      const { error } = await supabase
        .from('reading_history')
        .upsert({
          user_id: userId,
          manhwa_slug: item.slug,
          manhwa_title: item.title,
          cover_url: item.coverUrl,
          last_chapter_slug: item.lastChapterSlug,
          last_chapter_title: item.lastChapterTitle,
          progress: item.progress,
          total_chapters: item.totalChapters,
          current_chapter: item.currentChapter,
          last_read_at: item.lastReadAt
        }, {
          onConflict: 'user_id,manhwa_slug'
        })

      if (error) throw error
      console.log('☁️ Synced to Supabase:', item.slug)
    } catch (error) {
      console.error('❌ Error syncing to Supabase:', error)
    }
  }

  /**
   * Fetch history from Supabase
   */
  static async fetchFromSupabase(): Promise<ReadingHistoryItem[]> {
    if (!await this.isAuthenticated()) return []

    try {
      const userId = await this.getUserId()
      if (!userId) return []

      const { data, error } = await supabase
        .from('reading_history')
        .select('*')
        .eq('user_id', userId)
        .order('last_read_at', { ascending: false })
        .limit(MAX_HISTORY_ITEMS)

      if (error) throw error

      const items: ReadingHistoryItem[] = (data as ReadingHistoryDB[]).map(row => ({
        slug: row.manhwa_slug,
        title: row.manhwa_title,
        coverUrl: row.cover_url || '',
        lastChapterSlug: row.last_chapter_slug,
        lastChapterTitle: row.last_chapter_title,
        lastReadAt: row.last_read_at,
        progress: row.progress,
        totalChapters: row.total_chapters,
        currentChapter: row.current_chapter
      }))

      console.log('☁️ Fetched from Supabase:', items.length, 'items')
      return items
    } catch (error) {
      console.error('❌ Error fetching from Supabase:', error)
      return []
    }
  }

  /**
   * Merge local and remote history
   */
  static async syncHistory(): Promise<void> {
    if (!this.isSyncEnabled()) return
    if (!await this.isAuthenticated()) return

    try {
      console.log('🔄 Syncing history...')
      
      // Get local history
      const localHistory = this.getHistory()
      
      // Get remote history
      const remoteHistory = await this.fetchFromSupabase()
      
      // Merge: use most recent lastReadAt
      const merged = new Map<string, ReadingHistoryItem>()
      
      // Add local items
      localHistory.forEach(item => {
        merged.set(item.slug, item)
      })
      
      // Merge with remote (prefer newer)
      remoteHistory.forEach(remoteItem => {
        const localItem = merged.get(remoteItem.slug)
        if (!localItem || new Date(remoteItem.lastReadAt) > new Date(localItem.lastReadAt)) {
          merged.set(remoteItem.slug, remoteItem)
        }
      })
      
      // Convert to array and sort by lastReadAt
      const mergedArray = Array.from(merged.values())
        .sort((a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime())
        .slice(0, MAX_HISTORY_ITEMS)
      
      // Save merged to localStorage
      localStorage.setItem(HISTORY_KEY, JSON.stringify(mergedArray))
      
      // Sync all to Supabase
      for (const item of mergedArray) {
        await this.syncToSupabase(item)
      }
      
      console.log('✅ Sync complete:', mergedArray.length, 'items')
    } catch (error) {
      console.error('❌ Error syncing history:', error)
    }
  }

  /**
   * Delete from Supabase
   */
  static async deleteFromSupabase(slug: string): Promise<void> {
    if (!this.isSyncEnabled()) return
    if (!await this.isAuthenticated()) return

    try {
      const userId = await this.getUserId()
      if (!userId) return

      const { error } = await supabase
        .from('reading_history')
        .delete()
        .eq('user_id', userId)
        .eq('manhwa_slug', slug)

      if (error) throw error
      console.log('☁️ Deleted from Supabase:', slug)
    } catch (error) {
      console.error('❌ Error deleting from Supabase:', error)
    }
  }

  /**
   * Clear all from Supabase
   */
  static async clearSupabaseHistory(): Promise<void> {
    if (!await this.isAuthenticated()) return

    try {
      const userId = await this.getUserId()
      if (!userId) return

      const { error } = await supabase
        .from('reading_history')
        .delete()
        .eq('user_id', userId)

      if (error) throw error
      console.log('☁️ Cleared Supabase history')
    } catch (error) {
      console.error('❌ Error clearing Supabase history:', error)
    }
  }
}
