<template>
  <div class="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">
        Komentar ({{ comments.length }})
      </h3>
    </div>

    <!-- Comment form -->
    <div v-if="isAuthenticated" class="mb-6">
      <div class="flex gap-3">
        <img
          v-if="currentProfile?.avatar_url"
          :src="currentProfile.avatar_url"
          alt="Avatar"
          class="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <div v-else class="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold flex-shrink-0">
          {{ ((currentProfile?.username || 'U')[0] || 'U').toUpperCase() }}
        </div>
        
        <div class="flex-1">
          <textarea
            v-model="newComment"
            placeholder="Tulis komentar..."
            rows="3"
            maxlength="2000"
            class="w-full px-4 py-2 mb-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all resize-none"
          ></textarea>
          
          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                v-model="isSpoiler"
                type="checkbox"
                class="w-4 h-4 text-violet-500 border-slate-300 rounded focus:ring-violet-500"
              />
              <span>Spoiler</span>
            </label>
            
            <button
              @click="submitComment"
              :disabled="!newComment.trim() || submitting"
              class="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ submitting ? 'Mengirim...' : 'Kirim' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Login prompt -->
    <div v-else class="mb-6 p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg">
      <p class="text-sm text-violet-900 dark:text-violet-200">
        <button @click="$emit('login-required')" class="font-medium underline hover:no-underline">
          Masuk
        </button>
        untuk berkomentar
      </p>
    </div>

    <!-- Comments list -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="w-8 h-8 border-4 border-slate-200 dark:border-slate-700 border-t-violet-500 rounded-full animate-spin"></div>
    </div>

    <div v-else-if="comments.length === 0" class="py-8 text-center text-slate-500 dark:text-slate-400">
      Belum ada komentar. Jadilah yang pertama!
    </div>

    <div v-else class="space-y-4">
      <CommentItem
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :current-user-id="currentUser?.id"
        @reply="handleReply"
        @edit="handleEdit"
        @delete="handleDelete"
        @react="handleReact"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { useCommunity } from '../../composables/useCommunity'
import CommentItem from './CommentItem.vue'

interface Props {
  manhwaSlug: string
  chapterSlug?: string | null
}

const props = defineProps<Props>()

defineEmits<{
  'login-required': []
}>()

const { isAuthenticated, currentUser, currentProfile } = useAuth()
const { comments, loading, loadComments, createComment, deleteComment, toggleReaction } = useCommunity()

const newComment = ref('')
const isSpoiler = ref(false)
const submitting = ref(false)
const replyingTo = ref<string | null>(null)

const submitComment = async () => {
  if (!currentUser.value || !newComment.value.trim()) return

  submitting.value = true
  try {
    await createComment(
      currentUser.value.id,
      props.manhwaSlug,
      {
        content: newComment.value.trim(),
        is_spoiler: isSpoiler.value,
        parent_id: replyingTo.value
      },
      props.chapterSlug
    )
    
    newComment.value = ''
    isSpoiler.value = false
    replyingTo.value = null
  } catch (error) {
    console.error('Error submitting comment:', error)
  } finally {
    submitting.value = false
  }
}

const handleReply = (commentId: string) => {
  replyingTo.value = commentId
  // Scroll to comment form
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleEdit = async (commentId: string, newContent: string) => {
  // TODO: Implement edit functionality
  console.log('Edit comment:', commentId, newContent)
}

const handleDelete = async (commentId: string) => {
  if (!confirm('Hapus komentar ini?')) return
  
  await deleteComment(commentId, props.manhwaSlug, props.chapterSlug)
}

const handleReact = async (commentId: string, reactionType: string) => {
  if (!currentUser.value) {
    // Emit login required
    return
  }
  
  await toggleReaction(currentUser.value.id, commentId, reactionType, props.manhwaSlug, props.chapterSlug)
}

onMounted(() => {
  loadComments(props.manhwaSlug, props.chapterSlug)
})

watch(() => [props.manhwaSlug, props.chapterSlug], () => {
  loadComments(props.manhwaSlug, props.chapterSlug)
})
</script>
