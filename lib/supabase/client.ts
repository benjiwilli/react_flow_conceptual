import { createClient } from "@supabase/supabase-js"

// Environment variables (set in .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Check if Supabase is properly configured (not demo placeholders)
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== "https://demo.supabase.co" &&
  supabaseUrl !== "https://your-project.supabase.co" &&
  supabaseAnonKey !== "your-anon-key-here" &&
  !supabaseAnonKey.includes("demo-placeholder")
)

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
// NOTE: Returns null when Supabase is not properly configured (demo mode)
// This allows API routes to fall back to mock data
export function createServerClient() {
  // Return null if not properly configured
  if (!isSupabaseConfigured) {
    return null
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  // For production: prefer service role key for full access
  if (serviceKey) {
    return createClient(url, serviceKey)
  }
  
  // Fall back to anon key (RLS policies will restrict access)
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, anonKey)
}
