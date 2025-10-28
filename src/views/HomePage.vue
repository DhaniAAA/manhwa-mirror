<template>
  <div class="min-h-screen bg-white dark:bg-slate-900">
    <HeroSection />
    
    <!-- Search Results Section -->
    <section v-if="searchQuery" class="py-12 bg-gradient-to-b from-violet-500/5 via-transparent border-b border-slate-200 dark:border-slate-700">
      <div class="container px-4 mx-auto">
        <div class="flex items-center justify-between mb-8 md:flex-col md:items-start md:gap-4">
          <h2 class="flex items-center text-3xl font-bold text-violet-500 lg:text-2xl md:text-xl">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="inline-block mr-2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            Hasil Pencarian: "{{ searchQuery }}"
          </h2>
          <div class="px-4 py-2 text-sm font-medium border rounded-lg bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 md:w-full md:text-center">
            {{ searchResults.length }} manhwa ditemukan
          </div>
        </div>
        
        <div v-if="searchLoading" class="flex flex-col items-center justify-center min-h-[300px] gap-4 text-slate-600 dark:text-slate-400">
          <div class="w-12 h-12 border-4 rounded-full border-slate-200 dark:border-slate-700 border-t-violet-500 animate-spin"></div>
          <p>Mencari manhwa...</p>
        </div>
        
        <div v-else-if="searchResults.length === 0" class="flex flex-col items-center justify-center min-h-[300px] px-4 py-12 text-center">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mb-6 opacity-50 text-slate-400 dark:text-slate-500">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <h3 class="mb-2 text-xl font-semibold text-slate-900 dark:text-slate-100">Tidak ada hasil</h3>
          <p class="text-base text-slate-600 dark:text-slate-400 max-w-[400px]">Coba kata kunci lain untuk menemukan manhwa yang Anda cari</p>
        </div>
        
        <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] md:gap-5 lg:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] lg:gap-6">
          <ManhwaCard
            v-for="manhwa in searchResults"
            :key="manhwa.slug"
            :slug="manhwa.slug"
            :title="manhwa.title"
            :coverImage="manhwa.cover_url || manhwa.coverImage"
            :type="manhwa.type"
            :status="manhwa.status"
            :rating="manhwa.rating"
            :chapters="manhwa.chapters || manhwa.total_chapters"
            :genre="manhwa.genre"
            :badge="manhwa.badge"
            :latestChapters="manhwa.latestChapters"
            @click="goToDetail"
            @chapterClick="goToChapter"
          />
        </div>
      </div>
    </section>
    
    <!-- Rekomendasi Manhwa Section -->
    <section id="recommendation-section" class="py-12 bg-gradient-to-b from-amber-400/5 via-transparent">
      <div class="container px-4 mx-auto">
        <div class="flex items-center justify-between mb-8 md:flex-col md:items-start md:gap-4">
          <div class="flex items-center gap-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="flex-shrink-0 text-amber-400">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <div>
              <h2 class="text-3xl font-bold text-slate-900 dark:text-slate-100 lg:text-2xl md:text-xl">Rekomendasi Manhwa</h2>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Pilihan terbaik untuk Anda berdasarkan rating tertinggi</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="px-4 py-2 text-sm font-medium border rounded-lg bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 md:w-full md:text-center">
              Halaman {{ latestPage }} dari {{ latestTotalPages }}
            </div>
            <div v-if="isLoadingMore" class="flex items-center gap-2 px-3 py-2 text-xs font-medium border rounded-lg bg-violet-50 border-violet-200 text-violet-600 dark:bg-violet-900/20 dark:border-violet-800 dark:text-violet-400">
              <div class="w-3 h-3 border-2 rounded-full border-violet-300 dark:border-violet-700 border-t-violet-600 dark:border-t-violet-400 animate-spin"></div>
              <span>Memuat...</span>
            </div>
          </div>
        </div>
        
        <div v-if="loadingLatest" class="flex flex-col items-center justify-center min-h-[300px] gap-4 text-slate-600 dark:text-slate-400">
          <div class="w-12 h-12 border-4 rounded-full border-slate-200 dark:border-slate-700 border-t-violet-500 animate-spin"></div>
          <p>Memuat rekomendasi...</p>
        </div>
        
        <div v-else>
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] md:gap-5 lg:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] lg:gap-6">
            <ManhwaCard
              v-for="(manhwa, index) in displayedLatest"
              :key="manhwa.slug"
              :slug="manhwa.slug"
              :title="manhwa.title"
              :coverImage="manhwa.cover_url || manhwa.coverImage"
              :type="manhwa.type"
              :status="manhwa.status"
              :rating="manhwa.rating"
              :chapters="manhwa.chapters || manhwa.total_chapters"
              :genre="manhwa.genre"
              :latestChapters="manhwa.latestChapters"
              :priority="index < 3"
              @click="goToDetail"
              @chapterClick="goToChapter"
            />
          </div>
          
          <!-- Pagination for Recommendations -->
          <div v-if="latestTotalPages > 1" class="flex flex-wrap items-center justify-center gap-1.5 pt-6 mt-8 border-t border-slate-200 dark:border-slate-700 md:gap-2 md:pt-8 md:mt-12">
            <button 
              class="relative flex items-center justify-center w-10 h-10 min-w-10 overflow-hidden text-slate-900 transition-all duration-200 ease-in-out border-2 rounded-[0.625rem] bg-slate-100 border-slate-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed md:w-11 md:h-11 md:min-w-11 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 hover:not(:disabled):-translate-y-px hover:not(:disabled):border-violet-500 hover:not(:disabled):text-violet-500 hover:not(:disabled):shadow-[0_4px_12px_rgba(139,92,246,0.2)] active:not(:disabled):translate-y-0 active:not(:disabled):shadow-[0_2px_6px_rgba(139,92,246,0.2)] md:hover:not(:disabled):-translate-y-0.5 dark:hover:not(:disabled):bg-slate-700 disabled:bg-white dark:disabled:bg-slate-900"
              :disabled="latestPage === 1"
              @click="goToLatestPage(1)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="relative z-10">
                <polyline points="11 17 6 12 11 7"/>
                <polyline points="18 17 13 12 18 7"/>
              </svg>
            </button>
            
            <button 
              class="relative flex items-center justify-center w-10 h-10 min-w-10 overflow-hidden text-slate-900 transition-all duration-200 ease-in-out border-2 rounded-[0.625rem] bg-slate-100 border-slate-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed md:w-11 md:h-11 md:min-w-11 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 hover:not(:disabled):-translate-y-px hover:not(:disabled):border-violet-500 hover:not(:disabled):text-violet-500 hover:not(:disabled):shadow-[0_4px_12px_rgba(139,92,246,0.2)] active:not(:disabled):translate-y-0 active:not(:disabled):shadow-[0_2px_6px_rgba(139,92,246,0.2)] md:hover:not(:disabled):-translate-y-0.5 dark:hover:not(:disabled):bg-slate-700 disabled:bg-white dark:disabled:bg-slate-900"
              :disabled="latestPage === 1"
              @click="goToLatestPage(latestPage - 1)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="relative z-10">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            
            <div class="flex flex-wrap justify-center gap-1.5 mx-1 md:gap-2 md:mx-2">
              <template v-for="(page, index) in visibleLatestPages" :key="index">
                <button
                  v-if="typeof page === 'number'"
                  class="relative flex items-center justify-center h-10 min-w-10 px-3.5 overflow-hidden text-sm font-semibold text-slate-900 transition-all duration-200 ease-in-out border-2 rounded-[0.625rem] bg-slate-100 border-slate-200 cursor-pointer md:h-11 md:min-w-11 md:text-[0.9375rem] dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  :class="page === latestPage 
                    ? 'bg-gradient-to-br from-violet-500 to-violet-700 border-violet-500 text-white shadow-[0_4px_16px_rgba(139,92,246,0.4)] scale-105 font-bold' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-700 hover:border-violet-500 hover:text-violet-500 hover:-translate-y-px md:hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(139,92,246,0.2)] active:translate-y-0'"
                  @click="goToLatestPage(page)"
                >
                  {{ page }}
                </button>
                <span v-else class="flex items-center justify-center h-10 min-w-10 px-2 text-slate-500 dark:text-slate-400">
                  {{ page }}
                </span>
              </template>
            </div>
            
            <button 
              class="relative flex items-center justify-center w-10 h-10 min-w-10 overflow-hidden text-slate-900 transition-all duration-200 ease-in-out border-2 rounded-[0.625rem] bg-slate-100 border-slate-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed md:w-11 md:h-11 md:min-w-11 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 hover:not(:disabled):-translate-y-px hover:not(:disabled):border-violet-500 hover:not(:disabled):text-violet-500 hover:not(:disabled):shadow-[0_4px_12px_rgba(139,92,246,0.2)] active:not(:disabled):translate-y-0 active:not(:disabled):shadow-[0_2px_6px_rgba(139,92,246,0.2)] md:hover:not(:disabled):-translate-y-0.5 dark:hover:not(:disabled):bg-slate-700 disabled:bg-white dark:disabled:bg-slate-900"
              :disabled="latestPage === latestTotalPages"
              @click="goToLatestPage(latestPage + 1)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="relative z-10">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
            
            <button 
              class="relative flex items-center justify-center w-10 h-10 min-w-10 overflow-hidden text-slate-900 transition-all duration-200 ease-in-out border-2 rounded-[0.625rem] bg-slate-100 border-slate-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed md:w-11 md:h-11 md:min-w-11 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 hover:not(:disabled):-translate-y-px hover:not(:disabled):border-violet-500 hover:not(:disabled):text-violet-500 hover:not(:disabled):shadow-[0_4px_12px_rgba(139,92,246,0.2)] active:not(:disabled):translate-y-0 active:not(:disabled):shadow-[0_2px_6px_rgba(139,92,246,0.2)] md:hover:not(:disabled):-translate-y-0.5 dark:hover:not(:disabled):bg-slate-700 disabled:bg-white dark:disabled:bg-slate-900"
              :disabled="latestPage === latestTotalPages"
              @click="goToLatestPage(latestTotalPages)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="relative z-10">
                <polyline points="13 17 18 12 13 7"/>
                <polyline points="6 17 11 12 6 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Popular Section -->
    <section id="popular-section" class="py-12">
      <div class="container px-4 mx-auto">
        <div class="flex items-center justify-between mb-8 md:flex-col md:items-start md:gap-4">
          <h2 class="text-3xl font-bold text-slate-900 dark:text-slate-100 lg:text-2xl md:text-xl">Manhwa Populer</h2>
          <div class="px-4 py-2 text-sm font-medium border rounded-lg bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 md:w-full md:text-center">
            Halaman {{ popularPage }} dari {{ popularTotalPages }}
          </div>
        </div>
        
        <div v-if="loadingPopular" class="flex flex-col items-center justify-center min-h-[300px] gap-4 text-slate-600 dark:text-slate-400">
          <div class="w-12 h-12 border-4 rounded-full border-slate-200 dark:border-slate-700 border-t-violet-500 animate-spin"></div>
          <p>Memuat manhwa...</p>
        </div>
        
        <div v-else>
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] md:gap-5 lg:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] lg:gap-6">
            <ManhwaCard
              v-for="manhwa in displayedPopular"
              :key="manhwa.slug"
              :slug="manhwa.slug"
              :title="manhwa.title"
              :coverImage="manhwa.cover_url"
              :type="manhwa.type"
              :status="manhwa.status"
              :rating="manhwa.rating"
              :chapters="manhwa.total_chapters"
              :genre="manhwa.genres?.join(', ')"
              :latestChapters="manhwa.latestChapters"
              @click="goToDetail"
              @chapterClick="goToChapter"
            />
          </div>
          
          <!-- Pagination for Popular -->
          <div v-if="popularTotalPages > 1" class="flex flex-wrap items-center justify-center gap-1.5 pt-6 mt-8 border-t border-slate-200 dark:border-slate-700 md:gap-2 md:pt-8 md:mt-12">
            <button 
              class="relative flex items-center justify-center w-10 h-10 min-w-10 overflow-hidden text-slate-900 transition-all duration-200 ease-in-out border-2 rounded-[0.625rem] bg-slate-100 border-slate-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed md:w-11 md:h-11 md:min-w-11 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 hover:not(:disabled):-translate-y-px hover:not(:disabled):border-violet-500 hover:not(:disabled):text-violet-500 hover:not(:disabled):shadow-[0_4px_12px_rgba(139,92,246,0.2)] active:not(:disabled):translate-y-0 active:not(:disabled):shadow-[0_2px_6px_rgba(139,92,246,0.2)] md:hover:not(:disabled):-translate-y-0.5 dark:hover:not(:disabled):bg-slate-700 disabled:bg-white dark:disabled:bg-slate-900"
              :disabled="popularPage === 1"
              @click="goToPopularPage(1)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="relative z-10">
                <polyline points="11 17 6 12 11 7"/>
                <polyline points="18 17 13 12 18 7"/>
              </svg>
            </button>
            
            <button 
              class="relative flex items-center justify-center w-10 h-10 min-w-10 overflow-hidden text-slate-900 transition-all duration-200 ease-in-out border-2 rounded-[0.625rem] bg-slate-100 border-slate-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed md:w-11 md:h-11 md:min-w-11 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 hover:not(:disabled):-translate-y-px hover:not(:disabled):border-violet-500 hover:not(:disabled):text-violet-500 hover:not(:disabled):shadow-[0_4px_12px_rgba(139,92,246,0.2)] active:not(:disabled):translate-y-0 active:not(:disabled):shadow-[0_2px_6px_rgba(139,92,246,0.2)] md:hover:not(:disabled):-translate-y-0.5 dark:hover:not(:disabled):bg-slate-700 disabled:bg-white dark:disabled:bg-slate-900"
              :disabled="popularPage === 1"
              @click="goToPopularPage(popularPage - 1)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="relative z-10">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            
            <div class="flex flex-wrap justify-center gap-1.5 mx-1 md:gap-2 md:mx-2">
              <template v-for="(page, index) in visiblePopularPages" :key="index">
                <button
                  v-if="typeof page === 'number'"
                  class="relative flex items-center justify-center h-10 min-w-10 px-3.5 overflow-hidden text-sm font-semibold text-slate-900 transition-all duration-200 ease-in-out border-2 rounded-[0.625rem] bg-slate-100 border-slate-200 cursor-pointer md:h-11 md:min-w-11 md:text-[0.9375rem] dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  :class="page === popularPage 
                    ? 'bg-gradient-to-br from-violet-500 to-violet-700 border-violet-500 text-white shadow-[0_4px_16px_rgba(139,92,246,0.4)] scale-105 font-bold' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-700 hover:border-violet-500 hover:text-violet-500 hover:-translate-y-px md:hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(139,92,246,0.2)] active:translate-y-0'"
                  @click="goToPopularPage(page)"
                >
                  {{ page }}
                </button>
                <span v-else class="flex items-center justify-center h-10 min-w-10 px-2 text-slate-500 dark:text-slate-400">
                  {{ page }}
                </span>
              </template>
            </div>
            
            <button 
              class="relative flex items-center justify-center w-10 h-10 min-w-10 overflow-hidden text-slate-900 transition-all duration-200 ease-in-out border-2 rounded-[0.625rem] bg-slate-100 border-slate-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed md:w-11 md:h-11 md:min-w-11 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 hover:not(:disabled):-translate-y-px hover:not(:disabled):border-violet-500 hover:not(:disabled):text-violet-500 hover:not(:disabled):shadow-[0_4px_12px_rgba(139,92,246,0.2)] active:not(:disabled):translate-y-0 active:not(:disabled):shadow-[0_2px_6px_rgba(139,92,246,0.2)] md:hover:not(:disabled):-translate-y-0.5 dark:hover:not(:disabled):bg-slate-700 disabled:bg-white dark:disabled:bg-slate-900"
              :disabled="popularPage === popularTotalPages"
              @click="goToPopularPage(popularPage + 1)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="relative z-10">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
            
            <button 
              class="relative flex items-center justify-center w-10 h-10 min-w-10 overflow-hidden text-slate-900 transition-all duration-200 ease-in-out border-2 rounded-[0.625rem] bg-slate-100 border-slate-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed md:w-11 md:h-11 md:min-w-11 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 hover:not(:disabled):-translate-y-px hover:not(:disabled):border-violet-500 hover:not(:disabled):text-violet-500 hover:not(:disabled):shadow-[0_4px_12px_rgba(139,92,246,0.2)] active:not(:disabled):translate-y-0 active:not(:disabled):shadow-[0_2px_6px_rgba(139,92,246,0.2)] md:hover:not(:disabled):-translate-y-0.5 dark:hover:not(:disabled):bg-slate-700 disabled:bg-white dark:disabled:bg-slate-900"
              :disabled="popularPage === popularTotalPages"
              @click="goToPopularPage(popularTotalPages)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="relative z-10">
                <polyline points="13 17 18 12 13 7"/>
                <polyline points="6 17 11 12 6 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import HeroSection from '../components/HeroSection.vue'
