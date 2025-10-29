<template>
  <div class="fixed inset-0 z-[9999] flex flex-col" :class="isFullscreen ? 'bg-black' : 'bg-bg-primary'">
    <!-- Reader Header -->
    <div class="fixed top-0 left-0 right-0 z-[10000] bg-bg-primary/95 backdrop-blur-xl border-b border-border-color transition-transform duration-300" :class="hideControls ? '-translate-y-full' : 'translate-y-0'">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-[60px] gap-8">
          <button class="flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent text-text-secondary text-sm font-medium transition-all duration-200 hover:bg-bg-tertiary hover:text-text-primary" @click="$emit('close')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            <span>Kembali</span>
          </button>
          
          <div class="flex-1 text-center hidden md:block">
            <h2 class="text-base font-semibold text-text-primary mb-1">{{ manhwaTitle }}</h2>
            <span class="text-[13px] text-text-muted">Chapter {{ currentChapter }}</span>
          </div>
          
          <div class="flex gap-2">
            <button class="w-10 h-10 rounded-lg bg-transparent text-text-secondary flex items-center justify-center transition-all duration-200 hover:bg-bg-tertiary hover:text-text-primary" @click="toggleFullscreen">
              <svg v-if="!isFullscreen" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
              </svg>
            </button>
            <button class="w-10 h-10 rounded-lg bg-transparent text-text-secondary flex items-center justify-center transition-all duration-200 hover:bg-bg-tertiary hover:text-text-primary" @click="toggleSettings">
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
    <div class="flex-1 overflow-y-auto pt-20 pb-24 px-4 flex justify-center" ref="contentContainer">
      <div class="w-full mx-auto" :style="{ maxWidth: `${pageWidth}px` }">
        <!-- Loading State -->
        <div v-if="loading" class="flex flex-col items-center justify-center min-h-[400px] text-text-secondary gap-4">
          <div class="w-12 h-12 border-4 border-bg-tertiary border-t-accent-primary rounded-full animate-spin"></div>
          <p>Memuat chapter...</p>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="flex flex-col items-center justify-center min-h-[400px] text-text-secondary gap-4">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p class="text-base font-medium text-text-primary">{{ error }}</p>
          <div v-if="error.includes('CORS') || error.includes('fetch')" class="mt-4 p-6 bg-bg-secondary border border-border-color rounded-xl max-w-[500px] text-left">
            <p class="text-[15px] font-semibold text-accent-primary mb-3">💡 Possible CORS Issue</p>
            <p class="text-sm text-text-secondary leading-relaxed mb-2">Please check Supabase Storage bucket CORS configuration.</p>
            <p class="text-sm text-text-secondary leading-relaxed">Make sure the bucket is public or has proper CORS settings.</p>
          </div>
        </div>
        
        <!-- Back to Detail Button (before images) -->
        <!-- <div v-if="!loading && !error" class="w-full py-4 pb-8 flex justify-center">
          <a :href="`/detail/${manhwaSlug}`" class="inline-flex items-center gap-2 px-6 py-3 bg-bg-secondary border border-border-color rounded-lg text-text-primary text-sm font-medium no-underline transition-all duration-200 hover:bg-bg-tertiary hover:border-accent-primary hover:text-accent-primary hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-primary/20">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <span>Kembali ke Detail {{ manhwaTitle }}</span>
          </a>
        </div> -->
        
        <!-- Images -->
        <div 
          v-if="!loading && !error"
          v-for="(image, index) in chapterImages" 
          :key="index"
          class="w-full relative m-0 p-0 leading-[0] animate-[fadeIn_0.3s_ease-out]"
          :style="{ marginBottom: `${pageGap}px` }"
        >
          <!-- Loading skeleton -->
          <div v-if="!loadedImages.has(index)" class="w-full aspect-[2/3] bg-gradient-to-br from-bg-secondary to-bg-tertiary rounded-lg flex flex-col items-center justify-center relative overflow-hidden border border-border-color">
            <div class="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]"></div>
            <span class="text-sm text-text-muted z-10">Loading page {{ index + 1 }}...</span>
          </div>
          
          <img 
            :src="image" 
            :alt="`Page ${index + 1}`"
            class="w-full h-auto block rounded-none shadow-none m-0 p-0 transition-opacity duration-300 cursor-pointer"
            :class="loadedImages.has(index) ? 'opacity-100' : 'opacity-0'"
            :loading="index < 3 ? 'eager' : 'lazy'"
            :fetchpriority="index < 3 ? 'high' : 'auto'"
            @error="handleImageError(index)"
            @load="handleImageLoad(index)"
            @click="toggleControls"
          />
        </div>
      </div>
    </div>

    <!-- Reader Footer -->
    <div class="fixed bottom-0 left-0 right-0 z-[10000] bg-bg-primary/95 backdrop-blur-xl border-t border-border-color transition-transform duration-300" :class="hideControls ? 'translate-y-full' : 'translate-y-0'">
      <div class="container mx-auto px-4">
        <div class="py-4">
          <div class="flex items-center justify-between gap-4 mb-4">
            <button class="flex items-center gap-2 px-5 py-2.5 border border-border-color rounded-lg bg-bg-secondary text-text-primary text-sm font-medium transition-all duration-200 hover:bg-bg-tertiary hover:border-accent-primary hover:text-accent-primary disabled:opacity-40 disabled:cursor-not-allowed" :disabled="currentChapter <= 1" @click="previousChapter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              <span class="hidden md:inline">Chapter Sebelumnya</span>
            </button>
            
            <div class="flex-1 max-w-[200px]">
              <select 
                v-model="currentChapter" 
                class="w-full px-4 py-2.5 border border-border-color rounded-lg bg-bg-secondary text-text-primary text-sm cursor-pointer transition-all duration-200 hover:border-accent-primary focus:outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10"
                @change="onChapterSelect"
              >
                <option v-for="ch in totalChapters" :key="ch" :value="ch">
                  Chapter {{ ch }}
                </option>
              </select>
            </div>
            
            <button class="flex items-center gap-2 px-5 py-2.5 border border-border-color rounded-lg bg-bg-secondary text-text-primary text-sm font-medium transition-all duration-200 hover:bg-bg-tertiary hover:border-accent-primary hover:text-accent-primary disabled:opacity-40 disabled:cursor-not-allowed" :disabled="currentChapter >= totalChapters" @click="nextChapter">
              <span class="hidden md:inline">Chapter Selanjutnya</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
          
          <div class="flex items-center gap-4">
            <span class="text-sm text-text-muted min-w-[80px]">{{ currentPage }} / {{ totalPages }}</span>
            <div class="flex-1 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full transition-all duration-300" :style="{ width: `${readProgress}%` }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

        <!-- Scroll to Top Button -->
    <Transition name="fade">
      <button
        v-if="showScrollTop"
        @click="scrollToTop"
        class="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-accent-primary text-white flex items-center justify-center shadow-lg z-[10001] hover:bg-accent-secondary transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
        aria-label="Kembali ke atas"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="18 15 12 9 6 15"/>
        </svg>
      </button>
    </Transition>

    <!-- Settings Panel -->
    <Transition name="slide-left">
      <div v-if="showSettings" class="fixed top-0 right-0 bottom-0 w-full md:w-80 bg-bg-secondary border-l border-border-color z-[10002] flex flex-col shadow-[-4px_0_12px_rgba(0,0,0,0.3)]">
        <div class="flex items-center justify-between p-6 border-b border-border-color">
          <h3 class="text-lg font-semibold text-text-primary">Pengaturan Pembaca</h3>
          <button class="w-8 h-8 rounded-lg bg-transparent text-text-secondary flex items-center justify-center transition-all duration-200 hover:bg-bg-tertiary hover:text-text-primary" @click="toggleSettings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-6">
          <div class="mb-8">
            <label class="block text-sm font-medium text-text-primary mb-3">Lebar Halaman</label>
            <input 
              type="range" 
              v-model="pageWidth" 
              min="600" 
              max="1200" 
              step="50"
              class="w-full h-1.5 rounded-full bg-bg-tertiary outline-none appearance-none mb-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
            />
            <span class="block text-xs text-text-muted text-right">{{ pageWidth }}px</span>
          </div>
          
          <div class="mb-8">
            <label class="block text-sm font-medium text-text-primary mb-3">Jarak Halaman</label>
            <input 
              type="range" 
              v-model="pageGap" 
              min="0" 
              max="40" 
              step="5"
              class="w-full h-1.5 rounded-full bg-bg-tertiary outline-none appearance-none mb-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
            />
            <span class="block text-xs text-text-muted text-right">{{ pageGap }}px</span>
          </div>
          
          <div class="mb-8">
            <label class="block text-sm font-medium text-text-primary mb-3">Mode Baca</label>
            <div class="flex gap-2">
              <button 
                class="flex-1 px-2.5 py-2.5 border rounded-lg text-sm font-medium transition-all duration-200" 
                :class="readMode === 'vertical' ? 'bg-accent-primary border-accent-primary text-white' : 'bg-bg-tertiary border-border-color text-text-secondary hover:border-accent-primary hover:text-text-primary'"
                @click="readMode = 'vertical'"
              >
                Vertikal
              </button>
              <button 
                class="flex-1 px-2.5 py-2.5 border rounded-lg text-sm font-medium transition-all duration-200" 
                :class="readMode === 'horizontal' ? 'bg-accent-primary border-accent-primary text-white' : 'bg-bg-tertiary border-border-color text-text-secondary hover:border-accent-primary hover:text-text-primary'"
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
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ManhwaService } from '../services/manhwaService'

