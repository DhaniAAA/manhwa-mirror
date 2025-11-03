// Community feature types for Phase 2

export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  website: string | null
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  user_id: string
  manhwa_slug: string
  chapter_slug: string | null
  content: string
  is_spoiler: boolean
  parent_id: string | null
  created_at: string
  updated_at: string
  // Joined data
  profile?: Profile
  replies?: Comment[]
  reaction_counts?: ReactionCounts
  user_reaction?: string | null
}

export interface Rating {
  id: string
  user_id: string
  manhwa_slug: string
  rating: number
  review: string | null
  created_at: string
  updated_at: string
  // Joined data
  profile?: Profile
}

export interface Reaction {
  id: string
  user_id: string
  comment_id: string
  reaction_type: ReactionType
  created_at: string
}

export type ReactionType = 'like' | 'love' | 'funny' | 'sad' | 'angry'

export interface ReactionCounts {
  like: number
  love: number
  funny: number
  sad: number
  angry: number
  total: number
}

export interface CommentWithProfile extends Comment {
  profile: Profile
}

export interface RatingWithProfile extends Rating {
  profile: Profile
}

// Form types
export interface CommentFormData {
  content: string
  is_spoiler: boolean
  parent_id?: string | null
}

export interface RatingFormData {
  rating: number
  review?: string
}

export interface ProfileUpdateData {
  username?: string | null
  full_name?: string | null
  avatar_url?: string | null
  bio?: string | null
  website?: string | null
}

// Stats types
export interface ManhwaStats {
  average_rating: number
  rating_count: number
  comment_count: number
}

export interface ChapterStats {
  comment_count: number
}
