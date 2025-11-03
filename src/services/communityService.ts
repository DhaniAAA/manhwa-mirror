import { supabase } from '../lib/supabase'
import type {
  Profile,
  Comment,
  Rating,
  CommentFormData,
  RatingFormData,
  ProfileUpdateData,
  ManhwaStats,
  ChapterStats,
  CommentWithProfile,
  RatingWithProfile,
  ReactionCounts
} from '../types/community'

/**
 * Service for community features: profiles, comments, ratings, reactions
 */
export class CommunityService {
  // ==================== PROFILE METHODS ====================

  /**
   * Get user profile by ID
   */
  static async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('❌ Error fetching profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('❌ Exception fetching profile:', error)
      return null
    }
  }

  /**
   * Get profile by username
   */
  static async getProfileByUsername(username: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (error) {
        console.error('❌ Error fetching profile by username:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('❌ Exception fetching profile by username:', error)
      return null
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: ProfileUpdateData): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating profile:', error)
        return null
      }

      console.log('✅ Profile updated')
      return data
    } catch (error) {
      console.error('❌ Exception updating profile:', error)
      return null
    }
  }

  /**
   * Upload avatar image
   */
  static async uploadAvatar(userId: string, file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) {
        console.error('❌ Error uploading avatar:', uploadError)
        return null
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      console.log('✅ Avatar uploaded')
      return data.publicUrl
    } catch (error) {
      console.error('❌ Exception uploading avatar:', error)
      return null
    }
  }

  // ==================== COMMENT METHODS ====================

  /**
   * Get comments for a manhwa or chapter
   */
  static async getComments(
    manhwaSlug: string,
    chapterSlug?: string | null
  ): Promise<CommentWithProfile[]> {
    try {
      let query = supabase
        .from('comments')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('manhwa_slug', manhwaSlug)
        .is('parent_id', null)
        .order('created_at', { ascending: false })

      if (chapterSlug) {
        query = query.eq('chapter_slug', chapterSlug)
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ Error fetching comments:', error)
        return []
      }

      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        (data || []).map(async (comment) => {
          const replies = await this.getCommentReplies(comment.id)
          const reactionCounts = await this.getReactionCounts(comment.id)
          return {
            ...comment,
            replies,
            reaction_counts: reactionCounts
          }
        })
      )

      return commentsWithReplies as CommentWithProfile[]
    } catch (error) {
      console.error('❌ Exception fetching comments:', error)
      return []
    }
  }

  /**
   * Get replies for a comment
   */
  static async getCommentReplies(parentId: string): Promise<CommentWithProfile[]> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('parent_id', parentId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('❌ Error fetching replies:', error)
        return []
      }

      return (data || []) as CommentWithProfile[]
    } catch (error) {
      console.error('❌ Exception fetching replies:', error)
      return []
    }
  }

  /**
   * Create a new comment
   */
  static async createComment(
    userId: string,
    manhwaSlug: string,
    formData: CommentFormData,
    chapterSlug?: string | null
  ): Promise<Comment | null> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          user_id: userId,
          manhwa_slug: manhwaSlug,
          chapter_slug: chapterSlug || null,
          content: formData.content,
          is_spoiler: formData.is_spoiler,
          parent_id: formData.parent_id || null
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating comment:', error)
        return null
      }

      console.log('✅ Comment created')
      return data
    } catch (error) {
      console.error('❌ Exception creating comment:', error)
      return null
    }
  }

  /**
   * Update a comment
   */
  static async updateComment(commentId: string, content: string): Promise<Comment | null> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .update({
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating comment:', error)
        return null
      }

      console.log('✅ Comment updated')
      return data
    } catch (error) {
      console.error('❌ Exception updating comment:', error)
      return null
    }
  }

  /**
   * Delete a comment
   */
  static async deleteComment(commentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) {
        console.error('❌ Error deleting comment:', error)
        return false
      }

      console.log('✅ Comment deleted')
      return true
    } catch (error) {
      console.error('❌ Exception deleting comment:', error)
      return false
    }
  }

  // ==================== RATING METHODS ====================

  /**
   * Get ratings for a manhwa
   */
  static async getRatings(manhwaSlug: string): Promise<RatingWithProfile[]> {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('manhwa_slug', manhwaSlug)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching ratings:', error)
        return []
      }

      return (data || []) as RatingWithProfile[]
    } catch (error) {
      console.error('❌ Exception fetching ratings:', error)
      return []
    }
  }

  /**
   * Get user's rating for a manhwa
   */
  static async getUserRating(userId: string, manhwaSlug: string): Promise<Rating | null> {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('user_id', userId)
        .eq('manhwa_slug', manhwaSlug)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No rating found
          return null
        }
        console.error('❌ Error fetching user rating:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('❌ Exception fetching user rating:', error)
      return null
    }
  }

  /**
   * Create or update a rating
   */
  static async upsertRating(
    userId: string,
    manhwaSlug: string,
    formData: RatingFormData
  ): Promise<Rating | null> {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .upsert({
          user_id: userId,
          manhwa_slug: manhwaSlug,
          rating: formData.rating,
          review: formData.review || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,manhwa_slug'
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Error upserting rating:', error)
        return null
      }

      console.log('✅ Rating saved')
      return data
    } catch (error) {
      console.error('❌ Exception upserting rating:', error)
      return null
    }
  }

  /**
   * Delete a rating
   */
  static async deleteRating(userId: string, manhwaSlug: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ratings')
        .delete()
        .eq('user_id', userId)
        .eq('manhwa_slug', manhwaSlug)

      if (error) {
        console.error('❌ Error deleting rating:', error)
        return false
      }

      console.log('✅ Rating deleted')
      return true
    } catch (error) {
      console.error('❌ Exception deleting rating:', error)
      return false
    }
  }

  // ==================== REACTION METHODS ====================

  /**
   * Get reaction counts for a comment
   */
  static async getReactionCounts(commentId: string): Promise<ReactionCounts> {
    try {
      const { data, error } = await supabase
        .from('reactions')
        .select('reaction_type')
        .eq('comment_id', commentId)

      if (error) {
        console.error('❌ Error fetching reactions:', error)
        return { like: 0, love: 0, funny: 0, sad: 0, angry: 0, total: 0 }
      }

      const counts: ReactionCounts = {
        like: 0,
        love: 0,
        funny: 0,
        sad: 0,
        angry: 0,
        total: 0
      }

      data?.forEach((reaction) => {
        counts[reaction.reaction_type as keyof Omit<ReactionCounts, 'total'>]++
        counts.total++
      })

      return counts
    } catch (error) {
      console.error('❌ Exception fetching reactions:', error)
      return { like: 0, love: 0, funny: 0, sad: 0, angry: 0, total: 0 }
    }
  }

  /**
   * Get user's reaction for a comment
   */
  static async getUserReaction(userId: string, commentId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('reactions')
        .select('reaction_type')
        .eq('user_id', userId)
        .eq('comment_id', commentId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        console.error('❌ Error fetching user reaction:', error)
        return null
      }

      return data?.reaction_type || null
    } catch (error) {
      console.error('❌ Exception fetching user reaction:', error)
      return null
    }
  }

  /**
   * Toggle reaction on a comment
   */
  static async toggleReaction(
    userId: string,
    commentId: string,
    reactionType: string
  ): Promise<boolean> {
    try {
      // Check if user already reacted with this type
      const existing = await this.getUserReaction(userId, commentId)

      if (existing === reactionType) {
        // Remove reaction
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('user_id', userId)
          .eq('comment_id', commentId)
          .eq('reaction_type', reactionType)

        if (error) {
          console.error('❌ Error removing reaction:', error)
          return false
        }

        console.log('✅ Reaction removed')
        return true
      } else {
        // Remove old reaction if exists
        if (existing) {
          await supabase
            .from('reactions')
            .delete()
            .eq('user_id', userId)
            .eq('comment_id', commentId)
        }

        // Add new reaction
        const { error } = await supabase
          .from('reactions')
          .insert({
            user_id: userId,
            comment_id: commentId,
            reaction_type: reactionType
          })

        if (error) {
          console.error('❌ Error adding reaction:', error)
          return false
        }

        console.log('✅ Reaction added')
        return true
      }
    } catch (error) {
      console.error('❌ Exception toggling reaction:', error)
      return false
    }
  }

  // ==================== STATS METHODS ====================

  /**
   * Get manhwa statistics
   */
  static async getManhwaStats(manhwaSlug: string): Promise<ManhwaStats> {
    try {
      // Get average rating
      const { data: avgData } = await supabase
        .rpc('get_average_rating', { p_manhwa_slug: manhwaSlug })

      // Get rating count
      const { data: countData } = await supabase
        .rpc('get_rating_count', { p_manhwa_slug: manhwaSlug })

      // Get comment count
      const { data: commentData } = await supabase
        .rpc('get_comment_count', { p_manhwa_slug: manhwaSlug })

      return {
        average_rating: avgData || 0,
        rating_count: countData || 0,
        comment_count: commentData || 0
      }
    } catch (error) {
      console.error('❌ Exception fetching manhwa stats:', error)
      return {
        average_rating: 0,
        rating_count: 0,
        comment_count: 0
      }
    }
  }

  /**
   * Get chapter statistics
   */
  static async getChapterStats(manhwaSlug: string, chapterSlug: string): Promise<ChapterStats> {
    try {
      const { data } = await supabase
        .rpc('get_comment_count', {
          p_manhwa_slug: manhwaSlug,
          p_chapter_slug: chapterSlug
        })

      return {
        comment_count: data || 0
      }
    } catch (error) {
      console.error('❌ Exception fetching chapter stats:', error)
      return {
        comment_count: 0
      }
    }
  }
}
