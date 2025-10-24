<template>
  <div class="lazy-image-wrapper" ref="imageWrapper">
    <img 
      v-if="isLoaded"
      :src="src" 
      :alt="alt"
      :class="imageClass"
      :loading="priority ? 'eager' : 'lazy'"
      :fetchpriority="priority ? 'high' : 'auto'"
      :decoding="priority ? 'sync' : 'async'"
      @error="handleError"
      @load="handleLoad"
    />
    <div v-else-if="!error" class="lazy-placeholder">
      <div class="lazy-spinner"></div>
    </div>
    <div v-else class="lazy-error">
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
}

const handleError = (event: Event) => {
  error.value = true
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

<style scoped>
.lazy-image-wrapper {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.lazy-image-wrapper img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  animation: fadeIn 0.3s ease-in;
}

.lazy-placeholder,
.lazy-error {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-elevated));
}

.lazy-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(139, 92, 246, 0.2);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.lazy-error {
  color: var(--text-muted);
  opacity: 0.5;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
