<template>
  <div class="home-page">
    <HeroSection />
    
    <!-- Search Results Section -->
    <section v-if="searchQuery" class="manhwa-section search-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-right: 0.5rem;">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            Hasil Pencarian: "{{ searchQuery }}"
          </h2>
          <div class="page-info">
            {{ searchResults.length }} manhwa ditemukan
          </div>
        </div>
        
        <div v-if="searchLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Mencari manhwa...</p>
        </div>
        
        <div v-else-if="searchResults.length === 0" class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <h3>Tidak ada hasil</h3>
          <p>Coba kata kunci lain untuk menemukan manhwa yang Anda cari</p>
        </div>
        
        <div v-else class="manhwa-grid">
          <ManhwaCard
            v-for="manhwa in searchResults"
            :key="manhwa.slug"
            :slug="manhwa.slug"
            :title="manhwa.title"
            :coverImage="manhwa.cover_url || manhwa.coverImage"
            :type="manhwa.type"
            :status="manhwa.status"
            :rating="manhwa.rating"
            :chapters="manhwa.chapters || manhwa.total_chapters"
            :genre="manhwa.genre"
            :badge="manhwa.badge"
            :latestChapters="manhwa.latestChapters"
            @click="goToDetail"
            @chapterClick="goToChapter"
          />
        </div>
      </div>
    </section>
    
    <!-- Rekomendasi Manhwa Section -->
    <section id="recommendation-section" class="manhwa-section recommendation-section">
      <div class="container">
        <div class="section-header">
          <div class="header-with-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="section-icon">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <div>
              <h2 class="section-title">Rekomendasi Manhwa</h2>
              <p class="section-description">Pilihan terbaik untuk Anda berdasarkan rating tertinggi</p>
            </div>
          </div>
          <div class="page-info">
            Halaman {{ latestPage }} dari {{ latestTotalPages }}
          </div>
        </div>
        
        <div v-if="loadingLatest" class="loading-state">
          <div class="spinner"></div>
          <p>Memuat rekomendasi...</p>
        </div>
        
        <div v-else>
          <div class="manhwa-grid">
            <ManhwaCard
              v-for="(manhwa, index) in displayedLatest"
              :key="manhwa.slug"
              :slug="manhwa.slug"
              :title="manhwa.title"
              :coverImage="manhwa.cover_url || manhwa.coverImage"
              :type="manhwa.type"
              :status="manhwa.status"
              :rating="manhwa.rating"
              :chapters="manhwa.chapters || manhwa.total_chapters"
              :genre="manhwa.genre"
              :latestChapters="manhwa.latestChapters"
              :priority="index < 3"
              @click="goToDetail"
              @chapterClick="goToChapter"
            />
          </div>
          
          <!-- Pagination for Recommendations -->
          <div v-if="latestTotalPages > 1" class="pagination">
            <button 
              class="pagination-btn"
              :disabled="latestPage === 1"
              @click="goToLatestPage(1)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="11 17 6 12 11 7"/>
                <polyline points="18 17 13 12 18 7"/>
              </svg>
            </button>
            
            <button 
              class="pagination-btn"
              :disabled="latestPage === 1"
              @click="goToLatestPage(latestPage - 1)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            
            <div class="pagination-numbers">
              <button
                v-for="page in latestTotalPages"
                :key="page"
                class="pagination-number"
                :class="{ active: page === latestPage }"
                @click="goToLatestPage(page)"
              >
                {{ page }}
              </button>
            </div>
            
            <button 
              class="pagination-btn"
              :disabled="latestPage === latestTotalPages"
              @click="goToLatestPage(latestPage + 1)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
            
            <button 
              class="pagination-btn"
              :disabled="latestPage === latestTotalPages"
              @click="goToLatestPage(latestTotalPages)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="13 17 18 12 13 7"/>
                <polyline points="6 17 11 12 6 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Popular Section -->
    <section id="popular-section" class="manhwa-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Manhwa Populer</h2>
          <div class="page-info">
            Halaman {{ popularPage }} dari {{ popularTotalPages }}
          </div>
        </div>
        
        <div v-if="loadingPopular" class="loading-state">
          <div class="spinner"></div>
          <p>Memuat manhwa...</p>
        </div>
        
        <div v-else>
          <div class="manhwa-grid">
            <ManhwaCard
              v-for="manhwa in displayedPopular"
              :key="manhwa.slug"
              :slug="manhwa.slug"
              :title="manhwa.title"
              :coverImage="manhwa.cover_url"
              :type="manhwa.type"
              :status="manhwa.status"
              :rating="manhwa.rating"
              :chapters="manhwa.total_chapters"
              :genre="manhwa.genres?.join(', ')"
              :latestChapters="manhwa.latestChapters"
              @click="goToDetail"
              @chapterClick="goToChapter"
            />
          </div>
          
          <!-- Pagination for Popular -->
          <div v-if="popularTotalPages > 1" class="pagination">
            <button 
              class="pagination-btn"
              :disabled="popularPage === 1"
              @click="goToPopularPage(1)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="11 17 6 12 11 7"/>
                <polyline points="18 17 13 12 18 7"/>
              </svg>
            </button>
            
            <button 
              class="pagination-btn"
              :disabled="popularPage === 1"
              @click="goToPopularPage(popularPage - 1)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            
            <div class="pagination-numbers">
              <button
                v-for="page in popularTotalPages"
                :key="page"
                class="pagination-number"
                :class="{ active: page === popularPage }"
                @click="goToPopularPage(page)"
              >
                {{ page }}
              </button>
            </div>
            
            <button 
              class="pagination-btn"
              :disabled="popularPage === popularTotalPages"
              @click="goToPopularPage(popularPage + 1)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
            
            <button 
              class="pagination-btn"
              :disabled="popularPage === popularTotalPages"
              @click="goToPopularPage(popularTotalPages)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="13 17 18 12 13 7"/>
                <polyline points="6 17 11 12 6 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import HeroSection from '../components/HeroSection.vue'
