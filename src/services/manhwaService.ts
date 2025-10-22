import { supabase, BUCKET_NAME } from '../lib/supabase'
import type { ManhwaMetadata, ChaptersData, ManhwaCardData, ChapterDetail } from '../types/manhwa'
import { cacheService } from './cacheService'

/**
 * Service untuk mengakses data manhwa dari Supabase Storage
 */
export class ManhwaService {
  /**
   * Mendapatkan daftar semua manhwa dari comics-list.json (with caching)
   */
  static async getComicsList(): Promise<string[]> {
    const cacheKey = 'comics-list'
    
    // Check cache first
    const cached = cacheService.get<string[]>(cacheKey)
    if (cached) {
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
      
      // Cache for 10 minutes
      cacheService.set(cacheKey, comics, 10 * 60 * 1000)
      
      console.log(`✅ Found ${comics.length} comics in list`)
      return comics
    } catch (error) {
      console.error('❌ Error fetching comics list:', error)
      return []
    }
  }

  /**
   * Mendapatkan metadata manhwa (with caching)
   */
  static async getMetadata(slug: string): Promise<ManhwaMetadata | null> {
    const cacheKey = `metadata-${slug}`
    
    // Check cache first
    const cached = cacheService.get<ManhwaMetadata>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      console.log(`📖 Fetching metadata for: ${slug}`)
      
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(`${slug}/metadata.json`)

      if (error) {
        console.error(`❌ Error downloading metadata for ${slug}:`, error)
        throw error
      }

      const text = await data.text()
      const metadata = JSON.parse(text)
      
      // Cache for 5 minutes
      cacheService.set(cacheKey, metadata, 5 * 60 * 1000)
      
      console.log(`✅ Metadata loaded for: ${metadata.title}`)
      return metadata
    } catch (error) {
      console.error(`❌ Error fetching metadata for ${slug}:`, error)
      return null
    }
  }

  /**
   * Mendapatkan semua chapters untuk manhwa tertentu
   */
  static async getChapters(slug: string): Promise<ChaptersData | null> {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(`${slug}/chapters.json`)

      if (error) throw error

      const text = await data.text()
      return JSON.parse(text)
    } catch (error) {
      console.error(`Error fetching chapters for ${slug}:`, error)
      return null
    }
  }

  /**
   * Mendapatkan data chapter individual (images)
   * Mengambil dari chapters.json dan filter berdasarkan chapterSlug
   */
  static async getChapter(manhwaSlug: string, chapterSlug: string): Promise<ChapterDetail | null> {
    try {
      console.log(`📖 Fetching chapter: ${manhwaSlug}/${chapterSlug}`)
      
      // Get all chapters from chapters.json
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
      
      console.log(`✅ Chapter loaded: ${chapter.title} (${chapter.images?.length || 0} images)`)
      return chapter
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
    batchSize: number = 10
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

          return {
            slug: metadata.slug,
            title: metadata.title,
            genre: metadata.genres?.join(', ') || 'Action, Fantasy',
            rating: metadata.rating || '9.5',
            chapters: metadata.total_chapters,
            lastUpdate: (metadata as any).metadata?.['Updated on'] || 'Baru saja',
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
      
      // Check cache first
      const cached = cacheService.get<ManhwaCardData[]>(cacheKey)
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

      // Process in parallel batches (10 at a time)
      const manhwaCards = await this.processBatch(comics, skipChapters, 10)

      // Cache for 3 minutes
      cacheService.set(cacheKey, manhwaCards, 3 * 60 * 1000)

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
   * Search manhwa by title
   */
  static async searchManhwa(query: string): Promise<ManhwaCardData[]> {
    const allCards = await this.getManhwaCards()
    
    return allCards.filter(card => 
      card.title.toLowerCase().includes(query.toLowerCase())
    )
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
      console.error(`Error fetching chapter images for ${slug}/${chapterSlug}:`, error)
      return []
    }
  }
}
