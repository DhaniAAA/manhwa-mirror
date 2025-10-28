<template>
  <section class="bg-background-primary py-16">
    <div class="container">
      <!-- Header -->
      <div class="mb-12 text-center">
        <h2 class="text-3xl font-bold text-text-primary md:text-4xl">Semua Manhwa</h2>
        <p class="mt-2 text-base text-text-secondary">{{ totalManhwa }} judul tersedia</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex min-h-[400px] flex-col items-center justify-center gap-4 text-text-secondary">
        <div class="h-12 w-12 animate-spin rounded-full border-4 border-background-tertiary border-t-accent-primary"></div>
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

<<<<<<< HEAD
        <div class="pagination-numbers">
          <template v-for="(page, index) in visiblePages" :key="index">
            <button
              v-if="typeof page === 'number'"
              class="pagination-number"
              :class="{ active: page === currentPage }"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
            <span v-else class="pagination-ellipsis">
              {{ page }}
            </span>
          </template>
=======
        <div class="flex gap-2">
          <button
            v-for="page in visiblePages"
            :key="page"
            :class="[paginationNumberClasses, page === currentPage ? 'border-accent-primary bg-accent-primary text-white' : '']"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
>>>>>>> 55df43e16ee1a1ffed61a42e163f41533e501fb8
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
  'flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background-secondary text-text-primary transition duration-150 ease-standard hover:border-accent-primary hover:bg-background-tertiary/80 hover:text-accent-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-background-secondary'
const paginationNumberClasses =
  'flex h-10 min-w-[40px] items-center justify-center rounded-lg border border-border bg-background-secondary px-3 text-sm font-medium text-text-primary transition duration-150 ease-standard hover:border-accent-primary hover:bg-background-tertiary/80 hover:text-accent-primary'

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
<<<<<<< HEAD

<style scoped>
.manhwa-grid-section {
  padding: 4rem 0;
  background: var(--bg-primary);
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.section-subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
}

/* Grid */
.manhwa-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

/* Loading & Error States */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
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

.error-state svg {
  color: var(--accent-primary);
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.pagination-btn {
  width: 44px;
  height: 44px;
  border: 2px solid var(--border-color);
  border-radius: 0.625rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.pagination-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(139, 92, 246, 0.1);
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s;
}

.pagination-btn:hover:not(:disabled)::before {
  width: 100%;
  height: 100%;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--bg-tertiary);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
}

.pagination-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(139, 92, 246, 0.2);
}

.pagination-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  background: var(--bg-primary);
}

.pagination-btn svg {
  position: relative;
  z-index: 1;
}

.pagination-numbers {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.pagination-number {
  min-width: 44px;
  height: 44px;
  padding: 0 0.875rem;
  border: 2px solid var(--border-color);
  border-radius: 0.625rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9375rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.pagination-number::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(139, 92, 246, 0.1);
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s;
}

.pagination-number:hover:not(.active)::before {
  width: 100%;
  height: 100%;
}

.pagination-number:hover:not(.active) {
  background: var(--bg-tertiary);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
}

.pagination-number:active:not(.active) {
  transform: translateY(0);
}

.pagination-number.active {
  background: linear-gradient(135deg, var(--accent-primary) 0%, #7c3aed 100%);
  border-color: var(--accent-primary);
  color: white;
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
  transform: scale(1.05);
  font-weight: 700;
}

.pagination-number.active::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
  pointer-events: none;
}

/* Pagination Ellipsis */
.pagination-ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 44px;
  color: var(--text-muted);
  font-size: 1.25rem;
  font-weight: 600;
  user-select: none;
}

/* Page Info */
.page-info {
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-muted);
}

/* Responsive */
@media (max-width: 1024px) {
  .manhwa-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1.25rem;
  }
}

@media (max-width: 768px) {
  .section-title {
    font-size: 2rem;
  }

  .manhwa-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
  }

  .pagination {
    gap: 0.375rem;
  }

  .pagination-btn,
  .pagination-number {
    width: 40px;
    height: 40px;
    min-width: 40px;
    font-size: 0.875rem;
  }
  
  .pagination-numbers {
    gap: 0.375rem;
  }
  
  .pagination-btn:hover:not(:disabled),
  .pagination-number:hover:not(.active) {
    transform: translateY(-1px);
  }
}

@media (max-width: 480px) {
  .manhwa-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
=======
>>>>>>> 55df43e16ee1a1ffed61a42e163f41533e501fb8
