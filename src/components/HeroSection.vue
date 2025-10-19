<template>
  <section class="hero">
    <div class="hero-background">
      <div class="hero-gradient"></div>
      <div class="hero-pattern"></div>
    </div>
    
    <div class="container hero-content">
      <div class="hero-text">
        <h1 class="hero-title fade-in">
          Temukan Dunia
          <span class="text-gradient">Manhwa</span>
          Terbaik
        </h1>
        <p class="hero-description fade-in">
          Nikmati ribuan judul manhwa populer dengan antarmuka modern dan pengalaman membaca yang nyaman. 
          Baca kapan saja, di mana saja.
        </p>
        <div class="hero-actions fade-in">
          <button class="btn-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Mulai Membaca
          </button>
          <button class="btn-secondary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            Jelajahi Koleksi
          </button>
        </div>
        <div class="hero-stats fade-in">
          <div class="stat-item">
            <div class="stat-value">10K+</div>
            <div class="stat-label">Manhwa</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-value">50K+</div>
            <div class="stat-label">Pembaca</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-value">Daily</div>
            <div class="stat-label">Update</div>
          </div>
        </div>
      </div>
      
      <div class="hero-showcase">
        <div class="showcase-grid">
          <div 
            v-for="(item, index) in featuredManhwa" 
            :key="index"
            class="showcase-card"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <div class="card-image">
              <div class="card-overlay">
                <button class="card-play">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </button>
              </div>
              <div class="card-badge">{{ item.badge }}</div>
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ item.title }}</h3>
              <div class="card-meta">
                <span class="card-rating">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  {{ item.rating }}
                </span>
                <span class="card-chapters">Ch. {{ item.chapters }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const featuredManhwa = ref([
  {
    title: 'Solo Leveling',
    badge: 'Hot',
    rating: '9.8',
    chapters: '179'
  },
  {
    title: 'Tower of God',
    badge: 'Popular',
    rating: '9.5',
    chapters: '586'
  },
  {
    title: 'The Beginning After The End',
    badge: 'New',
    rating: '9.7',
    chapters: '168'
  },
  {
    title: 'Omniscient Reader',
    badge: 'Trending',
    rating: '9.6',
    chapters: '145'
  }
])
</script>

<style scoped>
.hero {
  position: relative;
  min-height: calc(100vh - 70px);
  margin-top: 70px;
  display: flex;
  align-items: center;
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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  padding: 4rem 1.5rem;
}

/* Hero Text */
.hero-text {
  max-width: 600px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
}

.hero-description {
  font-size: 1.125rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 2rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-secondary {
  background: var(--bg-elevated);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
  border-color: var(--accent-primary);
}

/* Hero Stats */
.hero-stats {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--divider-color);
}

/* Hero Showcase */
.hero-showcase {
  position: relative;
}

.showcase-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.showcase-card {
  background: var(--bg-secondary);
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid var(--border-color);
  transition: all var(--transition-base);
  animation: fadeInUp 0.6s ease-out backwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.showcase-card:hover {
  transform: translateY(-8px);
  border-color: var(--accent-primary);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4), var(--glow-ambient);
}

.card-image {
  position: relative;
  aspect-ratio: 3/4;
  background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-elevated));
  overflow: hidden;
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 50%);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-base);
}

.showcase-card:hover .card-overlay {
  opacity: 1;
}

.card-play {
  width: 56px;
  height: 56px;
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
}

.card-play:hover {
  transform: scale(1.1);
  background: var(--accent-secondary);
}

.card-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.375rem 0.75rem;
  background: rgba(139, 92, 246, 0.9);
  backdrop-filter: blur(8px);
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-info {
  padding: 1rem;
}

.card-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.card-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #fbbf24;
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .showcase-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .hero {
    margin-top: 60px;
    min-height: auto;
  }
  
  .hero-content {
    padding: 3rem 1.5rem;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-description {
    font-size: 1rem;
  }
  
  .hero-actions {
    flex-direction: column;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
  
  .showcase-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
