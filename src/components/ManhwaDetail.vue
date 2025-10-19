<template>
  <div class="detail-page" :class="{ 'show': isVisible }">
    <!-- Header dengan backdrop -->
    <div class="detail-header">
      <div class="header-backdrop"></div>
      <div class="container">
        <div class="header-content">
          <button class="back-btn" @click="$emit('close')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            <span>Kembali</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="detail-content">
      <div class="container">
        <!-- Hero Section -->
        <div class="detail-hero">
          <div class="hero-cover">
            <div class="cover-image">
              <!-- Cover image from Supabase or placeholder -->
              <img 
                v-if="coverUrl" 
                :src="coverUrl" 
                :alt="title"
                class="cover-img"
                @error="handleImageError"
              />
              <div v-else class="cover-placeholder">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
              </div>
            </div>
            <button class="bookmark-btn-large" :class="{ active: isBookmarked }" @click="toggleBookmark">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              <span>{{ isBookmarked ? 'Tersimpan' : 'Simpan' }}</span>
            </button>
          </div>

          <div class="hero-info">
            <div class="info-badges">
              <span class="badge badge-status">Ongoing</span>
              <span class="badge badge-type">Manhwa</span>
            </div>
            
            <h1 class="detail-title">{{ title }}</h1>
            
            <div class="detail-meta">
              <div class="meta-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <span class="meta-value">{{ rating || '9.5' }}</span>
                <span class="meta-label">Rating</span>
              </div>
              <div class="meta-divider"></div>
              <div class="meta-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
                <span class="meta-value">{{ totalChapters }}</span>
                <span class="meta-label">Chapters</span>
              </div>
              <div class="meta-divider"></div>
              <div class="meta-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span class="meta-value">{{ views || '2.5M' }}</span>
                <span class="meta-label">Views</span>
              </div>
            </div>

            <div class="detail-actions">
              <button class="btn-read-primary" @click="startReading">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                <span>Mulai Membaca</span>
              </button>
              <button class="btn-continue" v-if="lastReadChapter" @click="continueReading">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
                <span>Lanjutkan Chapter {{ lastReadChapter }}</span>
              </button>
            </div>

            <div class="detail-description">
              <h3>Sinopsis</h3>
              <p>{{ description || 'Deskripsi manhwa akan ditampilkan di sini. Cerita menarik tentang petualangan, aksi, dan drama yang mendebarkan.' }}</p>
            </div>

            <div class="detail-info-grid">
              <div class="info-item" v-if="genres && genres.length > 0">
                <span class="info-label">Genre</span>
                <div class="info-tags">
                  <span class="tag" v-for="tag in genres" :key="tag">{{ tag }}</span>
                </div>
              </div>
              <div class="info-item" v-if="author">
                <span class="info-label">Author</span>
                <span class="info-value">{{ author }}</span>
              </div>
              <div class="info-item" v-if="artist">
                <span class="info-label">Artist</span>
                <span class="info-value">{{ artist }}</span>
              </div>
              <div class="info-item" v-if="status">
                <span class="info-label">Status</span>
                <span class="info-value" :class="status === 'Ongoing' ? 'status-ongoing' : 'status-completed'">
                  {{ status }}
                </span>
              </div>
              <div class="info-item" v-if="type">
                <span class="info-label">Type</span>
                <span class="info-value">{{ type }}</span>
              </div>
              <div class="info-item" v-if="releaseYear">
                <span class="info-label">Released</span>
                <span class="info-value">{{ releaseYear }}</span>
              </div>
              <div class="info-item" v-if="lastUpdate">
                <span class="info-label">Updated On</span>
                <span class="info-value">{{ lastUpdate }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Chapter List -->
        <div class="chapter-section">
          <div class="section-header">
            <h2>Daftar Chapter</h2>
            <div class="chapter-controls">
              <button class="sort-btn" @click="toggleSort">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="4" y1="6" x2="20" y2="6"/>
                  <line x1="4" y1="12" x2="20" y2="12"/>
                  <line x1="4" y1="18" x2="14" y2="18"/>
                </svg>
                <span>{{ sortAscending ? 'Terlama' : 'Terbaru' }}</span>
              </button>
            </div>
          </div>

          <div class="chapter-list" v-if="!loadingChapters">
            <div 
              v-for="chapter in sortedChapters" 
              :key="chapter.slug"
              class="chapter-item"
              @click="readChapter(chapter)"
            >
              <div class="chapter-info">
                <!-- <div class="chapter-number">{{ index + 1 }}</div> -->
                <div class="chapter-details">
                  <h4 class="chapter-title">{{ chapter.title }}</h4>
                  <span class="chapter-date">{{ chapter.waktu_rilis || 'Baru saja' }}</span>
                </div>
              </div>
              <div class="chapter-action">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </div>
          </div>

          <div class="loading-state" v-else>
            <div class="spinner"></div>
            <p>Memuat chapters...</p>
          </div>

          <div class="empty-state" v-if="!loadingChapters && chapters?.length === 0">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <p>Belum ada chapter tersedia</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Chapter } from '../types/manhwa'

