<template>
  <div class="flex min-h-screen flex-col bg-[var(--bg-primary)]">
    <NavigationBar v-if="!isReaderRoute" ref="navBarRef" @search="handleSearch" />

    <main class="relative z-[1] flex-1" :class="{ 'm-0 p-0': isReaderRoute }">
      <RouterView ref="routerViewRef" :navBarRef="navBarRef" />
    </main>

    <footer v-if="!isReaderRoute" class="relative z-[1] mt-16 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] pt-16 pb-8">
      <div class="container">
        <div class="mb-12 grid gap-12 lg:[grid-template-columns:2fr_3fr] lg:gap-16">
          <div class="max-w-md space-y-4">
            <div class="flex items-center gap-3 text-xl font-bold text-[var(--text-primary)]">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="8" fill="url(#footer-logo-gradient)" />
                <path d="M8 12L16 8L24 12V20L16 24L8 20V12Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <defs>
                  <linearGradient id="footer-logo-gradient" x1="0" y1="0" x2="32" y2="32">
                    <stop offset="0%" stop-color="#8b5cf6" />
                    <stop offset="100%" stop-color="#a78bfa" />
                  </linearGradient>
                </defs>
              </svg>
              <span class="bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] bg-clip-text text-transparent">Manhwa Mirror</span>
            </div>
            <p class="text-[0.95rem] leading-relaxed text-[var(--text-secondary)]">Platform modern untuk membaca manhwa dengan pengalaman terbaik. Nikmati Puluhan judul favorit Anda kapan saja, di mana saja.</p>
          </div>

          <div class="grid gap-8 md:grid-cols-3">
            <div class="space-y-3">
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">Jelajahi</h4>
              <router-link to="/" class="block text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--accent-primary)] hover:underline"> Beranda </router-link>
              <router-link to="/library" class="block text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--accent-primary)] hover:underline"> Perpustakaan </router-link>
              <router-link to="/latest" class="block text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--accent-primary)] hover:underline"> Terbaru </router-link>
              <router-link to="/popular" class="block text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--accent-primary)] hover:underline"> Populer </router-link>
            </div>

            <div class="space-y-3">
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">Kategori</h4>
              <a href="#" class="block text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--accent-primary)] hover:underline" @click.prevent="filterByGenre('Action')"> Action </a>
              <a href="#" class="block text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--accent-primary)] hover:underline" @click.prevent="filterByGenre('Romance')"> Romance </a>
              <a href="#" class="block text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--accent-primary)] hover:underline" @click.prevent="filterByGenre('Fantasy')"> Fantasy </a>
              <a href="#" class="block text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--accent-primary)] hover:underline" @click.prevent="filterByGenre('Drama')"> Drama </a>
            </div>

            <div class="space-y-3">
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">Bantuan</h4>
              <a href="#" class="block text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--accent-primary)] hover:underline" @click.prevent="showComingSoon('FAQ')"> FAQ </a>
              <a href="#" class="block text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--accent-primary)] hover:underline" @click.prevent="showComingSoon('Kontak')"> Kontak </a>
              <a href="#" class="block text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--accent-primary)] hover:underline" @click.prevent="showComingSoon('Kebijakan')"> Kebijakan </a>
              <a href="#" class="block text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--accent-primary)] hover:underline" @click.prevent="showComingSoon('Syarat')"> Syarat </a>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-6 border-t border-[var(--divider-color)] pt-8 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <p class="text-sm text-[var(--text-muted)]">&copy; 2025 Manhwa Mirror. Pastikan untuk membaca di website resmi.</p>
          <div class="flex justify-center gap-4 md:justify-end">
            <a
              href="https://github.com/DhaniAAA/manhwa-mirror"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              title="Visit our GitHub"
              class="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-primary)] hover:text-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                />
              </svg>
            </a>
            <a
              href="#"
              class="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-primary)] hover:text-white"
              aria-label="Twitter"
              title="Follow us on Twitter"
              @click.prevent="openSocial('twitter')"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
              </svg>
            </a>
            <a
              href="#"
              class="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-primary)] hover:text-white"
              aria-label="Instagram"
              title="Follow us on Instagram"
              @click.prevent="openSocial('instagram')"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from "vue";
import { useRouter, useRoute } from "vue-router";
// import { useSupabaseAuth } from "./composables/useSupabaseAuth";

// Lazy load NavigationBar (not needed in reader route)
const NavigationBar = defineAsyncComponent(() => import("./components/shared/NavigationBar.vue"));

const router = useRouter();
const route = useRoute();
const routerViewRef = ref<any>(null);
const navBarRef = ref<InstanceType<typeof NavigationBar> | null>(null);

// const { initAuth } = useSupabaseAuth();
// initAuth();

// Check if current route is reader
const isReaderRoute = computed(() => {
  return route.path.includes("/baca/") && route.path.includes("/read/");
});

// Handle search from NavigationBar
const handleSearch = (query: string) => {
  console.log(`🔍 [AppRouter] Search query received: "${query}"`);
  console.log(`📍 [AppRouter] Current route:`, router.currentRoute.value.path);

  // Always use URL-based approach for reliability
  const currentRoute = router.currentRoute.value;

  if (currentRoute.path === "/") {
    // Already on home, update query param
    console.log(`✅ [AppRouter] On HomePage, updating query param`);
    router.replace({ path: "/", query: { search: query || undefined } });
  } else {
    // Not on home, navigate with query
    console.log(`🔄 [AppRouter] Navigating to home with search query`);
    router.push({ path: "/", query: { search: query || undefined } });
  }
};

// Filter by genre
const filterByGenre = (genre: string) => {
  console.log(`🔍 Filtering by genre: ${genre}`);
  // Navigate to home with genre filter (you can implement this in HomePage later)
  router.push({ path: "/", query: { genre: genre.toLowerCase() } });
};

// Show coming soon message
const showComingSoon = (feature: string) => {
  alert(`🚧 ${feature} akan segera hadir!\n\nFitur ini sedang dalam pengembangan.`);
  console.log(`ℹ️ Coming soon: ${feature}`);
};

// Open social media
const openSocial = (platform: string) => {
  const urls: Record<string, string> = {
    github: "https://github.com/manhwa-mirror",
    twitter: "https://twitter.com/manhwamirror",
    instagram: "https://instagram.com/manhwamirror",
  };

  const url = urls[platform];
  if (url) {
    console.log(`🔗 Opening ${platform}: ${url}`);
    // For demo, show alert. In production, use window.open(url, '_blank')
    alert(`🔗 ${platform.charAt(0).toUpperCase() + platform.slice(1)}\n\nAkan membuka: ${url}\n\n(Demo mode - link tidak aktif)`);
  }
};
</script>
