import { supabase, BUCKET_NAME } from '../lib/supabase'
import type { ManhwaMetadata, ChaptersData, ManhwaCardData, ChapterDetail } from '../types/manhwa'
import { indexedDBCache } from '../utils/indexedDBCache'
import { proxyChaptersData, proxyChapterImages } from '../utils/imageProxy'
import { cleanManhwaTitle } from '../utils/textUtils'

/**
 * Service untuk mengakses data manhwa dari Supabase Storage
 */
export class ManhwaService {
  /**
   * Mendapatkan semua metadata manhwa dari all-manhwa-metadata.json (with IndexedDB caching)
   * File ini berisi array lengkap dengan metadata, cover, genres, dan latest chapters
   */
  static async getAllManhwaMetadata(): Promise<ManhwaCardData[]> {
    const cacheKey = 'all-manhwa-metadata'
    
    // Check IndexedDB cache first (persistent storage)
    const cached = await indexedDBCache.get<ManhwaCardData[]>(cacheKey)
    if (cached) {
      console.log(`✅ Using IndexedDB cached all-manhwa-metadata (${cached.length} items)`)
      return cached
    }

    try {
      console.log(`📥 Fetching all-manhwa-metadata.json from bucket: ${BUCKET_NAME}`)
      
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download('all-manhwa-metadata.json')

      if (error) {
        console.error('❌ Supabase error:', error)
        throw error
      }

      const text = await data.text()
      const allMetadata: ManhwaCardData[] = JSON.parse(text)
      
      // Cache in IndexedDB for 6 hours (metadata updates periodically)
      await indexedDBCache.set(cacheKey, allMetadata, 6 * 60 * 60 * 1000)
      
      console.log(`✅ Found ${allMetadata.length} manhwa in all-manhwa-metadata.json`)
      return allMetadata
    } catch (error) {
      console.error('❌ Error fetching all-manhwa-metadata.json:', error)
      return []
    }
  }

  /**
   * Mendapatkan metadata manhwa (with IndexedDB caching)
   */
  static async getMetadata(slug: string): Promise<ManhwaMetadata | null> {
    const cacheKey = `metadata-${slug}`
    
    // Check IndexedDB cache first
    const cached = await indexedDBCache.get<ManhwaMetadata>(cacheKey)
    if (cached) {
      console.log(`✅ Using cached metadata for: ${slug}`)
      return cached
    }

    try {
      console.log(`📖 Fetching metadata for: ${slug}`)
      
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(`${slug}/metadata.json`)

      if (error) {
        console.error(`❌ Error downloading metadata for ${slug}:`, error)
        if (error.message?.includes('CORS') || error.message?.includes('fetch')) {
          console.error(`❌ CORS Error: Please configure CORS in Supabase Storage bucket settings`)
          console.error(`📖 See SUPABASE_CORS_FIX.md for instructions`)
        }
        throw error
      }

      const text = await data.text()
      const metadata = JSON.parse(text)
      
      // Cache in IndexedDB for 20 hours (metadata jarang berubah)
      await indexedDBCache.set(cacheKey, metadata, 20 * 60 * 60 * 1000)
      
      console.log(`✅ Metadata loaded for: ${metadata.title}`)
      return metadata
    } catch (error) {
      console.error(`❌ Error fetching metadata for ${slug}:`, error)
      if (error instanceof Error && error.message?.includes('Failed to fetch')) {
        console.error(`💡 This might be a CORS issue. Check Supabase Storage bucket configuration.`)
      }
      return null
    }
  }

