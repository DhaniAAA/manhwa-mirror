<template>
  <section class="manhwa-section">
    <div class="container">
      <div class="section-header">
        <div class="header-content">
          <h2 class="section-title">{{ title }}</h2>
          <p class="section-subtitle" v-if="subtitle">{{ subtitle }}</p>
        </div>
        <button class="view-all-btn" v-if="showViewAll">
          <span>Lihat Semua</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>

      <div class="manhwa-grid">
        <ManhwaCard
          v-for="(manhwa, index) in manhwaList"
          :key="manhwa.slug || index"
          :slug="manhwa.slug"
          :title="manhwa.title"
          :genre="manhwa.genre"
          :rating="manhwa.rating"
          :chapters="manhwa.chapters"
          :badge="manhwa.badge"
          :progress="manhwa.progress"
          :lastUpdate="manhwa.lastUpdate"
          :coverImage="manhwa.coverImage"
          @click="(slug, title) => $emit('cardClick', slug, title)"
          @quickRead="(slug, title) => $emit('quickRead', slug, title)"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import ManhwaCard from './ManhwaCard.vue'

defineProps<{
  title: string
  subtitle?: string
  showViewAll?: boolean
  manhwaList: Array<{
    slug?: string
    title: string
    genre?: string
    genres?: string[]
    rating?: string
    chapters?: number
    total_chapters?: number
    badge?: string
    status?: string
    progress?: number
    lastUpdate?: string
    coverImage?: string
    cover_url?: string
  }>
}>()

defineEmits<{
  cardClick: [slug: string, title: string]
  quickRead: [slug: string, title: string]
}>()
</script>

<style scoped>
.manhwa-section {
  padding: 4rem 0;
  position: relative;
}

.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 2rem;
}

.header-content {
  flex: 1;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.section-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition-base);
}

.view-all-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  transform: translateX(4px);
}

.manhwa-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .manhwa-section {
    padding: 3rem 0;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .view-all-btn {
    width: 100%;
    justify-content: center;
  }

  .manhwa-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
}
</style>
