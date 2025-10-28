<template>
<<<<<<< HEAD
  <section class="relative mt-[70px] py-12 overflow-hidden">
    <!-- Background -->
    <div class="absolute inset-0 z-0">
      <div class="absolute inset-0 bg-gradient-radial from-purple-500/15 via-transparent to-transparent animate-gradient-shift"></div>
      <div class="absolute inset-0 opacity-50 bg-grid-pattern"></div>
    </div>
    
    <div class="container relative z-10 px-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8 pb-6 border-b border-gray-800">
        <div class="flex items-center gap-4">
          <div class="text-4xl animate-fire-flicker">🔥</div>
          <div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Hot Komik Update
            </h1>
            <p class="text-sm text-gray-400 mt-1">Manhwa terbaru yang baru saja dirilis</p>
          </div>
        </div>
        <div class="hidden sm:block">
          <span class="flex items-center gap-2 px-5 py-2.5 bg-purple-500/10 border border-purple-500/30 rounded-full text-sm font-semibold text-purple-400">
=======
  <section class="relative mt-[70px] overflow-hidden py-12 md:py-16">
    <div class="absolute inset-0 z-0">
      <div class="absolute inset-0 animate-ambient bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.15)_0%,transparent_55%),radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1)_0%,transparent_60%)]"></div>
      <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:50px_50px] opacity-50"></div>
    </div>

    <div class="container relative z-10">
      <div class="flex flex-col gap-6 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
        <div class="flex items-center gap-4">
          <div class="text-4xl md:text-5xl animate-fire">🔥</div>
          <div>
            <h1 class="bg-gradient-to-br from-accent-primary to-accent-secondary bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl">
              Hot Komik Update
            </h1>
            <p class="mt-1 text-base text-text-secondary md:text-lg">
              Manhwa terbaru yang baru saja dirilis
            </p>
          </div>
        </div>
        <div>
          <span class="inline-flex items-center gap-2 rounded-full border border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.1)] px-5 py-2.5 text-sm font-semibold text-accent-primary">
>>>>>>> 55df43e16ee1a1ffed61a42e163f41533e501fb8
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Update Hari Ini
          </span>
        </div>
      </div>

<<<<<<< HEAD
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center min-h-[300px] text-gray-400 gap-4">
        <div class="w-12 h-12 border-4 border-gray-700 border-t-purple-500 rounded-full animate-spin"></div>
        <p>Memuat manhwa terbaru...</p>
      </div>

      <!-- Hot Updates Grid -->
      <div v-else class="relative overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-800">
        <div class="flex gap-6 py-2">
          <div 
            v-for="(item, index) in hotUpdates" 
            :key="item.slug"
            class="flex-none w-[200px] bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/30 animate-fade-in-scale"
            :style="{ animationDelay: `${index * 0.05}s` }"
            @click="goToDetail(item.slug)"
          >
            <!-- Image Container -->
            <div class="relative aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden group">
              <img 
                v-if="item.cover_url" 
                :src="item.cover_url" 
                :alt="item.title"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
=======
      <div v-if="loading" class="flex min-h-[300px] flex-col items-center justify-center gap-4 py-10 text-text-secondary">
        <div class="h-12 w-12 animate-spin rounded-full border-4 border-background-tertiary border-t-accent-primary"></div>
        <p>Memuat manhwa terbaru...</p>
      </div>

      <div v-else class="relative -mx-4 mt-8 overflow-x-auto px-4 pb-4">
        <div class="flex gap-6">
          <div
            v-for="(item, index) in hotUpdates"
            :key="item.slug"
            class="group w-[200px] flex-shrink-0 rounded-2xl border border-border bg-background-secondary transition duration-300 ease-standard hover:-translate-y-2 hover:border-accent-primary hover:shadow-[0_12px_24px_rgba(0,0,0,0.4)] hover:shadow-ambient animate-fade-scale"
            :style="{ animationDelay: `${index * 0.05}s` }"
            @click="goToDetail(item.slug)"
          >
            <div class="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-background-tertiary to-background-elevated">
              <img
                v-if="item.cover_url"
                :src="item.cover_url"
                :alt="item.title"
                class="h-full w-full object-cover transition duration-300 ease-standard group-hover:scale-105"
>>>>>>> 55df43e16ee1a1ffed61a42e163f41533e501fb8
                :loading="index < 3 ? 'eager' : 'lazy'"
                :fetchpriority="index === 0 ? 'high' : 'auto'"
                :decoding="index < 3 ? 'sync' : 'async'"
              />
<<<<<<< HEAD
              
              <!-- NEW Badge -->
              <div class="absolute top-3 left-3 flex items-center gap-1 px-3 py-1.5 bg-red-500/90 backdrop-blur-sm rounded-lg text-[0.7rem] font-bold text-white uppercase tracking-wider">
