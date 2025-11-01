<template>
  <div class="min-h-screen bg-[var(--bg-primary)] pt-[70px]">
    <!-- Page Header -->
    <section class="border-b border-[var(--border-color)] bg-gradient-to-br from-[rgba(139,92,246,0.1)] to-[rgba(167,139,250,0.05)] py-10 sm:py-12">
      <div class="container">
        <div class="mb-8 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white [box-shadow:var(--shadow-lg),var(--glow-accent)] sm:h-20 sm:w-20">
            <svg class="h-8 w-8 sm:h-12 sm:w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div>
            <h1 class="text-3xl font-bold text-[var(--text-primary)] sm:text-4xl md:text-5xl">Manhwa Populer</h1>
            <p class="text-base text-[var(--text-secondary)] sm:text-lg">Manhwa paling populer dan paling banyak dibaca</p>
          </div>
        </div>
        
        <!-- Filter Options -->
        <div class="flex gap-2 overflow-x-auto pb-2 sm:gap-3">
          <button 
            v-for="option in filterOptions" 
            :key="option.value"
            :class="[
              'flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors duration-200 whitespace-nowrap hover:border-[var(--accent-primary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] sm:px-5 sm:py-3 sm:text-base',
              filterBy === option.value && 'border-[var(--accent-primary)] bg-[rgba(139,92,246,0.1)] text-[var(--accent-primary)]'
            ]"
            @click="filterBy = option.value"
          >
            <component :is="option.icon" />
            <span>{{ option.label }}</span>
          </button>
        </div>
      </div>
    </section>
    
    <!-- Popular Content -->
    <section class="py-12">
      <div class="container">
        <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 class="text-3xl font-bold text-[var(--text-primary)]">
            {{ filterTitle }}
          </h2>
          <div class="text-sm text-[var(--text-secondary)] md:text-base">
            Halaman {{ currentPage }} dari {{ totalPages }}
          </div>
        </div>
        
        <div v-if="loading" class="flex flex-col items-center justify-center gap-4 px-8 py-16 text-center">
          <div class="h-12 w-12 animate-spin rounded-full border-4 border-[var(--border-color)] border-t-[var(--accent-primary)]"></div>
          <p class="text-base text-[var(--text-secondary)]">Memuat manhwa populer...</p>
        </div>
        
        <div v-else-if="displayedManhwa.length === 0" class="flex flex-col items-center justify-center px-8 py-16 text-center">
          <svg class="mb-6 h-20 w-20 text-[var(--text-muted)] opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <h3 class="mb-2 text-2xl font-semibold text-[var(--text-primary)]">Belum Ada Data</h3>
          <p class="text-[var(--text-secondary)]">Belum ada manhwa populer saat ini</p>
        </div>
        
        <div v-else>
          <div class="mb-12 grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(150px,1fr))] sm:gap-6 sm:[grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
            <ManhwaCard
              v-for="(manhwa, index) in displayedManhwa"
              :key="manhwa.slug"
              :slug="manhwa.slug"
              :title="manhwa.title"
              :coverImage="manhwa.cover_url || manhwa.coverImage"
              :type="manhwa.type"
              :status="manhwa.status"
              :rating="manhwa.rating"
              :chapters="manhwa.chapters || manhwa.total_chapters"
              :genre="manhwa.genre"
              :badge="manhwa.badge || (index < 3 ? 'Hot' : 'Popular')"
              :lastUpdate="manhwa.lastUpdate"
              :latestChapters="manhwa.latestChapters"
              @click="goToDetail"
              @chapterClick="goToChapter"
            />
          </div>
          
          <!-- Pagination -->
          <div v-if="totalPages > 1" class="mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button 
              class="flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors duration-200 hover:border-[var(--accent-primary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50 sm:px-5 sm:py-3 sm:text-base" 
              :disabled="currentPage === 1"
              @click="changePage(currentPage - 1)"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Sebelumnya
            </button>
            
            <div class="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <button
                v-for="page in visiblePages"
                :key="page"
                :class="[
                  'flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] font-medium text-[var(--text-secondary)] transition-colors duration-200 hover:border-[var(--accent-primary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]',
                  page === currentPage && 'border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white'
                ]"
                @click="changePage(page)"
              >
                {{ page }}
              </button>
            </div>
            
            <button 
              class="flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors duration-200 hover:border-[var(--accent-primary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50 sm:px-5 sm:py-3 sm:text-base" 
              :disabled="currentPage === totalPages"
              @click="changePage(currentPage + 1)"
            >
              Selanjutnya
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, h } from 'vue'
import { useRouter } from 'vue-router'
import ManhwaCard from '../components/ManhwaCard.vue'
import { useManhwa } from '../composables/useManhwa'

const router = useRouter()
const { manhwaList, loadTrending } = useManhwa()
const loading = ref(true)
const filterBy = ref('all')
const currentPage = ref(1)
const itemsPerPage = 12

// Filter options with icons
const filterOptions = computed(() => [
  {
    value: 'all',
    label: 'Semua Waktu',
    icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('circle', { cx: 12, cy: 12, r: 10 })
    ])
  },
  {
    value: 'week',
    label: 'Minggu Ini',
    icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { d: 'M16 2v4M8 2v4M3 10h18' }),
      h('rect', { x: 3, y: 4, width: 18, height: 18, rx: 2 })
    ])
  },
  {
    value: 'month',
    label: 'Bulan Ini',
    icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { d: 'M21 10H3M16 2v4M8 2v4' }),
      h('rect', { x: 3, y: 4, width: 18, height: 18, rx: 2 })
    ])
  },
  {
    value: 'rating',
    label: 'Rating Tertinggi',
    icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('polygon', { points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' })
    ])
  }
])

const filterTitle = computed(() => {
  const titles: Record<string, string> = {
    all: 'Populer Sepanjang Masa',
    week: 'Populer Minggu Ini',
    month: 'Populer Bulan Ini',
    rating: 'Rating Tertinggi'
  }
  return titles[filterBy.value] || 'Manhwa Populer'
})

const sortedManhwa = computed(() => {
  const list = [...manhwaList.value]
  
  if (filterBy.value === 'rating') {
    // Sort by rating
    return list.sort((a, b) => {
      const ratingA = typeof a.rating === 'string' ? parseFloat(a.rating) : (a.rating || 0)
      const ratingB = typeof b.rating === 'string' ? parseFloat(b.rating) : (b.rating || 0)
      return ratingB - ratingA
    })
  } else {
    // Sort by chapters (as proxy for popularity)
    return list.sort((a, b) => {
      const chaptersA = a.chapters || a.total_chapters || 0
      const chaptersB = b.chapters || b.total_chapters || 0
      return chaptersB - chaptersA
    })
  }
})

const totalPages = computed(() => Math.ceil(sortedManhwa.value.length / itemsPerPage))

const displayedManhwa = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return sortedManhwa.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
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

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Reset to page 1 when filter changes
watch(filterBy, () => {
  currentPage.value = 1
})

onMounted(async () => {
  loading.value = true
  try {
    await loadTrending(50) // Load more items for pagination
  } catch (error) {
    console.error('Error loading popular:', error)
  } finally {
    loading.value = false
  }
})

const goToDetail = (slug: string) => {
  router.push(`/detail/${slug}`)
}

const goToChapter = (slug: string, chapterSlug: string) => {
  router.push(`/baca/${slug}/read/${chapterSlug}`)
}
</script>
