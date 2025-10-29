<template>
  <section class="bg-bg-primary py-16">
    <div class="container">
      <!-- Header -->
      <div class="mb-12 text-center">
        <h2 class="text-3xl font-bold text-text-primary md:text-4xl">Semua Manhwa</h2>
        <p class="mt-2 text-base text-text-secondary">{{ totalManhwa }} judul tersedia</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex min-h-[400px] flex-col items-center justify-center gap-4 text-text-secondary">
        <div class="h-12 w-12 animate-spin rounded-full border-4 border-bg-tertiary border-t-accent-primary"></div>
        <p>Mencari manhwa...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex min-h-[400px] flex-col items-center justify-center gap-4 text-text-secondary">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-accent-primary">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p>{{ error }}</p>
      </div>

      <!-- Manhwa Grid -->
      <div v-else class="grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        <ManhwaCard
          v-for="manhwa in paginatedManhwa"
          :key="manhwa.slug"
          :slug="manhwa.slug"
          :title="manhwa.title"
          :coverImage="manhwa.cover_url"
          :rating="manhwa.rating || '9.5'"
          :chapters="manhwa.total_chapters"
          :genre="manhwa.genres?.join(', ') || 'Action'"
          :badge="manhwa.status"
          :latestChapters="manhwa.latestChapters"
        />
      </div>

      <!-- Pagination -->
      <div
        v-if="!loading && !error && totalPages > 1"
        class="mt-12 flex flex-wrap items-center justify-center gap-2"
      >
        <button
          :class="paginationButtonClasses"
          :disabled="currentPage === 1"
          @click="goToPage(1)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="11 17 6 12 11 7"/>
            <polyline points="18 17 13 12 18 7"/>
          </svg>
        </button>

        <button
          :class="paginationButtonClasses"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <div class="flex flex-wrap gap-2 justify-center">
          <template v-for="(page, index) in visiblePages" :key="index">
            <button
              v-if="typeof page === 'number'"
              class="relative min-w-[44px] h-11 px-3.5 rounded-lg border-2 font-semibold text-[15px] transition-all duration-200 overflow-hidden"
              :class="page === currentPage 
                ? 'bg-gradient-to-br from-accent-primary to-purple-700 border-accent-primary text-white shadow-lg shadow-accent-primary/40 scale-105 font-bold' 
                : 'bg-bg-secondary border-border-color text-text-primary hover:bg-bg-tertiary hover:border-accent-primary hover:text-accent-primary hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-primary/20'"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
            <span v-else class="flex items-center justify-center min-w-[44px] h-11 text-text-muted text-xl font-semibold select-none">
              {{ page }}
            </span>
          </template>
        </div>

        <button
          :class="paginationButtonClasses"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        <button
          :class="paginationButtonClasses"
          :disabled="currentPage === totalPages"
          @click="goToPage(totalPages)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="13 17 18 12 13 7"/>
            <polyline points="6 17 11 12 6 7"/>
          </svg>
        </button>
      </div>

      <!-- Page Info -->
      <div v-if="!loading && !error" class="mt-6 text-center text-sm text-text-muted">
        Menampilkan {{ startIndex + 1 }}-{{ endIndex }} dari {{ totalManhwa }} manhwa
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ManhwaService } from '../services/manhwaService'
import ManhwaCard from './ManhwaCard.vue'
import type { ManhwaCardData } from '../types/manhwa'

const loading = ref(true)
const error = ref<string | null>(null)
const allManhwa = ref<ManhwaCardData[]>([])
const currentPage = ref(1)
const itemsPerPage = 24

const paginationButtonClasses =
  'flex h-10 w-10 items-center justify-center rounded-lg border border-border-color bg-bg-secondary text-text-primary transition duration-150 hover:border-accent-primary hover:bg-bg-tertiary/80 hover:text-accent-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-bg-secondary'
// Removed unused paginationNumberClasses - using inline classes in template

// Computed
const totalManhwa = computed(() => allManhwa.value.length)
const totalPages = computed(() => Math.ceil(totalManhwa.value / itemsPerPage))

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, totalManhwa.value))

const paginatedManhwa = computed(() => {
  return allManhwa.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const maxVisible = 6
  const pages: (number | string)[] = []
  
  if (totalPages.value <= maxVisible) {
    // Show all pages if total is less than max
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)
    
    let startPage = Math.max(2, currentPage.value - 1)
    let endPage = Math.min(totalPages.value - 1, currentPage.value + 1)
    
    // Adjust if near start
    if (currentPage.value <= 3) {
      endPage = Math.min(maxVisible - 1, totalPages.value - 1)
    }
    
    // Adjust if near end
    if (currentPage.value >= totalPages.value - 2) {
      startPage = Math.max(2, totalPages.value - (maxVisible - 2))
    }
    
    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pages.push('...')
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages.value - 1) {
      pages.push('...')
    }
    
    // Always show last page
    pages.push(totalPages.value)
  }
  
  return pages
})

const hydratingSlugs = new Set<string>()

const ensureChaptersForGrid = async (cards: ManhwaCardData[]) => {
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
    allManhwa.value = allManhwa.value.map(card => hydratedMap.get(card.slug) ?? card)
  } catch (error) {
    console.error('❌ Error hydrating grid chapters:', error)
  } finally {
    targets.forEach(card => hydratingSlugs.delete(card.slug))
  }
}

// Methods
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Load data
onMounted(async () => {
  try {
    console.log('🔍 Loading all manhwa...')
    // Load without chapters first for faster initial load
    const cards = await ManhwaService.getManhwaCards(undefined, true)
    allManhwa.value = cards
    console.log(`✅ Loaded ${cards.length} manhwa (fast mode)`)

    await ensureChaptersForGrid(paginatedManhwa.value)

    // Load remaining chapters in background batches
    setTimeout(async () => {
      const remaining = allManhwa.value.filter(card => !card.latestChapters?.length)
      if (!remaining.length) {
        return
      }

      console.log(`🔄 Hydrating ${remaining.length} remaining cards in background...`)
      const hydrated = await ManhwaService.hydrateManhwaCardsWithChapters(remaining, { batchSize: 8 })
      const hydratedMap = new Map(hydrated.map(card => [card.slug, card]))
      allManhwa.value = allManhwa.value.map(card => hydratedMap.get(card.slug) ?? card)
      console.log('✅ Remaining chapters hydrated')
    }, 600)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load manhwa'
    console.error('❌ Error loading manhwa:', err)
  } finally {
    loading.value = false
  }
})

// Watch page changes
watch(currentPage, () => {
  console.log(`📄 Page changed to: ${currentPage.value}`)
})

watch(paginatedManhwa, (cards) => {
  ensureChaptersForGrid(cards)
})
</script>

<style scoped>
/* All styles migrated to Tailwind CSS! */
/* No custom CSS needed - everything is inline with Tailwind utilities */
</style>
