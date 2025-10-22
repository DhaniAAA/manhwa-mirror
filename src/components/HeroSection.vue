<template>
  <section class="hero">
    <div class="hero-background">
      <div class="hero-gradient"></div>
      <div class="hero-pattern"></div>
    </div>
    
    <div class="container hero-content">
      <div class="hot-updates-header">
        <div class="header-left">
          <div class="fire-icon">🔥</div>
          <div>
            <h1 class="section-title">Hot Komik Update</h1>
            <p class="section-subtitle">Manhwa terbaru yang baru saja dirilis</p>
          </div>
        </div>
        <div class="header-right">
          <span class="update-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Update Hari Ini
          </span>
        </div>
      </div>

      <div v-if="loading" class="hot-updates-loading">
        <div class="spinner"></div>
        <p>Memuat manhwa terbaru...</p>
      </div>

      <div v-else class="hot-updates-scroll">
        <div class="hot-updates-grid">
          <div 
            v-for="(item, index) in hotUpdates" 
            :key="item.slug"
            class="hot-card"
            :style="{ animationDelay: `${index * 0.05}s` }"
            @click="goToDetail(item.slug)"
          >
            <div class="hot-card-image">
              <img 
                v-if="item.cover_url" 
                :src="item.cover_url" 
                :alt="item.title"
                class="hot-card-cover"
              />
              <div class="hot-card-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                NEW
              </div>
              <div class="hot-card-overlay">
                <!-- <button class="quick-read-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </button> -->
              </div>
            </div>
            <div class="hot-card-info">
              <h3 class="hot-card-title">{{ item.title }}</h3>
              <div class="hot-card-meta">
                <span class="hot-card-rating">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  {{ item.rating || '9.5' }}
                </span>
                <span class="hot-card-chapters">{{ item.chapters || item.total_chapters }} Ch</span>
              </div>
              <div v-if="item.latestChapters && item.latestChapters.length > 0" class="hot-card-latest">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
                {{ item.latestChapters[0]?.title || 'Latest Chapter' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ManhwaService } from '../services/manhwaService'
import type { ManhwaCardData } from '../types/manhwa'

const router = useRouter()
const hotUpdates = ref<ManhwaCardData[]>([])
const loading = ref(true)

const goToDetail = (slug: string) => {
  router.push({ name: 'detail', params: { slug } })
}

onMounted(async () => {
  try {
    console.log('🔥 Loading hot updates...')
    // Get manhwa with chapters for latest updates
    const cards = await ManhwaService.getManhwaCards(12, false) // Get 12 with chapters
    
    // Sort by total chapters (more chapters = more updates)
    hotUpdates.value = cards.sort((a, b) => {
      const chaptersA = a.chapters || a.total_chapters || 0
      const chaptersB = b.chapters || b.total_chapters || 0
      return chaptersB - chaptersA
    })
    
    console.log(`✅ Loaded ${hotUpdates.value.length} hot updates`)
  } catch (error) {
    console.error('❌ Error loading hot updates:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.hero {
  position: relative;
  margin-top: 70px;
  padding: 3rem 0;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-gradient {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 30% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 70% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%);
  animation: gradientShift 10s ease-in-out infinite;
}

@keyframes gradientShift {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.hero-pattern {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.5;
}

.hero-content {
  position: relative;
  z-index: 1;
  padding: 0 1.5rem;
}

/* Hot Updates Header */
.hot-updates-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.fire-icon {
  font-size: 2.5rem;
  animation: fireFlicker 2s ease-in-out infinite;
}

@keyframes fireFlicker {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-subtitle {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin: 0.25rem 0 0 0;
}

.update-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--accent-primary);
}

/* Hot Updates Loading */
.hot-updates-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
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

/* Hot Updates Scroll */
.hot-updates-scroll {
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--accent-primary) var(--bg-tertiary);
  padding-bottom: 1rem;
}

.hot-updates-scroll::-webkit-scrollbar {
  height: 8px;
}

.hot-updates-scroll::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: 4px;
}

.hot-updates-scroll::-webkit-scrollbar-thumb {
  background: var(--accent-primary);
  border-radius: 4px;
}

.hot-updates-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--accent-secondary);
}

.hot-updates-grid {
  display: flex;
  gap: 1.5rem;
  padding: 0.5rem 0;
}

/* Hot Card */
.hot-card {
  flex: 0 0 200px;
  background: var(--bg-secondary);
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid var(--border-color);
  transition: all var(--transition-base);
  cursor: pointer;
  animation: fadeInScale 0.5s ease-out backwards;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.hot-card:hover {
  transform: translateY(-8px);
  border-color: var(--accent-primary);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4), 0 0 20px rgba(139, 92, 246, 0.3);
}

.hot-card-image {
  position: relative;
  aspect-ratio: 3/4;
  background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-elevated));
  overflow: hidden;
}

.hot-card-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-base);
}

.hot-card:hover .hot-card-cover {
  transform: scale(1.1);
}

.hot-card-badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  background: rgba(239, 68, 68, 0.9);
  backdrop-filter: blur(8px);
  border-radius: 0.5rem;
  font-size: 0.7rem;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.hot-card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 50%);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-base);
}

.hot-card:hover .hot-card-overlay {
  opacity: 1;
}

/* .quick-read-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: var(--accent-primary);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
} */

/* .quick-read-btn:hover {
  transform: scale(1.15);
  background: var(--accent-secondary);
} */

.hot-card-info {
  padding: 1rem;
}

.hot-card-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  min-height: 2.8em;
}

.hot-card-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.hot-card-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #fbbf24;
}

.hot-card-latest {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--accent-primary);
  padding: 0.375rem 0.625rem;
  background: rgba(139, 92, 246, 0.1);
  border-radius: 0.375rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Responsive */
@media (max-width: 1024px) {
  .section-title {
    font-size: 1.75rem;
  }
  
  .hot-card {
    flex: 0 0 180px;
  }
}

@media (max-width: 768px) {
  .hero {
    margin-top: 60px;
    padding: 2rem 0;
  }
  
  .hero-content {
    padding: 0 1rem;
  }
  
  .hot-updates-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .section-subtitle {
    font-size: 0.875rem;
  }
  
  .fire-icon {
    font-size: 2rem;
  }
  
  .update-badge {
    font-size: 0.8rem;
    padding: 0.5rem 1rem;
  }
  
  .hot-card {
    flex: 0 0 160px;
  }
  
  .hot-card-title {
    font-size: 0.875rem;
  }
  
  .hot-card-meta {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .hot-card {
    flex: 0 0 140px;
  }
  
  .hot-updates-scroll {
    margin: 0 -1rem;
    padding: 0 1rem 1rem;
  }
}
</style>
