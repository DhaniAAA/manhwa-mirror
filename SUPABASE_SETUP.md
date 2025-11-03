# 🗄️ Supabase Database Setup - Phase 2 (Community Features)

## 📋 Overview

Panduan setup database Supabase untuk fitur community: Authentication, Comments, Ratings, dan User Profiles.

## 🔧 Setup Instructions

### 1. Jalankan SQL di Supabase SQL Editor

Buka Supabase Dashboard → SQL Editor → New Query, lalu jalankan script berikut:

```sql
-- ============================================
-- PHASE 2: COMMUNITY FEATURES DATABASE SCHEMA
-- ============================================

-- 1. CREATE PROFILES TABLE
-- Stores user profile information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT bio_length CHECK (char_length(bio) <= 500)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING ((SELECT auth.uid()) = id);

-- 2. CREATE COMMENTS TABLE
-- Stores comments on manhwa chapters
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  manhwa_slug TEXT NOT NULL,
  chapter_slug TEXT,
  content TEXT NOT NULL,
  is_spoiler BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES public.comments ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  CONSTRAINT content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 2000)
);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comments
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.comments FOR UPDATE
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.comments FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- 3. CREATE RATINGS TABLE
-- Stores user ratings for manhwa
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  manhwa_slug TEXT NOT NULL,
  rating INTEGER NOT NULL,
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  CONSTRAINT rating_range CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT review_length CHECK (char_length(review) <= 1000),
  CONSTRAINT unique_user_manhwa UNIQUE (user_id, manhwa_slug)
);

-- Enable RLS
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ratings
CREATE POLICY "Ratings are viewable by everyone"
  ON public.ratings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create ratings"
  ON public.ratings FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own ratings"
  ON public.ratings FOR UPDATE
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON public.ratings FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- 4. CREATE REACTIONS TABLE
-- Stores reactions (like, love, etc.) on comments
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  comment_id UUID REFERENCES public.comments ON DELETE CASCADE NOT NULL,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  CONSTRAINT valid_reaction CHECK (reaction_type IN ('like', 'love', 'funny', 'sad', 'angry')),
  CONSTRAINT unique_user_comment_reaction UNIQUE (user_id, comment_id, reaction_type)
);

-- Enable RLS
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reactions
CREATE POLICY "Reactions are viewable by everyone"
  ON public.reactions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reactions"
  ON public.reactions FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own reactions"
  ON public.reactions FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- 5. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_comments_manhwa_slug ON public.comments(manhwa_slug);
CREATE INDEX IF NOT EXISTS idx_comments_chapter_slug ON public.comments(chapter_slug);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ratings_manhwa_slug ON public.ratings(manhwa_slug);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON public.ratings(user_id);

CREATE INDEX IF NOT EXISTS idx_reactions_comment_id ON public.reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON public.reactions(user_id);

-- 6. CREATE TRIGGER FUNCTION FOR AUTO-CREATING PROFILE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. CREATE FUNCTION TO GET COMMENT COUNT
CREATE OR REPLACE FUNCTION get_comment_count(p_manhwa_slug TEXT, p_chapter_slug TEXT DEFAULT NULL)
RETURNS INTEGER AS $$
BEGIN
  IF p_chapter_slug IS NULL THEN
    RETURN (SELECT COUNT(*) FROM public.comments WHERE manhwa_slug = p_manhwa_slug);
  ELSE
    RETURN (SELECT COUNT(*) FROM public.comments WHERE manhwa_slug = p_manhwa_slug AND chapter_slug = p_chapter_slug);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 8. CREATE FUNCTION TO GET AVERAGE RATING
CREATE OR REPLACE FUNCTION get_average_rating(p_manhwa_slug TEXT)
RETURNS NUMERIC AS $$
BEGIN
  RETURN (
    SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0)
    FROM public.ratings
    WHERE manhwa_slug = p_manhwa_slug
  );
END;
$$ LANGUAGE plpgsql;

-- 9. CREATE FUNCTION TO GET RATING COUNT
CREATE OR REPLACE FUNCTION get_rating_count(p_manhwa_slug TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM public.ratings WHERE manhwa_slug = p_manhwa_slug);
END;
$$ LANGUAGE plpgsql;

-- 10. SETUP STORAGE FOR AVATARS
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid()::text));

CREATE POLICY "Users can update their own avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid()::text));

CREATE POLICY "Users can delete their own avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid()::text));
```

### 2. Enable Email Auth (Optional)

Jika ingin menggunakan email authentication:

1. Buka Supabase Dashboard → Authentication → Providers
2. Enable "Email" provider
3. Configure email templates (optional)

### 3. Configure Auth Settings

1. Buka Authentication → Settings
2. Set "Site URL" ke URL production Anda (e.g., https://manhwa-mirror.vercel.app)
3. Add "Redirect URLs" untuk development: http://localhost:5173

## ✅ Verification

Setelah menjalankan SQL, verifikasi dengan:

```sql
-- Check tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'comments', 'ratings', 'reactions');

-- Check RLS policies
SELECT tablename, policyname FROM pg_policies
WHERE schemaname = 'public';

-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'avatars';
```

## 📊 Database Schema

```
profiles
├── id (uuid, PK, FK to auth.users)
├── username (text, unique)
├── full_name (text)
├── avatar_url (text)
├── bio (text)
├── website (text)
├── created_at (timestamp)
└── updated_at (timestamp)

comments
├── id (uuid, PK)
├── user_id (uuid, FK to auth.users)
├── manhwa_slug (text)
├── chapter_slug (text, nullable)
├── content (text)
├── is_spoiler (boolean)
├── parent_id (uuid, FK to comments, nullable)
├── created_at (timestamp)
└── updated_at (timestamp)

ratings
├── id (uuid, PK)
├── user_id (uuid, FK to auth.users)
├── manhwa_slug (text)
├── rating (integer, 1-5)
├── review (text, nullable)
├── created_at (timestamp)
└── updated_at (timestamp)

reactions
├── id (uuid, PK)
├── user_id (uuid, FK to auth.users)
├── comment_id (uuid, FK to comments)
├── reaction_type (text: like, love, funny, sad, angry)
└── created_at (timestamp)
```

## 🔐 Security Notes

- All tables have Row Level Security (RLS) enabled
- Users can only modify their own data
- Public read access for comments, ratings, and profiles
- Avatar uploads restricted to user's own folder

## 🚀 Next Steps

After setup:

1. Update `.env` with Supabase credentials (already done)
2. Implement frontend components
3. Test authentication flow
4. Test comment/rating functionality

---

**Setup Date**: 2025-01-01
**Version**: 1.0.0
