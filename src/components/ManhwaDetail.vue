<template>
  <div 
    class="fixed inset-0 z-[200] bg-bg-primary overflow-y-auto transition-all duration-300"
    :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'"
  >
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-bg-primary/95 backdrop-blur-xl border-b border-border-color">
      <div class="absolute inset-0 bg-gradient-to-b from-accent-primary/10 to-transparent opacity-50"></div>
      <div class="container mx-auto px-4">
        <div class="relative h-[70px] flex items-center">
          <button 
            class="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-bg-tertiary text-text-primary text-sm font-medium transition-all duration-200 hover:bg-bg-elevated hover:-translate-x-1"
            @click="$emit('close')"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            <span>Kembali</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="py-12">
      <div class="container mx-auto px-4">
        <!-- Hero Section -->
        <div class="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12 mb-16">
          <!-- Cover -->
          <div class="relative max-w-[300px] mx-auto lg:mx-0">
            <div class="aspect-[3/4] bg-bg-secondary rounded-2xl border border-border-color overflow-hidden shadow-xl">
              <img 
                v-if="coverUrl" 
                :src="coverUrl" 
                :alt="title"
                class="w-full h-full object-cover object-center"
                @error="handleImageError"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-text-muted bg-gradient-to-br from-bg-tertiary to-bg-elevated">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
              </div>
            </div>
            
            <!-- Bookmark Button -->
            <button 
              class="flex items-center justify-center gap-2 w-full mt-4 px-3.5 py-3.5 rounded-xl border font-medium transition-all duration-300"
              :class="isBookmarked 
                ? 'bg-accent-primary border-accent-primary text-white' 
                : 'bg-bg-secondary border-border-color text-text-primary hover:bg-bg-tertiary hover:border-accent-primary'"
              @click="toggleBookmark"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              <span>{{ isBookmarked ? 'Tersimpan' : 'Simpan' }}</span>
            </button>
          </div>

          <!-- Info -->
          <div>
            <!-- Badges -->
            <div class="flex flex-wrap gap-2 mb-4">
              <span 
                v-if="type" 
                class="px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider border"
                :class="{
                  'bg-purple-500/10 text-purple-500 border-purple-500/20': type.toLowerCase() === 'manhwa',
                  'bg-red-500/10 text-red-500 border-red-500/20': type.toLowerCase() === 'manhua',
                  'bg-blue-500/10 text-blue-500 border-blue-500/20': type.toLowerCase() === 'manga'
                }"
              >
                {{ type.toUpperCase() }}
              </span>
              <span 
                v-if="status" 
                class="px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider border"
                :class="{
                  'bg-green-500/10 text-green-500 border-green-500/20': status.toLowerCase() === 'ongoing',
                  'bg-purple-500/10 text-purple-500 border-purple-500/20': status.toLowerCase() === 'complete',
                  'bg-orange-500/10 text-orange-500 border-orange-500/20': status.toLowerCase() === 'hiatus'
                }"
              >
                {{ status }}
              </span>
            </div>
            
            <!-- Title -->
            <h1 class="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">{{ title }}</h1>
            
            <!-- Meta Stats -->
            <div class="flex flex-wrap items-center gap-6 p-6 bg-bg-secondary rounded-2xl border border-border-color mb-8">
              <div class="flex flex-col items-center gap-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" class="text-accent-primary">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <span class="text-2xl font-bold text-text-primary">{{ averageRatingDisplay }}</span>
                <span class="text-xs text-text-muted uppercase tracking-wider">Rating Komunitas</span>
                <span class="text-[0.7rem] text-text-muted">{{ communityReviewCount }} ulasan</span>
              </div>
              
              <div class="w-px h-10 bg-divider hidden md:block"></div>
              
              <div class="flex flex-col items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-accent-primary">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
                <span class="text-2xl font-bold text-text-primary">{{ totalChapters }}</span>
                <span class="text-xs text-text-muted uppercase tracking-wider">Chapters</span>
              </div>
              
              <div class="w-px h-10 bg-divider hidden md:block"></div>
              
              <div class="flex flex-col items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-accent-primary">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <span class="text-2xl font-bold text-text-primary">{{ viewCountDisplay }}</span>
                <span class="text-xs text-text-muted uppercase tracking-wider">Views</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col md:flex-row gap-4 mb-8">
              <button 
                class="flex items-center justify-center gap-2 flex-1 px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-br from-accent-primary to-accent-secondary shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                @click="startReading"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                <span>Mulai Membaca</span>
              </button>
              
              <button 
                v-if="lastReadChapter"
                class="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold bg-bg-secondary text-text-primary border border-border-color transition-all duration-300 hover:bg-bg-tertiary hover:border-accent-primary"
                @click="continueReading"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
                <span>Lanjutkan Chapter {{ lastReadChapter }}</span>
              </button>
            </div>

            <!-- Description -->
            <div class="mb-8">
              <h3 class="text-xl font-semibold mb-4">Sinopsis</h3>
              <p class="text-text-secondary leading-relaxed">
                {{ description || 'Deskripsi manhwa akan ditampilkan di sini. Cerita menarik tentang petualangan, aksi, dan drama yang mendebarkan.' }}
              </p>
            </div>

            <!-- Info Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-bg-secondary rounded-2xl border border-border-color">
              <div v-if="genres && genres.length > 0" class="flex flex-col gap-2">
                <span class="text-sm text-text-muted font-medium">Genre</span>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="tag in genres" 
                    :key="tag"
                    class="px-3 py-1.5 bg-bg-tertiary rounded-lg text-sm text-text-secondary border border-border-color"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
              
              <div v-if="author" class="flex flex-col gap-2">
                <span class="text-sm text-text-muted font-medium">Author</span>
                <span class="text-text-primary font-medium">{{ author }}</span>
              </div>
              
              <div v-if="artist" class="flex flex-col gap-2">
                <span class="text-sm text-text-muted font-medium">Artist</span>
                <span class="text-text-primary font-medium">{{ artist }}</span>
              </div>
              
              <div v-if="status" class="flex flex-col gap-2">
                <span class="text-sm text-text-muted font-medium">Status</span>
                <span 
                  class="font-semibold"
                  :class="status === 'Ongoing' ? 'text-green-500' : 'text-blue-500'"
                >
                  {{ status }}
                </span>
              </div>
              
              <div v-if="type" class="flex flex-col gap-2">
                <span class="text-sm text-text-muted font-medium">Type</span>
                <span class="text-text-primary font-medium">{{ type }}</span>
              </div>
              
              <div v-if="releaseYear" class="flex flex-col gap-2">
                <span class="text-sm text-text-muted font-medium">Released</span>
                <span class="text-text-primary font-medium">{{ releaseYear }}</span>
              </div>
              
              <div v-if="lastUpdate" class="flex flex-col gap-2">
                <span class="text-sm text-text-muted font-medium">Updated On</span>
                <span class="text-text-primary font-medium">{{ lastUpdate }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Chapter Section -->
        <div class="mt-16">
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <h2 class="text-2xl md:text-3xl font-bold">Daftar Chapter</h2>
            
            <div class="flex flex-wrap gap-2 w-full md:w-auto">
              <select 
                v-if="sortedChapters.length > 0"
                class="flex-1 md:flex-none px-4 py-2.5 border border-border-color rounded-lg bg-bg-secondary text-text-primary text-sm font-medium min-w-[200px] transition-all duration-200 hover:bg-bg-tertiary hover:border-accent-primary focus:outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10"
                @change="jumpToChapter"
                v-model="selectedChapter"
              >
                <option value="">Pilih Chapter</option>
                <option 
                  v-for="chapter in sortedChapters" 
                  :key="chapter.slug"
                  :value="chapter.slug"
                >
                  {{ chapter.title }}
                </option>
              </select>
              
              <button 
                class="flex items-center gap-2 px-4 py-2.5 border border-border-color rounded-lg bg-bg-secondary text-text-primary text-sm font-medium transition-all duration-200 hover:bg-bg-tertiary hover:border-accent-primary"
                @click="toggleSort"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="4" y1="6" x2="20" y2="6"/>
                  <line x1="4" y1="12" x2="20" y2="12"/>
                  <line x1="4" y1="18" x2="14" y2="18"/>
                </svg>
                <span>{{ sortAscending ? 'Terlama' : 'Terbaru' }}</span>
              </button>
            </div>
          </div>

          <!-- Chapter List -->
          <div v-if="!loadingChapters && sortedChapters.length > 0">
            <!-- Mobile: 2 columns, compact layout -->
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
              <div 
                v-for="chapter in paginatedChapters" 
                :key="chapter.slug"
                class="flex flex-col p-3 md:p-4 bg-bg-secondary border border-border-color rounded-lg cursor-pointer transition-all duration-200 hover:bg-bg-tertiary hover:border-accent-primary hover:scale-105 group"
                @click="readChapter(chapter)"
              >
                <h4 class="font-semibold text-text-primary text-sm md:text-base mb-1 line-clamp-2 group-hover:text-accent-primary transition-colors">{{ chapter.title }}</h4>
                <span class="text-xs text-text-muted mt-auto">{{ chapter.waktu_rilis || 'Baru' }}</span>
              </div>
            </div>

            <!-- Pagination Controls -->
            <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-6">
              <button 
                @click="currentPage--"
                :disabled="currentPage === 1"
                class="px-4 py-2 rounded-lg bg-bg-secondary border border-border-color text-text-primary text-sm font-medium transition-all duration-200 hover:bg-bg-tertiary hover:border-accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>

              <div class="flex items-center gap-1">
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="currentPage = page"
                  class="w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200"
                  :class="{
                    'bg-accent-primary text-white': currentPage === page,
                    'bg-bg-secondary border border-border-color text-text-primary hover:bg-bg-tertiary hover:border-accent-primary': currentPage !== page
                  }"
                >
                  {{ page }}
                </button>
              </div>

              <button 
                @click="currentPage++"
                :disabled="currentPage === totalPages"
                class="px-4 py-2 rounded-lg bg-bg-secondary border border-border-color text-text-primary text-sm font-medium transition-all duration-200 hover:bg-bg-tertiary hover:border-accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>

            <!-- Page Info -->
            <div class="text-center text-sm text-text-muted mt-4">
              Showing {{ startIndex + 1 }}-{{ Math.min(endIndex, sortedChapters.length) }} of {{ sortedChapters.length }} chapters
            </div>
          </div>

          <!-- Loading State -->
          <div v-else-if="loadingChapters" class="flex flex-col items-center justify-center py-16 text-text-muted">
            <div class="w-12 h-12 border-4 border-bg-tertiary border-t-accent-primary rounded-full animate-spin mb-4"></div>
            <p>Memuat chapters...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="!loadingChapters && chapters?.length === 0" class="flex flex-col items-center justify-center py-16 text-text-muted">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mb-4 opacity-50">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <p>Belum ada chapter tersedia</p>
          </div>
        </div>

        <!-- Rating & Reviews -->
        <div class="mt-16">
          <RatingWidget
            :manhwa-slug="slug"
            @login-required="handleAuthRequest"
          />
        </div>

        <!-- Comments -->
        <div class="mt-16">
          <CommentSection
            :manhwa-slug="slug"
            @login-required="handleAuthRequest"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Chapter } from '../types/manhwa'
