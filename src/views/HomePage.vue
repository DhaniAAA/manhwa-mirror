<template>
  <div class="home-page">
    <HeroSection />
    
    <ManhwaSection
      title="Lanjutkan Membaca"
      subtitle="Lanjutkan dari terakhir kali Anda membaca"
      :showViewAll="true"
      :manhwaList="continueManhwa"
      @cardClick="goToDetail"
      @quickRead="goToDetail"
    />
    
    <ManhwaSection
      title="Trending Sekarang"
      subtitle="Manhwa paling populer minggu ini"
      :showViewAll="true"
      :manhwaList="trendingManhwa"
      @cardClick="goToDetail"
      @quickRead="goToDetail"
    />
    
    <ManhwaSection
      title="Rilis Terbaru"
      subtitle="Chapter terbaru yang baru saja dirilis"
      :showViewAll="true"
      :manhwaList="newReleases"
      @cardClick="goToDetail"
      @quickRead="goToDetail"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import HeroSection from '../components/HeroSection.vue'
import ManhwaSection from '../components/ManhwaSection.vue'
import { useManhwa } from '../composables/useManhwa'

const router = useRouter()

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

// Load data saat component mounted
onMounted(async () => {
  console.log('🔄 Loading manhwa data from Supabase...')
  
  try {
    await Promise.all([
      loadTrending(6),
      loadContinueReading(4),
      loadNewReleases(6)
    ])

    console.log('📊 Data loaded:')
    console.log('- Trending:', trendingManhwa.value.length, 'items')
    console.log('- Continue:', continueManhwa.value.length, 'items')
    console.log('- New:', newReleases.value.length, 'items')

    if (trendingManhwa.value.length > 0) {
      console.log('✅ Using data from Supabase bucket')
      console.log('🖼️ Sample cover URLs:', trendingManhwa.value.slice(0, 2).map(m => ({
        title: m.title,
        cover_url: m.cover_url,
        coverImage: m.coverImage
      })))
    } else {
      console.warn('⚠️ No data from Supabase')
    }
  } catch (error) {
    console.error('❌ Error loading manhwa data:', error)
  }
})

const goToDetail = (slug: string) => {
  router.push({ name: 'detail', params: { slug } })
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
}
</style>
