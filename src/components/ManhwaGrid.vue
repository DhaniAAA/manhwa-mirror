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

        <div class="flex gap-2">
          <button
            v-for="page in visiblePages"
            :key="page"
            :class="[paginationNumberClasses, page === currentPage ? 'border-accent-primary bg-accent-primary text-white' : '']"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
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
  const pages: number[] = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
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
