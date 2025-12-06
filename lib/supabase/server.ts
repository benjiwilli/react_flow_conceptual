/**
 * Supabase Server Client
 * Creates authenticated Supabase client for server-side operations
 */

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  )
}

/**
 * Get current session from server
 */
export async function getServerSession() {
  const supabase = await createSupabaseServerClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error("Error getting session:", error)
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
