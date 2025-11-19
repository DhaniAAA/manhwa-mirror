<template>
  <div class="reader-page-wrapper">
    <ManhwaReader :manhwaTitle="manhwaTitle" :manhwaSlug="slug" :chapterSlug="chapterSlug" @close="goToDetail"
      @chapterChange="handleChapterChange" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ManhwaReader from './ManhwaReader.vue'
import { useManhwaDetail } from '../composables/useManhwaDetail'
import { useMeta } from '../composables/useMeta'
import { generateReaderStructuredData, generateBreadcrumbStructuredData } from '../utils/structuredData'

const route = useRoute()
const router = useRouter()

const slug = route.params.slug as string
const chapterSlug = computed(() => route.params.chapterSlug as string)

const manhwaTitle = ref('')

const { metadata, loadManhwaDetail } = useManhwaDetail()

// Dynamic meta tags for reader page
const metaOptions = computed(() => {
  if (!metadata.value || !manhwaTitle.value) return {}

  const baseUrl = window.location.origin
  const currentUrl = `${baseUrl}/reader/${slug}/${chapterSlug.value}`
  const manhwaUrl = `${baseUrl}/detail/${slug}`

  // Extract chapter number from chapterSlug
  const chapterNumber = parseInt(chapterSlug.value.replace('chapter-', '')) || 1

  // Generate structured data for reader
  const structuredData = generateReaderStructuredData({
    title: metadata.value.title,
    chapterTitle: `${metadata.value.title} Chapter ${chapterNumber}`,
    url: currentUrl,
    manhwaUrl: manhwaUrl,
    chapterNumber: chapterNumber,
    author: metadata.value.author || 'Unknown Author',
    artist: metadata.value.artist || undefined,
    coverUrl: metadata.value.cover_url || `${baseUrl}/og-image.jpg`
  })

  // Generate breadcrumb structured data
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: 'Home', url: baseUrl },
    { name: metadata.value.title, url: manhwaUrl },
    { name: `Chapter ${chapterNumber}`, url: currentUrl }
  ])

  // Combine structured data with breadcrumb
  const combinedStructuredData = structuredData ? {
    ...structuredData,
    breadcrumb: breadcrumbData
  } : undefined

  return {
    title: `${metadata.value.title} Chapter ${chapterNumber} - Manhwaku`,
    description: `Baca ${metadata.value.title} Chapter ${chapterNumber} online gratis. ${metadata.value.description}`,
    image: metadata.value.cover_url || `${baseUrl}/og-image.jpg`,
    url: currentUrl,
    canonical: currentUrl,
    type: 'article',
    keywords: `${metadata.value.title}, chapter ${chapterNumber}, manhwa, baca online, ${metadata.value.genres?.join(', ') || 'komik'}`,
    structuredData: combinedStructuredData
  }
})

// Apply meta tags
useMeta(metaOptions)

onMounted(async () => {
  // Load metadata untuk mendapatkan title
  await loadManhwaDetail(slug)
  if (metadata.value) {
    manhwaTitle.value = metadata.value.title
  }
})

const goToDetail = () => {
  router.push({ name: 'detail', params: { slug } })
}

const handleChapterChange = (chapter: number) => {
  console.log(`📖 Chapter changed to: ${chapter}`)
  // Update URL without reload
  const newChapterSlug = `chapter-${String(chapter).padStart(2, '0')}`
  router.replace({
    name: 'reader',
    params: { slug, chapterSlug: newChapterSlug }
  })
}
</script>

<style scoped>
.reader-page-wrapper {
  width: 100%;
  height: 100vh;
}
</style>
