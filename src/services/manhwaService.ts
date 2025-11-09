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
   * Mendapatkan daftar semua manhwa dari comics-list.json (with IndexedDB caching)
   */
  static async getComicsList(): Promise<string[]> {
    const cacheKey = 'comics-list'
    
    // Check IndexedDB cache first (persistent storage)
    const cached = await indexedDBCache.get<string[]>(cacheKey)
    if (cached) {
      console.log(`✅ Using IndexedDB cached comics list (${cached.length} items)`)
      console.log(`📋 First 5 comics from cache:`, cached.slice(0, 5))
      return cached
    }

    try {
      console.log(`📥 Fetching comics-list.json from bucket: ${BUCKET_NAME}`)
      
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download('comics-list.json')

      if (error) {
        console.error('❌ Supabase error:', error)
        throw error
      }

      const text = await data.text()
      const comics = JSON.parse(text)
      
      // Cache in IndexedDB for 20 hours (comics list rarely changes)
      await indexedDBCache.set(cacheKey, comics, 20 * 60 * 60 * 1000)
      
      console.log(`✅ Found ${comics.length} comics in list`)
      console.log(`📋 First 5 comics:`, comics.slice(0, 5))
      return comics
    } catch (error) {
      console.error('❌ Error fetching comics list:', error)
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
   * Helper: Process manhwa in parallel batches
   */
  private static async processBatch(
    slugs: string[], 
    skipChapters: boolean,
    batchSize: number = 20
  ): Promise<ManhwaCardData[]> {
    const results: ManhwaCardData[] = []
    
    // Process in batches to avoid overwhelming the server
    for (let i = 0; i < slugs.length; i += batchSize) {
      const batch = slugs.slice(i, i + batchSize)
      console.log(`⚡ Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(slugs.length / batchSize)} (${batch.length} items)`)
      
      // Fetch metadata in parallel for this batch
      const batchPromises = batch.map(async (slug) => {
        try {
          const metadata = await this.getMetadata(slug)
          if (!metadata) return null

          // Get latest 2 chapters (only if not skipped)
          let latestChapters: Array<{ title: string; waktu_rilis?: string; slug?: string }> = []
          
          if (!skipChapters) {
            try {
              const chaptersData = await this.getChapters(slug)
              if (chaptersData?.chapters && chaptersData.chapters.length > 0) {
                latestChapters = chaptersData.chapters
                  .slice(-2)
                  .reverse()
                  .map(ch => ({
                    title: ch.title,
                    waktu_rilis: ch.waktu_rilis || undefined,
                    slug: ch.slug  // Include chapter slug
                  }))
              }
            } catch (error) {
              // Silently fail for chapters
            }
          }

          // Get type from metadata.metadata.Type or metadata.type
          const metadataObj = (metadata as any).metadata || {}
          let type = metadata.type || metadataObj.Type
          if (!type) {
            // Auto-detect from title if possible
            const title = metadata.title.toLowerCase()
            if (title.includes('manhua') || title.includes('中国')) {
              type = 'manhua'
            } else if (title.includes('manga') || title.includes('日本')) {
              type = 'manga'
            } else {
              type = 'manhwa' // Default
            }
          }

          // Get status from metadata.metadata.Status or metadata.status
          const status = metadata.status || metadataObj.Status || 'Ongoing'

          return {
            slug: metadata.slug,
            title: cleanManhwaTitle(metadata.title), // Fix encoding issues
            genre: metadata.genres?.join(', ') || 'Action, Fantasy',
            genres: metadata.genres,
            type: type,
            status: status,
            rating: metadata.rating || '9.5',
            chapters: metadata.total_chapters,
            lastUpdate: metadataObj['Updated on'] || 'Baru saja',
            cover_url: metadata.cover_url,
            coverImage: metadata.cover_url,
            latestChapters
          } as ManhwaCardData
        } catch (error) {
          console.warn(`⚠️ Failed to process: ${slug}`)
          return null
        }
      })

      // Wait for all promises in this batch
      const batchResults = await Promise.all(batchPromises)
      
      // Filter out nulls and add to results
      results.push(...batchResults.filter((item): item is ManhwaCardData => item !== null))
    }

    return results
  }

  /**
   * Convert metadata ke format ManhwaCardData untuk UI (with caching and parallel loading)
   */
  static async getManhwaCards(limit?: number, skipChapters: boolean = false): Promise<ManhwaCardData[]> {
    try {
      const cacheKey = `manhwa-cards-${limit || 'all'}-${skipChapters ? 'no-chapters' : 'with-chapters'}`
      
      // Check IndexedDB cache first
      const cached = await indexedDBCache.get<ManhwaCardData[]>(cacheKey)
      if (cached) {
        console.log(`🔍 Using cached manhwa cards (${cached.length} items)`)
        return cached
      }

      console.log(`🔍 Getting manhwa cards (limit: ${limit || 'all'})`)
      
      const comicsList = await this.getComicsList()
      
      if (comicsList.length === 0) {
        console.warn('⚠️ Comics list is empty')
        return []
      }
      
      const comics = limit ? comicsList.slice(0, limit) : comicsList
      console.log(`📋 Processing ${comics.length} comics in parallel batches`)

      // Process in parallel batches (20 at a time for faster loading)
      const manhwaCards = await this.processBatch(comics, skipChapters, 20)

      // Log type distribution for debugging
      const typeCount = manhwaCards.reduce((acc, card) => {
        const type = card.type || 'unknown'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      console.log(`📊 Type distribution:`, typeCount)
      
      // Log status distribution for debugging
      const statusCount = manhwaCards.reduce((acc, card) => {
        const status = card.status || 'unknown'
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      console.log(`📊 Status distribution:`, statusCount)

      // Cache in IndexedDB for 6 hours
      await indexedDBCache.set(cacheKey, manhwaCards, 6 * 60 * 60 * 1000)

      console.log(`✅ Total manhwa cards created: ${manhwaCards.length}`)
      return manhwaCards
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
   * Search manhwa by title, genre, or type
   */
  static async searchManhwa(query: string): Promise<ManhwaCardData[]> {
    const allCards = await this.getManhwaCards()
    const searchQuery = query.toLowerCase()

    return allCards.filter(card => {
      const title = card.title.toLowerCase()
      const genre = card.genre?.toLowerCase() || ''
      const genres = card.genres?.map(g => g.toLowerCase()).join(' ') || ''
      const type = card.type?.toLowerCase() || ''

      // Search in title, genre, genres, and type
      return title.includes(searchQuery) ||
             genre.includes(searchQuery) ||
             genres.includes(searchQuery) ||
             type.includes(searchQuery)
    })
  }

  /**
   * Menyuntikkan data chapter terbaru ke daftar kartu tanpa memuat ulang metadata
   */
  static async hydrateManhwaCardsWithChapters(
    cards: ManhwaCardData[],
    options: { limitChapters?: number; batchSize?: number } = {}
  ): Promise<ManhwaCardData[]> {
    if (!cards.length) {
      return []
    }

    const { limitChapters = 2, batchSize = 6 } = options
    const clonedCards = cards.map(card => ({ ...card })) as ManhwaCardData[]

    const cardsToProcess = clonedCards
      .map((card, index) => ({ card, index }))
      .filter(({ card }) => !card.latestChapters || card.latestChapters.length === 0)

    for (let i = 0; i < cardsToProcess.length; i += batchSize) {
      const batch = cardsToProcess.slice(i, i + batchSize)

      const batchResults = await Promise.all(
        batch.map(async ({ card, index }) => {
          try {
            const chaptersData = await this.getChapters(card.slug)
            if (!chaptersData?.chapters?.length) {
              return null
            }

            const latestChapters = chaptersData.chapters
              .slice(-limitChapters)
              .reverse()
              .map(chapter => ({
                title: chapter.title,
                waktu_rilis: chapter.waktu_rilis || undefined,
                slug: chapter.slug
              }))

            return { index, latestChapters }
          } catch (error) {
            console.warn(`⚠️ Failed to hydrate chapters for ${card.slug}`, error)
            return null
          }
        })
      )

      batchResults.forEach(result => {
        if (!result) return
        const { index, latestChapters } = result
        const current = clonedCards[index]
        if (!current?.slug) {
          return
        }

        clonedCards[index] = {
          ...current,
          latestChapters
        }
      })
    }

    return clonedCards
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
   * Get manhwa sorted by Last Modified timestamp from Supabase Storage
   * Returns manhwa with the most recent updates first (based on latest chapter update time)
   * ONLY shows manhwa that have valid chapter updates with waktu_rilis timestamp
   */
  static async getHotUpdates(limit: number = 15): Promise<ManhwaCardData[]> {
    try {
      const cacheKey = `hot-updates-${limit}`
      
      // Check IndexedDB cache first (cache for 15 minutes only for fresh updates)
      const cached = await indexedDBCache.get<ManhwaCardData[]>(cacheKey)
      if (cached && cached.length > 0) {
        console.log(`🔥 Using cached hot updates (${cached.length} items)`)
        return cached
      }

      console.log('🔥 Fetching hot updates based on latest chapter releases...')
      
      // Get comics list
      const comicsList = await this.getComicsList()
      if (comicsList.length === 0) {
        console.warn('⚠️ Comics list is empty')
        return []
      }

      console.log(`📚 Found ${comicsList.length} total comics`)

      // Get all manhwa with their latest chapter info
      const manhwaWithTimestamps: Array<ManhwaCardData & { lastUpdateTime?: number; listIndex?: number }> = []
      
      // Process in batches to get chapter data
      // Increase to 100 manhwa to get more accurate hot updates
      const batchSize = 20
      const maxComicsToCheck = Math.min(comicsList.length, 500)
      console.log(`🔍 Checking ${maxComicsToCheck} manhwa for latest updates...`)
      
      for (let i = 0; i < maxComicsToCheck; i += batchSize) {
        const batch = comicsList.slice(i, i + batchSize)
        
        const batchPromises = batch.map(async (slug, batchIndex) => {
          const listIndex = i + batchIndex // Track position in original list
          try {
            // Get metadata
            const metadata = await this.getMetadata(slug)
            if (!metadata) return null

            // Get chapters to find latest update
            const chaptersData = await this.getChapters(slug)
            let latestChapters: Array<{ title: string; waktu_rilis?: string; slug?: string }> = []
            let lastUpdateTime = 0
            
            if (chaptersData?.chapters && chaptersData.chapters.length > 0) {
              // Get last 2 chapters
              latestChapters = chaptersData.chapters
                .slice(-2)
                .reverse()
                .map(ch => ({
                  title: ch.title,
                  waktu_rilis: ch.waktu_rilis || undefined,
                  slug: ch.slug
                }))
              
              // Get the most recent chapter's timestamp
              const latestChapter = chaptersData.chapters[chaptersData.chapters.length - 1]
              if (latestChapter && latestChapter.waktu_rilis) {
                lastUpdateTime = new Date(latestChapter.waktu_rilis).getTime()
                // Debug: Log first 3 manhwa with timestamps
                if (manhwaWithTimestamps.length < 3) {
                  console.log(`📅 ${metadata.title}: ${latestChapter.waktu_rilis} (${new Date(latestChapter.waktu_rilis).toLocaleString('id-ID')})`)
                }
              } else {
                // FALLBACK: Jika waktu_rilis tidak ada, gunakan jumlah chapter sebagai indikator
                // Manhwa dengan lebih banyak chapter = lebih sering update
                // Gunakan timestamp sekarang dikurangi (total_chapters * -1 hari) sebagai estimasi
                const estimatedTime = Date.now() - ((chaptersData.chapters.length || 0) * 24 * 60 * 60 * 1000)
                lastUpdateTime = estimatedTime
                
                // Debug: Log manhwa without waktu_rilis
                if (manhwaWithTimestamps.length < 3) {
                  console.log(`⚠️ ${metadata.title}: NO waktu_rilis - using fallback (${chaptersData.chapters.length} chapters)`)
                }
              }
            }

            // Get type from metadata
            const metadataObj = (metadata as any).metadata || {}
            let type = metadata.type || metadataObj.Type
            
            const card: ManhwaCardData & { lastUpdateTime?: number; listIndex?: number } = {
              slug,
              title: metadata.title,
              cover_url: metadata.cover_url,
              rating: metadata.rating,
              type: type || 'manhwa',
              status: metadata.status,
              latestChapters,
              lastUpdateTime,
              listIndex // Simpan index dari comics-list sebagai fallback
            }

            return card
          } catch (error) {
            console.warn(`⚠️ Failed to load ${slug}:`, error)
            return null
          }
        })

        const batchResults = await Promise.all(batchPromises)
        
        // Filter: terima manhwa yang punya title dan cover (waktu_rilis opsional)
        const validResults = batchResults.filter((m): m is ManhwaCardData & { lastUpdateTime?: number; listIndex?: number } => 
          m !== null && 
          !!m.title && 
          !!m.cover_url
        )
        
        manhwaWithTimestamps.push(...validResults)
      }

      console.log(`📊 Found ${manhwaWithTimestamps.length} manhwa with valid chapter updates`)
      
      if (manhwaWithTimestamps.length === 0) {
        console.warn('⚠️ No manhwa with chapter updates found')
        return []
      }

      // Debug: Show sample of timestamps before sorting
      console.log('🔍 Sample before sorting (first 5):')
      manhwaWithTimestamps.slice(0, 5).forEach(m => {
        const date = m.lastUpdateTime ? new Date(m.lastUpdateTime).toLocaleString('id-ID') : 'No waktu_rilis'
        console.log(`  - ${m.title}: ${date} (index: ${m.listIndex})`)
      })

      // Sort by lastUpdateTime if available, otherwise by listIndex (lower = newer)
      const sorted = manhwaWithTimestamps.sort((a, b) => {
        // Jika keduanya punya waktu_rilis, gunakan itu
        if (a.lastUpdateTime && b.lastUpdateTime) {
          return b.lastUpdateTime - a.lastUpdateTime // Newest first
        }
        
        // Jika hanya salah satu yang punya waktu_rilis, prioritaskan yang punya
        if (a.lastUpdateTime && !b.lastUpdateTime) return -1
        if (!a.lastUpdateTime && b.lastUpdateTime) return 1
        
        // Jika keduanya tidak punya waktu_rilis, gunakan listIndex (lower index = newer)
        const indexA = a.listIndex ?? 999999
        const indexB = b.listIndex ?? 999999
        return indexA - indexB // Lower index first
      })
      
      // Debug: Show sample after sorting
      console.log('🔍 Sample after sorting (first 5):')
      sorted.slice(0, 5).forEach(m => {
        const date = m.lastUpdateTime ? new Date(m.lastUpdateTime).toLocaleString('id-ID') : 'No waktu_rilis'
        console.log(`  - ${m.title}: ${date} (index: ${m.listIndex})`)
      })

      // Take top N with most recent updates
      const hotUpdates = sorted.slice(0, limit)
      
      // Log top 5 for debugging
      console.log('🔥 Top 5 hot updates:')
      hotUpdates.slice(0, 5).forEach((m, idx) => {
        const date = m.lastUpdateTime ? new Date(m.lastUpdateTime).toLocaleString('id-ID') : 'No date'
        console.log(`  ${idx + 1}. ${m.title} - Last update: ${date}`)
      })
      
      // Remove lastUpdateTime and listIndex before returning (not needed in UI)
      const cleanedUpdates = hotUpdates.map(({ lastUpdateTime, listIndex, ...rest }) => rest)
      
      // Cache in IndexedDB for 10 minutes (shorter cache for fresh updates)
      await indexedDBCache.set(cacheKey, cleanedUpdates, 10 * 60 * 1000)
      
      console.log(`✅ Hot updates loaded: ${cleanedUpdates.length} manhwa (sorted by latest chapter)`)
      return cleanedUpdates
    } catch (error) {
      console.error('❌ Error getting hot updates:', error)
      
      // Fallback: try to get any manhwa
      try {
        console.log('🔄 Attempting fallback...')
        const comicsList = await this.getComicsList()
        const fallbackSlugs = comicsList.slice(0, limit)
        const fallbackData = await this.processBatch(fallbackSlugs, false, 5)
        return fallbackData.filter(m => m.title && m.cover_url)
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError)
        return []
      }
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
