<template>
  <section class="manhwa-grid-section">
    <div class="container">
      <!-- Header -->
      <div class="section-header">
        <h2 class="section-title">Semua Manhwa</h2>
        <p class="section-subtitle">{{ totalManhwa }} judul tersedia</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Memuat manhwa...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p>{{ error }}</p>
      </div>

      <!-- Manhwa Grid -->
      <div v-else class="manhwa-grid">
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
        />
      </div>

      <!-- Pagination -->
      <div v-if="!loading && !error && totalPages > 1" class="pagination">
        <button 
          class="pagination-btn"
          :disabled="currentPage === 1"
          @click="goToPage(1)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="11 17 6 12 11 7"/>
            <polyline points="18 17 13 12 18 7"/>
          </svg>
        </button>

        <button 
          class="pagination-btn"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <div class="pagination-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            class="pagination-number"
            :class="{ active: page === currentPage }"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </div>

        <button 
          class="pagination-btn"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        <button 
          class="pagination-btn"
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
      <div v-if="!loading && !error" class="page-info">
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
    const cards = await ManhwaService.getManhwaCards()
    allManhwa.value = cards
    console.log(`✅ Loaded ${cards.length} manhwa`)
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
</script>

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
}

.pagination-btn {
  width: 40px;
  height: 40px;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.pagination-btn:hover:not(:disabled) {
  background: var(--bg-tertiary);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.pagination-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  gap: 0.5rem;
}

.pagination-number {
  min-width: 40px;
  height: 40px;
  padding: 0 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition-fast);
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
  font-weight: 600;
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
    flex-wrap: wrap;
  }

  .pagination-btn,
  .pagination-number {
    width: 36px;
    height: 36px;
    min-width: 36px;
  }
}

@media (max-width: 480px) {
  .manhwa-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