import ManhwaCard from '../components/ManhwaCard.vue'
import { ManhwaService } from '../services/manhwaService'
import type { ManhwaCardData } from '../types/manhwa'

const router = useRouter()
const route = useRoute()

const loadingLatest = ref(true)
const loadingPopular = ref(true)
const latestManhwa = ref<ManhwaCardData[]>([])
const popularManhwa = ref<ManhwaCardData[]>([])

// Search state
const searchQuery = ref('')
const searchResults = ref<ManhwaCardData[]>([])
const searchLoading = ref(false)

// SSR + CSR Strategy
const initialLoadCount = 10 // Load only 10 items on SSR
const isClientHydrated = ref(false)
const isLoadingMore = ref(false)

// Pagination state
const latestPage = ref(1)
const popularPage = ref(1)
const itemsPerPage = 15

// Total pages
const latestTotalPages = computed(() => Math.ceil(latestManhwa.value.length / itemsPerPage))
const popularTotalPages = computed(() => Math.ceil(popularManhwa.value.length / itemsPerPage))

// Displayed items based on current page
const displayedLatest = computed(() => {
  const start = (latestPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  
  // On SSR or before hydration, only show initial items
  if (!isClientHydrated.value && latestPage.value === 1) {
    return latestManhwa.value.slice(0, Math.min(initialLoadCount, end))
  }
  
  return latestManhwa.value.slice(start, end)
})

const displayedPopular = computed(() => {
  const start = (popularPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  
  // On SSR or before hydration, only show initial items
  if (!isClientHydrated.value && popularPage.value === 1) {
    return popularManhwa.value.slice(0, Math.min(initialLoadCount, end))
  }
  
  return popularManhwa.value.slice(start, end)
})

// Smart pagination: show max 6 pages with ellipsis
const getVisiblePages = (currentPage: number, totalPages: number) => {
  const maxVisible = 6
  const pages: (number | string)[] = []
  
  if (totalPages <= maxVisible) {
    // Show all pages if total is less than max
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)
    
    let startPage = Math.max(2, currentPage - 1)
    let endPage = Math.min(totalPages - 1, currentPage + 1)
    
    // Adjust if near start
    if (currentPage <= 3) {
      endPage = Math.min(maxVisible - 1, totalPages - 1)
    }
    
    // Adjust if near end
    if (currentPage >= totalPages - 2) {
      startPage = Math.max(2, totalPages - (maxVisible - 2))
    }
    
    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pages.push('...')
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pages.push('...')
    }
    
    // Always show last page
    pages.push(totalPages)
  }
  
  return pages
}

