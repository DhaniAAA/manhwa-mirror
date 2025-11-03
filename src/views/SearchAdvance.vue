<template>
  <div class="min-h-screen pt-[70px]">
    <!-- Page Hero -->
    <section class="bg-gradient-to-br from-accent-primary/10 to-accent-secondary/5 border-b border-border-color py-12 pb-8">
      <div class="container mx-auto px-4">
        <div class="flex items-center gap-6 mb-8">
          <div class="w-15 h-15 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white shadow-lg shadow-accent-primary/30">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M16 12l-4-4-4 4M16 16l-4-4-4 4"/>
            </svg>
          </div>
          <div>
            <h1 class="text-3xl md:text-4xl font-bold text-text-primary mb-2">Pencarian Lanjutan</h1>
            <p class="text-lg text-text-secondary">Temukan manhwa favorit dengan filter lengkap</p>
          </div>
        </div>
        
        <!-- Search Bar -->
        <div class="mb-6">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari judul manhwa..."
              class="w-full px-5 py-4 pl-12 bg-bg-secondary border border-border-color rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
            />
            <svg class="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
        </div>

        <!-- Advanced Filters -->
        <div class="space-y-4">
          <!-- Type Filter -->
          <div>
            <label class="block text-sm font-semibold text-text-primary mb-2">Tipe</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="type in typeOptions"
                :key="type.value"
                @click="toggleFilter('type', type.value)"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  filters.type.includes(type.value)
                    ? 'bg-accent-primary text-white'
                    : 'bg-bg-secondary text-text-secondary border border-border-color hover:border-accent-primary'
                ]"
              >
                {{ type.label }}
              </button>
            </div>
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-semibold text-text-primary mb-2">Status</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="status in statusOptions"
                :key="status.value"
                @click="toggleFilter('status', status.value)"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  filters.status.includes(status.value)
                    ? status.color + ' text-white'
                    : 'bg-bg-secondary text-text-secondary border border-border-color hover:border-accent-primary'
                ]"
              >
                {{ status.label }}
              </button>
            </div>
          </div>

          <!-- Genre Filter -->
          <div>
            <label class="block text-sm font-semibold text-text-primary mb-2">Genre</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="genre in genreOptions"
                :key="genre"
                @click="toggleFilter('genres', genre)"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  filters.genres.includes(genre)
                    ? 'bg-accent-primary text-white'
                    : 'bg-bg-secondary text-text-secondary border border-border-color hover:border-accent-primary'
                ]"
              >
                {{ genre }}
              </button>
            </div>
          </div>

          <!-- Rating Filter -->
          <div>
            <label class="block text-sm font-semibold text-text-primary mb-2">Rating Minimum: {{ filters.minRating }}</label>
            <input
              v-model.number="filters.minRating"
              type="range"
              min="0"
              max="10"
              step="0.5"
              class="w-full h-2 bg-bg-secondary rounded-lg appearance-none cursor-pointer accent-accent-primary"
            />
            <div class="flex justify-between text-xs text-text-muted mt-1">
              <span>0</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>

          <!-- Sort By -->
          <div>
            <label class="block text-sm font-semibold text-text-primary mb-2">Urutkan</label>
            <select
              v-model="sortBy"
              class="w-full px-4 py-3 bg-bg-secondary border border-border-color rounded-xl text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
            >
              <option value="rating-desc">Rating Tertinggi</option>
              <option value="rating-asc">Rating Terendah</option>
              <option value="title-asc">Judul A-Z</option>
              <option value="title-desc">Judul Z-A</option>
              <option value="latest">Update Terbaru</option>
            </select>
          </div>

          <!-- Reset Button -->
          <button
            @click="resetFilters"
            class="w-full px-5 py-3 bg-bg-secondary border border-border-color rounded-xl text-text-secondary font-medium hover:border-accent-primary hover:text-accent-primary transition-all"
          >
            Reset Filter
          </button>
        </div>
      </div>
    </section>
    
    <!-- Search Results -->
    <section class="py-12">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-3xl font-bold text-text-primary">
            Hasil Pencarian
            <span class="text-lg font-normal text-text-secondary ml-2">({{ filteredManhwa.length }} manhwa)</span>
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
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <h3 class="text-2xl font-semibold text-text-primary mb-2">Tidak Ada Hasil</h3>
          <p class="text-text-secondary">Coba ubah filter atau kata kunci pencarian</p>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import ManhwaCard from '../components/manhwa/ManhwaCard.vue'
import { ManhwaService } from '../services/manhwaService'
import type { ManhwaCardData } from '../types/manhwa'

const router = useRouter()
const manhwaList = ref<ManhwaCardData[]>([])
const loading = ref(true)
const searchQuery = ref('')
const sortBy = ref('rating-desc')
const currentPage = ref(1)
const itemsPerPage = 24

