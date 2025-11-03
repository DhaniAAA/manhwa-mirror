<template>
  <div class="reader-page-wrapper">
    <ManhwaReader
      :manhwaTitle="manhwaTitle"
      :manhwaSlug="slug"
      :chapterSlug="chapterSlug"
      @close="goToDetail"
      @chapterChange="handleChapterChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ManhwaReader from './ManhwaReader.vue'
import { useManhwaDetail } from '../composables/useManhwaDetail'

const route = useRoute()
const router = useRouter()

const slug = route.params.slug as string
const chapterSlug = computed(() => route.params.chapterSlug as string)

const manhwaTitle = ref('')

const { metadata, loadManhwaDetail } = useManhwaDetail()

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
