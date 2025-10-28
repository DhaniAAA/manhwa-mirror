<template>
  <nav class="fixed inset-x-0 top-0 z-80 border-b border-border bg-[#0a0a0f]/80 backdrop-blur-2xl transition-all duration-200 ease-standard">
    <div class="container flex h-[70px] items-center justify-between gap-8">
      <!-- Logo -->
      <div class="flex items-center">
        <a
          href="/"
          class="flex items-center gap-3 text-lg font-bold text-text-primary transition-transform duration-150 ease-standard hover:scale-105"
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="url(#logo-gradient)"/>
            <path d="M8 12L16 8L24 12V20L16 24L8 20V12Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <defs>
              <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32">
                <stop offset="0%" stop-color="#8b5cf6"/>
                <stop offset="100%" stop-color="#a78bfa"/>
              </linearGradient>
            </defs>
          </svg>
          <span class="hidden bg-gradient-to-br from-accent-primary to-accent-secondary bg-clip-text text-lg font-semibold text-transparent md:inline">
            Manhwa Mirror
          </span>
        </a>
      </div>

      <!-- Navigation Links -->
      <div class="hidden flex-1 items-center gap-2 lg:flex">
        <RouterLink to="/" custom v-slot="{ href, navigate, isActive }">
          <a :href="href" @click="navigate" :class="linkClasses(isActive)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
            <span>Beranda</span>
            <span v-if="isActive" class="absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-accent-primary"></span>
          </a>
        </RouterLink>
        <RouterLink to="/library" custom v-slot="{ href, navigate, isActive }">
          <a :href="href" @click="navigate" :class="linkClasses(isActive)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <span>Perpustakaan</span>
            <span v-if="isActive" class="absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-accent-primary"></span>
          </a>
        </RouterLink>
        <RouterLink to="/latest" custom v-slot="{ href, navigate, isActive }">
          <a :href="href" @click="navigate" :class="linkClasses(isActive)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            <span>Terbaru</span>
            <span v-if="isActive" class="absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-accent-primary"></span>
          </a>
        </RouterLink>
        <RouterLink to="/popular" custom v-slot="{ href, navigate, isActive }">
          <a :href="href" @click="navigate" :class="linkClasses(isActive)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span>Populer</span>
            <span v-if="isActive" class="absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-accent-primary"></span>
          </a>
        </RouterLink>
      </div>

      <!-- Search & User Actions -->
      <div class="flex items-center gap-2">
        <button
          class="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition-colors duration-150 ease-standard hover:bg-background-tertiary/80 hover:text-text-primary"
          @click="toggleSearch"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </button>
        <button
          class="relative flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition-colors duration-150 ease-standard hover:bg-background-tertiary/80 hover:text-text-primary"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span class="absolute right-1.5 top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-background-primary bg-red-500 text-[0.65rem] font-semibold text-white">
            3
          </span>
        </button>
        <button
          class="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition-colors duration-150 ease-standard hover:bg-background-tertiary/80 hover:text-text-primary"
        >
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        </button>
      </div>
    </div>

    <!-- Search Overlay -->
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      leave-active-class="transition-opacity duration-200 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="searchOpen"
        class="fixed inset-0 z-[200] flex items-start justify-center bg-black/80 pt-[10vh] backdrop-blur-lg"
        @click="toggleSearch"
      >
        <div
          class="relative mx-6 w-full max-w-xl animate-search-slide"
          @click.stop
        >
          <input
            type="text"
            placeholder="Cari manhwa favorit Anda..."
            class="w-full rounded-2xl border-2 border-border bg-background-elevated px-6 py-5 pr-14 text-lg text-text-primary shadow-[0_20px_25px_-5px_rgba(0,0,0,0.6)] shadow-ambient transition duration-300 ease-standard placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.6),0_0_0_4px_rgba(139,92,246,0.3)]"
            v-model="searchQuery"
            ref="searchInputRef"
          />
          <button
            class="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-text-secondary transition-colors duration-150 ease-standard hover:bg-background-tertiary/80 hover:text-text-primary"
            @click="toggleSearch"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const linkBaseClass =
  'group relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-150 ease-standard'

const linkClasses = (isActive: boolean) => [
  linkBaseClass,
  isActive
    ? 'bg-[rgba(139,92,246,0.1)] text-accent-primary'
    : 'text-text-secondary hover:bg-background-tertiary/80 hover:text-text-primary',
]

const emit = defineEmits<{
  search: [query: string]
}>()

const searchOpen = ref(false)
const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)

const toggleSearch = () => {
  searchOpen.value = !searchOpen.value
  console.log(`🔍 [NavBar] Search overlay toggled: ${searchOpen.value}`)
  
  if (searchOpen.value) {
    // Focus input when opening
    nextTick(() => {
      searchInputRef.value?.focus()
    })
  } else {
    // Clear search when closing
    searchQuery.value = ''
    console.log('🧹 [NavBar] Clearing search')
    emit('search', '')
  }
}

// Watch for changes in search query with debounce
let searchTimeout: number | undefined
watch(searchQuery, (newQuery) => {
  console.log(`⌨️ [NavBar] Search query changed: "${newQuery}"`)
  clearTimeout(searchTimeout)
  searchTimeout = window.setTimeout(() => {
    console.log(`⏱️ [NavBar] Debounce complete, emitting: "${newQuery}"`)
    emit('search', newQuery)
  }, 300) // 300ms debounce
})
</script>
