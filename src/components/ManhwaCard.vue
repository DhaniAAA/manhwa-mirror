<template>
  <div
    class="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-background-secondary transition duration-300 ease-standard hover:-translate-y-2 hover:border-accent-primary hover:shadow-[0_12px_24px_rgba(0,0,0,0.4)] hover:shadow-ambient"
    @click="handleCardClick"
  >
    <div class="relative">
      <div class="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-background-tertiary to-background-elevated">
        <!-- Cover Image with Lazy Loading -->
        <LazyImage
          v-if="coverImage"
          :src="coverImage"
          :alt="title"
          image-class="absolute inset-0 h-full w-full object-cover object-center"
          :priority="priority"
          @error="handleImageError"
        />

        <!-- Type Badge (manhwa/manhua/manga) -->
        <div
          v-if="type"
          class="absolute left-2 top-2 rounded-lg px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-white backdrop-blur-md"
          :class="typeBadgeClass(type)"
        >
          {{ type.toUpperCase() }}
        </div>

        <!-- Status Badge (Ongoing/Complete) -->
        <div
          v-if="status"
          class="absolute left-2 top-12 rounded-lg px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-white backdrop-blur-md"
          :class="statusBadgeClass(status)"
        >
          {{ status }}
        </div>
        <button
          class="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-black/60 text-text-secondary transition duration-200 ease-standard hover:scale-105 hover:bg-black/80 hover:text-accent-primary"
          :class="{ 'bg-accent-primary text-white hover:text-white': isBookmarked }"
          @click="toggleBookmark"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div>
      <div v-if="progress" class="absolute inset-x-0 bottom-0 h-[3px] bg-white/10">
        <div
          class="h-full bg-gradient-to-r from-accent-primary to-accent-secondary transition-[width] duration-300 ease-standard"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
    </div>

    <div class="flex flex-1 flex-col gap-2 p-4">
      <h3 class="line-clamp-2 text-base font-semibold text-text-primary">{{ title }}</h3>
      <p v-if="genre" class="truncate text-xs text-text-muted">{{ genre }}</p>
      <div class="mt-auto flex items-center gap-2 text-xs">
        <div v-if="rating" class="flex items-center gap-1 text-text-secondary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span>{{ rating }}</span>
        </div>
        <div v-if="rating && chapters" class="text-text-muted">•</div>
        <div v-if="chapters" class="flex items-center gap-1 text-text-secondary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <span>{{ chapters }} Ch</span>
        </div>
      </div>
      <div v-if="lastUpdate" class="flex items-center gap-1.5 border-t border-divider pt-2 text-[0.75rem] text-text-muted">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span>{{ lastUpdate }}</span>
      </div>
    </div>

    <!-- Latest Chapters List -->
    <div v-if="latestChapters && latestChapters.length > 0" class="border-t border-divider bg-black/20">
      <div
        v-for="(chapter, index) in latestChapters.slice(0, 2)"
        :key="index"
        class="flex items-center justify-between border-b border-white/5 px-3 py-2 text-xs transition duration-150 ease-standard last:border-b-0 hover:translate-x-1 hover:bg-[rgba(139,92,246,0.15)]"
        @click="handleChapterClick($event, chapter)"
      >
        <span class="flex-1 truncate font-medium text-text-secondary transition-colors duration-150 ease-standard hover:text-accent-primary">
          {{ chapter.title }}
        </span>
        <span class="ml-2 flex-shrink-0 text-[0.75rem] text-text-muted">{{ chapter.waktu_rilis || 'Baru' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LazyImage from './LazyImage.vue'

const typeBadgeClass = (type: string) => {
  switch (type.toLowerCase()) {
    case 'manhua':
      return 'bg-[rgba(239,68,68,0.95)]'
    case 'manga':
      return 'bg-[rgba(59,130,246,0.95)]'
    case 'manhwa':
      return 'bg-[rgba(139,92,246,0.95)]'
    default:
      return 'bg-[rgba(139,92,246,0.95)]'
  }
}

const statusBadgeClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'ongoing':
      return 'bg-[rgba(34,197,94,0.95)]'
    case 'complete':
      return 'bg-[rgba(58,0,112,0.95)]'
    case 'hiatus':
      return 'bg-[rgba(251,146,60,0.95)]'
    default:
      return 'bg-[rgba(139,92,246,0.95)]'
  }
}

const props = defineProps<{
  slug?: string
  title: string
  genre?: string
  type?: string
  status?: string
  rating?: string
  chapters?: number
  badge?: string
  progress?: number
  lastUpdate?: string
  coverImage?: string
  latestChapters?: Array<{ title: string; waktu_rilis?: string; slug?: string }>
  priority?: boolean  // For LCP optimization - first visible cards should have priority
}>()

// Debug: Log type and status
if (props.type || props.status) {
  console.log(`📛 [${props.title}] Type: ${props.type}, Status: ${props.status}`)
}

const emit = defineEmits<{
  click: [slug: string, title: string]
  quickRead: [slug: string, title: string]
  chapterClick: [manhwaSlug: string, chapterSlug: string]
}>()

const isBookmarked = ref(false)

const toggleBookmark = (event: Event) => {
  event.stopPropagation()
  isBookmarked.value = !isBookmarked.value
}

const handleCardClick = () => {
  emit('click', props.slug || '', props.title)
}

const handleChapterClick = (event: Event, chapter: { title: string; waktu_rilis?: string; slug?: string }) => {
  event.stopPropagation() // Prevent card click

  if (chapter.slug && props.slug) {
    console.log(`📖 Opening chapter: ${props.slug}/${chapter.slug}`)
    emit('chapterClick', props.slug, chapter.slug)
  } else {
    console.warn('⚠️ Chapter slug or manhwa slug not available')
  }
}

// const handleQuickRead = () => {
//   emit('quickRead', props.slug || '', props.title)
// }

const handleImageError = () => {
  console.warn(`Failed to load cover image for: ${props.title}`)
}
</script>
