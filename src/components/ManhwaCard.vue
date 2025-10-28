<template>
  <div class="bg-bg-secondary rounded-2xl overflow-hidden border border-border-color transition-all duration-base cursor-pointer h-full flex flex-col hover:-translate-y-2 hover:border-accent-primary hover:shadow-[0_12px_24px_rgba(0,0,0,0.4)]" @click="handleCardClick">
    <div class="relative">
      <div class="relative aspect-[3/4] bg-gradient-to-br from-bg-tertiary to-bg-elevated overflow-hidden">
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
        <div v-if="type" class="absolute top-2 left-2 px-3 py-1.5 backdrop-blur-sm rounded-lg text-[0.7rem] font-bold text-white uppercase tracking-wider z-10 shadow-[0_2px_8px_rgba(0,0,0,0.3)]" :class="{
          'bg-purple-500/95': type.toLowerCase() === 'manhwa',
          'bg-red-500/95': type.toLowerCase() === 'manhua',
          'bg-blue-500/95': type.toLowerCase() === 'manga'
        }">
          {{ type.toUpperCase() }}
        </div>

        <!-- Status Badge (Ongoing/Complete) -->
        <div v-if="status" class="absolute top-11 left-2 px-3 py-1.5 backdrop-blur-sm rounded-lg text-[0.7rem] font-bold text-white uppercase tracking-wider z-10 shadow-[0_2px_8px_rgba(0,0,0,0.3)]" :class="{
          'bg-green-500/95': status.toLowerCase() === 'ongoing',
          'bg-purple-900/95': status.toLowerCase() === 'complete',
          'bg-orange-400/95': status.toLowerCase() === 'hiatus'
        }">
          {{ status }}
        </div>
        <button class="absolute top-3 right-3 w-9 h-9 rounded-lg border-0 bg-black/60 backdrop-blur-sm text-text-secondary cursor-pointer flex items-center justify-center transition-all duration-fast z-[2] hover:bg-black/80 hover:text-accent-primary hover:scale-110" :class="{ '!bg-accent-primary !text-white [&_svg]:fill-white': isBookmarked }" @click="toggleBookmark">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div>
      <div class="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10" v-if="progress">
        <div class="h-full bg-gradient-to-r from-accent-primary to-accent-secondary transition-all duration-base" :style="{ width: `${progress}%` }"></div>
      </div>
    </div>
    
    <div class="p-4 flex-1 flex flex-col gap-2">
      <h3 class="text-base font-semibold text-text-primary overflow-hidden line-clamp-2 leading-[1.4] min-h-[2.8em]">{{ title }}</h3>
      <p class="text-xs text-text-muted overflow-hidden text-ellipsis whitespace-nowrap" v-if="genre">{{ genre }}</p>
      <div class="flex items-center gap-2 text-xs mt-auto">
        <div class="flex items-center gap-1 text-text-secondary" v-if="rating">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" class="text-yellow-400">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span>{{ rating }}</span>
        </div>
        <div class="text-text-muted text-[0.7rem]" v-if="rating && chapters">•</div>
        <div class="flex items-center gap-1 text-text-secondary" v-if="chapters">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <span>{{ chapters }} Ch</span>
        </div>
      </div>
      <div class="flex items-center gap-1.5 text-xs text-text-muted pt-2 border-t border-border-color" v-if="lastUpdate">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-accent-primary">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span>{{ lastUpdate }}</span>
      </div>
    </div>

    <!-- Latest Chapters List -->
    <div v-if="latestChapters && latestChapters.length > 0" class="border-t border-border-color bg-black/20">
      <div 
        v-for="(chapter, index) in latestChapters.slice(0, 2)" 
        :key="index"
        class="flex items-center justify-between px-3 py-2 border-b border-white/5 text-xs transition-all duration-fast cursor-pointer last:border-b-0 hover:bg-accent-primary/15 hover:translate-x-1 group"
        @click="handleChapterClick($event, chapter)"
      >
        <span class="text-xs text-text-secondary font-medium overflow-hidden text-ellipsis whitespace-nowrap flex-1 group-hover:text-accent-primary">{{ chapter.title }}</span>
        <span class="text-[0.75rem] text-text-muted whitespace-nowrap flex-shrink-0">{{ chapter.waktu_rilis || 'Baru' }}</span>
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

<style scoped>
/* Cover image styling */
:deep(.cover-img) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
</style>