const visibleLatestPages = computed(() => getVisiblePages(latestPage.value, latestTotalPages.value))
const visiblePopularPages = computed(() => getVisiblePages(popularPage.value, popularTotalPages.value))

const goToDetail = (slug: string) => {
  console.log(`🔗 Navigating to: ${slug}`)
  router.push({ name: 'detail', params: { slug } })
}

const goToChapter = (manhwaSlug: string, chapterSlug: string) => {
  console.log(`📖 Navigating to chapter: ${manhwaSlug}/${chapterSlug}`)
  router.push({ name: 'reader', params: { slug: manhwaSlug, chapterSlug } })
}

const mergeWithHydratedChapters = (
  list: ManhwaCardData[],
  hydratedMap: Map<string, ManhwaCardData>
) => {
  if (!hydratedMap.size) {
    return list
  }

  return list.map(card => hydratedMap.get(card.slug) ?? card)
}

// Progressive loading after initial render
const loadRemainingData = async () => {
  if (isLoadingMore.value) return
  
  isLoadingMore.value = true
  console.log('🔄 Loading remaining manhwa data (client-side)...')
  
  try {
    // If we already have all data, just hydrate chapters
    if (latestManhwa.value.length > initialLoadCount) {
      console.log('✅ All data already loaded, skipping')
      return
    }
    
    // Load all manhwa data on client-side
    const allManhwa = await ManhwaService.getManhwaCards(undefined, true)
    
    // Update recommendations (sorted by rating)
    latestManhwa.value = [...allManhwa].sort((a, b) => {
      const ratingA = parseFloat(a.rating || '0')
      const ratingB = parseFloat(b.rating || '0')
      return ratingB - ratingA
    })
    
    // Update popular (sorted by chapters)
    popularManhwa.value = [...allManhwa].sort((a, b) => {
      const chaptersA = a.chapters || a.total_chapters || 0
      const chaptersB = b.chapters || b.total_chapters || 0
      return chaptersB - chaptersA
    })
    
    console.log(`✅ Loaded ${latestManhwa.value.length} manhwa on client-side`)
    
    // Hydrate visible cards with chapters
    setTimeout(async () => {
      const prioritizedSlugs = new Set<string>([
        ...latestManhwa.value.slice(0, itemsPerPage).map(card => card.slug),
        ...popularManhwa.value.slice(0, itemsPerPage).map(card => card.slug)
      ])
      
      const prioritizedCards = allManhwa.filter(card => prioritizedSlugs.has(card.slug))
      const hydratedVisible = await ManhwaService.hydrateManhwaCardsWithChapters(prioritizedCards)
      const visibleMap = new Map(hydratedVisible.map(card => [card.slug, card]))
      
      latestManhwa.value = mergeWithHydratedChapters(latestManhwa.value, visibleMap)
      popularManhwa.value = mergeWithHydratedChapters(popularManhwa.value, visibleMap)
    }, 500)
  } catch (error) {
    console.error('❌ Error loading remaining data:', error)
  } finally {
    isLoadingMore.value = false
  }
}