const props = defineProps<{
  slug: string
  title: string
  rating?: string
  totalChapters: number
  description?: string
  author?: string
  artist?: string
  genres?: string[]
  status?: string
  type?: string
  releaseYear?: string
  lastUpdate?: string
  views?: string
  chapters?: Chapter[]
  coverUrl?: string
}>()

const emit = defineEmits<{
  close: []
  readChapter: [chapter: Chapter]
}>()

const isVisible = ref(false)
const isBookmarked = ref(false)
const loadingChapters = ref(false)
const sortAscending = ref(false)
const lastReadChapter = ref<number | null>(null)

// Computed
const sortedChapters = computed(() => {
  if (!props.chapters) return []
  const sorted = [...props.chapters]
  return sortAscending.value ? sorted : sorted.reverse()
})

// Methods
const toggleBookmark = () => {
  isBookmarked.value = !isBookmarked.value
}

const toggleSort = () => {
  sortAscending.value = !sortAscending.value
}

const startReading = () => {
  const firstChapter = props.chapters?.[0]
  if (firstChapter) {
    readChapter(firstChapter)
  }
}

const continueReading = () => {
  if (props.chapters && lastReadChapter.value) {
    const chapter = props.chapters[lastReadChapter.value - 1]
    if (chapter) readChapter(chapter)
  }
}

const readChapter = (chapter: Chapter) => {
  emit('readChapter', chapter)
}

const handleImageError = (event: Event) => {
  console.warn('Failed to load cover image, using placeholder')
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

// Lifecycle
onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
  }, 50)
  
  // Check localStorage for bookmark status
  const bookmarks = localStorage.getItem('manhwa-bookmarks')
  if (bookmarks) {
    const bookmarkList = JSON.parse(bookmarks)
    isBookmarked.value = bookmarkList.includes(props.slug)
  }
  
  // Check last read chapter
  const lastRead = localStorage.getItem(`last-read-${props.slug}`)
  if (lastRead) {
    lastReadChapter.value = parseInt(lastRead)
  }
})

// Watch bookmark changes
watch(isBookmarked, (newVal) => {
  const bookmarks = localStorage.getItem('manhwa-bookmarks')
  let bookmarkList = bookmarks ? JSON.parse(bookmarks) : []
  
  if (newVal) {
    if (!bookmarkList.includes(props.slug)) {
      bookmarkList.push(props.slug)
    }
  } else {
    bookmarkList = bookmarkList.filter((s: string) => s !== props.slug)
  }
  
  localStorage.setItem('manhwa-bookmarks', JSON.stringify(bookmarkList))
})
</script>

<style scoped>
.detail-page {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: var(--bg-primary);
  overflow-y: auto;
  opacity: 0;
  transform: translateY(20px);
  transition: all var(--transition-base);
}

.detail-page.show {
  opacity: 1;
  transform: translateY(0);
}

