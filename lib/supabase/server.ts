/**
 * Supabase Server Client
 * Creates authenticated Supabase client for server-side operations
 * Supports demo mode when Supabase is not configured
 */

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

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

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  // Use configured values or demo placeholders
  const url = isSupabaseConfigured ? SUPABASE_URL! : DEMO_URL
  const key = isSupabaseConfigured ? SUPABASE_ANON_KEY! : DEMO_KEY

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Server Component - cookies can only be modified in
          // Server Actions or Route Handlers
        }
      },
    },
  })
}

/**
 * Get current session from server
 */
export async function getServerSession() {
  const supabase = await createSupabaseServerClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    // Session retrieval error - likely not authenticated
    return null
  }
  
  return session
}

/**
 * Get current user with role information
 */
export async function getServerUser() {
  const session = await getServerSession()
  if (!session?.user) return null

  const supabase = await createSupabaseServerClient()

  // Check if teacher
  const { data: teacherData } = await supabase
    .from("teachers")
    .select("role")
    .eq("id", session.user.id)
    .single()

  // Check if student
  const { data: studentData } = await supabase
    .from("students")
    .select("*")
    .eq("id", session.user.id)
    .single()

  const role = teacherData?.role || (studentData ? "student" : "teacher")

  return {
    id: session.user.id,
    email: session.user.email!,
    role: role as "teacher" | "student" | "admin"
  }
}
