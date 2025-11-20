import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("Supabase Config:", {
  url: supabaseUrl ? "Set ✅" : "Missing ❌",
  key: supabaseAnonKey ? `Set (${supabaseAnonKey.substring(0, 5)}...) ✅` : "Missing ❌",
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("CRITICAL: Missing Supabase environment variables!");
}

const browserStorage = typeof window !== "undefined" ? window.localStorage : undefined;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: browserStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
});

export const BUCKET_NAME = import.meta.env.VITE_BUCKET_NAME || "manga-data";
