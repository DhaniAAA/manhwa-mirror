import { ref } from 'vue'
import { ManhwaService } from '../services/manhwaService'
import type { ManhwaMetadata, ChaptersData } from '../types/manhwa'

export function useManhwaDetail() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const metadata = ref<ManhwaMetadata | null>(null)
  const chaptersData = ref<ChaptersData | null>(null)

  /**
   * Load full metadata untuk detail page
   */
  const loadManhwaDetail = async (slug: string) => {
    loading.value = true
    error.value = null

    try {
      console.log(`🔍 Loading detail for: ${slug}`)
      
      // Load metadata dan chapters secara parallel
      const [metadataResult, chaptersResult] = await Promise.all([
        ManhwaService.getMetadata(slug),
        ManhwaService.getChapters(slug)
      ])

      if (!metadataResult) {
        throw new Error('Metadata not found')
      }

      // Normalize metadata format
      const normalizedMetadata = {
        ...metadataResult,
        description: metadataResult.description || (metadataResult as any).synopsis,
        author: metadataResult.author || (metadataResult as any).metadata?.Author,
        artist: metadataResult.artist || (metadataResult as any).metadata?.Artist,
        status: metadataResult.status || (metadataResult as any).metadata?.Status,
        type: (metadataResult as any).metadata?.Type,
        release_year: metadataResult.release_year || (metadataResult as any).metadata?.Released,
        lastUpdate: metadataResult.lastUpdate || (metadataResult as any).metadata?.['Updated on'],
        rating: metadataResult.rating || '9.5'
      }
      
      metadata.value = normalizedMetadata
      chaptersData.value = chaptersResult

      console.log('✅ Detail loaded:', {
        title: normalizedMetadata.title,
        chapters: chaptersResult?.chapters.length || 0,
        cover: normalizedMetadata.cover_url ? 'Yes' : 'No',
        author: normalizedMetadata.author,
        genres: normalizedMetadata.genres?.join(', ')
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load manhwa detail'
      console.error('❌ Error loading detail:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Clear data
   */
  const clearDetail = () => {
    metadata.value = null
    chaptersData.value = null
    error.value = null
  }

  return {
    // State
    loading,
    error,
    metadata,
    chaptersData,

    // Actions
    loadManhwaDetail,
    clearDetail
  }
}
