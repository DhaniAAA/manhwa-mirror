import { ref, computed } from 'vue'
import { ManhwaService } from '../services/manhwaService'
import type { ManhwaCardData, ChaptersData } from '../types/manhwa'

export function useManhwa() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const manhwaList = ref<ManhwaCardData[]>([])
  const currentManhwa = ref<ChaptersData | null>(null)

  /**
   * Load daftar manhwa
   */
  const loadManhwaList = async (limit?: number) => {
    loading.value = true
    error.value = null

    try {
      manhwaList.value = await ManhwaService.getManhwaCards(limit)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load manhwa list'
      console.error('Error loading manhwa list:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Load trending manhwa
   */
  const loadTrending = async (limit: number = 6) => {
    loading.value = true
    error.value = null

    try {
      manhwaList.value = await ManhwaService.getManhwaByBadge('Trending', limit)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load trending manhwa'
      console.error('Error loading trending:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Load continue reading
   */
  const loadContinueReading = async (limit: number = 4) => {
    loading.value = true
    error.value = null

    try {
      manhwaList.value = await ManhwaService.getContinueReading(limit)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load continue reading'
      console.error('Error loading continue reading:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Load manhwa detail dengan chapters
   */
  const loadManhwaDetail = async (slug: string) => {
    loading.value = true
    error.value = null

    try {
      currentManhwa.value = await ManhwaService.getChapters(slug)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load manhwa detail'
      console.error('Error loading manhwa detail:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Search manhwa
   */
  const searchManhwa = async (query: string) => {
    if (!query.trim()) {
      manhwaList.value = []
      return
    }

    loading.value = true
    error.value = null

    try {
      manhwaList.value = await ManhwaService.searchManhwa(query)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to search manhwa'
      console.error('Error searching manhwa:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    loading,
    error,
    manhwaList,
    currentManhwa,

    // Actions
    loadManhwaList,
    loadTrending,
    loadContinueReading,
    loadManhwaDetail,
    searchManhwa
  }
}

/**
 * Composable untuk chapter reader
 */
export function useChapterReader(manhwaSlug: string, chapterSlug: string) {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const images = ref<string[]>([])
  const currentPage = ref(1)

  const totalPages = computed(() => images.value.length)
  const progress = computed(() => 
    totalPages.value > 0 ? (currentPage.value / totalPages.value) * 100 : 0
  )

  /**
   * Load chapter images
   */
  const loadChapter = async () => {
    loading.value = true
    error.value = null

    try {
      images.value = await ManhwaService.getChapterImages(manhwaSlug, chapterSlug)
      currentPage.value = 1
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load chapter'
      console.error('Error loading chapter:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Navigate to next page
   */
  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
    }
  }

  /**
   * Navigate to previous page
   */
  const previousPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--
    }
  }

  /**
   * Go to specific page
   */
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  return {
    // State
    loading,
    error,
    images,
    currentPage,
    totalPages,
    progress,

    // Actions
    loadChapter,
    nextPage,
    previousPage,
    goToPage
  }
}
