<template>
  <div class="reader-container" :class="{ 'fullscreen': isFullscreen }">
    <!-- Reader Header -->
    <div class="reader-header" :class="{ 'hidden': hideControls }">
      <div class="container">
        <div class="header-content">
          <button class="back-btn" @click="$emit('close')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            <span>Kembali</span>
          </button>
          
          <div class="reader-info">
            <h2 class="reader-title">{{ manhwaTitle }}</h2>
            <span class="reader-chapter">Chapter {{ currentChapter }}</span>
          </div>
          
          <div class="reader-actions">
            <button class="action-btn" @click="toggleFullscreen">
              <svg v-if="!isFullscreen" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
              </svg>
            </button>
            <button class="action-btn" @click="toggleSettings">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6m5.66-15.66l-4.24 4.24m-2.83 2.83l-4.24 4.24m12.73 0l-4.24-4.24m-2.83-2.83L1.34 1.34"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reader Content -->
    <div class="reader-content" @click="toggleControls">
      <div class="pages-container" :style="{ maxWidth: `${pageWidth}px` }">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Memuat chapter...</p>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p class="error-message">{{ error }}</p>
          <div v-if="error.includes('CORS') || error.includes('fetch')" class="error-hint">
            <p class="hint-title">💡 Possible CORS Issue</p>
            <p class="hint-text">Please check Supabase Storage bucket CORS configuration.</p>
            <p class="hint-text">Make sure the bucket is public or has proper CORS settings.</p>
          </div>
        </div>
        
        <!-- Images -->
        <div 
          v-else
          v-for="(image, index) in chapterImages" 
          :key="index"
          class="page-item"
          :style="{ marginBottom: `${pageGap}px` }"
        >
          <!-- Loading skeleton -->
          <div v-if="!loadedImages.has(index)" class="image-skeleton">
            <div class="skeleton-shimmer"></div>
            <span class="skeleton-text">Loading page {{ index + 1 }}...</span>
          </div>
          
          <img 
            :src="image" 
            :alt="`Page ${index + 1}`"
            class="page-image"
            :class="{ 'loaded': loadedImages.has(index) }"
            :loading="index < 3 ? 'eager' : 'lazy'"
            :fetchpriority="index < 3 ? 'high' : 'auto'"
            @error="handleImageError(index)"
            @load="handleImageLoad(index)"
          />
        </div>
      </div>
    </div>

    <!-- Reader Footer -->
    <div class="reader-footer" :class="{ 'hidden': hideControls }">
      <div class="container">
        <div class="footer-content">
          <div class="chapter-nav">
            <button class="nav-btn" :disabled="currentChapter <= 1" @click="previousChapter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              <span>Chapter Sebelumnya</span>
            </button>
            
            <div class="chapter-select">
              <select 
                v-model="currentChapter" 
                class="chapter-dropdown"
                @change="onChapterSelect"
              >
                <option v-for="ch in totalChapters" :key="ch" :value="ch">
                  Chapter {{ ch }}
                </option>
              </select>
            </div>
            
            <button class="nav-btn" :disabled="currentChapter >= totalChapters" @click="nextChapter">
              <span>Chapter Selanjutnya</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
          
          <div class="progress-info">
            <span class="progress-text">{{ currentPage }} / {{ totalPages }}</span>
            <div class="progress-bar-container">
              <div class="progress-bar-fill" :style="{ width: `${readProgress}%` }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Panel -->
    <Transition name="slide-left">
      <div v-if="showSettings" class="settings-panel">
        <div class="settings-header">
          <h3>Pengaturan Pembaca</h3>
          <button class="close-settings" @click="toggleSettings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="settings-content">
          <div class="setting-group">
            <label class="setting-label">Lebar Halaman</label>
            <input 
              type="range" 
              v-model="pageWidth" 
              min="600" 
              max="1200" 
              step="50"
              class="setting-slider"
            />
            <span class="setting-value">{{ pageWidth }}px</span>
          </div>
          
          <div class="setting-group">
            <label class="setting-label">Jarak Halaman</label>
            <input 
              type="range" 
              v-model="pageGap" 
              min="0" 
              max="40" 
              step="5"
              class="setting-slider"
            />
            <span class="setting-value">{{ pageGap }}px</span>
          </div>
          
          <div class="setting-group">
            <label class="setting-label">Mode Baca</label>
            <div class="setting-options">
              <button 
                class="option-btn" 
                :class="{ active: readMode === 'vertical' }"
                @click="readMode = 'vertical'"
              >
                Vertikal
              </button>
              <button 
                class="option-btn" 
                :class="{ active: readMode === 'horizontal' }"
                @click="readMode = 'horizontal'"
              >
                Horizontal
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ManhwaService } from '../services/manhwaService'

