<template>
  <div class="absolute inset-0 h-full w-full" ref="imageWrapper">
    <img
      v-if="isLoaded"
      :src="src"
      :alt="alt"
      :class="['absolute inset-0 h-full w-full object-cover object-center animate-fade', imageClass]"
      :loading="priority ? 'eager' : 'lazy'"
      :fetchpriority="priority ? 'high' : 'auto'"
      :decoding="priority ? 'sync' : 'async'"
      @error="handleError"
      @load="handleLoad"
    />
    <div v-else-if="!error" class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-background-tertiary to-background-elevated">
      <div class="h-8 w-8 animate-spin rounded-full border-[3px] border-[rgba(139,92,246,0.2)] border-t-accent-primary"></div>
    </div>
    <div v-else class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-background-tertiary to-background-elevated text-text-muted opacity-60">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  src: string
  alt: string
  imageClass?: string
  priority?: boolean  // For LCP optimization - load immediately without lazy loading
}>()

const emit = defineEmits<{
  error: [error: Event]
  load: []
}>()

const imageWrapper = ref<HTMLElement | null>(null)
const isLoaded = ref(false)
const error = ref(false)
let observer: IntersectionObserver | null = null

const loadImage = () => {
  if (isLoaded.value || error.value) return
  isLoaded.value = true
  error.value = false // Reset error state on retry
}

const handleError = (event: Event) => {
  console.warn('Image load failed, retrying...', props.src)
  error.value = true
  isLoaded.value = false
  
  // Retry with timeout
  setTimeout(() => {
    if (imageWrapper.value) {
      const img = new Image()
      img.onload = () => {
        error.value = false
        isLoaded.value = true
        emit('load')
      }
      img.onerror = () => {
        // Final error - show placeholder
        error.value = true
        isLoaded.value = false
        emit('error', event)
      }
      img.src = props.src + '?retry=' + Date.now() // Cache busting
    }
  }, 1000)
  
  emit('error', event)
}

const handleLoad = () => {
  emit('load')
}

onMounted(() => {
  if (!imageWrapper.value) return

  // If priority image, load immediately for better LCP
  if (props.priority) {
    loadImage()
    return
  }

  // Create Intersection Observer for non-priority images
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadImage()
          // Stop observing once loaded
          if (observer && imageWrapper.value) {
            observer.unobserve(imageWrapper.value)
          }
        }
      })
    },
    {
      rootMargin: '50px', // Start loading 50px before entering viewport
      threshold: 0.01
    }
  )

  observer.observe(imageWrapper.value)
})

onUnmounted(() => {
  if (observer && imageWrapper.value) {
    observer.unobserve(imageWrapper.value)
    observer.disconnect()
  }
})
</script>
