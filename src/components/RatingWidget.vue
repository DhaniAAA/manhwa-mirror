<template>
  <div class="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">Rating & Review</h3>
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="text-amber-400">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span class="text-xl font-bold text-slate-900 dark:text-slate-100">
            {{ stats.average_rating.toFixed(1) }}
          </span>
        </div>
        <span class="text-sm text-slate-600 dark:text-slate-400">
          ({{ stats.rating_count }} rating)
        </span>
      </div>
    </div>

    <!-- User rating form -->
    <div v-if="isAuthenticated" class="mb-6">
      <p class="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">
        {{ userRating ? 'Rating Anda' : 'Beri Rating' }}
      </p>
      
      <!-- Star rating -->
      <div class="flex items-center gap-2 mb-3">
        <button
          v-for="star in 5"
          :key="star"
          @click="setRating(star)"
          class="transition-transform hover:scale-110"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            :fill="star <= selectedRating ? 'currentColor' : 'none'"
            :stroke="star <= selectedRating ? 'currentColor' : 'currentColor'"
            stroke-width="2"
            :class="star <= selectedRating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
        <span class="ml-2 text-sm font-medium text-slate-600 dark:text-slate-400">
          {{ selectedRating }}/5
        </span>
      </div>

      <!-- Review textarea -->
      <textarea
        v-model="reviewText"
        placeholder="Tulis review Anda (opsional)..."
        rows="3"
        maxlength="1000"
        class="w-full px-4 py-2 mb-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all resize-none"
      ></textarea>

      <!-- Action buttons -->
      <div class="flex gap-2">
        <button
          @click="submitRating"
          :disabled="selectedRating === 0 || submitting"
          class="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ submitting ? 'Menyimpan...' : (userRating ? 'Update Rating' : 'Kirim Rating') }}
        </button>
        <button
          v-if="userRating"
          @click="removeRating"
          :disabled="submitting"
          class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Hapus
        </button>
      </div>
    </div>

    <!-- Login prompt -->
    <div v-else class="mb-6 p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg">
      <p class="text-sm text-violet-900 dark:text-violet-200">
        <button @click="$emit('login-required')" class="font-medium underline hover:no-underline">
          Masuk
        </button>
        untuk memberikan rating dan review
      </p>
    </div>

    <!-- Recent ratings -->
    <div v-if="ratings.length > 0">
      <h4 class="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Review Terbaru</h4>
      <div class="space-y-4 max-h-96 overflow-y-auto">
        <div
          v-for="rating in ratings.slice(0, 5)"
          :key="rating.id"
          class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
        >
          <div class="flex items-start justify-between mb-2">
            <div class="flex items-center gap-2">
              <img
                v-if="rating.profile?.avatar_url"
                :src="rating.profile.avatar_url"
                :alt="rating.profile.username || 'User'"
                class="w-8 h-8 rounded-full object-cover"
              />
              <div v-else class="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white text-sm font-bold">
                {{ ((rating.profile?.username || 'U')[0] || 'U').toUpperCase() }}
              </div>
              <div>
                <p class="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {{ rating.profile?.username || 'Anonymous' }}
                </p>
                <div class="flex items-center gap-1">
                  <svg
                    v-for="star in 5"
                    :key="star"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    :fill="star <= rating.rating ? 'currentColor' : 'none'"
                    stroke="currentColor"
                    stroke-width="2"
                    :class="star <= rating.rating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
              </div>
            </div>
            <span class="text-xs text-slate-500 dark:text-slate-400">
              {{ formatDate(rating.created_at) }}
            </span>
          </div>
          <p v-if="rating.review" class="text-sm text-slate-700 dark:text-slate-300">
            {{ rating.review }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useCommunity } from '../composables/useCommunity'
import type { ManhwaStats } from '../types/community'

interface Props {
  manhwaSlug: string
}

const props = defineProps<Props>()

defineEmits<{
  'login-required': []
}>()

const { isAuthenticated, currentUser } = useAuth()
const { ratings, loadRatings, getUserRating, saveRating, deleteRating } = useCommunity()

const selectedRating = ref(0)
const reviewText = ref('')
const userRating = ref<any>(null)
const submitting = ref(false)
const stats = ref<ManhwaStats>({
  average_rating: 0,
  rating_count: 0,
  comment_count: 0
})

const setRating = (star: number) => {
  selectedRating.value = star
}

const submitRating = async () => {
  if (!currentUser.value || selectedRating.value === 0) return

  submitting.value = true
  try {
    await saveRating(currentUser.value.id, props.manhwaSlug, {
      rating: selectedRating.value,
      review: reviewText.value || undefined
    })
    await loadUserRating()
    await loadData()
  } catch (error) {
    console.error('Error submitting rating:', error)
  } finally {
    submitting.value = false
  }
}

const removeRating = async () => {
  if (!currentUser.value) return

  submitting.value = true
  try {
    await deleteRating(currentUser.value.id, props.manhwaSlug)
    selectedRating.value = 0
    reviewText.value = ''
    userRating.value = null
    await loadData()
  } catch (error) {
    console.error('Error removing rating:', error)
  } finally {
    submitting.value = false
  }
}

const loadUserRating = async () => {
  if (!currentUser.value) return

  const rating = await getUserRating(currentUser.value.id, props.manhwaSlug)
  if (rating) {
    userRating.value = rating
    selectedRating.value = rating.rating
    reviewText.value = rating.review || ''
  }
}

const loadData = async () => {
  await loadRatings(props.manhwaSlug)
  
  // Calculate stats from loaded ratings
  if (ratings.value.length > 0) {
    const sum = ratings.value.reduce((acc, r) => acc + r.rating, 0)
    stats.value = {
      average_rating: sum / ratings.value.length,
      rating_count: ratings.value.length,
      comment_count: 0
    }
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Hari ini'
  if (days === 1) return 'Kemarin'
  if (days < 7) return `${days} hari lalu`
  if (days < 30) return `${Math.floor(days / 7)} minggu lalu`
  return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(() => {
  loadData()
  if (isAuthenticated.value) {
    loadUserRating()
  }
})

watch(() => isAuthenticated.value, (newVal) => {
  if (newVal) {
    loadUserRating()
  } else {
    selectedRating.value = 0
    reviewText.value = ''
    userRating.value = null
  }
})
</script>