// Pagination functions for Recommendations (Latest)
const goToLatestPage = (page: number) => {
  latestPage.value = page
  console.log(`📄 Recommendations page changed to: ${page}`)
  
  // Scroll to recommendation section
  nextTick(() => {
    const recommendationSection = document.getElementById('recommendation-section')
    if (recommendationSection) {
      const offset = 80 // navbar height
      const elementPosition = recommendationSection.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
      console.log(`✅ Scrolled to recommendation section`)
    } else {
      console.warn('⚠️ Recommendation section not found')
    }
  })
}

// Pagination functions for Popular
const goToPopularPage = (page: number) => {
  popularPage.value = page
  console.log(`📄 Popular page changed to: ${page}`)

  // Scroll to popular section
  nextTick(() => {
    const popularSection = document.getElementById('popular-section')
    if (popularSection) {
      const offset = 80 // navbar height
      const elementPosition = popularSection.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
      console.log(`✅ Scrolled to popular section`)
    } else {
      console.warn('⚠️ Popular section not found')
    }
  })
}

const hydratingSlugs = new Set<string>()

const ensureChaptersForCards = async (cards: ManhwaCardData[]) => {
  const targets = cards.filter(card => {
    if (!card.slug) return false
    if (card.latestChapters && card.latestChapters.length > 0) return false
    return !hydratingSlugs.has(card.slug)
  })

  if (!targets.length) {
    return
  }

  targets.forEach(card => hydratingSlugs.add(card.slug))

  try {
    const hydrated = await ManhwaService.hydrateManhwaCardsWithChapters(targets)
    const hydratedMap = new Map(hydrated.map(card => [card.slug, card]))

    latestManhwa.value = mergeWithHydratedChapters(latestManhwa.value, hydratedMap)
    popularManhwa.value = mergeWithHydratedChapters(popularManhwa.value, hydratedMap)
  } catch (error) {
    console.error('❌ Failed to hydrate chapters for current view:', error)
  } finally {
    targets.forEach(card => hydratingSlugs.delete(card.slug))
  }
}

