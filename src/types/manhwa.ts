// Types untuk data structure Supabase bucket

export interface ChapterImage {
  url: string
}

export interface Chapter {
  slug: string
  title: string
  url: string
  total_images: number
  images: string[]
}

export interface ChapterDetail {
  slug: string
  title: string
  url?: string
  total_images: number
  images: string[]
}

export interface ManhwaMetadata {
  slug: string
  title: string
  total_chapters: number
  cover_url?: string
  description?: string
  author?: string
  artist?: string
  status?: string
  type?: string
  genres?: string[]
  release_year?: string
  rating?: string
  lastUpdate?: string
  chapters: Chapter[]
}

export interface ChaptersData {
  slug: string
  title: string
  total_chapters: number
  chapters: Chapter[]
}

// Types untuk UI components
export interface ManhwaCardData {
  slug: string
  title: string
  genre: string
  rating: string
  chapters: number
  badge?: string
  progress?: number
  lastUpdate?: string
  coverImage?: string
  cover_url?: string
}

export interface ManhwaDetail extends ManhwaCardData {
  description?: string
  author?: string
  artist?: string
  status?: string
  tags?: string[]
}
