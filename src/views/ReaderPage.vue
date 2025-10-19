<template>
  <div class="reader-page-wrapper">
    <ManhwaReader
      :manhwaTitle="manhwaTitle"
      :chapterSlug="chapterSlug"
      @close="goToDetail"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ManhwaReader from '../components/ManhwaReader.vue'
import { useManhwaDetail } from '../composables/useManhwaDetail'

const route = useRoute()
const router = useRouter()

const slug = route.params.slug as string
const chapterSlug = route.params.chapterSlug as string

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
</script>

<style scoped>
.reader-page-wrapper {
  width: 100%;
  height: 100vh;
}
</style>