import RatingWidget from './RatingWidget.vue'
import CommentSection from './CommentSection.vue'
import { CommunityService } from '../services/communityService'

const props = defineProps<{
  slug: string
  title: string
  rating?: string
  totalChapters: number
  description?: string
  author?: string
  artist?: string
  genres?: string[]
  status?: string
  type?: string
  releaseYear?: string
  lastUpdate?: string
  views?: string
  chapters?: Chapter[]
  coverUrl?: string
}>()

const emit = defineEmits<{
  close: []
  readChapter: [chapter: Chapter]
  authRequest: []
}>()

const isVisible = ref(false)
const isBookmarked = ref(false)
const loadingChapters = ref(false)
const sortAscending = ref(false)
const lastReadChapter = ref<number | null>(null)
const selectedChapter = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(20) // Show 20 chapters per page
const communityAverage = ref(4.5) // Default 4.5 if no ratings
const communityReviewCount = ref(0)
const viewCount = ref(1000) // Default 1000 views

// Computed
const averageRatingDisplay = computed(() => {
  return communityAverage.value.toFixed(1)
})

const viewCountDisplay = computed(() => {
  const count = viewCount.value
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M'
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K'
  }
  return count.toString()
})

const sortedChapters = computed(() => {
  if (!props.chapters) return []
  const sorted = [...props.chapters]
  return sortAscending.value ? sorted : sorted.reverse()
})

