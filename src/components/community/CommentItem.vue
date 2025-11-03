<template>
  <div class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
    <!-- Comment header -->
    <div class="flex items-start gap-3 mb-3">
      <img
        v-if="comment.profile?.avatar_url"
        :src="comment.profile.avatar_url"
        :alt="comment.profile.username || 'User'"
        class="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />
      <div v-else class="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold flex-shrink-0">
        {{ ((comment.profile?.username || 'U')[0] || 'U').toUpperCase() }}
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <span class="font-medium text-slate-900 dark:text-slate-100">
            {{ comment.profile?.username || 'Anonymous' }}
          </span>
          <span v-if="comment.is_spoiler" class="px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded">
            SPOILER
          </span>
          <span class="text-xs text-slate-500 dark:text-slate-400">
            {{ formatDate(comment.created_at) }}
          </span>
        </div>

        <!-- Comment content -->
        <div v-if="comment.is_spoiler && !showSpoiler" class="mb-2">
          <button
            @click="showSpoiler = true"
            class="text-sm text-violet-500 hover:text-violet-600 dark:text-violet-400 dark:hover:text-violet-300"
          >
            Klik untuk melihat spoiler
          </button>
        </div>
        <p v-else class="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap mb-2">
          {{ comment.content }}
        </p>

        <!-- Reactions -->
        <div class="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
          <button
            v-for="(count, type) in comment.reaction_counts"
            :key="String(type)"
            v-show="String(type) !== 'total'"
            @click="$emit('react', comment.id, String(type))"
            :class="[
              'flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors touch-manipulation',
              comment.user_reaction === String(type)
                ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
                : 'bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-500 active:scale-95'
            ]"
          >
            <span class="text-sm sm:text-base">{{ getReactionEmoji(String(type)) }}</span>
            <span v-if="count > 0" class="min-w-[1ch]">{{ count }}</span>
          </button>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-4 text-xs">
          <button
            @click="$emit('reply', comment.id)"
            class="text-slate-600 dark:text-slate-400 hover:text-violet-500 dark:hover:text-violet-400 font-medium transition-colors"
          >
            Balas
          </button>
          
          <button
            v-if="currentUserId === comment.user_id"
            @click="$emit('edit', comment.id, comment.content)"
            class="text-slate-600 dark:text-slate-400 hover:text-violet-500 dark:hover:text-violet-400 font-medium transition-colors"
          >
            Edit
          </button>
          
          <button
            v-if="currentUserId === comment.user_id"
            @click="$emit('delete', comment.id)"
            class="text-slate-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 font-medium transition-colors"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>

    <!-- Replies -->
    <div v-if="comment.replies && comment.replies.length > 0" class="ml-12 mt-4 space-y-4">
      <CommentItem
        v-for="reply in comment.replies"
        :key="reply.id"
        :comment="reply as CommentWithProfile"
        :current-user-id="currentUserId"
        @reply="(id) => $emit('reply', id)"
        @edit="(id, content) => $emit('edit', id, content)"
        @delete="(id) => $emit('delete', id)"
        @react="(id, type) => $emit('react', id, type)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { CommentWithProfile } from '../../types/community'

interface Props {
  comment: CommentWithProfile
  currentUserId?: string
}

defineProps<Props>()

defineEmits<{
  reply: [commentId: string]
  edit: [commentId: string, content: string]
  delete: [commentId: string]
  react: [commentId: string, reactionType: string]
}>()

const showSpoiler = ref(false)

const getReactionEmoji = (type: string) => {
  const emojis: Record<string, string> = {
    like: '👍',
    love: '❤️',
    funny: '😂',
    sad: '😢',
    angry: '😡'
  }
  return emojis[type] || '👍'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'Baru saja'
  if (minutes < 60) return `${minutes} menit lalu`
  if (hours < 24) return `${hours} jam lalu`
  if (days < 7) return `${days} hari lalu`
  return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>