import ManhwaCard from '../components/ManhwaCard.vue'
import { ManhwaService } from '../services/manhwaService'
import type { ManhwaCardData } from '../types/manhwa'

const router = useRouter()
const route = useRoute()

const loadingLatest = ref(true)
const loadingPopular = ref(true)
const latestManhwa = ref<ManhwaCardData[]>([])
const popularManhwa = ref<ManhwaCardData[]>([])

// Search state
const searchQuery = ref('')
const searchResults = ref<ManhwaCardData[]>([])
const searchLoading = ref(false)

// Pagination state
const latestPage = ref(1)
const popularPage = ref(1)
const itemsPerPage = 15

// Total pages
const latestTotalPages = computed(() => Math.ceil(latestManhwa.value.length / itemsPerPage))
const popularTotalPages = computed(() => Math.ceil(popularManhwa.value.length / itemsPerPage))

// Displayed items based on current page
const displayedLatest = computed(() => {
  const start = (latestPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return latestManhwa.value.slice(start, end)
})

const displayedPopular = computed(() => {
  const start = (popularPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return popularManhwa.value.slice(start, end)
})

const goToDetail = (slug: string) => {
  console.log(`🔗 Navigating to: ${slug}`)
  router.push({ name: 'detail', params: { slug } })
}

const goToChapter = (manhwaSlug: string, chapterSlug: string) => {
  console.log(`📖 Navigating to chapter: ${manhwaSlug}/${chapterSlug}`)
  router.push({ name: 'reader', params: { slug: manhwaSlug, chapterSlug } })
}

const mergeWithHydratedChapters = (
  list: ManhwaCardData[],
  hydratedMap: Map<string, ManhwaCardData>
) => {
  if (!hydratedMap.size) {
    return list
  }

  return list.map(card => hydratedMap.get(card.slug) ?? card)
}

// Pagination functions for Recommendations (Latest)
const goToLatestPage = (page: number) => {
  latestPage.value = page
  console.log(`📄 Recommendations page changed to: ${page}`)
  
  // Scroll to recommendation section
  nextTick(() => {
    const recommendationSection = document.getElementById('recommendation-section')
    if (recommendationSection) {
      const offset = 80 // navbar height
      const elementPosition = recommendationSection.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
      console.log(`✅ Scrolled to recommendation section`)
    } else {
      console.warn('⚠️ Recommendation section not found')
    }
  })
}

// Pagination functions for Popular
const goToPopularPage = (page: number) => {
  popularPage.value = page
  console.log(`📄 Popular page changed to: ${page}`)

  // Scroll to popular section
  nextTick(() => {
    const popularSection = document.getElementById('popular-section')
    if (popularSection) {
      const offset = 80 // navbar height
      const elementPosition = popularSection.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
      console.log(`✅ Scrolled to popular section`)
    } else {
      console.warn('⚠️ Popular section not found')
    }
  })
}

const hydratingSlugs = new Set<string>()

const ensureChaptersForCards = async (cards: ManhwaCardData[]) => {
  const targets = cards.filter(card => {
    if (!card.slug) return false
    if (card.latestChapters && card.latestChapters.length > 0) return false
    return !hydratingSlugs.has(card.slug)
  })

  if (!targets.length) {
    return
  }

  targets.forEach(card => hydratingSlugs.add(card.slug))

  try {
    const hydrated = await ManhwaService.hydrateManhwaCardsWithChapters(targets)
    const hydratedMap = new Map(hydrated.map(card => [card.slug, card]))

    latestManhwa.value = mergeWithHydratedChapters(latestManhwa.value, hydratedMap)
    popularManhwa.value = mergeWithHydratedChapters(popularManhwa.value, hydratedMap)
  } catch (error) {
    console.error('❌ Failed to hydrate chapters for current view:', error)
  } finally {
    targets.forEach(card => hydratingSlugs.delete(card.slug))
  }
}

watch(displayedLatest, (cards) => {
  ensureChaptersForCards(cards)
})

watch(displayedPopular, (cards) => {
  ensureChaptersForCards(cards)
})

// Search function
const handleSearch = async (query: string) => {
  console.log(`🔍 [HomePage] handleSearch called with query: "${query}"`)
  searchQuery.value = query
  
  if (!query.trim()) {
    console.log('📭 [HomePage] Empty query, clearing results')
    searchResults.value = []
    return
  }
  
  searchLoading.value = true
  console.log(`🔄 [HomePage] Starting search for: "${query}"`)
  
  try {
    const results = await ManhwaService.searchManhwa(query)
    searchResults.value = results
    console.log(`✅ [HomePage] Found ${results.length} results:`, results.map(r => r.title))
    
    if (results.length === 0) {
      console.warn(`⚠️ [HomePage] No results found for: "${query}"`)
    }
  } catch (error) {
    console.error('❌ [HomePage] Search error:', error)
    searchResults.value = []
  } finally {
    searchLoading.value = false
    console.log(`🏁 [HomePage] Search completed. Loading: ${searchLoading.value}, Results: ${searchResults.value.length}`)
  }
}

// Watch for route query changes (for search)
watch(
  () => route.query.search,
  (newSearch) => {
    console.log(`👀 [HomePage] Route query changed, search:`, newSearch)
    if (typeof newSearch === 'string') {
      handleSearch(newSearch)
    } else if (newSearch === undefined) {
      // Clear search when query is removed
      handleSearch('')
    }
  },
  { immediate: false } // Don't run on mount, onMounted will handle initial load
)

// Expose handleSearch for parent components
defineExpose({
  handleSearch
})

onMounted(async () => {
  try {
    console.log('🔄 Loading manhwa sections...')
    
    // Check if there's a search query in URL
    if (route.query.search && typeof route.query.search === 'string') {
      console.log('🔍 Search query from URL:', route.query.search)
      await handleSearch(route.query.search)
    }
    
    // Load all manhwa WITHOUT chapters first for faster initial load
    const allManhwa = await ManhwaService.getManhwaCards(undefined, true)
    
    // Recommendations: Sort by rating (highest first)
    latestManhwa.value = [...allManhwa].sort((a, b) => {
      const ratingA = parseFloat(a.rating || '0')
      const ratingB = parseFloat(b.rating || '0')
      return ratingB - ratingA
    })
    
    // Popular: Sort by total chapters (most chapters = most popular)
    popularManhwa.value = [...allManhwa].sort((a, b) => {
      const chaptersA = a.chapters || a.total_chapters || 0
      const chaptersB = b.chapters || b.total_chapters || 0
      return chaptersB - chaptersA
    })
    
    console.log(`✅ Loaded ${latestManhwa.value.length} manhwa (fast mode - no chapters)`)
    console.log(`📊 Recommendations pages: ${latestTotalPages.value}, Popular pages: ${popularTotalPages.value}`)
    
    // Load chapter summaries progressively after initial render
    setTimeout(async () => {
      console.log('🔄 Hydrating visible cards with latest chapters...')

      const prioritizedSlugs = new Set<string>([
        ...latestManhwa.value.slice(0, itemsPerPage).map(card => card.slug),
        ...popularManhwa.value.slice(0, itemsPerPage).map(card => card.slug)
      ])

      const prioritizedCards = allManhwa.filter(card => prioritizedSlugs.has(card.slug))
      const hydratedVisible = await ManhwaService.hydrateManhwaCardsWithChapters(prioritizedCards)
      const visibleMap = new Map(hydratedVisible.map(card => [card.slug, card]))

      latestManhwa.value = mergeWithHydratedChapters(latestManhwa.value, visibleMap)
      popularManhwa.value = mergeWithHydratedChapters(popularManhwa.value, visibleMap)

      const remainingCards = allManhwa.filter(card => !visibleMap.has(card.slug))
      if (remainingCards.length) {
        console.log(`🕒 Hydrating remaining ${remainingCards.length} cards in background...`)
        ManhwaService.hydrateManhwaCardsWithChapters(remainingCards, { batchSize: 8 })
          .then((rest) => {
            const restMap = new Map(rest.map(card => [card.slug, card]))
            latestManhwa.value = mergeWithHydratedChapters(latestManhwa.value, restMap)
            popularManhwa.value = mergeWithHydratedChapters(popularManhwa.value, restMap)
            console.log('✅ Chapters data hydrated for remaining cards')
          })
          .catch(error => {
            console.error('❌ Error hydrating remaining chapters:', error)
          })
      } else {
        console.log('✅ All cards already hydrated with chapters')
      }
    }, 500)
  } catch (error) {
    console.error('❌ Error loading manhwa:', error)
  } finally {
    loadingLatest.value = false
    loadingPopular.value = false
  }
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
}

.manhwa-section {
  padding: 3rem 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.page-info {
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.manhwa-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: var(--text-secondary);
  gap: 1rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--bg-tertiary);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Search Section */
.search-section {
  background: linear-gradient(180deg, rgba(139, 92, 246, 0.05) 0%, transparent 100%);
  border-bottom: 1px solid var(--border-color);
}

.search-section .section-title {
  display: flex;
  align-items: center;
  color: var(--accent-primary);
}

/* Recommendation Section */
.recommendation-section {
  background: linear-gradient(180deg, rgba(251, 191, 36, 0.03) 0%, transparent 100%);
}

.header-with-icon {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.section-icon {
  color: #fbbf24;
  flex-shrink: 0;
}

.section-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0.25rem 0 0 0;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
  padding: 3rem 1rem;
}

.empty-state svg {
  color: var(--text-muted);
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-size: 1rem;
  color: var(--text-secondary);
  max-width: 400px;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.pagination-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: inherit;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--bg-tertiary);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  gap: 0.5rem;
  margin: 0 0.5rem;
}

.pagination-number {
  min-width: 40px;
  height: 40px;
  padding: 0 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: inherit;
}

.pagination-number:hover {
  background: var(--bg-tertiary);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.pagination-number.active {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: white;
}

/* Responsive */
@media (max-width: 1024px) {
  .manhwa-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1.25rem;
  }
  
  .section-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 768px) {
  .manhwa-section {
    padding: 2rem 0;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .page-info {
    width: 100%;
    text-align: center;
  }
  
  .manhwa-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
  }
  
  .pagination {
    flex-wrap: wrap;
    gap: 0.375rem;
  }
  
  .pagination-btn,
  .pagination-number {
    width: 36px;
    height: 36px;
    min-width: 36px;
  }
  
  .pagination-numbers {
    margin: 0 0.25rem;
  }
}

@media (max-width: 480px) {
  .manhwa-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