const totalPages = computed(() => {
  return Math.ceil(sortedChapters.value.length / itemsPerPage.value)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage.value
})

const endIndex = computed(() => {
  return startIndex.value + itemsPerPage.value
})

const paginatedChapters = computed(() => {
  return sortedChapters.value.slice(startIndex.value, endIndex.value)
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

// Methods
const toggleBookmark = () => {
  isBookmarked.value = !isBookmarked.value
}

const toggleSort = () => {
  sortAscending.value = !sortAscending.value
  currentPage.value = 1 // Reset to first page when sorting
}

const startReading = () => {
  const firstChapter = props.chapters?.[0]
  if (firstChapter) {
    readChapter(firstChapter)
  }
}

const continueReading = () => {
  if (props.chapters && lastReadChapter.value) {
    const chapter = props.chapters[lastReadChapter.value - 1]
    if (chapter) readChapter(chapter)
  }
}

const readChapter = (chapter: Chapter) => {
  emit('readChapter', chapter)
}

const jumpToChapter = () => {
  if (selectedChapter.value && props.chapters) {
    const chapter = props.chapters.find(ch => ch.slug === selectedChapter.value)
    if (chapter) {
      readChapter(chapter)
      selectedChapter.value = '' // Reset selection
    }
  }
}

const handleImageError = (event: Event) => {
  console.warn('Failed to load cover image, using placeholder')
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

const loadManhwaStats = async () => {
  try {
    const stats = await CommunityService.getManhwaStats(props.slug)
    if (stats.rating_count > 0) {
      communityAverage.value = stats.average_rating
      communityReviewCount.value = stats.rating_count
    }
  } catch (error) {
    console.error('Error loading manhwa stats:', error)
  }
}

const incrementViewCount = () => {
  // Get view count from localStorage
  const viewsKey = `manhwa-views-${props.slug}`
  const storedViews = localStorage.getItem(viewsKey)
  
  if (storedViews) {
    viewCount.value = parseInt(storedViews)
  }
  
  // Increment view count
  viewCount.value++
  localStorage.setItem(viewsKey, viewCount.value.toString())
}

const handleAuthRequest = () => {
  emit('authRequest')
}

// Lifecycle
onMounted(async () => {
  setTimeout(() => {
    isVisible.value = true
  }, 50)
  
  // Check localStorage for bookmark status
  const bookmarks = localStorage.getItem('manhwa-bookmarks')
  if (bookmarks) {
    const bookmarkList = JSON.parse(bookmarks)
    isBookmarked.value = bookmarkList.includes(props.slug)
  }
  
  // Check last read chapter
  const lastRead = localStorage.getItem(`last-read-${props.slug}`)
  if (lastRead) {
    lastReadChapter.value = parseInt(lastRead)
  }
  
  // Load community stats (rating)
  await loadManhwaStats()
  
  // Increment view count
  incrementViewCount()
})

// Watch bookmark changes
watch(isBookmarked, (newVal) => {
  const bookmarks = localStorage.getItem('manhwa-bookmarks')
  let bookmarkList = bookmarks ? JSON.parse(bookmarks) : []
  
  if (newVal) {
    if (!bookmarkList.includes(props.slug)) {
      bookmarkList.push(props.slug)
    }
  } else {
    bookmarkList = bookmarkList.filter((s: string) => s !== props.slug)
  }
  
  localStorage.setItem('manhwa-bookmarks', JSON.stringify(bookmarkList))
})
</script>

<style scoped>
/* Animations that can't be done with Tailwind */
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Custom scrollbar for chapter list on mobile */
@media (max-width: 768px) {
  .chapter-list::-webkit-scrollbar {
    width: 6px;
  }
  
  .chapter-list::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 3px;
  }
  
  .chapter-list::-webkit-scrollbar-thumb {
    background: var(--accent-primary);
    border-radius: 3px;
  }
  
  .chapter-list::-webkit-scrollbar-thumb:hover {
    background: var(--accent-secondary);
  }
}
</style>
