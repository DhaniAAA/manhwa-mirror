<template>
  <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-violet-600 dark:text-violet-400">
            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">
            Sync Across Devices
          </h3>
          <p class="text-sm text-slate-600 dark:text-slate-400">
            {{ isAuthenticated ? 'Sinkronkan riwayat baca ke semua perangkat' : 'Login untuk mengaktifkan sync' }}
          </p>
        </div>
      </div>
      
      <button
        v-if="isAuthenticated"
        @click="toggleSync"
        :disabled="syncing"
        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
        :class="syncEnabled ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-600'"
      >
        <span
          class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
          :class="syncEnabled ? 'translate-x-6' : 'translate-x-1'"
        />
      </button>
    </div>

    <!-- Status -->
    <div v-if="isAuthenticated && syncEnabled" class="space-y-3">
      <!-- Last Sync -->
      <div class="flex items-center justify-between text-sm">
        <span class="text-slate-600 dark:text-slate-400">Status</span>
        <span class="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Aktif
        </span>
      </div>

      <!-- Sync Now Button -->
      <button
        @click="syncNow"
        :disabled="syncing"
        class="w-full px-4 py-2 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-lg font-medium hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="syncing" class="flex items-center justify-center gap-2">
          <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
          </svg>
          Syncing...
        </span>
        <span v-else class="flex items-center justify-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
          </svg>
          Sync Sekarang
        </span>
      </button>

      <!-- Info -->
      <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p class="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
          💡 Riwayat baca akan otomatis tersinkronisasi saat Anda membaca chapter baru atau membuka halaman riwayat.
        </p>
      </div>
    </div>

    <!-- Not Authenticated -->
    <div v-else-if="!isAuthenticated" class="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
      <p class="text-sm text-amber-800 dark:text-amber-300 mb-3">
        ⚠️ Anda harus login untuk menggunakan fitur sync across devices.
      </p>
      <button
        @click="$emit('requestAuth')"
        class="w-full px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors"
      >
        Login Sekarang
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ReadingHistoryService } from '../services/readingHistoryService'
import { useAuth } from '../composables/useAuth'

const emit = defineEmits<{
  requestAuth: []
  synced: []
}>()

const { isAuthenticated } = useAuth()
const syncEnabled = ref(false)
const syncing = ref(false)

const loadSyncStatus = () => {
  syncEnabled.value = ReadingHistoryService.isSyncEnabled()
}

const toggleSync = () => {
  syncEnabled.value = !syncEnabled.value
  ReadingHistoryService.setSyncEnabled(syncEnabled.value)
  
  if (syncEnabled.value) {
    // Trigger initial sync
    syncNow()
  }
}

const syncNow = async () => {
  if (!isAuthenticated.value) return
  
  syncing.value = true
  try {
    await ReadingHistoryService.syncHistory()
    emit('synced')
  } catch (error) {
    console.error('Sync failed:', error)
  } finally {
    syncing.value = false
  }
}

onMounted(() => {
  loadSyncStatus()
})
</script>
