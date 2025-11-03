<template>
  <div 
    @click="$emit('click')"
    class="group relative bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500 transition-all duration-300 cursor-pointer hover:shadow-xl"
  >
    <!-- Cover Image -->
    <div class="relative aspect-[3/4] bg-slate-100 dark:bg-slate-700 overflow-hidden">
      <img
        v-if="item.coverUrl"
        :src="item.coverUrl"
        :alt="item.title"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
      
      <!-- Progress Bar -->
      <div class="absolute bottom-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-600">
        <div
          class="h-full bg-violet-500 transition-all duration-300"
          :style="{ width: `${item.progress}%` }"
        ></div>
      </div>

      <!-- Remove Button -->
      <button
        @click.stop="$emit('remove')"
        class="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>

    <!-- Info -->
    <div class="p-3">
      <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-1 line-clamp-2 leading-tight">
        {{ item.title }}
      </h3>
      
      <p class="text-xs text-slate-600 dark:text-slate-400 mb-2 line-clamp-1">
        {{ item.lastChapterTitle }}
      </p>

      <div class="flex items-center justify-between text-xs">
        <span class="text-violet-600 dark:text-violet-400 font-medium">
          {{ item.progress }}% selesai
        </span>
        <span class="text-slate-500 dark:text-slate-500">
          {{ formatDate(item.lastReadAt) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ReadingHistoryItem } from '../services/readingHistoryService'

defineProps<{
  item: ReadingHistoryItem
}>()

defineEmits<{
  click: []
  remove: []
}>()

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 60) return `${minutes}m lalu`
  if (hours < 24) return `${hours}j lalu`
  if (days < 7) return `${days}h lalu`
  
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}
</script>
