<template>
  <div class="min-h-screen bg-[var(--bg-primary)] pt-[70px]">
    <!-- Page Header -->
    <section class="border-b border-[var(--border-color)] bg-gradient-to-br from-[rgba(139,92,246,0.1)] to-[rgba(167,139,250,0.05)] py-10 sm:py-12">
      <div class="container">
        <div class="mb-8 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white [box-shadow:var(--shadow-lg),var(--glow-accent)] sm:h-20 sm:w-20">
            <svg class="h-8 w-8 sm:h-12 sm:w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <div>
            <h1 class="text-3xl font-bold text-[var(--text-primary)] sm:text-4xl md:text-5xl">Perpustakaan Saya</h1>
            <p class="text-base text-[var(--text-secondary)] sm:text-lg">Koleksi manhwa yang Anda simpan dan sedang dibaca</p>
          </div>
        </div>
        
        <!-- Filter Tabs -->
        <div class="flex gap-2 overflow-x-auto pb-2 sm:gap-3">
          <button 
            v-for="tab in tabs" 
            :key="tab.value"
            :class="[
              'flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors duration-200 whitespace-nowrap hover:border-[var(--accent-primary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] sm:px-5 sm:py-3 sm:text-base',
              activeTab === tab.value && 'border-[var(--accent-primary)] bg-[rgba(139,92,246,0.1)] text-[var(--accent-primary)]'
            ]"
            @click="activeTab = tab.value"
          >
            <component :is="tab.icon" />
            <span>{{ tab.label }}</span>
            <span
              :class="[
                'rounded-md px-2 py-1 text-xs font-semibold transition-colors duration-200',
                activeTab === tab.value
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
              ]"
            >
              {{ tab.count }}
            </span>
          </button>
        </div>
      </div>
    </section>
    
    <!-- Library Content -->
    <section class="py-12">
      <div class="container">
        <div v-if="loading" class="flex flex-col items-center justify-center gap-4 px-8 py-16 text-center">
          <div class="h-12 w-12 animate-spin rounded-full border-4 border-[var(--border-color)] border-t-[var(--accent-primary)]"></div>
          <p class="text-base text-[var(--text-secondary)]">Memuat perpustakaan...</p>
        </div>
        
        <div v-else-if="filteredManhwa.length === 0" class="flex flex-col items-center justify-center px-8 py-16 text-center">
          <svg class="mb-6 h-20 w-20 text-[var(--text-muted)] opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <h3 class="mb-2 text-2xl font-semibold text-[var(--text-primary)]">Perpustakaan Kosong</h3>
          <p class="mb-8 max-w-md text-[var(--text-secondary)]">Mulai tambahkan manhwa favorit Anda ke perpustakaan</p>
          <router-link
            to="/"
            class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] px-6 py-3 font-semibold text-white shadow-[var(--shadow-md),var(--glow-accent)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg),var(--glow-accent-strong)]"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            Jelajahi Manhwa
          </router-link>
        </div>
        
        <div v-else class="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(150px,1fr))] sm:gap-6 sm:[grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
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
import ManhwaCard from '../components/manhwa/ManhwaCard.vue'
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
