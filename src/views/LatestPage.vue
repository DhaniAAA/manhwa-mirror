<template>
  <div class="min-h-screen pt-[70px]">
    <!-- Page Hero -->
    <section class="bg-gradient-to-br from-accent-primary/10 to-accent-secondary/5 border-b border-border-color py-12 pb-8">
      <div class="container mx-auto px-4">
        <div class="flex items-center gap-6 mb-8">
          <div class="w-15 h-15 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white shadow-lg shadow-accent-primary/30">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <div>
            <h1 class="text-3xl md:text-4xl font-bold text-text-primary mb-2">Rilis Terbaru</h1>
            <p class="text-lg text-text-secondary">Chapter dan manhwa terbaru yang baru saja dirilis</p>
          </div>
        </div>
        
        <!-- Sort Options -->
        <div class="flex gap-3 overflow-x-auto pb-2">
          <button 
            v-for="option in sortOptions" 
            :key="option.value"
            :class="[
              'flex items-center gap-2 px-5 py-3 border rounded-xl font-medium cursor-pointer transition-all duration-200 whitespace-nowrap',
              sortBy === option.value 
                ? 'border-accent-primary bg-accent-primary/10 text-accent-primary' 
                : 'border-border-color bg-bg-secondary text-text-secondary hover:border-accent-primary hover:bg-bg-tertiary hover:text-text-primary'
            ]"
            @click="sortBy = option.value"
          >
            <component :is="option.icon" />
            <span>{{ option.label }}</span>
          </button>
        </div>
      </div>
    </section>
    
    <!-- Latest Content -->
    <section class="py-12">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-3xl font-bold text-text-primary">
            {{ sortBy === 'chapter' ? 'Chapter Terbaru' : 'Manhwa Terbaru' }}
          </h2>
          <div class="text-text-secondary text-[15px]">
            Halaman {{ currentPage }} dari {{ totalPages }}
          </div>
        </div>
        
        <div v-if="loading" class="flex flex-col items-center justify-center py-16 px-8 gap-4">
          <div class="w-12 h-12 border-4 border-border-color border-t-accent-primary rounded-full animate-spin"></div>
          <p class="text-text-secondary">Memuat data terbaru...</p>
        </div>
        
        <div v-else-if="displayedManhwa.length === 0" class="flex flex-col items-center justify-center py-16 px-8 text-center">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-text-muted opacity-50 mb-6">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          <h3 class="text-2xl font-semibold text-text-primary mb-2">Belum Ada Data</h3>
          <p class="text-text-secondary">Belum ada manhwa atau chapter terbaru saat ini</p>
        </div>
        
        <div v-else>
          <div class="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 md:gap-6 mb-12">
            <ManhwaCard
              v-for="manhwa in displayedManhwa"
              :key="manhwa.slug"
              :slug="manhwa.slug"
              :title="manhwa.title"
              :coverImage="manhwa.cover_url || manhwa.coverImage"
              :type="manhwa.type"
              :status="manhwa.status"
              :rating="manhwa.rating"
              :chapters="manhwa.chapters || manhwa.total_chapters"
              :genre="manhwa.genre"
              :badge="manhwa.badge || 'New'"
              :lastUpdate="manhwa.lastUpdate"
              :latestChapters="manhwa.latestChapters"
              @click="goToDetail"
              @chapterClick="goToChapter"
            />
          </div>
          
          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex flex-wrap items-center justify-center gap-2 md:gap-4 mt-12">
            <button 
              class="flex items-center gap-2 px-5 py-3 border border-border-color rounded-xl bg-bg-secondary text-text-secondary font-medium cursor-pointer transition-all duration-200 hover:border-accent-primary hover:bg-bg-tertiary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed" 
              :disabled="currentPage === 1"
              @click="changePage(currentPage - 1)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Sebelumnya
            </button>
            
            <div class="flex gap-2">
              <button
                v-for="page in visiblePages"
                :key="page"
                :class="[
                  'w-10 h-10 border rounded-lg font-medium cursor-pointer transition-all duration-200',
                  page === currentPage
                    ? 'border-accent-primary bg-accent-primary text-white'
                    : 'border-border-color bg-bg-secondary text-text-secondary hover:border-accent-primary hover:bg-bg-tertiary hover:text-text-primary'
                ]"
                @click="changePage(page)"
              >
                {{ page }}
              </button>
            </div>
            
            <button 
              class="flex items-center gap-2 px-5 py-3 border border-border-color rounded-xl bg-bg-secondary text-text-secondary font-medium cursor-pointer transition-all duration-200 hover:border-accent-primary hover:bg-bg-tertiary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed" 
              :disabled="currentPage === totalPages"
              @click="changePage(currentPage + 1)"
            >
              Selanjutnya
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
const { manhwaList, loadManhwaList } = useManhwa()
const loading = ref(true)
const sortBy = ref('chapter')
const currentPage = ref(1)
const itemsPerPage = 12

// Sort options with icons
const sortOptions = computed(() => [
  {
    value: 'chapter',
    label: 'Chapter Terbaru',
    icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { d: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z' }),
      h('path', { d: 'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' })
    ])
  },
  {
    value: 'manhwa',
    label: 'Manhwa Baru',
    icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { d: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' })
    ])
  }
])

const sortedManhwa = computed(() => {
  const list = [...manhwaList.value]
  if (sortBy.value === 'chapter') {
    // Sort by latest chapter update
    return list.sort((a, b) => {
      const timeA = parseUpdateTime(a.lastUpdate || '')
      const timeB = parseUpdateTime(b.lastUpdate || '')
      return timeA - timeB
    })
  } else {
    // Sort by newest manhwa (you can customize this logic)
    return list.sort((a, b) => {
      const ratingA = typeof a.rating === 'string' ? parseFloat(a.rating) : (a.rating || 0)
      const ratingB = typeof b.rating === 'string' ? parseFloat(b.rating) : (b.rating || 0)
      return ratingB - ratingA
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

// Parse update time string to comparable number (lower is more recent)
function parseUpdateTime(timeStr: string): number {
  if (!timeStr) return Infinity
  
  const lowerTime = timeStr.toLowerCase()
  
  if (lowerTime.includes('menit') || lowerTime.includes('minute')) {
    const match = lowerTime.match(/(\d+)/)
    return match && match[1] ? parseInt(match[1]) : Infinity
  }
  
  if (lowerTime.includes('jam') || lowerTime.includes('hour')) {
    const match = lowerTime.match(/(\d+)/)
    return match && match[1] ? parseInt(match[1]) * 60 : Infinity
  }
  
  if (lowerTime.includes('hari') || lowerTime.includes('day')) {
    const match = lowerTime.match(/(\d+)/)
    return match && match[1] ? parseInt(match[1]) * 1440 : Infinity
  }
  
  if (lowerTime.includes('minggu') || lowerTime.includes('week')) {
    const match = lowerTime.match(/(\d+)/)
    return match && match[1] ? parseInt(match[1]) * 10080 : Infinity
  }
  
  return Infinity
}

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Reset to page 1 when sort changes
watch(sortBy, () => {
  currentPage.value = 1
})

onMounted(async () => {
  loading.value = true
  try {
    await loadManhwaList(50) // Load more items for pagination
  } catch (error) {
    console.error('Error loading latest:', error)
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

<style scoped>
/* All CSS migrated to Tailwind! */
</style>
