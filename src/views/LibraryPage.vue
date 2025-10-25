<template>
  <div class="library-page">
    <!-- Page Header -->
    <section class="page-hero">
      <div class="container">
        <div class="hero-content">
          <div class="hero-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <div>
            <h1 class="hero-title">Perpustakaan Saya</h1>
            <p class="hero-description">Koleksi manhwa yang Anda simpan dan sedang dibaca</p>
          </div>
        </div>
        
        <!-- Filter Tabs -->
        <div class="filter-tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab.value"
            :class="['tab-btn', { active: activeTab === tab.value }]"
            @click="activeTab = tab.value"
          >
            <component :is="tab.icon" />
            <span>{{ tab.label }}</span>
            <span class="tab-count">{{ tab.count }}</span>
          </button>
        </div>
      </div>
    </section>
    
    <!-- Library Content -->
    <section class="library-content">
      <div class="container">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Memuat perpustakaan...</p>
        </div>
        
        <div v-else-if="filteredManhwa.length === 0" class="empty-state">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <h3>Perpustakaan Kosong</h3>
          <p>Mulai tambahkan manhwa favorit Anda ke perpustakaan</p>
          <router-link to="/" class="btn-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            Jelajahi Manhwa
          </router-link>
        </div>
        
        <div v-else class="manhwa-grid">
          <ManhwaCard
            v-for="manhwa in filteredManhwa"
            :key="manhwa.slug"
            :slug="manhwa.slug"
            :title="manhwa.title"
            :coverImage="manhwa.cover_url || manhwa.coverImage"
            :type="manhwa.type"
            :status="manhwa.status"
            :rating="manhwa.rating"
            :chapters="manhwa.chapters || manhwa.total_chapters"
            :genre="manhwa.genre"
            :badge="manhwa.badge"
            :progress="manhwa.progress"
            :latestChapters="manhwa.latestChapters"
            @click="goToDetail"
            @chapterClick="goToChapter"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import ManhwaCard from '../components/ManhwaCard.vue'
import { useManhwa } from '../composables/useManhwa'

const router = useRouter()
const { manhwaList, loadContinueReading } = useManhwa()
const loading = ref(true)
const activeTab = ref('all')

// Tab configuration with icons as render functions
const tabs = computed(() => [
  {
    value: 'all',
    label: 'Semua',
    count: manhwaList.value.length,
    icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { d: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z' })
    ])
  },
  {
    value: 'reading',
    label: 'Sedang Dibaca',
    count: manhwaList.value.filter(m => m.progress && m.progress > 0).length,
    icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { d: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z' }),
      h('path', { d: 'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' })
    ])
  },
  {
    value: 'completed',
    label: 'Selesai',
    count: manhwaList.value.filter(m => m.progress === 100).length,
    icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('polyline', { points: '20 6 9 17 4 12' })
    ])
  },
  {
    value: 'bookmark',
    label: 'Bookmark',
    count: manhwaList.value.filter(m => m.badge === 'Bookmark').length,
    icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { d: 'm19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z' })
    ])
  }
])

const filteredManhwa = computed(() => {
  if (activeTab.value === 'all') return manhwaList.value
  if (activeTab.value === 'reading') return manhwaList.value.filter(m => m.progress && m.progress > 0 && m.progress < 100)
  if (activeTab.value === 'completed') return manhwaList.value.filter(m => m.progress === 100)
  if (activeTab.value === 'bookmark') return manhwaList.value.filter(m => m.badge === 'Bookmark')
  return manhwaList.value
})

onMounted(async () => {
  loading.value = true
  try {
    await loadContinueReading(12)
  } catch (error) {
    console.error('Error loading library:', error)
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
.library-page {
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

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.tab-btn {
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

.tab-btn:hover {
  border-color: var(--accent-primary);
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.tab-btn.active {
  border-color: var(--accent-primary);
  background: rgba(139, 92, 246, 0.1);
  color: var(--accent-primary);
}

.tab-count {
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  background: var(--bg-tertiary);
  font-size: 0.875rem;
  font-weight: 600;
}

.tab-btn.active .tab-count {
  background: var(--accent-primary);
  color: white;
}

/* Library Content */
.library-content {
  padding: 3rem 0;
}

.manhwa-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
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
  margin-bottom: 2rem;
  max-width: 400px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  font-weight: 600;
  text-decoration: none;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-md), var(--glow-accent);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg), var(--glow-accent-strong);
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
  
  .filter-tabs {
    gap: 0.5rem;
  }
  
  .tab-btn {
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
  }
}
</style>
