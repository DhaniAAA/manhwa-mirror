import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * Supabase Client dengan PKCE Flow + Server-side Session
 * 
 * - persistSession: false (tidak simpan di Web Storage)
 * - storage: undefined (tidak gunakan localStorage/sessionStorage)
 * - flowType: pkce (PKCE flow untuk OAuth)
 * - Session disimpan di server via HttpOnly cookies (encrypted)
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: undefined,
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  global: {
    headers: {
      'Accept': 'application/json'
    }
  }
})

export const BUCKET_NAME = import.meta.env.VITE_BUCKET_NAME || 'manga-data'