watch(displayedLatest, (cards) => {
  ensureChaptersForCards(cards)
})

watch(displayedPopular, (cards) => {
  ensureChaptersForCards(cards)
})

// Search function
const handleSearch = async (query: string) => {
  console.log(`🔍 [HomePage] handleSearch called with query: "${query}"`)
  searchQuery.value = query
  
  if (!query.trim()) {
    console.log('📭 [HomePage] Empty query, clearing results')
    searchResults.value = []
    return
  }
  
  searchLoading.value = true
  console.log(`🔄 [HomePage] Starting search for: "${query}"`)
  
  try {
    const results = await ManhwaService.searchManhwa(query)
    searchResults.value = results
    console.log(`✅ [HomePage] Found ${results.length} results:`, results.map(r => r.title))
    
    if (results.length === 0) {
      console.warn(`⚠️ [HomePage] No results found for: "${query}"`)
    }
  } catch (error) {
    console.error('❌ [HomePage] Search error:', error)
    searchResults.value = []
  } finally {
    searchLoading.value = false
    console.log(`🏁 [HomePage] Search completed. Loading: ${searchLoading.value}, Results: ${searchResults.value.length}`)
  }
}

// Watch for route query changes (for search)
watch(
  () => route.query.search,
  (newSearch) => {
    console.log(`👀 [HomePage] Route query changed, search:`, newSearch)
    if (typeof newSearch === 'string') {
      handleSearch(newSearch)
    } else if (newSearch === undefined) {
      // Clear search when query is removed
      handleSearch('')
    }
  },
  { immediate: false } // Don't run on mount, onMounted will handle initial load
)

