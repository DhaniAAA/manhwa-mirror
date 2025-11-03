<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NavigationBar from './components/shared/NavigationBar.vue'
import HeroSection from './components/shared/HeroSection.vue'
import ManhwaSection from './components/shared/ManhwaSection.vue'
import ManhwaDetail from './views/ManhwaDetail.vue'
import ManhwaReader from './views/ManhwaReader.vue'
import { useManhwa } from './composables/useManhwa'
import { useManhwaDetail } from './composables/useManhwaDetail'
import type { ManhwaCardData, Chapter } from './types/manhwa'

const showDetail = ref(false)
const showReader = ref(false)
const selectedManhwa = ref<ManhwaCardData | null>(null)

// Composable untuk detail page
const { metadata, chaptersData, loadManhwaDetail } = useManhwaDetail()

// Use composables untuk data dari Supabase
const { 
  manhwaList: trendingManhwa, 
  loadTrending 
} = useManhwa()

const { 
  manhwaList: continueManhwa, 
  loadContinueReading 
} = useManhwa()

const { 
  manhwaList: newReleases, 
  loadManhwaList: loadNewReleases 
} = useManhwa()

// Fallback data jika Supabase belum ready atau error
const fallbackTrending = ref<ManhwaCardData[]>([
  {
    slug: 'solo-leveling',
    title: 'Solo Leveling',
    genre: 'Action, Fantasy',
    rating: '9.8',
    chapters: 179,
    badge: 'Hot',
    lastUpdate: '2 jam lalu'
  },
  {
    slug: 'tower-of-god',
    title: 'Tower of God',
    genre: 'Adventure, Fantasy',
    rating: '9.5',
    chapters: 586,
    badge: 'Popular',
    lastUpdate: '5 jam lalu'
  },
  {
    slug: 'the-beginning-after-the-end',
    title: 'The Beginning After The End',
    genre: 'Action, Adventure',
    rating: '9.7',
    chapters: 168,
    badge: 'New',
    lastUpdate: '1 hari lalu'
  },
  {
    slug: 'omniscient-reader',
    title: 'Omniscient Reader\'s Viewpoint',
    genre: 'Action, Fantasy',
    rating: '9.6',
    chapters: 145,
    badge: 'Trending',
    lastUpdate: '3 jam lalu'
  }
])

// Load data saat component mounted
onMounted(async () => {
  console.log('🔄 Loading manhwa data from Supabase...')
  
  try {
    // Load data dari Supabase
    await Promise.all([
      loadTrending(6),
      loadContinueReading(4),
      loadNewReleases(6)
    ])

    console.log('📊 Data loaded:')
    console.log('- Trending:', trendingManhwa.value.length, 'items')
    console.log('- Continue:', continueManhwa.value.length, 'items')
    console.log('- New:', newReleases.value.length, 'items')

    // Jika data kosong, gunakan fallback
    if (trendingManhwa.value.length === 0) {
      console.warn('⚠️ No data from Supabase, using fallback data')
      trendingManhwa.value = fallbackTrending.value
      continueManhwa.value = fallbackTrending.value.slice(0, 4).map((item, idx) => ({
        ...item,
        progress: [65, 42, 28, 15][idx],
        lastUpdate: `Chapter ${[116, 71, 41, 88][idx]}`
      }))
      newReleases.value = fallbackTrending.value
    } else {
      console.log('✅ Using data from Supabase bucket')
    }
  } catch (error) {
    console.error('❌ Error loading manhwa data:', error)
    // Gunakan fallback data
    trendingManhwa.value = fallbackTrending.value
    continueManhwa.value = fallbackTrending.value.slice(0, 4).map((item, idx) => ({
      ...item,
      progress: [65, 42, 28, 15][idx],
      lastUpdate: `Chapter ${[116, 71, 41, 88][idx]}`
    }))
    newReleases.value = fallbackTrending.value
  }
})

const openDetail = async (slug: string, title: string) => {
  console.log(`📋 Opening detail for: ${title} (${slug})`)
  
  // Find manhwa data from all lists
  let manhwaData = trendingManhwa.value.find(m => m.slug === slug) ||
                   continueManhwa.value.find(m => m.slug === slug) ||
                   newReleases.value.find(m => m.slug === slug)
  
  if (!manhwaData) {
    // Create basic data if not found
    manhwaData = {
      slug,
      title,
      genre: 'Action, Fantasy',
      rating: '9.5',
      chapters: 50
    }
  }
  
  selectedManhwa.value = manhwaData
  showDetail.value = true
  
  // Load metadata dari Supabase
  await loadManhwaDetail(slug)
}

const closeDetail = () => {
  showDetail.value = false
}

const openReaderFromDetail = (chapter: Chapter) => {
  console.log(`📖 Opening reader for chapter: ${chapter.title}`)
  showDetail.value = false
  showReader.value = true
}

const closeReader = () => {
  showReader.value = false
  showDetail.value = true // Kembali ke detail page
}

