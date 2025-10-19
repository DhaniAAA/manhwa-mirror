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
          <p>{{ error }}</p>
        </div>
        
        <!-- Images -->
        <div 
          v-else
          v-for="(image, index) in chapterImages" 
          :key="index"
          class="page-item"
          :style="{ marginBottom: `${pageGap}px` }"
        >
          <img 
            :src="image" 
            :alt="`Page ${index + 1}`"
            class="page-image"
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
              <select v-model="currentChapter" class="chapter-dropdown">
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
  chapterSlug?: string
}>()

defineEmits<{
  close: []
}>()

const loading = ref(false)
const error = ref<string | null>(null)
const chapterImages = ref<string[]>([])

const currentChapter = ref(1)
const totalChapters = ref(150)
const currentPage = ref(1)
const totalPages = computed(() => chapterImages.value.length)

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
  }
}

const nextChapter = () => {
  if (currentChapter.value < totalChapters.value) {
    currentChapter.value++
  }
}

const loadChapterImages = async (manhwaSlug: string, chapterSlug: string) => {
  loading.value = true
  error.value = null
  
  try {
    console.log(`📖 Loading chapter: ${manhwaSlug}/${chapterSlug}`)
    
    const chapterData = await ManhwaService.getChapter(manhwaSlug, chapterSlug)
    
    if (!chapterData) {
      throw new Error('Chapter not found')
    }
    
    chapterImages.value = chapterData.images
    console.log(`✅ Loaded ${chapterData.images.length} images`)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load chapter'
    console.error('❌ Error loading chapter:', err)
  } finally {
    loading.value = false
  }
}

const handleImageError = (index: number) => {
  console.warn(`Failed to load image ${index + 1}`)
}

const handleImageLoad = (index: number) => {
  console.log(`Loaded image ${index + 1}/${totalPages.value}`)
}

// Load chapter on mount
onMounted(() => {
  // Extract slug from URL or props
  const pathParts = window.location.pathname.split('/')
  const manhwaSlug = pathParts[2] // /manhwa/:slug/read/:chapterSlug
  const chapterSlug = props.chapterSlug || pathParts[4]
  
  if (manhwaSlug && chapterSlug) {
    loadChapterImages(manhwaSlug, chapterSlug)
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
  animation: fadeIn 0.3s ease-out;
}

.page-image {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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
  -webkit-appearance: none;
  margin-bottom: 0.5rem;
}

.setting-slider::-webkit-slider-thumb {
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
