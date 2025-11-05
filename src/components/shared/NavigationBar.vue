<template>
  <nav class="fixed inset-x-0 top-0 z-[100] border-b border-border-color bg-bg-primary/95 backdrop-blur-2xl transition-all duration-200 ease-standard">
    <div class="container flex h-[70px] items-center justify-between gap-8">
      <!-- Logo -->
      <div class="flex items-center">
        <router-link to="/" class="flex items-center gap-3 text-lg font-bold text-text-primary transition-transform duration-150 ease-standard hover:scale-105">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="url(#logo-gradient)" />
            <path d="M8 12L16 8L24 12V20L16 24L8 20V12Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <defs>
              <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32">
                <stop offset="0%" stop-color="#8b5cf6" />
                <stop offset="100%" stop-color="#a78bfa" />
              </linearGradient>
            </defs>
          </svg>
          <span class="hidden bg-gradient-to-br from-accent-primary to-accent-secondary bg-clip-text text-lg font-semibold text-transparent md:inline"> Manhwa Mirror </span>
        </router-link>
      </div>

      <!-- Navigation Links -->
      <div class="hidden flex-1 items-center gap-2 lg:flex">
        <RouterLink to="/" custom v-slot="{ href, navigate, isActive }">
          <a :href="href" @click="navigate" :class="linkClasses(isActive)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            <span>Beranda</span>
            <span v-if="isActive" class="absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-accent-primary"></span>
          </a>
        </RouterLink>
        <RouterLink to="/library" custom v-slot="{ href, navigate, isActive }">
          <a :href="href" @click="navigate" :class="linkClasses(isActive)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>Perpustakaan</span>
            <span v-if="isActive" class="absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-accent-primary"></span>
          </a>
        </RouterLink>
        <RouterLink to="/search" custom v-slot="{ href, navigate, isActive }">
          <a :href="href" @click="navigate" :class="linkClasses(isActive)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span>Cari Disini</span>
            <span v-if="isActive" class="absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-accent-primary"></span>
          </a>
        </RouterLink>
        <RouterLink to="/popular" custom v-slot="{ href, navigate, isActive }">
          <a :href="href" @click="navigate" :class="linkClasses(isActive)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>Populer</span>
            <span v-if="isActive" class="absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-accent-primary"></span>
          </a>
        </RouterLink>
      </div>

      <!-- Search & Auth -->
      <div class="flex items-center gap-2">
        <button
          class="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition-colors duration-150 ease-standard hover:bg-bg-tertiary/80 hover:text-text-primary"
          @click="toggleSearch"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>

        <!-- User Menu -->
        <div v-if="isAuthenticated" class="relative" ref="userMenuRef">
          <button
            @click="toggleUserMenu"
            class="flex h-10 items-center gap-2 rounded-lg px-3 text-text-secondary transition-colors duration-150 ease-standard hover:bg-bg-tertiary/80 hover:text-text-primary"
          >
            <img
              v-if="currentProfile?.avatar_url"
              :src="currentProfile.avatar_url"
              alt="Avatar"
              class="w-8 h-8 rounded-full object-cover"
            />
            <div v-else class="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white text-sm font-bold">
              {{ ((currentProfile?.username || 'U')[0] || 'U').toUpperCase() }}
            </div>
          </button>

          <!-- Dropdown Menu -->
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            leave-active-class="transition-all duration-150 ease-in"
            enter-from-class="opacity-0 scale-95"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="userMenuOpen"
              class="absolute right-0 top-12 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50"
            >
              <div class="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                <p class="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {{ currentProfile?.username || 'User' }}
                </p>
                <p class="text-xs text-slate-600 dark:text-slate-400">
                  {{ currentUser?.email }}
                </p>
              </div>
              
              <router-link
                to="/profile"
                @click="userMenuOpen = false"
                class="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Profil Saya
              </router-link>

              <router-link
                to="/history"
                @click="userMenuOpen = false"
                class="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Riwayat Baca
              </router-link>

              <button
                @click="handleSignOut"
                class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Keluar
              </button>
            </div>
          </Transition>
        </div>

        <!-- Login Button -->
        <button
          v-else
          @click="showAuthModal = true"
          class="flex items-center gap-2 h-10 px-4 rounded-lg bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
          <span class="hidden md:inline">Masuk</span>
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
      <div v-if="searchOpen" class="fixed left-0 right-0 top-[70px] bottom-0 z-[90] 
         flex items-start justify-center bg-black/90 backdrop-blur-xl" @click="toggleSearch">
        <div class="relative mx-6 w-full max-w-xl animate-search-slide" @click.stop>
          <input
            type="text"
            placeholder="Cari manhwa favorit Anda..."
            class="w-full rounded-2xl border-2 border-border-color bg-bg-elevated px-6 py-5 pr-14 text-lg text-text-primary shadow-[0_20px_25px_-5px_rgba(0,0,0,0.6)] transition duration-300 ease-standard placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.6),0_0_0_4px_rgba(139,92,246,0.3)]"
            v-model="searchQuery"
            ref="searchInputRef"
          />
          <button
            class="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-text-secondary transition-colors duration-150 ease-standard hover:bg-bg-tertiary/80 hover:text-text-primary"
            @click="toggleSearch"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Auth Modal -->
    <AuthModal
      :is-open="showAuthModal"
      @close="showAuthModal = false"
      @success="showAuthModal = false"
    />
  </nav>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useAuth } from '../../composables/useAuth'
import AuthModal from '../auth/AuthModal.vue'

const linkBaseClass =
  'group relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-150 ease-standard'
const linkClasses = (isActive: boolean) => [
  linkBaseClass,
  isActive ? 'bg-[rgba(139,92,246,0.1)] text-accent-primary' : 'text-text-secondary hover:bg-bg-tertiary/80 hover:text-text-primary',
]

// ---- Auth ----
const { isAuthenticated, currentUser, currentProfile, signOut } = useAuth()
const showAuthModal = ref(false)
const userMenuOpen = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

const handleSignOut = async () => {
  await signOut()
  userMenuOpen.value = false
}

// Close user menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    userMenuOpen.value = false
  }
}

// ---- Search ----
const emit = defineEmits<{ search: [query: string] }>()
const searchOpen = ref(false)
const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)
const skipEmit = ref(false)

const toggleSearch = () => {
  searchOpen.value = !searchOpen.value
  if (searchOpen.value) {
    nextTick(() => searchInputRef.value?.focus())
  } else {
    searchQuery.value = ''
    emit('search', '')
  }
}

const closeSearch = () => {
  if (searchOpen.value) {
    skipEmit.value = true
    searchOpen.value = false
    searchQuery.value = ''
    nextTick(() => (skipEmit.value = false))
  }
}

defineExpose({ closeSearch })

let searchTimeout: number | undefined
watch(searchQuery, (val) => {
  clearTimeout(searchTimeout)
  if (skipEmit.value) return
  searchTimeout = window.setTimeout(() => emit('search', val), 300)
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.animate-search-slide {
  animation: slideDown 0.25s ease-out;
}
@keyframes slideDown {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