const props = defineProps<{
  manhwaTitle: string
  manhwaSlug: string
  chapterSlug?: string
  initialChapter?: number
}>()

const emit = defineEmits<{
  close: []
  chapterChange: [chapter: number]
}>()

const loading = ref(false)
const error = ref<string | null>(null)
const chapterImages = ref<string[]>([])
const loadedImages = ref(new Set<number>()) // Track loaded images
const availableChapters = ref<number[]>([]) // Store all available chapter numbers
const chaptersData = ref<any>(null) // Store full chapters data
const resolvedManhwaSlug = ref(props.manhwaSlug || '')
const activeChapterSlug = ref<string | null>(null)

const currentChapter = ref(1)
const totalChapters = ref(0) // Will be loaded from data
const currentPage = ref(1)
const totalPages = computed(() => chapterImages.value.length)

const isSyncingFromRoute = ref(false)

const isFullscreen = ref(false)
const hideControls = ref(false)
const showSettings = ref(false)

const pageWidth = ref(800)
const pageGap = ref(20)
const readMode = ref('vertical')

const readProgress = computed(() => {
  if (totalPages.value === 0) return 0
  return (currentPage.value / totalPages.value) * 100
})

const onChapterSelect = () => {
  console.log(`📖 Chapter selected from dropdown: ${currentChapter.value}`)
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    document.documentElement.requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
}

const toggleControls = () => {
  hideControls.value = !hideControls.value
}

const toggleSettings = () => {
  showSettings.value = !showSettings.value
}

const previousChapter = () => {
  if (currentChapter.value > 1) {
    currentChapter.value--
    console.log(`⬅️ Previous chapter: ${currentChapter.value}`)
  }
}

const nextChapter = () => {
  if (currentChapter.value < totalChapters.value) {
    currentChapter.value++
    console.log(`➡️ Next chapter: ${currentChapter.value}`)
  }
}

