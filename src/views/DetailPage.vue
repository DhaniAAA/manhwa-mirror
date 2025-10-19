<template>
  <div class="detail-page-wrapper">
    <ManhwaDetail
      v-if="metadata"
      :slug="slug"
      :title="metadata.title"
      :rating="metadata.rating"
      :totalChapters="metadata.total_chapters"
      :description="metadata.description"
      :author="metadata.author"
      :artist="metadata.artist"
      :genres="metadata.genres || []"
      :status="metadata.status"
      :type="metadata.type"
      :releaseYear="metadata.release_year"
      :lastUpdate="metadata.lastUpdate"
      :coverUrl="metadata.cover_url"
      :chapters="chaptersData?.chapters || []"
      @close="goBack"
      @readChapter="goToReader"
    />
    
    <div v-else-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Memuat detail manhwa...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <h2>Gagal Memuat Data</h2>
      <p>{{ error }}</p>
      <button @click="retry" class="retry-btn">Coba Lagi</button>
      <button @click="goBack" class="back-btn">Kembali</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ManhwaDetail from '../components/ManhwaDetail.vue'
import { useManhwaDetail } from '../composables/useManhwaDetail'
import type { Chapter } from '../types/manhwa'

const route = useRoute()
const router = useRouter()
const slug = route.params.slug as string

const { loading, error, metadata, chaptersData, loadManhwaDetail } = useManhwaDetail()

onMounted(async () => {
  await loadManhwaDetail(slug)
})

const goBack = () => {
  router.push({ name: 'home' })
}

const goToReader = (chapter: Chapter) => {
  router.push({ 
    name: 'reader', 
    params: { slug, chapterSlug: chapter.slug }
  })
}

const retry = async () => {
  await loadManhwaDetail(slug)
}
</script>

<style scoped>
.detail-page-wrapper {
  min-height: 100vh;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  color: var(--text-secondary);
}

.spinner {
  width: 64px;
  height: 64px;
  border: 4px solid var(--bg-tertiary);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-container svg {
  color: var(--accent-primary);
  margin-bottom: 1.5rem;
}

.error-container h2 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.error-container p {
  margin-bottom: 2rem;
  text-align: center;
  max-width: 400px;
}

.retry-btn,
.back-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition-fast);
  margin: 0.5rem;
}

.retry-btn {
  background: var(--accent-primary);
  color: white;
  border: none;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.back-btn {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.back-btn:hover {
  background: var(--bg-tertiary);
}
</style>
