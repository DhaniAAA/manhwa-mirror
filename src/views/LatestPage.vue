<template>
  <div class="latest-page">
    <!-- Page Header -->
    <section class="page-hero">
      <div class="container">
        <div class="hero-content">
          <div class="hero-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <div>
            <h1 class="hero-title">Rilis Terbaru</h1>
            <p class="hero-description">Chapter dan manhwa terbaru yang baru saja dirilis</p>
          </div>
        </div>
        
        <!-- Sort Options -->
        <div class="sort-options">
          <button 
            v-for="option in sortOptions" 
            :key="option.value"
            :class="['sort-btn', { active: sortBy === option.value }]"
            @click="sortBy = option.value"
          >
            <component :is="option.icon" />
            <span>{{ option.label }}</span>
          </button>
        </div>
      </div>
    </section>
    
    <!-- Latest Content -->
    <section class="latest-content">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">
            {{ sortBy === 'chapter' ? 'Chapter Terbaru' : 'Manhwa Terbaru' }}
          </h2>
          <div class="page-info">
            Halaman {{ currentPage }} dari {{ totalPages }}
          </div>
        </div>
        
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Memuat data terbaru...</p>
        </div>
        
        <div v-else-if="displayedManhwa.length === 0" class="empty-state">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          <h3>Belum Ada Data</h3>
          <p>Belum ada manhwa atau chapter terbaru saat ini</p>
        </div>
        
        <div v-else>
          <div class="manhwa-grid">
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
.latest-page {
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

/* Sort Options */
.sort-options {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.sort-btn {
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

.sort-btn:hover {
  border-color: var(--accent-primary);
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.sort-btn.active {
  border-color: var(--accent-primary);
  background: rgba(139, 92, 246, 0.1);
  color: var(--accent-primary);
}

/* Latest Content */
.latest-content {
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
  
  .sort-options {
    gap: 0.5rem;
  }
  
  .sort-btn {
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