// Filter state
const filters = ref({
  type: [] as string[],
  status: [] as string[],
  genres: [] as string[],
  minRating: 0
})

// Filter options
const typeOptions = [
  { value: 'manhwa', label: 'Manhwa' },
  { value: 'manhua', label: 'Manhua' },
  { value: 'manga', label: 'Manga' }
]

const statusOptions = [
  { value: 'ongoing', label: 'Ongoing', color: 'bg-green-500' },
  { value: 'completed', label: 'Completed', color: 'bg-blue-600' },
  { value: 'hiatus', label: 'Hiatus', color: 'bg-orange-400' }
]

const genreOptions = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
  'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life',
  'Sports', 'Supernatural', 'Thriller', 'Tragedy', 'Martial Arts',
  'School Life', 'Historical', 'Psychological', 'Seinen', 'Shounen'
]

// Toggle filter
const toggleFilter = (filterType: keyof typeof filters.value, value: string) => {
  const filterArray = filters.value[filterType] as string[]
  const index = filterArray.indexOf(value)
  if (index > -1) {
    filterArray.splice(index, 1)
  } else {
    filterArray.push(value)
  }
  currentPage.value = 1 // Reset to first page
}

// Reset all filters
const resetFilters = () => {
  filters.value = {
    type: [],
    status: [],
    genres: [],
    minRating: 0
  }
  searchQuery.value = ''
  sortBy.value = 'rating-desc'
  currentPage.value = 1
}

// Filter and search manhwa
const filteredManhwa = computed(() => {
  let result = [...manhwaList.value]

  // Search by title
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(m => m.title.toLowerCase().includes(query))
  }

  // Filter by type
  if (filters.value.type.length > 0) {
    result = result.filter(m => {
      const type = (m.type || '').toLowerCase()
      return filters.value.type.some(t => type.includes(t.toLowerCase()))
    })
  }

  // Filter by status
  if (filters.value.status.length > 0) {
    result = result.filter(m => {
      const status = (m.status || '').toLowerCase()
      return filters.value.status.some(s => status.includes(s.toLowerCase()))
    })
  }

  // Filter by genres
  if (filters.value.genres.length > 0) {
    result = result.filter(m => {
      if (!m.genre) return false
      const manhwaGenres = Array.isArray(m.genre) ? m.genre : [m.genre]
      return filters.value.genres.some(g => 
        manhwaGenres.some(mg => mg.toLowerCase().includes(g.toLowerCase()))
      )
    })
  }

  // Filter by minimum rating
  if (filters.value.minRating > 0) {
    result = result.filter(m => {
      const rating = typeof m.rating === 'string' ? parseFloat(m.rating) : (m.rating || 0)
      return rating >= filters.value.minRating
    })
  }

  // Sort
  switch (sortBy.value) {
    case 'rating-desc':
      result.sort((a, b) => {
        const ratingA = typeof a.rating === 'string' ? parseFloat(a.rating) : (a.rating || 0)
        const ratingB = typeof b.rating === 'string' ? parseFloat(b.rating) : (b.rating || 0)
        return ratingB - ratingA
      })
      break
    case 'rating-asc':
      result.sort((a, b) => {
        const ratingA = typeof a.rating === 'string' ? parseFloat(a.rating) : (a.rating || 0)
        const ratingB = typeof b.rating === 'string' ? parseFloat(b.rating) : (b.rating || 0)
        return ratingA - ratingB
      })
      break
    case 'title-asc':
      result.sort((a, b) => a.title.localeCompare(b.title))
      break
    case 'title-desc':
      result.sort((a, b) => b.title.localeCompare(a.title))
      break
    case 'latest':
      result.sort((a, b) => {
        const timeA = parseUpdateTime(a.lastUpdate || '')
        const timeB = parseUpdateTime(b.lastUpdate || '')
        return timeA - timeB
      })
      break
  }

  return result
})

const totalPages = computed(() => Math.ceil(filteredManhwa.value.length / itemsPerPage))

const displayedManhwa = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredManhwa.value.slice(start, end)
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


onMounted(async () => {
  loading.value = true
  try {
    console.log('🔍 Loading all manhwa for advanced search...')
    // Load all manhwa for search
    manhwaList.value = await ManhwaService.getManhwaCards()
    console.log(`✅ Loaded ${manhwaList.value.length} manhwa`)
  } catch (error) {
    console.error('❌ Error loading manhwa:', error)
  } finally {
    loading.value = false
  }
})

// Reset to page 1 when filters change
watch([searchQuery, () => filters.value, sortBy], () => {
  currentPage.value = 1
}, { deep: true })

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
