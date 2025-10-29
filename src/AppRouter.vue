<template>
  <div class="app-container">
    <NavigationBar v-if="!isReaderRoute" ref="navBarRef" @search="handleSearch" />
    
    <main class="main-content" :class="{ 'reader-active': isReaderRoute }">
      <RouterView ref="routerViewRef" :navBarRef="navBarRef" />
    </main>
    
    <footer v-if="!isReaderRoute" class="app-footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
            <div class="footer-logo">
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
              <span class="text-gradient">Manhwa Mirror</span>
            </div>
            <p class="footer-description">
              Platform modern untuk membaca manhwa dengan pengalaman terbaik. 
              Nikmati Puluhan judul favorit Anda kapan saja, di mana saja.
            </p>
          </div>
          
          <div class="footer-links">
            <div class="link-group">
              <h4>Jelajahi</h4>
              <router-link to="/">Beranda</router-link>
              <router-link to="/library">Perpustakaan</router-link>
              <router-link to="/latest">Terbaru</router-link>
              <router-link to="/popular">Populer</router-link>
            </div>
            
            <div class="link-group">
              <h4>Kategori</h4>
              <a href="#" @click.prevent="filterByGenre('Action')">Action</a>
              <a href="#" @click.prevent="filterByGenre('Romance')">Romance</a>
              <a href="#" @click.prevent="filterByGenre('Fantasy')">Fantasy</a>
              <a href="#" @click.prevent="filterByGenre('Drama')">Drama</a>
            </div>
            
            <div class="link-group">
              <h4>Bantuan</h4>
              <a href="#" @click.prevent="showComingSoon('FAQ')">FAQ</a>
              <a href="#" @click.prevent="showComingSoon('Kontak')">Kontak</a>
              <a href="#" @click.prevent="showComingSoon('Kebijakan')">Kebijakan</a>
              <a href="#" @click.prevent="showComingSoon('Syarat')">Syarat</a>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; 2025 Manhwa Mirror. Pastikan untuk membaca di website resmi.</p>
          <div class="social-links">
            <a href="https://github.com/DhaniAAA/manhwa-mirror" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="Visit our GitHub">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a href="#" @click.prevent="openSocial('twitter')" aria-label="Twitter" title="Follow us on Twitter">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
              </svg>
            </a>
            <a href="#" @click.prevent="openSocial('instagram')" aria-label="Instagram" title="Follow us on Instagram">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import NavigationBar from './components/NavigationBar.vue'

const router = useRouter()
const route = useRoute()
const routerViewRef = ref<any>(null)
const navBarRef = ref<InstanceType<typeof NavigationBar> | null>(null)

// Check if current route is reader
const isReaderRoute = computed(() => {
  return route.path.includes('/baca/') && route.path.includes('/read/')
})

// Handle search from NavigationBar
const handleSearch = (query: string) => {
  console.log(`🔍 [AppRouter] Search query received: "${query}"`)
  console.log(`📍 [AppRouter] Current route:`, router.currentRoute.value.path)
  
  // Always use URL-based approach for reliability
  const currentRoute = router.currentRoute.value
  
  if (currentRoute.path === '/') {
    // Already on home, update query param
    console.log(`✅ [AppRouter] On HomePage, updating query param`)
    router.replace({ path: '/', query: { search: query || undefined } })
  } else {
    // Not on home, navigate with query
    console.log(`🔄 [AppRouter] Navigating to home with search query`)
    router.push({ path: '/', query: { search: query || undefined } })
  }
}

// Filter by genre
const filterByGenre = (genre: string) => {
  console.log(`🔍 Filtering by genre: ${genre}`)
  // Navigate to home with genre filter (you can implement this in HomePage later)
  router.push({ path: '/', query: { genre: genre.toLowerCase() } })
}

// Show coming soon message
const showComingSoon = (feature: string) => {
  alert(`🚧 ${feature} akan segera hadir!\n\nFitur ini sedang dalam pengembangan.`)
  console.log(`ℹ️ Coming soon: ${feature}`)
}

// Open social media
const openSocial = (platform: string) => {
  const urls: Record<string, string> = {
    github: 'https://github.com/manhwa-mirror',
    twitter: 'https://twitter.com/manhwamirror',
    instagram: 'https://instagram.com/manhwamirror'
  }
  
  const url = urls[platform]
  if (url) {
    console.log(`🔗 Opening ${platform}: ${url}`)
    // For demo, show alert. In production, use window.open(url, '_blank')
    alert(`🔗 ${platform.charAt(0).toUpperCase() + platform.slice(1)}\n\nAkan membuka: ${url}\n\n(Demo mode - link tidak aktif)`);
  }
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  position: relative;
}

.main-content {
  position: relative;
  z-index: 1;
}

.main-content.reader-active {
  padding: 0;
  margin: 0;
}

/* Footer */
.app-footer {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  padding: 4rem 0 2rem;
  margin-top: 4rem;
  position: relative;
  z-index: 1;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 4rem;
  margin-bottom: 3rem;
}

.footer-links.ai-style-change-1 {
  column-gap: 2rem;
}

.footer-brand {
  max-width: 400px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.footer-description {
  color: var(--text-secondary);
  line-height: 1.7;
  font-size: 0.95rem;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.link-group h4 {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.link-group a {
  display: block;
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  transition: color var(--transition-fast);
  cursor: pointer;
  text-decoration: none;
}

.link-group a:hover {
  color: var(--accent-primary);
  text-decoration: underline;
}

.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 2rem;
  border-top: 1px solid var(--divider-color);
}

.footer-bottom p {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-links a {
  width: 36px;
  height: 36px;
  border-radius: 0.5rem;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.social-links a:hover {
  background: var(--accent-primary);
  color: white;
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 1024px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  
  .footer-brand {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .app-footer {
    padding: 3rem 0 1.5rem;
  }
  
  .footer-links {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
  
  .footer-bottom {
    flex-direction: row;
    gap: 1.5rem;
    text-align: center;
  }
  
}
</style>