=======
              <div class="absolute left-3 top-3 flex items-center gap-2 rounded-lg bg-[rgba(239,68,68,0.9)] px-3 py-1 text-[0.7rem] font-bold uppercase tracking-widest text-white">
>>>>>>> 55df43e16ee1a1ffed61a42e163f41533e501fb8
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                NEW
              </div>
<<<<<<< HEAD
              
              <!-- Overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            
            <!-- Info -->
            <div class="p-4">
              <h3 class="text-[0.95rem] font-semibold text-white mb-2 overflow-hidden line-clamp-2 leading-[1.4] min-h-[2.8em]">
                {{ item.title }}
              </h3>
              
              <!-- Meta -->
              <div class="flex items-center gap-3 text-xs text-gray-500 mb-2">
                <span class="flex items-center gap-1 text-yellow-400">
=======
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            </div>
            <div class="flex flex-col gap-3 p-4">
              <h3 class="line-clamp-2 text-sm font-semibold text-text-primary">{{ item.title }}</h3>
              <div class="flex items-center gap-3 text-xs text-text-muted">
                <span class="flex items-center gap-1 text-amber-300">
>>>>>>> 55df43e16ee1a1ffed61a42e163f41533e501fb8
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  {{ item.rating || '9.5' }}
                </span>
                <span>{{ item.chapters || item.total_chapters }} Ch</span>
              </div>
<<<<<<< HEAD
              
              <!-- Latest Chapter -->
              <div v-if="item.latestChapters && item.latestChapters.length > 0" class="flex items-center gap-1 text-xs text-purple-400 px-2.5 py-1.5 bg-purple-500/10 rounded-md overflow-hidden text-ellipsis whitespace-nowrap">
=======
              <div
                v-if="item.latestChapters && item.latestChapters.length > 0"
                class="inline-flex items-center gap-2 rounded-md bg-[rgba(139,92,246,0.12)] px-3 py-2 text-[0.75rem] text-accent-primary"
              >
>>>>>>> 55df43e16ee1a1ffed61a42e163f41533e501fb8
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
                <span class="truncate">{{ item.latestChapters[0]?.title || 'Latest Chapter' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ManhwaService } from '../services/manhwaService'
import type { ManhwaCardData } from '../types/manhwa'

const router = useRouter()
const hotUpdates = ref<ManhwaCardData[]>([])
const loading = ref(true)

const goToDetail = (slug: string) => {
  router.push({ name: 'detail', params: { slug } })
}

onMounted(async () => {
  try {
<<<<<<< HEAD
    console.log('🔥 Loading hot updates based on latest chapter releases...')
    // Use getHotUpdates to get manhwa sorted by latest chapter update time
    hotUpdates.value = await ManhwaService.getHotUpdates(12)
    
=======
    console.log('🔥 Loading hot updates...')
    // Get cards quickly without chapters
    const cards = await ManhwaService.getManhwaCards(12, true)
    const hydrated = await ManhwaService.hydrateManhwaCardsWithChapters(cards)

    // Sort by total chapters (more chapters = more updates)
    hotUpdates.value = hydrated.sort((a, b) => {
      const chaptersA = a.chapters || a.total_chapters || 0
      const chaptersB = b.chapters || b.total_chapters || 0
      return chaptersB - chaptersA
    })

>>>>>>> 55df43e16ee1a1ffed61a42e163f41533e501fb8
    console.log(`✅ Loaded ${hotUpdates.value.length} hot updates`)
  } catch (error) {
    console.error('❌ Error loading hot updates:', error)
  } finally {
    loading.value = false
  }
})
</script>
<<<<<<< HEAD

<style scoped>
/* Custom Animations */
@keyframes gradient-shift {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes fire-flicker {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes fade-in-scale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-gradient-shift {
  animation: gradient-shift 10s ease-in-out infinite;
}

.animate-fire-flicker {
  animation: fire-flicker 2s ease-in-out infinite;
}

.animate-fade-in-scale {
  animation: fade-in-scale 0.5s ease-out backwards;
}

/* Grid Pattern Background */
.bg-grid-pattern {
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 50px 50px;
}

/* Radial Gradient */
/* .bg-gradient-radial {
  background: radial-gradient(circle at 30% 20%, currentColor 0%, transparent 50%);
} */

/* Custom Scrollbar */
.scrollbar-thin::-webkit-scrollbar {
  height: 8px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background-color: rgb(31 41 55);
  border-radius: 0.25rem;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgb(168 85 247);
  border-radius: 0.25rem;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background-color: rgb(147 51 234);
}

.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: rgb(168 85 247) rgb(31 41 55);
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .flex-none.w-\[200px\] {
    width: 180px;
  }
}

@media (max-width: 768px) {
  .flex-none.w-\[200px\] {
    width: 160px;
  }
}

@media (max-width: 480px) {
  .flex-none.w-\[200px\] {
    width: 140px;
  }
}
</style>
=======
>>>>>>> 55df43e16ee1a1ffed61a42e163f41533e501fb8
