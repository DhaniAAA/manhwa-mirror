<template>
  <div class="min-h-screen bg-white dark:bg-slate-900 pt-24 pb-12">
    <div class="container mx-auto px-4 max-w-7xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            📚 Riwayat Baca
          </h1>
          <p class="text-slate-600 dark:text-slate-400">
            {{ history.length }} manhwa dalam riwayat
          </p>
        </div>
        
        <button
          v-if="history.length > 0"
          @click="showClearConfirm = true"
          class="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          Hapus Semua
        </button>
      </div>

      <!-- Sync Settings -->
      <div class="mb-8">
        <HistorySyncSettings 
          @requestAuth="handleAuthRequest"
          @synced="handleSynced"
        />
      </div>

      <!-- Continue Reading Section -->
      <div v-if="continueReading.length > 0" class="mb-12">
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">
          🔖 Lanjutkan Membaca
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <HistoryCard
            v-for="item in continueReading"
            :key="item.slug"
            :item="item"
            @click="goToChapter(item)"
            @remove="removeItem(item.slug)"
          />
        </div>
      </div>

      <!-- All History -->
      <div v-if="history.length > 0">
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">
          📖 Semua Riwayat
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <HistoryCard
            v-for="item in history"
            :key="item.slug"
            :item="item"
            @click="goToChapter(item)"
            @remove="removeItem(item.slug)"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mb-4 opacity-50">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
        <p class="text-lg font-medium mb-2">Belum ada riwayat baca</p>
        <p class="text-sm">Mulai baca manhwa untuk melihat riwayat di sini</p>
      </div>

      <!-- Clear Confirmation Modal -->
      <Teleport to="body">
        <Transition
          enter-active-class="transition-opacity duration-200"
          leave-active-class="transition-opacity duration-150"
          enter-from-class="opacity-0"
          leave-to-class="opacity-0"
        >
          <div
            v-if="showClearConfirm"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            @click.self="showClearConfirm = false"
          >
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl">
              <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Hapus Semua Riwayat?
              </h3>
              <p class="text-slate-600 dark:text-slate-400 mb-6">
                Tindakan ini tidak dapat dibatalkan. Semua riwayat baca akan dihapus.
              </p>
              <div class="flex gap-3">
                <button
                  @click="showClearConfirm = false"
                  class="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Batal
                </button>
                <button
                  @click="clearAllHistory"
                  class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Hapus Semua
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ReadingHistoryService } from '../services/readingHistoryService'
import type { ReadingHistoryItem } from '../services/readingHistoryService'
import HistoryCard from '../components/history/HistoryCard.vue'
import HistorySyncSettings from '../components/history/HistorySyncSettings.vue'

const router = useRouter()
const history = ref<ReadingHistoryItem[]>([])
const showClearConfirm = ref(false)

const continueReading = computed(() => {
  return history.value.filter(h => h.progress < 100).slice(0, 10)
})

const loadHistory = () => {
  history.value = ReadingHistoryService.getHistory()
  console.log('📚 History loaded:', history.value.length, 'items')
  if (history.value.length > 0) {
    console.log('Latest:', history.value[0])
  }
}

const removeItem = (slug: string) => {
  ReadingHistoryService.removeFromHistory(slug)
  loadHistory()
}

const clearAllHistory = () => {
  ReadingHistoryService.clearHistory()
  loadHistory()
  showClearConfirm.value = false
}

const goToChapter = (item: ReadingHistoryItem) => {
  router.push({
    name: 'reader',
    params: {
      slug: item.slug,
      chapterSlug: item.lastChapterSlug
    }
  })
}

const handleAuthRequest = () => {
  // Emit event to parent or redirect to login
  console.log('Auth requested')
  // You can add auth modal trigger here
}

const handleSynced = () => {
  // Reload history after sync
  loadHistory()
}

onMounted(async () => {
  // Sync with Supabase first if enabled
  if (ReadingHistoryService.isSyncEnabled()) {
    console.log('🔄 Syncing history from Supabase...')
    await ReadingHistoryService.syncHistory()
  }
  
  loadHistory()
})
</script>
