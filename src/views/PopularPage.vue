<template>
  <div class="popular-page">
    <!-- Page Header -->
    <section class="page-hero">
      <div class="container">
        <div class="hero-content">
          <div class="hero-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div>
            <h1 class="hero-title">Manhwa Populer</h1>
            <p class="hero-description">Manhwa paling populer dan paling banyak dibaca</p>
          </div>
        </div>
        
        <!-- Filter Options -->
        <div class="filter-options">
          <button 
            v-for="option in filterOptions" 
            :key="option.value"
            :class="['filter-btn', { active: filterBy === option.value }]"
            @click="filterBy = option.value"
          >
            <component :is="option.icon" />
            <span>{{ option.label }}</span>
          </button>
        </div>
      </div>
    </section>
    
    <!-- Popular Content -->
    <section class="popular-content">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">
            {{ filterTitle }}
          </h2>
          <div class="page-info">
            Halaman {{ currentPage }} dari {{ totalPages }}
          </div>
        </div>
        
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Memuat manhwa populer...</p>
        </div>
        
        <div v-else-if="displayedManhwa.length === 0" class="empty-state">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <h3>Belum Ada Data</h3>
          <p>Belum ada manhwa populer saat ini</p>
        </div>
        
        <div v-else>
          <div class="manhwa-grid">
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
          <div v-if="totalPages > 1" class="pagination">
            <button 
              class="page-btn" 
              :disabled="currentPage === 1"
              @click="changePage(currentPage - 1)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Sebelumnya
            </button>
            
            <div class="page-numbers">
              <button
                v-for="page in visiblePages"
                :key="page"
                :class="['page-number', { active: page === currentPage }]"
                @click="changePage(page)"
              >
                {{ page }}
              </button>
            </div>
            
            <button 
              class="page-btn" 
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

<style scoped>
.popular-page {
  min-height: 100vh;
  padding-top: 70px;
}

/* Page Hero */
.page-hero {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(167, 139, 250, 0.05) 100%);
  border-bottom: 1px solid var(--border-color);
  padding: 3rem 0 2rem;
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.hero-icon {
  width: 80px;
  height: 80px;
  border-radius: 1rem;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: var(--shadow-lg), var(--glow-accent);
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.hero-description {
  font-size: 1.125rem;
  color: var(--text-secondary);
}

/* Filter Options */
.filter-options {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.filter-btn:hover {
  border-color: var(--accent-primary);
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.filter-btn.active {
  border-color: var(--accent-primary);
  background: rgba(139, 92, 246, 0.1);
  color: var(--accent-primary);
}

/* Popular Content */
.popular-content {
  padding: 3rem 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
}

.page-info {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.manhwa-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 3rem;
}

.page-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.page-btn:hover:not(:disabled) {
  border-color: var(--accent-primary);
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-number {
  width: 40px;
  height: 40px;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.page-number:hover {
  border-color: var(--accent-primary);
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.page-number.active {
  border-color: var(--accent-primary);
  background: var(--accent-primary);
  color: white;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-color);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: var(--text-secondary);
  font-size: 1rem;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
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
  color: var(--text-secondary);
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-icon {
    width: 60px;
    height: 60px;
  }
  
  .hero-icon svg {
    width: 32px;
    height: 32px;
  }
  
  .manhwa-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
  
  .filter-options {
    gap: 0.5rem;
  }
  
  .filter-btn {
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
  }
  
  .pagination {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .page-btn {
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
  }
}
</style>
