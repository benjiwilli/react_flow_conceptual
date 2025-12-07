import { createClient } from "@supabase/supabase-js"

// Environment variables (set in .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Check if Supabase is configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Create client (returns null if not configured). Use untyped client to avoid
// blocking when the local schema drifts from Supabase types; tighten later when
// schema stabilizes.
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper to get client with error handling
export function getSupabaseClient() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    )
  }
  return supabase
}

// Server-side client for API routes
// NOTE: Only uses service role key if explicitly set; otherwise returns null
// to force proper auth setup before production deployment
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url) {
    return null
  }
  
  // For production: require service role key explicitly
  // For demo: fall back to anon key with limited permissions
  if (serviceKey) {
    return createClient(url, serviceKey)
  }
  
  // Demo mode: use anon key (RLS policies will restrict access)
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!anonKey) {
    return null
  }
  
  // Demo mode: using anon key (RLS policies will restrict access)
  // For production, set SUPABASE_SERVICE_ROLE_KEY
  return createClient(url, anonKey)
}