  /**
   * Mendapatkan semua chapters untuk manhwa tertentu (with IndexedDB caching & proxy)
   */
  static async getChapters(slug: string): Promise<ChaptersData | null> {
    const cacheKey = `chapters-${slug}`
    
    // Check IndexedDB cache first
    const cached = await indexedDBCache.get<ChaptersData>(cacheKey)
    if (cached) {
      console.log(`💾 Using cached chapters for: ${slug}`)
      return cached
    }

    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(`${slug}/chapters.json`)

      if (error) {
        // Check if it's a CORS error
        if (error.message?.includes('CORS') || error.message?.includes('fetch')) {
          console.error(`❌ CORS Error: Please configure CORS in Supabase Storage bucket settings`)
          console.error(`📖 See SUPABASE_CORS_FIX.md for instructions`)
        }
        throw error
      }

      const text = await data.text()
      const chaptersData = JSON.parse(text)
      
      // ✨ Apply proxy to all image URLs
      const proxiedData = proxyChaptersData(chaptersData)
      
      // Cache in IndexedDB for 20 hours
      await indexedDBCache.set(cacheKey, proxiedData, 20 * 60 * 60 * 1000)
      console.log(`✅ Chapters cached for: ${slug} (with proxy)`)
      
      return proxiedData
    } catch (error) {
      console.error(`❌ Error fetching chapters for ${slug}:`, error)
      if (error instanceof Error && error.message?.includes('Failed to fetch')) {
        console.error(`💡 This might be a CORS issue. Check Supabase Storage bucket configuration.`)
      }
      return null
    }
  }

  /**
   * Mendapatkan data chapter individual (images) with caching & proxy
   * Mengambil dari chapters.json dan filter berdasarkan chapterSlug
   */
  static async getChapter(manhwaSlug: string, chapterSlug: string): Promise<ChapterDetail | null> {
    const cacheKey = `chapter-${manhwaSlug}-${chapterSlug}`
    
    // Check IndexedDB cache first
    const cached = await indexedDBCache.get<ChapterDetail>(cacheKey)
    if (cached) {
      console.log(`💾 Using cached chapter: ${manhwaSlug}/${chapterSlug}`)
      return cached
    }

    try {
      console.log(`📖 Fetching chapter: ${manhwaSlug}/${chapterSlug}`)
      
      // Get all chapters from chapters.json (already proxied from getChapters)
      const chaptersData = await this.getChapters(manhwaSlug)
      
      if (!chaptersData || !chaptersData.chapters) {
        console.error(`❌ Chapters data not found for: ${manhwaSlug}`)
        return null
      }

      // Find specific chapter by slug
      const chapter = chaptersData.chapters.find(ch => ch.slug === chapterSlug)
      
      if (!chapter) {
        console.error(`❌ Chapter not found: ${chapterSlug}`)
        return null
      }
      
      // ✨ Apply proxy as safety check (images already proxied from getChapters)
      const proxiedChapter = proxyChapterImages(chapter)
      
      // Cache in IndexedDB for 20 hours (chapter content tidak berubah)
      await indexedDBCache.set(cacheKey, proxiedChapter, 20 * 60 * 60 * 1000)
      
      console.log(`✅ Chapter loaded: ${proxiedChapter.title} (${proxiedChapter.images?.length || 0} images)`)
      return proxiedChapter
    } catch (error) {
      console.error(`❌ Error fetching chapter ${manhwaSlug}/${chapterSlug}:`, error)
      return null
    }
  }

  /**
   * Mendapatkan URL public untuk file di bucket
   */
  static getPublicUrl(path: string): string {
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path)

    return data.publicUrl
  }


  /**
   * Convert metadata ke format ManhwaCardData untuk UI (menggunakan all-manhwa-metadata.json)
   */
  static async getManhwaCards(limit?: number): Promise<ManhwaCardData[]> {
    try {
      console.log(`🔍 Getting manhwa cards (limit: ${limit || 'all'})`)
      
      // Get all metadata from single file
      const allMetadata = await this.getAllManhwaMetadata()
      
      if (allMetadata.length === 0) {
        console.warn('⚠️ All manhwa metadata is empty')
        return []
      }
      
      // Apply limit if specified
      const manhwaCards = limit ? allMetadata.slice(0, limit) : allMetadata
      
      // Clean titles to fix encoding issues
      const cleanedCards = manhwaCards.map(card => ({
        ...card,
        title: cleanManhwaTitle(card.title)
      }))

      // Log type distribution for debugging
      const typeCount = cleanedCards.reduce((acc, card) => {
        const type = card.type || 'unknown'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      console.log(`📊 Type distribution:`, typeCount)
      
      // Log status distribution for debugging
      const statusCount = cleanedCards.reduce((acc, card) => {
        const status = card.status || 'unknown'
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      console.log(`📊 Status distribution:`, statusCount)

      console.log(`✅ Total manhwa cards: ${cleanedCards.length}`)
      return cleanedCards
    } catch (error) {
      console.error('❌ Error getting manhwa cards:', error)
      return []
    }
  }

  /**
   * Mendapatkan manhwa dengan badge tertentu
   */
  static async getManhwaByBadge(_badge: string, limit: number = 6): Promise<ManhwaCardData[]> {
    const cards = await this.getManhwaCards(limit)
    
    // Assign badges berdasarkan index (untuk demo)
    const badges = ['Hot', 'Popular', 'New', 'Trending']
    return cards.map((card, idx) => ({
      ...card,
      badge: badges[idx % badges.length]
    }))
  }

  /**
   * Mendapatkan manhwa untuk "Continue Reading"
   */
  static async getContinueReading(limit: number = 4): Promise<ManhwaCardData[]> {
    const cards = await this.getManhwaCards(limit)
    
    // Tambahkan progress (dari localStorage atau database)
    return cards.map((card) => ({
      ...card,
      progress: Math.floor(Math.random() * 80) + 10, // Random progress 10-90%
      lastUpdate: `Chapter ${Math.floor(Math.random() * 50) + 1}`
    }))
  }

  /**
   * Search manhwa by title, genre, or type (menggunakan all-manhwa-metadata.json)
   */
  static async searchManhwa(query: string): Promise<ManhwaCardData[]> {
    const allMetadata = await this.getAllManhwaMetadata()
    const searchQuery = query.toLowerCase()

    const results = allMetadata.filter(card => {
      const title = cleanManhwaTitle(card.title).toLowerCase()
      const genre = card.genre?.toLowerCase() || ''
      const genres = card.genres?.map(g => g.toLowerCase()).join(' ') || ''
      const type = card.type?.toLowerCase() || ''

      // Search in title, genre, genres, and type
      return title.includes(searchQuery) ||
             genre.includes(searchQuery) ||
             genres.includes(searchQuery) ||
             type.includes(searchQuery)
    })

    // Clean titles in results
    return results.map(card => ({
      ...card,
      title: cleanManhwaTitle(card.title)
    }))
  }


  /**
   * Get chapter images for reader
   */
  static async getChapterImages(slug: string, chapterSlug: string): Promise<string[]> {
    try {
      const chaptersData = await this.getChapters(slug)
      
      if (!chaptersData) return []

      const chapter = chaptersData.chapters.find(ch => ch.slug === chapterSlug)
      
      return chapter?.images || []
    } catch (error) {
      return []
    }
  }

  /**
   * Get manhwa sorted by latest chapter update time
   * Returns manhwa with the most recent updates first (menggunakan all-manhwa-metadata.json)
   */
  static async getHotUpdates(limit: number = 15): Promise<ManhwaCardData[]> {
    try {
      console.log('🔥 Fetching hot updates based on latest chapter releases...')
      
      // Get all metadata from single file
      const allMetadata = await this.getAllManhwaMetadata()
      
      if (allMetadata.length === 0) {
        console.warn('⚠️ All manhwa metadata is empty')
        return []
      }

      console.log(`📚 Found ${allMetadata.length} total manhwa`)

      // Filter manhwa that have lastUpdateTime
      const manhwaWithTimestamps = allMetadata.filter(m => 
        m.title && 
        m.cover_url && 
        (m as any).lastUpdateTime
      )

      console.log(`📊 Found ${manhwaWithTimestamps.length} manhwa with valid timestamps`)
      
      if (manhwaWithTimestamps.length === 0) {
        console.warn('⚠️ No manhwa with timestamps found, returning first items')
        return allMetadata.slice(0, limit).map(card => ({
          ...card,
          title: cleanManhwaTitle(card.title)
        }))
      }

      // Sort by lastUpdateTime (newest first)
      const sorted = manhwaWithTimestamps.sort((a, b) => {
        const timeA = (a as any).lastUpdateTime || 0
        const timeB = (b as any).lastUpdateTime || 0
        return timeB - timeA // Newest first
      })
      
      // Debug: Show sample after sorting
      console.log('🔍 Sample after sorting (first 5):')
      sorted.slice(0, 5).forEach(m => {
        const time = (m as any).lastUpdateTime
        const date = time ? new Date(time).toLocaleString('id-ID') : 'No timestamp'
        console.log(`  - ${m.title}: ${date}`)
      })

      // Take top N with most recent updates
      const hotUpdates = sorted.slice(0, limit)
      
      // Log top 5 for debugging
      console.log('🔥 Top 5 hot updates:')
      hotUpdates.slice(0, 5).forEach((m, idx) => {
        const time = (m as any).lastUpdateTime
        const date = time ? new Date(time).toLocaleString('id-ID') : 'No date'
        console.log(`  ${idx + 1}. ${m.title} - Last update: ${date}`)
      })
      
      // Clean titles and remove lastUpdateTime before returning
      const cleanedUpdates = hotUpdates.map(({ ...card }) => {
        const { lastUpdateTime, ...rest } = card as any
        return {
          ...rest,
          title: cleanManhwaTitle(rest.title)
        }
      })
      
      console.log(`✅ Hot updates loaded: ${cleanedUpdates.length} manhwa (sorted by latest chapter)`)
      return cleanedUpdates
    } catch (error) {
      console.error('❌ Error getting hot updates:', error)
      return []
    }
  }

  /**
   * Clear all cache - useful for debugging
   */
  static async clearCache(): Promise<void> {
    await indexedDBCache.clearAll()
    console.log('🗑️ All cache cleared (IndexedDB)')
  }

  /**
   * Cleanup expired cache entries
   */
  static async cleanupCache(): Promise<void> {
    await indexedDBCache.cleanupExpired()
    console.log('🧹 Expired cache cleaned up')
  }

  /**
   * Get all manhwa with full metadata (for recommendations)
   */
  static async getAllManhwa(): Promise<ManhwaCardData[]> {
    return await this.getManhwaCards()
  }
}