// Watch for chapter changes
watch(currentChapter, async (newChapter, oldChapter) => {
  if (isSyncingFromRoute.value || newChapter === oldChapter) {
    return
  }

  if (newChapter !== oldChapter) {
    console.log(`🔄 Chapter changed: ${oldChapter} → ${newChapter}`)

    // Get chapter slug from stored data
    let chapterSlug = `chapter-${String(newChapter).padStart(2, '0')}`

    // If we have chapters data, use the actual slug
    if (chaptersData.value && chaptersData.value.chapters) {
      const chapterIndex = newChapter - 1
      if (chaptersData.value.chapters[chapterIndex]) {
        chapterSlug = chaptersData.value.chapters[chapterIndex].slug
        console.log(`📖 Using actual chapter slug: ${chapterSlug}`)
      } else {
        console.warn(`⚠️ Chapter ${newChapter} not found in data, using generated slug: ${chapterSlug}`)
      }
    }
    
    // Reload chapter images
    await loadChapterImages(resolvedManhwaSlug.value || props.manhwaSlug, chapterSlug)

    // Emit event to parent
    emit('chapterChange', newChapter)

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
})

const syncChapterFromSlug = async (chapterSlug?: string) => {
  if (!chapterSlug) {
    error.value = 'Invalid chapter URL'
    return
  }

  const manhwaSlug = resolvedManhwaSlug.value || props.manhwaSlug

  if (!manhwaSlug) {
    error.value = 'Invalid manhwa URL'
    return
  }

  isSyncingFromRoute.value = true

  try {
    await loadChapterImages(manhwaSlug, chapterSlug)

    const chapterMatch = chapterSlug.match(/chapter-(\d+)/)
    if (chapterMatch && chapterMatch[1]) {
      currentChapter.value = parseInt(chapterMatch[1], 10)
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  } finally {
    isSyncingFromRoute.value = false
  }
}

watch(
  () => props.chapterSlug,
  async (newSlug) => {
    if (!newSlug) {
      error.value = 'Invalid chapter URL'
      return
    }

    if (newSlug === activeChapterSlug.value) {
      return
    }

    await syncChapterFromSlug(newSlug)
  }
)

const loadTotalChapters = async (manhwaSlug: string) => {
  try {
    console.log(`📊 Loading total chapters for: ${manhwaSlug}`)

    // Get all chapters data
    const data = await ManhwaService.getChapters(manhwaSlug)
    
    if (data && data.chapters) {
      // Store full chapters data
      chaptersData.value = data
      
      totalChapters.value = data.total_chapters || data.chapters.length
      
      // Store available chapter slugs for reference
      availableChapters.value = data.chapters.map((_, index) => index + 1)
      
      console.log(`✅ Total chapters available: ${totalChapters.value}`)
      console.log(`📋 First 10 chapter slugs:`, data.chapters.map(ch => ch.slug).slice(0, 10))
    } else {
      console.warn('⚠️ No chapters data found, using default')
      totalChapters.value = 150 // Fallback
    }
  } catch (err) {
    console.error('❌ Error loading total chapters:', err)
    totalChapters.value = 150 // Fallback
  }
}

const loadChapterImages = async (manhwaSlug: string, chapterSlug: string) => {
  loading.value = true
  error.value = null
  loadedImages.value.clear() // Reset loaded images

  try {
    console.log(`📖 Loading chapter: ${manhwaSlug}/${chapterSlug}`)

    const chapterData = await ManhwaService.getChapter(manhwaSlug, chapterSlug)

    if (!chapterData) {
      throw new Error('Chapter not found')
    }

    chapterImages.value = chapterData.images || []
    activeChapterSlug.value = chapterSlug
    console.log(`✅ Loaded ${chapterImages.value.length} images`)

    // Preload first 3 images immediately
    preloadInitialImages()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load chapter'
    console.error('❌ Error loading chapter:', err)
  } finally {
    loading.value = false
  }
}

const preloadInitialImages = () => {
  // Preload first 3 images for faster initial display
  const preloadCount = Math.min(3, chapterImages.value.length)
  for (let i = 0; i < preloadCount; i++) {
    const imageUrl = chapterImages.value[i]
    if (imageUrl) {
      const img = new Image()
      img.src = imageUrl
    }
  }
}

const handleImageError = (index: number) => {
  console.warn(`❌ Failed to load image ${index + 1}`)
  loadedImages.value.delete(index)
}

const handleImageLoad = (index: number) => {
  loadedImages.value.add(index)
  console.log(`✅ Loaded image ${index + 1}/${totalPages.value}`)
  
  // Preload next few images
  preloadNextImages(index)
}

const preloadNextImages = (currentIndex: number) => {
  // Preload next 3 images
  const preloadCount = 3
  for (let i = 1; i <= preloadCount; i++) {
    const nextIndex = currentIndex + i
    if (nextIndex < chapterImages.value.length && !loadedImages.value.has(nextIndex)) {
      const imageUrl = chapterImages.value[nextIndex]
      if (imageUrl) {
        const img = new Image()
        img.src = imageUrl
      }
    }
  }
}

// Load chapter on mount
onMounted(async () => {
  // Extract slug from URL or props
  const pathParts = window.location.pathname.split('/')
  if (!resolvedManhwaSlug.value) {
    resolvedManhwaSlug.value = pathParts[2] || '' // /baca/:slug/read/:chapterSlug
  }

  const manhwaSlug = resolvedManhwaSlug.value
  const initialChapterSlug = props.chapterSlug || pathParts[4]

  if (!manhwaSlug) {
    error.value = 'Invalid manhwa URL'
    return
  }

  await loadTotalChapters(manhwaSlug)

  if (initialChapterSlug) {
    await syncChapterFromSlug(initialChapterSlug)
  } else {
    error.value = 'Invalid chapter URL'
  }
})
</script>

<style scoped>
.reader-container {
  position: fixed;
  inset: 0;
  background: var(--bg-primary);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.reader-container.fullscreen {
  background: #000;
}

/* Reader Header */
.reader-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(10, 10, 15, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
  transition: transform var(--transition-base);
}

.reader-header.hidden {
  transform: translateY(-100%);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  gap: 2rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.back-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.reader-info {
  flex: 1;
  text-align: center;
}

.reader-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.reader-chapter {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.reader-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 0.5rem;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

/* Reader Content */
.reader-content {
  flex: 1;
  overflow-y: auto;
  padding: 80px 1rem 100px;
  display: flex;
  justify-content: center;
}

.pages-container {
  width: 100%;
  margin: 0 auto;
}

.page-item {
  width: 100%;
  position: relative;
  animation: fadeIn 0.3s ease-out;
}

.page-image {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.3s ease-in;
}

.page-image.loaded {
  opacity: 1;
}

.image-skeleton {
  width: 100%;
  aspect-ratio: 2/3;
  background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.skeleton-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.05),
    transparent
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.skeleton-text {
  font-size: 0.875rem;
  color: var(--text-muted);
  z-index: 1;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--text-secondary);
  gap: 1rem;
}

.error-message {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
}

.error-hint {
  margin-top: 1rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  max-width: 500px;
  text-align: left;
}

.hint-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--accent-primary);
  margin-bottom: 0.75rem;
}

.hint-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.hint-text:last-child {
  margin-bottom: 0;
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

.error-state svg {
  color: var(--accent-primary);
}

.error-state p {
  text-align: center;
  max-width: 400px;
}

.page-placeholder {
  width: 100%;
  aspect-ratio: 2/3;
  background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
}

.page-number {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-muted);
}

/* Reader Footer */
.reader-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(10, 10, 15, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--border-color);
  transition: transform var(--transition-base);
}

.reader-footer.hidden {
  transform: translateY(100%);
}

.footer-content {
  padding: 1rem 0;
}

.chapter-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
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

.nav-btn:hover:not(:disabled) {
  background: var(--bg-tertiary);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.chapter-select {
  flex: 1;
  max-width: 200px;
}

.chapter-dropdown {
  width: 100%;
  padding: 0.625rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.875rem;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.chapter-dropdown:hover {
  border-color: var(--accent-primary);
}

.chapter-dropdown:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-text {
  font-size: 0.875rem;
  color: var(--text-muted);
  min-width: 80px;
}

.progress-bar-container {
  flex: 1;
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
  border-radius: 3px;
  transition: width var(--transition-base);
}

/* Settings Panel */
.settings-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 320px;
  background: var(--bg-secondary);
  border-left: 1px solid var(--border-color);
  z-index: 200;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.3);
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.settings-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.close-settings {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 0.5rem;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.close-settings:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.setting-group {
  margin-bottom: 2rem;
}

.setting-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.setting-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--bg-tertiary);
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  margin-bottom: 0.5rem;
}

.setting-slider::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.setting-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.setting-value {
  display: block;
  font-size: 0.8rem;
  color: var(--text-muted);
  text-align: right;
}

.setting-options {
  display: flex;
  gap: 0.5rem;
}

.option-btn {
  flex: 1;
  padding: 0.625rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.option-btn:hover {
  border-color: var(--accent-primary);
  color: var(--text-primary);
}

.option-btn.active {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: white;
}

/* Transitions */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform var(--transition-base);
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(100%);
}

/* Responsive */
@media (max-width: 768px) {
  .settings-panel {
    width: 100%;
  }
  
  .reader-info {
    display: none;
  }
  
  .chapter-nav {
    flex-wrap: wrap;
  }
  
  .nav-btn span {
    display: none;
  }
}
</style>
