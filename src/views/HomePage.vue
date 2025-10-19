<template>
  <div class="home-page">
    <HeroSection />
    
    <!-- Latest Updates Section -->
    <section class="manhwa-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Update Terbaru</h2>
          <div class="page-info">
            Halaman {{ latestPage }} dari {{ latestTotalPages }}
          </div>
        </div>
        
        <div v-if="loadingLatest" class="loading-state">
          <div class="spinner"></div>
          <p>Memuat manhwa...</p>
        </div>
        
        <div v-else>
          <div class="manhwa-grid">
            <ManhwaCard
              v-for="manhwa in displayedLatest"
              :key="manhwa.slug"
              :slug="manhwa.slug"
              :title="manhwa.title"
              :coverImage="manhwa.cover_url"
              :rating="manhwa.rating"
              :chapters="manhwa.total_chapters"
              :genre="manhwa.genres?.join(', ')"
              :badge="manhwa.status"
              @click="goToDetail"
            />
          </div>
          
          <!-- Pagination for Latest -->
          <div v-if="latestTotalPages > 1" class="pagination">
            <button 
              class="pagination-btn"
              :disabled="latestPage === 1"
              @click="goToLatestPage(1)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="11 17 6 12 11 7"/>
                <polyline points="18 17 13 12 18 7"/>
              </svg>
            </button>
            
            <button 
              class="pagination-btn"
              :disabled="latestPage === 1"
              @click="goToLatestPage(latestPage - 1)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            
            <div class="pagination-numbers">
              <button
                v-for="page in latestTotalPages"
                :key="page"
                class="pagination-number"
                :class="{ active: page === latestPage }"
                @click="goToLatestPage(page)"
              >
                {{ page }}
              </button>
            </div>
            
            <button 
              class="pagination-btn"
              :disabled="latestPage === latestTotalPages"
              @click="goToLatestPage(latestPage + 1)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
            
            <button 
              class="pagination-btn"
              :disabled="latestPage === latestTotalPages"
              @click="goToLatestPage(latestTotalPages)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="13 17 18 12 13 7"/>
                <polyline points="6 17 11 12 6 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Popular Section -->
    <section class="manhwa-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Manhwa Populer</h2>
          <div class="page-info">
            Halaman {{ popularPage }} dari {{ popularTotalPages }}
          </div>
        </div>
        
        <div v-if="loadingPopular" class="loading-state">
          <div class="spinner"></div>
          <p>Memuat manhwa...</p>
        </div>
        
        <div v-else>
          <div class="manhwa-grid">
            <ManhwaCard
              v-for="manhwa in displayedPopular"
              :key="manhwa.slug"
              :slug="manhwa.slug"
              :title="manhwa.title"
              :coverImage="manhwa.cover_url"
              :rating="manhwa.rating"
              :chapters="manhwa.total_chapters"
              :genre="manhwa.genres?.join(', ')"
              :badge="manhwa.status"
              @click="goToDetail"
            />
          </div>
          
          <!-- Pagination for Popular -->
          <div v-if="popularTotalPages > 1" class="pagination">
            <button 
              class="pagination-btn"
              :disabled="popularPage === 1"
              @click="goToPopularPage(1)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="11 17 6 12 11 7"/>
                <polyline points="18 17 13 12 18 7"/>
              </svg>
            </button>
            
            <button 
              class="pagination-btn"
              :disabled="popularPage === 1"
              @click="goToPopularPage(popularPage - 1)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            
            <div class="pagination-numbers">
              <button
                v-for="page in popularTotalPages"
                :key="page"
                class="pagination-number"
                :class="{ active: page === popularPage }"
                @click="goToPopularPage(page)"
              >
                {{ page }}
              </button>
            </div>
            
            <button 
              class="pagination-btn"
              :disabled="popularPage === popularTotalPages"
              @click="goToPopularPage(popularPage + 1)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
            
            <button 
              class="pagination-btn"
              :disabled="popularPage === popularTotalPages"
              @click="goToPopularPage(popularTotalPages)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="13 17 18 12 13 7"/>
                <polyline points="6 17 11 12 6 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import HeroSection from '../components/HeroSection.vue'
import ManhwaCard from '../components/ManhwaCard.vue'
import { ManhwaService } from '../services/manhwaService'
import type { ManhwaCardData } from '../types/manhwa'

const router = useRouter()

const loadingLatest = ref(true)
const loadingPopular = ref(true)
const latestManhwa = ref<ManhwaCardData[]>([])
const popularManhwa = ref<ManhwaCardData[]>([])

// Pagination state
const latestPage = ref(1)
const popularPage = ref(1)
const itemsPerPage = 15

// Total pages
const latestTotalPages = computed(() => Math.ceil(latestManhwa.value.length / itemsPerPage))
const popularTotalPages = computed(() => Math.ceil(popularManhwa.value.length / itemsPerPage))

// Displayed items based on current page
const displayedLatest = computed(() => {
  const start = (latestPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return latestManhwa.value.slice(start, end)
})

const displayedPopular = computed(() => {
  const start = (popularPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return popularManhwa.value.slice(start, end)
})

const goToDetail = (slug: string) => {
  console.log(`🔗 Navigating to: ${slug}`)
  router.push({ name: 'detail', params: { slug } })
}

// Pagination functions for Latest
const goToLatestPage = (page: number) => {
  latestPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
  console.log(`📄 Latest page changed to: ${page}`)
}

// Pagination functions for Popular
const goToPopularPage = (page: number) => {
  popularPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
  console.log(`📄 Popular page changed to: ${page}`)
}

onMounted(async () => {
  try {
    console.log('🔄 Loading manhwa sections...')
    
    // Load all manhwa
    const allManhwa = await ManhwaService.getManhwaCards()
    
    // Latest: Sort by total_chapters (assuming more chapters = more updates)
    latestManhwa.value = [...allManhwa].sort((a, b) => (b.total_chapters || 0) - (a.total_chapters || 0))
    
    // Popular: Sort by rating or randomly for now
    popularManhwa.value = [...allManhwa].sort(() => Math.random() - 0.5)
    
    console.log(`✅ Loaded ${latestManhwa.value.length} manhwa`)
    console.log(`📊 Latest pages: ${latestTotalPages.value}, Popular pages: ${popularTotalPages.value}`)
  } catch (error) {
    console.error('❌ Error loading manhwa:', error)
  } finally {
    loadingLatest.value = false
    loadingPopular.value = false
  }
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
}

.manhwa-section {
  padding: 3rem 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.page-info {
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.manhwa-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
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

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.pagination-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: inherit;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--bg-tertiary);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  gap: 0.5rem;
  margin: 0 0.5rem;
}

.pagination-number {
  min-width: 40px;
  height: 40px;
  padding: 0 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: inherit;
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
}

/* Responsive */
@media (max-width: 1024px) {
  .manhwa-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1.25rem;
  }
  
  .section-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 768px) {
  .manhwa-section {
    padding: 2rem 0;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .page-info {
    width: 100%;
    text-align: center;
  }
  
  .manhwa-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
  }
  
  .pagination {
    flex-wrap: wrap;
    gap: 0.375rem;
  }
  
  .pagination-btn,
  .pagination-number {
    width: 36px;
    height: 36px;
    min-width: 36px;
  }
  
  .pagination-numbers {
    margin: 0 0.25rem;
  }
}

@media (max-width: 480px) {
  .manhwa-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
