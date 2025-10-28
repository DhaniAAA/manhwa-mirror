<template>
  <section class="relative py-16 md:py-20">
    <div class="container">
      <div class="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div class="flex-1 space-y-2">
          <h2 class="text-3xl font-bold text-text-primary md:text-4xl">{{ title }}</h2>
          <p v-if="subtitle" class="max-w-2xl text-base text-text-secondary md:text-lg">
            {{ subtitle }}
          </p>
        </div>
        <button
          v-if="showViewAll"
          class="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background-secondary px-6 py-3 text-sm font-medium text-text-primary transition duration-300 ease-standard hover:translate-x-1 hover:border-accent-primary hover:bg-background-tertiary/80 hover:text-accent-primary md:w-auto"
        >
          <span>Lihat Semua</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        <ManhwaCard
          v-for="(manhwa, index) in manhwaList"
          :key="manhwa.slug || index"
          :slug="manhwa.slug"
          :title="manhwa.title"
          :genre="manhwa.genre"
          :rating="manhwa.rating"
          :chapters="manhwa.chapters"
          :badge="manhwa.badge"
          :progress="manhwa.progress"
          :lastUpdate="manhwa.lastUpdate"
          :coverImage="manhwa.coverImage"
          @click="(slug, title) => $emit('cardClick', slug, title)"
          @quickRead="(slug, title) => $emit('quickRead', slug, title)"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import ManhwaCard from './ManhwaCard.vue'

defineProps<{
  title: string
  subtitle?: string
  showViewAll?: boolean
  manhwaList: Array<{
    slug?: string
    title: string
    genre?: string
    genres?: string[]
    rating?: string
    chapters?: number
    total_chapters?: number
    badge?: string
    status?: string
    progress?: number
    lastUpdate?: string
    coverImage?: string
    cover_url?: string
  }>
}>()

defineEmits<{
  cardClick: [slug: string, title: string]
  quickRead: [slug: string, title: string]
}>()
</script>