// Tambahkan di antara deklarasi ref lainnya
const showScrollTop = ref(false)

// Fungsi scroll ke atas
const scrollToTop = () => {
  if (contentContainer.value) {
    contentContainer.value.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}

// Update status tombol saat scroll
const updateScrollTopButton = () => {
  if (!contentContainer.value) return
  showScrollTop.value = contentContainer.value.scrollTop > 400 // Muncul setelah scroll 400px
}

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
const hideControls = ref(true) // Default hidden saat reading
const showSettings = ref(false)

const pageWidth = ref(800)
const pageGap = ref(0)  // No gap between images for seamless reading
const readMode = ref('vertical')

const contentContainer = ref<HTMLElement | null>(null)
let scrollTimeout: number | null = null

const readProgress = computed(() => {
  if (totalPages.value === 0) return 0
  return (currentPage.value / totalPages.value) * 100
})

// Update current page based on scroll position
const updateCurrentPage = () => {
  if (!contentContainer.value) return

  const container = contentContainer.value
  const scrollTop = container.scrollTop
  const scrollHeight = container.scrollHeight - container.clientHeight

  if (scrollHeight <= 0) {
    currentPage.value = 1
    return
  }

  const scrollRatio = scrollTop / scrollHeight
  const calculatedPage = Math.ceil(scrollRatio * totalPages.value)
  currentPage.value = Math.max(1, Math.min(calculatedPage || 1, totalPages.value))
}

// Auto-hide controls when scrolling
// Ganti fungsi handleScroll-mu dengan yang ini:
const handleScroll = () => {
  if (!contentContainer.value) return

  // Update scroll to top button
  updateScrollTopButton()

  // Hanya lakukan logika auto-hide jika kontrol saat ini *sedang terlihat*
  if (!hideControls.value) {
    // Sembunyikan kontrol karena pengguna sedang scroll
    hideControls.value = true
  }

  // Reset timeout (bersihkan timeout lama jika ada)
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }

  // Atur timeout untuk menampilkan kontrol kembali setelah 2 detik tidak scroll
  scrollTimeout = window.setTimeout(() => {
    hideControls.value = false // Tampilkan kembali kontrol setelah jeda
  }, 2000) // 2000 milidetik = 2 detik

  // Update halaman saat ini
  updateCurrentPage()
}

onMounted(async () => {
  const pathParts = window.location.pathname.split('/')
  if (!resolvedManhwaSlug.value) {
    resolvedManhwaSlug.value = pathParts[2] || ''
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

  // Tunggu DOM siap, lalu pasang listener
  await nextTick()
  if (contentContainer.value) {
    contentContainer.value.addEventListener('scroll', handleScroll, { passive: true })
  }
})

onUnmounted(() => {
  if (contentContainer.value) {
    contentContainer.value.removeEventListener('scroll', handleScroll)
  }
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
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

  // Add scroll listener with auto-hide
  if (contentContainer.value) {
    contentContainer.value.addEventListener('scroll', handleScroll)
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (contentContainer.value) {
    contentContainer.value.removeEventListener('scroll', handleScroll)
  }
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
})
</script>

<style scoped>
/* Custom animations that can't be done with Tailwind */
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

/* Transitions for Settings Panel */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(100%);
}

/* Fade transition for Scroll to Top button */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
