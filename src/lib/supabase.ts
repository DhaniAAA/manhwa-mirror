import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Custom storage adapter to use sessionStorage instead of localStorage
// This makes tokens less visible and auto-clears when browser closes
const customStorageAdapter = {
  getItem: (key: string) => {
    return sessionStorage.getItem(key)
  },
  setItem: (key: string, value: string) => {
    sessionStorage.setItem(key, value)
  },
  removeItem: (key: string) => {
    sessionStorage.removeItem(key)
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export const BUCKET_NAME = import.meta.env.VITE_BUCKET_NAME || 'manga-data'