/* Header */
.detail-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(10, 10, 15, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
}

.header-backdrop {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(139, 92, 246, 0.1), transparent);
  opacity: 0.5;
}

.header-content {
  position: relative;
  height: 70px;
  display: flex;
  align-items: center;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 0.5rem;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.back-btn:hover {
  background: var(--bg-elevated);
  transform: translateX(-4px);
}

/* Content */
.detail-content {
  padding: 3rem 0;
}

/* Hero Section */
.detail-hero {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 3rem;
  margin-bottom: 4rem;
}

.hero-cover {
  position: relative;
}

.cover-image {
  aspect-ratio: 3/4;
  background: var(--bg-secondary);
  border-radius: 1rem;
  border: 1px solid var(--border-color);
  overflow: hidden;
  box-shadow: var(--shadow-xl), var(--glow-ambient);
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-elevated));
}

.bookmark-btn-large {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  margin-top: 1rem;
  padding: 0.875rem;
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.95rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition-base);
}

.bookmark-btn-large:hover {
  background: var(--bg-tertiary);
  border-color: var(--accent-primary);
}

.bookmark-btn-large.active {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: white;
}

.bookmark-btn-large.active svg {
  fill: white;
}

/* Hero Info */
.info-badges {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.badge {
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-status {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.badge-type {
  background: rgba(139, 92, 246, 0.1);
  color: var(--accent-primary);
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.detail-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 1rem;
  border: 1px solid var(--border-color);
  margin-bottom: 2rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.meta-item svg {
  color: var(--accent-primary);
}

.meta-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.meta-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.meta-divider {
  width: 1px;
  height: 40px;
  background: var(--divider-color);
}

/* Actions */
.detail-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.btn-read-primary,
.btn-continue {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-read-primary {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  flex: 1;
}

.btn-read-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
}

.btn-continue {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-continue:hover {
  background: var(--bg-tertiary);
  border-color: var(--accent-primary);
}

/* Description */
.detail-description {
  margin-bottom: 2rem;
}

.detail-description h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.detail-description p {
  color: var(--text-secondary);
  line-height: 1.8;
}

/* Info Grid */
.detail-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 1rem;
  border: 1px solid var(--border-color);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-weight: 500;
}

.info-value {
  color: var(--text-primary);
  font-weight: 500;
}

.info-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.375rem 0.75rem;
  background: var(--bg-tertiary);
  border-radius: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.status-ongoing {
  color: #22c55e;
  font-weight: 600;
}

.status-completed {
  color: #3b82f6;
  font-weight: 600;
}

/* Chapter Section */
.chapter-section {
  margin-top: 4rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
}

.chapter-controls {
  display: flex;
  gap: 0.5rem;
}

.sort-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
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

.sort-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--accent-primary);
}

/* Chapter List */
.chapter-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.chapter-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.chapter-item:hover {
  background: var(--bg-tertiary);
  border-color: var(--accent-primary);
  transform: translateX(8px);
}

.chapter-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

/* .chapter-number {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: 0.5rem;
  font-weight: 700;
  color: var(--accent-primary);
  border: 1px solid var(--border-color);
} */

.chapter-details {
  flex: 1;
}

.chapter-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.chapter-date {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.chapter-action {
  color: var(--text-muted);
  transition: color var(--transition-fast);
}

.chapter-item:hover .chapter-action {
  color: var(--accent-primary);
}

/* Loading & Empty States */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--text-muted);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--bg-tertiary);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Responsive */
@media (max-width: 1024px) {
  .detail-hero {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .hero-cover {
    max-width: 300px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .detail-title {
    font-size: 2rem;
  }
  
  .detail-meta {
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .meta-divider {
    display: none;
  }
  
  .detail-actions {
    flex-direction: column;
  }
  
  .detail-info-grid {
    grid-template-columns: 1fr;
  }
  
  .chapter-item {
    padding: 1rem;
  }
  
  .chapter-number {
    width: 40px;
    height: 40px;
    font-size: 0.9rem;
  }
}
</style>