// Expose handleSearch for parent components
defineExpose({
  handleSearch
})

onMounted(async () => {
  try {
    console.log('🚀 SSR Strategy: Loading initial data...')
    
    // Check if there's a search query in URL
    if (route.query.search && typeof route.query.search === 'string') {
      console.log('🔍 Search query from URL:', route.query.search)
      await handleSearch(route.query.search)
    }
    
    // SSR: Load only initial items (10) for fast TTFB
    const allManhwa = await ManhwaService.getManhwaCards(undefined, true)
    
    // Recommendations: Sort by rating (highest first) - only take initial items
    const sortedByRating = [...allManhwa].sort((a, b) => {
      const ratingA = parseFloat(a.rating || '0')
      const ratingB = parseFloat(b.rating || '0')
      return ratingB - ratingA
    })
    
    // Popular: Sort by total chapters - only take initial items
    const sortedByChapters = [...allManhwa].sort((a, b) => {
      const chaptersA = a.chapters || a.total_chapters || 0
      const chaptersB = b.chapters || b.total_chapters || 0
      return chaptersB - chaptersA
    })
    
    // Set only initial items for fast render
    latestManhwa.value = sortedByRating.slice(0, initialLoadCount)
    popularManhwa.value = sortedByChapters.slice(0, initialLoadCount)
    
    console.log(`✅ SSR: Loaded ${initialLoadCount} items for fast TTFB`)
    console.log(`📊 Initial render complete`)
    
    loadingLatest.value = false
    loadingPopular.value = false
    
    // Mark as hydrated and load remaining data
    isClientHydrated.value = true
    
    // CSR: Load remaining data after initial render (lazy loading)
    setTimeout(() => {
      console.log('🔄 CSR: Starting lazy load of remaining data...')
      loadRemainingData()
    }, 500)
    
  } catch (error) {
    console.error('❌ Error loading manhwa:', error)
    loadingLatest.value = false
    loadingPopular.value = false
  }
})
</script>
