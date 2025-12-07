/**
 * Supabase Browser Client
 * Creates Supabase client for client-side operations
 * Supports demo mode when Supabase is not configured
 */

import { createBrowserClient } from "@supabase/ssr"

// Check if Supabase is properly configured
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  SUPABASE_URL !== "https://your-project.supabase.co" &&
  SUPABASE_ANON_KEY !== "your-anon-key-here"
)

// Demo mode placeholder URL (won't actually connect)
const DEMO_URL = "https://demo.supabase.co"
const DEMO_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxOTAwMDAwMDAwfQ.demo-placeholder-key"

export function createSupabaseBrowserClient() {
  // Use configured values or demo placeholders
  const url = isSupabaseConfigured ? SUPABASE_URL! : DEMO_URL
  const key = isSupabaseConfigured ? SUPABASE_ANON_KEY! : DEMO_KEY
  
  return createBrowserClient(url, key)
}

/**
 * Check if we're in demo mode (Supabase not configured)
 */
export function isDemoMode(): boolean {
  return !isSupabaseConfigured || process.env.NEXT_PUBLIC_DEMO_MODE === "true"
}
