import { createClient } from '@supabase/supabase-js'
import { cookieStorageAdapter } from './cookieStorage'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * Secure Storage Configuration
 * 
 * Menggunakan kombinasi:
 * 1. In-memory storage untuk session aktif
 * 2. HttpOnly cookies via Edge Functions untuk persistensi
 * 
 * Keuntungan keamanan:
 * - Token tidak dapat diakses via JavaScript (XSS protection)
 * - HttpOnly cookies tidak dapat dibaca oleh client-side scripts
 * - Secure flag memastikan cookies hanya dikirim via HTTPS
 * - SameSite=Lax melindungi dari CSRF attacks
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: cookieStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Use PKCE flow for additional security
  }
})

export const BUCKET_NAME = import.meta.env.VITE_BUCKET_NAME || 'manga-data'
