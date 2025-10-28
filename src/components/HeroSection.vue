<template>
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Update Hari Ini
          </span>
        </div>
      </div>

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
                :loading="index < 3 ? 'eager' : 'lazy'"
                :fetchpriority="index === 0 ? 'high' : 'auto'"
                :decoding="index < 3 ? 'sync' : 'async'"
              />
              <div class="absolute left-3 top-3 flex items-center gap-2 rounded-lg bg-[rgba(239,68,68,0.9)] px-3 py-1 text-[0.7rem] font-bold uppercase tracking-widest text-white">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                NEW
              </div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            </div>
            <div class="flex flex-col gap-3 p-4">
              <h3 class="line-clamp-2 text-sm font-semibold text-text-primary">{{ item.title }}</h3>
              <div class="flex items-center gap-3 text-xs text-text-muted">
                <span class="flex items-center gap-1 text-amber-300">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  {{ item.rating || '9.5' }}
                </span>
                <span>{{ item.chapters || item.total_chapters }} Ch</span>
              </div>
              <div
                v-if="item.latestChapters && item.latestChapters.length > 0"
                class="inline-flex items-center gap-2 rounded-md bg-[rgba(139,92,246,0.12)] px-3 py-2 text-[0.75rem] text-accent-primary"
              >
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

    console.log(`✅ Loaded ${hotUpdates.value.length} hot updates`)
  } catch (error) {
    console.error('❌ Error loading hot updates:', error)
  } finally {
    loading.value = false
  }
})
</script>
