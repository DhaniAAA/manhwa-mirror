import { ref } from 'vue'
import { CommunityService } from '../services/communityService'
import type {
  CommentWithProfile,
  RatingWithProfile,
  CommentFormData,
  RatingFormData,
  ManhwaStats,
  ChapterStats
} from '../types/community'

export function useCommunity() {
  const comments = ref<CommentWithProfile[]>([])
  const ratings = ref<RatingWithProfile[]>([])
  const manhwaStats = ref<ManhwaStats>({
    average_rating: 0,
    rating_count: 0,
    comment_count: 0
  })
  const chapterStats = ref<ChapterStats>({
    comment_count: 0
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ==================== COMMENT METHODS ====================

  const loadComments = async (manhwaSlug: string, chapterSlug?: string | null) => {
    loading.value = true
    error.value = null
    try {
      comments.value = await CommunityService.getComments(manhwaSlug, chapterSlug)
    } catch (err) {
      error.value = 'Failed to load comments'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const createComment = async (
    userId: string,
    manhwaSlug: string,
    formData: CommentFormData,
    chapterSlug?: string | null
  ) => {
    try {
      const comment = await CommunityService.createComment(userId, manhwaSlug, formData, chapterSlug)
      if (comment) {
        // Reload comments to get updated list
        await loadComments(manhwaSlug, chapterSlug)
      }
      return comment
    } catch (err) {
      error.value = 'Failed to create comment'
      console.error(err)
      return null
    }
  }

  const updateComment = async (commentId: string, content: string, manhwaSlug: string, chapterSlug?: string | null) => {
    try {
      const updated = await CommunityService.updateComment(commentId, content)
      if (updated) {
        await loadComments(manhwaSlug, chapterSlug)
      }
      return updated
    } catch (err) {
      error.value = 'Failed to update comment'
      console.error(err)
      return null
    }
  }

  const deleteComment = async (commentId: string, manhwaSlug: string, chapterSlug?: string | null) => {
    try {
      const success = await CommunityService.deleteComment(commentId)
      if (success) {
        await loadComments(manhwaSlug, chapterSlug)
      }
      return success
    } catch (err) {
      error.value = 'Failed to delete comment'
      console.error(err)
      return false
    }
  }

  const toggleReaction = async (
    userId: string,
    commentId: string,
    reactionType: string,
    manhwaSlug: string,
    chapterSlug?: string | null
  ) => {
    try {
      const success = await CommunityService.toggleReaction(userId, commentId, reactionType)
      if (success) {
        // Reload comments to get updated reactions
        await loadComments(manhwaSlug, chapterSlug)
      }
      return success
    } catch (err) {
      error.value = 'Failed to toggle reaction'
      console.error(err)
      return false
    }
  }

  // ==================== RATING METHODS ====================

  const loadRatings = async (manhwaSlug: string) => {
    loading.value = true
    error.value = null
    try {
      ratings.value = await CommunityService.getRatings(manhwaSlug)
    } catch (err) {
      error.value = 'Failed to load ratings'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const getUserRating = async (userId: string, manhwaSlug: string) => {
    try {
      return await CommunityService.getUserRating(userId, manhwaSlug)
    } catch (err) {
      error.value = 'Failed to load user rating'
      console.error(err)
      return null
    }
  }

  const saveRating = async (userId: string, manhwaSlug: string, formData: RatingFormData) => {
    try {
      const rating = await CommunityService.upsertRating(userId, manhwaSlug, formData)
      if (rating) {
        // Reload ratings and stats
        await loadRatings(manhwaSlug)
        await loadManhwaStats(manhwaSlug)
      }
      return rating
    } catch (err) {
      error.value = 'Failed to save rating'
      console.error(err)
      return null
    }
  }

  const deleteRating = async (userId: string, manhwaSlug: string) => {
    try {
      const success = await CommunityService.deleteRating(userId, manhwaSlug)
      if (success) {
        await loadRatings(manhwaSlug)
        await loadManhwaStats(manhwaSlug)
      }
      return success
    } catch (err) {
      error.value = 'Failed to delete rating'
      console.error(err)
      return false
    }
  }

  // ==================== STATS METHODS ====================

  const loadManhwaStats = async (manhwaSlug: string) => {
    try {
      manhwaStats.value = await CommunityService.getManhwaStats(manhwaSlug)
    } catch (err) {
      error.value = 'Failed to load stats'
      console.error(err)
    }
  }

  const loadChapterStats = async (manhwaSlug: string, chapterSlug: string) => {
    try {
      chapterStats.value = await CommunityService.getChapterStats(manhwaSlug, chapterSlug)
    } catch (err) {
      error.value = 'Failed to load chapter stats'
      console.error(err)
    }
  }

  return {
    comments,
    ratings,
    manhwaStats,
    chapterStats,
    loading,
    error,
    loadComments,
    createComment,
    updateComment,
    deleteComment,
    toggleReaction,
    loadRatings,
    getUserRating,
    saveRating,
    deleteRating,
    loadManhwaStats,
    loadChapterStats
  }
}
