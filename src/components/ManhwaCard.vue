<template>
  <div class="manhwa-card" @click="handleCardClick">
    <div class="card-cover">
      <div class="cover-image">
        <!-- Cover Image with Lazy Loading -->
        <LazyImage
          v-if="coverImage"
          :src="coverImage"
          :alt="title"
          image-class="cover-img"
          :priority="priority"
          @error="handleImageError"
        />
        
        <!-- <div class="cover-overlay">
          <button class="quick-read-btn" @click.stop="handleQuickRead">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </button>
        </div> -->
        <div class="cover-badge" v-if="badge">{{ badge }}</div>
        <button class="bookmark-btn" :class="{ active: isBookmarked }" @click="toggleBookmark">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div>
      <div class="progress-bar" v-if="progress">
        <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
      </div>
    </div>
    
    <div class="card-content">
      <h3 class="card-title">{{ title }}</h3>
      <p class="card-genre" v-if="genre">{{ genre }}</p>
      <div class="card-meta">
        <div class="meta-item" v-if="rating">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span>{{ rating }}</span>
        </div>
        <div class="meta-divider" v-if="rating && chapters">•</div>
        <div class="meta-item" v-if="chapters">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <span>{{ chapters }} Ch</span>
        </div>
      </div>
      <div class="card-update" v-if="lastUpdate">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span>{{ lastUpdate }}</span>
      </div>
    </div>
    
    <!-- Latest Chapters List -->
    <div v-if="latestChapters && latestChapters.length > 0" class="chapters-list">
      <div 
        v-for="(chapter, index) in latestChapters.slice(0, 2)" 
        :key="index"
        class="chapter-item"
        @click="handleChapterClick($event, chapter)"
      >
        <span class="chapter-title">{{ chapter.title }}</span>
        <span class="chapter-time">{{ chapter.waktu_rilis || 'Baru' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LazyImage from './LazyImage.vue'

const props = defineProps<{
  slug?: string
  title: string
  genre?: string
  rating?: string
  chapters?: number
  badge?: string
  progress?: number
  lastUpdate?: string
  coverImage?: string
  latestChapters?: Array<{ title: string; waktu_rilis?: string; slug?: string }>
  priority?: boolean  // For LCP optimization - first visible cards should have priority
}>()

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
.manhwa-card {
  background: var(--bg-secondary);
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid var(--border-color);
  transition: all var(--transition-base);
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.manhwa-card:hover {
  transform: translateY(-8px);
  border-color: var(--accent-primary);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4), var(--glow-ambient);
}

.card-cover {
  position: relative;
}

.cover-image {
  position: relative;
  aspect-ratio: 3/4;
  background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-elevated));
  overflow: hidden;
}

.cover-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, transparent 60%);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-base);
}

.manhwa-card:hover .cover-overlay {
  opacity: 1;
}

/* .quick-read-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: var(--accent-primary);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
} */

/* .quick-read-btn:hover {
  transform: scale(1.1);
  background: var(--accent-secondary);
} */

.cover-badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  padding: 0.375rem 0.75rem;
  background: rgba(139, 92, 246, 0.9);
  backdrop-filter: blur(8px);
  border-radius: 0.5rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  z-index: 2;
}

.bookmark-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 36px;
  height: 36px;
  border-radius: 0.5rem;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  z-index: 2;
}

.bookmark-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  color: var(--accent-primary);
  transform: scale(1.1);
}

.bookmark-btn.active {
  background: var(--accent-primary);
  color: white;
}

.bookmark-btn.active svg {
  fill: white;
}

.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
  transition: width var(--transition-base);
}

.card-content {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  min-height: 2.8em;
}

.card-genre {
  font-size: 0.8rem;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  margin-top: auto;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--text-secondary);
}

.meta-item svg {
  color: #fbbf24;
}

.meta-item:last-child svg {
  color: var(--text-muted);
}

.meta-divider {
  color: var(--text-muted);
  font-size: 0.7rem;
}

.card-update {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  padding-top: 0.5rem;
  border-top: 1px solid var(--divider-color);
}

.card-update svg {
  color: var(--accent-primary);
}

/* Latest Chapters List */
.chapters-list {
  border-top: 1px solid var(--divider-color);
  background: rgba(0, 0, 0, 0.2);
}

.chapter-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.8rem;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.chapter-item:last-child {
  border-bottom: none;
}

.chapter-item:hover {
  background: rgba(139, 92, 246, 0.15);
  transform: translateX(4px);
}

.chapter-item:hover .chapter-title {
  color: var(--accent-primary);
}

.chapter-title {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.chapter-time {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