// Helper function untuk generate demo chapters
const generateDemoChapters = (totalChapters: number): Chapter[] => {
  const chapters: Chapter[] = []
  const maxChapters = Math.min(totalChapters, 20) // Limit to 20 for demo
  
  for (let i = 1; i <= maxChapters; i++) {
    chapters.push({
      slug: `chapter-${String(i).padStart(2, '0')}`,
      title: `Chapter ${i}`,
      url: `#`,
      total_images: Math.floor(Math.random() * 30) + 20,
      images: []
    })
  }
  
  return chapters
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-[var(--bg-primary)]">
    <NavigationBar v-if="!showReader" />
    
    <main v-if="!showReader" class="relative z-[1] flex-1">
      <HeroSection />
      
      <ManhwaSection
        title="Lanjutkan Membaca"
        subtitle="Lanjutkan dari terakhir kali Anda membaca"
        :showViewAll="true"
        :manhwaList="continueManhwa"
        @cardClick="openDetail"
        @quickRead="openDetail"
      />
      
      <ManhwaSection
        title="Trending Sekarang"
        subtitle="Manhwa paling populer minggu ini"
        :showViewAll="true"
        :manhwaList="trendingManhwa"
        @cardClick="openDetail"
        @quickRead="openDetail"
      />
      
      <ManhwaSection
        title="Rilis Terbaru"
        subtitle="Chapter terbaru yang baru saja dirilis"
        :showViewAll="true"
        :manhwaList="newReleases"
        @cardClick="openDetail"
        @quickRead="openDetail"
      />
    </main>
    
    <footer
      v-if="!showReader"
      class="relative z-[1] mt-16 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] pt-16 pb-8"
    >
      <div class="container">
        <div class="mb-12 grid gap-12 lg:[grid-template-columns:2fr_3fr] lg:gap-16">
          <div class="max-w-md space-y-4">
            <div class="flex items-center gap-3 text-xl font-bold text-[var(--text-primary)]">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="8" fill="url(#footer-logo-gradient)"/>
                <path d="M8 12L16 8L24 12V20L16 24L8 20V12Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <defs>
                  <linearGradient id="footer-logo-gradient" x1="0" y1="0" x2="32" y2="32">
                    <stop offset="0%" stop-color="#8b5cf6"/>
                    <stop offset="100%" stop-color="#a78bfa"/>
                  </linearGradient>
                </defs>
              </svg>
              <span class="bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] bg-clip-text text-transparent">Manhwa Mirror</span>
            </div>
            <p class="text-[0.95rem] leading-relaxed text-[var(--text-secondary)]">
              Platform modern untuk membaca manhwa dengan pengalaman terbaik. 
              Nikmati ribuan judul favorit Anda kapan saja, di mana saja.
            </p>
          </div>
          
          <div class="grid gap-8 md:grid-cols-3">
            <div class="space-y-3">
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">Jelajahi</h4>
              <a class="block text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--accent-primary)] hover:underline" href="#">Beranda</a>
              <a class="block text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--accent-primary)] hover:underline" href="#">Perpustakaan</a>
              <a class="block text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--accent-primary)] hover:underline" href="#">Terbaru</a>
              <a class="block text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--accent-primary)] hover:underline" href="#">Populer</a>
            </div>
            
            <div class="space-y-3">
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">Kategori</h4>
              <a class="block text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--accent-primary)] hover:underline" href="#">Action</a>
              <a class="block text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--accent-primary)] hover:underline" href="#">Romance</a>
              <a class="block text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--accent-primary)] hover:underline" href="#">Fantasy</a>
              <a class="block text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--accent-primary)] hover:underline" href="#">Drama</a>
            </div>
            
            <div class="space-y-3">
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">Bantuan</h4>
              <a class="block text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--accent-primary)] hover:underline" href="#">FAQ</a>
              <a class="block text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--accent-primary)] hover:underline" href="#">Kontak</a>
              <a class="block text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--accent-primary)] hover:underline" href="#">Kebijakan</a>
              <a class="block text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--accent-primary)] hover:underline" href="#">Syarat</a>
            </div>
          </div>
        </div>
        
        <div class="flex flex-col gap-6 border-t border-[var(--divider-color)] pt-8 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <p class="text-sm text-[var(--text-muted)]">&copy; 2024 Manhwa Mirror. Semua hak dilindungi.</p>
          <div class="flex justify-center gap-4 md:justify-end">
            <a
              href="#"
              aria-label="Discord"
              class="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-primary)] hover:text-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </a>
            <a
              href="#"
              aria-label="Twitter"
              class="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-primary)] hover:text-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
              </svg>
            </a>
            <a
              href="#"
              aria-label="Instagram"
              class="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-primary)] hover:text-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
    
    <!-- Detail Page -->
    <ManhwaDetail
      v-if="showDetail && selectedManhwa"
      :slug="selectedManhwa.slug || ''"
      :title="metadata?.title || selectedManhwa.title"
      :rating="metadata?.rating || selectedManhwa.rating"
      :totalChapters="metadata?.total_chapters || selectedManhwa.chapters || selectedManhwa.total_chapters || 0"
      :description="metadata?.description"
      :author="metadata?.author"
      :artist="metadata?.artist"
      :genres="metadata?.genres || selectedManhwa.genre?.split(', ') || []"
      :status="metadata?.status"
      :type="metadata?.type"
      :releaseYear="metadata?.release_year"
      :lastUpdate="metadata?.lastUpdate || selectedManhwa.lastUpdate"
      :coverUrl="metadata?.cover_url || selectedManhwa.cover_url"
      :chapters="chaptersData?.chapters || generateDemoChapters(selectedManhwa.chapters || selectedManhwa.total_chapters || 0)"
      @close="closeDetail"
      @readChapter="openReaderFromDetail"
    />
    
    <!-- Reader -->
    <ManhwaReader 
      v-if="showReader"
      :manhwaTitle="selectedManhwa?.title || ''"
      :manhwaSlug="selectedManhwa?.slug || ''"
      @close="closeReader"
    />
  </div>
</template>
